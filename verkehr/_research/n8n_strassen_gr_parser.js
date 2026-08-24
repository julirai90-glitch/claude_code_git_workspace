// Code-Node "Parse Strassenzustand" aus dem n8n-Workflow
// "Verkehr GR – Strassenzustand (TBA GR)", Workflow-ID qWNsUBgHtJLT48pX.
// Hier versioniert, damit der Stand nachvollziehbar ist – die ausgefuehrte Kopie
// lebt in n8n. Bei Aenderungen: beide Seiten gleichziehen.
//
// Quelle: Tiefbauamt Graubuenden, strassen.gr.ch, Endpunkt /CurrentMessages/Get.
// Das ist der Endpunkt, den die Seite selbst fuer ihre Meldungstabelle nutzt
// (DevExtreme-DataGrid, loadUrl im Inline-Script von /currentmessages). Er liefert
// ohne Login sauberes JSON. Nicht zu verwechseln mit der offiziellen REST-
// Schnittstelle des TBA, die per Antragsformular mit Benutzername/Passwort
// vergeben wird (strassen.gr.ch/Information/Document/55) – die Nutzung wurde
// telefonisch bewilligt, die Zugangsdaten konnte das Amt aber nicht liefern.
// Konsequenz: Der Endpunkt ist unversioniert und kann sich ohne Ankuendigung
// aendern. Bricht der Parser, ist das der erste Ort zum Nachschauen.
//
// Warum ueberhaupt: Der ASTRA-Feed (Workflow "Verkehrsmeldungen") deckt nur
// Nationalstrassen ab. Kantonsstrassen, Paesse und der Autoverlad Vereina
// erscheinen ausschliesslich hier.
//
// Abgleich mit dem Feed vom 24.08.2026 (20 Meldungen): Der Rueckgabewert ist
// {data:[...], totalCount, groupCount, summary}; je Eintrag Id, RegionNumber,
// RegionDescription, Icon, Message (HTML), MessageTime.
const raw = $input.first().json;
const liste = Array.isArray(raw) ? raw : (raw.data || []);

// Zustandsstufen des TBA. Die Namen stammen aus der Legende der Kartenansicht
// (strassen.gr.ch, Klassen state-color-*): normal befahrbar, schneebedeckt,
// Schneeketten obligatorisch, Hinweis, Behinderung, gesperrt, keine Informationen.
// Welche Icon-Dateien es dazu gibt, wurde am 24.08.2026 einzeln geprueft
// (HTTP-Status auf /images/states/<name>.svg). Vorhanden sind genau diese neun;
// "normal befahrbar" und "keine Informationen" haben keine Icon-Datei – dafuer
// wird auch keine Meldung ausgegeben, gemeldet wird nur die Abweichung.
const ART = {
  gesperrt: 'gesperrt',
  wintersperre: 'wintersperre',
  behinderung: 'behinderung',
  schneebedeckt: 'schnee',
  schneeketten_obligatorisch: 'schneeketten',
  info: 'hinweis',
  vereina_normal: 'vereina',
  vereina_wartezeit_00: 'vereina',
  vereina_gesperrt: 'vereina'
};
// Was zuoberst steht. Eine Sperrung aendert die Reiseplanung, ein Hinweis nicht.
const RANK = { gesperrt: 0, wintersperre: 1, behinderung: 2, schneeketten: 3,
               schnee: 4, hinweis: 5, vereina: 6, unbekannt: 7 };

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '' };
function decode(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
          .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
          .replace(/&(\w+);/g, (m, n) => (n in ENT ? ENT[n] : m));
}
// Fliesstext aus einem HTML-Fragment. Block-Enden werden zu Leerzeichen, damit
// aus zwei <p> nicht ein zusammengeklebtes Wort wird.
function text(html) {
  return decode(String(html)
      .replace(/<\s*br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|tr)>/gi, ' ')
      .replace(/<[^>]*>/g, ''))
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
// Die Meldung ist ein flaches Geruest aus <div class="...">: road, state,
// additional-info (mit cause-measure, hint, next-information) und msg-time.
// Nur "hint" enthaelt weiteres Markup, aber ausschliesslich <p>/<span>/<strong>,
// nie ein verschachteltes <div> – deshalb reicht der nicht-gierige Match bis zum
// naechsten </div>. Taucht dort eines Tages ein <div> auf, wird der Hinweis
// abgeschnitten (nicht verfaelscht); dann muss hier ein echter Parser her.
function block(html, cls) {
  const m = html.match(new RegExp('<div class="' + cls + '">([\\s\\S]*?)<\\/div>'));
  return m ? m[1] : '';
}

// MessageTime kommt ohne Zeitzone ("2026-08-24T04:38:33.6533333") und meint
// Schweizer Ortszeit. Ohne Umrechnung waere die Angabe im Sommer zwei Stunden
// zu frueh. Der Versatz wird fuer den jeweiligen Zeitpunkt aus der Zeitzonen-
// Datenbank geholt, damit Sommer- und Winterzeit beide stimmen.
function zurichOffset(ts) {
  const dtf = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Zurich', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const p = {};
  for (const x of dtf.formatToParts(new Date(ts))) p[x.type] = x.value;
  const h = p.hour === '24' ? '00' : p.hour;
  return Date.parse(`${p.year}-${p.month}-${p.day}T${h}:${p.minute}:${p.second}Z`) - ts;
}
function toISO(naive) {
  if (!naive) return null;
  const asUTC = Date.parse(String(naive).slice(0, 19) + 'Z');
  if (!asUTC) return null;
  // Zweiter Durchgang, weil der Versatz am ersten Schaetzwert abgelesen wird.
  // In der doppelt vorkommenden Stunde der Zeitumstellung bleibt eine Stunde
  // Unsicherheit – das ist ohne Zeitzonenangabe in der Quelle nicht aufloesbar.
  let off = zurichOffset(asUTC);
  off = zurichOffset(asUTC - off);
  return new Date(asUTC - off).toISOString().replace(/\.\d+Z$/, 'Z');
}

// Das TBA gibt dieselbe Meldung einmal pro betroffener Region aus – die
// Fluelastrasse steht am 24.08.2026 unter "Praettigau/Davos" UND unter
// "Unterengadin", die Italienische Strasse gleich dreifach. Fuer eine Liste ist
// das Doppelspurigkeit, die Regionsangabe selbst aber Information. Darum: einmal
// pro Meldung, mit allen Regionen daran.
const out = [];
const index = {};
for (const e of liste) {
  const html = e.Message || '';
  const slug = String(e.Icon || '').replace(/^.*\//, '').replace(/\.svg$/i, '');
  const strasse = text(block(html, 'road')).replace(/:\s*$/, '');
  const zustand = text(block(html, 'state'));
  if (!strasse && !zustand) continue;

  let hinweis = text(block(html, 'hint'));
  // Das TBA laesst italienischsprachige Meldungen maschinell uebersetzen und
  // kennzeichnet das im Text. Der Vermerk gehoert nicht in den Fliesstext, die
  // Information aber sehr wohl ins Dashboard – deshalb als eigenes Feld.
  const autoUebersetzt = /Automatisch übersetzt/i.test(hinweis);
  if (autoUebersetzt) hinweis = hinweis.replace(/\s*Automatisch übersetzt\s*/i, ' ').trim();

  const stand = toISO(e.MessageTime);
  const region = String(e.RegionDescription || '').trim();
  const dublette = strasse + '|' + zustand + '|' + (stand || '');
  if (index[dublette]) {
    const v = index[dublette];
    if (region && v.regionen.indexOf(region) === -1) v.regionen.push(region);
    if (e.RegionNumber != null && e.RegionNumber < v.region_nr) v.region_nr = e.RegionNumber;
    continue;
  }

  const eintrag = {
    id: e.Id,
    regionen: region ? [region] : [],
    region_nr: e.RegionNumber,
    strasse: strasse,
    zustand: zustand,
    ursache: text(block(html, 'cause-measure')) || null,
    hinweis: hinweis || null,
    naechste_info: text(block(html, 'next-information'))
      .replace(/^Nächste Information:\s*/i, '') || null,
    // "roadcondition" = Strassenzustand, "roadevent" = Ereignis. Steht als
    // Klasse am aeussersten div der Meldung.
    typ: /msg-roadevent/.test(html) ? 'ereignis' : 'zustand',
    art: ART[slug] || 'unbekannt',
    icon: slug,
    auto_uebersetzt: autoUebersetzt,
    stand: stand
  };
  index[dublette] = eintrag;
  out.push(eintrag);
}
// Schwere zuerst, innerhalb davon das Neueste zuoberst.
out.sort((a, b) => (RANK[a.art] - RANK[b.art]) ||
                   (Date.parse(b.stand || 0) - Date.parse(a.stand || 0)));

const payload = {
  generated: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
  quelle: 'Tiefbauamt Graubünden (strassen.gr.ch)',
  meldungen: out
};
const sd = $getWorkflowStaticData('global');
sd.strassen = JSON.stringify(payload);
return [{ json: { ok: true, count: out.length, geprueft: liste.length } }];
