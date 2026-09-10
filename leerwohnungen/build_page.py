# -*- coding: utf-8 -*-
"""Inlines data.json into the page and embed templates (they work offline, no server)."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# template -> output, and which top-level keys of data.json it needs (None = all)
TARGETS = [
    ("template.html", "index.html", None),
    ("embed-karte.tpl.html", "embed-karte.html", ("meta", "gemeinden", "geo")),
    ("embed-verlauf.tpl.html", "embed-verlauf.html", ("meta", "kanton_reihe")),
    ("embed-tabelle.tpl.html", "embed-tabelle.html", ("meta", "gemeinden")),
]

with open(os.path.join(HERE, "data.json"), encoding="utf-8") as f:
    data = json.load(f)

for tpl, out, keys in TARGETS:
    with open(os.path.join(HERE, tpl), encoding="utf-8") as f:
        html = f.read()
    if "/*__DATA__*/" not in html:
        raise SystemExit(f"placeholder /*__DATA__*/ missing in {tpl}")
    payload = data if keys is None else {k: data[k] for k in keys}
    html = html.replace("/*__DATA__*/", json.dumps(payload, ensure_ascii=False, separators=(",", ":")))
    with open(os.path.join(HERE, out), "w", encoding="utf-8") as f:
        f.write(html)
    print(f"wrote {out} — {len(html)//1024} KB")

meta = data["meta"]
print(f"Stand {meta['stichtag']}, Kanton {meta['kanton_ziffer']}%")
