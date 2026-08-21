"""
Standalone embed: frontal collision share by canton.

Self-contained single file, no external assets, sized for a CMS iframe. Bern is
marked as the honest reference: it has practically the same road-network mix as
Graubünden (57.8% vs 56.9% main roads in the accident record) yet only a third of
the frontal share — which is what rules out "GR simply has more rural roads".

Run:  python _research/build_embed_frontal.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
OUT = os.path.join(ROOT, "..", "unfall-hotspots", "embed-frontalkollisionen.html")

src = open(os.path.join(ROOT, "unfallmuster-praettigau.html"), encoding="utf-8").read()
i = src.index("const K=")
j = src.index(";\n", i)
K = json.loads(src[i + 8:j])
swiss = K["swiss"]

payload = json.dumps({"cantons": swiss["cantons"], "ch": swiss["ch_pct"]}, ensure_ascii=False)

HTML = """<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Frontalkollisionen im Kantonsvergleich</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap">
<style>
:root{
  --surface:#ffffff; --rule:#dde4e9; --rule-soft:#eef2f5;
  --ink:#14202a; --ink-2:#4a5b68; --ink-3:#71838f;
  --s1:#0068a4; --s2:#ee7733; --mut:#c3ccd3;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--surface)}
body{
  font-family:"Source Sans 3",system-ui,-apple-system,"Segoe UI",sans-serif;
  color:var(--ink); font-size:16px; line-height:1.55;
}
.wrap{padding:14px 16px 18px}
.sub{color:var(--ink-2); font-size:14px; margin:0 0 14px; max-width:62ch}
.legend{display:flex; gap:16px; flex-wrap:wrap; align-items:center; margin-bottom:12px}
.lg{display:inline-flex; align-items:center; gap:7px; font-size:13px; color:var(--ink-2)}
.sw{width:12px; height:12px; border-radius:2px; flex:none}
.dash{width:14px;height:0;border-top:2px dashed var(--ink-3);flex:none}
.chart{width:100%}
svg{display:block; max-width:100%; height:auto}
.tick{font-size:12px; fill:var(--ink-3)}
.val{font-size:12px; fill:var(--ink-2); font-variant-numeric:tabular-nums}
.val-hi{fill:var(--ink); font-weight:700}
.kt-hi{fill:var(--ink); font-weight:700}
.grid{stroke:var(--rule-soft); stroke-width:1}
.axis{stroke:var(--rule); stroke-width:1}
.baseline{stroke:var(--ink-3); stroke-width:1.5; stroke-dasharray:3 3}
.src{font-size:12px; color:var(--ink-3); border-top:1px solid var(--rule-soft);
     padding-top:10px; margin:14px 0 0}
.tip{position:fixed; pointer-events:none; z-index:9; opacity:0;
  transform:translate(-50%,-100%); background:#fff; color:var(--ink);
  border:1px solid var(--rule); border-radius:3px; box-shadow:0 4px 14px rgba(20,32,42,.15);
  padding:8px 11px; font-size:13px; line-height:1.4; white-space:nowrap; transition:opacity .09s}
.tip b{font-variant-numeric:tabular-nums}
.hit{cursor:crosshair}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="wrap">
  <p class="sub">Anteil Frontalkollisionen an allen Unf&auml;llen mit Personenschaden auf Hauptstrassen, 2011&ndash;2025. Ber&uuml;cksichtigt sind Kantone mit mindestens 300 Unf&auml;llen.</p>
  <div class="legend">
    <span class="lg"><span class="sw" style="background:var(--s2)"></span>Graub&uuml;nden</span>
    <span class="lg"><span class="sw" style="background:var(--s1)"></span>Bern &ndash; &auml;hnliches Strassennetz</span>
    <span class="lg"><span class="dash"></span>Schweizer Durchschnitt</span>
  </div>
  <div class="chart"><svg id="c" role="img" aria-label="Balkendiagramm: Anteil Frontalkollisionen je Kanton, Graub&uuml;nden mit Abstand an der Spitze"></svg></div>
  <p class="src">Quelle: Bundesamt f&uuml;r Strassen ASTRA, Strassenverkehrsunfallorte. Grafik: S&uuml;dostschweiz</p>
</div>
<div class="tip" id="tip" role="status" aria-live="polite"></div>
<script>
const D = __DATA__;
const tip = document.getElementById('tip');
function showTip(e, html){ tip.innerHTML = html; tip.style.opacity='1';
  tip.style.left = e.clientX+'px'; tip.style.top = (e.clientY-12)+'px'; }
function hideTip(){ tip.style.opacity='0'; }
const NS='http://www.w3.org/2000/svg';
function el(n,a){ const x=document.createElementNS(NS,n); for(const k in (a||{})) x.setAttribute(k,a[k]); return x; }
function de(s){ return String(s).replace('.', ','); }

function barPath(x,y,w,h,r){
  r=Math.min(r,h/2,w);
  return 'M'+x+','+y+' H'+(x+w-r)+' A'+r+','+r+' 0 0 1 '+(x+w)+','+(y+r)+
         ' V'+(y+h-r)+' A'+r+','+r+' 0 0 1 '+(x+w-r)+','+(y+h)+' H'+x+' Z';
}

function draw(){
  const W = document.querySelector('.chart').clientWidth || 640;
  const narrow = W < 420;
  const L = narrow ? 30 : 36, R = narrow ? 44 : 50, T = 6, B = 28;
  const BAR = narrow ? 11 : 12, ROW = narrow ? 17 : 19;
  const rows = D.cantons;
  const H = T + rows.length*ROW + B;
  const iw = W - L - R, max = 16;
  const svg = document.getElementById('c');
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.textContent='';

  for(let v=0; v<=max; v+=4){
    const x = L + iw*v/max;
    svg.appendChild(el('line',{x1:x,y1:T,x2:x,y2:T+rows.length*ROW, class: v===0?'axis':'grid'}));
    const t = el('text',{x:x, y:H-9, class:'tick','text-anchor':'middle'});
    t.textContent = v+'%'; svg.appendChild(t);
  }
  const cx = L + iw*D.ch/max;
  svg.appendChild(el('line',{x1:cx,y1:T,x2:cx,y2:T+rows.length*ROW,class:'baseline'}));

  rows.forEach(function(r,i){
    const y = T + i*ROW + 2;
    const gr = r.kt==='GR', be = r.kt==='BE';
    const lab = el('text',{x:L-8, y:y+BAR-2, class:(gr||be)?'kt-hi':'tick','text-anchor':'end'});
    lab.textContent = r.kt; svg.appendChild(lab);
    const w = iw*r.pct/max;
    const p = el('path',{d:barPath(L,y,w,BAR,4),
      fill: gr?'var(--s2)':(be?'var(--s1)':'var(--mut)'), class:'hit'});
    p.addEventListener('mousemove', function(e){
      showTip(e,'<b>'+r.kt+'</b>: '+r.frontal+' von '+r.n+' Unf\\u00e4llen<br><b>'+de(r.pct)+' %</b> Frontalkollisionen');
    });
    p.addEventListener('mouseleave', hideTip);
    svg.appendChild(p);
    const vt = el('text',{x:L+w+6, y:y+BAR-2, class:'val'+((gr||be)?' val-hi':'')});
    vt.textContent = de(r.pct)+'%'; svg.appendChild(vt);
  });

  const cl = el('text',{x:cx+5, y:T+rows.length*ROW-3, class:'tick'});
  cl.textContent = 'CH '+de(D.ch)+'%'; svg.appendChild(cl);
}
draw();
let t; addEventListener('resize', function(){ clearTimeout(t); t=setTimeout(draw,140); });
</script>
</body>
</html>
"""

open(OUT, "w", encoding="utf-8").write(HTML.replace("__DATA__", payload))
print("geschrieben:", os.path.relpath(OUT, os.path.join(ROOT, "..")))
print("Kantone:", len(swiss["cantons"]), "| CH-Schnitt:", swiss["ch_pct"])
