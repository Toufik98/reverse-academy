#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Reverse Academy — Local Development (no Docker)
# Starts SvelteKit frontend + Rust API in parallel.
# ──────────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
RUST_API_DIR="$ROOT_DIR/rust-api"
ENV_FILE="$ROOT_DIR/.env"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

log()  { echo -e "${CYAN}[reverse-academy]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

# ── Cleanup on exit ───────────────────────────────────────────
PIDS=()
cleanup() {
  log "Shutting down..."
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null
  ok "All processes stopped."
}
trap cleanup EXIT INT TERM

# ── Preflight checks ─────────────────────────────────────────
echo ""
echo -e "${BOLD}  Reverse Academy — Local Dev${NC}"
echo -e "  ─────────────────────────────"
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
  err "Node.js is required but not installed. Install Node.js 20+."
  exit 1
fi
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if (( NODE_VERSION < 20 )); then
  err "Node.js 20+ required (found $(node -v))."
  exit 1
fi
ok "Node.js $(node -v)"

# Check npm
if ! command -v npm &>/dev/null; then
  err "npm is required."
  exit 1
fi
ok "npm $(npm -v)"

# Check Rust
if ! command -v cargo &>/dev/null; then
  err "Rust/Cargo is required but not installed. Install via https://rustup.rs"
  exit 1
fi
ok "Cargo $(cargo --version | awk '{print $2}')"

# Check .env
if [[ -f "$ENV_FILE" ]]; then
  ok ".env found"
  set -a
  source "$ENV_FILE"
  set +a
else
  warn "No .env file found. Copying .env.example → .env"
  if [[ -f "$ROOT_DIR/.env.example" ]]; then
    cp "$ROOT_DIR/.env.example" "$ENV_FILE"
    set -a
    source "$ENV_FILE"
    set +a
    warn "Edit .env with your credentials before using auth/email features."
  else
    warn "No .env.example found either. Proceeding with defaults."
  fi
fi

echo ""

# ── Override env for local dev ────────────────────────────────
# Use local SQLite file DB if no Turso URL is configured yet
if [[ -z "${TURSO_URL:-}" || "${TURSO_URL:-}" == "libsql://your-db.turso.io" ]]; then
  export TURSO_URL="file:${RUST_API_DIR}/data/local.db"
  mkdir -p "${RUST_API_DIR}/data"
  warn "TURSO_URL not configured — using local SQLite: ${TURSO_URL}"
fi

# Piston: point to localhost if running Piston separately, or disable
export PISTON_URL="${PISTON_URL:-http://localhost:2000}"

# JWT fallback for dev
export JWT_SECRET="${JWT_SECRET:-dev-secret-change-in-production}"

# ── Install frontend dependencies ────────────────────────────
log "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
if [[ ! -d "node_modules" ]]; then
  npm install --silent
  ok "Frontend dependencies installed."
else
  ok "Frontend dependencies already installed."
fi

echo ""

# ── Start Rust API ────────────────────────────────────────────
log "Starting Rust API on :8080..."
cd "$RUST_API_DIR"

export PORT="${PORT:-8080}"
export RUST_LOG="${RUST_LOG:-reverse_academy_api=info,tower_http=info}"

cargo run 2>&1 | sed "s/^/  ${CYAN}[api]${NC} /" &
PIDS+=($!)
API_PID=$!

# Wait briefly for API to compile/start
log "Waiting for Rust API to compile and start (this may take a moment on first run)..."

# ── Start SvelteKit Frontend ─────────────────────────────────
log "Starting SvelteKit frontend on :5173..."
cd "$FRONTEND_DIR"

# Tell SvelteKit where the backend lives
export BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
export PUBLIC_APP_URL="${PUBLIC_APP_URL:-http://localhost:5173}"

npm run dev 2>&1 | sed "s/^/  ${GREEN}[frontend]${NC} /" &
PIDS+=($!)
FRONTEND_PID=$!

echo ""
echo -e "  ${BOLD}─────────────────────────────────────────────${NC}"
echo -e "  ${GREEN}Frontend${NC}   → ${BOLD}http://localhost:5173${NC}"
echo -e "  ${CYAN}Rust API${NC}   → ${BOLD}http://localhost:8080${NC}"
echo -e "  ${CYAN}API Health${NC} → ${BOLD}http://localhost:8080/api/v1/health${NC}"
if [[ "${PISTON_URL:-}" == *"localhost"* ]]; then
  echo -e "  ${YELLOW}Piston${NC}     → ${BOLD}${PISTON_URL}${NC} (start separately if needed)"
  echo ""
  echo -e "  ${YELLOW}Piston not included.${NC} To run Piston locally:"
  echo -e "    docker run -d --name piston -p 2000:2000 ghcr.io/engineer-man/piston"
fi
echo -e "  ${BOLD}─────────────────────────────────────────────${NC}"
echo ""
echo -e "  Press ${BOLD}Ctrl+C${NC} to stop all services."
echo ""

# ── Wait for all processes ───────────────────────────────────
wait
