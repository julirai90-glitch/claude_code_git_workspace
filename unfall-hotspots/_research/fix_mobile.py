"""
Make the embed usable on phones.

Until now #panel was absolutely positioned on top of the map at every width; the
mobile media query only widened it, so on a phone it covered the whole map — the
reader saw controls and almost no map.

New on narrow screens: the map sits at the top with a fixed height, the controls
flow underneath. The controls are compacted too — categories in two columns
instead of four rows, legend on one line, and the two small explanatory lines
dropped (they repeat what the method panel already says).

Run:  python _research/fix_mobile.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "embed-kanton.html")

h = open(PAGE, encoding="utf-8").read()

# ---- hooks for the two inline-styled notes ------------------------------
OLD_STATNOTE = ('<div class="row" style="margin-top:-8px; font-size:11px; '
                'color:var(--muted);">Werte gelten f&uuml;r den ganzen Kanton')
NEW_STATNOTE = ('<div class="row statNote" style="margin-top:-8px; font-size:11px; '
                'color:var(--muted);">Werte gelten f&uuml;r den ganzen Kanton')
assert OLD_STATNOTE in h
h = h.replace(OLD_STATNOTE, NEW_STATNOTE, 1)

OLD_LEGNOTE = ('<div style="margin-top:6px; font-size:11px; color:var(--muted);">'
               'Cluster-Gr&ouml;sse')
NEW_LEGNOTE = ('<div class="legendNote" style="margin-top:6px; font-size:11px; '
               'color:var(--muted);">Cluster-Gr&ouml;sse')
assert OLD_LEGNOTE in h
h = h.replace(OLD_LEGNOTE, NEW_LEGNOTE, 1)

# ---- mobile layout ------------------------------------------------------
OLD = """@media (max-width: 640px) {
    #panel { width: calc(100vw - 24px); }
  }"""

NEW = """@media (max-width: 640px) {
    /* stack instead of overlay — the panel must not cover the map */
    #app { height:auto; min-height:100%; }
    #map {
      position:relative; top:0; left:0; right:0;
      height:300px; width:100%;
    }
    #panel {
      position:static; width:auto; max-height:none; overflow:visible;
      margin:8px 10px 10px; padding:12px 13px; border-radius:8px;
      box-shadow:none;
    }
    #panel .row { margin-bottom:10px; }
    #panel h2 { font-size:11.5px; margin-bottom:5px; }

    /* categories in two columns instead of four rows */
    #panel .catOption { display:inline-block; width:48%; font-size:12.5px; vertical-align:top; }

    /* tighter stat boxes, drop the note under them */
    #panel .stat { padding:6px 8px; }
    #panel .stat .num { font-size:18px; }
    #panel .stat .lbl { font-size:9.5px; }
    #panel .statNote { display:none; }

    /* legend on one line, drop its footnote */
    #panel #legend > div { display:inline-block; margin-right:13px; font-size:11.5px; }
    #panel .legendNote { display:none; }

    .credit { display:none; }
    header { padding-left:10px; padding-right:10px; }
  }"""

assert OLD in h
h = h.replace(OLD, NEW, 1)

open(PAGE, "w", encoding="utf-8").write(h)
print("Mobile-Layout gesetzt: Karte oben (300 px), Bedienung darunter.")
