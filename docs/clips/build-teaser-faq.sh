#!/usr/bin/env bash
# Build the FAQ teaser (cut #2) from the loops captured by capture-faq.mjs.
#
#   ./build-teaser-faq.sh   -> out/sandstr-faq-teaser.mp4    (1080x1920, the post)
#                              out/sandstr-faq-<loop>.mp4    (one question each)
#                              out/sandstr-faq-hero.mp4      (loop 1, no captions)
#
# Beats, captions and the reasoning behind them: docs/clips/faq-teaser.md.
# Frame furniture (card box, ambient backdrop, lockup, footer) is inherited from
# build-teaser.sh unchanged — the two cuts are one series.
#
# Two things this cut does differently from the first attempt at it:
#
# 1. The tour's own tooltip is hidden AT CAPTURE (see capture-faq.mjs). That card
#    carries "1 / 2", Prev / Next / Skip and a progress bar; on a phone-sized
#    card it took 30-45% of the frame and read as a demo of our onboarding
#    widget rather than of the client. The ring survives; the words move here.
# 2. Minimum words. One line while the question is typed, nothing while the
#    answer is on screen (the answer card is legible on its own), one line over
#    the spotlight. Everything else in frame is the product.
#
# Speed is per PHASE, and the typing is its own phase at 1.0x. An earlier cut
# gave the whole opening one multiplier to hit a 1.4s beat, which meant the
# query appeared at ~12ms per character — nobody types like that, and it read as
# fake before anything else registered. Now: opening the panel is sped up, the
# typing plays at the speed it was recorded (110ms/char), the wait between the
# answer and the demo is sped up, and the spotlight stays near real time.
#
# Two cuts, three loops each, because three loops can carry a thesis and six are
# a list. A: the client is not what you expect. B: the surprise is Nostr, not the
# app. A client switch sits between loops as the one wordless line that says
# these are all one tab.
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
CAPY=96                      # the one caption line
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

# Shared chrome: one caption line (white while asking, accent while showing),
# brand lockup, disclaimer. The caption is optional; the disclaimer is not.
chrome() { # text color -> filter chain fragment
  local txt=$1 col=$2 frag=""
  [ -n "$txt" ] && frag="drawtext=fontfile='${BOLD}':text='${txt}':fontsize=52:fontcolor=${col}:x=${CARDX}:y=${CAPY}:shadowcolor=black@0.65:shadowx=0:shadowy=3,"
  echo "${frag}\
drawtext=fontfile='${BOLD}':text='sandstr.app':fontsize=40:fontcolor=${ACCENT}:x=${CANW}-${CARDX}-tw:y=${FOOTY}+8:shadowcolor=black@0.6:shadowx=0:shadowy=2,\
drawtext=fontfile='${REG}':text='${DISCLAIMER}':fontsize=26:fontcolor=${MUTED}:x=${CARDX}:y=${DISCY}"
}

MASK_CARD="$WORK/mask_${CARDW}x${CARDH}r${CARDR}.png"; mask "$CARDW" "$CARDH" "$CARDR" "$MASK_CARD"

# Coracle is the desktop beat — frameless clients have no FAQ affordance below
# 640px — and the one loop that needs TWO framings of its window. Fitting the
# whole window into the card shrinks the panel's type past reading; a crop tight
# enough to read the answer cuts the settings rows the ring lands on.
CAB_CROP="crop=800:1250:800:0";   CAB_W=880;  CAB_H=1375; CAB_X=100; CAB_Y=250
CD_CROP="crop=1100:900:400:350";  CD_W=1000;  CD_H=818;   CD_X=40;   CD_Y=560
MASK_CAB="$WORK/mask_${CAB_W}x${CAB_H}r28.png"; mask "$CAB_W" "$CAB_H" 28 "$MASK_CAB"
MASK_CD="$WORK/mask_${CD_W}x${CD_H}r28.png";    mask "$CD_W"  "$CD_H"  28 "$MASK_CD"

# ---- the loops ---------------------------------------------------------------
# id | line while typing | line over the spotlight | seconds for phase A / B / D
# Keep every line at or under CAP_MAX characters — drawtext neither wraps nor
# shrinks, it just runs off the frame, and a caption clipped mid-word is the one
# defect a viewer cannot un-see. The build refuses to run if a line is too long.
CAP_MAX=28
T_OPEN=0.7                   # panel opening, sped up
T_WAIT=1.5                   # answer read + the click that starts the demo
T_SWITCH=2.0                 # the client-switch interstitial
LOOPS=(
"damus-shaka|Where is the heart?|It is a shaka.|3.0"
"amethyst|Nobody sees my notes.|You post to relays.|3.8"
"wisp|Can I take a post back?|Ten seconds to undo.|4.0"
"coracle|How do I block someone?|Coracle mutes, not blocks.|3.0"
"nostur|Nothing is loading.|A turtle paused the media.|4.6"
"damus-npub|How do people find me?|Your npub is your address.|3.0"
# Reply ammunition for the threads that are live right now — zaps and keys
# are 17% and 14% of #asknostr, and neither is in either cut.
"damus-keys|Lost my phone.|Your key is your account.|4.0"
"damus-zap|How do I tip someone?|It is called a zap.|3.0"
"amethyst-keys|Lost my phone.|Backup Keys, in the drawer.|3.0"
"amethyst-zap|How do I tip someone?|Zap, fourth under the note.|3.0"
# The keyword-mute clip: the demo lands on the field and the harness types
# into it, so the D phase carries the typing and needs the room.
"amethyst-mute|Tired of the current thing?|Add it to Hidden Words.|9.0"
)

for row in "${LOOPS[@]}"; do
  IFS='|' read -r id ask show _ <<<"$row"
  for line in "$ask" "$show"; do
    [ "${#line}" -le "$CAP_MAX" ] || { echo "  ! caption too long (${#line} > ${CAP_MAX}): $line"; exit 1; }
  done
done

# The two cuts, as ordered item lists. `sw-*` items are switch interstitials.
# Cut B opens on Coracle because it is the one desktop capture: a switch shot is
# a phone-viewport shot, so it can bridge phone loops only, and putting the web
# client first keeps every switch honest.
CUT_A=(damus-shaka sw-damus-nostur nostur sw-nostur-wisp wisp)
CUT_B=(coracle amethyst sw-amethyst-damus damus-npub)

mark() { # loop key -> seconds (float)
  node -e "const m=require('$SRC/$1/marks.json');process.stdout.write(((m['$2']??0)/1000).toFixed(3))"
}
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }

# Render one phase of one loop into a composited 1080x1920 segment.
segment() { # id in out speed ss to caption color phase
  local id=$1 in=$2 to_out=$3 speed=$4 ss=$5 to=$6 cap=$7 col=$8 phase=$9
  local geom fg mk ox oy
  if [ "$id" = "coracle" ]; then
    local crop=$CAB_CROP cw=$CAB_W ch=$CAB_H; mk="$MASK_CAB"; ox=$CAB_X; oy=$CAB_Y
    if [ "$phase" = "d" ]; then
      crop=$CD_CROP; cw=$CD_W; ch=$CD_H; mk="$MASK_CD"; ox=$CD_X; oy=$CD_Y
    fi
    geom="${crop},setpts=(PTS-STARTPTS)/${speed},fps=30,format=gbrp"
    fg="scale=${cw}:${ch}:flags=lanczos,unsharp=5:5:0.3,format=yuva444p"
  else
    # 860x1550 native — the capture viewport was chosen to match the card, so
    # nothing is rescaled and the type stays as crisp as the browser drew it.
    geom="setpts=(PTS-STARTPTS)/${speed},fps=30,format=gbrp"
    fg="format=yuva444p"; mk="$MASK_CARD"; ox=$CARDX; oy=$CARDY
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
[v2]$(chrome "$cap" "$col"),format=yuv420p[v]" \
    -map "[v]" -c:v libx264 -crf 17 -preset medium -r 30 "$to_out"
}

# ---- per-loop beats ----------------------------------------------------------
for row in "${LOOPS[@]}"; do
  IFS='|' read -r id ask show tD <<<"$row"
  in="$SRC/${id}.mp4"
  [ -s "$in" ] || { echo "  ! missing $in — run capture-faq.mjs $id"; exit 1; }
  echo "  · ${id}"

  # Four phases. `typing` is the mark where the cursor lands in the search field,
  # so everything before it (opening the panel, the pointer travelling) can be
  # compressed while the typing itself plays untouched.
  ty=$(mark "$id" typing); qm=$(mark "$id" question)
  dm=$(mark "$id" demo);   total=$(dur "$in")
  read -r sOpen sWait sD <<<"$(awk -v t="$ty" -v q="$qm" -v d="$dm" -v e="$total" \
    -v o="$T_OPEN" -v w="$T_WAIT" -v dd="$tD" \
    'BEGIN{printf "%.3f %.3f %.3f", t/o, (d-q)/w, (e-d)/dd}')"

  segment "$id" "$in" "$WORK/${id}_a.mp4" "$sOpen" 0     "$ty"    "$ask"  "white"   a
  segment "$id" "$in" "$WORK/${id}_t.mp4" "1.0"    "$ty"  "$qm"   "$ask"  "white"   t
  segment "$id" "$in" "$WORK/${id}_b.mp4" "$sWait" "$qm" "$dm"    ""      "white"   b
  segment "$id" "$in" "$WORK/${id}_d.mp4" "$sD"    "$dm" "$total" "$show" "$ACCENT" d
done

# ---- switch interstitials ------------------------------------------------------
# No caption: a sheet of client tiles opening and another app mounting says the
# whole thing on its own, and a line of text here would be the fourth voice in a
# frame that already has the client, the ring and the footer.
for sw in sw-damus-nostur sw-nostur-wisp sw-amethyst-damus; do
  in="$SRC/${sw}.mp4"
  [ -s "$in" ] || { echo "  ! missing $in — run capture-faq.mjs $sw"; exit 1; }
  echo "  · ${sw}"
  total=$(dur "$in")
  sp=$(awk -v e="$total" -v t="$T_SWITCH" 'BEGIN{printf "%.3f", e/t}')
  segment "$sw" "$in" "$WORK/${sw}_x.mp4" "$sp" 0 "$total" "" "white" x
done

# ---- tour teaser ---------------------------------------------------------------
# Four steps, no caption at all: the post above the video carries the words, and
# the tour card in frame already says "1 / 10". Speed is modest — the card is
# there to be READ, which is the whole claim being made.
if [ -s "$SRC/tour-wisp.mp4" ]; then
  echo "  · tour-wisp"
  ttotal=$(dur "$SRC/tour-wisp.mp4")
  tcut=$(node -e "const m=require('$SRC/tour-wisp/marks.json');process.stdout.write(((m.steps[4] ?? m.end)/1000).toFixed(3))")
  tsp=$(awk -v e="$tcut" 'BEGIN{printf "%.3f", e/10.5}')
  segment "tour-wisp" "$SRC/tour-wisp.mp4" "$WORK/tour_wisp.mp4" "$tsp" 0 "$tcut" "" "white" x
  printf "file 'tour_wisp.mp4'\nfile 'tag.mp4'\n" >"$WORK/tour_wisp.txt"
fi

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

card "$WORK/end.mp4" 3.2 "try Nostr" "no keys, no install" "sandstr.app"
card "$WORK/tag.mp4" 1.5 ""          ""                    "sandstr.app"

# ---- assemble ------------------------------------------------------------------
encode() { # list out
  ffmpeg -v error -y -f concat -safe 0 -i "$1" \
    -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
    -map 0:v -map 1:a -shortest \
    -c:v libx264 -crf 21 -preset slow -profile:v high -level 4.0 -pix_fmt yuv420p \
    -g 60 -movflags +faststart -c:a aac -b:a 48k "$2"
}

# One item is either a loop (four phase files) or a switch (one file).
listItems() { # listfile item...
  local list=$1; shift
  for item in "$@"; do
    case "$item" in
      sw-*) echo "file '${item}_x.mp4'" >>"$list" ;;
      *)    for p in a t b d; do echo "file '${item}_${p}.mp4'" >>"$list"; done ;;
    esac
  done
}

cut() { # name intro1 intro2 item...
  local name=$1 i1=$2 i2=$3; shift 3
  card "$WORK/intro_${name}.mp4" 2.2 "$i1" "$i2" ""
  : >"$WORK/cut_${name}.txt"
  echo "file 'intro_${name}.mp4'" >>"$WORK/cut_${name}.txt"
  listItems "$WORK/cut_${name}.txt" "$@"
  echo "file 'end.mp4'" >>"$WORK/cut_${name}.txt"
  encode "$WORK/cut_${name}.txt" "$OUT/sandstr-faq-${name}.mp4"
}

cut a "Every client" "is different." "${CUT_A[@]}"
cut b "It is not the app." "It is Nostr." "${CUT_B[@]}"

# One clip per question — this is what actually gets posted into a thread where
# somebody asked that exact thing.
for row in "${LOOPS[@]}"; do
  IFS='|' read -r id _ <<<"$row"
  : >"$WORK/one_${id}.txt"
  listItems "$WORK/one_${id}.txt" "$id"
  echo "file 'tag.mp4'" >>"$WORK/one_${id}.txt"
  encode "$WORK/one_${id}.txt" "$OUT/sandstr-faq-${id}.mp4"
done

# Hero loop for the landing page: no captions — the page has words. The
# disclaimer stays, because it is not decoration.
IFS='|' read -r hid _ _ hD <<<"${LOOPS[0]}"
hty=$(mark "$hid" typing); hq=$(mark "$hid" question)
hd=$(mark "$hid" demo);    ht=$(dur "$SRC/${hid}.mp4")
read -r sOpen sWait sD <<<"$(awk -v t="$hty" -v q="$hq" -v d="$hd" -v e="$ht" \
  -v o="$T_OPEN" -v w="$T_WAIT" -v dd="$hD" \
  'BEGIN{printf "%.3f %.3f %.3f", t/o, (d-q)/w, (e-d)/dd}')"
segment "$hid" "$SRC/${hid}.mp4" "$WORK/hero_a.mp4" "$sOpen" 0      "$hty" "" white a
segment "$hid" "$SRC/${hid}.mp4" "$WORK/hero_t.mp4" "1.0"    "$hty" "$hq"  "" white t
segment "$hid" "$SRC/${hid}.mp4" "$WORK/hero_b.mp4" "$sWait" "$hq"  "$hd"  "" white b
segment "$hid" "$SRC/${hid}.mp4" "$WORK/hero_d.mp4" "$sD"    "$hd"  "$ht"  "" white d
printf "file 'hero_a.mp4'\nfile 'hero_t.mp4'\nfile 'hero_b.mp4'\nfile 'hero_d.mp4'\n" >"$WORK/hero.txt"
encode "$WORK/hero.txt" "$OUT/sandstr-faq-hero.mp4"

if [ -s "$WORK/tour_wisp.txt" ]; then encode "$WORK/tour_wisp.txt" "$OUT/sandstr-tour-wisp.mp4"; fi

ls -lh "$OUT" | grep -E "faq|tour"
