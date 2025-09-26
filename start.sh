#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🚀 Starting Studio Project..."

# Stop any running services first
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

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing root dependencies..."
  yarn install
fi

if [ ! -d "backend/api-gateway/node_modules" ]; then
  echo "📦 Installing API Gateway dependencies..."
  yarn --cwd backend/api-gateway install
fi

if [ ! -d "backend/services/user-service/node_modules" ]; then
  echo "📦 Installing User Service dependencies..."
  npm install --prefix backend/services/user-service --legacy-peer-deps
fi

if [ ! -d "admin/node_modules" ]; then
  echo "📦 Installing Admin dependencies..."
  npm install --prefix admin --legacy-peer-deps
fi

# Start MongoDB
echo "📦 Starting MongoDB..."
docker compose up -d mongodb
sleep 3

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
until docker exec mongodb mongosh --eval "db.runCommand('ping').ok" --quiet; do
  echo "Waiting for MongoDB..."
  sleep 2
done
echo "✅ MongoDB is ready!"

# Create logs directory if it doesn't exist
mkdir -p logs

# Start services in background with proper logging
echo "🔧 Starting microservices..."

# Product Service (3001 HTTP, 3011 MS)
echo "Starting Product Service (3001 HTTP, 3011 MS)..."
MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
CORS_ORIGIN='http://localhost:9002,http://localhost:4000,http://localhost:3005' \
MS_PORT=3011 \
yarn workspace product-service start:dev > logs/product-service.log 2>&1 &
PRODUCT_PID=$!

# Category Service (3002)
echo "Starting Category Service (3002)..."
MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
yarn workspace category-service start:dev > logs/category-service.log 2>&1 &
CATEGORY_PID=$!

# Order Service (3003)
echo "Starting Order Service (3003)..."
MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
yarn workspace order-service start:dev > logs/order-service.log 2>&1 &
ORDER_PID=$!

# User Service (3004)
echo "Building User Service (3004)..."
yarn workspace user-service build > logs/user-service-build.log 2>&1
echo "Starting User Service (3004)..."
MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
JWT_SECRET='your_jwt_secret_key' \
node backend/services/user-service/dist/index.js > logs/user-service.log 2>&1 &
USER_PID=$!

# Cart Service (3007)
echo "Starting Cart Service (3007)..."
MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
PRODUCT_SERVICE_HOST=localhost PRODUCT_SERVICE_PORT=3011 \
yarn workspace cart-service start:dev > logs/cart-service.log 2>&1 &
CART_PID=$!

# Wait for services to start
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

# API Gateway (4000)
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

# Wait for gateway to start
echo "⏳ Waiting for API Gateway to start..."
sleep 10

# Frontend (9002)
echo "Starting Frontend (9002)..."
NEXT_PUBLIC_API_URL='http://localhost:4000/graphql' \
USER_SERVICE_URL='http://localhost:3004/users' \
yarn workspace nextn dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Admin Dashboard (3005)
echo "Starting Admin Dashboard (3005)..."
NEXT_PUBLIC_API_URL='http://localhost:4000/graphql' \
npm run dev --prefix admin > logs/admin.log 2>&1 &
ADMIN_PID=$!

# Save PIDs for cleanup
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
