# -*- coding: utf-8 -*-
"""Inlines data.json into template.html -> index.html (works offline, no server)."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(HERE, "data.json"), encoding="utf-8") as f:
    data = f.read()
with open(os.path.join(HERE, "template.html"), encoding="utf-8") as f:
    html = f.read()

if "/*__DATA__*/" not in html:
    raise SystemExit("placeholder /*__DATA__*/ missing in template.html")

out = html.replace("/*__DATA__*/", data)
with open(os.path.join(HERE, "index.html"), "w", encoding="utf-8") as f:
    f.write(out)

meta = json.loads(data)["meta"]
print(f"wrote index.html — {len(out)//1024} KB, Stand {meta['stichtag']}, "
      f"Kanton {meta['kanton_ziffer']}%")
