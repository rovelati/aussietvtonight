#!/bin/bash
# Build aussietvtonight Astro + deploy Cloudflare Pages
set -euo pipefail

ASTRO_DIR="${ASTRO_DIR:-/var/www/aussietvtonight.com/astro}"
LOG="${LOG:-/var/log/aussietvtonight-rebuild.log}"
CF_PROJECT="${CF_PROJECT:-aussietvtonight}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

load_env() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "$ASTRO_DIR/.env" | head -1 || true)"
  [ -n "$line" ] || return 0
  local val="${line#*=}"
  # strip surrounding single/double quotes
  val="${val%\"}"; val="${val#\"}"
  val="${val%\'}"; val="${val#\'}"
  printf -v "$key" '%s' "$val"
  export "$key"
}

cd "$ASTRO_DIR"

if [ ! -f .env ]; then
  log "ERROR: missing $ASTRO_DIR/.env"
  exit 1
fi

load_env CF_API_KEY
load_env CF_API_EMAIL
load_env CF_ACCOUNT_ID
load_env SITE_URL

log "Starting Astro build..."
npm install 2>&1 | tee -a "$LOG"
npm run build 2>&1 | tee -a "$LOG"

if [ ! -f dist/index.html ]; then
  log "ERROR: dist/index.html missing after build"
  exit 1
fi

if ! grep -qiE 'Aussie|Tonight|Freeview' dist/index.html; then
  log "ERROR: homepage content looks empty/broken"
  exit 1
fi

log "Build OK ($(du -sh dist | awk '{print $1}'))"

if [ -z "${CF_API_KEY:-}" ] || [ -z "${CF_API_EMAIL:-}" ]; then
  log "WARN: CF_API_KEY/CF_API_EMAIL missing — skip Pages deploy"
  exit 0
fi

export CLOUDFLARE_API_KEY="$CF_API_KEY"
export CLOUDFLARE_EMAIL="$CF_API_EMAIL"
[ -n "${CF_ACCOUNT_ID:-}" ] && export CLOUDFLARE_ACCOUNT_ID="$CF_ACCOUNT_ID"

log "Deploying to Cloudflare Pages project=$CF_PROJECT ..."
npx --yes wrangler@4 pages deploy dist \
  --project-name="$CF_PROJECT" \
  --branch=main \
  --commit-dirty=true 2>&1 | tee -a "$LOG"

log "Deploy complete"

log "Pinging IndexNow (Bing / Microsoft)..."
node scripts/ping-indexnow.mjs 2>&1 | tee -a "$LOG" || true

log "Pinging Google Indexing API (URL_UPDATED)..."
python3 scripts/push-google-indexing.py 2>&1 | tee -a "$LOG" || true

log "All search engine pings finished!"
