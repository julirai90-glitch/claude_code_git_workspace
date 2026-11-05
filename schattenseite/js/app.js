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
let insideMask, G, P, places, terrain, map, pano, carpet, dayMinutes = new Map();

init().catch(err => { console.error(err); $('#loading').textContent = 'Die Daten konnten nicht geladen werden. Bitte einen aktuellen Browser verwenden.'; });

const EMBED = new URLSearchParams(location.search).get('embed');
if (EMBED) document.documentElement.classList.add('embed', 'embed-' + EMBED);
async function init() {
  [G, P] = await Promise.all([loadDem(), loadPlaces()]);
  places = P.places;
  const byId = new Map(places.map(p => [String(p.id), p]));
  insideMask = cantonMask(); terrain = new Terrain(G, insideMask);
  map = new MapView($('#map'), G, window.OUTLINE, places, {
    onPlace: p => select(p, { fly: false }), onPoint: (la, lo) => selectPoint(la, lo),
    wheelZoom: () => state.mapActive,
    hoverInfo: p => { const m = dayMinutes.get(p); return m ? hm(m) + ' Sonne' : 'keine Sonne'; },
    insets: () => innerWidth <= 760 ? { t: 64, r: 12, b: 12, l: 12 } : { t: 70, r: innerWidth > 1100 ? 340 : 330, b: 175, l: 24 },
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
  // pause the autoplay while the map is scrolled out of view (battery), resume when back
  let resume = false;
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting && state.playing) { resume = true; stop(); }
    else if (e.isIntersecting && resume) { resume = false; play(); }
  }, { threshold: 0.15 }).observe($('#karte'));
  writeLead(); finds();
}

// Data-driven entry points into the story (all figures computed from the data, nothing hard-coded
// except the SRF comparison, which is cited with its source).
function spoken(min) {
  const h = Math.round(min / 30) / 2;
  if (min < 50) return `${Math.round(min / 5) * 5} Minuten`;
  return 'rund ' + ({ 1: 'eine Stunde', 1.5: 'anderthalb Stunden', 2: 'zwei Stunden', 2.5: 'zweieinhalb Stunden', 3: 'drei Stunden' }[h] || `${String(h).replace('.', ',')} Stunden`);
}
function finds() {
  const v = places.filter(p => p.t !== 'hamlet'), td = todayIndex();
  const byName = n => v.find(p => p.n === n);
  const top = v.slice().sort((a, b) => b.s.dark - a.s.dark)[0];
  const gap = p => p.s.d21runs > 1 ? p.s.d21last + 1 - p.s.d21first - p.s.d21 : 0;
  const noon = v.filter(p => gap(p) >= 30).sort((a, b) => (b.pop || 0) - (a.pop || 0))[0];
  const sunny = v.slice().sort((a, b) => b.s.d21 - a.s.d21)[0];
  // next event relative to today: a dark period starting or ending
  const ev = v.filter(p => p.s.run).flatMap(p => [{ p, d: p.s.run[0], k: 'off' }, { p, d: p.s.run[1] + 1, k: 'on' }]).filter(e => e.d >= td).sort((a, b) => a.d - b.d)[0];
  const cards = [];
  if (ev) cards.push([ev.p, ev.k === 'off' ? 'Als Nächstes' : 'Bald zurück', ev.k === 'off' ? `${ev.d === td ? 'Heute' : 'Am ' + dateLabel(ev.d)} verschwindet die Sonne in ${ev.p.n} – für ${ev.p.s.dark} Tage.` : `${ev.d === td ? 'Heute' : 'Am ' + dateLabel(ev.d)} kehrt die Sonne nach ${ev.p.s.dark} Tagen nach ${ev.p.n} zurück.`, ev.d]);
  cards.push([top, 'Am längsten im Schatten', `${top.n}: ${top.s.dark} Tage ohne direkte Sonne, ${dateLabel(top.s.run[0])} bis ${dateLabel(top.s.run[1])}.`, P.iDec21]);
  if (noon) cards.push([noon, 'Mittagsschatten', `In ${noon.n} verschwindet die Sonne am 21. Dezember über Mittag ${spoken(gap(noon))} lang hinter einem Berg.`, P.iDec21]);
  cards.push([sunny, 'Sonnenterrasse', `${sunny.n} hat am kürzesten Tag ${hm(sunny.s.d21)} direkte Sonne – am meisten aller Dörfer.`, P.iDec21]);
  const vic = byName('Vicosoprano');
  if (vic && vic.s.run) cards.push([vic, 'Gegengeprüft', `SRF Meteo: in Vicosoprano Sonne weg von «Mitte November» bis «Ende Januar». Hier: ${dateLabel(vic.s.run[0])} bis ${dateLabel(vic.s.run[1])}.`, P.iDec21]);
  $('#finds').innerHTML = cards.map(([p, k, t], i) => `<button class="find" data-i="${i}"><span class="fk">${k}</span><span class="ft">${t}</span></button>`).join('');
  $$('#finds .find').forEach(b => b.addEventListener('click', () => { const [p, , , d] = cards[+b.dataset.i]; stop(); setDay(d); state.minute = solarNoonMinute(d); scheduleTerrain(); select(p); $('#karte').scrollIntoView({ behavior: 'smooth' }); }));
}

let terrainMaskCanvas;
function cantonMask() {
  const c = terrainMaskCanvas = document.createElement('canvas'); c.width = G.cols; c.height = G.rows;
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

// On slow devices the animation switches to a half-resolution terrain (300 m cells, 4x fewer).
let slowFrames = 0, lowRes = false;
function halfGrid(g) {
  const cols = g.cols >> 1, rows = g.rows >> 1, d = new Int16Array(cols * rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = 2 * r * g.cols + 2 * c; d[r * cols + c] = (g.data[i] + g.data[i + 1] + g.data[i + g.cols] + g.data[i + g.cols + 1]) / 4; }
  return { data: d, cols, rows, w: g.w, n: g.n, dLon: g.dLon * 2, dLat: g.dLat * 2 };
}
function goLowRes() {
  lowRes = true; const G2 = halfGrid(G);
  const m = document.createElement('canvas'); m.width = G2.cols; m.height = G2.rows; const x = m.getContext('2d');
  x.drawImage(terrainMaskCanvas, 0, 0, G2.cols, G2.rows);
  const a = x.getImageData(0, 0, G2.cols, G2.rows).data, mask = new Uint8Array(G2.cols * G2.rows);
  for (let i = 0; i < mask.length; i++) mask[i] = a[i * 4 + 3] > 127;
  terrain = new Terrain(G2, mask); map.terrainCanvas = terrain.canvas; map.tdx = terrain.dx; map.tdy = terrain.dy;
}
function renderTerrain() {
  const s = sunPosition(t0Of(state.day) + state.minute * 60000, ...CENTER);
  const t = performance.now(); terrain.render(s.az, s.el); const ms = window.__renderMs = performance.now() - t; map.draw();
  if (!lowRes && state.playing) { slowFrames = ms > 55 ? slowFrames + 1 : Math.max(0, slowFrames - 1); if (slowFrames > 6) goLowRes(); }
  $('#clock').textContent = `${dateLabel(state.day)} · ${clock(state.minute)}`;
  $('#sunpos').textContent = s.el > -0.27 ? `Sonne ${Math.round(s.az)}° · ${s.el.toFixed(1).replace('.', ',')}° hoch` : 'Sonne unter dem Horizont';
  if (pano) pano.setTime(state.day, state.minute);
  updateCardNow();
}
let rt = 0;
function scheduleTerrain() { if (!rt) rt = requestAnimationFrame(() => { rt = 0; renderTerrain(); }); }

function setDay(d, fromCarpet) {
  state.day = Math.max(0, Math.min(NDAYS - 1, d));
  $('#day').value = state.day;
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
function select(p, opts = {}) {
  // immediate feedback, the year computation follows in the next frame
  state.place = p; map.sel = p.X != null ? p : null; map.draw();
  $('#card-name').textContent = p.n; document.body.classList.add('busy');
  requestAnimationFrame(() => setTimeout(() => { selectNow(p, opts); document.body.classList.remove('busy'); }, 0));
}
function selectNow(p, { fly = true, quiet = false } = {}) {
  if (fly && p.X != null) { const s = Math.max(map.view.s, map.fitS * 3.2), I = map.insets(); map.flyTo(p.X - (I.l - I.r) / 2 / s, p.Y - (I.t - I.b) / 2 / s, s); }
  p.stats = carpet.set(p);
  if (!p.s) p.s = seasonStats(p.stats);
  pano.set(p, state.day, state.minute, refDays());
  fillCard(); fillDetail(); map.draw(); markStrip();
  if (!quiet) history.replaceState(null, '', p.id ? `#ort=${p.id}-${slug(p.n)}` : `#punkt=${p.la.toFixed(5)},${p.lo.toFixed(5)}`);
}
function selectPoint(la, lo, quiet) {
  const z = sample(G, la, lo); if (!(z > 0)) return;
  const c = Math.floor((lo - G.w) / G.dLon), r = Math.floor((G.n - la) / G.dLat), outside = !insideMask[r * G.cols + c];
  const h = horizonProfile(G, la, lo);
  const near = places.filter(p => p.t !== 'hamlet').reduce((m, p) => { const d = (p.la - la) ** 2 + ((p.lo - lo) * 0.69) ** 2; return d < m[0] ? [d, p] : m; }, [1e9, null]);
  const km = Math.sqrt(near[0]) * 111, q = near[1];
  const dir = ['nördlich', 'nordöstlich', 'östlich', 'südöstlich', 'südlich', 'südwestlich', 'westlich', 'nordwestlich'][Math.round(((Math.atan2((lo - q.lo) * 0.69, la - q.la) * 180 / Math.PI + 360) % 360) / 45) % 8];
  const p = { id: null, n: km < 1 ? `Kartenpunkt bei ${q.n}` : `${km.toFixed(1).replace('.', ',')} km ${dir} von ${q.n}`, g: near[1] && near[1].g, la, lo, z: Math.round(z), hz: h.hz, kind: outside ? 'Kartenpunkt ausserhalb Graubündens' : 'Kartenpunkt', t: 'point' };
  const [X, Y] = map.world(la, lo); p.X = X; p.Y = Y;
  select(p, { fly: false, quiet });
  map.sel = p;
}
function seasonStats(days) {             // same figures as the build computes, from the per-day stats
  const sun = days.map(s => s.sun), hi = days.map(s => s.sunHi), lo = days.map(s => s.sunLo);
  const run = darkRun(sun), d21 = days[P.iDec21];
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
  updateCardNow(); spark();
}
function spark() {
  const p = state.place, cv = $('#spark'); if (!p || !cv.clientWidth) return;
  const dpr = Math.min(devicePixelRatio || 1, 2.5), W = cv.clientWidth, H = cv.clientHeight, ctx = cv.getContext('2d');
  cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bw = W / NDAYS, k = (H - 3) / 900;
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  p.stats.forEach((s, d) => ctx.fillRect(d * bw, H - s.flat * k, bw + .3, s.flat * k));
  ctx.fillStyle = '#ffc861';
  p.stats.forEach((s, d) => s.sun && ctx.fillRect(d * bw, H - s.sun * k, bw + .3, s.sun * k));
  if (p.s.run) { ctx.fillStyle = 'rgba(160,125,220,.85)'; ctx.fillRect(p.s.run[0] * bw, H - 2, (p.s.run[1] - p.s.run[0] + 1) * bw, 2); }
  ctx.fillStyle = '#fff'; ctx.fillRect(state.day * bw - .75, 0, 1.5, H);
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
    ['Direkte Sonne am 21. Dezember', stD21.sun ? hm(stD21.sun) : 'keine', stD21.sun ? `${clock(stD21.first)} bis ${clock(stD21.last + 1)}${stD21.runs > 2 ? `, ${stD21.runs - 1} Unterbrüche` : stD21.runs > 1 ? ', ein Unterbruch' : ''}` : `ohne Berge wären es ${hm(stD21.flat)}`],
    loss >= 99 ? ['Warum', `${deg0(noonHz(p))} > ${deg0(stD21.maxEl)}`, `Der Berg im Süden ragt ${deg0(noonHz(p))} auf, die Sonne steigt am 21. Dezember nur ${deg0(stD21.maxEl)} hoch`]
      : ['Die Berge nehmen', `${loss} %`, `des möglichen Sonnenscheins am kürzesten Tag (ohne Berge ${hm(stD21.flat)})`],
    dt ? ['Ohne direkte Sonne', `${dt.days} Tage`, `${dt.from} bis ${dt.to}${dt.band ? ` · Spannweite ${dt.band} Tage` : ''}`]
       : ['Ohne direkte Sonne', s.darkHi ? 'knapp 0 Tage' : '0 Tage', s.darkHi ? `bei 0,5° höherem Horizont ${s.darkHi} Tage` : 'an keinem Tag des Jahres'],
    dt && dt.ret ? ['Die Sonne kehrt zurück am', dt.ret, 'erster Tag mit direkter Sonne nach der Schattenzeit'] : ['Längster Tag, 21. Juni', hm(p.stats[dayIndexOf(6, 21)].sun), `direkte Sonne (ohne Berge ${hm(p.stats[dayIndexOf(6, 21)].flat)})`],
  ];
  $('#tiles').innerHTML = tiles.map(([k, v, n]) => `<div class="tile"><div class="k">${k}</div><div class="v">${v}</div><div class="n">${n}</div></div>`).join('');
  $('#d-sentence').innerHTML = sentence(p, stD21, dt);
}
const deg0 = x => Math.round(x) + '°';
function noonHz(p) {   // horizon height where the sun stands at its highest on 21 December
  const t0 = t0Of(P.iDec21); let best = { el: -99 };
  for (let m = 600; m < 900; m += 2) { const s = sunPosition(t0 + m * 60000, p.la, p.lo); if (s.el > best.el) best = s; }
  return horizonAt(p.hz, best.az);
}
function sentence(p, d21, dt) {
  const name = `<b>${p.n}</b>`;
  if (dt) return `In ${name} verschwindet die Sonne laut Modellrechnung am ${dt.from} hinter den Bergen und kehrt ${dt.ret ? `am ${dt.ret}` : 'erst im Sommer'} zurück. Dazwischen liegen ${dt.days} Tage ohne einen einzigen direkten Sonnenstrahl.`;
  if (d21.sun < 60) return `Am kürzesten Tag erreicht die Sonne ${name} nur während ${hm(d21.sun)} – ohne Berge wären es ${hm(d21.flat)}.`;
  const gap = d21.last + 1 - d21.first - d21.sun;
  if (d21.runs > 1 && gap >= 5) return `Am 21. Dezember erreicht die Sonne ${name} um ${clock(d21.first)} Uhr und verschwindet um ${clock(d21.last + 1)} Uhr. Dazwischen steht sie ${gap < 60 ? `${gap} Minuten` : hm(gap)} lang hinter ${d21.runs > 2 ? 'Bergen' : 'einem Berg'}: ${hm(d21.sun)} direkte Sonne, ohne Berge wären es ${hm(d21.flat)}.`;
  return `Am 21. Dezember scheint die Sonne in ${name} von ${clock(d21.first)} bis ${clock(d21.last + 1)} Uhr, insgesamt ${hm(d21.sun)} – ohne Berge wären es ${hm(d21.flat)}.`;
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
  $('#today').innerHTML = `${isToday ? 'Heute, ' : 'Am '}${dateLabel(state.day)}${isToday ? ',' : ''} ${nv + nw ? `bleiben <b>${nv} Dörfer</b> und <b>${nw} Weiler</b>` : 'bleibt <b>kein Ort</b>'} ohne direkte Sonne.`;
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
  $('#zoom-fit').addEventListener('click', () => { const v = map.fitView(); map.flyTo(v.x, v.y, v.s); });
  // the map captures the wheel only after a click into it (no scroll trap)
  const mapEl = $('#map');
  mapEl.addEventListener('pointerdown', () => { state.mapActive = true; mapEl.parentElement.classList.add('active'); });
  document.addEventListener('pointerdown', e => { if (!mapEl.contains(e.target)) { state.mapActive = false; mapEl.parentElement.classList.remove('active'); } });
  // search
  const q = $('#q'), list = $('#q-list'); let hits = [], hi = 0;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const render = () => {
    q.setAttribute('aria-expanded', String(hits.length > 0 || q.value.trim().length >= 2));
    if (!hits.length && q.value.trim().length >= 2) { list.innerHTML = '<li class="empty">Kein Ort gefunden – oder direkt in die Karte klicken</li>'; list.hidden = false; return; }
    list.innerHTML = hits.map((p, k) => `<li role="option" class="${k === hi ? 'on' : ''}" data-k="${k}"><b>${p.n}</b><span>${p.kind} · ${p.g}</span></li>`).join(''); list.hidden = !hits.length; };
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
  q.addEventListener('blur', () => setTimeout(() => { list.hidden = true; }, 150));
  list.addEventListener('pointerdown', e => { const li = e.target.closest('li[data-k]'); if (li) { e.preventDefault(); choose(hits[+li.dataset.k]); } });
  $('#spark').addEventListener('click', e => { stop(); setDay(Math.floor(e.offsetX / e.currentTarget.clientWidth * NDAYS)); });
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
  $('#gantt').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const r = e.target.closest('[data-id]'); if (r) { e.preventDefault(); r.click(); } } });
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
  return `<div class="gantt${edge ? ' edge' : ''}"><div class="guides">${sol}${today}</div><div class="axis">${ticks.join('')}</div>${rows}<div class="axis bottom">${ticks.join('')}</div></div>`;
}
function markStrip() {
  const c = state.place && state.place.id && document.querySelector(`#strip circle[data-id="${state.place.id}"]`), m = $('#strip-sel');
  if (!m) return; if (c) { m.setAttribute('cx', c.getAttribute('cx')); m.setAttribute('cy', c.getAttribute('cy')); } else m.setAttribute('cx', -20);
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
  const n0 = v.filter(p => !p.s.d21).length;
  const ticks = [0, 60, 120, 180, 240, 300, 360, 420, 480].map(m => `<g transform="translate(${x(m)},${H - 14})"><line y1="-6" y2="0"/><text y="12">${m / 60} h</text></g>`).join('');
  $('#strip').innerHTML = `<svg viewBox="0 0 ${W} ${H + 4}" role="img" aria-label="${v.length} Dörfer nach Minuten direkter Sonne am 21. Dezember">${dots.join('')}<g class="ticks">${ticks}</g><text class="ann" x="${x(0) + 10}" y="${H / 2 - 52}">${n0} Dörfer ohne Sonne</text><circle id="strip-sel" r="6.5" fill="none" stroke="#fff" stroke-width="2" cx="-20" cy="-20"/></svg>`;
  $('#strip').addEventListener('click', e => { const c = e.target.closest('[data-id]'); if (c) { const p = places.find(x => String(x.id) === c.dataset.id); stop(); select(p); $('#karte').scrollIntoView({ behavior: 'smooth' }); } });
  const chur = v.find(p => p.n === 'Chur');
  $('#strip-note').innerHTML = `Zum Vergleich: Chur ${hm(chur.s.d21)}. Am meisten Sonne: ${v.slice().sort((a, b) => b.s.d21 - a.s.d21).slice(0, 3).map(p => `${p.n} (${hm(p.s.d21)})`).join(', ')}.`;
}
