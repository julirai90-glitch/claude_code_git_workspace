// Map view: terrain image, boundaries, places, pan/zoom/pinch, hit testing.
import { metresPerDegree } from './horizon.js';

// Inhabited-hectare layer: classes of days without direct sun (0, 1-29, 30-59, 60-89, 90+)
export const HECT_CLASSES = [[0, 'rgba(255,200,97,.55)'], [1, '#e2d4f7'], [30, '#bb98ec'], [60, '#9563dc'], [90, '#7333c4']];
export const hectClass = d => d >= 90 ? 4 : d >= 60 ? 3 : d >= 30 ? 2 : d >= 1 ? 1 : 0;
// swisstopo approximate conversions WGS84 <-> LV95 (accuracy ~1 m)
export function toLV95(lat, lon) {
  const p = (lat * 3600 - 169028.66) / 10000, l = (lon * 3600 - 26782.5) / 10000;
  return [2600072.37 + 211455.93 * l - 10938.51 * l * p - 0.36 * l * p * p - 44.54 * l ** 3,
          1200147.07 + 308807.95 * p + 3745.25 * l * l + 76.63 * p * p - 194.56 * l * l * p + 119.79 * p ** 3];
}
export function fromLV95(E, N) {
  const y = (E - 2600000) / 1e6, x = (N - 1200000) / 1e6;
  return [(16.9023892 + 3.238272 * x - 0.270978 * y * y - 0.002528 * x * x - 0.0447 * y * y * x - 0.0140 * x ** 3) * 100 / 36,
          (2.6779094 + 4.728982 * y + 0.791484 * y * x + 0.1306 * y * x * x - 0.0436 * y ** 3) * 100 / 36];
}

export class MapView {
  constructor(canvas, G, outline, places, opts) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.G = G; this.outline = outline; this.places = places;
    this.opts = opts; this.m = metresPerDegree(46.6);
    this.view = { x: 0, y: 0, s: 1 }; this.sel = null; this.dotColor = () => '#fff'; this.terrainCanvas = null;
    this.hover = null;
    for (const p of places) { const [X, Y] = this.world(p.la, p.lo); p.X = X; p.Y = Y; }
    this.cantonPaths = outline.canton.map(r => r.map(([lo, la]) => this.world(la, lo)));
    this.gemPaths = outline.gemeinden.flatMap(g => g.rings.map(r => r.map(([lo, la]) => this.world(la, lo))));
    const xs = this.cantonPaths.flat().map(p => p[0]), ys = this.cantonPaths.flat().map(p => p[1]);
    this.bounds = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    this.resize(); this.fit(); this.bind();
    new ResizeObserver(() => { const keep = this.cv.clientWidth; this.resize(); if (keep) this.fit(true); this.draw(); }).observe(canvas);
  }
  world(lat, lon) { return [(lon - this.G.w) * this.m.lon, (this.G.n - lat) * this.m.lat]; }
  latlon(X, Y) { return [this.G.n - Y / this.m.lat, this.G.w + X / this.m.lon]; }
  toScreen(X, Y) { const v = this.view; return [(X - v.x) * v.s + this.W / 2, (Y - v.y) * v.s + this.H / 2]; }
  toWorld(sx, sy) { const v = this.view; return [(sx - this.W / 2) / v.s + v.x, (sy - this.H / 2) / v.s + v.y]; }
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.W = this.cv.clientWidth; this.H = this.cv.clientHeight; this.dpr = dpr;
    this.cv.width = Math.round(this.W * dpr); this.cv.height = Math.round(this.H * dpr);
  }
  // free screen area not covered by the floating panels
  insets() { return this.opts.insets ? this.opts.insets() : { t: 20, r: 20, b: 20, l: 20 }; }
  fit(soft) {
    const [x0, y0, x1, y1] = this.bounds, I = this.insets();
    const fw = this.W - I.l - I.r, fh = this.H - I.t - I.b;
    const s = Math.min(fw / (x1 - x0), fh / (y1 - y0));
    this.minS = s * 0.85; this.maxS = s * 9; this.fitS = s;
    if (soft && this.view.s > s) return;
    // centre of the free area expressed as a world-space view centre
    this.view = { x: (x0 + x1) / 2 - ((I.l - I.r) / 2) / s, y: (y0 + y1) / 2 - ((I.t - I.b) / 2) / s, s };
  }
  fitView() { const v = this.view; this.fit(); const t = this.view; this.view = v; return t; }
  zoomAt(sx, sy, f) {
    const [X, Y] = this.toWorld(sx, sy);
    const s = Math.min(this.maxZ(), Math.max(this.minS, this.view.s * f));
    this.view.s = s; this.view.x = X - (sx - this.W / 2) / s; this.view.y = Y - (sy - this.H / 2) / s;
    this.clamp(); this.draw();
  }
  flyTo(X, Y, s, ms = 700) {
    const a = { ...this.view }, b = { x: X, y: Y, s: Math.min(this.maxZ(), Math.max(this.minS, s)) }, t0 = performance.now();
    cancelAnimationFrame(this._fly);
    const step = now => {
      const t = Math.min(1, (now - t0) / ms), e = t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      const ls = Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * e;
      this.view = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, s: Math.exp(ls) }; this.draw();
      if (t < 1) this._fly = requestAnimationFrame(step);
    };
    this._fly = requestAnimationFrame(step);
  }
  maxZ() { return this.showHect ? this.fitS * 30 : this.maxS; }      // hectares need a closer look
  clamp() {
    const [x0, y0, x1, y1] = this.bounds, v = this.view;
    const m = 30000; v.x = Math.min(x1 + m, Math.max(x0 - m, v.x)); v.y = Math.min(y1 + m, Math.max(y0 - m, v.y));
  }
  bind() {
    // Mouse: drag pans, wheel zooms (after a click into the map). Touch: one finger scrolls the page
    // (touch-action: pan-y), a tap selects, two fingers pan and pinch-zoom the map.
    const cv = this.cv, pts = new Map(); let moved = 0, last = null, pinch = null, touchPan = false;
    cv.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'touch') cv.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, [e.offsetX, e.offsetY, e.pointerType]); last = [e.offsetX, e.offsetY];
      if (pts.size === 1) { moved = 0; touchPan = false; }
      if (pts.size === 2) { pinch = null; moved = 99; touchPan = true; }
    });
    cv.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) { if (e.pointerType === 'mouse') { const p = this.pick(e.offsetX, e.offsetY); this.setHover(p); this.setHoverHect(p ? -1 : this.hectAt(e.offsetX, e.offsetY), e.offsetX, e.offsetY); } return; }
      const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.offsetX, e.offsetY, e.pointerType]);
      const dx = e.offsetX - prev[0], dy = e.offsetY - prev[1];
      if (pts.size === 1) {
        moved += Math.abs(dx) + Math.abs(dy);
        if (e.pointerType === 'touch') { if (moved > 12 && !touchPan && this.opts.onTouchHint) this.opts.onTouchHint(); return; }
        if (moved > 4) { this.view.x -= dx / this.view.s; this.view.y -= dy / this.view.s; this.clamp(); this.draw(); cv.classList.add('dragging'); }
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        if (pinch) { this.view.x -= (mx - pinch.mx) / this.view.s; this.view.y -= (my - pinch.my) / this.view.s; this.zoomAt(mx, my, d / pinch.d); }
        pinch = { d, mx, my };
      }
    });
    const end = (e, cancelled) => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId); cv.classList.remove('dragging'); if (pts.size < 2) pinch = null;
      if (!cancelled && pts.size === 0 && moved <= (e.pointerType === 'touch' ? 12 : 4) && last) this.click(last[0], last[1]);
    };
    cv.addEventListener('pointerup', e => end(e, false)); cv.addEventListener('pointercancel', e => end(e, true));
    cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { this.setHover(null); this.setHoverHect(-1); } });
    cv.addEventListener('wheel', e => {
      if (!e.ctrlKey && !this.opts.wheelZoom()) return;          // let the page scroll unless the map is "active"
      e.preventDefault(); this.zoomAt(e.offsetX, e.offsetY, Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0018)));
    }, { passive: false });
    cv.addEventListener('dblclick', e => { e.preventDefault(); this.zoomAt(e.offsetX, e.offsetY, 2); });
  }
  pick(sx, sy, r = 11) {
    let best = null, bd = r * r;
    for (const p of this.places) {
      if (!this.visible(p)) continue;
      const [x, y] = this.toScreen(p.X, p.Y), d = (x - sx) ** 2 + (y - sy) ** 2;
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }
  visible(p) { return p.t !== 'hamlet' || this.view.s > this.fitS * 2.2 || p === this.sel; }
  setHover(p) { if (p !== this.hover) { this.hover = p; this.cv.style.cursor = p ? 'pointer' : ''; this.draw(); } }
  click(sx, sy) {
    const p = this.pick(sx, sy);
    if (p) this.opts.onPlace(p);
    else { const [X, Y] = this.toWorld(sx, sy); const [la, lo] = this.latlon(X, Y); this.opts.onPoint(la, lo); }
  }
  draw() { if (!this._raf) this._raf = requestAnimationFrame(() => { this._raf = 0; this.paint(); }); }
  paint() {
    const ctx = this.ctx, d = this.dpr, v = this.view;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 0, this.W, this.H);
    if (this.terrainCanvas) {
      const [x, y] = this.toScreen(0, 0), tc = this.terrainCanvas;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(tc, x, y, tc.width * this.tdx * v.s, tc.height * this.tdy * v.s);
    }
    if (this.showHect && this.hect) { ctx.fillStyle = 'rgba(11,16,32,.5)'; ctx.fillRect(0, 0, this.W, this.H); this.paintHect(ctx); }
    if (this.featPaths) this.paintFeatures(ctx);
    const path = rings => { ctx.beginPath(); for (const r of rings) r.forEach(([X, Y], k) => { const [x, y] = this.toScreen(X, Y); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); };
    if (v.s > this.fitS * 1.8) { path(this.gemPaths); ctx.strokeStyle = 'rgba(200,215,255,.16)'; ctx.lineWidth = 0.7; ctx.stroke(); }
    path(this.cantonPaths); ctx.strokeStyle = 'rgba(235,228,210,.75)'; ctx.lineWidth = 1.3; ctx.stroke();
    // places
    const z = v.s / this.fitS, rad = Math.min(6.5, 3.1 + Math.max(0, Math.log2(z)) * 1.1);
    const shade = [];
    for (const p of this.places) {
      if (!this.visible(p)) continue;
      const [x, y] = this.toScreen(p.X, p.Y);
      if (x < -10 || y < -10 || x > this.W + 10 || y > this.H + 10) continue;
      if (this.isShadow && this.isShadow(p)) { shade.push([p, x, y]); continue; }
      const r = (p.t === 'hamlet' ? rad * 0.68 : rad) * 0.85;
      ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
      ctx.fillStyle = this.dotColor(p); ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(6,9,20,.85)'; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // places without direct sun on the selected day: larger, drawn last (on top)
    for (const [p, x, y] of shade) {
      ctx.beginPath(); ctx.arc(x, y, this.shadowR(p, rad), 0, 7);
      ctx.fillStyle = this.dotColor(p); ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(245,240,255,.9)'; ctx.stroke();
    }
    this.drawLabels(ctx, rad);
    if (this.sel) {
      const [x, y] = this.toScreen(this.sel.X, this.sel.Y);
      ctx.beginPath(); ctx.arc(x, y, rad + 6, 0, 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, rad + 9, 0, 7); ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    if (this.showHect && this.hect && this.hoverHect >= 0) this.paintHectTip(ctx);
    this.drawScale(ctx);
    if (this.opts.afterPaint) this.opts.afterPaint(ctx);
  }
  drawScale(ctx) {
    const I = this.insets(), target = 110 / this.view.s;            // metres for ~110 px
    const nice = [1, 2, 5, 10, 20, 50].map(k => k * 1000).reduce((a, b) => Math.abs(b - target) < Math.abs(a - target) ? b : a);
    const w = nice * this.view.s, x = I.l + 4, y = this.H - I.b - 18;
    ctx.strokeStyle = 'rgba(240,236,226,.85)'; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(x, y - 5); ctx.lineTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y - 5); ctx.stroke();
    ctx.font = '500 11px Inter, system-ui, sans-serif'; ctx.fillStyle = 'rgba(240,236,226,.85)'; ctx.textBaseline = 'bottom';
    ctx.fillText(`${nice / 1000} km`, x + w + 6, y + 4);
  }
  // orientation features, cached as Path2D in world coordinates (drawn with a scaling transform)
  setFeatures(F) {
    const { w, n, u } = F.meta, P = this.featPaths = {};
    const pts = (a, cb) => { let x = 0, y = 0; for (let i = 0; i < a.length; i += 2) { x += a[i]; y += a[i + 1]; cb(...this.world(n - y / u, w + x / u), i); } };
    for (const cls of ['river', 'stream', 'rail', 'road']) {
      const p = new Path2D(); for (const a of F[cls]) pts(a, (X, Y, i) => i ? p.lineTo(X, Y) : p.moveTo(X, Y)); P[cls] = p;
    }
    const lk = new Path2D(); for (const poly of F.lake) for (const a of poly) { pts(a, (X, Y, i) => i ? lk.lineTo(X, Y) : lk.moveTo(X, Y)); lk.closePath(); }
    P.lake = lk; this.draw();
  }
  paintFeatures(ctx) {
    const P = this.featPaths, v = this.view, d = this.dpr, s = v.s, z = s / this.fitS;
    ctx.save(); ctx.setTransform(d * s, 0, 0, d * s, d * (this.W / 2 - v.x * s), d * (this.H / 2 - v.y * s));
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const stroke = (p, color, px) => { ctx.strokeStyle = color; ctx.lineWidth = px / s; ctx.stroke(p); };
    // roads and railways: dark casing + light core, readable on sunlit (light) and shaded (dark) terrain
    if (z > 1.6) { const w = Math.min(1.8, 0.6 + z * 0.07); stroke(P.road, 'rgba(10,14,28,.35)', w + 1.4); stroke(P.road, 'rgba(250,246,236,.5)', w); }
    if (z > 1.6) { const w = Math.min(1.6, 0.7 + z * 0.05); stroke(P.rail, 'rgba(10,14,28,.6)', w + 1.6); ctx.setLineDash([5 / s, 4 / s]); stroke(P.rail, 'rgba(250,246,236,.9)', w); ctx.setLineDash([]); }
    if (z > 2.6) stroke(P.stream, 'rgba(120,205,225,.55)', Math.min(1.4, 0.4 + z * 0.06));
    stroke(P.river, 'rgba(120,205,225,.8)', Math.min(2.6, 0.9 + z * 0.12));
    ctx.fillStyle = 'rgba(95,180,215,.88)'; ctx.fill(P.lake, 'evenodd');
    ctx.restore();
  }
  setHectares(h) {
    const X = new Float32Array(h.count), Y = new Float32Array(h.count), cls = new Uint8Array(h.count), idx = new Map();
    for (let i = 0; i < h.count; i++) {
      const he = h.meta.e0 / 100 + h.e[i], hn = h.meta.n0 / 100 + h.n[i];
      const [la, lo] = fromLV95(he * 100 + 50, hn * 100 + 50); [X[i], Y[i]] = this.world(la, lo);
      cls[i] = hectClass(h.dark[i]); idx.set(he * 1e5 + hn, i);
    }
    Object.assign(h, { X, Y, cls, idx }); this.hect = h; this.hoverHect = -1; this.draw();
  }
  hectAt(sx, sy) {
    if (!this.showHect || !this.hect) return -1;
    const [X, Y] = this.toWorld(sx, sy), [E, N] = toLV95(...this.latlon(X, Y));
    const i = this.hect.idx.get(Math.floor(E / 100) * 1e5 + Math.floor(N / 100));
    return i == null ? -1 : i;
  }
  setHoverHect(i, sx, sy) {
    if (i === this.hoverHect && (i < 0 || this._hxy && this._hxy[0] === sx)) return;
    this.hoverHect = i; this._hxy = [sx, sy]; if (i >= 0) this.cv.style.cursor = 'pointer'; else if (!this.hover) this.cv.style.cursor = ''; this.draw();
  }
  paintHect(ctx) {
    const h = this.hect, w = Math.max(100 * this.view.s, 2.2), hw = w / 2, paths = HECT_CLASSES.map(() => new Path2D());
    for (let i = 0; i < h.count; i++) {
      const [x, y] = this.toScreen(h.X[i], h.Y[i]);
      if (x < -w || y < -w || x > this.W + w || y > this.H + w) continue;
      paths[h.cls[i]].rect(x - hw, y - hw, w, w);
    }
    // draw shaded classes last so they are not hidden under sunny neighbours when zoomed out
    paths.forEach((p, k) => { ctx.fillStyle = HECT_CLASSES[k][1]; ctx.fill(p); });
  }
  paintHectTip(ctx) {
    const h = this.hect, i = this.hoverHect, [x, y] = this.toScreen(h.X[i], h.Y[i]), w = Math.max(100 * this.view.s, 2.2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(x - w / 2, y - w / 2, w, w);
    const txt = this.opts.hectInfo ? this.opts.hectInfo(i) : String(h.dark[i]);
    ctx.font = '500 12px Inter, system-ui, sans-serif'; const tw = ctx.measureText(txt).width;
    let [tx, ty] = this._hxy; tx += 14; ty -= 14; if (tx + tw + 12 > this.W) tx -= tw + 40;
    ctx.fillStyle = 'rgba(8,12,26,.92)'; ctx.fillRect(tx - 6, ty - 11, tw + 12, 22);
    ctx.fillStyle = '#f0ece2'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(txt, tx, ty);
  }
  shadowR(p, rad) { return (p.t === 'hamlet' ? 0.75 : 1) * Math.max(rad * 1.6, 5.5); }
  drawLabels(ctx, rad) {
    const z = this.view.s / this.fitS, boxes = [];
    const want = this.places.filter(p => p === this.sel || p === this.hover || (this.visible(p) && ((p.t !== 'hamlet' && this.isShadow && this.isShadow(p)) || p.t === 'town' || (p.pop || 0) > 9000 / z ** 1.6 || (z > 3 && p.t === 'village') || z > 7)));
    const sh = p => p.t !== 'hamlet' && this.isShadow && this.isShadow(p);
    const pri = p => (p === this.sel || p === this.hover) ? 2 : sh(p) ? 1 : 0;
    want.sort((a, b) => pri(b) - pri(a) || (b.pop || 0) - (a.pop || 0) || (a.t === 'hamlet') - (b.t === 'hamlet'));
    ctx.textBaseline = 'middle';
    const hit = box => boxes.some(b => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]));
    for (const p of want) {
      const strong = p === this.sel || p === this.hover;
      ctx.font = `${strong ? 600 : 500} ${strong ? 14 : p.t === 'town' ? 13 : 12}px Inter, system-ui, sans-serif`;
      const txt = p === this.hover && this.opts.hoverInfo ? `${p.n} · ${this.opts.hoverInfo(p)}` : p.n;
      const [x, y] = this.toScreen(p.X, p.Y), w = ctx.measureText(txt).width;
      const r = this.isShadow && this.isShadow(p) ? this.shadowR(p, rad) : rad;
      // candidate label anchors [text x, text y, align]; shadow villages may fall back to other sides
      const cands = [[x + r + 5, y, 'left']];
      if (sh(p)) cands.push([x - r - 5, y, 'right'], [x - w / 2, y - r - 10, 'left'], [x - w / 2, y + r + 10, 'left'],
        [x + r, y - r - 10, 'left'], [x - r, y - r - 10, 'right'], [x - w / 2, y - r - 28, 'left'], [x + r, y + r + 10, 'left'], [x - r, y + r + 10, 'right'], [x - w / 2, y + r + 28, 'left']);
      let placed = null;
      for (const [tx, ty, al] of cands) {
        const x0 = al === 'right' ? tx - w : tx, box = [x0 - 2, ty - 9, x0 + w + 2, ty + 9];
        if (box[2] > this.W || box[0] < 0 || ty < 8 || ty > this.H - 8) continue;
        if (!strong && hit(box)) continue;
        placed = [tx, ty, al, box]; break;
      }
      if (!placed) continue;
      boxes.push(placed[3]);
      ctx.textAlign = placed[2];
      ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(8,12,26,.85)'; ctx.lineJoin = 'round'; ctx.strokeText(txt, placed[0], placed[1]);
      ctx.fillStyle = strong ? '#fff' : 'rgba(240,236,226,.92)'; ctx.fillText(txt, placed[0], placed[1]);
    }
    ctx.textAlign = 'left';
  }
}
