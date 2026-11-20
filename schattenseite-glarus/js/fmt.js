// German (Swiss) formatting helpers and the season calendar.
export const SEASON0 = Date.UTC(2026, 6, 1);      // season runs 1 Jul 2026 - 30 Jun 2027
export const NDAYS = 365;
export const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
export const MON3 = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
export function ymd(i) { const d = new Date(SEASON0 + i * 864e5); return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]; }
export function dateLabel(i, long = true) { const [, m, d] = ymd(i); return `${d}. ${long ? MONTHS[m - 1] : MON3[m - 1]}`; }
export function dayIndexOf(m, d) {               // month/day -> index in the season (any year)
  const y = m >= 7 ? 2026 : 2027; return Math.round((Date.UTC(y, m - 1, d) - SEASON0) / 864e5);
}
export function todayIndex() { const n = new Date(); const i = dayIndexOf(n.getMonth() + 1, n.getDate()); return Math.max(0, Math.min(NDAYS - 1, i)); }
export function hm(min) { if (min == null) return '–'; const h = Math.floor(min / 60), m = Math.round(min % 60); return `${h} h ${String(m).padStart(2, '0')} min`; }
export function hmShort(min) { if (min == null) return '–'; const h = Math.floor(min / 60), m = Math.round(min % 60); return m === 60 ? `${h + 1}:00` : `${h}:${String(m).padStart(2, '0')}`; }
export function clock(min) { min = ((Math.round(min) % 1440) + 1440) % 1440; return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`; }
export function int(n) { return Math.round(n).toLocaleString('de-CH').replace(/,/g, '’'); }
export function deg(x, d = 1) { return x.toFixed(d).replace('.', ',') + '°'; }
