// Reads Overpass admin geometry from stdin, assigns each place to its Gemeinde,
// writes places.json (with gemeinde) and canton outline (simplified) to cache/.
import fs from 'fs';
const chunks = []; for await (const c of process.stdin) chunks.push(c);
const d = JSON.parse(Buffer.concat(chunks).toString());
// Build rings from outer way members (stitch ways into closed rings)
function rings(rel, role = 'outer') {
  const ways = rel.members.filter(m => m.type === 'way' && m.role === role && m.geometry).map(m => m.geometry.map(p => [p.lon, p.lat]));
  const out = []; const pool = ways.slice();
  while (pool.length) {
    let ring = pool.shift();
    let guard = 0;
    while (guard++ < 10000) {
      const a = ring[0], b = ring[ring.length - 1];
      if (a[0] === b[0] && a[1] === b[1]) break;
      const i = pool.findIndex(w => (w[0][0] === b[0] && w[0][1] === b[1]) || (w[w.length - 1][0] === b[0] && w[w.length - 1][1] === b[1]));
      if (i < 0) break;
      let w = pool.splice(i, 1)[0];
      if (!(w[0][0] === b[0] && w[0][1] === b[1])) w = w.slice().reverse();
      ring = ring.concat(w.slice(1));
    }
    out.push(ring);
  }
  return out;
}
function inRing(pt, ring) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const inPoly = (pt, outer, inner) => outer.some(r => inRing(pt, r)) && !inner.some(r => inRing(pt, r));
const gem = d.elements.filter(e => e.tags.admin_level === '8').map(e => ({ name: e.tags.name, bfs: +e.tags['swisstopo:BFS_NUMMER'] || null, outer: rings(e), inner: rings(e, 'inner') }));
const canton = d.elements.find(e => e.tags.admin_level === '4');
const raw = JSON.parse(fs.readFileSync('cache/places_raw.json'));
const places = [];
for (const e of raw.elements) {
  const pt = [e.lon, e.lat];
  const g = gem.find(g => inPoly(pt, g.outer, g.inner));
  places.push({ id: e.id, name: e.tags.name, type: e.tags.place, lat: e.lat, lon: e.lon, ele: e.tags.ele ? +e.tags.ele : null, pop: e.tags.population ? +e.tags.population : null, gemeinde: g ? g.name : null, bfs: g ? g.bfs : null });
}
console.log('unassigned', places.filter(p => !p.gemeinde).map(p => p.name));
fs.writeFileSync('cache/places.json', JSON.stringify(places));
// Douglas-Peucker simplify canton outline
function dp(pts, eps) {
  if (pts.length < 3) return pts;
  let dmax = 0, idx = 0; const [a, b] = [pts[0], pts[pts.length - 1]];
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i]; const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    const dd = Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
    if (dd > dmax) { dmax = dd; idx = i; }
  }
  if (dmax > eps) return dp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(dp(pts.slice(idx), eps));
  return [a, b];
}
const r5 = x => Math.round(x * 1e5) / 1e5;
const outline = rings(canton).map(r => dp(r, 0.0008).map(p => [r5(p[0]), r5(p[1])]));
const gemOut = gem.map(g => ({ name: g.name, bfs: g.bfs, rings: g.outer.map(r => dp(r, 0.0012).map(p => [r5(p[0]), r5(p[1])])) }));
fs.writeFileSync('cache/outline.json', JSON.stringify({ canton: outline, gemeinden: gemOut }));
console.log('places', places.length, 'canton rings', outline.map(r => r.length), 'gem', gemOut.length);
