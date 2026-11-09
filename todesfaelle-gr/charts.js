// Shared chart code for index.html and embed.html. Reads the CSV files in daten/.
// ---------- helpers ----------
const NS = "http://www.w3.org/2000/svg";
const C = { gr: "#0068a4", ch: "#9aa8b2", tod: "#ee7733", geb: "#0068a4", neg: "#c4502a", pos: "#0068a4", ink: "#14202a", ink2: "#4a5b68", ink3: "#71838f", rule: "#dde4e9" };
const fmt = (v, d = 0) => v.toLocaleString("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/(\d)\.(\d)/, "$1,$2");

async function csv(path) {
  const t = await (await fetch(path)).text();
  const [head, ...lines] = t.trim().split(/\r?\n/);
  const keys = head.split(",");
  return lines.map(l => { const v = l.split(","); return Object.fromEntries(keys.map((k, i) => [k, v[i]])); });
}
function el(name, attrs, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function txt(parent, x, y, s, attrs = {}) { const t = el("text", { x, y, "font-size": 13, fill: C.ink3, ...attrs }, parent); t.textContent = s; return t; }
function niceTicks(min, max, n = 5) {
  const span = max - min, step0 = span / n, mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= n);
  const out = []; for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}
function tooltip(host) {
  let t = host.querySelector(".tip");
  if (!t) { t = document.createElement("div"); t.className = "tip"; host.appendChild(t); }
  return t;
}
const charts = [];
function register(fn) { charts.push(fn); try { fn(); } catch (e) { /* container not on this page */ } }
let rT; window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => charts.forEach(f => { try { f(); } catch (e) {} }), 120); });

// ---------- generic line chart ----------
// opts: series [{name, color, dash, pts:[[x,y]], width}], yFmt, yDec, xTicks, h, area {a,b} (series indices; fill where b>a), yZero
function lineChart(host, opts) {
  host.innerHTML = "";
  const W = Math.max(280, host.clientWidth), H = opts.h || Math.round(Math.min(380, Math.max(240, W * 0.55)));
  const m = { t: 12, r: opts.endLabels === false ? 14 : (opts.rMargin || 92), b: 26, l: 44 };
  if (W < 420 && opts.endLabels !== false) m.r = 70;
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" }, host);
  const all = opts.series.flatMap(s => s.pts);
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = opts.yZero ? 0 : Math.min(...ys), y1 = Math.max(...ys);
  const pad = (y1 - y0) * 0.08; if (!opts.yZero) y0 -= pad; y1 += pad;
  if (opts.yMin !== undefined) y0 = opts.yMin;
  const X = x => m.l + (W - m.l - m.r) * (x - x0) / (x1 - x0 || 1);
  const Y = y => H - m.b - (H - m.t - m.b) * (y - y0) / (y1 - y0);
  niceTicks(y0, y1, opts.yTicks || 5).forEach(v => {
    if (v < y0) return;
    el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: C.rule, "stroke-width": 1 }, svg);
    txt(svg, m.l - 6, Y(v) + 4, fmt(v, opts.tickDec ?? opts.yDec ?? 0), { "text-anchor": "end" });
  });
  const xt = opts.xTicks || niceTicks(x0, x1, W < 420 ? 4 : 7).filter(v => Number.isInteger(v));
  xt.forEach(v => txt(svg, X(v), H - 6, String(v), { "text-anchor": "middle" }));
  if (opts.area) {
    const A = opts.series[opts.area.a].pts, B = opts.series[opts.area.b].pts;
    const bm = new Map(B.map(p => [p[0], p[1]]));
    for (let i = 0; i < A.length - 1; i++) {
      const [xa, ya] = A[i], [xb, yb] = A[i + 1];
      const pa = bm.get(xa), pb = bm.get(xb);
      if (pa === undefined || pb === undefined) continue;
      // fill between segments with colour by sign (b above a = deaths above births)
      const d1 = pa - ya, d2 = pb - yb;
      const seg = (xs0, xs1, f) => {
        const ia = t => ya + (yb - ya) * t, ib = t => pa + (pb - pa) * t;
        const pts = [[xs0, ia(f[0])], [xs1, ia(f[1])], [xs1, ib(f[1])], [xs0, ib(f[0])]];
        const pos = (ib((f[0] + f[1]) / 2) - ia((f[0] + f[1]) / 2)) > 0;
        el("polygon", { points: pts.map(p => `${X(p[0])},${Y(p[1])}`).join(" "),
          fill: pos ? C.tod : C.geb, opacity: pos ? 0.22 : 0.08 }, svg);
      };
      if (d1 * d2 < 0) { const t = d1 / (d1 - d2), xm = xa + (xb - xa) * t; seg(xa, xm, [0, t]); seg(xm, xb, [t, 1]); }
      else seg(xa, xb, [0, 1]);
    }
  }
  const ends = [];
  opts.series.forEach(s => {
    const d = s.pts.map((p, i) => `${i ? "L" : "M"}${X(p[0])},${Y(p[1])}`).join("");
    el("path", { d, fill: "none", stroke: s.color, "stroke-width": s.width || 2.5, "stroke-dasharray": s.dash ? "5 4" : "none",
      "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    if (s.dots) s.pts.forEach(p => el("circle", { cx: X(p[0]), cy: Y(p[1]), r: 3, fill: s.color }, svg));
    const last = s.pts[s.pts.length - 1];
    if (opts.endLabels !== false && s.label !== false) ends.push({ y: Y(last[1]), x: X(last[0]), s, v: last[1] });
  });
  // end labels with simple collision avoidance
  ends.sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 30) ends[i].y = ends[i - 1].y + 30;
  ends.forEach(e => {
    txt(svg, e.x + 8, e.y - 1, e.s.name, { fill: e.s.dash ? C.ink2 : e.s.color, "font-weight": 700, "font-size": 13 });
    txt(svg, e.x + 8, e.y + 13, fmt(e.v, opts.yDec || 0), { fill: C.ink2, "font-size": 13 });
  });
  // hover
  const tip = tooltip(host);
  const years = [...new Set(all.map(p => p[0]))].sort((a, b) => a - b);
  const guide = el("line", { y1: m.t, y2: H - m.b, stroke: C.ink3, "stroke-width": 1, opacity: 0 }, svg);
  const ov = el("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: "transparent" }, svg);
  const move = ev => {
    const r = svg.getBoundingClientRect(), sx = (ev.clientX - r.left) * W / r.width;
    const yr = years.reduce((a, b) => Math.abs(X(b) - sx) < Math.abs(X(a) - sx) ? b : a);
    guide.setAttribute("x1", X(yr)); guide.setAttribute("x2", X(yr)); guide.setAttribute("opacity", 0.4);
    const rows = opts.series.map(s => { const p = s.pts.find(q => q[0] === yr); return p ? `<span style="color:${s.color === C.ch ? C.ink2 : s.color}">●</span> ${s.name}: <b>${fmt(p[1], opts.yDec || 0)}</b>` : ""; }).filter(Boolean);
    tip.innerHTML = `<b>${opts.xLabel ? opts.xLabel(yr) : yr}</b><br>${rows.join("<br>")}`;
    tip.style.display = "block";
    const px = X(yr) * r.width / W; tip.style.left = Math.min(px + 12, r.width - tip.offsetWidth - 4) + "px"; tip.style.top = "8px";
  };
  ov.addEventListener("mousemove", move); ov.addEventListener("touchstart", e => move(e.touches[0]), { passive: true });
  ov.addEventListener("mouseleave", () => { tip.style.display = "none"; guide.setAttribute("opacity", 0); });
}

function barsV(host, pts, color, hl) {
  host.innerHTML = "";
  const W = Math.max(280, host.clientWidth), H = Math.round(Math.min(380, Math.max(240, W * 0.55)));
  const m = { t: 12, r: 10, b: 26, l: 44 };
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}` }, host);
  const y1 = Math.max(...pts.map(p => p[1])) * 1.08;
  const X0 = pts[0][0], n = pts.length, bw = (W - m.l - m.r) / n;
  const Y = y => H - m.b - (H - m.t - m.b) * y / y1;
  niceTicks(0, y1, 4).forEach(v => { el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: C.rule }, svg); txt(svg, m.l - 6, Y(v) + 4, fmt(v), { "text-anchor": "end" }); });
  pts.forEach(([x, y], i) => el("rect", { x: m.l + i * bw + bw * 0.12, y: Y(y), width: bw * 0.76, height: Y(0) - Y(y), fill: x === hl ? C.tod : color }, svg));
  niceTicks(X0, pts[n - 1][0], 4).filter(Number.isInteger).forEach(v => txt(svg, m.l + (v - X0 + 0.5) * bw, H - 6, String(v), { "text-anchor": "middle" }));
  const hp = pts.find(p => p[0] === hl);
  if (hp) txt(svg, m.l + (hl - X0 + 0.5) * bw, Y(hp[1]) - 6, `${hl}: ${fmt(hp[1])}`, { "text-anchor": "end", fill: C.tod, "font-weight": 700 });
  const tip = tooltip(host);
  svg.addEventListener("mousemove", ev => {
    const r = svg.getBoundingClientRect(), sx = (ev.clientX - r.left) * W / r.width, i = Math.floor((sx - m.l) / bw);
    if (i < 0 || i >= n) { tip.style.display = "none"; return; }
    tip.innerHTML = `<b>${pts[i][0]}</b>: ${fmt(pts[i][1])} Todesfälle`; tip.style.display = "block";
    tip.style.left = Math.min((m.l + i * bw) * r.width / W + 10, r.width - tip.offsetWidth - 4) + "px"; tip.style.top = "8px";
  });
  svg.addEventListener("mouseleave", () => tip.style.display = "none");
}

// ---------- charts ----------
(async function () {
  try {
    const [bil, reg, mort, herz, le, ypll, suiz] = await Promise.all([
      csv("daten/bfs_bilanz_gr.csv"), csv("daten/bfs_bilanz_regionen_gr.csv"), csv("daten/obsan_mortalitaet_kantone.csv"),
      csv("daten/obsan_herzkreislauf_kantone.csv"), csv("daten/obsan_lebenserwartung_kantone.csv"),
      csv("daten/obsan_ypll_kantone.csv"), csv("daten/obsan_suizid_kantone.csv")]);
    const ab = await (await fetch("daten/abrufdatum.txt")).text();
    const m = ab.match(/Abgerufen: (\d{4})-(\d\d)-(\d\d)/);
    if (m && document.getElementById("stand")) document.getElementById("stand").textContent = `Daten abgerufen am ${+m[3]}.${+m[2]}.${m[1]} · Obsan-Stand 22.12.2025`;

    const yearOf = j => /^\d{4}-\d{2}$/.test(j) ? +j.slice(0, 4) + 4 : +j;
    const ser = (rows, kanton, cat = "", sex = "Total") => rows
      .filter(r => r.kanton === kanton && (r.kategorie || "") === cat && r.geschlecht === sex && r.wert)
      .map(r => [yearOf(r.jahr), +r.wert]).sort((a, b) => a[0] - b[0]);
    // "1998-02" = 5-year window 1998-2002, plotted at its last year

    // 1 Schere
    const geb = bil.map(r => [+r.jahr, +r.lebendgeburten]), tod = bil.map(r => [+r.jahr, +r.todesfaelle]);
    register(() => lineChart(document.getElementById("c-schere"), {
      series: [{ name: "Geburten", color: C.geb, pts: geb }, { name: "Todesfälle", color: C.tod, pts: tod }],
      area: { a: 0, b: 1 }, yZero: true,
      xTicks: document.getElementById("c-schere").clientWidth < 460 ? [1971, 1990, 2010, 2025] : [1971, 1980, 1990, 2000, 2010, 2020, 2025] }));

    // 2 Tote + Risiko
    register(() => barsV(document.getElementById("c-tote"), tod.filter(p => p[0] >= 1998 && p[0] <= 2025), "#b9c6cf", 2022));
    register(() => lineChart(document.getElementById("c-mort"), {
      series: [{ name: "Schweiz", color: C.ch, dash: true, pts: ser(mort, "Schweiz") }, { name: "GR", color: C.gr, pts: ser(mort, "Graubünden") }],
      yZero: true }));

    // 3 Regionen
    register(() => {
      const host = document.getElementById("c-reg"); host.innerHTML = "";
      const agg = {};
      reg.forEach(r => {
        const y = +r.jahr, k = r.region.replace(/^Region /, "");
        agg[k] = agg[k] || { g: 0, t: 0, p: 0 };
        if (y >= 2016 && y <= 2025) { agg[k].g += +r.lebendgeburten; agg[k].t += +r.todesfaelle; }
        if (y === 2025) agg[k].p = +r.bestand_1jan;
      });
      const rows = Object.entries(agg).map(([k, v]) => ({ k, s: v.g - v.t, r: (v.g - v.t) / v.p * 1000 })).sort((a, b) => b.r - a.r);
      const W = Math.max(280, host.clientWidth), rh = 30, lab = W < 460 ? 128 : 220, H = rows.length * rh + 24;
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}` }, host);
      const mn = Math.min(...rows.map(r => r.r)), mx = Math.max(...rows.map(r => r.r)), span = mx - mn;
      const x0 = lab, x1 = W - 52, d0 = mn - span * 0.16, d1 = mx + span * 0.16, X = v => x0 + (x1 - x0) * (v - d0) / (d1 - d0);
      niceTicks(mn, mx, W < 460 ? 3 : 5).forEach(v => { el("line", { x1: X(v), x2: X(v), y1: 0, y2: H - 20, stroke: v === 0 ? C.ink3 : C.rule }, svg); txt(svg, X(v), H - 4, fmt(v), { "text-anchor": "middle" }); });
      rows.forEach((r, i) => {
        const y = i * rh + 4;
        const name = W < 460 ? r.k.replace("Engiadina Bassa/Val Müstair", "Engiadina B./V. Müstair") : r.k;
        txt(svg, lab - 8, y + 17, name, { "text-anchor": "end", fill: C.ink, "font-size": W < 460 ? 12 : 14 });
        el("rect", { x: Math.min(X(0), X(r.r)), y: y + 4, width: Math.abs(X(r.r) - X(0)), height: rh - 10, fill: r.r < 0 ? C.neg : C.pos, opacity: 0.9 }, svg);
        // value inside the bar when there is room, otherwise just outside its end
        const inside = Math.abs(X(r.r) - X(0)) > 46;
        const vx = r.r < 0 ? (inside ? X(r.r) + 5 : X(r.r) - 5) : (inside ? X(r.r) - 5 : X(r.r) + 5);
        const anchor = (r.r < 0) === inside ? "start" : "end";
        txt(svg, vx, y + 17, fmt(r.r, 1), { "text-anchor": anchor, fill: inside ? "#fff" : C.ink, "font-weight": 700 });
        txt(svg, W - 2, y + 17, (r.s > 0 ? "+" : "") + fmt(r.s), { "text-anchor": "end", fill: C.ink3 });
      });
    });

    // 6 Kantone (mean 2020-2024, min/max range)
    register(() => {
      const host = document.getElementById("c-kant"); host.innerHTML = "";
      const by = {};
      mort.filter(r => r.geschlecht === "Total" && +r.jahr >= 2020 && +r.jahr <= 2024).forEach(r => (by[r.kanton] = by[r.kanton] || []).push(+r.wert));
      const rows = Object.entries(by).map(([k, v]) => ({ k, m: v.reduce((a, b) => a + b) / v.length, lo: Math.min(...v), hi: Math.max(...v) })).sort((a, b) => b.m - a.m);
      const W = Math.max(280, host.clientWidth), rh = 22, lab = W < 460 ? 120 : 170, H = rows.length * rh + 24;
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}` }, host);
      const lo = 650, hi = 1000, X = v => lab + (W - lab - 52) * (v - lo) / (hi - lo);
      niceTicks(lo, hi, 4).forEach(v => { el("line", { x1: X(v), x2: X(v), y1: 0, y2: H - 20, stroke: C.rule }, svg); txt(svg, X(v), H - 4, fmt(v), { "text-anchor": "middle" }); });
      rows.forEach((r, i) => {
        const y = i * rh + 12, hl = r.k === "Graubünden", ch = r.k === "Schweiz";
        const col = hl ? C.gr : ch ? C.ink : "#8c9aa5";
        if (hl || ch) el("rect", { x: 0, y: y - 10, width: W, height: rh - 1, fill: hl ? "#e7f1f8" : "#f1f3f5" }, svg);
        txt(svg, lab - 8, y + 4, r.k, { "text-anchor": "end", fill: hl || ch ? C.ink : C.ink2, "font-weight": hl || ch ? 700 : 400, "font-size": W < 460 ? 12 : 13.5 });
        el("line", { x1: X(r.lo), x2: X(r.hi), y1: y, y2: y, stroke: col, "stroke-width": 2, opacity: 0.35 }, svg);
        el("circle", { cx: X(r.m), cy: y, r: hl || ch ? 6 : 4.5, fill: col }, svg);
        txt(svg, W - 2, y + 4, fmt(r.m), { "text-anchor": "end", fill: hl || ch ? C.ink : C.ink3, "font-weight": hl || ch ? 700 : 400 });
      });
    });

    // 7 Herz
    register(() => lineChart(document.getElementById("c-herz"), {
      series: [{ name: "Schweiz", color: C.ch, dash: true, pts: ser(herz, "Schweiz", "Mortalitätsrate") },
               { name: "GR", color: C.gr, pts: ser(herz, "Graubünden", "Mortalitätsrate") }], yZero: true }));

    // 8 Lebenserwartung
    ["Frauen", "Männer"].forEach(sex => register(() => lineChart(document.getElementById(sex === "Frauen" ? "c-le-f" : "c-le-m"), {
      series: [{ name: "Schweiz", color: C.ch, dash: true, pts: ser(le, "Schweiz", "bei der Geburt", sex) },
               { name: "GR", color: C.gr, pts: ser(le, "Graubünden", "bei der Geburt", sex) }],
      yDec: 1, yMin: 75, h: 240 })));

    // 9 YPLL
    register(() => lineChart(document.getElementById("c-ypll"), {
      series: [{ name: "Schweiz", color: C.ch, dash: true, pts: ser(ypll, "Schweiz") }, { name: "GR", color: C.gr, pts: ser(ypll, "Graubünden") }],
      yZero: true }));

    // 10 Suizid
    const S1 = "Suizidrate (exkl. Suizidhilfe)", S2 = "Suizidhilferate";
    register(() => lineChart(document.getElementById("c-suiz"), {
      series: [{ name: "Suizid CH", color: "#9fbfd6", dash: true, pts: ser(suiz, "Schweiz", S1), width: 2 },
               { name: "Suizidhilfe CH", color: "#f3b48a", dash: true, pts: ser(suiz, "Schweiz", S2), width: 2 },
               { name: "Suizid", color: "#0068a4", pts: ser(suiz, "Graubünden", S1), dots: true },
               { name: "Suizidhilfe", color: "#ee7733", pts: ser(suiz, "Graubünden", S2), dots: true }],
      yZero: true, yDec: 1, tickDec: 0, rMargin: 112, xLabel: y => `${y - 4}–${y}` }));
  } catch (e) {
    document.querySelectorAll(".chart").forEach(c => c.innerHTML = `<p class="err">Daten konnten nicht geladen werden (${e.message}). Die Seite muss über einen Webserver geöffnet werden, nicht als Datei.</p>`);
  }
})();

