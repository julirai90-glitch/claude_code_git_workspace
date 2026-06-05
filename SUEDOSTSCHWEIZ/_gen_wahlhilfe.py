"""Generate wahlhilfe-glarus.html with embedded incumbent data."""
import json, os

with open(os.path.join(os.path.dirname(__file__), 'incumbents.json'), encoding='utf-8') as f:
    raw = json.load(f)

PARTY_SHORT = {
    'Schweizerische Volkspartei': 'SVP', 'FDP.Die Liberalen': 'FDP',
    'Die Mitte': 'Mitte', 'Grünliberale Partei': 'GLP',
    'Sozialdemokratische Partei': 'SP', 'Grüne': 'Grüne', 'Junge Grüne': 'Junge Grüne',
}
PARTY_ORDER = ['SVP','FDP','Mitte','GLP','SP','Grüne','Junge Grüne']

by_district = {'Glarus Nord': {}, 'Glarus': {}, 'Glarus Süd': {}}
for c in raw:
    d = c['district']
    if d not in by_district: continue
    p = PARTY_SHORT.get(c['party'], c['party'])
    # store [name, id] tuples
    by_district[d].setdefault(p, []).append([c['name'], c['id']])

candidates = {}
for d, parties in by_district.items():
    candidates[d] = []
    for p in PARTY_ORDER:
        if p in parties:
            candidates[d].append({'p': p, 'n': sorted(parties[p], key=lambda x: x[0])})
    for p in sorted(parties):
        if p not in PARTY_ORDER:
            candidates[d].append({'p': p, 'n': sorted(parties[p], key=lambda x: x[0])})

CANDIDATES_JSON = json.dumps(candidates, ensure_ascii=False)
counts = {d: sum(len(g['n']) for g in candidates[d]) for d in candidates}

html = f'''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Wahlhilfe – Glarner Landratswahlen 2026</title>
<style>
*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0f0f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:24px 16px 40px}}
.widget{{background:white;border-radius:12px;box-shadow:0 2px 20px rgba(0,0,0,.13);width:100%;max-width:560px;overflow:hidden}}

/* Header */
.hd{{background:#C8102E;color:white;padding:20px 24px 16px}}
.hd-eyebrow{{font-size:11px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;opacity:.8;margin-bottom:5px}}
.hd h1{{font-size:20px;font-weight:700;line-height:1.3}}
.hd-sub{{font-size:13px;opacity:.75;margin-top:4px}}
.prog-wrap{{background:rgba(255,255,255,.25);height:4px;margin-top:14px;border-radius:2px;overflow:hidden}}
.prog-fill{{background:white;height:100%;border-radius:2px;transition:width .4s ease}}

/* Breadcrumb */
.crumbs{{display:flex;flex-wrap:wrap;gap:4px;padding:12px 24px 0;min-height:0}}
.crumbs:empty{{padding:0}}
.crumb{{font-size:11px;background:#f5f5f5;color:#555;border-radius:20px;padding:3px 9px;white-space:nowrap}}
.crumb-arrow{{font-size:11px;color:#ccc;align-self:center}}

/* Body */
.body{{padding:22px 24px 24px;transition:opacity .15s ease}}
.q-label{{font-size:11px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;color:#C8102E;margin-bottom:10px}}
.q-text{{font-size:20px;font-weight:600;color:#111;line-height:1.4;margin-bottom:22px}}

/* Buttons */
.btns{{display:flex;flex-direction:column;gap:10px}}
.btn-y{{display:block;width:100%;padding:14px 20px;background:#C8102E;color:white;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:background .15s}}
.btn-y:hover{{background:#a50d26}}
.btn-n{{display:block;width:100%;padding:14px 20px;background:white;color:#C8102E;border:2px solid #C8102E;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:background .15s}}
.btn-n:hover{{background:#fff0f2}}
.btn-region{{display:block;width:100%;padding:13px 18px;background:white;color:#333;border:2px solid #ddd;border-radius:8px;font-size:15px;font-weight:500;cursor:pointer;text-align:left;transition:border-color .15s,background .15s,color .15s}}
.btn-region:hover{{border-color:#C8102E;background:#fff5f6;color:#C8102E}}

/* Radio */
.radio-group{{display:flex;flex-direction:column;gap:8px;margin-bottom:18px}}
.radio-opt{{display:flex;align-items:flex-start;gap:11px;padding:12px 15px;border:2px solid #e8e8e8;border-radius:8px;cursor:pointer;transition:border-color .15s,background .15s}}
.radio-opt:hover{{border-color:#C8102E;background:#fff8f8}}
.radio-opt.sel{{border-color:#C8102E;background:#fff2f3}}
.radio-opt input{{margin-top:2px;flex-shrink:0;width:17px;height:17px;accent-color:#C8102E;cursor:pointer}}
.radio-opt label{{font-size:14px;color:#333;cursor:pointer;line-height:1.45}}
.btn-cont{{display:block;width:100%;padding:13px 20px;background:#C8102E;color:white;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:background .15s,opacity .15s}}
.btn-cont:disabled{{opacity:.35;cursor:not-allowed}}
.btn-cont:not(:disabled):hover{{background:#a50d26}}

/* Result */
.res-icon{{font-size:36px;margin-bottom:10px}}
.res-label{{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#C8102E;margin-bottom:6px}}
.res-title{{font-size:18px;font-weight:700;color:#111;margin-bottom:12px;line-height:1.3}}
.res-text{{font-size:15px;color:#333;line-height:1.65;margin-bottom:16px}}

/* Incumbent list */
.bisherige{{border:1px solid #ebebeb;border-radius:8px;overflow:hidden;margin-bottom:16px}}
.bisherige-hd{{background:#f7f7f7;padding:10px 14px;font-size:12px;font-weight:700;color:#555;letter-spacing:.5px;text-transform:uppercase;border-bottom:1px solid #ebebeb}}
.bisherige-body{{max-height:220px;overflow-y:auto;padding:10px 14px}}
.party-row{{display:flex;gap:8px;align-items:baseline;margin-bottom:8px;flex-wrap:wrap}}
.party-row:last-child{{margin-bottom:0}}
.party-badge{{font-size:10px;font-weight:700;letter-spacing:.5px;padding:2px 7px;border-radius:3px;flex-shrink:0;color:white}}
.party-names{{font-size:13px;color:#333;line-height:1.5}}
.cand-link{{color:#333;text-decoration:none;border-bottom:1px solid #ccc}}
.cand-link:hover{{color:#C8102E;border-bottom-color:#C8102E}}

/* Party colors */
.p-SVP{{background:#4B8A3E}}.p-FDP{{background:#3872B5}}.p-Mitte{{background:#D6862B}}
.p-GLP{{background:#A8AD00}}.p-SP{{background:#F0554D}}.p-Grüne{{background:#84B547}}
.p-JG{{background:#5a9e3b}}

.sv-link{{display:inline-flex;align-items:center;gap:6px;margin-bottom:14px;color:#C8102E;font-weight:600;font-size:13px;text-decoration:none;border:1px solid #C8102E;border-radius:6px;padding:8px 14px}}
.sv-link:hover{{background:#fff0f2}}
.sv-link svg{{width:14px;height:14px}}

.res-link{{display:inline-block;margin-bottom:14px;color:#C8102E;font-weight:600;font-size:13px;text-decoration:none}}
.res-link:hover{{text-decoration:underline}}
.btn-restart{{margin-top:4px;display:block;width:100%;padding:11px;background:#f5f5f5;border:none;border-radius:8px;font-size:13px;color:#666;cursor:pointer}}
.btn-restart:hover{{background:#ebebeb}}
.back-link{{background:none;border:none;color:#aaa;font-size:13px;cursor:pointer;padding:0;margin-top:14px;display:flex;align-items:center;gap:4px}}
.back-link:hover{{color:#444}}

/* Footer */
.ft{{padding:10px 24px;border-top:1px solid #f0f0f0;display:flex;justify-content:space-between;font-size:11px;color:#bbb;flex-wrap:wrap;gap:4px}}

@media(max-width:420px){{.body{{padding:18px 16px 20px}}.q-text{{font-size:17px}}}}
</style>
</head>
<body>
<div class="widget">

<div class="hd">
  <div class="hd-eyebrow">Südostschweiz · Landratswahlen Glarus 2026</div>
  <h1>Wie Sie am besten wählen</h1>
  <div class="hd-sub">Beantworten Sie ein paar Fragen – wir führen Sie durch die Wahl.</div>
  <div class="prog-wrap"><div class="prog-fill" id="prog" style="width:5%"></div></div>
</div>

<div class="crumbs" id="crumbs"></div>
<div class="body" id="body"></div>

<div class="ft">
  <span>Interaktiv: Südostschweiz</span>
  <span>Daten: smartvote.ch · Landratswahlen 2026</span>
</div>

</div>

<script>
// ── Incumbent data (58 Bisherige, grouped by party per district) ──────────
const CAND = {CANDIDATES_JSON};

const PARTY_CLASS = {{
  SVP:'p-SVP', FDP:'p-FDP', Mitte:'p-Mitte', GLP:'p-GLP',
  SP:'p-SP', 'Grüne':'p-Grüne', 'Junge Grüne':'p-JG'
}};

// ── Decision tree ─────────────────────────────────────────────────────────
const NODES = {{
  q1:{{type:'yn',step:1,q:'Sind Sie im Kanton Glarus stimmberechtigt?',
    yes:'q2',no:'r_reg',crumbY:'Stimmberechtigt',crumbN:'Nicht stimmber.'}},
  q2:{{type:'yn',step:2,q:'Gehen Sie wählen?',
    yes:'q3',no:'r_novote',crumbY:'Geht wählen',crumbN:'Geht nicht wählen'}},
  q3:{{type:'yn',step:3,q:'Sind Sie mit der heutigen Zusammensetzung des Landrates rundum zufrieden?',
    yes:'q4',no:'q5',crumbY:'Zufrieden',crumbN:'Will Veränderung'}},
  q4:{{type:'yn',step:4,q:'Wirklich?',
    yes:'q7',no:'q5',crumbY:'Ja, wirklich',crumbN:'Eigentlich nicht'}},
  q5:{{type:'radio',step:4,q:'Welche Veränderung ist Ihnen besonders wichtig?',
    opts:[
      {{l:'Die Stärke der Parteien soll sich ändern.',next:'q6a',crumb:'Partei-Stärke'}},
      {{l:'Im Landrat soll es mehr Frauen haben.',next:'r_list',crumb:'Mehr Frauen'}},
      {{l:'Im Landrat soll es mehr Junge haben.',next:'r_list',crumb:'Mehr Junge'}},
      {{l:'Im Landrat soll es mehr Landwirte, Gewerbebetreibende, Rechtsanwälte, Lehrer usw. haben.',next:'r_list',crumb:'Mehr Vielfalt'}},
      {{l:'Im Landrat soll es möglichst viele Menschen haben, die – unabhängig von Parteien – in ihren Ansichten mit meinen übereinstimmen.',next:'r_smartvote',crumb:'Ansichten-Match'}},
    ]}},
  q6a:{{type:'yn',step:5,q:'Soll nur eine bestimmte Partei mehr Sitze bekommen?',
    yes:'q6b',no:'r_mix',crumbY:'Nur eine Partei',crumbN:'Mehrere Parteien'}},
  q6b:{{type:'yn',step:6,q:'Sind Sie mit der Liste dieser Partei rundum zufrieden?',
    yes:'r_unch',no:'r_fix',crumbY:'Liste OK',crumbN:'Liste nicht OK'}},
  q7:{{type:'region',step:5,q:'Wo wohnen Sie?',
    opts:[
      {{l:'Glarus Nord',next:'r_nord',crumb:'Glarus Nord'}},
      {{l:'Glarus, Ennenda, Netstal oder Riedern',next:'r_glarus',crumb:'Glarus'}},
      {{l:'Glarus Süd',next:'r_sued',crumb:'Glarus Süd'}},
    ]}},

  // ── Results ──
  r_reg:{{type:'res',icon:'📋',title:'Noch nicht wahlberechtigt',
    text:'Lassen Sie sich einbürgern und/oder warten Sie, bis Sie 16 Jahre alt sind.'}},
  r_novote:{{type:'res',icon:'🗳️',title:'Gehen Sie trotzdem!',
    text:'Sie werden es schwer haben, Gesetze, die der Landrat verabschiedet, an der Landsgemeinde noch zu ändern.'}},
  r_unch:{{type:'res',icon:'✅',title:'Liste unverändert einlegen',
    text:'Legen Sie die Liste Ihrer Wahl unverändert in die Urne.'}},
  r_list:{{type:'res',icon:'📋',title:'Die passende Liste wählen',
    text:'Nehmen Sie diejenige Liste mit den meisten Frauen, Jungen, Landwirten usw. unter den kumulierten (doppelt aufgeführten) Kandidierenden. Nichtkumulierte haben in der Regel weniger Wahlchancen.',
    link:{{href:'https://www.smartvote.ch/de/elections/26_gl_leg/lists',label:'→ Alle Listen auf smartvote.ch'}}}},
  r_nord:{{type:'res',icon:'📍',title:'Empfehlung für Glarus Nord',
    district:'Glarus Nord',
    smartvote:'https://www.smartvote.ch/de/elections/26_gl_leg/candidacies',
    text:'Nehmen Sie die leere Liste und wählen Sie die Bisherigen Ihres Wahlkreises. Ergänzen oder ersetzen Sie nach Ihren Wünschen mit neuen Kandidierenden.\\n\\nTipp: Achten Sie auf kumulierte (doppelt aufgeführte) Kandidierende – sie haben in der Regel bessere Wahlchancen als nichtkumulierte. <a href=\\"https://www.smartvote.ch/de/elections/26_gl_leg/lists\\" target=\\"_blank\\" rel=\\"noopener\\" style=\\"color:#C8102E;font-weight:600\\">Alle Listen auf smartvote.ch →</a>'}},
  r_glarus:{{type:'res',icon:'📍',title:'Empfehlung für Glarus (Mitte)',
    district:'Glarus',
    smartvote:'https://www.smartvote.ch/de/elections/26_gl_leg/candidacies',
    text:'Nehmen Sie die leere Liste und wählen Sie die Bisherigen Ihres Wahlkreises. Ergänzen oder ersetzen Sie nach Ihren Wünschen mit neuen Kandidierenden.\\n\\nTipp: Achten Sie auf kumulierte (doppelt aufgeführte) Kandidierende – sie haben in der Regel bessere Wahlchancen als nichtkumulierte. <a href=\\"https://www.smartvote.ch/de/elections/26_gl_leg/lists\\" target=\\"_blank\\" rel=\\"noopener\\" style=\\"color:#C8102E;font-weight:600\\">Alle Listen auf smartvote.ch →</a>'}},
  r_sued:{{type:'res',icon:'📍',title:'Empfehlung für Glarus Süd',
    district:'Glarus Süd',
    smartvote:'https://www.smartvote.ch/de/elections/26_gl_leg/candidacies',
    text:'Nehmen Sie die leere Liste und wählen Sie die Bisherigen Ihres Wahlkreises. Ergänzen oder ersetzen Sie nach Ihren Wünschen mit neuen Kandidierenden.\\n\\nTipp: Achten Sie auf kumulierte (doppelt aufgeführte) Kandidierende – sie haben in der Regel bessere Wahlchancen als nichtkumulierte. <a href=\\"https://www.smartvote.ch/de/elections/26_gl_leg/lists\\" target=\\"_blank\\" rel=\\"noopener\\" style=\\"color:#C8102E;font-weight:600\\">Alle Listen auf smartvote.ch →</a>'}},
  r_smartvote:{{type:'res',icon:'💡',title:'Empfehlung: smartvote.ch',
    text:'Lassen Sie sich von smartvote.ch eine Wahlempfehlung errechnen und füllen Sie den leeren Wahlzettel aus.\\n\\nBeachten Sie, dass nichtkumulierte Kandidierende wenig Wahlchancen haben, wenn auf derselben Liste auch kumulierte Namen stehen. Und: Auf dem Wahlzettel dürfen nur offizielle Kandidierende aufgeschrieben werden.',
    link:{{href:'https://www.smartvote.ch/de/elections/26_gl_leg/candidacies',label:'→ smartvote.ch öffnen'}}}},
  r_mix:{{type:'res',icon:'🔀',title:'Listen mischen',
    text:'Wenn Sie mehr als eine einzige Partei unterstützen wollen, nehmen Sie eine Liste und ersetzen Sie Kandidierende durch solche von einer anderen Liste Ihrer Wahl. Beachten Sie, dass am Schluss ein Name höchstens zweimal auf dem Zettel stehen darf.',
    link:{{href:'https://www.smartvote.ch/de/elections/26_gl_leg/lists',label:'→ Alle Listen auf smartvote.ch'}}}},
  r_fix:{{type:'res',icon:'✏️',title:'Liste anpassen',
    text:'Streichen Sie Ihnen nicht genehme Kandidierende und ersetzen Sie sie durch Namen von derselben Liste. Beachten Sie, dass am Schluss ein Name nicht mehr als zweimal auf dem Zettel stehen darf.',
    link:{{href:'https://www.smartvote.ch/de/elections/26_gl_leg/candidacies',label:'→ Kandidierende auf smartvote vergleichen'}}}},
}};

const MAX_STEPS = 6;
let history = []; // {{nodeId, crumbLabel}}
let currentId = 'q1';
let radioNext = null, radioCrumb = null;

// ── Candidate list renderer ───────────────────────────────────────────────
function renderCandList(district) {{
  const groups = CAND[district];
  if (!groups) return '';
  const total = groups.reduce((s,g)=>s+g.n.length,0);
  const rows = groups.map(g => {{
    const cls = PARTY_CLASS[g.p] || 'p-SVP';
    const names = g.n.map(([name,id]) =>
      `<a class="cand-link" href="https://www.smartvote.ch/de/elections/26_gl_leg/candidacies/${{id}}" target="_blank" rel="noopener">${{name}}</a>`
    ).join(' · ');
    return `<div class="party-row"><span class="party-badge ${{cls}}">${{g.p}}</span><span class="party-names">${{names}}</span></div>`;
  }}).join('');
  return `<div class="bisherige">
    <div class="bisherige-hd">Bisherige in ${{district}} (${{total}})</div>
    <div class="bisherige-body">${{rows}}</div>
  </div>`;
}}

// ── Render breadcrumbs ────────────────────────────────────────────────────
function renderCrumbs() {{
  const el = document.getElementById('crumbs');
  if (history.length === 0) {{ el.innerHTML=''; el.style.padding='0'; return; }}
  el.style.padding='';
  el.innerHTML = history.map((h,i) =>
    (i>0?'<span class="crumb-arrow">›</span>':'') +
    `<span class="crumb">${{h.label}}</span>`
  ).join('');
}}

// ── Main render ───────────────────────────────────────────────────────────
function render(id) {{
  currentId = id;
  const node = NODES[id];
  const prog = document.getElementById('prog');
  const body = document.getElementById('body');

  prog.style.width = node.type==='res' ? '100%' : Math.max(5,Math.round((node.step/MAX_STEPS)*95))+'%';
  renderCrumbs();

  let html = '';
  const backBtn = history.length > 0 ? `<button class="back-link" onclick="goBack()">← Zurück</button>` : '';

  if (node.type === 'yn') {{
    html = `<div class="q-label">Frage ${{node.step}} von ${{MAX_STEPS}}</div>
<div class="q-text">${{node.q}}</div>
<div class="btns">
  <button class="btn-y" onclick="nav('${{node.yes}}','${{node.crumbY}}')">Ja</button>
  <button class="btn-n" onclick="nav('${{node.no}}','${{node.crumbN}}')">Nein</button>
</div>${{backBtn}}`;

  }} else if (node.type === 'radio') {{
    const opts = node.opts.map((o,i)=>`
<div class="radio-opt" id="ro${{i}}" onclick="selRadio(${{i}})">
  <input type="radio" name="q5" id="r${{i}}">
  <label for="r${{i}}">${{o.l}}</label>
</div>`).join('');
    html = `<div class="q-label">Frage ${{node.step}} von ${{MAX_STEPS}}</div>
<div class="q-text">${{node.q}}</div>
<div class="radio-group">${{opts}}</div>
<button class="btn-cont" id="contBtn" disabled onclick="contRadio()">Weiter →</button>${{backBtn}}`;

  }} else if (node.type === 'region') {{
    const btns = node.opts.map(o=>`<button class="btn-region" onclick="nav('${{o.next}}','${{o.crumb}}')">${{o.l}}</button>`).join('');
    html = `<div class="q-label">Frage ${{node.step}} von ${{MAX_STEPS}}</div>
<div class="q-text">${{node.q}}</div>
<div class="btns">${{btns}}</div>${{backBtn}}`;

  }} else if (node.type === 'res') {{
    const txt = node.text.replace(/\\n/g,'<br>');
    const candList = node.district ? renderCandList(node.district) : '';
    const svLink = node.district ? `<a class="sv-link" href="${{node.smartvote}}" target="_blank" rel="noopener">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
  Alle Kandidierenden auf smartvote.ch
</a>` : (node.link ? `<a class="res-link" href="${{node.link.href}}" target="_blank" rel="noopener">${{node.link.label}}</a>` : '');
    html = `<div class="res-icon">${{node.icon}}</div>
<div class="res-label">Ihre Empfehlung</div>
<div class="res-title">${{node.title}}</div>
<div class="res-text">${{txt}}</div>
${{candList}}${{svLink}}
<button class="btn-restart" onclick="restart()">↩ Von vorne beginnen</button>${{backBtn}}`;
  }}

  body.innerHTML = html;
  radioNext = null; radioCrumb = null;
}}

// ── Navigation ────────────────────────────────────────────────────────────
function nav(nextId, label) {{
  history.push({{nodeId: currentId, label}});
  const body = document.getElementById('body');
  body.style.opacity = '0';
  setTimeout(() => {{ render(nextId); body.style.opacity='1'; window.scrollTo({{top:0,behavior:'smooth'}}); }}, 120);
}}

function goBack() {{
  if (!history.length) return;
  const prev = history.pop();
  const body = document.getElementById('body');
  body.style.opacity='0';
  setTimeout(()=>{{ render(prev.nodeId); body.style.opacity='1'; }}, 120);
}}

function restart() {{ history=[]; render('q1'); }}

function selRadio(i) {{
  const opt = NODES[currentId].opts[i];
  radioNext = opt.next; radioCrumb = opt.crumb;
  document.querySelectorAll('.radio-opt').forEach((el,j)=>{{
    el.classList.toggle('sel',j===i);
    el.querySelector('input').checked=(j===i);
  }});
  const btn=document.getElementById('contBtn'); if(btn) btn.disabled=false;
}}

function contRadio() {{ if(radioNext) nav(radioNext, radioCrumb); }}

// Init
render('q1');
</script>
</body>
</html>'''

html = html.replace('{CANDIDATES_JSON}', CANDIDATES_JSON)

out_path = os.path.join(os.path.dirname(__file__), 'wahlhilfe-glarus.html')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Written: {out_path} ({len(html)} chars)")
