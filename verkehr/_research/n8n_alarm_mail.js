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
const chDatumZeit = iso => {
  const d = new Date(iso);
  return isNaN(d) ? String(iso || '')
    : new Intl.DateTimeFormat('de-CH', { timeZone: 'Europe/Zurich', day: '2-digit',
        month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .format(d).replace(',', '') + ' Uhr';
};
const chZeit = iso => {
  const d = new Date(iso);
  return isNaN(d) ? String(iso || '–')
    : new Intl.DateTimeFormat('de-CH', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', hour12: false }).format(d) + ' Uhr';
};

const enden  = D.alarme.filter(a => a._quelle === 'ende');
const zaehler = D.alarme.filter(a => a._quelle === 'zaehlstelle');
const astra = D.alarme.filter(a => a._quelle === 'astra');
const tba = D.alarme.filter(a => a._quelle === 'tba');

// Zweite Verteidigungslinie: Wenn nach dem Sortieren nichts uebrig bleibt, obwohl
// Alarme gemeldet wurden, stimmt etwas nicht - dann keine leere Mail verschicken,
// sondern hier abbrechen. Der fehlgeschlagene Lauf ist in n8n sichtbar.
if (D.anzahl > 0 && !zaehler.length && !astra.length && !tba.length && !enden.length) {
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
  ...tba.map(a => a.strasse),
  ...enden.map(a => String(a.ort || a._achse).split(/ zwischen | bei /)[0])
])].slice(0, 3).join(', ');
if (enden.length) teile.push(enden.length + '× beendet');
const kopf = D.art === 'sammel' ? 'Verkehr ' + (D.region || 'GR') + ', Verlauf: '
                                : 'Verkehr ' + (D.region || 'GR') + ': ';
const subject = kopf + teile.join(', ') + (orte ? ' – ' + orte : '');

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
  + esc(D.region || 'Graubünden')
  + (D.art === 'sammel' ? ' <span style="font-weight:400;font-size:14px;color:' + GRAU + ';">Verlauf der letzten Stunden</span>' : '')
  + '</div>';
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
    // Alles, was der Parser hergibt - die Redaktion soll nicht im Dashboard
    // nachschlagen muessen, was in der Meldung noch stand.
    // Keine Art- oder Baustellen-Marke: Beides steht bereits im Wortlaut der
    // Sachlage, und das Dashboard zeigt es genauso. Zwei Darstellungen derselben
    // Information sind eine zu viel.
    let inner = titel(esc(a.sachlage || 'Meldung'));
    inner += text(esc(a.ort));
    if (a.ursache) inner += text('<b>Ursache:</b> ' + esc(a.ursache));
    const masse = [a.laenge_km ? 'Länge ' + a.laenge_km + ' km' : null,
                   a.zeitverlust_min ? 'Zeitverlust ' + a.zeitverlust_min + ' Min' : null,
                   a.fahrbahnbreite_m ? 'Fahrbahnbreite ' + a.fahrbahnbreite_m + ' m' : null]
      .filter(Boolean).map(esc);
    if (masse.length) inner += text(masse.join(' · '));
    if (a.verkehrsfuehrung) inner += text('<b>Verkehrsführung:</b> ' + esc(a.verkehrsfuehrung));
    if (a.empfehlung) inner += text('<b>Empfehlung:</b> ' + esc(a.empfehlung));
    if (a.zusatz) inner += text('<b>Zusatz:</b> ' + esc(a.zusatz));
    if (a.dauer) inner += text('<b>Dauer:</b> ' + esc(a.dauer));
    // Zeitfelder: "seit" ist die Erfassung, "beginnt/bis" die Gueltigkeit - bei
    // vorab angekuendigten Baustellen liegen die weit auseinander.
    const zeiten = [a.seit ? 'erfasst ' + chDatumZeit(a.seit) : null,
                    a.beginnt ? 'gilt ab ' + chDatumZeit(a.beginnt) : null,
                    a.bis ? 'bis ' + chDatumZeit(a.bis) : null,
                    a.aktualisiert ? 'aktualisiert ' + chDatumZeit(a.aktualisiert) : null]
      .filter(Boolean).map(esc);
    if (zeiten.length) inner += '<div style="font:12px/1.5 Helvetica,Arial,sans-serif;color:'
      + GRAU + ';">' + zeiten.join(' · ') + '</div>';
    if (a.tmc) inner += '<div style="font:11px/1.5 Helvetica,Arial,sans-serif;color:'
      + GRAU + ';">TMC ' + esc(a.tmc) + '</div>';
    inner += links([
      // Ganze Seite statt Meldungs-Embed: von hier aus sollen alle Zaehlstellen
      // sichtbar sein (von Julian so verlangt am 24.09.2026).
      linkBtn(DASH, 'Dashboard'),
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
    if (a.ursache) inner += text('<b>Ursache:</b> ' + esc(a.ursache));
    if (a.hinweis) inner += text('<b>Hinweis:</b> ' + esc(a.hinweis));
    if (a.naechste_info) inner += text('<b>Nächste Information:</b> ' + esc(a.naechste_info));
    const reg = Array.isArray(a.regionen) ? a.regionen.join(', ') : a.regionen;
    const fuss = [reg ? 'Region ' + reg : null,
                  a.stand ? 'Stand ' + chDatumZeit(a.stand) : null,
                  a.auto_uebersetzt ? 'maschinell übersetzt – Wortlaut vor Zitat prüfen' : null]
      .filter(Boolean).map(esc);
    if (fuss.length) inner += '<div style="font:12px/1.5 Helvetica,Arial,sans-serif;color:'
      + GRAU + ';">' + fuss.join(' · ') + '</div>';
    inner += links([linkBtn(TBA_QUELLE, 'strassen.gr.ch')]);
    html += box(inner, ORANGE);
  }
}

// ---- Beendet ----------------------------------------------------------------
// Eine aufgehobene Lage steht nur in der Sammelmail. Sofort gemeldet wuerde sie
// zur zweiten Benachrichtigung fuer dasselbe Ereignis.
if (enden.length) {
  html += h2('Wieder frei');
  for (const a of enden) {
    let inner = titel(esc(a.ort || a._achse));
    const seit = a.seit ? new Date(a.seit) : null;
    const von = seit ? new Intl.DateTimeFormat('de-CH', { timeZone: 'Europe/Zurich',
      hour: '2-digit', minute: '2-digit', hour12: false }).format(seit) + ' Uhr' : null;
    const d = a.dauer_min;
    inner += text('keine Meldung mehr'
      + (von ? ' · gemeldet ab ' + esc(von) : '')
      + (d ? ' · gedauert ' + (d < 90 ? d + ' Min' : Math.floor(d / 60) + ' Std ' + (d % 60) + ' Min') : ''));
    html += box(inner, '#0a7d5a');
  }
}

// ---- Fuss: nur Beleg, keine Erklaerung -------------------------------------
html += '<p style="margin:18px 0 8px 0;">' + linkBtn(DASH, 'Dashboard öffnen') + '</p>';
html += '<div style="font-size:11px;color:' + GRAU + ';">Quellen: ASTRA, Tiefbauamt Graubünden · '
  + 'Daten ' + esc(chZeit(D.quellen.latest)) + '<br>'
  + 'Automatisch erzeugt – vor Publikation verifizieren.</div></div>';

return { json: { subject, html } };
