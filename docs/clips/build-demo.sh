#!/usr/bin/env bash
# Frame a raw demo take (capture-demo.mjs) into something sendable.
#
#   ./build-demo.sh wisp-theme-light-showme-zap
#   ./build-demo.sh                              # every take in .work/demo
#
#   .work/demo/<slug>.mp4  ->  out/sandstr-demo-<slug>.mp4
#
# Deliberately the SMALLEST of the build scripts here, because this one is not
# a cut. The other three stage a narrative: captions, montage, an end card. A
# demo take is already the whole thing — someone asked for their client shown a
# particular way and the link showed it — so the only job is the footer.
#
# The footer exists for one reason: THE VERSION LABEL.
#
# The SIMULATION banner is already inside the frame; ClientView renders it on
# every client view and the raw take carries it (that is why the take is never
# cropped to the device here, unlike build-teaser.sh which crops the phone out
# of the host chrome and has to redraw the banner itself). What is NOT in every
# frame is which upstream build the reproduction was checked against: at desktop
# framing the meta row shows it beside the client name ("AS OF AUG 2026"), and
# the phone compact bar has no room. So a phone take travels with no staleness
# marker at all. That matters more here than anywhere else in this directory: a
# demo file is made to be handed to the client's own team, and a stale
# reproduction published under their name becomes their problem, not ours.
#
# The label comes from <slug>.marks.json, which capture-demo.mjs reads out of
# dist/c/<id>.html — i.e. from `reproduces` in the registry, via the build.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/.work/demo"
OUT="$HERE/out"
mkdir -p "$OUT"

BOLD="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REG="/System/Library/Fonts/Supplemental/Arial.ttf"

# The string the other cuts burn in. NOT the one ClientView renders — the two
# differ on purpose and the branding skill says not to "unify" them, because a
# unified third wording quotes text that exists nowhere.
DISCLAIMER="SIMULATION · unofficial · mock data · not affiliated"
ACCENT="0xA78BFA"
MUTED="0x74747F"
BG="0x0B0B10"

one() {
  local slug=$1
  local src="$SRC/$slug.mp4"
  local marks="$SRC/$slug.marks.json"
  [ -s "$src" ] || { echo "  ! no take: $src" >&2; return 1; }

  local w h
  # `-of csv=p=0` leaves a trailing comma on a single entry ("860,"), which
  # arithmetic then chokes on; nokey/noprint_wrappers gives the bare number.
  w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "$src")
  h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 "$src")

  # Version label, and the link it came from, straight out of the sidecar.
  local ver link
  ver=$(node -e "try{const m=require('$marks');process.stdout.write(m.reproduces||'')}catch{}" 2>/dev/null || true)
  link=$(node -e "try{const m=require('$marks');process.stdout.write(m.link||'')}catch{}" 2>/dev/null || true)

  # Band height and type size scale with the frame, then clamp: a phone take is
  # 860 wide and a desktop one 1600, and one fixed size is either unreadable on
  # the first or shouting on the second.
  local band fs_d fs_b
  band=$(( w / 8 )); [ "$band" -lt 96 ] && band=96; [ "$band" -gt 150 ] && band=150
  band=$(( band / 2 * 2 ))
  fs_d=$(( w / 42 )); [ "$fs_d" -lt 18 ] && fs_d=18; [ "$fs_d" -gt 30 ] && fs_d=30
  fs_b=$(( w / 34 )); [ "$fs_b" -lt 22 ] && fs_b=22; [ "$fs_b" -gt 36 ] && fs_b=36

  local pad_h=$(( h + band ))
  local x=$(( w / 24 ))
  local y_b=$(( h + band / 2 - fs_b ))
  local y_d=$(( h + band / 2 + 4 ))

  # `sandstr.app` plus the version on one line, the standing disclaimer under
  # it. An empty `ver` degrades to just the brand rather than to "()".
  local brand="sandstr.app"
  [ -n "$ver" ] && brand="sandstr.app · $ver"

  local out="$OUT/sandstr-demo-$slug.mp4"
  # A silent AAC track: several Nostr clients refuse to inline a video with no
  # audio stream at all, and inlining is the entire point of handing someone a
  # file rather than a link.
  ffmpeg -v error -y -i "$src" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
    -filter_complex "[0:v]pad=${w}:${pad_h}:0:0:color=${BG},\
drawtext=fontfile='${BOLD}':text='${brand}':fontsize=${fs_b}:fontcolor=${ACCENT}:x=${x}:y=${y_b},\
drawtext=fontfile='${REG}':text='${DISCLAIMER}':fontsize=${fs_d}:fontcolor=${MUTED}:x=${x}:y=${y_d},\
format=yuv420p[v]" \
    -map "[v]" -map 1:a -shortest \
    -c:v libx264 -profile:v high -crf 20 -preset slow -c:a aac -b:a 32k \
    -movflags +faststart "$out"

  local size
  size=$(du -h "$out" | cut -f1 | tr -d ' ')
  printf '  · %-44s %sx%s  %s  %s\n' "$(basename "$out")" "$w" "$pad_h" "$size" "${link:-}"
}

if [ $# -gt 0 ]; then
  for slug in "$@"; do one "$slug"; done
else
  shopt -s nullglob
  found=0
  for f in "$SRC"/*.mp4; do
    one "$(basename "$f" .mp4)" && found=1
  done
  [ "$found" = 1 ] || { echo "no takes in $SRC — run capture-demo.mjs first" >&2; exit 1; }
fi
