#!/usr/bin/env bash
# --------------------------------------------------
# deploy.sh — Pull pre-built images and restart
# Run ON the server (triggered by CI or manually).
# Usage: bash deploy/deploy.sh [TAG]
#   TAG defaults to "latest"
# --------------------------------------------------
set -euo pipefail

TAG="${1:-latest}"
APP_DIR="$HOME/reverse-academy"
REGISTRY="ghcr.io"
COMPOSE_FILE="docker-compose.prod.yml"

echo "========================================"
echo "  Reverse Academy — Deploy (tag: ${TAG})"
echo "========================================"

cd "$APP_DIR"

# -- 1. Authenticate to GHCR (uses saved credentials) --
echo ""
echo "[1/4] Authenticating to ${REGISTRY}..."
if ! docker pull "${REGISTRY}/toufik98/reverse-academy-api:${TAG}" --quiet 2>/dev/null; then
  echo "  ⚠ Pull failed. Make sure you are logged in:"
  echo "    echo \$CR_PAT | docker login ghcr.io -u toufik98 --password-stdin"
  exit 1
fi

# -- 2. Pull latest images --------------------------
echo ""
echo "[2/4] Pulling images (tag: ${TAG})..."
TAG="${TAG}" docker compose -f "${COMPOSE_FILE}" pull api frontend
echo "  ✓ Images pulled."

# -- 3. Restart containers --------------------------
echo ""
echo "[3/4] Restarting containers..."
TAG="${TAG}" docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans
echo "  ✓ Containers restarted."

# -- 4. Health check --------------------------------
echo ""
echo "[4/4] Checking health..."
sleep 5

docker compose -f "${COMPOSE_FILE}" ps

API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/projects/reverse-academy/api/v1/health 2>/dev/null || echo "fail")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/projects/reverse-academy/ 2>/dev/null || echo "fail")

echo ""
echo "  API:      ${API_STATUS}"
echo "  Frontend: ${FRONTEND_STATUS}"

if [[ "$API_STATUS" == "200" && "$FRONTEND_STATUS" == "200" ]]; then
  echo ""
  echo "========================================"
  echo "  ✓ Deploy successful!"
  echo "  Live at: https://tferhat.com/projects/reverse-academy/"
  echo "========================================"
else
  echo ""
  echo "  ⚠ WARNING: One or more services may not be healthy."
  echo "  Check logs: docker compose -f ${COMPOSE_FILE} logs -f"
  exit 1
fi

# -- Cleanup old images -----------------------------
echo ""
echo "Cleaning up old images..."
docker image prune -f --filter "until=24h" 2>/dev/null || true
