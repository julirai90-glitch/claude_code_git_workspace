import json,math,statistics
from xml.sax.saxutils import escape as e
D=json.load(open('final.json'));K=json.load(open('kanton.json'))['results'][0]['geometry']['coordinates']
OUT='/home/user/claude_code_git_workspace/ausgaben/print/sagenkarte/'
CAT=[('TEU','Teufel & Hölle','#C0392B'),('HEX','Hexen','#7B3294'),('SAG','Feen, Fänggen, Drachen','#1a9e5a'),
     ('UNH','Unheimliches & Tod','#EE7733'),('KUL','Heidnische Kultstätten','#0068A4'),('RIC','Richtstätten','#333333')]
C={k:c for k,_,c in CAT}
E0,E1,N0,N1=2671000,2836000,1117000,1220000
MX,MY,MW=12,34,288; s=MW/(E1-E0); MH=(N1-N0)*s
px=lambda E,N:(MX+(E-E0)*s, MY+(N1-N)*s)
F="font-family:'Helvetica Neue',Arial,sans-serif"
o=[f'<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" style="{F}">',
 '<rect width="420" height="297" fill="#fff"/>',
 '<g id="hilfslinie-bund"><line x1="210" y1="0" x2="210" y2="297" stroke="#ccc" stroke-width="0.2" stroke-dasharray="2 2"/></g>']
# Titel
o+=['<g id="titel">','<text x="12" y="18" font-size="11" font-weight="700" fill="#1a1a1a">Wo der Teufel wohnt</text>',
 '<text x="12" y="25.5" font-size="4.2" fill="#555">61 Orts-, Flur- und Bergnamen in Graubünden, die von Hexen, Teufeln, Feen, Galgen und heidnischen Kulten erzählen</text>','</g>']
# Karte
d=''
for poly in K:
    for ring in poly:
        d+='M'+' L'.join('%.2f,%.2f'%px(x,y) for x,y in ring[::3])+' Z '
o.append(f'<g id="kanton"><path d="{d}" fill="#f3f3f3" stroke="#888" stroke-width="0.35"/></g>')
towns=[('Chur',2759500,1190700),('Davos',2783500,1186600),('St. Moritz',2784500,1152500),('Disentis',2708500,1173700),('Ilanz',2734500,1181900),
 ('Thusis',2753700,1173500),('Scuol',2816300,1186100),('Poschiavo',2802000,1134000),('Mesocco',2737600,1141300),('Zernez',2803000,1174800)]
o.append('<g id="orientierung-orte">')
for n,E,N in towns:
    x,y=px(E,N);o.append(f'<rect x="{x-0.7:.2f}" y="{y-0.7:.2f}" width="1.4" height="1.4" fill="#aaa"/><text x="{x+1.4:.2f}" y="{y+3.2:.2f}" font-size="2.6" fill="#999">{n}</text>')
o.append('</g>')
# Punkte, überlagerte Dorf-Punkte auffächern
from collections import defaultdict
grp=defaultdict(list)
for r in D: grp[(r['E_LV95'],r['N_LV95'])].append(r)
o.append('<g id="punkte">')
R=2.1
for (E,N),rs in grp.items():
    x0,y0=px(E,N)
    for k,r in enumerate(rs):
        x,y=x0,y0
        if len(rs)>1:
            a=2*math.pi*k/len(rs)-math.pi/2; x+=math.cos(a)*R*1.15; y+=math.sin(a)*R*1.15
        c=C[r['kategorie']];v=r['verortung']
        if v=='nur Ort':
            m=f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{R}" fill="#fff" stroke="{c}" stroke-width="0.5" stroke-dasharray="0.8 0.5"/>';tc=c
        else:
            m=f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{R}" fill="{c}" stroke="#fff" stroke-width="0.3"/>';tc='#fff'
        o.append(f'<g id="p{r["id"]}" data-name="{e(r["name"])}" data-verortung="{v}">{m}<text x="{x:.2f}" y="{y+0.85:.2f}" font-size="2.3" font-weight="700" text-anchor="middle" fill="{tc}">{r["id"]}</text></g>')
o.append('</g>')
# Massstab
x,y=px(2680000,1121500);L=20000*s
o.append(f'<g id="massstab"><line x1="{x}" y1="{y}" x2="{x+L}" y2="{y}" stroke="#555" stroke-width="0.4"/><text x="{x}" y="{y-1.2}" font-size="2.4" fill="#555">0</text><text x="{x+L}" y="{y-1.2}" font-size="2.4" fill="#555" text-anchor="end">20 km</text></g>')
# Legende
lx,ly=MX-178,MY+MH-62
o.append('<g id="legende">')
for i,(k,lab,c) in enumerate(CAT):
    o.append(f'<circle cx="{lx+180}" cy="{ly+i*4.6}" r="1.6" fill="{c}"/><text x="{lx+183}" y="{ly+i*4.6+1}" font-size="3" fill="#1a1a1a">{e(lab)}</text>')
yy=ly+6*4.6+1
o.append(f'<circle cx="{lx+180}" cy="{yy}" r="1.6" fill="#888"/><text x="{lx+183}" y="{yy+1}" font-size="2.6" fill="#555">Lage gemäss swisstopo</text>')
o.append(f'<circle cx="{lx+230}" cy="{yy}" r="1.6" fill="#fff" stroke="#888" stroke-width="0.4" stroke-dasharray="0.8 0.5"/><text x="{lx+233}" y="{yy+1}" font-size="2.6" fill="#555">Lage nur ungefähr (Dorf)</text>')
o.append('</g>')
# Höhenstreifen (nur verortete Punkte)
hx0,hx1,hy=MX+18,MX+MW,MY+MH+12
H0,H1=500,3200; hxp=lambda h:hx0+(h-H0)/(H1-H0)*(hx1-hx0)
o.append('<g id="hoehenstreifen">')
o.append(f'<text x="{MX}" y="{hy-4}" font-size="4" font-weight="700" fill="#1a1a1a">Kultstätten liegen tief, Teufel und Unheimliches hoch</text>')
for h in range(500,3201,500):
    o.append(f'<line x1="{hxp(h):.2f}" y1="{hy}" x2="{hxp(h):.2f}" y2="{hy+6*5.2}" stroke="#e8e8e8" stroke-width="0.25"/><text x="{hxp(h):.2f}" y="{hy+6*5.2+3}" font-size="2.4" fill="#888" text-anchor="middle">{h} m</text>')
for i,(k,lab,c) in enumerate(CAT):
    y=hy+2.6+i*5.2
    hs=[r['hoehe_m'] for r in D if r['kategorie']==k and r['hoehe_m']!='']
    o.append(f'<text x="{MX}" y="{y+1}" font-size="2.6" fill="#555">{e(lab.split(",")[0].split(" &")[0])}</text>')
    for h in hs: o.append(f'<circle cx="{hxp(h):.2f}" cy="{y}" r="1.1" fill="{c}" fill-opacity="0.75"/>')
    if len(hs)>=3:
        m=statistics.median(hs); o.append(f'<line x1="{hxp(m):.2f}" y1="{y-2}" x2="{hxp(m):.2f}" y2="{y+2}" stroke="#1a1a1a" stroke-width="0.4"/>')
o.append(f'<text x="{hx1}" y="{hy+6*5.2+7}" font-size="2.3" fill="#888" text-anchor="end">Höhe ü. M. der {sum(1 for r in D if r["hoehe_m"]!="")} genau verorteten Namen · Strich = Median</text>')
o.append('</g>')
# Liste rechts, zwei Spalten
import textwrap
o.append('<g id="liste">')
cols=[(304,14),(358,14)];ci=0;lx,y=cols[0]
for k,lab,c in CAT:
    rs=[r for r in D if r['kategorie']==k]
    if ci==0 and y>150: ci=1;lx,y=cols[1]
    o.append(f'<text x="{lx}" y="{y}" font-size="3" font-weight="700" fill="{c}">{e(lab)} ({len(rs)})</text>');y+=3.6
    for r in rs:
        if ci==0 and y>262: ci=1;lx,y=cols[1]
        o.append(f'<text x="{lx}" y="{y}" font-size="2.15" fill="#1a1a1a"><tspan font-weight="700">{r["id"]} {e(r["name"])}</tspan> <tspan fill="#666">{e(r["gemeinde_buch"])}</tspan></text>');y+=2.5
        for ln in textwrap.wrap(r["bedeutung"],40):
            o.append(f'<text x="{lx+2.5}" y="{y}" font-size="1.95" fill="#555">{e(ln)}</text>');y+=2.3
        y+=0.8
    y+=1.6
o.append('</g>')
o.append(f'<g id="quelle"><text x="304" y="287" font-size="2.3" fill="#888">Quelle: Andrea Schorta, «Wie der Berg zu seinem Namen kam», Ediziun Rein 2022.</text><text x="304" y="290.5" font-size="2.3" fill="#888">Verortung und Höhen: swisstopo (geo.admin.ch, swissNAMES3D/Höhenmodell), Stand 10.11.2026.</text><text x="304" y="294" font-size="2.3" fill="#888">Grafik: Terra Grischuna/jr</text></g>')
o.append('</svg>')
open(OUT+'sagenkarte_doppelseite.svg','w').write('\n'.join(o))
print(MY+MH, y)
