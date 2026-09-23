"""
Let every embed report its own height to the page that frames it.

A fixed iframe height cannot work here: the same chart is 1658 px tall in a
360 px column and 2042 px in a 250 px one, because every label wraps one
line further. Whatever number goes into the embed code is wrong for some
column width, and the reader gets a scrollbar inside the article.

Each embed now measures itself and posts the height to its parent, on load,
on resize, and whenever the box changes — which covers the reader opening
the "Zahlen als Tabelle" panel. The parent needs four lines of JavaScript to
listen; without them nothing breaks, the embed simply keeps the height the
iframe tag gives it.

Run:  python _research/add_autoheight.py
"""
import glob
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..")

SNIPPET = """
/* ---- report our height to the embedding page -------------------------
   The host sets the iframe height from this; see the embed code in
   _research/artikel-geruest.md. Harmless when nobody listens. */
(function(){
  let last = 0;
  function report(){
    const h = Math.ceil(document.documentElement.getBoundingClientRect().height);
    if (h === last) return;                    // don't spam identical values
    last = h;
    try { parent.postMessage({ type: 'sos-embed-height', height: h }, '*'); }
    catch (e) { /* cross-origin parents may refuse; nothing we can do */ }
  }
  addEventListener('load', report);
  addEventListener('resize', report);
  if (window.ResizeObserver) new ResizeObserver(report).observe(document.body);
  document.addEventListener('toggle', report, true);   // <details> open/close
  report();
})();
"""

files = sorted(glob.glob(os.path.join(OUT, "glarus-embed-*.html")))
for path in files:
    h = open(path, encoding="utf-8").read()
    name = os.path.basename(path)
    if "sos-embed-height" in h:
        print(f"  schon drin: {name}")
        continue
    i = h.rindex("</script>")
    h = h[:i] + SNIPPET + h[i:]
    open(path, "w", encoding="utf-8").write(h)
    print(f"  ergänzt: {name}")
print(f"{len(files)} Embeds geprüft")
