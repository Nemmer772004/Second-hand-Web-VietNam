#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

LOG_DIR="${ROOT_DIR}/logs"
mkdir -p "$LOG_DIR"

declare -A SERVICE_PIDS=()

PYTHON_CMD="${ROOT_DIR}/ai-agent/venv/bin/python"
if [[ ! -x "$PYTHON_CMD" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    echo "⚙️  Khởi tạo virtualenv cho ai-agent..."
    python3 -m venv "${ROOT_DIR}/ai-agent/venv"
    PYTHON_CMD="${ROOT_DIR}/ai-agent/venv/bin/python"
    if [[ -x "$PYTHON_CMD" ]]; then
      "$PYTHON_CMD" -m pip install --upgrade pip >/dev/null 2>&1 || true
      if [[ -f "${ROOT_DIR}/ai-agent/requirements.txt" ]]; then
        echo "📦  Cài đặt phụ thuộc cho ai-agent..."
        "$PYTHON_CMD" -m pip install -r "${ROOT_DIR}/ai-agent/requirements.txt" >/dev/null 2>&1 || true
      fi
    fi
  elif command -v python >/dev/null 2>&1; then
    echo "⚠️  Không tìm thấy python3, sử dụng python system. Vui lòng tạo venv thủ công."
    PYTHON_CMD=$(command -v python)
  else
    PYTHON_CMD=""
  fi
fi

log_section() {
  echo ""
  echo "=============================================="
  echo "🚀 $1"
  echo "=============================================="
  echo ""
}

start_service() {
  local label="$1"
  shift
  local safe_label="${label// /-}"
  local logfile="${LOG_DIR}/${safe_label}.log"

  echo ""
  echo "▶ Đang khởi động ${label}..."
  echo "   • Ghi log tại: ${logfile}"

  (
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting ${label}"
    "$@"
  ) >>"$logfile" 2>&1 &

  local pid=$!
  SERVICE_PIDS["$label"]=$pid
  echo "   • PID: ${pid}"
}

cleanup() {
  if ((${#SERVICE_PIDS[@]} == 0)); then
    return
  fi

  echo ""
  echo "🛑 Đang dừng toàn bộ tiến trình nền..."
  for label in "${!SERVICE_PIDS[@]}"; do
    local pid=${SERVICE_PIDS["$label"]}
    if kill -0 "$pid" 2>/dev/null; then
      echo "   • Killing ${label} (PID: ${pid})"
      kill "$pid" 2>/dev/null || true
    fi
  done
  wait || true
  echo "✅ Hoàn tất dọn dẹp."
}
trap cleanup EXIT INT TERM

log_section "Khởi động dự án Second-hand Web VietNam"

echo "🐳 Đảm bảo PostgreSQL & MongoDB sẵn sàng..."
docker compose up -d postgres mongodb
docker compose ps postgres mongodb

# echo ""
# echo "📦 Cài đặt phụ thuộc (yarn workspace root)..."
# yarn install --frozen-lockfile >/dev/null

echo ""
echo "🛠️  Biên dịch user-service..."
if ! yarn --cwd backend/services/user-service build >"${LOG_DIR}/user-service-build.log" 2>&1; then
  echo "❌ Build user-service thất bại. Kiểm tra ${LOG_DIR}/user-service-build.log"
  tail -n 40 "${LOG_DIR}/user-service-build.log" || true
  exit 1
fi

if [[ -n "$PYTHON_CMD" ]]; then
  start_service "ai-retrain-scheduler" \
    env \
    PYTHONPATH="${ROOT_DIR}/ai-agent:${PYTHONPATH:-}" \
    AI_RETRAIN_INTERVAL="${AI_RETRAIN_INTERVAL:-43200}" \
    bash -lc '
      echo "[AI Retrain] starting scheduler (interval: ${AI_RETRAIN_INTERVAL}s)"
      while true; do
        start_ts=$(date "+%Y-%m-%d %H:%M:%S")
        echo "[AI Retrain] ${start_ts} - running pipeline"
        if ! '"$PYTHON_CMD"' '"${ROOT_DIR}"'/ai-agent/tasks/retrain.py; then
          echo "[AI Retrain] pipeline failed (see logs/retrain.log)" >&2
        fi
        echo "[AI Retrain] sleeping for ${AI_RETRAIN_INTERVAL}s"
        sleep "${AI_RETRAIN_INTERVAL}"
      done
    '

  start_service "chatbot-service" \
    bash -lc \
    "cd '${ROOT_DIR}/ai-agent' && CHATBOT_TOPK=5 '${PYTHON_CMD}' -m uvicorn services.api.app:app --host 0.0.0.0 --port 8008"
else
  echo "⚠️  Không tìm thấy Python phù hợp để chạy chatbot-service. Vui lòng khởi động thủ công (python -m uvicorn ai_agent.services.api.app:app --port 8008)."
fi

start_service "product-service" \
  env \
  MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
  CORS_ORIGIN='http://localhost:9002,http://localhost:4000,http://localhost:3005' \
  NODE_ENV=development \
  yarn --cwd backend/services/product-service start:dev

start_service "category-service" \
  env \
  MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
  yarn --cwd backend/services/category-service start:dev

start_service "order-service" \
  env \
  DB_HOST=localhost \
  DB_PORT=5432 \
  DB_USERNAME=nemmer \
  DB_PASSWORD=nemmer \
  DB_NAME=secondhand_ai \
  ORDER_PG_DB=secondhand_ai \
  ORDER_PG_SYNC=true \
  MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
  yarn --cwd backend/services/order-service start:dev

start_service "auth-service" \
  env \
  DB_HOST=localhost \
  DB_PORT=5432 \
  DB_USERNAME=nemmer \
  DB_PASSWORD=nemmer \
  DB_NAME=studio_auth \
  JWT_SECRET='your_jwt_secret_key' \
  yarn --cwd backend/services/auth-service start:dev

start_service "user-service" \
  env \
  DB_HOST=localhost \
  DB_PORT=5432 \
  DB_USERNAME=nemmer \
  DB_PASSWORD=nemmer \
  DB_NAME=studio_auth \
  AUTH_SERVICE_URL='http://localhost:3006/auth' \
  node backend/services/user-service/dist/index.js

start_service "cart-service" \
  env \
  DB_HOST=localhost \
  DB_PORT=5432 \
  DB_USERNAME=nemmer \
  DB_PASSWORD=nemmer \
  DB_NAME=secondhand_ai \
  MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
  PRODUCT_SERVICE_HOST=localhost \
  PRODUCT_SERVICE_PORT=3001 \
  yarn --cwd backend/services/cart-service start:dev

start_service "ai-service" \
  env \
  AI_PG_HOST=localhost \
  AI_PG_PORT=5432 \
  AI_PG_USER=nemmer \
  AI_PG_PASSWORD=nemmer \
  AI_PG_DB=secondhand_ai \
  yarn --cwd backend/services/ai-service start:dev

start_service "api-gateway" \
  env \
  PORT=4000 \
  AUTH_SERVICE_HOST=localhost \
  AUTH_SERVICE_PORT=3006 \
  PRODUCT_SERVICE_HOST=localhost \
  PRODUCT_SERVICE_PORT=3001 \
  RECOMMENDER_SERVICE_URL='http://localhost:8008' \
  CATEGORY_SERVICE_HOST=localhost \
  CATEGORY_SERVICE_PORT=3002 \
  ORDER_SERVICE_HOST=localhost \
  ORDER_SERVICE_PORT=3003 \
  USER_SERVICE_HOST=localhost \
  USER_SERVICE_PORT=3004 \
  CART_SERVICE_HOST=localhost \
  CART_SERVICE_TCP_PORT=3017 \
  CART_SERVICE_PORT=3007 \
  MONGODB_URI='mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin' \
  yarn --cwd backend/api-gateway start:dev

start_service "frontend" \
  env \
  NEXT_PUBLIC_API_URL='http://localhost:4000/graphql' \
  CHATBOT_SERVICE_URL='http://localhost:8008' \
  AI_SERVICE_URL='http://localhost:3008' \
  PRODUCT_SERVICE_URL='http://localhost:3001' \
  yarn --cwd frontend dev

start_service "admin" \
  env \
  NEXT_PUBLIC_API_URL='http://localhost:4000/graphql' \
  npm run dev --prefix admin

echo ""
echo "=============================================="
echo "🎉 Tất cả dịch vụ đã được khởi động!"
echo "📄 Theo dõi log tại thư mục logs/"
echo "🔁 Nhấn Ctrl+C để dừng toàn bộ."
echo "=============================================="

wait -n || true
while true; do
  wait -n || true
done
