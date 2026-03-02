#!/usr/bin/env bash
# --------------------------------------------------
# setup-server.sh — First-time server setup
# Run ON the server. Sets up Docker, GHCR auth,
# configures Piston, and starts containers.
#
# Prerequisites:
#   - GitHub PAT with read:packages scope (stored in CR_PAT env or prompted)
#   - .env file with required environment variables
#   - deploy/ directory synced via push.sh
#
# Usage: bash deploy/setup-server.sh
# --------------------------------------------------
set -euo pipefail

APP_DIR="$HOME/reverse-academy"
REGISTRY="ghcr.io"
GITHUB_USER="toufik98"
COMPOSE_FILE="docker-compose.prod.yml"

echo "==============================================="
echo "  Reverse Academy — Server Setup"
echo "==============================================="

# -- 1. Install Docker -----------------------------
echo ""
echo "[1/6] Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  echo "  Docker installed. You may need to log out/in for group changes."
else
  echo "  Docker already installed: $(docker --version)"
fi

sudo systemctl enable --now docker

# -- 2. Install Docker Compose plugin --------------
echo ""
echo "[2/6] Checking Docker Compose..."
if ! docker compose version &>/dev/null; then
  sudo apt install -y docker-compose-plugin 2>/dev/null || \
  sudo yum install -y docker-compose-plugin 2>/dev/null || true
fi
echo "  $(docker compose version)"

# -- 3. Authenticate to GHCR -----------------------
echo ""
echo "[3/6] Authenticating to GitHub Container Registry..."
if [ -z "${CR_PAT:-}" ]; then
  echo "  Enter a GitHub Personal Access Token (read:packages scope):"
  read -rsp "  Token: " CR_PAT
  echo ""
fi
echo "$CR_PAT" | docker login "$REGISTRY" -u "$GITHUB_USER" --password-stdin
echo "  ✓ Authenticated to ${REGISTRY}"

# -- 4. Check .env file ----------------------------
echo ""
echo "[4/6] Checking .env file..."
if [ ! -f "$APP_DIR/.env" ]; then
  echo "  ⚠ No .env file found. Creating from .env.example..."
  if [ -f "$APP_DIR/.env.example" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo "  Created .env from .env.example — please edit it with production values."
    echo "  Then re-run this script."
    exit 1
  else
    echo "  ⚠ No .env.example found either. Create $APP_DIR/.env manually."
    exit 1
  fi
else
  echo "  ✓ .env file found."
fi

# -- 5. Open firewall ports -------------------------
echo ""
echo "[5/6] Opening firewall ports..."
# Ports 80/443 should already be open (shared with prodataviz nginx)
# Internal ports 3001 and 8081 only need localhost access
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
sudo ip6tables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
sudo ip6tables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
sudo sh -c "iptables-save > /etc/iptables/rules.v4" 2>/dev/null || true
sudo sh -c "ip6tables-save > /etc/iptables/rules.v6" 2>/dev/null || true
echo "  ✓ Firewall updated."

# -- 6. Pull images & start -------------------------
echo ""
echo "[6/6] Starting deployment..."
cd "$APP_DIR"
bash deploy/deploy.sh

# -- Post-setup: Install Piston languages -----------
echo ""
echo "Setting up Piston code execution languages..."
bash deploy/setup-piston-languages.sh || echo "  ⚠ Piston language setup skipped (run manually later)"

echo ""
echo "==============================================="
echo "  ✓ Setup complete!"
echo "  Live at: https://tferhat.com/projects/reverse-academy/"
echo ""
echo "  Future deployments:"
echo "    bash deploy/deploy.sh           # pull latest"
echo "    bash deploy/deploy.sh abc1234   # deploy specific tag"
echo ""
echo "  ⚠ Remember to add the nginx location blocks"
echo "    from deploy/nginx-reverse-academy.conf to your"
echo "    main tferhat.com nginx config."
echo "==============================================="
