#!/usr/bin/env bash
# Capture the stills build-teaser.sh needs, straight from the dev server.
#
#   npm run dev            # note the port it prints
#   PORT=5173 ./capture-shots.sh
#
# Headless Chrome at 2x gives a crisp frame the screen recording can't (the sim
# is only ~300 CSS px wide inside the phone frame there). --force-dark-mode is
# what puts the host chrome in dark: main.tsx falls back to prefers-color-scheme
# when localStorage has no `sandstr-theme`, and a headless profile never does.
#
# Chrome does not exit after --screenshot in headless=new, so each shot is
# launched detached and killed once the file lands. One at a time: a fan-out of
# parallel instances against the same Vite server reliably produced nothing.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-5173}"
BASE="http://localhost:${PORT}"
SHOTS="$HERE/shots"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
mkdir -p "$SHOTS"

grab() { # name url width height [scale]
  local name=$1 url=$2 w=$3 h=$4 dpr=${5:-2}
  local prof; prof="$(mktemp -d)"
  rm -f "$SHOTS/$name.png"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --no-default-browser-check --force-dark-mode --user-data-dir="$prof" \
    --force-device-scale-factor="$dpr" --window-size="$w,$h" \
    --virtual-time-budget=8000 --screenshot="$SHOTS/$name.png" "$url" >/dev/null 2>&1 &
  local pid=$! i
  for i in $(seq 1 100); do [ -s "$SHOTS/$name.png" ] && break; sleep 1; done
  sleep 1; kill -9 "$pid" 2>/dev/null || true
  pkill -9 -f "$prof" 2>/dev/null || true
  rm -rf "$prof"
  echo "  · $name (${i}s)"
}

for c in damus amethyst yakihonne keychat wisp nostur; do grab "$c" "$BASE/c/$c" 1120 1480; done
for c in primal snort coracle gossip;               do grab "$c" "$BASE/c/$c" 1600 1000; done

# Mark + wordmark for the video's footer and end card, at 6x so it survives being
# blown up to 760px wide. Small window on purpose — only the header is used.
grab lockup "$BASE/" 560 300 6

ls -la "$SHOTS"
