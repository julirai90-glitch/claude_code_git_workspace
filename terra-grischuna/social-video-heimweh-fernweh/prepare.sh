#!/usr/bin/env bash
# Erzeugt alle Bild-Assets aus dem Revisions-PDF. Aufruf: ./prepare.sh /pfad/zu/tg0526.pdf
set -euo pipefail
PDF="$1"; cd "$(dirname "$0")"
mkdir -p pages/web pages/hi assets
pdftoppm -r 150 -jpeg -jpegopt quality=88 "$PDF" pages/web/p
for p in 1 4 8 9 14 18 27 35 68; do pdftoppm -r 300 -f $p -l $p -jpeg -jpegopt quality=93 "$PDF" pages/hi/h; done
# Geometrie (Kartenpunkte, Balken) erkennen + "leere" Diagrammflächen erzeugen
ln -sfn pages/hi hi; mkdir -p video && ln -sfn ../assets video/assets
python3 detect.py && python3 geo2.py && mv video/geo.json geo.json; rm -rf video hi
# Logo aus dem Impressum (S. 68) – siehe README
