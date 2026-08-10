#!/usr/bin/env bash
# Build the FAQ teaser (cut #2) from the loops captured by capture-faq.mjs.
#
#   ./build-teaser-faq.sh   -> out/sandstr-faq-teaser.mp4    (1080x1920, the post)
#                              out/sandstr-faq-<client>.mp4  (one question each)
#                              out/sandstr-faq-hero.mp4      (loop 1, no captions)
#
# Beats, captions and the reasoning behind them: docs/clips/faq-teaser.md.
# Frame furniture (card box, ambient backdrop, lockup, footer) is inherited from
# build-teaser.sh unchanged — the two cuts are one series.
#
# Speed is per PHASE, not per clip: capture-faq.mjs writes marks.json with the
# moment the query finished typing, the answer opened and the demo started, so
# the typing can run at ~2.7x while the spotlight stays near real time. Speeding
# a whole loop uniformly to hit 8s turns the demo — the only part that carries
# the argument — into a blur.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/.work/faq"
OUT="$HERE/out"
WORK="$HERE/.work/faq-cut"
SHOTS="$HERE/shots"
mkdir -p "$OUT" "$WORK"

BOLD="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REG="/System/Library/Fonts/Supplemental/Arial.ttf"

# ---- frame layout (1080x1920) — same constants as build-teaser.sh ------------
CANW=1080; CANH=1920
CARDW=860; CARDH=1550; CARDX=110; CARDY=200; CARDR=40
CAPY=84                      # caption line 1
CAP2Y=166                    # caption line 2 (the payoff / the ring)
FOOTY=1782                   # brand lockup row
DISCY=1858                   # the disclaimer line that must never come off

DISCLAIMER="SIMULATION · unofficial · mock data · not affiliated"
ACCENT="0xA78BFA"
MUTED="0x74747F"

AMBIENT="scale=180:320,gblur=sigma=14,scale=${CANW}:${CANH}:flags=bilinear,\
eq=brightness=-0.30:saturation=1.9,colorlevels=romin=0.075:gomin=0.072:bomin=0.105,vignette=PI/4"
LOCKUP="crop=660:165:110:95,scale=-1:46:flags=lanczos"

mask() { # w h r out — rounded-rect alpha, generated once per size
  local w=$1 h=$2 r=$3 o=$4
  [ -s "$o" ] && return 0
  ffmpeg -v error -y -f lavfi -i "color=c=black:s=${w}x${h}" -frames:v 1 \
    -vf "format=gray,geq=lum='if(lte(pow(max(0\,max(${r}-X\,X-(W-1-${r})))\,2)+pow(max(0\,max(${r}-Y\,Y-(H-1-${r})))\,2)\,${r}*${r})\,255\,0)'" \
    "$o"
}

# Shared chrome: two caption lines, brand lockup, disclaimer. Line 2 is optional
# (the hero cut passes empty strings) — the disclaimer never is.
chrome() { # line1 line2 -> filter chain fragment
  local l1=$1 l2=$2 frag=""
  [ -n "$l1" ] && frag="drawtext=fontfile='${BOLD}':text='${l1}':fontsize=62:fontcolor=white:x=${CARDX}:y=${CAPY}:shadowcolor=black@0.6:shadowx=0:shadowy=3,"
  [ -n "$l2" ] && frag="${frag}drawtext=fontfile='${BOLD}':text='${l2}':fontsize=38:fontcolor=${ACCENT}:x=${CARDX}:y=${CAP2Y}:shadowcolor=black@0.6:shadowx=0:shadowy=2,"
  echo "${frag}\
drawtext=fontfile='${BOLD}':text='sandstr.app':fontsize=40:fontcolor=${ACCENT}:x=${CANW}-${CARDX}-tw:y=${FOOTY}+8:shadowcolor=black@0.6:shadowx=0:shadowy=2,\
drawtext=fontfile='${REG}':text='${DISCLAIMER}':fontsize=26:fontcolor=${MUTED}:x=${CARDX}:y=${DISCY}"
}

MASK_CARD="$WORK/mask_${CARDW}x${CARDH}r${CARDR}.png"; mask "$CARDW" "$CARDH" "$CARDR" "$MASK_CARD"

# Primal is the desktop beat (frameless clients have no FAQ affordance below
# 640px), and it is the one loop that needs TWO framings of its 2560x1440
# window. One crop cannot serve both halves: fitting the whole window into the
# card shrinks the panel's 13px type to about 5px in the finished frame, while a
# crop tight enough to read the answer cuts the note whose zap gets spotlighted.
#
# Both crops start clear of the host's disclaimer strip rather than slicing it
# mid-word — the redrawn footer carries the mandated text either way, but a
# chopped banner in shot looks like something to hide.
PAB_CROP="crop=1280:1440:1280:0";   PAB_W=880;  PAB_H=990; PAB_X=100; PAB_Y=465
PD_CROP="crop=1300:1200:700:200";   PD_W=1000;  PD_H=923;  PD_X=40;   PD_Y=498
MASK_PAB="$WORK/mask_${PAB_W}x${PAB_H}r28.png"; mask "$PAB_W" "$PAB_H" 28 "$MASK_PAB"
MASK_PD="$WORK/mask_${PD_W}x${PD_H}r28.png";    mask "$PD_W"  "$PD_H"  28 "$MASK_PD"

# ---- the loops ---------------------------------------------------------------
# id | line1 (the pain, held all beat) | line2 while reading the answer |
#    line2 over the spotlight | target seconds for phase A / B / D
LOOPS=(
"damus|Lost my phone.|Your key IS your account.|Settings → Keys backs it up.|1.9|2.2|4.0"
"amethyst|Nobody sees my notes.|You post to relays, not a network.|The Relays row shows connected of total.|1.9|2.2|4.0"
"primal|How do I tip someone?|Nostr calls this a zap.|Second action. The number is total sats.|1.9|2.2|3.1"
"nostur|Nothing is loading.|There is a turtle in the toolbar.|Low Data Mode pauses media, not text.|1.9|2.2|4.8"
)

mark() { # loop key -> seconds (float)
  node -e "const m=require('$SRC/$1/marks.json');process.stdout.write(((m['$2']??0)/1000).toFixed(3))"
}
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }

# Render one phase of one loop into a composited 1080x1920 segment.
segment() { # id in out speed ss to line1 line2 name
  local id=$1 in=$2 to_out=$3 speed=$4 ss=$5 to=$6 l1=$7 l2=$8 name=$9
  local geom fg
  if [ "$id" = "primal" ]; then
    # Phase D reframes onto the note being spotlighted; A and B stay on the panel.
    local crop=$PAB_CROP cw=$PAB_W ch=$PAB_H mk="$MASK_PAB" ox=$PAB_X oy=$PAB_Y
    if [ "$name" = "d" ]; then
      crop=$PD_CROP; cw=$PD_W; ch=$PD_H; mk="$MASK_PD"; ox=$PD_X; oy=$PD_Y
    fi
    geom="${crop},setpts=(PTS-STARTPTS)/${speed},fps=30,format=gbrp"
    fg="scale=${cw}:${ch}:flags=lanczos,unsharp=5:5:0.3,format=yuva444p"
  else
    # 860x1550 native — the capture viewport was chosen to match the card, so
    # nothing is rescaled and the type stays as crisp as the browser drew it.
    geom="setpts=(PTS-STARTPTS)/${speed},fps=30,format=gbrp"
    fg="format=yuva444p"
    local mk="$MASK_CARD" ox=$CARDX oy=$CARDY
  fi
  ffmpeg -v error -y -ss "$ss" -to "$to" -i "$in" -i "$mk" -i "$SHOTS/lockup.png" \
    -filter_complex "\
[0:v]${geom}[c];\
[c]split[c1][c2];\
[c1]${AMBIENT}[bg];\
[c2]${fg}[fgs];\
[1:v]format=gray[mk];\
[fgs][mk]alphamerge[fg];\
[2:v]${LOCKUP}[lk];\
[bg][fg]overlay=${ox}:${oy}:format=auto[v1];\
[v1][lk]overlay=${CARDX}:${FOOTY}:format=auto[v2];\
[v2]$(chrome "$l1" "$l2"),format=yuv420p[v]" \
    -map "[v]" -c:v libx264 -crf 17 -preset medium -r 30 "$to_out"
}

# ---- per-loop beats ----------------------------------------------------------
: >"$WORK/all.txt"
echo "file 'intro.mp4'" >>"$WORK/all.txt"

for row in "${LOOPS[@]}"; do
  IFS='|' read -r id l1 l2b l2d tA tB tD <<<"$row"
  in="$SRC/${id}.mp4"
  [ -s "$in" ] || { echo "  ! missing $in — run capture-faq.mjs $id"; exit 1; }
  echo "  · ${id}"

  # Phase B ends at `answer`, NOT at `demo`: the ~0.9s between them is the sheet
  # closing and the tour mounting, and with the split at `demo` that transition
  # landed under the answer's caption — a spotlight already on screen while the
  # line above it still talked about the answer card.
  qm=$(mark "$id" question); dm=$(mark "$id" answer); total=$(dur "$in")
  # The demo runs to the end of the clip; marks.end can overshoot it by the
  # flush window, so the clip's own duration wins.
  read -r sA sB sD <<<"$(awk -v q="$qm" -v d="$dm" -v e="$total" -v a="$tA" -v b="$tB" -v dd="$tD" \
    'BEGIN{printf "%.3f %.3f %.3f", q/a, (d-q)/b, (e-d)/dd}')"

  segment "$id" "$in" "$WORK/${id}_a.mp4" "$sA" 0      "$qm"   "$l1" ""     a
  segment "$id" "$in" "$WORK/${id}_b.mp4" "$sB" "$qm"  "$dm"   "$l1" "$l2b" b
  segment "$id" "$in" "$WORK/${id}_d.mp4" "$sD" "$dm"  "$total" "$l1" "$l2d" d

  for p in a b d; do echo "file '${id}_${p}.mp4'" >>"$WORK/all.txt"; done

  # standalone clip: the same three beats plus a short brand tag
  : >"$WORK/one_${id}.txt"
  for p in a b d; do echo "file '${id}_${p}.mp4'" >>"$WORK/one_${id}.txt"; done
  echo "file 'tag.mp4'" >>"$WORK/one_${id}.txt"
done

# ---- intro / tag / end card --------------------------------------------------
card() { # out duration line1 line2 line3 -> brand card with the lockup
  local out=$1 d=$2 l1=$3 l2=$4 l3=$5
  ffmpeg -v error -y -f lavfi -i "color=c=0x0B0B10:s=${CANW}x${CANH}:d=${d}:r=30" \
    -i "$SHOTS/lockup.png" \
    -filter_complex "\
[1:v]crop=660:165:110:95,scale=760:-1:flags=lanczos[lk];\
[0:v]drawbox=x=0:y=0:w=${CANW}:h=${CANH}:color=0x0B0B10:t=fill,\
drawtext=fontfile='${BOLD}':text='${l1}':fontsize=86:fontcolor=white:x=(w-tw)/2:y=930,\
drawtext=fontfile='${BOLD}':text='${l2}':fontsize=86:fontcolor=${ACCENT}:x=(w-tw)/2:y=1036,\
drawtext=fontfile='${BOLD}':text='${l3}':fontsize=76:fontcolor=white:x=(w-tw)/2:y=1290,\
drawtext=fontfile='${REG}':text='${DISCLAIMER}':fontsize=26:fontcolor=${MUTED}:x=(w-tw)/2:y=${DISCY}[base];\
[base][lk]overlay=(W-w)/2:640:format=auto,format=yuv420p[v]" \
    -map "[v]" -c:v libx264 -crf 17 -preset medium -r 30 "$out"
}

card "$WORK/intro.mp4" 2.5 "Four questions." "Four apps. No install." ""
card "$WORK/end.mp4"   3.5 "try Nostr"       "no keys, no install"    "sandstr.app"
card "$WORK/tag.mp4"   1.6 ""                ""                       "sandstr.app"
echo "file 'end.mp4'" >>"$WORK/all.txt"

# ---- assemble ----------------------------------------------------------------
encode() { # list out
  ffmpeg -v error -y -f concat -safe 0 -i "$1" \
    -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
    -map 0:v -map 1:a -shortest \
    -c:v libx264 -crf 21 -preset slow -profile:v high -level 4.0 -pix_fmt yuv420p \
    -g 60 -movflags +faststart -c:a aac -b:a 48k "$2"
}

encode "$WORK/all.txt" "$OUT/sandstr-faq-teaser.mp4"
for row in "${LOOPS[@]}"; do
  IFS='|' read -r id _ <<<"$row"
  encode "$WORK/one_${id}.txt" "$OUT/sandstr-faq-${id}.mp4"
done

# Hero loop for the landing page: same beats, no captions — the page has words.
# The disclaimer stays, because it is not decoration.
IFS='|' read -r hid _ _ _ hA hB hD <<<"${LOOPS[0]}"
hq=$(mark "$hid" question); hd=$(mark "$hid" answer); ht=$(dur "$SRC/${hid}.mp4")
read -r sA sB sD <<<"$(awk -v q="$hq" -v d="$hd" -v e="$ht" -v a="$hA" -v b="$hB" -v dd="$hD" \
  'BEGIN{printf "%.3f %.3f %.3f", q/a, (d-q)/b, (e-d)/dd}')"
segment "$hid" "$SRC/${hid}.mp4" "$WORK/hero_a.mp4" "$sA" 0     "$hq" "" "" a
segment "$hid" "$SRC/${hid}.mp4" "$WORK/hero_b.mp4" "$sB" "$hq" "$hd" "" "" b
segment "$hid" "$SRC/${hid}.mp4" "$WORK/hero_d.mp4" "$sD" "$hd" "$ht" "" "" d
printf "file 'hero_a.mp4'\nfile 'hero_b.mp4'\nfile 'hero_d.mp4'\n" >"$WORK/hero.txt"
encode "$WORK/hero.txt" "$OUT/sandstr-faq-hero.mp4"

ls -lh "$OUT" | grep faq
