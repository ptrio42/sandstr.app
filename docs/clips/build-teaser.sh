#!/usr/bin/env bash
# Build the sandstr teaser from the screen recording in this directory.
#
# Everything is ffmpeg + assets already in the repo — no new deps, no network.
# Source of truth for what each beat shows is the SEGMENTS table below; the
# frame layout (card box, caption band, footer) is fixed by the constants.
#
#   ./build-teaser.sh            -> out/sandstr-teaser-vertical.mp4  (1080x1920)
#                                   out/sandstr-loop-zap.mp4        (short loop)
#
# Stills for the "eight, rebuilt screen by screen" montage are captured from the
# dev server with headless Chrome — see capture-shots.sh.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
SRC="${SRC:-$HERE/Nagranie z ekranu 2026-08-5 o 22.07.56.mov}"
SHOTS="${SHOTS:-$HERE/shots}"
OUT="$HERE/out"
WORK="${WORK:-$HERE/.work}"
mkdir -p "$OUT" "$WORK"

BOLD="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REG="/System/Library/Fonts/Supplemental/Arial.ttf"

# ---- frame layout (1080x1920) ------------------------------------------------
CANW=1080; CANH=1920
CARDW=860; CARDH=1550; CARDX=110; CARDY=200; CARDR=40
CAPY=84                      # caption baseline band
FOOTY=1782                   # brand lockup row
DISCY=1858                   # the disclaimer line that must never come off

DISCLAIMER="SIMULATION · unofficial · mock data · not affiliated"
ACCENT="0xA78BFA"
MUTED="0x74747F"

# The phone screen inside the recording (the bezel is cropped away; the sim is
# rendered at 600x1322 device px there). 1082 is the 860:1550 slice of it.
PX=814; PW=600; PH=1082

# ---- helpers -----------------------------------------------------------------
mask() { # w h r out — rounded-rect alpha, generated once per size
  local w=$1 h=$2 r=$3 o=$4
  [ -s "$o" ] && return 0
  ffmpeg -v error -y -f lavfi -i "color=c=black:s=${w}x${h}" -frames:v 1 \
    -vf "format=gray,geq=lum='if(lte(pow(max(0\,max(${r}-X\,X-(W-1-${r})))\,2)+pow(max(0\,max(${r}-Y\,Y-(H-1-${r})))\,2)\,${r}*${r})\,255\,0)'" \
    "$o"
}

# Shared chrome: caption at the top, brand lockup + disclaimer at the bottom.
chrome() { # caption -> filter chain fragment
  local cap=$1
  echo "drawtext=fontfile='${BOLD}':text='${cap}':fontsize=62:fontcolor=white:x=${CARDX}:y=${CAPY}:shadowcolor=black@0.6:shadowx=0:shadowy=3,\
drawtext=fontfile='${BOLD}':text='sandstr.app':fontsize=40:fontcolor=${ACCENT}:x=${CANW}-${CARDX}-tw:y=${FOOTY}+8:shadowcolor=black@0.6:shadowx=0:shadowy=2,\
drawtext=fontfile='${REG}':text='${DISCLAIMER}':fontsize=26:fontcolor=${MUTED}:x=${CARDX}:y=${DISCY}"
}

# The blurred backdrop. Blacks are lifted off zero so an OLED-dark client screen
# still reads as a card sitting on a surface rather than bleeding into the frame.
AMBIENT="scale=180:320,gblur=sigma=14,scale=${CANW}:${CANH}:flags=bilinear,\
eq=brightness=-0.30:saturation=1.9,colorlevels=romin=0.075:gomin=0.072:bomin=0.105,vignette=PI/4"
# Mark + wordmark, cropped out of the 6x capture of the running app.
LOCKUP="crop=660:165:110:95,scale=-1:46:flags=lanczos"

MASK_CARD="$WORK/mask_${CARDW}x${CARDH}r${CARDR}.png"; mask "$CARDW" "$CARDH" "$CARDR" "$MASK_CARD"

# ---- video beats -------------------------------------------------------------
# name | in | out | speed | crop-y in the phone screen | caption
SEGMENTS=(
  "01wisp-open|4.6|8.8|1.75|300|Open one. Nothing to install."
  "03wisp-follow|9.6|14.6|1.72|220|Search. Follow."
  "04wisp-zap|15.6|22.2|1.83|420|Zap 500 sats."
  "05wisp-dm|30.8|36.6|1.85|418|Send a DM."
  "06nostur|41.3|47.5|1.82|200|Switch apps. Same tab."
  "07nostur-settings|59.6|65.6|2.00|240|Down to the settings screen."
)

for s in "${SEGMENTS[@]}"; do
  IFS='|' read -r name tin tout speed cy cap <<<"$s"
  echo "  · $name"
  ffmpeg -v error -y -ss "$tin" -to "$tout" -i "$SRC" -i "$MASK_CARD" -i "$SHOTS/lockup.png" \
    -filter_complex "\
[0:v]crop=${PW}:${PH}:${PX}:${cy},setpts=(PTS-STARTPTS)/${speed},fps=30,format=gbrp[c];\
[c]split[c1][c2];\
[c1]${AMBIENT}[bg];\
[c2]scale=${CARDW}:${CARDH}:flags=lanczos,unsharp=5:5:0.4,format=yuva444p[fgs];\
[1:v]format=gray[mk];\
[fgs][mk]alphamerge[fg];\
[2:v]${LOCKUP}[lk];\
[bg][fg]overlay=${CARDX}:${CARDY}:format=auto[v1];\
[v1][lk]overlay=${CARDX}:${FOOTY}:format=auto[v2];\
[v2]$(chrome "$cap"),format=yuv420p[v]" \
    -map "[v]" -c:v libx264 -crf 17 -preset medium -r 30 "$WORK/${name}.mp4"
done

# ---- beat 02: the shelf montage (8 reference-verified clients) ---------------
# Only `status: ready` clients appear here — the two early previews are left out
# on purpose, same axis the gallery uses.
MONT=(
  "damus|Damus|796:1435:471:700"        "amethyst|Amethyst|796:1435:471:700"
  "primal|Primal|1000:1643:1100:357"     "snort|Snort|892:1643:1074:357"
  "yakihonne|YakiHonne|796:1435:471:700" "coracle|Coracle|983:1643:1120:357"
  "wisp|Wisp|796:1435:471:700"          "nostur|Nostur|796:1435:471:700"
)
MFRAMES=10                     # ~0.33s per card; the first one is held longer
: >"$WORK/montage.txt"
mi=0
for m in "${MONT[@]}"; do
  IFS='|' read -r id label rect <<<"$m"
  mi=$((mi+1))
  frames=$MFRAMES; [ $mi -eq 1 ] && frames=21
  crop="crop=${rect}"
  ffmpeg -v error -y -loop 1 -i "$SHOTS/${id}.png" -i "$MASK_CARD" -i "$SHOTS/lockup.png" \
    -filter_complex "\
[0:v]${crop},scale=${CARDW}:${CARDH}:force_original_aspect_ratio=decrease:flags=lanczos,\
pad=${CARDW}:${CARDH}:(ow-iw)/2:(oh-ih)/2:color=0x0B0B10,format=gbrp,\
zoompan=z='1+0.05*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${CARDW}x${CARDH}:fps=30[card];\
[card]split[k1][k2];\
[k1]${AMBIENT}[bg];\
[k2]format=yuva444p[fgs];[1:v]format=gray[mk];[fgs][mk]alphamerge[fg];\
[2:v]${LOCKUP}[lk];\
[bg][fg]overlay=${CARDX}:${CARDY}:format=auto[v1];\
[v1][lk]overlay=${CARDX}:${FOOTY}:format=auto[v2];\
[v2]$(chrome "Eight real Nostr clients."),\
drawtext=fontfile='${BOLD}':text='${label}':fontsize=38:fontcolor=${ACCENT}:x=${CARDX}:y=${CAPY}+82:shadowcolor=black@0.6:shadowx=0:shadowy=2,\
format=yuv420p[v]" \
    -map "[v]" -frames:v ${frames} -c:v libx264 -crf 17 -preset medium -r 30 "$WORK/mont_${mi}.mp4"
  echo "file 'mont_${mi}.mp4'" >>"$WORK/montage.txt"
done
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/montage.txt" -c copy "$WORK/02montage.mp4"

# ---- beat 08: Primal, the web client ----------------------------------------
# Landscape card, so it reads as a desktop app rather than another phone.
LW=1060; LH=993; LX=10; LY=479
MASK_WIDE="$WORK/mask_${LW}x${LH}r28.png"; mask "$LW" "$LH" 28 "$MASK_WIDE"
ffmpeg -v error -y -ss 83.0 -to 89.0 -i "$SRC" -i "$MASK_WIDE" -i "$SHOTS/lockup.png" \
  -filter_complex "\
[0:v]crop=1444:1353:402:223,setpts=(PTS-STARTPTS)/1.875,fps=30,format=gbrp[c];\
[c]split[c1][c2];\
[c1]${AMBIENT}[bg];\
[c2]scale=${LW}:${LH}:flags=lanczos,unsharp=5:5:0.3,format=yuva444p[fgs];\
[1:v]format=gray[mk];[fgs][mk]alphamerge[fg];\
[2:v]${LOCKUP}[lk];\
[bg][fg]overlay=${LX}:${LY}:format=auto[v1];\
[v1][lk]overlay=${CARDX}:${FOOTY}:format=auto[v2];\
[v2]$(chrome "Web clients too."),format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -crf 17 -preset medium -r 30 "$WORK/08primal.mp4"

# ---- beat 09: end card -------------------------------------------------------
# The lockup is the real vector mark, captured at 6x from the running app.
ffmpeg -v error -y -f lavfi -i "color=c=0x0B0B10:s=${CANW}x${CANH}:d=3.8:r=30" \
  -i "$SHOTS/lockup.png" \
  -filter_complex "\
[1:v]crop=660:165:110:95,scale=760:-1:flags=lanczos[lk];\
[0:v]drawbox=x=0:y=0:w=${CANW}:h=${CANH}:color=0x0B0B10:t=fill,\
drawtext=fontfile='${BOLD}':text='try Nostr':fontsize=96:fontcolor=white:x=(w-tw)/2:y=930,\
drawtext=fontfile='${BOLD}':text='no keys, no install':fontsize=96:fontcolor=${ACCENT}:x=(w-tw)/2:y=1046,\
drawtext=fontfile='${BOLD}':text='sandstr.app':fontsize=76:fontcolor=white:x=(w-tw)/2:y=1290,\
drawtext=fontfile='${REG}':text='${DISCLAIMER}':fontsize=26:fontcolor=${MUTED}:x=(w-tw)/2:y=${DISCY}[base];\
[base][lk]overlay=(W-w)/2:640:format=auto,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -crf 17 -preset medium -r 30 "$WORK/09end.mp4"

# ---- assemble ----------------------------------------------------------------
cat >"$WORK/all.txt" <<EOF
file '02montage.mp4'
file '01wisp-open.mp4'
file '03wisp-follow.mp4'
file '04wisp-zap.mp4'
file '05wisp-dm.mp4'
file '06nostur.mp4'
file '07nostur-settings.mp4'
file '08primal.mp4'
file '09end.mp4'
EOF

ffmpeg -v error -y -f concat -safe 0 -i "$WORK/all.txt" \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
  -map 0:v -map 1:a -shortest \
  -c:v libx264 -crf 21 -preset slow -profile:v high -level 4.0 -pix_fmt yuv420p \
  -g 60 -movflags +faststart -c:a aac -b:a 48k \
  "$OUT/sandstr-teaser-vertical.mp4"

# 6s silent loop of just the zap — the single most legible beat, for replies.
ffmpeg -v error -y -ss 15.4 -to 22.6 -i "$SRC" -i "$MASK_CARD" -i "$SHOTS/lockup.png" \
  -filter_complex "\
[0:v]crop=${PW}:${PH}:${PX}:420,setpts=(PTS-STARTPTS)/1.2,fps=30,format=gbrp[c];\
[c]split[c1][c2];\
[c1]${AMBIENT}[bg];\
[c2]scale=${CARDW}:${CARDH}:flags=lanczos,unsharp=5:5:0.4,format=yuva444p[fgs];\
[1:v]format=gray[mk];[fgs][mk]alphamerge[fg];\
[2:v]${LOCKUP}[lk];\
[bg][fg]overlay=${CARDX}:${CARDY}:format=auto[v1];\
[v1][lk]overlay=${CARDX}:${FOOTY}:format=auto[v2];\
[v2]$(chrome "Zap 500 sats."),format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -g 60 \
  -movflags +faststart "$OUT/sandstr-loop-zap.mp4"

ls -lh "$OUT"
