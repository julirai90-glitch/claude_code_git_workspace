#!/bin/bash
# Rohschnitt «Wanderung» 9:16: Foto- und Video-Clips 1080x1920, 25 fps, ohne Ton, dann Zusammenschnitt mit dem Luftbild.
# Fotos: langsamer Schwenk über ein auf Cover skaliertes Bild. Medien liegen ausserhalb des Repos.
# usage: GEO=~/geo LUFTBILD=~/geo/out/teile/luftbild_ohne_abspann.mp4 TG_FONTS=~/geo/fonts bash clips.sh
set -e
GEO=${GEO:-~/geo}; LUFTBILD=${LUFTBILD:-$GEO/out/teile/luftbild_ohne_abspann.mp4}
F=$GEO/auswahl/fotos; V=$GEO/auswahl/videos; O=$GEO/rohschnitt; mkdir -p $O
enc="-c:v libx264 -pix_fmt yuv420p -crf 18 -r 25 -an"
photo() { # name datei dauer richtung (lr | rl | at:<Bildanteil>; Hochformat: immer von oben nach unten)
  local w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 $2) h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 $2)
  local vf
  if [ $w -gt $h ]; then  # Quer: auf 1920 Höhe, horizontal schwenken (max. 500 px, mittig)
    local x0='(iw-1080)/2-250' x1='(iw-1080)/2+250'; [ "$4" = rl ] && { x0='(iw-1080)/2+250'; x1='(iw-1080)/2-250'; }
    case "$4" in at:*) local c=${4#at:}; x0="iw*$c-540-80"; x1="iw*$c-540+80";; esac   # Motiv bei Bildanteil c zentriert
    vf="scale=-2:1920,crop=1080:1920:x='$x0+($x1-($x0))*t/$3':y=0"
  else                     # Hoch: auf 2150 Höhe (12 % über Cover), von oben nach unten schwenken
    vf="scale=-2:2150,crop=1080:1920:x=(iw-1080)/2:y='(ih-1920)*t/$3'"
  fi
  ffmpeg -v error -y -loop 1 -t $3 -i $2 -vf "$vf,setsar=1,fade=in:st=0:d=0.3,fade=out:st=$(echo "$3-0.3"|bc):d=0.3" $enc $O/$1.mp4
  echo $O/$1.mp4 >> $O/liste.txt
}
video() { # name datei start dauer
  ffmpeg -v error -y -ss $3 -t $4 -i $2 -vf "scale=1080:1920,setsar=1,fade=in:st=0:d=0.3,fade=out:st=$(echo "$4-0.3"|bc):d=0.3" $enc $O/$1.mp4
  echo $O/$1.mp4 >> $O/liste.txt
}
: > $O/liste.txt
photo 00_auftakt_eis_20 $F/20.jpg 3 at:0.55        # Auftakt: Eis aus der Gletscherhöhle, Ziel der Wanderung
echo $LUFTBILD >> $O/liste.txt
photo 02_talweg_01 $F/01.jpg 2.5 lr
photo 02_talweg_02 $F/02.jpg 2.5 rl
photo 02_talweg_03 $F/03.jpg 3
video 02_talweg_vid01 $V/01.mp4 1 3
photo 03_vorfeld_08_pfahl1980 $F/08.jpg 3.5 at:0.66
photo 03_vorfeld_04_rueckblick $F/04.jpg 3.5 lr
photo 03_vorfeld_07_moraene $F/07.jpg 3 lr
photo 04_bach_10 $F/10.jpg 2.5 rl
video 04_see_vid03 $V/03.mp4 2 3
photo 05_steinschlag_09 $F/09.jpg 3 at:0.70
photo 06_eis_11_zunge $F/11.jpg 3.5 lr
photo 06_eis_13 $F/13.jpg 3 rl
video 06_eis_vid08 $V/08.mp4 3 3
photo 06_eis_18 $F/18.jpg 3 lr
python3 -I "$(dirname "$0")/abspann.py" $O/abspann.png
ffmpeg -v error -y -loop 1 -t 4 -i $O/abspann.png -vf "fade=in:st=0:d=0.4,setsar=1" $enc $O/07_abspann.mp4
echo $O/07_abspann.mp4 >> $O/liste.txt
sed "s|.*|file '&'|" $O/liste.txt > $O/concat.txt
ffmpeg -v error -y -f concat -safe 0 -i $O/concat.txt -vf "fps=25,setsar=1,format=yuv420p" -c:v libx264 -crf 18 -movflags +faststart -an $O/morteratsch_rohschnitt_wanderung_9x16.mp4
echo "fertig: $O/morteratsch_rohschnitt_wanderung_9x16.mp4"
