#!/usr/bin/env bash
# --------------------------------------------------
# push.sh — Sync project to a remote server
# Usage: ./deploy/push.sh [host]  (default: hetzner-vm)
# --------------------------------------------------
set -euo pipefail

REMOTE="${1:-hetzner-vm}"
REMOTE_DIR="~/reverse-academy"

echo ">> Syncing project to ${REMOTE}:${REMOTE_DIR} ..."

rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.svelte-kit' \
  --exclude='target' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='local.db' \
  --exclude='.env' \
  ./ "${REMOTE}:${REMOTE_DIR}/"

echo ""
echo ">> Done. Files synced to ${REMOTE}:${REMOTE_DIR}"
echo ""
echo "Next steps:"
echo "  First time:  ssh ${REMOTE} 'bash ${REMOTE_DIR}/deploy/setup-server.sh'"
echo "  Updates:     ssh ${REMOTE} 'bash ${REMOTE_DIR}/deploy/update.sh'"
