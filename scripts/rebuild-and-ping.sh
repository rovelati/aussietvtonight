#!/bin/bash
# Rebuild, verify and ping IndexNow + Google Indexing for aussietvtonight.com
set -euo pipefail

# Ensure Node 22+ is used if nvm is installed
if [ -d "$HOME/.nvm/versions/node/v22.23.2/bin" ]; then
  export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:$PATH"
fi

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../astro-aussietvtonight" && pwd)"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=== Aussie TV Tonight (aussietvtonight.com) Rebuild & Indexing Pipeline ==="
echo "Working directory: $DIR"

# 1. Fetch EPG data
echo "--- 1. Fetching Australian Freeview EPG ---"
python3 scripts/fetch-epg-json.py || true

# 2. Build Astro static site
echo "--- 2. Building Astro Static Site ---"
npm run build

# 3. Post-build verification
echo "--- 3. Verifying Build Output ---"
node scripts/verify-build.mjs

# 4. Ping IndexNow (Bing, Microsoft, Yandex)
echo "--- 4. Submitting URLs to IndexNow ---"
node scripts/ping-indexnow.mjs || true

# 5. Ping Google Indexing API (URL_UPDATED)
echo "--- 5. Submitting URLs to Google Indexing API ---"
python3 scripts/push-google-indexing.py || true

echo "=== Pipeline Completed Successfully! ==="
