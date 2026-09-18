// Code-Node «Mail bauen» im n8n-Workflow «Verkehr GR – Alarm (Mail)».
// Versionierte Kopie – der Live-Stand steht in n8n.
//
// Sprachregel (24.08.2026): Zaehlstellen melden «Deutlich langsamer als üblich»
// bzw. «Schritttempo»; «Stau» und «gesperrt» bleiben ASTRA und dem Tiefbauamt
// vorbehalten. Wer misst, nennt einen Vergleich, keinen Zustand.
//
// Ton: knapp. Keine Methodenerklaerungen, keine Belehrungen im Mailtext –
// nur Lage, Zahl, Link (von Julian so verlangt am 15.09.2026).

const D = $json;
const BLAU = '#0068A4', ROT = '#CC3311', ORANGE = '#EE7733', GRAU = '#666';
const DASH = 'https://julirai90-glitch.github.io/claude_code_git_workspace/verkehr/verkehr-dashboard-kacheln.html';
const TBA_QUELLE = 'https://strassen.gr.ch';
const TCS_LAGE = 'https://www.tcs.ch/de/tools/verkehrsinfo-verkehrslage/aktuelle-lage.php';

// «site» wirkt im Dashboard nur zusammen mit «view».
const dashLink = (view, site) => DASH + '?view=' + view + (site ? '&site=' + encodeURIComponent(site) : '');
const linkBtn = (href, text) => '<a href="' + href + '" style="color:' + BLAU + ';">' + text + '</a>';
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const chZeit = iso => {
  const d = new Date(iso);
  return isNaN(d) ? String(iso || '–')
    : new Intl.DateTimeFormat('de-CH', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', hour12: false }).format(d) + ' Uhr';
};

const zaehler = D.alarme.filter(a => a._quelle === 'zaehlstelle');
const astra = D.alarme.filter(a => a._quelle === 'astra');
const tba = D.alarme.filter(a => a._quelle === 'tba');

// Zweite Verteidigungslinie: Wenn nach dem Sortieren nichts uebrig bleibt, obwohl
// Alarme gemeldet wurden, stimmt etwas nicht - dann keine leere Mail verschicken,
// sondern hier abbrechen. Der fehlgeschlagene Lauf ist in n8n sichtbar.
if (D.anzahl > 0 && !zaehler.length && !astra.length && !tba.length) {
  throw new Error('Keine darstellbaren Alarme trotz anzahl=' + D.anzahl
    + '. Quellen: ' + JSON.stringify(D.alarme.map(a => a._quelle)));
}

// ---- Betreff ---------------------------------------------------------------
const teile = [];
if (zaehler.length) teile.push(zaehler.length + '× gemessen');
if (astra.length) teile.push(astra.length + '× ASTRA');
if (tba.length) teile.push(tba.length + '× Kanton');
const orte = [...new Set([
  ...zaehler.map(a => a.place),
  ...astra.map(a => String(a.ort || '').split(/ zwischen | bei /)[0]),
  ...tba.map(a => a.strasse)
])].slice(0, 3).join(', ');
const subject = 'Verkehr ' + (D.region || 'GR') + ': ' + teile.join(', ')
  + (orte ? ' – ' + orte : '');

// ---- Bausteine -------------------------------------------------------------
const box = (inhalt, farbe) =>
  '<div style="border-left:4px solid ' + farbe + ';background:#fafafa;padding:10px 14px;margin:0 0 10px 0;">' + inhalt + '</div>';
const h2 = t =>
  '<h2 style="font:600 15px/1.3 Helvetica,Arial,sans-serif;color:' + BLAU + ';margin:20px 0 8px 0;">' + esc(t) + '</h2>';
const titel = (t, farbe) =>
  '<div style="font:600 14px/1.4 Helvetica,Arial,sans-serif;color:' + (farbe || '#222') + ';">' + t + '</div>';
const text = t =>
  '<div style="font:13px/1.5 Helvetica,Arial,sans-serif;color:#333;">' + t + '</div>';
const links = arr =>
  '<div style="font:13px/1.8 Helvetica,Arial,sans-serif;margin-top:4px;">' + arr.join(' &nbsp;·&nbsp; ') + '</div>';

const dauerText = m => m == null ? ''
  : m < 90 ? (Math.round(m / 5) * 5 + ' Min') : (Math.floor(m / 60) + ' Std ' + (m % 60) + ' Min');

let html = '<div style="max-width:640px;font:14px/1.5 Helvetica,Arial,sans-serif;color:#222;">';
html += '<div style="font:600 17px/1.3 Helvetica,Arial,sans-serif;color:' + BLAU + ';">Verkehr '
  + esc(D.region || 'Graubünden') + '</div>';
html += '<div style="font-size:12px;color:' + GRAU + ';">' + esc(D.stand) + '</div>';

// ---- Gemessen --------------------------------------------------------------
if (zaehler.length) {
  html += h2('Gemessen');
  for (const a of zaehler) {
    const wort = a.schritttempo ? 'Schritttempo' : 'Deutlich langsamer als üblich';
    let inner = titel(esc(a.place) + ' <span style="color:' + GRAU + ';font-weight:400;">' + esc(a.road) + '</span>', ROT);
    inner += text('<b>' + esc(wort) + '</b> · ' + Math.round(a.speed) + ' km/h'
      + (a.ref ? ', sonst ' + Math.round(a.ref) : '')
      + (a.dauer != null ? ' · seit ' + esc(dauerText(a.dauer)) : ''));
    if (a.nachbarn && a.nachbarn.length) {
      inner += text(a.nachbarn.map(n => {
        const l = n.lage;
        return esc(n.place) + ' ' + esc(n.seite) + ' ' + n.km + ' km'
          + (l && l.speed != null ? ': ' + Math.round(l.speed) + ' km/h' : '');
      }).join(' · '));
    }
    // Warum dieser Alarm ausgeloest hat - das gehoert in die Mail, sonst wirkt
    // die Auswahl willkuerlich.
    if (a._grund === 'schritttempo') {
      inner += text('Gemeldet wegen Schritttempo'
        + (a._weitere ? ' · ' + a._weitere + ' weitere Messstellen auffällig' : ''));
    } else if (a._weitere) {
      inner += text('Gemeldet als Welle · ' + a._weitere
        + (a._weitere === 1 ? ' weitere Messstelle' : ' weitere Messstellen') + ' auffällig');
    }
    inner += links([
      linkBtn(dashLink('tile', a.id), 'Kachel'),
      linkBtn(dashLink('chart', a.id), 'Tagesverlauf'),
      linkBtn(dashLink('stau'), 'Übersicht')
    ]);
    html += box(inner, ROT);
  }
}

// ---- ASTRA -----------------------------------------------------------------
if (astra.length) {
  html += h2('ASTRA');
  for (const a of astra) {
    let inner = titel(esc(a.sachlage || 'Meldung'));
    inner += text(esc(a.ort));
    const det = [a.ursache, a.dauer, a.laenge_km ? a.laenge_km + ' km' : null,
                 a.zeitverlust_min ? a.zeitverlust_min + ' Min Zeitverlust' : null,
                 a.verkehrsfuehrung, a.empfehlung].filter(Boolean).map(esc);
    if (det.length) inner += text(det.join(' · '));
    inner += links([
      linkBtn(dashLink('meldungen'), 'Dashboard'),
      linkBtn(TCS_LAGE, 'Gegencheck TCS')
    ]);
    html += box(inner, ORANGE);
  }
}

// ---- Kanton ----------------------------------------------------------------
if (tba.length) {
  html += h2('Kanton');
  for (const a of tba) {
    let inner = titel(esc(a.strasse));
    inner += text(esc(a.zustand));
    const det = [a.ursache, a.hinweis, a.naechste_info,
                 a.auto_uebersetzt ? 'maschinell übersetzt' : null].filter(Boolean).map(esc);
    if (det.length) inner += text(det.join(' · '));
    inner += links([linkBtn(TBA_QUELLE, 'strassen.gr.ch')]);
    html += box(inner, ORANGE);
  }
}

// ---- Fuss: nur Beleg, keine Erklaerung -------------------------------------
html += '<p style="margin:18px 0 8px 0;">' + linkBtn(DASH, 'Dashboard öffnen') + '</p>';
html += '<div style="font-size:11px;color:' + GRAU + ';">Quellen: ASTRA, Tiefbauamt Graubünden · '
  + 'Daten ' + esc(chZeit(D.quellen.latest)) + '<br>'
  + 'Automatisch erzeugt – vor Publikation verifizieren.</div></div>';

return { json: { subject, html } };
