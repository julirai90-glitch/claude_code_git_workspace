#!/bin/sh
# Places (q1) and canton/municipal boundaries (q2) from OpenStreetMap via Overpass -> cache/places.json, cache/outline.json
set -e; mkdir -p cache
UA="schattenseite-nachtprojekt/1.0 (julianreich.ch)"
curl -s -A "$UA" --data-urlencode data@q1.txt https://overpass-api.de/api/interpreter -o cache/places_raw.json
curl -s -A "$UA" --data-urlencode data@q2.txt https://overpass-api.de/api/interpreter | node assign.mjs
node -e "const o=require('./cache/outline.json');require('fs').writeFileSync('../data/outline.js','// Canton and municipal boundaries (c) OpenStreetMap contributors, ODbL, simplified.\nwindow.OUTLINE='+JSON.stringify(o)+';\n')"
