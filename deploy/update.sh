#!/usr/bin/env bash
# --------------------------------------------------
# update.sh — Update deployment after code changes
# Run ON the server after push.sh has synced files.
# --------------------------------------------------
set -euo pipefail

APP_DIR="$HOME/reverse-academy"

echo ">> Updating Reverse Academy..."

cd "$APP_DIR"

# Rebuild and restart containers
echo "[1/2] Rebuilding containers..."
BASE_PATH="/projects/reverse-academy" docker compose build

echo "[2/2] Restarting..."
docker compose up -d

# Verify
sleep 5
echo ""
echo "Container status:"
docker compose ps
echo ""

API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/projects/reverse-academy/api/v1/health 2>/dev/null || echo "fail")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/projects/reverse-academy/ 2>/dev/null || echo "fail")

echo "  API:      ${API_STATUS}"
echo "  Frontend: ${FRONTEND_STATUS}"

if [[ "$API_STATUS" == "200" && "$FRONTEND_STATUS" == "200" ]]; then
  echo ""
  echo ">> Update successful!"
  echo "   Live at: https://tferhat.com/projects/reverse-academy/"
else
  echo ""
  echo ">> WARNING: One or more services may not be healthy."
  echo "   Check logs: docker compose logs -f"
fi
