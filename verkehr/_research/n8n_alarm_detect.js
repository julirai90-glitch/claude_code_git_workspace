// Code-Node «Alarme bestimmen» im n8n-Workflow «Verkehr GR – Alarm (Mail)».
// Versionierte Kopie – der Live-Stand steht in n8n, diese Datei ist die Soll-Fassung.
//
// Die Klassifikation ist 1:1 aus verkehr-dashboard-kacheln.html uebernommen
// (classify / buildFreeflow / recentSpeed / flow15 / lageSince). Das ist bewusst
// Duplikat statt Import: n8n kann die HTML-Datei nicht laden. Wer dort die
// Schwellen aendert, MUSS sie hier nachziehen – sonst alarmiert die Mail anders,
// als die Kachel zeigt, und niemand merkt es.

const TZ = 'Europe/Zurich';

// ---- Schwellen, identisch zum Dashboard ------------------------------------
const FF_PCTL = 0.85;
const STAU_FREE = 0.60, STAU_REL = 0.75, ZAEH_FREE = 0.80, ZAEH_REL = 0.85;
const STAU_MINFLOW = 120;
const STAU_MAXSPEED = 60, STAU_STEHEND = 25;
const REL_MIN_DAYS = 4;
const MESSUNG_MAXALTER = 15 * 60 * 1000;
const RECENT_SLOTS = 4;
const DROP_SITES = ['CH:0169', 'CH:0098', 'CH:0320'];
const SUSPECT_PEER = 200;

// ---- Ausloeseregel (Variante C aus _research/alarm-konzept.md, 10.08.2026) --
const MIN_DAUER_MIN = 30;          // mind. 30 Min am Stueck
// Rothenbrunnen/Isla Bella liegt vor dem Tunnel: Dort faellt das Tempo von 100 auf 80
// und die Fahrbahn wird einspurig. Halbe Kapazitaet heisst, dass bei Reiseverkehr der
// Rueckstau der Normalzustand ist und kein Ereignis - dieselbe Ueberlegung wie beim
// Gegenverkehr im Kerenzerbergtunnel (24.08.2026): Bei signalisierter Engstelle ist
// zaehfliessender Verkehr die vorgeschriebene Betriebsart.
// Belege: Freifluss dort 82 km/h (= das signalisierte Tempo 80), gegenueber 99 km/h
// bei Rothenbrunnen S nur 2,2 km weiter noerdlich. Die Stelle stellte allein 20 % aller
// Ereignisse im 42-Tage-Test.
// Sie ist auch KEIN Fruehindikator der Sonntagswelle, obwohl sie in der Prognosetabelle
// zuerst auftaucht: Geprueft am 17.09.2026 lag sie an keinem einzigen Sonntag vor
// 16 Uhr unter der Haelfte ihres ueblichen Werts - die tiefen Nachmittagswerte sind
// dort schlicht ueblich. Sie zaehlt aber als "weitere Stelle" fuer die Wellenerkennung.
const EXCLUDE_SITES = ['CH:0611'];
// Eine ASTRA-Meldung, die erst in zwei Monaten beginnt (geplante Baustelle), ist
// keine Lage. Nur alarmieren, was laeuft oder binnen dieser Frist beginnt.
const ASTRA_VORLAUF_H = 2;
// Nachbarstellen fuer die Einkreisung: wie viele je Richtung der Achse nennen.
// Beidseitig, denn genau darin lag am 10.08.2026 der Nachweis: Weesen stand bei
// 34 km/h, Walenstadt 17.6 km weiter oestlich gleichzeitig bei 120 – dazwischen
// der gesperrte Tunnel. Nur eine Seite zu nennen, verschenkt die Eingrenzung.
const NACHBARN_JE_SEITE = 2;


// ---- Regionen ---------------------------------------------------------------
// Vier Redaktionsgebiete. Die Zuordnung entscheidet, wer welche Mail bekommt.
// Zaehlstellen ueber ihre Id, Meldungen ueber Ortsnamen im Text.
const REGION_SITES = {
  'Glarus':            ['CH:0053', 'CH:0394', 'CH:0829', 'CH:0830'],
  'Linth':             ['CH:0588', 'CH:0308', 'CH:0314', 'CH:0216'],
  'Sarganserland':     ['CH:0245', 'CH:0318', 'CH:0603', 'CH:0035'],
  // Graubuenden ist der Rest - 33 Stellen, die hier nicht einzeln stehen muessen.
};
// Ortslisten je Region. Aufgeteilt aus der frueheren gemeinsamen 101er-Liste des
// ASTRA-Workflows. Der Grund fuer die Aufteilung ist nicht nur die Zustellung:
// "Wangen" stand dort ohne Kanton und fing am 17.09.2026 eine Meldung von der
// A15 bei Dübendorf ein. Wer Orte je Region fuehrt, muss sie genauer benennen.
const REGION_ORTE = {
  'Graubünden': ['Maienfeld','Landquart','Zizers','Igis','Chur','Obere Au','Domat','Ems',
    'Reichenau','Tamins','Bonaduz','Rothenbrunnen','Thusis','Zillis','Andeer','Splügen',
    'Sufers','Hinterrhein','San Bernardino','S. Bernardino','Mesocco','Soazza','Roveredo',
    'Grono','Lostallo','Cama','Klosters','Küblis','Saas','Serneus','Davos','Wolfgang',
    'Laret','Flüela','Susch','Zernez','Scuol','Müstair','Ofenpass','Buffalora','S-chanf',
    'Samedan','Pontresina','Bernina','Poschiavo','Brusio','Silvaplana','Maloja','Julier',
    'Sils','Casaccia','Bivio','Savognin','Plaun da Lej','Castasegna','Vicosoprano',
    'Tiefencastel','Lenzerheide','Churwalden','Malix','Alvaschein','Solis','Arosa',
    'Calfreisen','Langwies','Disentis','Sedrun','Tujetsch','Oberalp','Ilanz','Flims',
    'Laax','Trun','Viamala','Avers','Vals','Safien','Calanca','Brienz'],
  'Glarus': ['Kerenzerberg','Weesen','Näfels','Netstal','Niederurnen','Bilten','Glarus',
    'Mühlehorn','Mollis','Linthal','Schwanden'],
  'Sarganserland': ['Trübbach','Mels','Flums','Walenstadt','Murg','Sargans','Bad Ragaz',
    'Sevelen','Buchs','Haag','Oberriet','Sennwald','Kriessern','Wartau'],
  // "Wangen" bewusst nur als "Wangen-Siebnen" bzw. "Siebnen" - der blosse Ortsname
  // kommt auch an der A15 im Zuercher Oberland vor.
  'Linth': ['Reichenburg','Lachen','Schmerikon','Rapperswil','Jona','Eschenbach',
    'Siebnen','Wangen-Siebnen','Uznach','Tuggen','Altendorf','Rüti'],
};
const REGIONEN = ['Graubünden', 'Glarus', 'Sarganserland', 'Linth'];

// Abgestellte Regionen: keine Mail mehr, die Zuordnung laeuft aber weiter.
// Julian am 23.09.2026: Sarganserland aus, alle anderen unveraendert.
// Die Region bleibt bewusst in REGIONEN stehen. Naehme man sie heraus, fielen
// Meldungen aus Walenstadt oder Bad Ragaz auf die naechste passende Ortsliste
// und landeten bei einer fremden Redaktion - so werden sie weiterhin sauber
// dem Sarganserland zugeordnet und danach verworfen.
const REGIONEN_AUS = ['Sarganserland'];
const mailAus = r => REGIONEN_AUS.includes(r);

function regionVonSite(id) {
  for (const r in REGION_SITES) if (REGION_SITES[r].includes(id)) return r;
  return 'Graubünden';
}
function regionVonText(text) {
  // Korridor-Praefix abschneiden ("A3 Zürich -> Chur zwischen Walenstadt und Mels").
  // Vor dem Pfeil steht das Fahrtziel, nicht der betroffene Abschnitt - ohne diesen
  // Schnitt landet jede Meldung Richtung Chur bei der Bündner Redaktion, auch wenn
  // sie das Sarganserland betrifft. Dieselbe Regel gilt im ASTRA-Parser.
  let roh = String(text || '');
  const m = roh.match(/(?:<->|->)\s*\S+\s+([\s\S]*)/);
  if (m) roh = m[1];
  const t = roh.toLowerCase();
  for (const r of REGIONEN) {
    if ((REGION_ORTE[r] || []).some(o => t.indexOf(o.toLowerCase()) !== -1)) return r;
  }
  return null;   // keiner Region zuzuordnen -> nicht zustellen
}


// ---- Sofort oder sammeln? ---------------------------------------------------
// Ein beginnender Stau ist eine Nachricht und geht sofort raus. Was danach auf
// derselben Achse folgt - der Stau wandert, ASTRA stuft um - ist Lagebild und
// wartet auf die Sammelmail. Ohne diese Trennung kamen am 20.09.2026 sechzehn
// Mails an einem Tag, fuenf davon fuer eine einzige wandernde Kolonne am Walensee.
const SAMMEL_STUNDEN = 2;        // Takt der Sammelmail je Region
const LAGE_ENDE_MIN   = 30;      // so lange muss eine Meldung fehlen, bis sie als beendet gilt
const LAGE_NEU_STUNDEN = 3;
const ENDE_MAX_WARTEN  = 6;      // so lange darf eine Entwarnung auf eine Sendung warten      // danach gilt dieselbe Achse wieder als neuer Beginn

// Achse = Strassennummer, bewusst ohne Fahrtrichtung und ohne Abschnitt. Sonst
// zaehlt jede Verschiebung der Kolonne als neuer Beginn.
function achseVon(m) {
  const t = (m.ort || '') + ' ' + (m.strasse || '');
  const g = t.match(/\b(A\d+[a-c]?|H\d+[a-c]?)\b/);
  return g ? g[1] : (m.strasse || t.split(/[,|]/)[0] || '?').trim();
}
// Stufen statt Wortlaut: ASTRA nennt dieselbe Lage mal stockend, mal Stau.
function stufeVon(m) {
  const t = ((m.sachlage || '') + ' ' + (m.zustand || '') + ' ' + (m.art || '')).toLowerCase();
  if (/gesperrt|sperrung|geschlossen|unfall/.test(t)) return 3;
  if (/\bstau\b/.test(t)) return 2;
  if (/stockend|z[äa]hfl|verkehrsbehinderung|überlastung/.test(t)) return 1;
  return 0;
}
const istSperrung = m => stufeVon(m) === 3;

// ---- Zeit ------------------------------------------------------------------
function swissParts(d) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false }).formatToParts(d);
  const get = t => p.find(x => x.type === t).value;
  const dowMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { h: (+get('hour')) + (+get('minute')) / 60, dow: dowMap[get('weekday')] };
}
function swissDate(d) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d || new Date());
}
function swissTime(d) {
  return new Intl.DateTimeFormat('de-CH', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(d || new Date());
}

// ---- Eingaben --------------------------------------------------------------
const latest = $('Latest').first().json;
const BASE = $('Baseline').first().json;
const today = $('Today').first().json;
const astra = $('Meldungen ASTRA').first().json;
const tba = $('Strassen TBA').first().json;

// Plausibilitaets-Gate. Der gefaehrlichste Fehlerfall ist nicht der Absturz,
// sondern die stille Leermeldung: Liefert eine Quelle strukturell nichts mehr,
// faende dieser Code schlicht "nichts Neues" und schwiege – nicht zu unterscheiden
// von einer ruhigen Lage. Darum hier hart abbrechen. Ein fehlgeschlagener Lauf
// ist in n8n sichtbar, ein stilles Schweigen nicht.
for (const [name, obj, feld] of [['Latest', latest, 'sites'], ['Baseline', BASE, 'data'],
                                 ['Today', today, 'series'], ['Meldungen ASTRA', astra, 'meldungen'],
                                 ['Strassen TBA', tba, 'meldungen']]) {
  if (!obj || typeof obj !== 'object' || obj[feld] == null) {
    throw new Error('Quelle «' + name + '» lieferte kein Feld «' + feld + '» – Abbruch statt stiller Leermeldung.');
  }
}
if (!latest.sites.length) throw new Error('Quelle «Latest» lieferte 0 Zählstellen – Abbruch.');

const S = $getWorkflowStaticData('global');
if (!S.seen) S.seen = {};            // key -> {erst, zuletzt} (ISO)
if (!S.alarmiert) S.alarmiert = {};  // siteId|dir -> YYYY-MM-DD (Entprellung)
if (!S.offen) S.offen = {};          // region|achse -> {seit, stufe, ort}
if (!S.wartend) S.wartend = {};      // region -> [Eintraege fuer die naechste Sammelmail]
if (!S.letzteSammel) S.letzteSammel = {};   // region -> ISO der letzten Sammelmail
// Altlast abgestellter Regionen wegraeumen: was dort noch wartet, wird nie mehr
// versendet und wuerde staticData sonst dauerhaft mittragen.
for (const r of REGIONEN_AUS) { delete S.wartend[r]; delete S.letzteSammel[r]; }
for (const schl in S.offen) if (mailAus(schl.split('|')[0])) delete S.offen[schl];
// Beim allerersten Lauf ist jede laufende Meldung formal "neu" – die
// Brienzerstrasse ist seit November 2024 gesperrt. Dann nur den Stand merken
// und schweigen, sonst kommt zum Start eine Mail mit der ganzen Altlast.
const seeding = !S.init;
S.init = true;

const jetzt = new Date();
const heute = swissDate(jetzt);
const series = (today && today.series) || {};

// ---- Freifluss aus der Baseline (Dashboard: buildFreeflow) ------------------
const FREEFLOW = {};
if (BASE && BASE.data) {
  for (const key in BASE.data) {
    const vals = [];
    for (const cat of ['modo', 'fr', 'sa', 'so']) {
      const b = BASE.data[key][cat];
      if (b && b.speed_med) for (const v of b.speed_med) if (v) vals.push(v);
    }
    if (vals.length < 20) continue;
    vals.sort((a, b) => a - b);
    FREEFLOW[key] = vals[Math.floor(vals.length * FF_PCTL)];
  }
}

function slotIdx(d) { return Math.min(95, Math.max(0, Math.floor(swissParts(d || new Date()).h * 4))); }
function dayType() {
  const dow = swissParts(new Date((latest && latest.generated) || Date.now())).dow;
  return dow === 0 ? 'so' : dow === 6 ? 'sa' : dow === 5 ? 'fr' : 'modo';
}

// Kernklassifikation – null heisst "nicht beurteilbar", nicht "frei".
function classify(key, cat, idx, flow, speed) {
  const ff = FREEFLOW && FREEFLOW[key];
  const b = BASE && BASE.data && BASE.data[key] && BASE.data[key][cat];
  if (speed == null || !ff || !b) return null;
  const fm = b.flow_med && b.flow_med[idx], sm = b.speed_med && b.speed_med[idx];
  if (flow == null || (flow < STAU_MINFLOW && (fm || 0) < STAU_MINFLOW)) return null;
  const vFree = speed / ff;
  const sp75 = b.speed_p75 && b.speed_p75[idx];
  const vRef = sp75 ? speed / sp75 : (sm ? speed / sm : 1);
  const st = (vFree < STAU_FREE && vRef < STAU_REL && speed <= STAU_MAXSPEED) ? 'stau'
    : (vFree < ZAEH_FREE && vRef < ZAEH_REL) ? 'zaeh' : 'frei';
  return { status: st, vFree, vRel: vRef, ff, speed, ref: sm || sp75 || null };
}

function recentPoints(key) {
  const ser = series[key];
  if (!ser || !ser.length) return null;
  const j = swissParts(new Date()).h * 60;
  const ab = j - RECENT_SLOTS * 5;
  const w = ser.filter(p => {
    const hm = String(p.t).split(':'); const m = (+hm[0]) * 60 + (+hm[1]);
    return m >= ab && m <= j + 5;
  });
  return w.length ? w : null;
}
function flow15(key) {
  const w = recentPoints(key); if (!w) return null;
  const fl = w.filter(p => p.flow != null);
  return fl.length ? Math.round(fl.reduce((a, p) => a + p.flow, 0) / fl.length) : null;
}
function recentSpeed(key) {
  const w = recentPoints(key); if (!w) return null;
  const sp = w.filter(p => p.speed != null);
  return sp.length ? Math.round(sp.reduce((a, p) => a + p.speed, 0) / sp.length * 10) / 10 : null;
}
// Seit wann laeuft die Stoerung? Toleriert bis zu zwei unauffaellige Punkte,
// damit ein einzelner Ausreisser den Stau nicht kuenstlich zerteilt.
function lageSince(key, cat) {
  const ser = series[key];
  if (!ser || ser.length < 3) return null;
  let gap = 0, start = null;
  for (let i = ser.length - 1; i >= 0; i--) {
    const p = ser[i];
    const hm = String(p.t).split(':');
    const idx = Math.min(95, Math.floor(((+hm[0]) * 60 + (+hm[1])) / 15));
    const c = classify(key, cat, idx, p.flow, p.speed);
    if (c && c.status !== 'frei') { start = p.t; gap = 0; }
    else if (c) { if (++gap > 2) break; }
    else break;
  }
  return start;
}
function dauerMin(t) {
  if (!t) return null;
  const hm = String(t).split(':');
  const nowMin = Math.round(swissParts(new Date()).h * 60);
  const m = nowMin - ((+hm[0]) * 60 + (+hm[1]));
  return (m < 0 || m > 18 * 60) ? null : m;
}

// Hauptachsen im Sinn des Alarm-Konzepts: A13/A28 in GR sowie A3/A13a ausserhalb.
// Identisch zu corridorClass() im Dashboard, nur ohne die Pass-Kategorie.
const KT = { 'CH:0035': 'SG', 'CH:0053': 'GL', 'CH:0216': 'SZ', 'CH:0245': 'SG', 'CH:0308': 'SZ', 'CH:0314': 'SG', 'CH:0318': 'SG', 'CH:0394': 'GL', 'CH:0588': 'SG', 'CH:0603': 'SG', 'CH:0829': 'GL', 'CH:0830': 'GL' };
function istHauptachse(s) {
  const kt = KT[s.id] || 'GR';
  if (kt !== 'GR') return s.road === 'A3' || s.road === 'A13a';
  return /^A13|^A28/.test(s.road);
}

// ---- Zaehlstellen bewerten -------------------------------------------------
const sites = (latest.sites || []).filter(s => !DROP_SITES.includes(s.id));
// sanitize(): eine Richtung, die 0 zaehlt waehrend die Gegenrichtung stark
// befahren ist, misst nicht – sie steht nicht still.
for (const s of sites) {
  const p = s.dirs.positive, n = s.dirs.negative;
  const kill = d => { d.flow = null; d.speed = null; d.status = 'keine_daten'; };
  if (p.flow === 0 && (n.flow || 0) >= SUSPECT_PEER) kill(p);
  if (n.flow === 0 && (p.flow || 0) >= SUSPECT_PEER) kill(n);
}

const cat = dayType();
const nDays = (BASE.n && BASE.n[cat]) || 0;
const idx = slotIdx();
const lage = {};   // siteId|dir -> {status, speed, ref, since, dauer}

if (nDays >= REL_MIN_DAYS) {
  for (const s of sites) {
    const alter = s.ts ? (Date.now() - Date.parse(s.ts)) : null;
    if (alter != null && alter > MESSUNG_MAXALTER) continue;   // Frische-Gate
    for (const dir of ['positive', 'negative']) {
      const d = s.dirs[dir], key = s.id + '|' + dir;
      const sp = recentSpeed(key), fl = flow15(key);
      if (d.status === 'keine_daten' && sp == null) continue;
      const c = classify(key, cat, idx, fl != null ? fl : d.flow, sp != null ? sp : d.speed);
      if (!c) continue;
      const since = c.status !== 'frei' ? lageSince(key, cat) : null;
      lage[key] = { status: c.status, speed: c.speed, ref: c.ref, ff: c.ff, since, dauer: dauerMin(since) };
    }
  }
}

// Achsgruppe: A13a/A13b/A13c gehoeren zusammen, A3 ist eigen.
function achse(s) { return String(s.road || '').replace(/[a-z]+$/, ''); }
function kmAbstand(a, b) {
  const dx = (b.lon - a.lon) * 111 * Math.cos(a.lat * Math.PI / 180), dy = (b.lat - a.lat) * 111;
  return Math.sqrt(dx * dx + dy * dy);
}
// Nachbarn auf derselben Achse, getrennt nach beiden Seiten. Welche Koordinate
// "entlang" der Achse laeuft, wird aus ihrer Ausdehnung bestimmt: die A13 verlaeuft
// nord-sued (lat), die A3 im Linthgebiet ost-west (lon). Fest verdrahten liesse
// sich das nicht, ohne bei der naechsten Achse wieder falsch zu liegen.
function nachbarn(s) {
  const gruppe = sites.filter(o => achse(o) === achse(s) && o.lat != null && o.lon != null);
  if (gruppe.length < 2 || s.lat == null) return [];
  const lats = gruppe.map(o => o.lat), lons = gruppe.map(o => o.lon);
  const spanLat = (Math.max(...lats) - Math.min(...lats)) * 111;
  const spanLon = (Math.max(...lons) - Math.min(...lons)) * 111 * Math.cos(s.lat * Math.PI / 180);
  const nordSued = spanLat >= spanLon;
  const pos = o => nordSued ? o.lat : o.lon;
  const info = o => {
    const beide = ['positive', 'negative'].map(dd => lage[o.id + '|' + dd]).filter(Boolean);
    const schlimmste = beide.sort((a, b) => (a.speed == null ? 999 : a.speed) - (b.speed == null ? 999 : b.speed))[0];
    return {
      place: o.place, road: o.road, km: Math.round(kmAbstand(s, o) * 10) / 10,
      seite: nordSued ? (pos(o) > pos(s) ? 'nördlich' : 'südlich') : (pos(o) > pos(s) ? 'östlich' : 'westlich'),
      lage: schlimmste || null
    };
  };
  const andere = gruppe.filter(o => o.id !== s.id);
  const auf = andere.filter(o => pos(o) > pos(s)).map(info).sort((a, b) => a.km - b.km).slice(0, NACHBARN_JE_SEITE);
  const ab = andere.filter(o => pos(o) < pos(s)).map(info).sort((a, b) => a.km - b.km).slice(0, NACHBARN_JE_SEITE);
  return [...ab.reverse(), ...auf];
}

// ---- Alarme: Zaehlstellen --------------------------------------------------
const alarmeZaehler = [];
for (const s of sites) {
  if (EXCLUDE_SITES.includes(s.id)) continue;
  if (!istHauptachse(s)) continue;
  // Abgestellte Region: kein eigener Alarm. Die Stelle bleibt trotzdem in "lage"
  // und zaehlt als "weitere Stelle" fuer die Wellenerkennung der Nachbarregionen.
  if (mailAus(regionVonSite(s.id))) continue;
  for (const dir of ['positive', 'negative']) {
    const key = s.id + '|' + dir;
    const L = lage[key];
    if (!L || L.status !== 'stau') continue;
    if (L.dauer == null || L.dauer < MIN_DAUER_MIN) continue;
    if (S.alarmiert[key] === heute) continue;        // max. 1 pro Standort und Tag
    if (!seeding) S.alarmiert[key] = heute;
    if (seeding) continue;   // wie ASTRA/TBA: waehrend seeding nur Stand merken, nicht alarmieren

    // Einkreisung: Nachbarstellen derselben Achse, beidseitig.
    // Bewusst ohne Aussage ueber die Fahrtrichtung – was "positive" geografisch
    // heisst, ist aus dem Feed nicht belegt. Angegeben wird die Himmelsrichtung
    // der Nachbarstelle, die ist aus den Koordinaten belegbar.
    const nb = nachbarn(s);

    // ---- Was ist eine Nachricht und was Wiederholung? -----------------------
    // Drei Wege zum Alarm; einer genuegt:
    //   a) Schritttempo - der gemessene Wert selbst, nie Routine
    //   b) eine breite Welle (mind. zwei weitere Stellen) - auch werktags relevant
    //   c) sonst: mind. eine weitere Stelle UND ausserhalb der Pendlerzeiten
    //
    // Die Schritttempo-Ausnahme ist nicht optional. Eine fruehere Fassung ohne sie
    // haette am 10.08.2026 den gesperrten Kerenzerbergtunnel unterdrueckt, weil er
    // auf einen Montagmorgen fiel - also genau den Fall, der dieses System
    // begruendet hat. Im 42-Tage-Test waren 34 der 42 gefilterten Ereignisse
    // auffaellig schwer (unter 25 km/h oder laenger als eine Stunde).
    const stdJetzt = Math.floor(swissParts(jetzt).h);
    const pendlerzeit = (cat === 'modo' || cat === 'fr')
      && ((stdJetzt >= 6 && stdJetzt < 9) || (stdJetzt >= 16 && stdJetzt < 19));
    const weitere = Object.keys(lage).filter(k2 =>
      k2 !== key && k2.split('|')[0] !== s.id && lage[k2].status === 'stau').length;
    const schritt = L.speed != null && L.speed < STAU_STEHEND;
    if (!(schritt || weitere >= 2 || (weitere >= 1 && !pendlerzeit))) continue;
    const grund = schritt ? 'schritttempo' : weitere >= 2 ? 'welle' : 'welle';

    alarmeZaehler.push({
      _quelle: 'zaehlstelle',
      _region: regionVonSite(s.id),
      _weitere: weitere,
      _grund: grund,
      id: s.id, place: s.place, road: s.road, richtung: dir,
      speed: L.speed, ref: L.ref, freeflow: L.ff,
      seit: L.since, dauer: L.dauer,
      schritttempo: L.speed != null && L.speed < STAU_STEHEND,
      nachbarn: nb
    });
  }
}

// ---- Alarme: ASTRA-Meldungen (neu) -----------------------------------------
function merke(key) {
  const alt = S.seen[key];
  S.seen[key] = { erst: alt ? alt.erst : jetzt.toISOString(), zuletzt: jetzt.toISOString() };
  return !alt;
}
const alarmeAstra = [];
for (const m of (astra.meldungen || [])) {
  const key = 'astra|' + (m.ort || '') + '|' + (m.sachlage || '') + '|' + (m.seit || '');
  const neu = merke(key);
  if (!neu || seeding) continue;
  // Geplante Baustellen weit in der Zukunft sind Ankuendigung, nicht Lage.
  if (m.beginnt) {
    const vorlauf = (Date.parse(m.beginnt) - jetzt.getTime()) / 3600000;
    if (vorlauf > ASTRA_VORLAUF_H) continue;
  }
  const rA = regionVonText((m.ort || '') + ' ' + (m.sachlage || ''));
  if (!rA || mailAus(rA)) continue;   // keiner Redaktion zuzuordnen oder abgestellt
  alarmeAstra.push({ ...m, _quelle: 'astra', _region: rA });
}

// ---- Alarme: TBA-Strassenzustand (neu) -------------------------------------
const alarmeTba = [];
for (const m of (tba.meldungen || [])) {
  // Dedupe-Schluessel wie im TBA-Parser: die Id vergibt das Amt pro Regionszeile,
  // nicht pro Sachverhalt – ueber sie zu gehen waere falsch.
  const key = 'tba|' + (m.strasse || '') + '|' + (m.art || '') + '|' + (m.zustand || '');
  const neu = merke(key);
  if (!neu || seeding) continue;
  // Der Absender ist das Tiefbauamt Graubünden - seine Meldungen betreffen
  // definitionsgemäss Bündner Strassen, auch wenn der Ortsname nicht in der
  // Liste steht (Nebentäler, Nebenstrassen).
  if (mailAus('Graubünden')) continue;
  alarmeTba.push({ ...m, _quelle: 'tba', _region: 'Graubünden' });
}

// Seen aufraeumen: was 24 h nicht mehr gemeldet wurde, faellt raus. Taucht es
// spaeter wieder auf, ist es eine neue Lage und darf erneut alarmieren.
const grenze = jetzt.getTime() - 24 * 3600000;
for (const k in S.seen) if (Date.parse(S.seen[k].zuletzt) < grenze) delete S.seen[k];
for (const k in S.alarmiert) if (S.alarmiert[k] !== heute) delete S.alarmiert[k];

// Hat eine Zaehlstelle einen amtlichen Gegenbeleg? Reiner Ortsnamen-Abgleich,
// darum als Indiz ausgewiesen und nicht als Tatsache. Fehlt er, ist genau das
// die Nachricht: dann ist die Messung frueher dran als die Amtsmeldung.
const astraAlleTexte = (astra.meldungen || []).map(m => (m.ort || '') + ' ' + (m.sachlage || ''));
for (const a of alarmeZaehler) {
  const ort = String(a.place).split(/[\/ ]/)[0];
  a.astraHinweis = astraAlleTexte.filter(t => ort.length > 3 && t.includes(ort));
}

const alarme = [...alarmeZaehler, ...alarmeAstra, ...alarmeTba];

// Gegenprobe. Am 16.09.2026 ging um 07:30 eine vollstaendig leere Mail raus: Der
// Schluessel hiess damals «typ» und wurde beim Spread von einem gleichnamigen Feld
// der TBA-Meldung ueberschrieben ('zustand'). Der Mail-Node fand danach keinen
// einzigen Block mehr, verschickte aber trotzdem - anzahl war ja groesser null.
// Seither heisst der Schluessel «_quelle», und hier wird geprueft, dass jeder Alarm
// eine bekannte Quelle traegt. Lieber ein sichtbarer Fehlschlag als eine leere Mail.
const ERLAUBT = ['zaehlstelle', 'astra', 'tba'];
const kaputt = alarme.filter(a => !ERLAUBT.includes(a._quelle) || !a._region);
if (kaputt.length) {
  throw new Error('Alarm ohne gültige Quelle (' + kaputt.length + '): '
    + JSON.stringify(kaputt[0]).slice(0, 200));
}

// ---- Einordnen: sofort, sammeln oder beendet --------------------------------
const sofort = [];
const gesehenAchsen = new Set();

for (const a of alarme) {
  // Zaehlstellen-Alarme gehen immer sofort: sie entstehen nur, wenn die Regel aus
  // dem Alarm-Konzept greift, und sind damit ohnehin selten.
  if (a._quelle === 'zaehlstelle') { sofort.push(a); continue; }

  const achse = achseVon(a);
  const schl = a._region + '|' + achse;
  gesehenAchsen.add(schl);
  const stufe = stufeVon(a);
  const bisher = S.offen[schl];

  if (!bisher || (jetzt - Date.parse(bisher.seit)) > LAGE_NEU_STUNDEN * 3600000) {
    // Beginn - das ist die Nachricht.
    S.offen[schl] = { seit: jetzt.toISOString(), stufe, ort: a.ort || a.strasse || achse };
    sofort.push({ ...a, _anlass: 'beginn', _achse: achse });
  } else if (stufe > bisher.stufe && istSperrung(a)) {
    // Verschaerfung bis zur Sperrung durchbricht die Sammlung, eine Umstufung von
    // stockend auf Stau nicht - sonst meldet jede Neubewertung derselben Kolonne.
    S.offen[schl] = { ...bisher, stufe };
    sofort.push({ ...a, _anlass: 'sperrung', _achse: achse });
  } else {
    S.offen[schl] = { ...bisher, stufe: Math.max(stufe, bisher.stufe) };
    (S.wartend[a._region] = S.wartend[a._region] || []).push({ ...a, _anlass: 'verlauf', _achse: achse });
  }
}

// ---- Beendete Lagen ---------------------------------------------------------
// Eine Meldung, die nicht mehr im Feed steht, ist aufgehoben. Der Parser des
// Meldungs-Workflows verwirft die Aufhebungsmeldungen von ASTRA, also erkennen
// wir das Ende am Verschwinden - erst nach LAGE_ENDE_MIN, damit ein einzelner
// Aussetzer nicht als Entwarnung durchgeht.
const nochImFeed = new Set();
for (const m of (astra.meldungen || [])) nochImFeed.add(m._region ? m._region + '|' + achseVon(m) : null);
for (const a of alarmeAstra.concat(alarmeTba)) nochImFeed.add(a._region + '|' + achseVon(a));
for (const m of (astra.meldungen || [])) {
  const r = regionVonText((m.ort || '') + ' ' + (m.sachlage || ''));
  if (r) nochImFeed.add(r + '|' + achseVon(m));
}
for (const m of (tba.meldungen || [])) nochImFeed.add('Graubünden|' + achseVon(m));

for (const schl in S.offen) {
  if (nochImFeed.has(schl)) { S.offen[schl].zuletzt = jetzt.toISOString(); continue; }
  const o = S.offen[schl];
  const weg = jetzt - Date.parse(o.zuletzt || o.seit);
  if (weg < LAGE_ENDE_MIN * 60000) continue;
  const region = schl.split('|')[0];
  const dauer = Math.round((Date.parse(o.zuletzt || o.seit) - Date.parse(o.seit)) / 60000);
  (S.wartend[region] = S.wartend[region] || []).push({
    _quelle: 'ende', _region: region, _anlass: 'ende', _achse: schl.split('|')[1],
    _wartetSeit: jetzt.toISOString(),
    ort: o.ort, seit: o.seit, dauer_min: dauer
  });
  delete S.offen[schl];
}

// ---- Wann geht was raus? ----------------------------------------------------
const items = [];
const gemeinsam = {
  stand: swissTime(jetzt) + ' Uhr, ' + heute.split('-').reverse().join('.'),
  quellen: {
    latest: latest.generated, astra: astra.generated, tba: tba.generated,
    baselineTage: nDays, bewertet: Object.keys(lage).length
  }
};

for (const r of REGIONEN) {
  if (seeding) continue;
  if (mailAus(r)) continue;   // abgestellte Region: keine Sendung
  const warten = S.wartend[r] || [];
  const enden = warten.filter(a => a._quelle === 'ende');
  const verlauf = warten.filter(a => a._quelle !== 'ende');
  const eigene = sofort.filter(a => a._region === r);

  if (eigene.length) {
    // Eine Entwarnung rechtfertigt keine eigene Mail - sie faehrt mit. Sonst kam
    // fuer jedes "A3 wieder frei" eine Sendung, die niemand gebraucht hat.
    items.push({ json: { region: r, art: 'sofort', anzahl: eigene.length + enden.length,
                         seeding, alarme: eigene.concat(enden), ...gemeinsam } });
    S.wartend[r] = verlauf;
    continue;
  }

  // Sammelmail nur, wenn ein echter Verlauf wartet. Reine Entwarnungen warten auf
  // die naechste Sendung - laenger als ENDE_MAX_WARTEN aber nicht, sonst kommt die
  // Entwarnung womoeglich erst Tage spaeter.
  const letzte = S.letzteSammel[r] ? Date.parse(S.letzteSammel[r]) : 0;
  const faellig = (jetzt - letzte) >= SAMMEL_STUNDEN * 3600000;
  const endeUeberfaellig = enden.some(a =>
    (jetzt - Date.parse(a._wartetSeit || jetzt.toISOString())) >= ENDE_MAX_WARTEN * 3600000);
  if (faellig && (verlauf.length || endeUeberfaellig)) {
    items.push({ json: { region: r, art: 'sammel', anzahl: warten.length,
                         seeding, alarme: warten, ...gemeinsam } });
    S.wartend[r] = [];
    S.letzteSammel[r] = jetzt.toISOString();
  }
}
if (!items.length) {
  items.push({ json: { region: null, art: null, anzahl: 0, seeding, alarme: [], ...gemeinsam } });
}
return items;
