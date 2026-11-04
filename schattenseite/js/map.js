// Map view: terrain image, boundaries, places, pan/zoom/pinch, hit testing.
import { metresPerDegree } from './horizon.js';

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
    this.minS = s * 0.85; this.maxS = s * 40; this.fitS = s;
    if (soft && this.view.s > s) return;
    // centre of the free area expressed as a world-space view centre
    this.view = { x: (x0 + x1) / 2 - ((I.l - I.r) / 2) / s, y: (y0 + y1) / 2 - ((I.t - I.b) / 2) / s, s };
  }
  fitView() { const v = this.view; this.fit(); const t = this.view; this.view = v; return t; }
  zoomAt(sx, sy, f) {
    const [X, Y] = this.toWorld(sx, sy);
    const s = Math.min(this.maxS, Math.max(this.minS, this.view.s * f));
    this.view.s = s; this.view.x = X - (sx - this.W / 2) / s; this.view.y = Y - (sy - this.H / 2) / s;
    this.clamp(); this.draw();
  }
  flyTo(X, Y, s, ms = 700) {
    const a = { ...this.view }, b = { x: X, y: Y, s: Math.min(this.maxS, Math.max(this.minS, s)) }, t0 = performance.now();
    cancelAnimationFrame(this._fly);
    const step = now => {
      const t = Math.min(1, (now - t0) / ms), e = t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      const ls = Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * e;
      this.view = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, s: Math.exp(ls) }; this.draw();
      if (t < 1) this._fly = requestAnimationFrame(step);
    };
    this._fly = requestAnimationFrame(step);
  }
  clamp() {
    const [x0, y0, x1, y1] = this.bounds, v = this.view;
    const m = 30000; v.x = Math.min(x1 + m, Math.max(x0 - m, v.x)); v.y = Math.min(y1 + m, Math.max(y0 - m, v.y));
  }
  bind() {
    const cv = this.cv, pts = new Map(); let moved = 0, last = null, pinch = null;
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.offsetX, e.offsetY]); moved = 0; last = [e.offsetX, e.offsetY]; if (pts.size === 2) pinch = null; });
    cv.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) { this.setHover(this.pick(e.offsetX, e.offsetY)); return; }
      const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.offsetX, e.offsetY]);
      if (pts.size === 1) {
        const dx = e.offsetX - prev[0], dy = e.offsetY - prev[1]; moved += Math.abs(dx) + Math.abs(dy);
        if (moved > 4) { this.view.x -= dx / this.view.s; this.view.y -= dy / this.view.s; this.clamp(); this.draw(); cv.classList.add('dragging'); }
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        if (pinch) { this.view.x -= (mx - pinch.mx) / this.view.s; this.view.y -= (my - pinch.my) / this.view.s; this.zoomAt(mx, my, d / pinch.d); }
        pinch = { d, mx, my }; moved = 99;
      }
    });
    const up = e => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId); cv.classList.remove('dragging'); if (pts.size < 2) pinch = null;
      if (pts.size === 0 && moved <= 4 && last) this.click(last[0], last[1]);
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => this.setHover(null));
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
    const path = rings => { ctx.beginPath(); for (const r of rings) r.forEach(([X, Y], k) => { const [x, y] = this.toScreen(X, Y); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); };
    if (v.s > this.fitS * 1.8) { path(this.gemPaths); ctx.strokeStyle = 'rgba(200,215,255,.16)'; ctx.lineWidth = 0.7; ctx.stroke(); }
    path(this.cantonPaths); ctx.strokeStyle = 'rgba(235,228,210,.75)'; ctx.lineWidth = 1.3; ctx.stroke();
    // places
    const z = v.s / this.fitS, rad = Math.min(6.5, 3.1 + Math.max(0, Math.log2(z)) * 1.1);
    for (const p of this.places) {
      if (!this.visible(p)) continue;
      const [x, y] = this.toScreen(p.X, p.Y);
      if (x < -10 || y < -10 || x > this.W + 10 || y > this.H + 10) continue;
      const r = p.t === 'hamlet' ? rad * 0.68 : rad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
      ctx.fillStyle = this.dotColor(p); ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(6,9,20,.9)'; ctx.stroke();
    }
    this.drawLabels(ctx, rad);
    if (this.sel) {
      const [x, y] = this.toScreen(this.sel.X, this.sel.Y);
      ctx.beginPath(); ctx.arc(x, y, rad + 6, 0, 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, rad + 9, 0, 7); ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
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
  drawLabels(ctx, rad) {
    const z = this.view.s / this.fitS, boxes = [];
    const want = this.places.filter(p => p === this.sel || p === this.hover || (this.visible(p) && (p.t === 'town' || (p.pop || 0) > 9000 / z ** 1.6 || (z > 3 && p.t === 'village') || z > 7)));
    want.sort((a, b) => (b === this.sel || b === this.hover) - (a === this.sel || a === this.hover) || (b.pop || 0) - (a.pop || 0) || (a.t === 'hamlet') - (b.t === 'hamlet'));
    ctx.textBaseline = 'middle';
    for (const p of want) {
      const strong = p === this.sel || p === this.hover;
      ctx.font = `${strong ? 600 : 500} ${strong ? 14 : p.t === 'town' ? 13 : 12}px Inter, system-ui, sans-serif`;
      const txt = p === this.hover && this.opts.hoverInfo ? `${p.n} · ${this.opts.hoverInfo(p)}` : p.n;
      const [x, y] = this.toScreen(p.X, p.Y), w = ctx.measureText(txt).width;
      const bx = x + rad + 5, box = [bx - 2, y - 9, bx + w + 2, y + 9];
      if (box[2] > this.W || box[0] < 0 || y < 8 || y > this.H - 8) continue;
      if (!strong && boxes.some(b => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]))) continue;
      boxes.push(box);
      ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(8,12,26,.85)'; ctx.lineJoin = 'round'; ctx.strokeText(txt, bx, y);
      ctx.fillStyle = strong ? '#fff' : 'rgba(240,236,226,.92)'; ctx.fillText(txt, bx, y);
    }
  }
}
