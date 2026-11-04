// Wiring: state (day, minute, place), controls, texts, lists.
import { horizonProfile, horizonAt, sample } from './horizon.js';
import { sunPosition, localMidnight, dayStats } from './sun.js';
import { loadDem, loadPlaces } from './data.js';
import { Terrain } from './terrain.js';
import { MapView } from './map.js';
import { Panorama } from './panorama.js';
import { Carpet } from './carpet.js';
import { NDAYS, ymd, dateLabel, dayIndexOf, todayIndex, hm, clock, int, MON3 } from './fmt.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const CENTER = [46.66, 9.63];
const RAMP = [[0, [108, 79, 158]], [45, [180, 80, 140]], [150, [234, 106, 71]], [300, [247, 165, 65]], [480, [255, 233, 160]]];
export function rampColor(min) {
  for (let k = 1; k < RAMP.length; k++) if (min <= RAMP[k][0] || k === RAMP.length - 1) {
    const [a, ca] = RAMP[k - 1], [b, cb] = RAMP[k], t = Math.max(0, Math.min(1, (min - a) / (b - a)));
    return `rgb(${ca.map((c, i) => Math.round(c + (cb[i] - c) * t)).join(',')})`;
  }
}
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const state = { day: todayIndex(), minute: 600, place: null, playing: false, mapActive: false };
let G, P, places, terrain, map, pano, carpet, dayMinutes = new Map();

init().catch(err => { console.error(err); $('#loading').textContent = 'Die Daten konnten nicht geladen werden. Bitte einen aktuellen Browser verwenden.'; });

async function init() {
  [G, P] = await Promise.all([loadDem(), loadPlaces()]);
  places = P.places;
  const byId = new Map(places.map(p => [String(p.id), p]));
  terrain = new Terrain(G, cantonMask());
  map = new MapView($('#map'), G, window.OUTLINE, places, {
    onPlace: p => select(p, { fly: false }), onPoint: (la, lo) => selectPoint(la, lo),
    wheelZoom: () => state.mapActive,
  });
  map.terrainCanvas = terrain.canvas; map.tdx = terrain.dx; map.tdy = terrain.dy;
  map.dotColor = p => rampColor(dayMinutes.get(p) ?? 0);
  pano = new Panorama($('#pano'), $('#pano-tip'));
  carpet = new Carpet($('#carpet'), $('#carpet-tip'), d => setDay(d, true));
  bindControls();
  buildLists();
  // initial selection: hash, else the village with the longest dark period
  const fromHash = parseHash(byId);
  const darkest = places.filter(p => p.t !== 'hamlet').sort((a, b) => b.s.dark - a.s.dark)[0];
  setDay(state.day);
  state.minute = solarNoonMinute(state.day) - 90;
  if (fromHash && fromHash.pt) selectPoint(...fromHash.pt, true); else select(fromHash || darkest, { fly: !!fromHash, quiet: true });
  renderTerrain();
  $('#loading').remove(); document.body.classList.add('ready');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !fromHash) play(true);
  writeLead();
}

function cantonMask() {
  const c = document.createElement('canvas'); c.width = G.cols; c.height = G.rows;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.beginPath();
  for (const ring of window.OUTLINE.canton) ring.forEach(([lo, la], k) => { const X = (lo - G.w) / G.dLon, Y = (G.n - la) / G.dLat; k ? x.lineTo(X, Y) : x.moveTo(X, Y); });
  x.fill();
  const a = x.getImageData(0, 0, G.cols, G.rows).data, m = new Uint8Array(G.cols * G.rows);
  for (let i = 0; i < m.length; i++) m[i] = a[i * 4 + 3] > 127;
  return m;
}

const t0Of = d => localMidnight(...ymd(d));
function solarNoonMinute(d) {
  let best = 0, bm = 720; const t0 = t0Of(d);
  for (let m = 600; m < 900; m += 2) { const s = sunPosition(t0 + m * 60000, ...CENTER); if (s.el > best) { best = s.el; bm = m; } }
  return bm;
}
function sunWindow(d) {                      // first/last minute with the sun above a flat horizon at the map centre
  const t0 = t0Of(d); let a = null, b = null;
  for (let m = 0; m < 1440; m += 2) { const s = sunPosition(t0 + m * 60000, ...CENTER); if (s.el > -0.27) { if (a == null) a = m; b = m; } }
  return [a, b];
}

function renderTerrain() {
  const s = sunPosition(t0Of(state.day) + state.minute * 60000, ...CENTER);
  terrain.render(s.az, s.el); map.draw();
  $('#clock').textContent = `${dateLabel(state.day)} · ${clock(state.minute)}`;
  $('#sunpos').textContent = s.el > -0.27 ? `Sonne ${Math.round(s.az)}° · ${s.el.toFixed(1).replace('.', ',')}° hoch` : 'Sonne unter dem Horizont';
  if (pano) pano.setTime(state.day, state.minute);
  updateCardNow();
}
let rt = 0;
function scheduleTerrain() { if (!rt) rt = requestAnimationFrame(() => { rt = 0; renderTerrain(); }); }

function setDay(d, fromCarpet) {
  state.day = Math.max(0, Math.min(NDAYS - 1, d));
  $('#day').value = state.day; $('#daylabel').textContent = dateLabel(state.day);
  const [a, b] = sunWindow(state.day);
  const tm = $('#time'); tm.min = a - 40; tm.max = b + 40;
  state.minute = Math.max(+tm.min, Math.min(+tm.max, state.minute)); tm.value = state.minute;
  computeDayMinutes();
  if (carpet) carpet.setDay(state.day);
  if (state.place) { pano.setTime(state.day, state.minute); fillCard(); }
  scheduleTerrain();
  if (fromCarpet) pano.draw();
}
let dmTimer = 0;
function computeDayMinutes() {
  clearTimeout(dmTimer);
  dmTimer = setTimeout(() => {
    const t0 = t0Of(state.day), m = new Map();
    for (const p of places) m.set(p, dayStats(p.hz, p.la, p.lo, t0).sun);
    if (state.place && !places.includes(state.place)) m.set(state.place, dayStats(state.place.hz, state.place.la, state.place.lo, t0).sun);
    dayMinutes = m; map.draw(); writeToday();
  }, 60);
}

// ---------- selection ----------
function select(p, { fly = true, quiet = false } = {}) {
  state.place = p; map.sel = p.X != null ? p : null;
  if (fly && p.X != null) map.flyTo(p.X, p.Y, Math.max(map.view.s, map.minS * 3.2));
  p.stats = carpet.set(p);
  pano.set(p, state.day, state.minute, refDays());
  fillCard(); fillDetail(); map.draw();
  if (!quiet) history.replaceState(null, '', p.id ? `#ort=${p.id}-${slug(p.n)}` : `#punkt=${p.la.toFixed(5)},${p.lo.toFixed(5)}`);
}
function selectPoint(la, lo, quiet) {
  const z = sample(G, la, lo); if (!(z > 0)) return;
  const h = horizonProfile(G, la, lo);
  const near = places.filter(p => p.t !== 'hamlet').reduce((m, p) => { const d = (p.la - la) ** 2 + ((p.lo - lo) * 0.69) ** 2; return d < m[0] ? [d, p] : m; }, [1e9, null]);
  const km = Math.sqrt(near[0]) * 111;
  const p = { id: null, n: km < 1.2 ? `Punkt bei ${near[1].n}` : `Punkt ${la.toFixed(3)}° N, ${lo.toFixed(3)}° O`, g: near[1] && near[1].g, la, lo, z: Math.round(z), hz: h.hz, kind: 'Kartenpunkt', t: 'point' };
  const [X, Y] = map.world(la, lo); p.X = X; p.Y = Y;
  p.s = seasonStats(p);
  select(p, { fly: false, quiet });
  map.sel = p;
}
function seasonStats(p) {
  const sun = [], hi = [], lo = [];
  for (let d = 0; d < NDAYS; d++) { const s = dayStats(p.hz, p.la, p.lo, t0Of(d)); sun.push(s.sun); hi.push(s.sunHi); lo.push(s.sunLo); }
  const run = darkRun(sun), d21 = dayStats(p.hz, p.la, p.lo, t0Of(P.iDec21));
  const z = a => a.filter(x => x === 0).length;
  return { d21: d21.sun, d21flat: d21.flat, d21first: d21.first, d21last: d21.last, dark: z(sun), darkLo: z(lo), darkHi: z(hi), run, runHi: darkRun(hi), runLo: darkRun(lo) };
}
function darkRun(a) { let best = null, s = -1; for (let i = 0; i <= a.length; i++) { if (i < a.length && a[i] === 0) { if (s < 0) s = i; } else if (s >= 0) { if (!best || i - s > best[1] - best[0] + 1) best = [s, i - 1]; s = -1; } } return best; }
function refDays() { return [{ i: dayIndexOf(6, 21), label: '21. Juni' }, { i: dayIndexOf(3, 20), label: '20. März' }, { i: P.iDec21, label: '21. Dez.' }]; }

function parseHash(byId) {
  const h = decodeURIComponent(location.hash.slice(1));
  let m = h.match(/^ort=(\d+)/); if (m && byId.has(m[1])) return byId.get(m[1]);
  m = h.match(/^punkt=([\d.]+),([\d.]+)/); if (m) return { pt: [+m[1], +m[2]] };
  return null;
}

// ---------- texts ----------
function placeLine(p) { return `${p.kind}${p.g && !p.n.includes(p.g) ? ` · Gemeinde ${p.g}` : ''} · ${int(p.z)} m ü. M.`; }
function darkText(s) {
  if (!s.run) return null;
  const ret = s.run[1] + 1 < NDAYS ? dateLabel(s.run[1] + 1) : null;
  return { days: s.dark, from: dateLabel(s.run[0]), to: dateLabel(s.run[1]), ret, band: s.darkLo !== s.darkHi ? `${s.darkLo}–${s.darkHi}` : null };
}
function fillCard() {
  const p = state.place; if (!p) return; const s = p.s, st = p.stats[state.day];
  $('#card-name').textContent = p.n; $('#card-sub').textContent = placeLine(p);
  $('#card-day').textContent = dateLabel(state.day);
  $('#card-sun').textContent = st.sun ? hm(st.sun) : 'keine';
  $('#card-sun').classList.toggle('none', !st.sun);
  $('#card-flat').textContent = `ohne Berge ${hm(st.flat)}`;
  const dt = darkText(s);
  $('#card-dark').innerHTML = dt ? `<b>${dt.days} Tage</b> ohne direkte Sonne · ${dt.from} bis ${dt.to}` : s.darkHi ? `Knapp: je nach Genauigkeit bis ${s.darkHi} Tage ohne Sonne` : `Jeden Tag des Jahres mindestens kurz Sonne`;
  updateCardNow();
}
function updateCardNow() {
  const p = state.place; if (!p) return;
  const s = sunPosition(t0Of(state.day) + state.minute * 60000, p.la, p.lo), h = horizonAt(p.hz, s.az);
  const el = $('#card-now');
  if (s.el < -0.27) { el.textContent = `${clock(state.minute)}: Nacht`; el.className = 'now night'; }
  else if (s.el > h) { el.textContent = `${clock(state.minute)}: Sonne`; el.className = 'now sun'; }
  else { el.textContent = `${clock(state.minute)}: Schatten – Sonne ${(h - s.el).toFixed(1).replace('.', ',')}° hinter dem Berg`; el.className = 'now shade'; }
}
function fillDetail() {
  const p = state.place, s = p.s, dt = darkText(s);
  $('#d-name').textContent = p.n; $('#d-sub').textContent = placeLine(p) + (p.t === 'point' ? ' · gerechnet mit 150-m-Gitter, gröber als die Ortswerte' : '');
  const stD21 = p.stats[P.iDec21];
  const loss = stD21.flat ? Math.round((1 - stD21.sun / stD21.flat) * 100) : 0;
  const tiles = [
    ['Direkte Sonne am 21. Dezember', stD21.sun ? hm(stD21.sun) : 'keine', stD21.sun ? `${clock(stD21.first)} bis ${clock(stD21.last + 1)}${stD21.runs > 1 ? ', mit Unterbruch' : ''}` : `ohne Berge wären es ${hm(stD21.flat)}`],
    ['Die Berge nehmen', `${loss} %`, `des möglichen Sonnenscheins am kürzesten Tag (ohne Berge ${hm(stD21.flat)})`],
    dt ? ['Ohne direkte Sonne', `${dt.days} Tage`, `${dt.from} bis ${dt.to}${dt.band ? ` · Spannweite ${dt.band} Tage` : ''}`]
       : ['Ohne direkte Sonne', s.darkHi ? 'knapp 0 Tage' : '0 Tage', s.darkHi ? `bei 0,5° höherem Horizont ${s.darkHi} Tage` : 'an keinem Tag des Jahres'],
    dt && dt.ret ? ['Die Sonne kehrt zurück am', dt.ret, 'erster Tag mit direkter Sonne nach der Schattenzeit'] : ['Längster Tag, 21. Juni', hm(p.stats[dayIndexOf(6, 21)].sun), `direkte Sonne (ohne Berge ${hm(p.stats[dayIndexOf(6, 21)].flat)})`],
  ];
  $('#tiles').innerHTML = tiles.map(([k, v, n]) => `<div class="tile"><div class="k">${k}</div><div class="v">${v}</div><div class="n">${n}</div></div>`).join('');
  $('#d-sentence').innerHTML = sentence(p, stD21, dt);
}
function sentence(p, d21, dt) {
  const name = `<b>${p.n}</b>`;
  if (dt) return `In ${name} verschwindet die Sonne laut Modellrechnung am ${dt.from} hinter den Bergen und kehrt ${dt.ret ? `am ${dt.ret}` : 'erst im Sommer'} zurück. Dazwischen liegen ${dt.days} Tage ohne einen einzigen direkten Sonnenstrahl.`;
  if (d21.sun < 60) return `Am kürzesten Tag erreicht die Sonne ${name} nur während ${hm(d21.sun)} – ohne Berge wären es ${hm(d21.flat)}.`;
  return `Am 21. Dezember scheint die Sonne in ${name} von ${clock(d21.first)} bis ${clock(d21.last + 1)} Uhr${d21.runs > 1 ? ' mit Unterbrüchen' : ''}, insgesamt ${hm(d21.sun)}.`;
}
function writeLead() {
  const v = places.filter(p => p.t !== 'hamlet'), w = places.filter(p => p.t === 'hamlet');
  $('#n-places').textContent = int(places.length); $('#n-vil').textContent = v.length; $('#n-ham').textContent = w.length;
  $('#n-dark').textContent = v.filter(p => p.s.dark > 0).length;
  const top = v.slice().sort((a, b) => b.s.dark - a.s.dark)[0];
  $('#lead-top').innerHTML = `${top.n} (${top.g})`; $('#lead-top-days').textContent = top.s.dark;
}
function writeToday() {
  const v = places.filter(p => p.t !== 'hamlet'), w = places.filter(p => p.t === 'hamlet');
  const nv = v.filter(p => !dayMinutes.get(p)).length, nw = w.filter(p => !dayMinutes.get(p)).length;
  const isToday = state.day === todayIndex();
  $('#today').innerHTML = `${isToday ? 'Heute' : 'Am'} ${dateLabel(state.day)} ${nv + nw ? `bleiben <b>${nv} Dörfer</b> und <b>${nw} Weiler</b>` : 'bleibt <b>kein Ort</b>'} ohne direkte Sonne.`;
}

// ---------- controls ----------
let raf = 0, lastT = 0;
function play(auto) {
  state.playing = true; $('#play').classList.add('on'); $('#play').setAttribute('aria-label', 'Anhalten');
  const tm = $('#time'); lastT = performance.now();
  const step = now => {
    if (!state.playing) return;
    const dt = Math.min(80, now - lastT); lastT = now;
    state.minute += dt * 0.07 * (+tm.max - +tm.min) / 600;
    if (state.minute > +tm.max) state.minute = +tm.min;
    tm.value = state.minute; scheduleTerrain();
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}
function stop() { state.playing = false; cancelAnimationFrame(raf); $('#play').classList.remove('on'); $('#play').setAttribute('aria-label', 'Tagesablauf abspielen'); }
function bindControls() {
  const day = $('#day'), tm = $('#time');
  day.max = NDAYS - 1;
  day.addEventListener('input', () => { stop(); setDay(+day.value); });
  tm.addEventListener('input', () => { stop(); state.minute = +tm.value; scheduleTerrain(); });
  $('#play').addEventListener('click', () => state.playing ? stop() : play());
  $$('[data-day]').forEach(b => b.addEventListener('click', () => { stop(); const v = b.dataset.day; setDay(v === 'today' ? todayIndex() : dayIndexOf(...v.split('-').map(Number))); }));
  $$('[data-view]').forEach(b => b.addEventListener('click', () => { $$('[data-view]').forEach(x => x.classList.toggle('on', x === b)); pano.setView(b.dataset.view); }));
  $('#zoom-in').addEventListener('click', () => map.zoomAt(map.W / 2, map.H / 2, 1.8));
  $('#zoom-out').addEventListener('click', () => map.zoomAt(map.W / 2, map.H / 2, 1 / 1.8));
  $('#zoom-fit').addEventListener('click', () => { const [x0, y0, x1, y1] = map.bounds; map.flyTo((x0 + x1) / 2, (y0 + y1) / 2, map.minS / 0.9); });
  // the map captures the wheel only after a click into it (no scroll trap)
  const mapEl = $('#map');
  mapEl.addEventListener('pointerdown', () => { state.mapActive = true; mapEl.parentElement.classList.add('active'); });
  document.addEventListener('pointerdown', e => { if (!mapEl.contains(e.target)) { state.mapActive = false; mapEl.parentElement.classList.remove('active'); } });
  // search
  const q = $('#q'), list = $('#q-list'); let hits = [], hi = 0;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const render = () => { list.innerHTML = hits.map((p, k) => `<li role="option" class="${k === hi ? 'on' : ''}" data-k="${k}"><b>${p.n}</b><span>${p.kind} · ${p.g}</span></li>`).join(''); list.hidden = !hits.length; };
  q.addEventListener('input', () => {
    const t = norm(q.value.trim()); hi = 0;
    hits = t.length < 2 ? [] : places.filter(p => norm(p.n).includes(t) || norm(p.g || '').startsWith(t))
      .sort((a, b) => (norm(b.n).startsWith(t) - norm(a.n).startsWith(t)) || ((a.t === 'hamlet') - (b.t === 'hamlet')) || a.n.localeCompare(b.n)).slice(0, 8);
    render();
  });
  const choose = p => { q.value = ''; hits = []; render(); q.blur(); stop(); select(p); document.getElementById('karte').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  q.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { hi = Math.min(hits.length - 1, hi + 1); render(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { hi = Math.max(0, hi - 1); render(); e.preventDefault(); }
    else if (e.key === 'Enter' && hits[hi]) choose(hits[hi]);
    else if (e.key === 'Escape') { hits = []; render(); }
  });
  list.addEventListener('pointerdown', e => { const li = e.target.closest('li'); if (li) { e.preventDefault(); choose(hits[+li.dataset.k]); } });
  $('#to-detail').addEventListener('click', () => $('#ort').scrollIntoView({ behavior: 'smooth' }));
  $('#share').addEventListener('click', async () => {
    const url = location.href; try { await navigator.clipboard.writeText(url); $('#share').textContent = 'Link kopiert'; } catch { prompt('Link zu diesem Ort:', url); }
    setTimeout(() => $('#share').textContent = 'Link zu diesem Ort', 1800);
  });
  addEventListener('keydown', e => { if (e.target.matches('input')) return; if (e.key === ' ' && state.mapActive) { e.preventDefault(); state.playing ? stop() : play(); } });
}

// ---------- lists ----------
function buildLists() {
  const render = () => {
    const withHam = $('#with-ham').checked;
    const pool = places.filter(p => withHam || p.t !== 'hamlet');
    const dark = pool.filter(p => p.s.dark > 0).sort((a, b) => b.s.dark - a.s.dark || a.n.localeCompare(b.n));
    const edge = pool.filter(p => p.s.dark === 0 && p.s.darkHi > 0).sort((a, b) => b.s.darkHi - a.s.darkHi);
    $('#gantt').innerHTML = gantt(dark, false) + (edge.length ? `<h4 class="edge-h">Grenzfälle <span>– laut Rechnung täglich etwas Sonne, bei 0,5° höherem Horizont aber nicht</span></h4>` + gantt(edge, true) : '');
    $('#gantt-n').textContent = `${dark.length} ${withHam ? 'Orte' : 'Dörfer'}`;
  };
  $('#with-ham').addEventListener('change', render); render();
  $('#gantt').addEventListener('click', e => { const r = e.target.closest('[data-id]'); if (r) { const p = places.find(x => String(x.id) === r.dataset.id); stop(); select(p); $('#karte').scrollIntoView({ behavior: 'smooth' }); } });
  strip();
}
const G0 = dayIndexOf(10, 15), G1 = dayIndexOf(3, 1);
function gantt(list, edge) {
  const pct = d => ((d - G0) / (G1 - G0) * 100).toFixed(2) + '%';
  const ticks = []; for (let d = G0; d <= G1; d++) { const [, m, dd] = ymd(d); if (dd === 1) ticks.push(`<i style="left:${pct(d)}"><span>${MON3[m - 1]}</span></i>`); }
  const sol = `<em class="sol" style="left:${pct(P.iDec21)}"></em>`, td = todayIndex(), today = td >= G0 && td <= G1 ? `<em class="td" style="left:${pct(td)}"></em>` : '';
  const rows = list.map(p => {
    const s = p.s, r = s.run, rh = s.runHi;
    const outer = rh ? `<b class="hi" style="left:${pct(rh[0])};width:calc(${pct(rh[1] + 1)} - ${pct(rh[0])})"></b>` : '';
    const inner = r ? `<b class="run" style="left:${pct(r[0])};width:calc(${pct(r[1] + 1)} - ${pct(r[0])})"></b>` : '';
    const lab = r ? `${s.dark} Tage <span>${dateLabel(r[0], false)} – ${dateLabel(r[1], false)}</span>` : `0 Tage <span>bis ${s.darkHi}</span>`;
    return `<div class="row${p.t === 'hamlet' ? ' ham' : ''}" data-id="${p.id}" tabindex="0"><div class="nm">${p.n}<span>${p.g}</span></div><div class="bar">${outer}${inner}</div><div class="lab">${lab}</div></div>`;
  }).join('');
  return `<div class="gantt${edge ? ' edge' : ''}"><div class="axis">${ticks.join('')}${sol}${today}</div>${rows}<div class="axis bottom">${ticks.join('')}</div></div>`;
}
function strip() {
  const v = places.filter(p => p.t !== 'hamlet'), W = 1000, H = 150, max = 480;
  const x = m => 20 + m / max * (W - 40);
  const placed = [], dots = [];
  for (const p of v.slice().sort((a, b) => a.s.d21 - b.s.d21)) {
    const cx = x(p.s.d21); let cy = 0, k = 0;
    while (placed.some(q => Math.abs(q[0] - cx) < 7.4 && Math.abs(q[1] - cy) < 7.4)) { k++; cy = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 7.5; }
    placed.push([cx, cy]); dots.push(`<circle cx="${cx.toFixed(1)}" cy="${(H / 2 - 8 + cy).toFixed(1)}" r="3.4" fill="${rampColor(p.s.d21)}" data-id="${p.id}"><title>${p.n} (${p.g}): ${p.s.d21 ? hm(p.s.d21) : 'keine Sonne'}</title></circle>`);
  }
  const ticks = [0, 60, 120, 180, 240, 300, 360, 420, 480].map(m => `<g transform="translate(${x(m)},${H - 14})"><line y1="-6" y2="0"/><text y="12">${m / 60} h</text></g>`).join('');
  $('#strip').innerHTML = `<svg viewBox="0 0 ${W} ${H + 4}" role="img" aria-label="${v.length} Dörfer nach Minuten direkter Sonne am 21. Dezember">${dots.join('')}<g class="ticks">${ticks}</g></svg>`;
  $('#strip').addEventListener('click', e => { const c = e.target.closest('[data-id]'); if (c) { const p = places.find(x => String(x.id) === c.dataset.id); stop(); select(p); $('#karte').scrollIntoView({ behavior: 'smooth' }); } });
  const chur = v.find(p => p.n === 'Chur');
  $('#strip-note').innerHTML = `Zum Vergleich: Chur ${hm(chur.s.d21)}. Am meisten Sonne: ${v.slice().sort((a, b) => b.s.d21 - a.s.d21).slice(0, 3).map(p => `${p.n} (${hm(p.s.d21)})`).join(', ')}.`;
}
