// Existing residential buildings of the canton from the federal building register (GWR) via the
// geo.admin identify API, in 1 km tiles (max 200 results per call). Keeps only what the hectare
// layer needs -> cache/gwr_gl.json  [[egid, E, N, bfs, flats], ...]
import fs from 'fs';
const [E0, E1, N0, N1] = [2709000, 2739000, 1183000, 1227000], T = 1000;
const RES = new Set([1020, 1030, 1040]);   // GKAT: residential only, mixed, partly residential
const out = new Map(); let calls = 0;
for (let e = E0; e < E1; e += T) {
  for (let n = N0; n < N1; n += T) for (let off = 0; ; off += 200) {
    const u = `https://api3.geo.admin.ch/rest/services/api/MapServer/identify?geometryType=esriGeometryEnvelope&geometry=${e},${n},${e + T},${n + T}&imageDisplay=500,500,96&mapExtent=${e},${n},${e + T},${n + T}&tolerance=0&layers=all:ch.bfs.gebaeude_wohnungs_register&sr=2056&returnGeometry=false&limit=200&offset=${off}`;
    let j = null; for (let k = 0; k < 4 && !j; k++) { try { j = await (await fetch(u)).json(); } catch { await new Promise(s => setTimeout(s, 2000 * (k + 1))); } }
    if (!j) { console.error('FAILED', e, n, off); process.exitCode = 1; break; }
    calls++; const r = j.results || [];
    for (const { attributes: a } of r) if (a.gdekt === 'GL' && a.gstat === 1004 && RES.has(a.gkat) && a.gkode)
      out.set(a.egid, [+a.egid, Math.round(a.gkode), Math.round(a.gkodn), a.ggdenr, a.ganzwhg || 0]);
    if (r.length < 200) break;
  }
  if ((e - E0) % 10000 === 0) console.log(e, calls, 'calls', out.size, 'buildings');
}
fs.writeFileSync('cache/gwr_gl.json', JSON.stringify([...out.values()]));
console.log('done', calls, 'calls', out.size, 'buildings');
