// Code-Node "Parse Meldungen" aus dem n8n-Workflow "Verkehr Meldungen".
// Hier versioniert, damit der Stand nachvollziehbar ist – die ausgefuehrte Kopie
// lebt in n8n. Bei Aenderungen: beide Seiten gleichziehen.
//
// Amtliche ASTRA-Verkehrsmeldungen (DATEX II, pullTrafficMessages) auf die
// Suedostschweiz eindampfen. Der Abruf nutzt If-Modified-Since = -24h, liefert
// also rund 400 KB statt 23 MB - dadurch ist dieser Node zustandslos: jeder Lauf
// sieht die vollstaendige Lage der letzten 24 Stunden und braucht keinen Speicher.
// Wichtig: Die Antwort kommt gzip-komprimiert, deshalb haengt davor ein
// extractFromFile-Node - mit responseFormat "text" landet der rohe Gzip-Block im
// Parser (56 KB statt 430 KB, null Treffer).
const raw = $input.first().json;
const xml = (typeof raw === 'string') ? raw : (raw.data || raw.body || '');

// Strassen, an denen wir Zaehlstellen haben.
const ROADS = /\b(A13[a-c]?|A28|A29|A3|A15|H3[ab]?|H17|H19|H27|H28[a-c]?|H29|H417b)\b/;
// Davon die, die es NUR in unserem Gebiet gibt: A28 (Landquart-Klosters-Davos),
// A29 (Julier/Alvaschein), H3a/H3b (Lenzerheide, Bergell), H17 (Glarus), H19
// (Surselva), H27 (Engadin), H28a-c (Davos/Fluela/Ofen), H29 (Bernina/Puschlav),
// H417b (Davos). Nennt eine Meldung eine davon, liegt sie zwangslaeufig bei uns –
// der Ortsfilter darf sie dann nicht mehr wegwerfen.
// Anlass (16.08.2026): Rueckmeldung aus der Redaktion, dass eine Sperrung der N28
// im Praettigau nicht auftauchte. Gegenprobe ueber alle 45 Zaehlstellen: einzig
// "Pardisla/Chlus-Tunnel" (A28) hatte keinen passenden Eintrag in PLACES – Schiers,
// Gruesch, Seewis, Fideris, Jenaz und die Chlus fehlten dort komplett. Statt die
// Ortsliste endlos zu verlaengern, greift fuer diese Strassen jetzt die Strasse
// selbst als Regionsnachweis.
const REGIONAL_ROADS = /\b(A28|A29|H3[ab]?|H17|H19|H27|H28[a-c]?|H29|H417b)\b/;
// Ortsnamen entlang unserer Korridore. Noetig fuer die Strassen, die weit ueber
// unser Gebiet hinausreichen (A3, A13, A15). Bewusst OHNE "Chur" und "Sargans"
// allein: die A3 ist landesweit Richtung Chur ausgeschildert ("A3 Basel <-> Chur"),
// sonst faengt der Filter halb Zuerich und Basel mit ein.
const PLACES = ['Maienfeld','Landquart','Zizers','Igis','Chur Nord','Obere Au','Domat','Ems','Reichenau','Tamins','Bonaduz','Rothenbrunnen','Thusis','Zillis','Andeer','Splügen','Sufers','Hinterrhein','San Bernardino','S. Bernardino','Mesocco','Soazza','Roveredo','Grono','Lostallo','Cama','Klosters','Küblis','Saas','Serneus','Davos','Wolfgang','Laret','Flüela','Susch','Zernez','Scuol','Müstair','Ofenpass','Buffalora','S-chanf','Samedan','Pontresina','Bernina','Poschiavo','Brusio','Tirano','Silvaplana','Maloja','Julier','Sils','Casaccia','Bivio','Savognin','Plaun da Lej','Castasegna','Chiavenna','Vicosoprano','Tiefencastel','Lenzerheide','Churwalden','Malix','Alvaschein','Solis','Arosa','Calfreisen','Langwies','Disentis','Sedrun','Tujetsch','Oberalp','Ilanz','Flims','Laax','Trun','Trübbach','Balzers','Mels','Flums','Walenstadt','Murg','Mühlehorn','Kerenzerberg','Weesen','Näfels','Niederurnen','Bilten','Reichenburg','Lachen','Schmerikon','Rapperswil','Eschenbach','Wangen','Siebnen','Glarus','Oberriet','Sennwald','Kriessern','Haag','Buchs','Sevelen'];

// Nur akute Lagen. Dauerbaustellen ohne Stau sind fuer ein Live-Dashboard Rauschen.
const AKUT = /Sachlage:[^:]*?(Stau|stockender Verkehr|Strecke gesperrt|Tunnel gesperrt|Ausfahrt gesperrt|Einfahrt gesperrt|Ausfahrt blockiert|Fahrbahn gesperrt)|Ursache:\s*(Unfall|Pannenfahrzeug)/i;
const BAUSTELLE = /Baustelle|Bauarbeiten|Wanderbaustelle/i;
const STAU = /Sachlage:[^:]*?(Stau|stockender Verkehr)/i;
const SPERRUNG = /Sachlage:[^:]*?(gesperrt|blockiert)/i;

const unesc = s => s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const NOW = Date.now();
const MAXALTER = 24*60*60*1000;

// Der Meldungstext ist ein Fliesstext mit beschrifteten Abschnitten. Statt jedes
// Feld einzeln zu suchen, an den bekannten Beschriftungen zerlegen - dann geht
// nichts verloren, was der Feed liefert. Belegt sind (Stichprobe 192 Meldungen):
// Sachlage 56, Dauer 42, Verkehrsfuehrung 29, Laenge 28, Zusatz 25, Fahrbahnbreite
// 24, Ursache 19, Empfehlung 9, Zeitverlust 2.
const LABEL = /\b(Sachlage|Ursache|Verkehrsführung|Dauer|Empfehlung|Zusatz\s*\d*)\s*:\s*/g;
const EINHEIT = /,?\s*(?:Länge \[km\]|Zeitverlust Anz\. \[min\]|Fahrbahnbreite \[m\])\s*[\d.]+/g;
function felder(t){
  // Der Text wiederholt sich auf Franzoesisch und Italienisch - nur der deutsche Teil.
  const de = t.split(/\s+(?:Lib[ée]r|R[ée]voqu|Approvat)/)[0];
  const treffer = [...de.matchAll(LABEL)];
  const o = {};
  treffer.forEach((m,i) => {
    const ende = (i+1 < treffer.length) ? treffer[i+1].index : de.length;
    let wert = de.slice(m.index + m[0].length, ende).trim().replace(/[,;]\s*$/,'');
    if(!wert) return;
    const key = m[1].toLowerCase().replace(/\s*\d+$/,'').trim().replace('verkehrsführung','verkehrsfuehrung');
    // "Zusatz 1", "Zusatz 2" ... landen im selben Feld, Doppelungen raus
    if(o[key]){ if(o[key].indexOf(wert) === -1) o[key] += ' · ' + wert; }
    else o[key] = wert;
  });
  const zahl = re => { const m = de.match(re); return m ? parseFloat(m[1]) : null; };
  o._laenge_km       = zahl(/Länge \[km\]\s*([\d.]+)/);
  o._zeitverlust_min = zahl(/Zeitverlust\s*Anz\.\s*\[min\]\s*([\d.]+)/);
  o._breite_m        = zahl(/Fahrbahnbreite \[m\]\s*([\d.]+)/);
  // Die Zahlenangaben stehen mitten in den Textwerten - dort entfernen, sie stehen
  // ja als eigene Felder daneben.
  for(const k of Object.keys(o))
    if(!k.startsWith('_') && typeof o[k] === 'string') o[k] = o[k].replace(EINHEIT,'').trim();
  return o;
}

// Wortgrenze ist hier zwingend: ein Record enthaelt auch situationRecordCreationTime
// und situationRecordVersionTime, ein simples split() auf das Praefix zerhackt ihn
// in drei Teile und findet danach gar nichts mehr.
const recs = xml.match(/<dx223:situationRecord\b[\s\S]*?<\/dx223:situationRecord>/g) || [];
const out = [];
const seen = {};
for (const rec of recs) {
  // Klartext steht in den value-Kommentaren; "((...))" sind interne TIC-Codes.
  const vals = [];
  const reV = /<dx223:value[^>]*>([^<]{5,900})</g;
  let m;
  while ((m = reV.exec(rec)) !== null) { if (!m[1].startsWith('((')) vals.push(unesc(m[1])); }
  const t = vals.join(' ').replace(/\n/g,' ').trim();
  if (!t) continue;
  if (/^(Aufgehoben|Révoqué|Revocato)/.test(t)) continue;
  if (!ROADS.test(t)) continue;
  // Korridor-Praefix ("A3 Zuerich -> Chur") abschneiden, sonst matcht der Ortsfilter
  // auf das Fahrtziel statt auf den tatsaechlichen Abschnitt.
  let loc = t;
  const dir = t.match(/(?:->|<->)\s*\S+\s+([\s\S]*)/);
  if (dir) loc = dir[1];
  loc = loc.split('Sachlage')[0];
  const locLow = loc.toLowerCase();
  // Regionsnachweis: entweder ein Ortsname aus unseren Korridoren, oder eine
  // Strasse, die es nur bei uns gibt.
  const inRegion = PLACES.some(p => locLow.indexOf(p.toLowerCase()) !== -1)
                || REGIONAL_ROADS.test(t);
  if (!inRegion) continue;
  if (!AKUT.test(t)) continue;
  const g = n => { const x = rec.match(new RegExp('<dx223:'+n+'[^>]*>([^<]+)<')); return x ? x[1] : null; };
  const vt = Date.parse(g('situationRecordVersionTime') || '');
  if (!vt || (NOW - vt) > MAXALTER) continue;
  const en = Date.parse(g('overallEndTime') || '');
  if (en && en < NOW) continue;
  // Nur gueltige Meldungen. Aktuell tragen zwar alle Treffer "active", aber der Feed
  // kennt auch "definedByValidityTimeSpec" und aufgehobene Zustaende - ohne diese
  // Pruefung koennte eine abgelaufene Meldung stehen bleiben.
  const vs = g('validityStatus');
  if (vs && vs !== 'active' && vs !== 'definedByValidityTimeSpec') continue;
  const ort = t.split('Sachlage')[0].replace(/^\w+:\s*/,'').trim();
  const key = ort.slice(0,60);
  if (seen[key]) continue;
  seen[key] = 1;
  const f = felder(t);
  // "seit" = Ersterfassung, nicht overallStartTime. Wird eine Meldung ueberarbeitet,
  // setzt der Feed overallStartTime auf den Beginn der NEUEN Gueltigkeitsperiode:
  // Beim Kerenzerbergtunnel sprang der Wert bei der Ueberarbeitung um 13:24 von
  // 07:15 auf 13:23, obwohl der Tunnel durchgehend gesperrt war.
  // situationRecordCreationTime bleibt dagegen stabil.
  let st = Date.parse(g('situationRecordCreationTime') || '');
  const ost = Date.parse(g('overallStartTime') || '');
  // Vorab angekuendigte Baustellen koennen Wochen vor Beginn erfasst worden sein –
  // dann ist die Ersterfassung als "seit" unbrauchbar und der geplante Beginn zaehlt.
  if (!st || (NOW - st) > MAXALTER) st = (ost && ost <= NOW) ? ost : null;
  if (st && st > NOW) st = null;
  // Voraussichtliches Ende. Steht meist NICHT in overallEndTime, sondern als
  // endOfPeriod in der Gueltigkeitsangabe – bei der Tunnelsperrung vom 10.08.2026
  // trug der Feed dort um 13:24 Uhr die Wiedereroeffnung um 19:00 nach. Mehrere
  // Perioden sind moeglich (Nachtbaustellen), darum die naechste in der Zukunft.
  let bis = null;
  const perioden = [...rec.matchAll(/<dx223:endOfPeriod[^>]*>([^<]+)</g)]
    .map(x => Date.parse(x[1])).filter(ts => ts && ts > NOW).sort((a,b) => a-b);
  if (perioden.length) bis = perioden[0];
  if (!bis) {
    // Rueckfallebene: dieselbe Angabe steht auch im Klartext. Der Feed schreibt sie
    // ohne Zeitzone, deshalb hart auf Schweizer Sommerzeit; im Winter liegt dieser
    // Zweig eine Stunde daneben. Akzeptabel, weil das strukturierte Feld fast immer
    // da ist und dieser Pfad nur einspringt, wenn es fehlt.
    const dm = t.match(/voraussichtlich bis (\d{2})\.(\d{2})\.(\d{4})[ ,]+(\d{2}):(\d{2})/);
    if (dm) {
      const ms = Date.parse(`${dm[3]}-${dm[2]}-${dm[1]}T${dm[4]}:${dm[5]}:00+02:00`);
      if (ms && ms > NOW) bis = ms;
    }
  }
  // Angekuendigt oder laufend? Eine Nachtbaustelle steht bis zu zwei Wochen im Voraus
  // im Feed (Sufers-Andeer, erfasst am 18.08.2026 fuer die Nacht vom 31.08. auf den
  // 01.09.). Als "seit gestern gesperrt" gelesen ist das schlicht falsch - die Strecke
  // ist offen. Primaer die strukturierte Gueltigkeitsangabe, sonst der Klartext: dort
  // steht der Beginn als Datum unmittelbar VOR einem "bis". Das haeufigere Muster
  // "voraussichtlich bis 10.08.2026 19:00" hat kein solches Datum und wird dadurch
  // korrekt nicht als Beginn gelesen.
  let beginnt = null;
  const starts = [...rec.matchAll(/<dx223:startOfPeriod[^>]*>([^<]+)</g)]
    .map(x => Date.parse(x[1])).filter(ts => ts && ts > NOW).sort((a,b) => a-b);
  if (starts.length) beginnt = starts[0];
  if (!beginnt) {
    const bm = (f.dauer || '').match(/(\d{2})\.(\d{2})\.(\d{4})[ ,]+(\d{2}):(\d{2})\s+bis\s/);
    if (bm) {
      const ms = Date.parse(`${bm[3]}-${bm[2]}-${bm[1]}T${bm[4]}:${bm[5]}:00+02:00`);
      if (ms && ms > NOW) beginnt = ms;
    }
  }
  // Laeuft gerade eine Periode, kommt ihr Ende vor dem naechsten Beginn. Nur wenn der
  // Beginn zuerst kommt, stehen wir wirklich VOR der Sperrung. Das haelt eine mehrere
  // Naechte dauernde Baustelle waehrend der laufenden Nacht als "aktuell" im Kasten.
  if (bis && beginnt && beginnt > bis) beginnt = null;

  out.push({
    ort: ort,
    sachlage: (f.sachlage || '').slice(0,90),
    ursache: f.ursache || null,
    verkehrsfuehrung: f.verkehrsfuehrung || null,
    empfehlung: f.empfehlung || null,
    zusatz: f.zusatz || null,
    dauer: f.dauer || null,                       // Rohtext, z.B. "nachts voraussichtlich ..."
    laenge_km: f._laenge_km,
    zeitverlust_min: f._zeitverlust_min,
    fahrbahnbreite_m: f._breite_m,
    tmc: g('specificLocation'),
    seit: st ? new Date(st).toISOString() : null,
    beginnt: beginnt ? new Date(beginnt).toISOString() : null,
    bis: bis ? new Date(bis).toISOString() : null,
    aktualisiert: new Date(vt).toISOString(),
    art: SPERRUNG.test(t) ? 'sperrung' : (STAU.test(t) ? 'stau' : 'stoerung'),
    baustelle: BAUSTELLE.test(t)
  });
}
// Sperrungen zuoberst, dann Stau, innerhalb nach Aktualitaet
const rank = { sperrung: 0, stau: 1, stoerung: 2 };
out.sort((a,b) => (rank[a.art] - rank[b.art]) || (Date.parse(b.aktualisiert) - Date.parse(a.aktualisiert)));

const payload = { generated: new Date().toISOString().replace(/\.\d+Z$/,'Z'), quelle: 'ASTRA / opentransportdata.swiss (DATEX II)', meldungen: out };
const sd = $getWorkflowStaticData('global');
sd.meldungen = JSON.stringify(payload);
return [{ json: { ok: true, count: out.length, geprueft: recs.length } }];
