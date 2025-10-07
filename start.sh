#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

declare -i GIT_AVAILABLE=0
PRE_PULL_HEAD=""
declare -A CHANGED_INDEX=()
declare -a CHANGED_PATHS=()

add_changed_path() {
  local path="$1"
  [[ -z "$path" ]] && return
  path="${path#./}"
  if [[ -z "${CHANGED_INDEX["$path"]+1}" ]]; then
    CHANGED_INDEX["$path"]=1
    CHANGED_PATHS+=("$path")
  fi
}

collect_worktree_changes() {
  if (( ! GIT_AVAILABLE )); then
    return
  fi

  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    local status="${line:0:2}"
    local payload="${line:3}"

    if [[ "$status" =~ ^R ]]; then
      local old="${payload%% -> *}"
      local new="${payload##* -> }"
      add_changed_path "$old"
      add_changed_path "$new"
    else
      add_changed_path "$payload"
    fi
  done < <(git status --porcelain)
}

collect_pull_diff() {
  if (( ! GIT_AVAILABLE )); then
    return
  fi

  local current_head
  current_head=$(git rev-parse HEAD 2>/dev/null || echo "")
  if [[ -n "$PRE_PULL_HEAD" && -n "$current_head" && "$current_head" != "$PRE_PULL_HEAD" ]]; then
    while IFS= read -r file; do
      [[ -z "$file" ]] && continue
      add_changed_path "$file"
    done < <(git diff --name-only "$PRE_PULL_HEAD" "$current_head")
  fi
  PRE_PULL_HEAD="$current_head"
}

has_changes_in_prefix() {
  local prefix="$1"
  for file in "${CHANGED_PATHS[@]}"; do
    if [[ "$file" == "$prefix"* ]]; then
      return 0
    fi
  done
  return 1
}

has_path_changed() {
  local target="$1"
  for file in "${CHANGED_PATHS[@]}"; do
    if [[ "$file" == "$target" ]]; then
      return 0
    fi
  done
  return 1
}

print_change_summary() {
  if ((${#CHANGED_PATHS[@]} > 0)); then
    echo "📝 Detected source changes:"
    for path in "${CHANGED_PATHS[@]}"; do
      echo "   • $path"
    done
    echo ""
  else
    echo "ℹ️ No tracked code changes detected; performing clean restart."
    echo ""
  fi
}

ensure_dependencies() {
  local label="$1"; shift
  local marker_dir="$1"; shift
  local -a watch_paths=()
  while (($#)); do
    if [[ "$1" == "--" ]]; then
      shift
      break
    fi
    watch_paths+=("$1")
    shift
  done
  local -a cmd=("$@")

  local needs_install=0
  if [[ ! -d "$marker_dir" || -z "$(ls -A "$marker_dir" 2>/dev/null)" ]]; then
    needs_install=1
  else
    for path in "${watch_paths[@]}"; do
      if has_path_changed "$path"; then
        needs_install=1
        break
      fi
    done
  fi

  if (( needs_install )); then
    echo "📦 Updating $label dependencies..."
    "${cmd[@]}"
  else
    echo "📦 $label dependencies are up to date"
  fi
}

refresh_dist_if_needed() {
  local label="$1"
  local service_path="$2"
  local force="${3:-0}"
  local dist_path="$service_path/dist"

  local should_refresh=0
  if (( force )); then
    should_refresh=1
  fi

  if has_changes_in_prefix "${service_path%/}/"; then
    should_refresh=1
  fi

  if [[ ! -d "$dist_path" ]]; then
    should_refresh=1
  fi

  if (( should_refresh )) && [[ -d "$dist_path" ]]; then
    echo "♻️  Clearing $label dist output..."
    rm -rf "$dist_path"
  fi
}

refresh_next_cache() {
  local label="$1"
  local app_path="$2"
  local force="${3:-0}"
  local cache_dir="$app_path/.next"

  local should_refresh=0
  if (( force )); then
    should_refresh=1
  fi

  if has_changes_in_prefix "${app_path%/}/"; then
    should_refresh=1
  fi

  if (( should_refresh )) && [[ -d "$cache_dir" ]]; then
    echo "♻️  Clearing $label Next.js cache..."
    rm -rf "$cache_dir"
  fi
}

declare -A RESTART_NOTE_INDEX=()
declare -a RESTART_NOTES=()
add_restart_note() {
  local label="$1"
  if [[ -z "${RESTART_NOTE_INDEX["$label"]+1}" ]]; then
    RESTART_NOTE_INDEX["$label"]=1
    RESTART_NOTES+=("$label")
  fi
}

echo "🚀 Starting Studio Project..."

if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  GIT_AVAILABLE=1
  PRE_PULL_HEAD=$(git rev-parse HEAD 2>/dev/null || echo "")
  collect_worktree_changes
else
  echo "ℹ️ Git repository not detected or git unavailable; skipping change detection."
fi

echo "🛑 Stopping existing services..."
pkill -f "yarn workspace" 2>/dev/null || true
pkill -f "backend/services/user-service/dist/index.js" 2>/dev/null || true
pkill -f "admin/node_modules/.bin/next" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true
if compgen -G "logs/*.pid" > /dev/null; then
  for pid_file in logs/*.pid; do
    [ -f "$pid_file" ] || continue
    pid=$(cat "$pid_file" 2>/dev/null || echo "")
    if [[ "$pid" =~ ^[0-9]+$ ]]; then
      if kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
        sleep 0.2
        kill -9 "$pid" 2>/dev/null || true
      fi
    fi
  done
fi
docker compose stop 2>/dev/null || true

if (( GIT_AVAILABLE )); then
  echo "🔄 Pulling latest changes from git..."
  if ! git pull --rebase --autostash; then
    echo "⚠️  Unable to pull latest changes. Please resolve conflicts and rerun."
    exit 1
  fi
  collect_pull_diff
  collect_worktree_changes
fi

backend_shared_changed=0
api_gateway_changed=0
product_service_changed=0
category_service_changed=0
order_service_changed=0
cart_service_changed=0
user_service_changed=0
frontend_changed=0
admin_changed=0

if has_changes_in_prefix "backend/shared/"; then backend_shared_changed=1; fi
if has_changes_in_prefix "backend/api-gateway/"; then api_gateway_changed=1; fi
if has_changes_in_prefix "backend/services/product-service/"; then product_service_changed=1; fi
if has_changes_in_prefix "backend/services/category-service/"; then category_service_changed=1; fi
if has_changes_in_prefix "backend/services/order-service/"; then order_service_changed=1; fi
if has_changes_in_prefix "backend/services/cart-service/"; then cart_service_changed=1; fi
if has_changes_in_prefix "backend/services/user-service/"; then user_service_changed=1; fi
if has_changes_in_prefix "frontend/"; then frontend_changed=1; fi
if has_changes_in_prefix "admin/"; then admin_changed=1; fi

print_change_summary

if (( product_service_changed || backend_shared_changed )); then add_restart_note "Product Service"; fi
if (( category_service_changed || backend_shared_changed )); then add_restart_note "Category Service"; fi
if (( order_service_changed || backend_shared_changed )); then add_restart_note "Order Service"; fi
if (( cart_service_changed || backend_shared_changed )); then add_restart_note "Cart Service"; fi
if (( api_gateway_changed || backend_shared_changed )); then add_restart_note "API Gateway"; fi
if (( user_service_changed || backend_shared_changed )); then add_restart_note "User Service"; fi
if (( frontend_changed )); then add_restart_note "Frontend App"; fi
if (( admin_changed )); then add_restart_note "Admin Dashboard"; fi
if (( backend_shared_changed )); then add_restart_note "Shared Types"; fi

if ((${#RESTART_NOTES[@]} > 0)); then
  echo "🔁 Refresh required for: ${RESTART_NOTES[*]}"
  echo ""
fi

mkdir -p logs

ensure_dependencies "root workspace" "node_modules" "package.json" "yarn.lock" "package-lock.json" -- yarn install --frozen-lockfile
ensure_dependencies "API Gateway" "backend/api-gateway/node_modules" "backend/api-gateway/package.json" -- yarn --cwd backend/api-gateway install --frozen-lockfile
ensure_dependencies "User Service" "backend/services/user-service/node_modules" \
  "backend/services/user-service/package.json" "backend/services/user-service/package-lock.json" -- \
  npm install --prefix backend/services/user-service --legacy-peer-deps
ensure_dependencies "Admin app" "admin/node_modules" "admin/package.json" "admin/package-lock.json" -- \
  npm install --prefix admin --legacy-peer-deps

refresh_dist_if_needed "Product Service" "backend/services/product-service" "$backend_shared_changed"
refresh_dist_if_needed "Category Service" "backend/services/category-service" "$backend_shared_changed"
refresh_dist_if_needed "Order Service" "backend/services/order-service" "$backend_shared_changed"
refresh_dist_if_needed "Cart Service" "backend/services/cart-service" "$backend_shared_changed"
refresh_dist_if_needed "API Gateway" "backend/api-gateway" "$backend_shared_changed"
refresh_dist_if_needed "User Service" "backend/services/user-service" "$backend_shared_changed"
refresh_next_cache "Frontend App" "frontend"
refresh_next_cache "Admin Dashboard" "admin"

needs_user_build=0
if (( user_service_changed || backend_shared_changed )); then
  needs_user_build=1
elif [[ ! -d "backend/services/user-service/dist" ]]; then
  needs_user_build=1
else
  if find backend/services/user-service/src -type f -newer backend/services/user-service/dist 2>/dev/null | head -n1 >/dev/null; then
    needs_user_build=1
  fi
fi

if (( needs_user_build )); then
  echo "🔁 Building User Service (3004)..."
  if ! yarn workspace user-service build > logs/user-service-build.log 2>&1; then
    echo "❌ User Service build failed. Check logs/user-service-build.log for details."
    tail -n 50 logs/user-service-build.log || true
    exit 1
  fi
else
  echo "ℹ️ User Service build is up to date."
fi

echo "📦 Starting MongoDB..."
docker compose up -d mongodb
sleep 3

echo "⏳ Waiting for MongoDB to be ready..."
until docker exec mongodb mongosh --eval "db.runCommand('ping').ok" --quiet; do
  echo "Waiting for MongoDB..."
  sleep 2
done
echo "✅ MongoDB is ready!"

echo "🔧 Starting microservices..."

echo "Starting Product Service (3001 HTTP, 3011 MS)..."
MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
CORS_ORIGIN='http://localhost:9002,http://localhost:4000,http://localhost:3005' \
MS_PORT=3011 \
yarn workspace product-service start:dev > logs/product-service.log 2>&1 &
PRODUCT_PID=$!

echo "Starting Category Service (3002)..."
MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
yarn workspace category-service start:dev > logs/category-service.log 2>&1 &
CATEGORY_PID=$!

echo "Starting Order Service (3003)..."
MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
yarn workspace order-service start:dev > logs/order-service.log 2>&1 &
ORDER_PID=$!

echo "Starting User Service (3004)..."
MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
JWT_SECRET='your_jwt_secret_key' \
node backend/services/user-service/dist/index.js > logs/user-service.log 2>&1 &
USER_PID=$!

echo "Starting Cart Service (3007)..."
MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
PRODUCT_SERVICE_HOST=localhost PRODUCT_SERVICE_PORT=3011 \
yarn workspace cart-service start:dev > logs/cart-service.log 2>&1 &
CART_PID=$!

echo "⏳ Waiting for microservices to start..."
sleep 10
echo "👤 Ensuring administrator account..."
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@studio.local}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-Admin@123}
ADMIN_NAME=${ADMIN_NAME:-"Quản trị viên"}
set +e
ADMIN_STATUS=$(curl -s -o /tmp/admin-create.log -w "%{http_code}" \
  -X POST http://localhost:3004/users \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"name\":\"$ADMIN_NAME\",\"role\":\"admin\"}" )
if [ "$ADMIN_STATUS" = "201" ]; then
  echo "✅ Admin account created ($ADMIN_EMAIL)"
elif [ "$ADMIN_STATUS" = "409" ]; then
  echo "ℹ️ Admin account already exists ($ADMIN_EMAIL)"
else
  echo "⚠️ Unable to ensure admin account (HTTP $ADMIN_STATUS)"
  cat /tmp/admin-create.log
fi
set -e

echo "Starting API Gateway (4000)..."
MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
PRODUCT_SERVICE_HOST=localhost PRODUCT_SERVICE_PORT=3011 \
CATEGORY_SERVICE_HOST=localhost CATEGORY_SERVICE_PORT=3002 \
ORDER_SERVICE_HOST=localhost ORDER_SERVICE_PORT=3003 \
USER_SERVICE_HOST=localhost USER_SERVICE_PORT=3004 \
CART_SERVICE_HOST=localhost CART_SERVICE_PORT=3007 \
API_GATEWAY_PORT=4000 \
yarn workspace api-gateway start:dev > logs/api-gateway.log 2>&1 &
GATEWAY_PID=$!

echo "⏳ Waiting for API Gateway to start..."
sleep 10

echo "Starting Frontend (9002)..."
NEXT_PUBLIC_API_URL='http://localhost:4000/graphql' \
USER_SERVICE_URL='http://localhost:3004/users' \
yarn workspace nextn dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Starting Admin Dashboard (3005)..."
NEXT_PUBLIC_API_URL='http://localhost:4000/graphql' \
npm run dev --prefix admin > logs/admin.log 2>&1 &
ADMIN_PID=$!

echo $PRODUCT_PID > logs/product-service.pid
echo $CATEGORY_PID > logs/category-service.pid
echo $ORDER_PID > logs/order-service.pid
echo $USER_PID > logs/user-service.pid
echo $CART_PID > logs/cart-service.pid
echo $GATEWAY_PID > logs/api-gateway.pid
echo $FRONTEND_PID > logs/frontend.pid
echo $ADMIN_PID > logs/admin.pid

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📊 Service Status:"
echo "  • MongoDB: http://localhost:27017"
echo "  • Product Service: http://localhost:3001"
echo "  • Category Service: http://localhost:3002"
echo "  • Order Service: http://localhost:3003"
echo "  • User Service: http://localhost:3004"
echo "  • Cart Service: http://localhost:3007"
echo "  • API Gateway: http://localhost:4000"
echo "  • GraphQL Playground: http://localhost:4000/graphql"
echo "  • Frontend: http://localhost:9002"
echo "  • Admin Dashboard: http://localhost:3005"
echo ""
echo "📝 Logs are saved in ./logs/ directory"
echo "🛑 To stop all services: ./stop.sh"
echo ""
echo "✨ Opening Frontend in browser..."
sleep 5
xdg-open http://localhost:9002 2>/dev/null || echo "Please open http://localhost:9002 in your browser"
