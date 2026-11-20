#!/bin/sh
# Raw OpenStreetMap features for the map (Overpass) -> <dir>/*.json (use a RAM directory, ~100 MB)
#   sh fetch_features.sh /dev/shm/osm && node build_features.mjs /dev/shm/osm
set -e; D=${1:-/dev/shm/osm}; mkdir -p "$D"; BB="46.48,8.40,47.49,9.72"; UA="schattenseite-build/1.0"
q() { curl -s -m 300 -A "$UA" --data-urlencode "data=[out:json][timeout:240];$2 out geom;" https://overpass-api.de/api/interpreter -o "$D/$1.json"; sleep 15; }
q rivers  "way[waterway~\"^(river|canal)$\"]($BB);"
q streams "way[waterway=stream][name]($BB);"
q lakes   "(way[natural=water][water~\"^(lake|reservoir)$\"]($BB);relation[natural=water][water~\"^(lake|reservoir)$\"]($BB););"
q rail    "way[railway~\"^(rail|narrow_gauge)$\"][\"service\"!~\".\"]($BB);"
q roads   "way[highway~\"^(motorway|trunk|primary)$\"]($BB);"
