// Test: the browser path (decoded data/places.js + js/sun.js) reproduces the precomputed figures,
// and the horizon decoding is lossless. Also checks a few invariants. Exit code 1 on failure.
import fs from 'fs'; import zlib from 'zlib'; import vm from 'vm';
import { dayStats, localMidnight } from '../js/sun.js';
const win = {}; vm.runInNewContext(fs.readFileSync('../data/places.js', 'utf8'), { window: win });
const meta = JSON.parse(zlib.gunzipSync(Buffer.from(win.PLACES_B64, 'base64')));
const raw = zlib.gunzipSync(Buffer.from(win.HORIZONS_B64, 'base64')); const d = new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
const H = new Map(JSON.parse(fs.readFileSync('cache/horizons.json')).map(h => [h.id, h.hz]));
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
const days = []; for (let t = Date.UTC(2026, 6, 1); t <= Date.UTC(2027, 5, 30); t += 864e5) { const x = new Date(t); days.push([x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate()]); }
ok(days.length === meta.days, 'season length');
const pick = meta.places.filter((_, i) => i % 27 === 0).concat(meta.places.filter(p => ['Stampa', 'Chur', 'Vicosoprano'].includes(p.n)));
for (const p of pick) {
  const k = meta.places.indexOf(p); const hz = new Float32Array(720); let acc = 0;
  for (let a = 0; a < 720; a++) { acc += d[k * 720 + a]; hz[a] = acc * win.HORIZONS_Q / 100; }
  const orig = H.get(p.id); ok(orig.every((v, a) => Math.abs(v / 100 - hz[a]) <= 0.0251), `horizon decode ${p.n} (quantisation <= 0.025 deg)`);
  const sun = days.map(dd => dayStats(hz, p.la, p.lo, localMidnight(...dd)).sun);
  ok(sun.filter(x => x === 0).length === p.s.dark, `dark days ${p.n}`);
  ok(sun[meta.iDec21] === p.s.d21, `21 Dec ${p.n}`);
  ok(p.s.darkLo <= p.s.dark && p.s.dark <= p.s.darkHi, `sensitivity order ${p.n}`);
  ok(p.s.d21 <= p.s.d21flat, `sun <= flat ${p.n}`);
}
// invariants over all places
for (const p of meta.places) { ok(p.s.yearH <= p.s.yearFlatH, `year ${p.n}`); ok(!p.s.run || p.s.run[1] - p.s.run[0] + 1 <= p.s.dark, `run ${p.n}`); }
// DST boundaries: 25 Oct 2026 has 25 local hours -> local midnight difference
ok((localMidnight(2026, 10, 26) - localMidnight(2026, 10, 25)) / 36e5 === 25, 'DST autumn');
ok((localMidnight(2027, 3, 29) - localMidnight(2027, 3, 28)) / 36e5 === 23, 'DST spring');
console.log(`${pick.length} places re-computed, ${meta.places.length} checked for invariants: ${fail ? fail + ' failures' : 'all tests passed'}`);
process.exit(fail ? 1 : 0);
