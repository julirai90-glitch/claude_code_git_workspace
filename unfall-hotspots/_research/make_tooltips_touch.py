"""
Make the chart tooltips work on touch screens.

Both chart embeds only listened for mousemove. Phones have no hover: after a tap
the browser fires one synthetic mousemove, so the tooltip appeared — but
mouseleave never came, so it stayed stuck until the next tap somewhere else.

Three changes per file:
  1. pointerdown as an additional trigger (covers touch and pen)
  2. a document-level pointerdown that closes the tooltip when tapping elsewhere
  3. horizontal clamping, so a tooltip near the screen edge stays fully visible
     instead of being cut off — the old code centred it on the finger position

Run:  python _research/make_tooltips_touch.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FILES = ["embed-saisonalitaet.html", "embed-frontalkollisionen.html"]

NEW_SHOWTIP = """function showTip(e, html){
  tip.innerHTML = html;
  tip.style.opacity = '1';
  /* keep the tooltip inside the viewport: it is centred on the pointer, so at
     the edges half of it would otherwise be cut off */
  const half = tip.offsetWidth / 2, vw = window.innerWidth;
  const x = Math.max(half + 6, Math.min(vw - half - 6, e.clientX));
  const y = Math.max(tip.offsetHeight + 8, e.clientY - 12);
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
}
/* tapping anywhere but a bar closes the tooltip — phones have no mouseleave */
document.addEventListener('pointerdown', function(e){
  if (!e.target.classList || !e.target.classList.contains('hit')) hideTip();
}, true);"""


def patch(path):
    h = open(path, encoding="utf-8").read()

    # 1. replace showTip with the clamping version
    i = h.index("function showTip(")
    j = h.index("function hideTip(")
    h = h[:i] + NEW_SHOWTIP + "\n" + h[j:]

    # 2. every mousemove listener also answers to pointerdown
    n = h.count("addEventListener('mousemove'")
    h = h.replace("addEventListener('mousemove'", "addEventListener('__EVT__'")
    # re-register: keep mousemove for mice, add pointerdown for touch
    h = h.replace(".addEventListener('__EVT__', function(e){",
                  ".addEventListener('mousemove', __tipHandler__);\n    "
                  "__LAST__.addEventListener('pointerdown', __tipHandler__);\n"
                  "    function __tipHandler__(e){")
    return h, n


# The generic rewrite above cannot know the element variable name, so do it
# per file with the concrete names instead.
REPL = {
    "embed-saisonalitaet.html": ("hit", "hit.addEventListener('mousemove', function(e){"),
    "embed-frontalkollisionen.html": ("p", "p.addEventListener('mousemove', function(e){"),
}

for fn in FILES:
    path = os.path.join(HERE, "..", fn)
    h = open(path, encoding="utf-8").read()

    i = h.index("function showTip(")
    j = h.index("function hideTip(")
    h = h[:i] + NEW_SHOWTIP + "\n" + h[j:]

    var, marker = REPL[fn]
    assert marker in h, fn
    h = h.replace(marker,
                  f"{var}.addEventListener('pointerdown', __tip_{var});\n"
                  f"    {var}.addEventListener('mousemove', __tip_{var});\n"
                  f"    function __tip_{var}(e){{", 1)

    open(path, "w", encoding="utf-8").write(h)
    print(f"{fn}: Touch-Handler gesetzt")
