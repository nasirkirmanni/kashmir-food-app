#!/bin/sh
# Encodes the homepage's opening film for scroll scrubbing.
#
#   sh scripts/encode-hero-scrub.sh            (run from frontend/, needs ffmpeg with libx264)
#
# The film is never played. components/hero/ScrollVideoHero.js seeks it to the frame that matches the
# scroll position, so what matters is how fast one arbitrary frame can be fetched and decoded:
#
#   keyint=24   A keyframe every second, at fixed places (no scene detection). To show a frame the
#               browser decodes from the keyframe before it, so this caps the work per seek at 24
#               frames. The master has a keyframe every two seconds at nine times the bit rate; with
#               hardware decoding off, Chrome took 77 ms a seek on it (13 frames a second) and takes
#               about 15 ms on this file. Keyframes are also where the bytes go, about half the file,
#               which is why they are not closer still.
#   bframes=0   Every frame depends only on frames before it, and frames sit in the file in the order
#               they are shown, so whatever has loaded so far can be shown in full. B-frames would
#               make the file about 8% smaller at the same quality (measured), at the price of
#               reordered frames and an edit list for browsers to interpret.
#   ref=4       Keeps the stream at level 3.1, which every hardware decoder takes.
#   crf 30      About 1.5 Mbit/s. The film runs under dark gradients and mostly in motion.
#   zones       The first two seconds are only ever seen through the hero's dark landing veil (82% black
#               at the top of the page, clear by 3.2 s), so they get fewer bits; the last two seconds
#               are the look the scroll comes to rest on (and the still shown to visitors who ask for
#               reduced motion), so they get more. Keep in step with dimOpacity in ScrollVideoHero.js.
#   no audio    The element is muted and never plays.
#   faststart   The index sits at the front of the file, so the first bytes are enough to begin.
#
# The page loads the result under a name with a version in it and tells browsers to keep it for a
# year (next.config.js). Changing the film therefore means a new name: raise the version here, in
# ScrollVideoHero.js and in next.config.js together.
set -eu

# The master is this script's input and nothing else. It is kept outside public/ so that the site
# does not serve it: no page loads it, and it is eight times the size of the film made from it.
MASTER="media-masters/hero.mp4"            # 1280x720, 24 frames a second, 240 frames
OUT="public/redesign/hero-scrub-v2.mp4"

ffmpeg -hide_banner -loglevel error -y -i "$MASTER" \
  -map 0:v:0 -an -map_metadata -1 \
  -c:v libx264 -preset veryslow -profile:v high -level:v 3.1 -pix_fmt yuv420p \
  -crf 30 \
  -x264-params "keyint=24:min-keyint=24:scenecut=0:bframes=0:ref=4:zones=0,23,b=0.6/24,47,b=0.75/192,239,b=1.3" \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -movflags +faststart \
  "$OUT"

ffprobe -v error -select_streams v:0 -count_frames \
  -show_entries stream=codec_name,profile,level,width,height,r_frame_rate,nb_read_frames:format=duration,size \
  -of default=noprint_wrappers=1 "$OUT"
