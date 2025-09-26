#!/bin/bash
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🛑 Stopping Studio Project..."

# Stop all yarn workspace processes
echo "Stopping microservices..."
pkill -f "yarn workspace" 2>/dev/null || true
pkill -f "backend/services/user-service/dist/index.js" 2>/dev/null || true
pkill -f "admin/node_modules/.bin/next" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true

# Terminate any processes we previously tracked via PID files.
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

# Stop Docker containers
echo "Stopping Docker containers..."
docker compose down 2>/dev/null || true

# Clean up PID files
echo "Cleaning up..."
rm -f logs/*.pid 2>/dev/null || true

echo "✅ All services stopped!"
echo "📝 Logs are preserved in ./logs/ directory"
