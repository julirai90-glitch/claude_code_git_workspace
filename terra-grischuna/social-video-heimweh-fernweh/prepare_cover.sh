#!/usr/bin/env bash
# Umschlag-PDF (2 Seiten: aussen U4|Rücken|U1, innen U2|Rücken|U3) -> pages/cover/u1.jpg, u2.jpg
set -euo pipefail
PDF="$1"; cd "$(dirname "$0")"; mkdir -p pages/cover
read W H < <(pdfinfo "$PDF" | awk '/Page size/{print $3, $5}')
DPI=300; PX=$(python3 -c "print(round($W*$DPI/72))"); PY=$(python3 -c "print(round($H*$DPI/72))"); PW=$(python3 -c "print(round(595.276*$DPI/72))")
pdftoppm -r $DPI -f 1 -l 1 -x $((PX-PW)) -y 0 -W $PW -H $PY -jpeg -jpegopt quality=92 -singlefile "$PDF" pages/cover/u1
pdftoppm -r $DPI -f 2 -l 2 -x 0 -y 0 -W $PW -H $PY -jpeg -jpegopt quality=92 -singlefile "$PDF" pages/cover/u2
ls -la pages/cover
