"""
Standalone embed: accidents by month, motorcycles stacked on top.

The motorcycle share sits on top of the stack on purpose. The rest of the
accidents form a fairly steady base (varying by factor 1.6 across the year),
while motorcycle accidents swing by factor 27 — so putting them on top makes the
summer bulge read as what it is: a layer that grows and shrinks on a stable base.
Motorcycles account for 61% of the rise from March to August.

Run:  python _research/build_embed_saison.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
OUT = os.path.join(ROOT, "..", "unfall-hotspots", "embed-saisonalitaet.html")

src = open(os.path.join(ROOT, "unfallmuster-praettigau.html"), encoding="utf-8").read()
i = src.index("const K=")
j = src.index(";\n", i)
K = json.loads(src[i + 8:j])
payload = json.dumps(K["season"], ensure_ascii=False)

HTML = """<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Unfälle nach Monat</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap">
<style>
:root{
  --surface:#ffffff; --rule:#dde4e9; --rule-soft:#eef2f5;
  --ink:#14202a; --ink-2:#4a5b68; --ink-3:#71838f;
  --s1:#0068a4; --s2:#ee7733;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--surface)}
body{font-family:"Source Sans 3",system-ui,-apple-system,"Segoe UI",sans-serif;
  color:var(--ink); font-size:16px; line-height:1.55}
.wrap{padding:12px 16px 16px}
.legend{display:flex; gap:18px; flex-wrap:wrap; align-items:center; margin-bottom:12px}
.lg{display:inline-flex; align-items:center; gap:7px; font-size:13px; color:var(--ink-2)}
.sw{width:12px; height:12px; border-radius:2px; flex:none}
.chart{width:100%}
svg{display:block; max-width:100%; height:auto}
.tick{font-size:12px; fill:var(--ink-3)}
.grid{stroke:var(--rule-soft); stroke-width:1}
.axis{stroke:var(--rule); stroke-width:1}
.src{font-size:12px; color:var(--ink-3); border-top:1px solid var(--rule-soft);
     padding-top:10px; margin:14px 0 0}
.tip{position:fixed; pointer-events:none; z-index:9; opacity:0;
  transform:translate(-50%,-100%); background:#fff; color:var(--ink);
  border:1px solid var(--rule); border-radius:3px; box-shadow:0 4px 14px rgba(20,32,42,.15);
  padding:8px 11px; font-size:13px; line-height:1.4; white-space:nowrap; transition:opacity .09s}
.tip b{font-variant-numeric:tabular-nums}
.tip .t-m{font-weight:700; display:block; margin-bottom:3px}
.hit{cursor:crosshair}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="wrap">
  <div class="legend">
    <span class="lg"><span class="sw" style="background:var(--s2)"></span>mit Motorradbeteiligung</span>
    <span class="lg"><span class="sw" style="background:var(--s1)"></span>&uuml;brige Unf&auml;lle</span>
  </div>
  <div class="chart"><svg id="c" role="img" aria-label="S&auml;ulendiagramm: Unf&auml;lle nach Monat, Motorradunf&auml;lle als obere Schicht"></svg></div>
  <p class="src">Quelle: Bundesamt f&uuml;r Strassen ASTRA, Strassenverkehrsunfallorte. Grafik: S&uuml;dostschweiz</p>
</div>
<div class="tip" id="tip" role="status" aria-live="polite"></div>
<script>
const S = __DATA__;
const MN = ['Jan','Feb','M\\u00e4r','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const tip = document.getElementById('tip');
function showTip(e,h){ tip.innerHTML=h; tip.style.opacity='1';
  tip.style.left=e.clientX+'px'; tip.style.top=(e.clientY-12)+'px'; }
function hideTip(){ tip.style.opacity='0'; }
const NS='http://www.w3.org/2000/svg';
function el(n,a){ const x=document.createElementNS(NS,n); for(const k in (a||{})) x.setAttribute(k,a[k]); return x; }

/* rounded cap on top, square at the baseline */
function barPath(x,y,w,h,r){
  r=Math.min(r,w/2,h);
  return 'M'+x+','+(y+h)+' V'+(y+r)+' A'+r+','+r+' 0 0 1 '+(x+r)+','+y+
         ' H'+(x+w-r)+' A'+r+','+r+' 0 0 1 '+(x+w)+','+(y+r)+' V'+(y+h)+' Z';
}

function draw(){
  const W = document.querySelector('.chart').clientWidth || 640;
  const narrow = W < 430;
  const L = narrow ? 34 : 44, R = 10, T = 12, B = 34;
  const H = narrow ? 240 : 290;
  const iw = W-L-R, ih = H-T-B;
  const max = 1000, GAP = 2;
  const bw = Math.min(narrow ? 20 : 34, iw/12 - (narrow ? 4 : 8));
  const xAt = i => L + iw*(i+0.5)/12 - bw/2;
  const yAt = v => T + ih - ih*v/max;
  const svg = document.getElementById('c');
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  svg.setAttribute('width',W); svg.setAttribute('height',H);
  svg.textContent='';

  for(let v=0; v<=max; v+=250){
    svg.appendChild(el('line',{x1:L,y1:yAt(v),x2:W-R,y2:yAt(v),class: v===0?'axis':'grid'}));
    const t=el('text',{x:L-8,y:yAt(v)+4,class:'tick','text-anchor':'end'});
    t.textContent=v; svg.appendChild(t);
  }

  S.forEach(function(d,i){
    const rest = d.all - d.moto;
    /* base first: the steady part of the year */
    svg.appendChild(el('path',{d:barPath(xAt(i), yAt(rest), bw, ih*rest/max, 4),
      fill:'var(--s1)'}));
    /* motorcycles on top: the layer that makes the summer bulge */
    if(d.moto>0){
      svg.appendChild(el('path',{d:barPath(xAt(i), yAt(d.all), bw, ih*d.moto/max, 4),
        fill:'var(--s2)'}));
      svg.appendChild(el('rect',{x:xAt(i), y:yAt(rest)-GAP, width:bw, height:GAP,
        fill:'var(--surface)'}));
    }
    const t=el('text',{x:xAt(i)+bw/2, y:H-14, class:'tick','text-anchor':'middle'});
    t.textContent=MN[i]; svg.appendChild(t);
    const hit=el('rect',{x:xAt(i)-2, y:T, width:bw+4, height:ih, fill:'transparent', class:'hit'});
    hit.addEventListener('mousemove', function(e){
      showTip(e,'<span class="t-m">'+MN[i]+'</span><b>'+d.all+'</b> Unf\\u00e4lle<br>davon <b>'+
        d.moto+'</b> mit Motorrad');
    });
    hit.addEventListener('mouseleave', hideTip);
    svg.appendChild(hit);
  });
}
draw();
let t; addEventListener('resize', function(){ clearTimeout(t); t=setTimeout(draw,140); });
</script>
</body>
</html>
"""

open(OUT, "w", encoding="utf-8").write(HTML.replace("__DATA__", payload))
print("geschrieben:", os.path.basename(OUT))
