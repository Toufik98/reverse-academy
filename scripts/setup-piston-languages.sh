#!/usr/bin/env bash
# Setup Piston languages for Reverse Academy
# Installs runtimes needed for Tier 2 code execution

set -euo pipefail

PISTON_URL="${PISTON_URL:-http://localhost:2000}"

echo "Setting up Piston languages at $PISTON_URL..."

# Rust 1.75 (MVP)
echo "Installing Rust..."
curl -s -X POST "$PISTON_URL/api/v2/packages" \
  -H "Content-Type: application/json" \
  -d '{"language": "rust", "version": "1.75.0"}' || echo "Rust may already be installed"

# Go (v2)
echo "Installing Go..."
curl -s -X POST "$PISTON_URL/api/v2/packages" \
  -H "Content-Type: application/json" \
  -d '{"language": "go", "version": "1.21.0"}' || echo "Go may already be installed"

# C++ (v2)
echo "Installing C++..."
curl -s -X POST "$PISTON_URL/api/v2/packages" \
  -H "Content-Type: application/json" \
  -d '{"language": "c++", "version": "10.2.0"}' || echo "C++ may already be installed"

# Java (v2)
echo "Installing Java..."
curl -s -X POST "$PISTON_URL/api/v2/packages" \
  -H "Content-Type: application/json" \
  -d '{"language": "java", "version": "15.0.2"}' || echo "Java may already be installed"

echo ""
echo "Verifying installed runtimes..."
curl -s "$PISTON_URL/api/v2/runtimes" | python3 -m json.tool 2>/dev/null || \
  curl -s "$PISTON_URL/api/v2/runtimes"

echo ""
echo "Piston setup complete!"
