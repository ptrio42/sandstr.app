#!/usr/bin/env bash
# Build the comparison teaser (cut #3) from the take captured by capture-compare.mjs.
#
#   ./build-teaser-compare.sh              -> out/sandstr-compare.mp4         (1080x1920, with the bed)
#                                             out/sandstr-compare-mute.mp4    (same picture, no audio)
#   SWITCH=arrows ./build-teaser-compare.sh -> out/sandstr-compare-arrows.mp4 (+ -arrows-mute.mp4)
#
# The two variants differ only in how the shelf is walked — the bottom sheet
# (two taps) or the compact bar's prev/next arrows (one tap). Both are 16 bars
# and share the same bed: the arrows buy the clients time back from the
# transitions (2.25s + 0.75s instead of 2.0s + 1.0s), so the section boundaries
# the music is written to do not move. 0.75s and not 0.5s because the transition
# beat is where the "you are now in X" pill is legible — at 0.5s that beat ran
# at 4x on the slowest mount and the name went past unread.
#
# ONE note, typed once, then carried through five clients and finally shown in
# all eight side by side. Beats and reasoning: docs/clips/compare-teaser.md.
#
# Deliberately DIFFERENT from cuts #1 and #2 in one respect: **no captions.**
# The words live in the note the video is posted with, so the frame stays the
# product. What is still burned in is the series' furniture — the brand lockup,
# sandstr.app, and the disclaimer strip, which is not optional (CLAUDE.md,
# branding section) and is redrawn on every single beat.
#
# Everything else is inherited unchanged from build-teaser.sh / build-teaser-faq.sh
# so the three cuts read as one series: same canvas, same 860x1550 card, same
# ambient backdrop, same footer. The capture viewport was chosen to match the
# card exactly, so nothing in the phone beats is ever rescaled.
#
# Speed is per PHASE and the typing plays at 1.0x, for the reason the FAQ cut
# learned the hard way: a message appearing at ~12ms/char reads as fake before
# anything else registers. What gets compressed is the furniture around it —
# opening the sheet, the switcher sheets, and the walk out to /compare.
#
# EVERY BEAT IS A WHOLE NUMBER OF FRAMES AND THE WHOLE CUT IS 16 BARS.
# The bed (make-bed.mjs) is 120 BPM, bar = 2.0s, 32.0s total, and its section
# boundaries are these beat boundaries — the kit enters on the frame the note
# lands on the feed. Sync is by construction, not by nudging: each beat is
# encoded with `-frames:v` at exactly target*30 frames, so the segments cannot
# accumulate the ~30ms of rounding that -ss/-to alone leaves behind. The build
# asserts the total at the end; if that assert fires, the film and the music
# have drifted and the numbers below no longer add up to 16 bars.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/.work/compare"
OUT="$HERE/out"
WORK="$HERE/.work/compare-cut"
SHOTS="$HERE/shots"
mkdir -p "$OUT" "$WORK"

MODE="${SWITCH:-sheet}"
case "$MODE" in
  # 0.8 + 2.2, not 0.75 + 2.25: both have to be a WHOLE number of frames at
  # 30fps and 0.75s is 22.5 of them. The halves rounded up, four transitions
  # and four client beats each gained one, and the cut ran 4 frames past 16
  # bars while every assert still passed. 24 + 66 = 90 = 3.0s exactly.
  arrows) SUFFIX="-arrows"; T_FIRST=2.0; T_CLIENT=2.2; T_SW=0.8 ;;
  sheet)  SUFFIX="";        T_FIRST=2.0; T_CLIENT=2.0; T_SW=1.0 ;;
  *) echo "  ! SWITCH must be 'sheet' or 'arrows', got '$MODE'"; exit 1 ;;
esac

IN="$SRC/compare${SUFFIX}.mp4"
MARKS="$SRC/marks${SUFFIX}.json"
[ -s "$IN" ] || { echo "  ! missing $IN — run: SWITCH=$MODE node docs/clips/capture-compare.mjs"; exit 1; }
[ -s "$MARKS" ] || { echo "  ! missing $MARKS — run: SWITCH=$MODE node docs/clips/capture-compare.mjs"; exit 1; }

BOLD="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REG="/System/Library/Fonts/Supplemental/Arial.ttf"

# ---- frame layout (1080x1920) — same constants as the other two cuts ---------
CANW=1080; CANH=1920
CARDW=860; CARDH=1550; CARDX=110; CARDY=200; CARDR=40
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
MASK_CARD="$WORK/mask_${CARDW}x${CARDH}r${CARDR}.png"; mask "$CARDW" "$CARDH" "$CARDR" "$MASK_CARD"

# No caption line here — see the header. The lockup, the URL and the disclaimer
# are the whole of the burned-in text.
CHROME="drawtext=fontfile='${BOLD}':text='sandstr.app':fontsize=40:fontcolor=${ACCENT}:x=${CANW}-${CARDX}-tw:y=${FOOTY}+8:shadowcolor=black@0.6:shadowx=0:shadowy=2,\
drawtext=fontfile='${REG}':text='${DISCLAIMER}':fontsize=26:fontcolor=${MUTED}:x=${CARDX}:y=${DISCY}"

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
# `tr -dc` because csv=p=0 still emits the field separator, so this prints "60,".
nframes() { ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of csv=p=0 "$1" | tr -dc '0-9'; }

# A time in SECONDS from: a literal number, a mark name, or `mark+offset`.
# The offset form exists for the typing beat, whose end is not an event — it is
# "the last character, plus a moment" — and whose length has to be exact because
# it is the one beat that must play at 1.0x.
mark() {
  local spec=$1 name off
  case "$spec" in
    *+*) name="${spec%%+*}"; off="${spec#*+}" ;;
    *)   name="$spec"; off=0 ;;
  esac
  case "$name" in
    ''|*[!0-9.]*) node -p "require('$MARKS').marks[$(printf '%s' "\"$name\"")]/1000 + $off" ;;
    *) awk -v a="$name" -v b="$off" 'BEGIN{printf "%.4f", a+b}' ;;
  esac
}

TOTAL="$(dur "$IN")"

# ---- the beats ---------------------------------------------------------------
# name | from | to | seconds it should last in the cut
#
# `from`/`to` are mark names from marks.json, or literal seconds. The speed is
# derived, so a re-capture with different pauses still builds to these lengths.
#
# Why these numbers:
#   - typing at 1.0x is the one phase with no target; it plays as recorded.
#   - each client gets ~2.2s, the switcher that reaches it ~0.8s. The first take
#     had that ratio backwards and the sheet was on screen longer than the app.
#   - a switch beat runs `client:` -> `mount:`, i.e. the transition itself. The
#     window from `mount:` to `feed:` is the welcome toast waiting itself out and
#     belongs to neither beat: cut through it and the switcher plays at 6x,
#     which is a blur rather than a glimpse.
#   - `hop` is the walk out to /compare through the shelf. It is not the subject,
#     but cutting it entirely loses the only frame that says this is one site,
#     so it flies past instead.
#   - the payoff pan is close to real speed: it is the shot the cut exists for.
#
# The right-hand column is the running total in seconds, i.e. where the beat ends
# in the finished film. Bar lines are every 2.0s.
BEATS=(
  "open|0.30|typing|2.0"              #  2.0
  "typing|typing|typing+4.5|4.5"      #  6.5   1.0x by construction
  "apply|typing+4.5|feed:damus|1.5"   #  8.0   <- bar 5: the note lands, the kit enters
  "damus|feed:damus|client:amethyst|$T_FIRST"
  "sw1|client:amethyst|mount:amethyst|$T_SW"
  "amethyst|feed:amethyst|client:yakihonne|$T_CLIENT"
  "sw2|client:yakihonne|mount:yakihonne|$T_SW"
  "yakihonne|feed:yakihonne|client:wisp|$T_CLIENT"
  "sw3|client:wisp|mount:wisp|$T_SW"
  "wisp|feed:wisp|client:nostur|$T_CLIENT"
  "sw4|client:nostur|mount:nostur|$T_SW"
  "nostur|feed:nostur|lastClientEnd|$T_CLIENT"    # 22.0 either way
  "hop|shelf|cards|2.0"               # 24.0  <- bar 13: the cut to the strip, the drop
  "cards|cards|scroll|2.0"            # 26.0
  "pan|scroll|end|5.0"                # 31.0
  "tail|end|$TOTAL|1.0"               # 32.0  = 16 bars
)
BARS_TOTAL=32.0

# Render one beat into a composited 1080x1920 segment of EXACTLY n frames.
#
# The decode window is read 0.25s long on purpose: `-frames:v` is what pins the
# length, and a window that yields one frame fewer than asked would shorten the
# segment and drift everything after it against the music.
# One beat -> exactly `frames` frames at 30fps.
#
# `tpad=clone` holds the last frame when the source runs out. Only the tail beat
# can hit that — it ends at the end of the take, so the 0.25s of read-ahead slack
# below asks for video that does not exist and the segment lands a frame short.
# That failed the whole build over one frame of a HELD shot. `-frames:v` still
# caps every segment, so no beat can grow past its target.
beat() { # name ss to speed frames out
  local name=$1 ss=$2 to=$3 speed=$4 frames=$5 out=$6
  local pad; pad="$(awk -v t="$to" 'BEGIN{printf "%.4f", t+0.25}')"
  ffmpeg -v error -y -ss "$ss" -to "$pad" -i "$IN" -i "$MASK_CARD" -i "$SHOTS/lockup.png" \
    -filter_complex "\
[0:v]setpts=(PTS-STARTPTS)/${speed},fps=30,tpad=stop_mode=clone:stop_duration=1,format=gbrp[c];\
[c]split[c1][c2];\
[c1]${AMBIENT}[bg];\
[c2]format=yuva444p[fgs];\
[1:v]format=gray[mk];\
[fgs][mk]alphamerge[fg];\
[2:v]${LOCKUP}[lk];\
[bg][fg]overlay=${CARDX}:${CARDY}:format=auto[v1];\
[v1][lk]overlay=${CARDX}:${FOOTY}:format=auto[v2];\
[v2]${CHROME},format=yuv420p[v]" \
    -map "[v]" -an -frames:v "$frames" -c:v libx264 -crf 17 -preset medium -r 30 "$out"
}

echo "  · source: $(printf '%.1f' "$TOTAL")s raw, switching: ${MODE}, note $(node -p "JSON.stringify(require('$MARKS').note)")"
BED="$SRC/bed.wav"
node "$HERE/make-bed.mjs" "$BED"

LIST="$WORK/concat.txt"; : > "$LIST"
CUM=0
for row in "${BEATS[@]}"; do
  IFS='|' read -r name from to target <<<"${row%%#*}"
  target="${target%% *}"
  ss="$(mark "$from")"; ee="$(mark "$to")"
  span="$(awk -v a="$ss" -v b="$ee" 'BEGIN{printf "%.4f", b-a}')"
  speed="$(awk -v s="$span" -v t="$target" 'BEGIN{printf "%.4f", s/t}')"
  frames="$(awk -v t="$target" 'BEGIN{printf "%d", t*30+0.5}')"
  # The header's invariant, actually enforced. A target that is not a whole
  # number of frames rounds silently here, and `CUM` below still adds up
  # because it sums the DECIMAL targets — so the film drifts off the bed while
  # the totals assert says everything is fine.
  awk -v t="$target" 'BEGIN{exit (t*30 == int(t*30)) ? 0 : 1}' || {
    echo "  ! ${name}: target ${target}s is $(awk -v t="$target" 'BEGIN{printf "%.1f", t*30}') frames at 30fps, not a whole number"; exit 1; }
  out="$WORK/${name}.mp4"
  beat "$name" "$ss" "$ee" "$speed" "$frames" "$out"
  got="$(nframes "$out")"
  [ "$got" = "$frames" ] || { echo "  ! ${name}: got ${got} frames, wanted ${frames}"; exit 1; }
  CUM="$(awk -v a="$CUM" -v b="$target" 'BEGIN{printf "%.2f", a+b}')"
  printf "file '%s'\n" "$out" >> "$LIST"
  printf '    %-9s %6.2f→%6.2f  x%-6.2f  %4.1fs  ends %5.1fs%s\n' \
    "$name" "$ss" "$ee" "$speed" "$target" "$CUM" \
    "$(awk -v c="$CUM" 'BEGIN{print (c==int(c/2)*2)? "  | bar line" : ""}')"
done

# Sync is by construction; this is the assert that says so out loud.
awk -v a="$CUM" -v b="$BARS_TOTAL" 'BEGIN{exit (a==b)?0:1}' || {
  echo "  ! beats total ${CUM}s, the bed is ${BARS_TOTAL}s — they would drift"; exit 1; }

MUTE="$OUT/sandstr-compare${SUFFIX}-mute.mp4"
FINAL="$OUT/sandstr-compare${SUFFIX}.mp4"
ffmpeg -v error -y -f concat -safe 0 -i "$LIST" -c copy -movflags +faststart "$MUTE"

# Count the PICTURE, and count it before the mux. `-shortest` trims the final
# file to the bed, so a film that is long by a few frames comes out looking
# exactly right there — which is how 4 frames of drift survived a green build.
CFRAMES="$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$MUTE" | tr -dc '0-9')"
WANT="$(awk -v b="$BARS_TOTAL" 'BEGIN{printf "%d", b*30}')"
[ "$CFRAMES" = "$WANT" ] || {
  echo "  ! picture is ${CFRAMES} frames, 16 bars is ${WANT} — the cut would drift off the bed"; exit 1; }

ffmpeg -v error -y -i "$MUTE" -i "$BED" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$FINAL"

VD="$(dur "$FINAL")"; AD="$(dur "$BED")"
awk -v v="$VD" -v a="$AD" 'BEGIN{exit (v-a<0.05 && a-v<0.05)?0:1}' || {
  echo "  ! picture $(printf '%.2f' "$VD")s vs bed $(printf '%.2f' "$AD")s"; exit 1; }

echo
echo "  $FINAL       $(printf '%.1f' "$VD")s  $(du -h "$FINAL" | cut -f1)  picture + bed, in sync"
echo "  $MUTE  $(printf '%.1f' "$(dur "$MUTE")")s  $(du -h "$MUTE" | cut -f1)  no audio — drop your own track on it"
