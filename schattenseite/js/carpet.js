// "Sonnenteppich": every day of the season (x) by time of day (y): night, shade, direct sun.
import { horizonAt } from './horizon.js';
import { daySun, localMidnight, dayStats } from './sun.js';
import { ymd, dateLabel, hm, clock, NDAYS, MON3 } from './fmt.js';

const M0 = 3 * 60, M1 = 23 * 60, STEP = 2;                  // local time window and resolution (min)
export class Carpet {
  constructor(canvas, tip, onDay) {
    this.cv = canvas; this.tip = tip; this.onDay = onDay; this.ctx = canvas.getContext('2d');
    this.img = document.createElement('canvas'); this.img.width = NDAYS; this.img.height = (M1 - M0) / STEP;
    this.day = 0; this.stats = null;
    new ResizeObserver(() => this.draw()).observe(canvas);
    canvas.addEventListener('pointermove', e => this.hover(e.offsetX, e.offsetY));
    // touch has no hover: show the tooltip on tap and hide it again after a moment
    canvas.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { this.hover(e.offsetX, e.offsetY); clearTimeout(this._tt); this._tt = setTimeout(() => { this.tip.hidden = true; }, 3500); } });
    canvas.addEventListener('pointerleave', e => { if (e.pointerType !== 'mouse') return; this.tip.hidden = true; this.hd = null; this.draw(); });
    canvas.addEventListener('click', e => { const d = this.dayAt(e.offsetX); if (d != null) this.onDay(d); });
  }
  set(place) {
    this.place = place;
    const ictx = this.img.getContext('2d'), H = this.img.height, im = ictx.createImageData(NDAYS, H), px = im.data;
    const stats = [];
    for (let d = 0; d < NDAYS; d++) {
      const t0 = localMidnight(...ymd(d));
      stats.push(dayStats(place.hz, place.la, place.lo, t0));
      const sunAt = daySun(t0, place.la, place.lo);
      for (let k = 0; k < H; k++) {
        const s = sunAt(M0 + k * STEP + 1);
        let c;
        if (s.el < -6) c = [10, 15, 31];
        else if (s.el < -0.27) c = [22, 30, 54];
        else if (s.el > horizonAt(place.hz, s.az)) { const t = Math.min(1, s.el / 40); c = [255, 168 + 70 * t, 70 + 120 * t]; }
        else c = [42, 60, 99];
        const j = (k * NDAYS + d) * 4; px[j] = c[0]; px[j + 1] = c[1]; px[j + 2] = c[2]; px[j + 3] = 255;
      }
    }
    ictx.putImageData(im, 0, 0); this.stats = stats; this.draw();
    return stats;
  }
  setDay(d) { this.day = d; this.draw(); }
  geom() { const W = this.cv.clientWidth, H = this.cv.clientHeight, L = 34, R = 6, T = 6, B = 22; return { W, H, L, R, T, B, pw: W - L - R, ph: H - T - B }; }
  dayAt(sx) { const g = this.geom(); const d = Math.floor((sx - g.L) / g.pw * NDAYS); return d >= 0 && d < NDAYS ? d : null; }
  draw() {
    if (!this.stats) return;
    const dpr = Math.min(devicePixelRatio || 1, 2.5), g = this.geom(), ctx = this.ctx; if (!g.W) return;
    if (this.cv.width !== Math.round(g.W * dpr)) { this.cv.width = Math.round(g.W * dpr); this.cv.height = Math.round(g.H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, g.W, g.H);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(this.img, g.L, g.T, g.pw, g.ph);
    ctx.font = '11px Inter, system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.textBaseline = 'middle';
    for (let h = 6; h <= 21; h += 3) { const Y = g.T + (h * 60 - M0) / (M1 - M0) * g.ph; ctx.fillText(String(h).padStart(2, '0') + ' h', 0, Y); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(g.L, Y, g.pw, 1); ctx.fillStyle = 'rgba(255,255,255,.55)'; }
    ctx.textAlign = 'center';
    for (let d = 0; d < NDAYS; d++) { const [, m, dd] = ymd(d); if (dd === 1) { const X = g.L + d / NDAYS * g.pw; ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(X, g.T, 1, g.ph); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillText(MON3[m - 1], X + g.pw / NDAYS * 15, g.H - 9); } }
    ctx.textAlign = 'left';
    const mark = (d, col, w) => { const X = g.L + (d + .5) / NDAYS * g.pw; ctx.fillStyle = col; ctx.fillRect(X - w / 2, g.T - 2, w, g.ph + 4); };
    if (this.hd != null) mark(this.hd, 'rgba(255,255,255,.45)', 1);
    mark(this.day, '#ffffff', 2);
  }
  hover(sx, sy) {
    const d = this.dayAt(sx); if (d == null) { this.tip.hidden = true; return; }
    this.hd = d; this.draw();
    const s = this.stats[d], g = this.geom();
    let t = `<b>${dateLabel(d)}</b><br>Direkte Sonne: <span class="sun">${hm(s.sun)}</span>`;
    if (s.sun > 0) t += ` (${clock(s.first)}–${clock(s.last + 1)}${s.runs > 2 ? `, ${s.runs - 1} Unterbrüche` : s.runs > 1 ? ', ein Unterbruch' : ''})`;
    t += `<br><span class="muted">Ohne Berge: ${hm(s.flat)}</span>`;
    this.tip.innerHTML = t; this.tip.hidden = false;
    const tw = this.tip.offsetWidth; this.tip.style.left = Math.max(0, Math.min(g.W - tw, sx + 14)) + 'px'; this.tip.style.top = Math.max(0, sy - 60) + 'px';
  }
}
