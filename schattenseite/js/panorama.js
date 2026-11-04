// 360-degree horizon panorama with the sun's paths through the year.
import { horizonAt } from './horizon.js';
import { sunPosition, localMidnight } from './sun.js';
import { ymd, dateLabel, clock, deg } from './fmt.js';

const DIRS = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
const VIEWS = { full: { a0: 0, a1: 360, e0: -4, e1: 70 }, south: { a0: 95, a1: 265, e0: -3, e1: 36 } };

export class Panorama {
  constructor(canvas, tip) {
    this.cv = canvas; this.tip = tip; this.ctx = canvas.getContext('2d'); this.viewName = 'south';
    this.place = null; this.day = 0; this.minute = 720; this.refDays = [];
    new ResizeObserver(() => this.draw()).observe(canvas);
    canvas.addEventListener('pointermove', e => this.hover(e.offsetX, e.offsetY));
    canvas.addEventListener('pointerleave', () => { this.hx = null; this.tip.hidden = true; this.draw(); });
  }
  set(place, day, minute, refDays) { this.place = place; this.day = day; this.minute = minute; this.refDays = refDays; this.paths = null; this.draw(); }
  setTime(day, minute) { if (day !== this.day) this.paths = null; this.day = day; this.minute = minute; this.draw(); }
  setView(v) { this.viewName = v; this.draw(); }
  path(i) {
    const p = this.place, t0 = localMidnight(...ymd(i)), pts = [];
    for (let m = 0; m <= 1440; m += 3) { const s = sunPosition(t0 + m * 60000, p.la, p.lo); if (s.el > -2) pts.push({ m, az: s.az, el: s.el, vis: s.el > horizonAt(p.hz, s.az) && s.el > -0.27 }); }
    return pts;
  }
  geom() {
    const W = this.cv.clientWidth, H = this.cv.clientHeight, v = VIEWS[this.viewName];
    const padB = 24, padT = 8;
    return { W, H, v, x: a => (a - v.a0) / (v.a1 - v.a0) * W, y: e => padT + (v.e1 - e) / (v.e1 - v.e0) * (H - padT - padB), padB };
  }
  draw() {
    if (!this.place) return;
    const dpr = Math.min(devicePixelRatio || 1, 2.5), cv = this.cv, ctx = this.ctx;
    const g = this.geom(); if (!g.W) return;
    if (cv.width !== Math.round(g.W * dpr)) { cv.width = Math.round(g.W * dpr); cv.height = Math.round(g.H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { W, H, v, x, y } = g, hz = this.place.hz;
    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0a1430'); sky.addColorStop(1, '#2b4370');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // grid
    ctx.font = '11px Inter, system-ui, sans-serif'; ctx.textBaseline = 'middle';
    for (let e = 10; e < v.e1; e += 10) { ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.beginPath(); ctx.moveTo(0, y(e)); ctx.lineTo(W, y(e)); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillText(e + '°', 6, y(e) - 7); }
    // sun paths
    if (!this.paths) this.paths = { sel: this.path(this.day), refs: this.refDays.map(r => ({ ...r, pts: this.path(r.i) })) };
    for (const r of this.paths.refs) if (r.i !== this.day) this.drawPath(r.pts, g, 'rgba(255,214,140,.55)', 1.4, r.label);
    this.drawPath(this.paths.sel, g, '#ffd27a', 2.6, dateLabel(this.day), true);
    // terrain silhouette
    const n = Math.max(200, Math.round(W / 1.5));
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let k = 0; k <= n; k++) { const a = v.a0 + (v.a1 - v.a0) * k / n; ctx.lineTo(x(a), y(horizonAt(hz, a))); }
    ctx.lineTo(W, H); ctx.closePath();
    const ground = ctx.createLinearGradient(0, y(v.e1 * 0.5), 0, H); ground.addColorStop(0, '#16223a'); ground.addColorStop(1, '#070b16');
    ctx.fillStyle = ground; ctx.fill();
    ctx.beginPath();
    for (let k = 0; k <= n; k++) { const a = v.a0 + (v.a1 - v.a0) * k / n, X = x(a), Y = y(horizonAt(hz, a)); k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
    ctx.strokeStyle = 'rgba(214,226,255,.75)'; ctx.lineWidth = 1.2; ctx.stroke();
    // flat horizon
    ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.moveTo(0, y(0)); ctx.lineTo(W, y(0)); ctx.stroke(); ctx.setLineDash([]);
    // current sun
    const p = this.place, s = sunPosition(localMidnight(...ymd(this.day)) + this.minute * 60000, p.la, p.lo);
    if (s.el > v.e0 && s.az > v.a0 && s.az < v.a1) {
      const vis = s.el > horizonAt(hz, s.az), X = x(s.az), Y = y(s.el);
      if (vis) { const gl = ctx.createRadialGradient(X, Y, 0, X, Y, 26); gl.addColorStop(0, 'rgba(255,230,160,.9)'); gl.addColorStop(1, 'rgba(255,200,100,0)'); ctx.fillStyle = gl; ctx.fillRect(X - 26, Y - 26, 52, 52); }
      ctx.beginPath(); ctx.arc(X, Y, 6, 0, 7); ctx.fillStyle = vis ? '#fff4d0' : 'rgba(255,220,150,.25)'; ctx.fill();
      ctx.strokeStyle = vis ? '#ffb347' : 'rgba(255,220,150,.6)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    // azimuth labels
    ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '600 11px Inter, system-ui, sans-serif';
    for (let k = 0; k <= 16; k++) { const a = k * 22.5; if (a < v.a0 || a > v.a1) continue; const X = x(a); if (k % 2 === 0) ctx.fillText(DIRS[(k / 2) % 8], X, H - 10); else { ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillText('·', X, H - 10); ctx.fillStyle = 'rgba(255,255,255,.6)'; } }
    ctx.textAlign = 'left';
    if (this.hx != null) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(this.hx, 0); ctx.lineTo(this.hx, H - g.padB); ctx.stroke(); }
  }
  drawPath(pts, g, col, lw, label, hours) {
    const ctx = this.ctx, { x, y, v } = g;
    const inView = q => q.az >= v.a0 - 2 && q.az <= v.a1 + 2;
    for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1], b = pts[k]; if (!inView(a) || !inView(b) || Math.abs(a.az - b.az) > 30) continue;
      ctx.beginPath(); ctx.moveTo(x(a.az), y(a.el)); ctx.lineTo(x(b.az), y(b.el));
      ctx.strokeStyle = col; ctx.lineWidth = b.vis ? lw : lw * 0.6; ctx.globalAlpha = b.vis ? 1 : 0.38;
      ctx.setLineDash(b.vis ? [] : [3, 4]); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.setLineDash([]);
    if (hours) {
      ctx.font = '600 10px Inter, system-ui, sans-serif'; ctx.textAlign = 'center';
      for (const q of pts) if (q.m % 60 === 0 && q.el > v.e0 && inView(q)) {
        const X = x(q.az), Y = y(q.el);
        ctx.beginPath(); ctx.arc(X, Y, 2.6, 0, 7); ctx.fillStyle = q.vis ? '#ffe7ad' : 'rgba(255,231,173,.45)'; ctx.fill();
        const hh = (q.m / 60) % 24; ctx.fillStyle = q.vis ? 'rgba(255,240,210,.95)' : 'rgba(255,240,210,.5)'; ctx.fillText(String(hh), X, Y - 10);
      }
      ctx.textAlign = 'left';
    }
    // label at the apex
    const top = pts.filter(inView).reduce((m, q) => q.el > (m ? m.el : -99) ? q : m, null);
    if (top && top.el < v.e1 - 2) {
      ctx.font = `${hours ? 600 : 500} 11px Inter, system-ui, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = hours ? '#ffe2a0' : 'rgba(255,226,160,.7)'; ctx.fillText(label, x(top.az), y(top.el) - (hours ? 24 : 9)); ctx.textAlign = 'left';
    }
  }
  hover(sx) {
    if (!this.place) return;
    const g = this.geom(), a = g.v.a0 + sx / g.W * (g.v.a1 - g.v.a0), h = horizonAt(this.place.hz, a);
    this.hx = sx; this.draw();
    const dir = DIRS[Math.round(a / 45) % 8];
    let txt = `<b>${dir}</b> · Azimut ${Math.round(a)}° · Horizont ${deg(h)}`;
    const pts = this.paths && this.paths.sel, q = pts && pts.reduce((m, q) => Math.abs(q.az - a) < Math.abs((m ? m.az : 999) - a) ? q : m, null);
    if (q && Math.abs(q.az - a) < 3 && q.el > -0.3) txt += `<br>${dateLabel(this.day)}, ${clock(q.m)}: Sonne ${deg(q.el)} hoch – ${q.vis ? '<span class="sun">direkt</span>' : 'hinter dem Berg'}`;
    this.tip.innerHTML = txt; this.tip.hidden = false;
    const tw = this.tip.offsetWidth; this.tip.style.left = Math.max(4, Math.min(g.W - tw - 4, sx + 12)) + 'px'; this.tip.style.top = '8px';
  }
}
