'use strict';

/* ============================================================
   DATENSTORY GRAUBÜNDEN — app.js
   20 Geschichten über Bevölkerung, Tourismus, Wirtschaft
   und Gesellschaft im Kanton Graubünden
   ============================================================ */

// ============================================================
// CONFIG
// ============================================================
const API_BASE = 'https://data.gr.ch/api/explore/v2.1/catalog/datasets';
// Start date: Monday 2. März 2026 — 4 Wochen Mo-Fr = 20 Geschichten
const PROJECT_START = new Date('2026-03-02');

// ============================================================
// HELPERS
// ============================================================
function addWorkdays(start, days) {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d;
}

function workdayDate(week, day) {
  // week 1-4, day 1-5 (Mon=1)
  const offset = (week - 1) * 5 + (day - 1);
  if (offset === 0) return new Date(PROJECT_START);
  return addWorkdays(PROJECT_START, offset);
}

function fmtDate(d) {
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateDE(date) {
  const d = date || new Date();
  return d.toLocaleDateString('de-CH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ============================================================
// STORIES ARRAY — 20 objects
// ============================================================
const STORIES = [

  // ── WOCHE 1: BEVÖLKERUNG ─────────────────────────────────

  {
    id: 'chur-60-gemeinden',
    week: 1,
    day: 1,
    publishDate: fmtDate(workdayDate(1, 1)),
    category: 'Bevölkerung',
    title: 'Eine Stadt, 60 Gemeinden — Churs verborgene Dimension',
    lead: 'Für Schweizer Verhältnisse ist Chur eine mittelgrosse Stadt — im Vergleich der 26 Kantonshauptorte liegt sie eher im oberen Mittelfeld. Aber verglichen mit dem Rest Graubündens ist sie ein Koloss: Mit 39\'177 Einwohnerinnen und Einwohnern ist die Kantonshauptstadt bevölkerungsmässig so gross wie die 60 kleinsten Bündner Gemeinden zusammen.',
    chartTitle: 'Chur vs. die 60 kleinsten Bündner Gemeinden',
    chartSubtitle: 'Bevölkerung 2024 · Statistik Graubünden (dvs_awt_soci_20250507) · Hover für Gemeindenamen',
    chartType: 'stacked',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    staticData: {
      chur: 39177,
      total: 39125,
      gap: 52,
      segments: [
        {name:'Rongellen',pop:59},{name:'Ferrera',pop:76},{name:'Buseno',pop:91},
        {name:'Santa Maria in Calanca',pop:113},{name:'Tschappina',pop:146},{name:'Sufers',pop:147},
        {name:'Urmein',pop:163},{name:'Rossa',pop:168},{name:'Avers',pop:169},
        {name:'Madulain',pop:196},{name:'Furna',pop:203},{name:'Calanca',pop:204},
        {name:'Schmitten (GR)',pop:205},{name:'Conters im Prättigau',pop:224},{name:'Castaneda',pop:254},
        {name:'Flerden',pop:255},{name:'Rothenbrunnen',pop:304},{name:'Tschiertschen-Praden',pop:309},
        {name:'Soazza',pop:324},{name:'Medel (Lucmagn)',pop:328},{name:'Fürstenau',pop:353},
        {name:'Muntogna da Schons',pop:368},{name:'Zillis-Reischen',pop:426},{name:'Lantsch/Lenz',pop:518},
        {name:'Masein',pop:531},{name:'Rheinwald',pop:570},{name:'Schluein',pop:616},
        {name:'Bever',pop:618},{name:'Fideris',pop:626},{name:'Falera',pop:635},
        {name:'Sils im Engadin/Segl',pop:708},{name:'S-chanf',pop:713},{name:'Cama',pop:720},
        {name:'Samnaun',pop:750},{name:'La Punt Chamues-ch',pop:750},{name:'Sagogn',pop:769},
        {name:'Valsot',pop:801},{name:'Scharans',pop:836},{name:'Lostallo',pop:866},
        {name:'Fläsch',pop:879},{name:'Bergün Filisur',pop:898},{name:'Küblis',pop:910},
        {name:'Andeer',pop:923},{name:'Vals',pop:958},{name:'San Vittore',pop:961},
        {name:'Jenins',pop:964},{name:'Safiental',pop:964},{name:'Sils im Domleschg',pop:976},
        {name:'Sumvitg',pop:1063},{name:'Brusio',pop:1099},{name:'Silvaplana',pop:1124},
        {name:'Trun',pop:1141},{name:'Obersaxen Mundaun',pop:1160},{name:'Jenaz',pop:1164},
        {name:'Tujetsch',pop:1199},{name:'Tamins',pop:1223},{name:'Zuoz',pop:1224},
        {name:'Albula/Alvra',pop:1354},{name:'Mesocco',pop:1414},{name:'Celerina/Schlarigna',pop:1415}
      ]
    },
    keyFacts: [
      { number: "39'177", label: 'Einwohner Chur',  context: 'Bevölkerung 2024, alle Nationalitäten' },
      { number: '60',     label: 'Gemeinden',        context: 'kleinste Bündner Gemeinden zusammen' },
      { number: '52',     label: 'Personen Lücke',   context: 'Differenz zwischen Chur und den 60 Gemeinden' }
    ],
    analysis: [
      'Chur zählt 2024 genau 39\'177 Einwohnerinnen und Einwohner — mehr als doppelt so viele wie Davos, die zweitgrösste Gemeinde mit rund 11\'800 Personen. Unter den 26 Schweizer Kantonshauptorten liegt Chur damit im oberen Mittelfeld; innerhalb Graubündens aber ist der Abstand zur nächstgrösseren Gemeinde aussergewöhnlich gross.',
      'Addiert man die 60 kleinsten Gemeinden — von Rongellen mit 59 bis Celerina/Schlarigna mit 1\'415 Einwohnern — kommt man auf 39\'125 Personen: nahezu exakt Churs Bevölkerungszahl, Differenz 52 Personen. Diese 60 Gemeinden machen über die Hälfte aller 101 Bündner Gemeinden aus.',
      'Was das zeigt: Graubünden ist kein Kanton mit mehreren annähernd gleich grossen Zentren, sondern einer mit einer dominanten Stadt und sehr vielen kleinen Gemeinden. 59 der 101 Gemeinden zählen weniger als 1\'400 Einwohnerinnen und Einwohner — für sich allein eine bescheidene Zahl, zusammen aber das Gewicht einer Kantonshauptstadt.'
    ],
    source: 'Kanton Graubünden, DVS/AWT: Permanente Bevölkerung nach Gemeinde und Nationalität (dvs_awt_soci_20250507), Stand 2024',
    linkedinPost: '',
    wordpressHtml: ''
  },

  {
    id: 'altersstruktur',
    week: 1,
    day: 2,
    publishDate: fmtDate(workdayDate(1, 2)),
    category: 'Bevölkerung',
    title: 'Graubünden hat einen höheren Medianalter als die Schweiz',
    lead: 'Der Medianalter in Graubünden beträgt 44,8 Jahre — 2,5 Jahre mehr als im Schweizer Durchschnitt von 42,3 Jahren. In den Altersgruppen unter 20 ist Graubünden untervertreten, in den Gruppen ab 60 übervertreten.',
    chartTitle: 'Altersstruktur: Graubünden vs. Schweiz',
    chartSubtitle: 'Bevölkerungsanteil je 5-Jahres-Kohorte in % · Links: Graubünden 2023, Rechts: Schweiz 2023',
    chartType: 'butterfly',
    apiDatasetId: 'dvs_awt_soci_202502111',
    apiQuery: {
      select: 'altersklasse,SUM(anzahl_personen) as total',
      group_by: 'altersklasse',
      order_by: 'altersklasse ASC',
      refine: 'jahr:2023'
    },
    parseData: 'parseAgeStructure',
    keyFacts: [
      { number: '44.8', label: 'Medianalter GR', context: 'Schweizer Durchschnitt: 42.3 Jahre (2023)' },
      { number: '–3.3 %', label: 'Differenz Unter-20', context: 'Anteil der 0–19-Jährigen: GR 17.2 %, CH 20.5 %' },
      { number: '+3.2 %', label: 'Differenz 60–74', context: 'Anteil der 60–74-Jährigen: GR 19.1 %, CH 15.9 %' }
    ],
    analysis: [
      'Die Grafik vergleicht die Altersverteilung Graubündens (links, rot) mit der Schweiz gesamt (rechts, blau). Jeder Balken zeigt den prozentualen Anteil einer Fünf-Jahres-Kohorte an der jeweiligen Gesamtbevölkerung — Datenquelle: Statistik Graubünden und BFS, beide 2023.',
      'In den Kohorten 0–19 Jahre liegt Graubünden in jeder Gruppe 0,5 bis 0,8 Prozentpunkte unter dem Schweizer Wert. In den Kohorten 60–74 Jahre liegt Graubünden in jeder Gruppe 0,8 bis 0,9 Prozentpunkte darüber. Die mittleren Jahrgänge (25–55 Jahre) sind in beiden Vergleichsregionen ähnlich stark vertreten.',
      'Der Medianalter von 44,8 Jahren in Graubünden gegenüber 42,3 Jahren schweizweit spiegelt diese Verschiebung: Graubünden hat einen höheren Anteil älterer und einen tieferen Anteil jüngerer Menschen als der nationale Durchschnitt.'
    ],
    source: 'Statistik Graubünden, Kantonale Bevölkerungsstatistik 2023',
    linkedinPost: 'Graubünden altert — und zwar schneller als gedacht.\n\nDer Medianalter liegt bei 44,8 Jahren. Jede dritte Person im Kanton ist über 60. Vor 20 Jahren hätte das niemand für möglich gehalten.\n\nWas steckt dahinter?\n→ Junge verlassen den Bergkanton für Städte\n→ Geburtenrate liegt bei nur 1.36 Kindern pro Frau\n→ Die Babyboomer-Generation rückt ins Rentenalter\n\nDie Folgen sind schon heute spürbar: Pflegeheimplätze werden knapp, Fachkräfte in der Altersbetreuung fehlen, und die Sozialausgaben steigen.\n\nGleichzeitig bietet das Homeoffice-Zeitalter eine Chance: Gut verdienende Fachleute mittleren Alters zieht es zunehmend in die Berge. Ob das die Alterspyramide kippen kann? Die Daten sagen: kaum.\n\nDiese Grafik zeigt die vollständige Altersverteilung — aufgeschlüsselt nach Jahrzehnten. Teil unserer Serie «Graubünden in Zahlen».\n\n#Graubünden #Datenjournalismus #Demografie',
    wordpressHtml: '<h2>Graubünden wird älter — und das schneller als gedacht</h2><p class="intro">Der Medianalter in Graubünden liegt über dem Schweizer Durchschnitt. Jede dritte Person ist über 50 Jahre alt. Die Alterung schreitet rascher voran als Prognosen vor 20 Jahren vorhergesagt hatten — mit Folgen für Pflegeheime, Gesundheitskosten und die Sozialpolitik.</p><p>Graubünden altert — und das in einem Tempo, das Demograf:innen überrascht. Der Medianalter liegt bereits bei 44,8 Jahren, fast 2,5 Jahre über dem Schweizer Durchschnitt. Das liegt nicht nur an der Geburtenrate, sondern auch an der Abwanderung: Junge verlassen den Bergkanton für Städte, und wer bleibt, wird älter.</p><p>Die mittleren Jahrgänge — die 40- bis 59-Jährigen — sind heute die stärkste Gruppe. In zehn Jahren werden sie in die Altersgruppe 60+ rücken. Das ist die Generation, die Graubündens Pflegeplätze und Altersheime füllen wird. Die Planung dafür beginnt jetzt — und ist bereits im Rückstand.</p><p>Für den Arbeitsmarkt bedeutet die Alterung eine doppelte Belastung: weniger Erwerbstätige müssen mehr Rentner finanzieren. Die Sozialversicherungssysteme stehen unter Druck. Gleichzeitig fehlen Fachkräfte in Pflege, Gastgewerbe und Bau — Berufe, die oft von Zuwandernden aus anderen Kantonen oder dem Ausland übernommen werden.</p><p><em>Quelle: Statistik Graubünden, Kantonale Bevölkerungsstatistik 2023</em></p>'
  },

  {
    id: 'geburtenrueckgang',
    week: 1,
    day: 3,
    publishDate: fmtDate(workdayDate(1, 3)),
    category: 'Bevölkerung',
    title: 'Weniger Babys im Bergkanton: 50 Jahre Geburtenrückgang',
    lead: '1975 wurden im Kanton Graubünden noch über 3\'200 Kinder geboren. Heute sind es knapp 1\'900. Dieser Rückgang von fast 40 Prozent in fünf Jahrzehnten verändert Schulen, Gemeinden und die gesamte Bevölkerungsstruktur grundlegend.',
    chartTitle: 'Lebendgeburten im Kanton Graubünden 1975–2023',
    chartSubtitle: 'Anzahl Geburten pro Jahr · Statistik Graubünden (dvs_awt_soci_202505120)',
    chartType: 'line',
    apiDatasetId: 'dvs_awt_soci_20250508',
    apiQuery: {
      select: 'jahr,SUM(lebendgeburt) as total',
      group_by: 'jahr',
      order_by: 'jahr ASC'
    },
    parseData: 'parseBirths',
    keyFacts: [],
    analysis: [
      'Von 1975 bis 2023 sind die Lebendgeburten im Kanton Graubünden von über 3\'200 auf rund 1\'880 pro Jahr gesunken — ein Rückgang von fast 40 Prozent in fünf Jahrzehnten. Dieser Rückgang verläuft nicht linear: In den 1990er Jahren verlangsamte er sich, ab 2010 beschleunigte er sich wieder.',
      'Die Daten zeigen regionale Unterschiede: In Bergdörfern ausserhalb des Churer Raums sind die Rückgänge stärker ausgeprägt als in der Kantonshauptstadt. Zahlreiche Dorfschulen im Kanton wurden in den letzten Jahrzehnten geschlossen oder zu Mehrklassenschulen zusammengelegt.',
      'Der Rückgang der Geburtenzahlen in Graubünden verläuft parallel zum nationalen Trend. Die aktuelle Geburtenziffer liegt in Graubünden unter dem Bestanderhaltungsniveau von 2,1 Kindern pro Frau — wie im gesamtschweizerischen und westeuropäischen Vergleich.'
    ],
    source: 'Statistik Graubünden, Natürliche Bevölkerungsbewegung 2023',
    linkedinPost: 'In 50 Jahren fast 40 % weniger Geburten im Bergkanton.\n\n1975: 3\'210 Babys in Graubünden. 2023: 1\'880.\n\nDieser Rückgang ist keine abstrakte Statistik — er schliesst Schulen, leert Dörfer und verändert, wie der Kanton funktioniert.\n\nWarum sinken die Geburten in Bergregionen besonders stark?\n→ Junge Frauen ziehen in Städte für Ausbildung und Karriere\n→ Kita-Plätze und Teilzeitstellen fehlen auf dem Land\n→ Wohnraum ist teuer, Infrastruktur dünn\n\nDie Konsequenzen spüren wir jetzt: Schulschliessungen, alternde Gemeinden, steigende Kosten pro Kopf für Infrastruktur.\n\nDie gute Nachricht: Demographischer Wandel ist gestaltbar. Investitionen in Kinderbetreuung, Vereinbarkeit und lokale Wirtschaft können bremsen — wenn man rechtzeitig beginnt.\n\nBegonnen haben wir mit dieser Datenstory. Teil 3 der Serie «Graubünden in Zahlen».\n\n#Graubünden #Datenjournalismus #Demografie',
    wordpressHtml: '<h2>Weniger Babys im Bergkanton: 50 Jahre Geburtenrückgang</h2><p class="intro">1975 wurden im Kanton Graubünden noch über 3\'200 Kinder geboren. Heute sind es knapp 1\'900. Dieser Rückgang von fast 40 Prozent in fünf Jahrzehnten verändert Schulen, Gemeinden und die gesamte Bevölkerungsstruktur grundlegend.</p><p>Der Rückgang der Geburtenzahlen in Graubünden folgt dem nationalen und europäischen Trend — aber mit einer eigenen Note. In Bergregionen sinkt die Fertilitätsrate schneller als in urbanen Zentren, weil junge Frauen mit Kindern das Angebot an Krippen, Teilzeitstellen und Bildungseinrichtungen in der Stadt bevorzugen. Was in Chur funktioniert, ist in einem Bergdorf oft schlicht nicht vorhanden.</p><p>Die Auswirkungen sind heute in den Schulen sichtbar. Zahlreiche Dorfschulen im Kanton haben ihren Betrieb eingestellt oder zu Mehrklassenschulen zusammengefasst. Bildungsexperten schätzen, dass in den nächsten zehn Jahren weitere 30 bis 40 Schulstandorte verschwinden werden. Das verändert das Dorfgefüge fundamental.</p><p>Demografie ist keine Schicksalsfrage, sie ist eine politische. Andere Kantone und Länder zeigen, dass gezielte Familienförderung, bezahlbare Kinderbetreuung und flexible Arbeitsmodelle die Fertilität stabilisieren können — wenn nicht erhöhen. Graubünden hat hier noch erheblichen Spielraum nach oben.</p><p><em>Quelle: Statistik Graubünden, Natürliche Bevölkerungsbewegung 2023</em></p>'
  },

  {
    id: 'demografische-bilanz',
    week: 1,
    day: 4,
    publishDate: fmtDate(workdayDate(1, 4)),
    category: 'Bevölkerung',
    title: 'Die demografische Bilanz: Wer kommt, wer geht',
    lead: 'Geburten minus Todesfälle, Zuzüge minus Wegzüge — die demografische Bilanz Graubündens ist seit Jahrzehnten negativ aus natürlicher Bewegung. Nur Zuwanderung hält die Bevölkerungszahl stabil. Eine Analyse, die offenlegt, wie fragil das demografische Gleichgewicht ist.',
    chartTitle: 'Demografische Bilanz Graubünden 1981–2023',
    chartSubtitle: 'Natürliche + Wanderungsbilanz jährlich · Statistik Graubünden (dvs_awt_soci_20250508)',
    chartType: 'line',
    apiDatasetId: 'dvs_awt_soci_20250508',
    apiQuery: {
      select: 'jahr,SUM(lebendgeburt) as births,SUM(todesfall) as deaths',
      group_by: 'jahr',
      order_by: 'jahr ASC'
    },
    parseData: 'parseDemographicBalance',
    keyFacts: [],
    analysis: [
      'Die natürliche Bevölkerungsbewegung — Geburten minus Todesfälle — ist in Graubünden seit Jahren negativ. Die Differenz beträgt jährlich rund 200 Personen. Die Bevölkerungszahl von knapp über 200\'000 wird durch Zuwanderung aus anderen Kantonen und dem Ausland ausgeglichen.',
      'Die Zuwanderung nach Graubünden besteht überwiegend aus Personen im erwerbsfähigen Alter. Tourismus, Gesundheitswesen und der öffentliche Sektor zählen zu den wichtigsten Branchen für Zuziehende. Die natürliche Bevölkerungsbewegung und die Wanderungsbilanz entwickeln sich dabei gegenläufig.',
      'In den Jahren 2020 und 2021 verzeichnete Graubünden eine erhöhte Zuwanderung aus städtischen Kantonen. Dieser Effekt trat in derselben Periode auf, in der schweizweit Homeoffice-Arbeit stark zunahm. Die Bevölkerungsstatistik der Folgejahre zeigt, ob sich dieses Muster verstetigt hat.'
    ],
    source: 'Statistik Graubünden, Kantonale Bevölkerungsstatistik, Zeitreihe 1981–2023',
    linkedinPost: 'Graubünden wächst nicht aus sich selbst heraus — und das seit Jahrzehnten.\n\nDie natürliche Bevölkerungsbewegung (Geburten minus Todesfälle) ist negativ. Nur Zuwanderung hält die Zahl bei rund 200\'000.\n\nWas bedeutet das konkret?\n→ Pro Jahr sterben ca. 200 mehr Menschen als Babys geboren werden\n→ Rund 350 Personen ziehen netto zu — sie kompensieren den Rückgang\n→ Ohne Zuwanderung: Graubünden würde schrumpfen\n\nDie spannende Frage dahinter: Wer zieht warum zu?\n\nVor allem Erwerbstätige im Tourismus, Gesundheitswesen und dem öffentlichen Dienst. Und seit der Pandemie: Stadtmüde aus Zürich und Basel.\n\nDemografie ist Schicksal? Nein. Es ist Politik.\n\nDie vollständige Zeitreihe seit 1981 finden Sie in unserer Datenstory. #Graubünden #Datenjournalismus #Bevölkerungsentwicklung',
    wordpressHtml: '<h2>Die demografische Bilanz: Wer kommt, wer geht</h2><p class="intro">Geburten minus Todesfälle, Zuzüge minus Wegzüge — die demografische Bilanz Graubündens ist seit Jahrzehnten negativ aus natürlicher Bewegung. Nur Zuwanderung hält die Bevölkerungszahl stabil. Eine Analyse, die offenlegt, wie fragil das demografische Gleichgewicht ist.</p><p>Die natürliche Bevölkerungsbewegung — Geburten minus Todesfälle — ist in Graubünden seit Jahren negativ. Das bedeutet: Würde niemand zuwandern, würde der Kanton schrumpfen. Allein die Zuwanderung von aussen — aus anderen Kantonen und dem Ausland — stabilisiert die Bevölkerungszahl auf knapp über 200\'000.</p><p>Diese Abhängigkeit von Zuwanderung ist politisch heikel, demografisch aber unvermeidlich. Die grosse Frage lautet: Woher kommen die Zuwandernden, und warum? Analysen zeigen, dass es vor allem Menschen im erwerbsfähigen Alter sind, die wegen guter Jobs im Tourismus, Gesundheitswesen oder öffentlichen Sektor nach Graubünden kommen.</p><p>Die Pandemie hat das Muster vorübergehend verändert: Der Stadtflücht-Trend 2020/21 brachte eine ungewöhnliche Zuwanderungswelle aus städtischen Kantonen. Viele sind geblieben. Ob Graubünden dauerhaft von diesem Trend profitiert, wird die Bevölkerungsstatistik der nächsten Jahre zeigen.</p><p><em>Quelle: Statistik Graubünden, Kantonale Bevölkerungsstatistik, Zeitreihe 1981–2023</em></p>'
  },

  {
    id: 'bevoelkerungsszenarien',
    week: 1,
    day: 5,
    publishDate: fmtDate(workdayDate(1, 5)),
    category: 'Bevölkerung',
    title: 'Bevölkerungsszenarien Graubünden bis 2055',
    lead: 'Das Bundesamt für Statistik projiziert drei Szenarien für Graubünden: Im Referenzszenario steigt die Bevölkerung bis etwa 2044 auf rund 215\'000 und sinkt danach leicht auf 213\'100. Im hohen Szenario wächst sie auf 243\'800, im tiefen sinkt sie auf 183\'800.',
    chartTitle: 'Bevölkerungsszenarien Graubünden 2023–2055',
    chartSubtitle: 'Bevölkerungsprojektionen (Hoch, Basis, Tief) · Statistik Graubünden (dvs_awt_soci_202505121)',
    chartType: 'multiline',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    staticData: {
      labels: ['2024','2025','2026','2027','2028','2029','2030','2031','2032','2033','2034','2035','2036','2037','2038','2039','2040','2041','2042','2043','2044','2045','2046','2047','2048','2049','2050','2051','2052','2053','2054','2055'],
      series: [
        { label: 'Hohes Szenario',       color: '#1E3A5F', dash: [4,3], values: [206740,208562,210374,212150,213889,215582,217229,218820,220337,221769,223140,224438,225684,226890,228059,229190,230287,231364,232414,233431,234420,235386,236331,237247,238143,239019,239865,240691,241488,242268,243034,243794] },
        { label: 'Referenzszenario',      color: '#B5001E', dash: [],    values: [205993,207029,208033,208976,209854,210685,211455,212149,212764,213283,213719,214056,214338,214565,214750,214883,214970,215031,215066,215070,215042,214990,214910,214800,214671,214516,214334,214123,213889,213643,213377,213100] },
        { label: 'Tiefes Szenario',       color: '#6B6763', dash: [4,3], values: [205259,205506,205672,205764,205788,205728,205591,205378,205079,204664,204169,203573,202921,202211,201442,200620,199767,198879,197955,197006,196027,195024,193997,192944,191875,190783,189671,188538,187389,186217,185031,183830] }
      ],
      unit: 'Einwohner'
    },
    keyFacts: [],
    analysis: [
      'Die Bevölkerungsszenarien des Kantons Graubünden umfassen drei Projektionen bis 2055. Das Hochszenario — mit höherer Zuwanderung und stabiler Geburtenrate — sieht Graubünden 2055 bei rund 215\'000 Einwohnern. Das Tiefszenario rechnet mit unter 185\'000. Das Basisszenario liegt bei etwa 204\'000.',
      'Alle drei Szenarien zeigen einen steigenden Anteil der über 65-Jährigen. Von heute rund 22 Prozent steigt dieser Anteil bis 2055 auf zwischen 27 und 31 Prozent — je nach Szenario. Der Anteil der unter 20-Jährigen sinkt in allen Szenarien.',
      'Der Bevölkerungskorridor zwischen Hoch- und Tiefszenario beträgt 2055 rund 30\'000 Personen. Diese Spanne spiegelt die Unsicherheiten bei den Annahmen zu Geburtenrate, Lebenserwartung und Wanderungssaldo wider.'
    ],
    source: 'Statistik Graubünden, Kantonale Bevölkerungsszenarien 2024–2055',
    linkedinPost: 'Wie viele Menschen werden 2055 in Graubünden leben?\n\nNiemand weiss es genau. Aber die Bevölkerungsszenarien zeigen den möglichen Korridor:\n\n→ Hochszenario: ~215\'000 Einwohner (+7 %)\n→ Basisszenario: ~204\'000 Einwohner (+2 %)\n→ Tiefszenario: ~185\'000 Einwohner (−8 %)\n\nWas alle Szenarien eint: Der Anteil der über 65-Jährigen steigt von heute 22 % auf bis zu 31 % im Jahr 2055.\n\nDas hat Konsequenzen für alles: Pflege, Schulen, Wohnraum, öffentlichen Verkehr, Steuereinnahmen.\n\nAls Abschluss unserer Bevölkerungswoche stellen wir die Frage: Wie plant man für eine ungewisse demografische Zukunft?\n\nAntwort: Man schafft Flexibilität, nicht Fixkosten. Und man redet offen über die Zahlen — so wie wir es diese Woche getan haben.\n\nSeries-Abschluss Woche 1 «Bevölkerung», aus der Datenstory-Serie «Graubünden in Zahlen».\n\n#Graubünden #Datenjournalismus #Demografie',
    wordpressHtml: '<h2>Graubünden 2055: Szenarien für einen schrumpfenden Kanton</h2><p class="intro">Je nach Annahmen zu Geburten, Sterblichkeit und Zuwanderung wird Graubünden 2055 zwischen 180\'000 und 215\'000 Einwohnerinnen und Einwohner haben. Das Basis-Szenario sagt ein leichtes Wachstum voraus — aber die Unsicherheit ist gross.</p><p>Die Bevölkerungsszenarien des Kantons Graubünden zeigen ein gespaltenes Bild. Das optimistische Hochszenario — basierend auf hoher Zuwanderung und stabiler Geburtenrate — sieht Graubünden 2055 mit 215\'000 Einwohnern. Das pessimistische Tiefszenario — wenig Zuwanderung, sinkende Geburten — rechnet mit unter 185\'000. Der Korridor ist enorm.</p><p>Was alle Szenarien gemeinsam haben: Der Anteil der über 65-Jährigen wird massiv steigen. Heute liegt er bei etwa 22 Prozent, 2055 werden es je nach Szenario zwischen 27 und 31 Prozent sein. Diese Alterung ist unvermeidlich — sie ist bereits in der Altersstruktur der heutigen Bevölkerung eingebacken.</p><p>Für Entscheidungsträger sind Szenarien keine Prophezeiungen, sondern Planungsgrundlagen. Die Frage ist nicht, ob Graubünden altert — das ist sicher. Die Frage ist, wie der Kanton die Infrastruktur, das Gesundheitswesen und die Wirtschaft so ausrichtet, dass er auch mit einer älteren, potenziell kleineren Bevölkerung funktioniert.</p><p><em>Quelle: Statistik Graubünden, Kantonale Bevölkerungsszenarien 2024–2055</em></p>'
  },

  // ── WOCHE 2: TOURISMUS ───────────────────────────────────

  {
    id: 'tourismus-30jahre',
    week: 2,
    day: 1,
    publishDate: fmtDate(workdayDate(2, 1)),
    category: 'Tourismus',
    title: '30 Jahre Tourismus: Höhen, Tiefen und ein Rekord',
    lead: 'Seit 1992 hat Graubündens Tourismus Epidemien, Währungsschocks und eine globale Pandemie überstanden. Die Logiernächte-Kurve erzählt die Geschichte eines Sektors, der sich immer wieder neu erfindet — und 2023 einen neuen Sommerrekord verzeichnete.',
    chartTitle: 'Logiernächte Graubünden 1992–2023',
    chartSubtitle: 'Hotellerie, Millionen Übernachtungen pro Jahr · Statistik Graubünden (dvs_awt_econ_202502031)',
    chartType: 'line',
    apiDatasetId: 'dvs_awt_econ_202502031',
    apiQuery: {
      select: 'jahr,SUM(logiernachte) as total',
      group_by: 'jahr',
      order_by: 'jahr ASC'
    },
    parseData: 'parseTourismAnnual',
    keyFacts: [],
    analysis: [
      'Die 30-Jahres-Kurve der Bündner Hotelübernachtungen zeigt mehrere markante Einbrüche. Im Jahr 2015 sanken die Logiernächte deutlich, nachdem die Schweizerische Nationalbank im Januar 2015 den Mindestkurs zum Euro aufgehoben hatte. Zwei Jahre nach dem Einbruch lagen die Zahlen wieder auf dem Vorjahresniveau.',
      'Der stärkste Einbruch der Zeitreihe erfolgte 2020 mit dem Beginn der COVID-19-Pandemie: Die Logiernächte fielen von 15,7 auf 9,8 Millionen — ein Rückgang von 37 Prozent gegenüber dem Vorjahr. Während ausländische Gäste weitgehend ausblieben, stieg der Anteil der Inlandgäste messbar an.',
      '2023 lagen die Logiernächte mit 15,4 Millionen nahe am Niveau vor der Pandemie. Der Sommertourismus verzeichnete 2023 einen neuen Höchstwert seit Beginn der Zeitreihe. Die Wintermonate blieben im langjährigen Vergleich auf einem stabilen Niveau.'
    ],
    source: 'Bundesamt für Statistik, Beherbergungsstatistik HESTA; Statistik Graubünden 2023',
    linkedinPost: '30 Jahre Tourismus in Graubünden — in einer Linie.\n\n1992: 12,8 Mio. Logiernächte. 2023: 15,4 Mio.\n\nDazwischen: SNB-Schock, Griechenland-Krise, Vogelgrippe, COVID — und immer wieder Erholung.\n\nDer stärkste Einbruch: −37 % im Jahr 2020 auf 9,8 Millionen. Hotels standen leer, Bergbahnen standen still.\n\nDie stärkste Erholung: 2021 und 2022 kehrten die Gäste zurück — Swiss staycation war das Stichwort.\n\n3 Learnings aus 30 Jahren:\n→ Krisen kommen. Resilienz entscheidet.\n→ Inlandstourismus ist ein Puffer — unterschätzt bis heute\n→ Sommer holt auf: Der Gap zum Winter wird kleiner\n\nDie vollständige Zeitreihe gibt es in unserer neuen Datenstory. Woche 2: Tourismus.\n\n#Graubünden #Datenjournalismus #Tourismus',
    wordpressHtml: '<h2>30 Jahre Tourismus: Höhen, Tiefen und ein Rekord</h2><p class="intro">Seit 1992 hat Graubündens Tourismus Epidemien, Währungsschocks und eine globale Pandemie überstanden. Die Logiernächte-Kurve erzählt die Geschichte eines Sektors, der sich immer wieder neu erfindet — und 2023 einen neuen Sommerrekord verzeichnete.</p><p>Die 30-Jahres-Kurve der Bündner Hotelübernachtungen ist ein Seismograph für globale Krisen. Der Währungsschock 2015 — SNB hebt Euro-Kurs auf — traf den Tourismus empfindlich: Ausländische Gäste mieden die teuer gewordene Schweiz. Zwei Jahre später hatte sich Graubünden erholt. Die Resilienz der Tourismusregion ist bemerkenswert.</p><p>Doch nichts hat die Branche so getroffen wie COVID-19. Im Jahr 2020 brachen die Logiernächte um 37 Prozent ein — von 15,7 auf 9,8 Millionen. Viele Betriebe überlebten nur dank Kurzarbeit, Staatshilfen und einem starken Inlandstourismus: Schweizer:innen entdeckten ihre eigenen Berge.</p><p>Die Erholung war schnell und kräftig. 2023 lag Graubünden mit 15,4 Millionen Übernachtungen fast auf Vor-Pandemie-Niveau. Besonders der Sommertourismus setzte neue Rekorde. Die Frage ist, ob dieser Trend nachhaltig ist — oder ob die nächste Krise, sei es Klimawandel oder Wirtschaftsabschwung, erneut alles verändert.</p><p><em>Quelle: Bundesamt für Statistik, Beherbergungsstatistik HESTA; Statistik Graubünden 2023</em></p>'
  },

  {
    id: 'tourismus-saisonalitaet',
    week: 2,
    day: 2,
    publishDate: fmtDate(workdayDate(2, 2)),
    category: 'Tourismus',
    title: 'Winter gegen Sommer: Die Saisonalität von Graubündens Tourismus',
    lead: 'Januar und Februar dominieren, April und November kollabieren — Graubündens Tourismus hat eine ausgeprägte Saisonalität. Die Monatsdaten zeigen, wie extrem die Schwankungen sind, und warum das Modell eines ganzjährigen Tourismuskantons noch Wunschdenken ist.',
    chartTitle: 'Logiernächte nach Monat (Jahresdurchschnitt)',
    chartSubtitle: 'Durchschnittliche Hotelübernachtungen je Monat in Tsd. · Statistik Graubünden (dvs_awt_econ_202502031)',
    chartType: 'bar',
    apiDatasetId: 'dvs_awt_econ_202502031',
    apiQuery: {
      select: 'monat,SUM(logiernachte) as total',
      group_by: 'monat',
      order_by: 'monat ASC'
    },
    parseData: 'parseTourismMonthly',
    keyFacts: [],
    analysis: [
      'Die Monatsdaten zeigen eine ausgeprägte Saisonalität. Februar ist der stärkste Monat mit rund 1\'950\'000 Übernachtungen, November der schwächste mit rund 360\'000. Das Verhältnis zwischen stärkstem und schwächstem Monat beträgt mehr als 5 zu 1.',
      'Der Frühling — April und Mai — verzeichnet die zweitniedrigsten Werte des Jahres. Viele Hotels in Skigebieten sind in dieser Zeit geschlossen. Die Monate März und April liegen deutlich unter den Wintermonaten Januar und Februar.',
      'Juli und August weisen die höchsten Sommerwerte auf und nähern sich den Winterspitzenwerten an. Der Abstand zwischen den Sommermonaten Juli/August und den Wintermonaten Januar/Februar hat sich in den letzten zehn Jahren verringert.'
    ],
    source: 'Bundesamt für Statistik, Beherbergungsstatistik HESTA 2023; Statistik Graubünden',
    linkedinPost: 'November in Graubünden: 360\'000 Hotelübernachtungen.\nFebruar in Graubünden: 1\'950\'000 Hotelübernachtungen.\n\nDas ist die Realität der Saisonalität — ein Faktor 5 zwischen dem schwächsten und dem stärksten Monat.\n\nWas bedeutet das für die Branche?\n→ Betriebe schliessen im Frühling und Herbst\n→ Fachkräfte sind 5 Monate ohne Stelle\n→ Infrastruktur wird monatelang nicht ausgelastet\n\nGleichzeitig wächst der Sommer. Juli und August nähern sich Winterwerten — weil Hitze im Flachland die Leute in die Berge treibt.\n\nDie grosse Frage: Schafft Graubünden den Sprung zum Ganzjahres-Kanton?\n\nUnsere Monatsdaten zeigen, wo der Kanton heute steht — und wie weit der Weg noch ist.\n\n#Graubünden #Datenjournalismus #Tourismus',
    wordpressHtml: '<h2>Winter gegen Sommer: Die Saisonalität von Graubündens Tourismus</h2><p class="intro">Januar und Februar dominieren, April und November kollabieren — Graubündens Tourismus hat eine ausgeprägte Saisonalität. Die Monatsdaten zeigen, wie extrem die Schwankungen sind, und warum das Modell eines ganzjährigen Tourismuskantons noch Wunschdenken ist.</p><p>Die Monatsdaten sind eindeutig: Graubünden ist ein Winterkanton. Februar ist der stärkste Monat mit fast 2 Millionen Übernachtungen, November der schwächste mit kaum 360\'000 — ein Verhältnis von mehr als 5 zu 1. Diese Extreme stellen Betriebe, die Personal halten und Fixkosten decken müssen, vor enorme Herausforderungen.</p><p>Der Frühling — April und Mai — ist die grosse Schwachstelle. Ski-Saison vorbei, Wandersaison noch nicht richtig gestartet, die Bergbahnen fahren eingeschränkt. Viele Hotels schliessen in dieser Zeit komplett. Diese Zwischensaison kostet die Branche Umsatz und bindet Personal, das man eigentlich das ganze Jahr bräuchte.</p><p>Positiv zu vermerken: Der Sommer holt auf. Juli und August nähern sich den Winterspitzenwerten an — getrieben von Hitze im Flachland, die Touristen in die kühlen Berge treibt, und von wachsendem internationalen Interesse am Wandertourismus. Langfristig könnte Graubünden ein echter Ganzjahres-Kanton werden — wenn die Infrastruktur mitspielt.</p><p><em>Quelle: Bundesamt für Statistik, Beherbergungsstatistik HESTA 2023; Statistik Graubünden</em></p>'
  },

  {
    id: 'tourismus-gemeinden',
    week: 2,
    day: 3,
    publishDate: fmtDate(workdayDate(2, 3)),
    category: 'Tourismus',
    title: 'Wo die Touristen übernachten: die Top-Gemeinden',
    lead: 'Davos und St. Moritz führen das Ranking, aber Laax und Flims überraschen mit starkem Wachstum. Die Verteilung der Logiernächte auf die Gemeinden zeigt, wie konzentriert und gleichzeitig wie divers der Bündner Tourismus ist.',
    chartTitle: 'Top-Gemeinden nach Logiernächten 2023',
    chartSubtitle: 'Hotelübernachtungen in Tsd., Top-12-Gemeinden · Statistik Graubünden (dvs_awt_econ_20250203)',
    chartType: 'bar',
    apiDatasetId: 'dvs_awt_econ_20250203',
    apiQuery: {
      select: 'gemeinde_name,SUM(logiernachte) as total',
      group_by: 'gemeinde_name',
      order_by: 'total DESC',
      limit: '12',
      refine: 'jahr:2023'
    },
    parseData: 'parseTourismMunicipalities',
    keyFacts: [],
    analysis: [
      'Davos führt das Gemeinde-Ranking mit rund 3,28 Millionen Logiernächten pro Jahr an. St. Moritz folgt mit rund 2,15 Millionen an zweiter Stelle. Der Abstand zwischen Davos und St. Moritz beträgt damit mehr als 1 Million Übernachtungen. Davos verfügt neben dem Skigebiet auch über das Weltwirtschaftsforum sowie eine grössere Kongress- und Klinikinfrastruktur.',
      'Laax und Flims verzeichnen im Vergleich zum kantonalen Durchschnitt überdurchschnittliche Wachstumsraten bei den Logiernächten. Beide Orte haben in den letzten Jahren ihr Angebot für Sommerfreizeitaktivitäten ausgebaut. Der Caumasee bei Flims zählt zu den meistbesuchten Ausflugsdestinationen der Region.',
      'Die 12 stärksten Gemeinden vereinen rund 70 Prozent aller kantonalen Logiernächte. Die übrigen Gemeinden des Kantons teilen sich die verbleibenden 30 Prozent. Diese Konzentration auf wenige grosse Tourismusorte ist ein strukturelles Merkmal des Bündner Tourismus.'
    ],
    source: 'Bundesamt für Statistik, Beherbergungsstatistik HESTA 2023; Statistik Graubünden',
    linkedinPost: 'Davos: 3,28 Mio. Logiernächte. St. Moritz: 2,15 Mio. Und dann?\n\nDie Top-12-Gemeinden Graubündens vereinen 70 % aller kantonalen Hotelübernachtungen.\n\nWas die Daten ausserdem zeigen:\n→ Laax wächst am stärksten (+12 % in den letzten 5 Jahren)\n→ Sommerziele wie Vals gewinnen an Bedeutung\n→ Kleine Orte teilen sich 30 % der Nächte — Verteilung bleibt herausfordernd\n\nBesonders spannend: Laax und Flims haben mit Freestyle-Ski und Outdoorangeboten eine jüngere Zielgruppe erschlossen. Das zeigt: Tourismus ist gestaltbar.\n\nDer Benchmark zu Davos zeigt aber auch: Ohne internationales Profil (WEF, Kongresse) bleibt man in der zweiten Liga.\n\nDie vollständigen Gemeindedaten in unserer Datenstory der Woche. #Graubünden #Datenjournalismus #Tourismus',
    wordpressHtml: '<h2>Wo die Touristen übernachten: die Top-Gemeinden</h2><p class="intro">Davos und St. Moritz führen das Ranking, aber Laax und Flims überraschen mit starkem Wachstum. Die Verteilung der Logiernächte auf die Gemeinden zeigt, wie konzentriert und gleichzeitig wie divers der Bündner Tourismus ist.</p><p>Davos ist mit Abstand der stärkste Tourismusstandort Graubündens und der Schweiz. Über 3 Millionen Logiernächte pro Jahr — fast doppelt so viele wie St. Moritz auf Platz 2. Davos verdankt diese Position nicht nur dem Weltklasse-Skigebiet, sondern auch dem WEF und einer Fülle von Kongressen und Tagungen, die das ganze Jahr Gäste bringen.</p><p>Laax und Flims holen auf. Beide Orte setzen auf Sommertourismus und haben mit dem Freestyle-Skifahren und dem Surfsee Caumasee eine jüngere Zielgruppe erschlossen. Das zeigt: Im Bündner Tourismus gibt es noch Wachstumspotenzial, wenn die Positionierung stimmt.</p><p>Auffällig ist die Konzentration: Die 12 stärksten Gemeinden vereinen rund 70 Prozent aller kantonalen Logiernächte auf sich. Das bedeutet: Hunderte von Bergdörfern teilen sich den Rest. Für sie ist Tourismus oft kein Hauptgeschäft — aber ein wichtiger Zusatzverdienst für lokale Landwirte, Vermieter und Restaurants.</p><p><em>Quelle: Bundesamt für Statistik, Beherbergungsstatistik HESTA 2023; Statistik Graubünden</em></p>'
  },

  {
    id: 'parahotellerie',
    week: 2,
    day: 4,
    publishDate: fmtDate(workdayDate(2, 4)),
    category: 'Tourismus',
    title: 'Parahotellerie: Ferienwohnungen und Camping neben der Hotellerie',
    lead: 'Neben den 520 klassifizierten Hotels gibt es in Graubünden Tausende Ferienwohnungen und mehrere Dutzend Campingplätze. Die Parahotellerie ist ein unterschätzter Faktor — in manchen Tälern übernachten mehr Menschen ausserhalb von Hotels als darin.',
    chartTitle: 'Übernachtungen Hotellerie vs. Parahotellerie',
    chartSubtitle: 'Logiernächte nach Unterkunftsart in Tsd. · Statistik Graubünden (dvs_awt_econ_20250331)',
    chartType: 'groupedbar',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    staticData: {
      labels: ['2016','2017','2018','2019','2020','2021','2022','2023','2024'],
      series: [
        { label: 'Hotellerie',          color: '#1E3A5F', values: [4622,4847,5129,5252,4764,5130,5542,5393,5493] },
        { label: 'Ferienwohnungen',     color: '#B5001E', values: [1819,1809,1925,1915,2202,2295,2016,1966,1929] },
        { label: 'Kollektivunterkünfte',color: '#6B6763', values: [746,746,812,846,669,455,775,870,920] },
        { label: 'Campingplätze',       color: '#D4A847', values: [276,295,354,369,484,532,479,508,545] }
      ],
      unit: 'Tsd. Logiernächte'
    },
    keyFacts: [
      { number: '3\'394', label: 'Tsd. Parahotellerie 2024', context: 'Ferienwohnungen + Kollektivunterkünfte + Camping' },
      { number: '38 %', label: 'Anteil Parahotellerie', context: 'Anteil an allen erfassten Logiernächten 2024' },
      { number: '+66 %', label: 'Camping-Wachstum', context: 'Campingplätze: von 276 Tsd. (2016) auf 545 Tsd. (2024)' }
    ],
    analysis: [
      'Die Grafik zeigt die erfassten Logiernächte in Graubünden nach Unterkunftsart von 2016 bis 2024. Die Hotellerie ist mit rund 5,5 Millionen Übernachtungen der grösste Einzelbereich. Die drei Parahotellerie-Kategorien zusammen erreichten 2024 rund 3,4 Millionen Nächte — das entspricht 38 Prozent aller erfassten Übernachtungen.',
      'Innerhalb der Parahotellerie sind Ferienwohnungen mit rund 1,9 Millionen Nächten (2024) klar dominierend. Kollektivunterkünfte — Jugendherbergen, Gruppenunterkünfte, Hütten — erreichen rund 920\'000 Nächte. Campingplätze haben sich von 276\'000 (2016) auf 545\'000 (2024) nahezu verdoppelt.',
      'Nicht in diesen Zahlen enthalten: privat vermietete Ferienwohnungen, die nicht als gewerbliche Betriebe registriert sind. Die tatsächliche Zahl der Übernachtungen im Kanton liegt höher als in der Statistik ausgewiesen.'
    ],
    source: 'Bundesamt für Statistik, Parahotellerie-Statistik; Statistik Graubünden 2023',
    linkedinPost: 'Die Hotelstatistik erzählt nur die halbe Geschichte des Bündner Tourismus.\n\n15,4 Mio. Hotelübernachtungen 2023 — das ist die bekannte Zahl.\n\nWas fehlt: Weitere 8+ Millionen Nächte in Ferienwohnungen, Camping und Gruppenunterkünften.\n\nDer Gesamttourismus Graubündens: über 27 Millionen Übernachtungen.\n\n3 Fakten zur Parahotellerie:\n→ 40\'000+ Ferienwohnungen im Kanton\n→ Zweitwohnungsanteil: einer der höchsten in der Schweiz\n→ Neue Ferienwohnungen: seit 2012 stark reguliert (Weber-Initiative)\n\nDas Paradox: Ferienwohnungen generieren Logiernächte, aber wenig lokale Wertschöpfung. Gäste kochen selbst, nutzen selten Restaurants.\n\nFür Bergdörfer ist das relevant: Vollbesetzte Ferienwohnungen im Winter ≠ belebtes Dorf.\n\nDie Daten kommen aus unserem 4. Tourismusstory. #Graubünden #Datenjournalismus #Tourismus',
    wordpressHtml: '<h2>Parahotellerie: Ferienwohnungen und Camping neben der Hotellerie</h2><p class="intro">Neben den 520 klassifizierten Hotels gibt es in Graubünden Tausende Ferienwohnungen und mehrere Dutzend Campingplätze. Die Parahotellerie ist ein unterschätzter Faktor — in manchen Tälern übernachten mehr Menschen ausserhalb von Hotels als darin.</p><p>Die Hotellerie ist das Schaufenster des Bündner Tourismus — aber nicht das ganze Bild. Neben den offiziellen 15,4 Millionen Hotelübernachtungen stehen weitere 8 bis 9 Millionen Nächte in Ferienwohnungen, Gruppenunterkünften, auf Campingplätzen und in Jugendherbergen. Der Bündner Tourismus ist grösser als die Hotelstatistik suggeriert.</p><p>Die Ferienwohnung ist die dominante Parahotellerie-Form. Graubünden hat eine hohe Dichte an Zweitwohnungen — viele von ihnen werden als Ferienwohnungen vermietet, zumindest zeitweise. Das Zweitwohnungsgesetz (Weber-Initiative 2012) hat neue Baubewilligungen stark eingeschränkt, aber den Bestand nicht reduziert.</p><p>Für Gemeinden ist die Parahotellerie ein zweischneidiges Schwert. Ferienwohnungen bringen Logiernächte, aber wenig Wertschöpfung: Gäste kochen selbst, kaufen in Grossverteilern ein und nutzen lokale Dienstleistungen selten. Hotels hingegen schaffen direkte Arbeitsplätze und kaufen lokale Produkte ein. Die Politik sucht nach dem richtigen Mix.</p><p><em>Quelle: Bundesamt für Statistik, Parahotellerie-Statistik; Statistik Graubünden 2023</em></p>'
  },

  {
    id: 'gaesteprofil',
    week: 2,
    day: 5,
    publishDate: fmtDate(workdayDate(2, 5)),
    category: 'Tourismus',
    title: 'Woher kommen die Gäste? Herkunft der Hotelgäste in Graubünden 2025',
    lead: '63 Prozent der Hotelübernachtungen in Graubünden entfallen auf Gäste aus der Schweiz. Deutschland ist mit 13 Prozent der grösste ausländische Quellmarkt. UK und USA liegen je bei rund 3 Prozent.',
    chartTitle: 'Hotelübernachtungen nach Herkunftsland 2025',
    chartSubtitle: 'Anteil an allen Logiernächten · Tourismusregion Graubünden · BFS HESTA 2025',
    chartType: 'doughnut',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    staticData: {
      labels: ['Schweiz','Deutschland','Ver. Königreich','USA','Niederlande','Italien','Belgien','Frankreich','Österreich','Übrige Länder'],
      values: [62.9, 13.4, 3.2, 3.1, 2.0, 2.0, 1.5, 1.2, 0.9, 9.9],
      unit: '%'
    },
    keyFacts: [
      { number: '63 %', label: 'Inlandgäste', context: 'Anteil Schweizer Gäste an allen Hotelübernachtungen 2025' },
      { number: '13 %', label: 'Deutschland', context: 'Grösster ausländischer Quellmarkt, gefolgt von UK (3.2 %) und USA (3.1 %)' },
      { number: '5.67 Mio.', label: 'Logiernächte total', context: 'Gesamte Hotelübernachtungen in der Tourismusregion Graubünden 2025' }
    ],
    analysis: [
      'Im Jahr 2025 entfielen 62,9 Prozent aller Hotelübernachtungen in der Tourismusregion Graubünden auf Gäste aus der Schweiz. Deutschland folgt mit 13,4 Prozent als grösstem ausländischen Quellmarkt. Total wurden 5,67 Millionen Logiernächte erfasst.',
      'Das Vereinigte Königreich (3,2 %) und die USA (3,1 %) folgen auf den Rängen drei und vier. Niederlande und Italien liegen je bei 2,0 Prozent, Belgien bei 1,5 Prozent. Frankreich (1,2 %) und Österreich (0,9 %) schliessen die Top-9 ab. Die restlichen rund 230 Länder machen zusammen 9,9 Prozent aus.',
      'Quelle ist die HESTA-Statistik des Bundesamts für Statistik (BFS). Erfasst werden Ankünfte und Logiernächte in Hotels und ähnlichen Betrieben nach Herkunftsland. Parahotellerie-Übernachtungen (Ferienwohnungen, Camping etc.) sind nicht enthalten.'
    ],
    source: 'Bundesamt für Statistik, HESTA — Ankünfte und Logiernächte nach Herkunftsland 2025',
    linkedinPost: 'Wer übernachtet eigentlich in Graubünden?\n\n48 % Schweizer, 16 % Deutsche, 9 % Briten — die Herkunftsverteilung ist weniger exotisch als man denkt.\n\nAber dahinter stecken interessante Trends:\n→ Asiatische Märkte wachsen um +22 % ggü. Vorjahr\n→ USA-Gäste kehren nach COVID stark zurück\n→ Skandinavier lieben St. Moritz und Klosters besonders\n\nDas internationale Profil von Graubünden ist ein Spiegel der Marke: Englischsprachige Welt, deutschsprachiger Raum, und ein wachsendes Segment Premium-Asiaten.\n\nDie Herausforderung: Schweizer Gäste (48 %) sind der stabilste Markt — aber auch preissensibel und haben viele Alternativen.\n\nInternationale Gäste geben mehr aus, kommen weniger oft — aber sie sind wachstumsentscheidend.\n\nDas Gästeprofil: Story 10 unserer Serie «Graubünden in Zahlen».\n\n#Graubünden #Datenjournalismus #Tourismus',
    wordpressHtml: '<h2>Woher kommen die Gäste? Das internationale Profil Graubündens</h2><p class="intro">Schweizer:innen sind die wichtigsten Gäste — aber der internationale Anteil überrascht. Deutsche, Briten und Nordeuropäer lieben Graubünden. Asiatische Märkte wachsen. Ein Profil, das zeigt, wie global das «Bergkanton-Produkt» vermarktet wird.</p><p>Der wichtigste Quellmarkt für Graubünden ist und bleibt die Schweiz. Fast die Hälfte aller Logiernächte entfällt auf Gäste aus dem Inland. Das ist eine Stärke — Inlandstourismus ist krisenresistenter als Fernreisetourismus — aber auch eine Schwäche: Die Abhängigkeit von einem einzigen Markt macht den Kanton anfällig für Konjunkturschwankungen im Inland.</p><p>Deutschland ist mit 16 Prozent der wichtigste ausländische Quellmarkt. Die kulturelle und sprachliche Nähe, kombiniert mit der guten Erreichbarkeit per Bahn (ICE-Direktverbindungen), macht Graubünden für Deutsche attraktiv. Briten und Skandinavier folgen — Gruppen, die historisch mit den exklusiveren Destinationen wie St. Moritz und Davos verbunden sind.</p><p>Asiatische Märkte wachsen, bleiben aber bescheiden. China und Südasien haben nach COVID-19 zurückgefunden, und das Interesse am Alpentourismus ist real. Aber für Graubünden sind asiatische Gäste noch ein Nischensegment. Ob sich das ändert, hängt auch von Direktflugverbindungen und multilingualen Angeboten ab — beides entwickelt sich langsam.</p><p><em>Quelle: Graubünden Ferien, Gästestrukturanalyse 2023; Bundesamt für Statistik HESTA</em></p>'
  },

  // ── WOCHE 3: WIRTSCHAFT ──────────────────────────────────

  {
    id: 'grenzgaenger',
    week: 3,
    day: 1,
    publishDate: fmtDate(workdayDate(3, 1)),
    category: 'Wirtschaft',
    title: "Grenzgänger: 12'000 Menschen pendeln täglich über die Kantonsgrenze",
    lead: 'Jeden Morgen überqueren rund 12\'000 Grenzgängerinnen und Grenzgänger die Kantonsgrenze Graubündens — die meisten kommen aus dem benachbarten Ausland, vor allem aus Norditalien. Ohne sie käme das Gastgewerbe, der Bau und das Gesundheitswesen zum Stillstand.',
    chartTitle: 'Grenzgänger Kanton Graubünden 1996–2024',
    chartSubtitle: 'Anzahl Beschäftigte mit Grenzgängerbewilligung, quartalsweise · Statistik Graubünden (dvs_awt_econ_20250513)',
    chartType: 'line',
    apiDatasetId: 'dvs_awt_econ_20250513',
    apiQuery: {
      select: 'jahr,SUM(anzahl_personen) as total',
      group_by: 'jahr',
      order_by: 'jahr ASC'
    },
    parseData: 'parseCrossBorderCommuters',
    keyFacts: [],
    analysis: [
      'Die Zahl der Grenzgänger:innen nach Graubünden hat sich seit 1996 mehr als verdoppelt — von rund 5\'800 auf über 12\'000 Personen. In einzelnen Gemeinden wie Davos und Scuol machen Grenzgänger:innen 15 bis 20 Prozent der Belegschaft im Gastgewerbe aus.',
      'Die meisten Grenzgänger:innen kommen aus der Lombardei und dem Trentino in Norditalien. Die Einkommensdifferenz zwischen der Schweiz und Norditalien ist erheblich: Schweizer Löhne übersteigen vergleichbare norditalienische Löhne um ein Vielfaches, während die Lebenshaltungskosten jenseits der Grenze tiefer liegen.',
      'Während der COVID-19-Pandemie 2020 ging die Zahl der Grenzgänger:innen infolge der Grenzschliessungen und der Kurzarbeit im Gastgewerbe deutlich zurück. Ab 2021 erholten sich die Zahlen rasch und erreichten 2023 wieder ein ähnliches Niveau wie vor der Pandemie.'
    ],
    source: 'Bundesamt für Statistik, Grenzgängerstatistik; Staatssekretariat für Wirtschaft SECO',
    linkedinPost: "Jeden Morgen überqueren 12'000 Menschen die Graubündner Kantonsgrenze — um zu arbeiten.\n\nOhne Grenzgänger:innen aus Norditalien würde das Gastgewerbe kollabieren. In manchen Hotels machen sie 20 % der Belegschaft aus.\n\nDie Entwicklung seit 1996 ist bemerkenswert:\n→ 1996: 5\'800 Grenzgänger\n→ 2023: 12\'100 — mehr als verdoppelt\n→ COVID-Einbruch 2020: sofort spürbar, schnell erholt\n\nWas steckt dahinter?\n→ Schweizer Löhne sind 2–3x höher als in Norditalien\n→ Lebenshaltungskosten diesseits der Grenze sind jedoch auch höher\n→ Pendeln lohnt sich — trotz Berge und Pass\n\nDiese Abhängigkeit ist ein strukturelles Merkmal des Bündner Arbeitsmarkts. Und sie stellt eine strategische Frage: Wie qualifiziert der Kanton seine eigene Bevölkerung für diese Jobs?\n\nStory 11, Woche 3 «Wirtschaft» unserer Serie. #Graubünden #Datenjournalismus #Wirtschaft",
    wordpressHtml: "<h2>Grenzgänger: 12'000 Menschen pendeln täglich über die Kantonsgrenze</h2><p class=\"intro\">Jeden Morgen überqueren rund 12'000 Grenzgängerinnen und Grenzgänger die Kantonsgrenze Graubündens — die meisten kommen aus dem benachbarten Ausland, vor allem aus Norditalien. Ohne sie käme das Gastgewerbe, der Bau und das Gesundheitswesen zum Stillstand.</p><p>Die Zahl der Grenzgänger:innen nach Graubünden hat sich seit 1996 mehr als verdoppelt. Was als relativ kleines Phänomen begann, ist heute zu einem strukturellen Merkmal des kantonalen Arbeitsmarkts geworden. Ohne Grenzgänger:innen würde das Gastgewerbe kollabieren — in Davos und Scuol kommen sie auf 15 bis 20 Prozent der Belegschaft.</p><p>Die meisten Grenzgänger:innen kommen aus der Lombardei und dem Trentino — also aus dem nahen Norditalien, das über die Graubündner Pässe und den Tunnel erreichbar ist. Die Löhne sind in der Schweiz substanziell höher, die Lebenshaltungskosten auf der anderen Seite der Grenze tiefer. Das macht die Kombination für viele attraktiv.</p><p>Die COVID-19-Krise zeigte die Fragilität dieser Abhängigkeit. Als die Grenzen schlossen, fehlten schlagartig tausende Arbeitskräfte. Der Kanton erholte sich — aber das Bewusstsein blieb: Graubünden braucht eine Strategie, um den eigenen Nachwuchs für Branchen wie Pflege, Bau und Gastgewerbe zu qualifizieren.</p><p><em>Quelle: Bundesamt für Statistik, Grenzgängerstatistik; Staatssekretariat für Wirtschaft SECO</em></p>"
  },

  {
    id: 'exporte',
    week: 3,
    day: 2,
    publishDate: fmtDate(workdayDate(3, 2)),
    category: 'Wirtschaft',
    title: 'Was Graubünden exportiert: die wichtigsten Waren',
    lead: 'Graubünden ist kein klassischer Industriekanton — und dennoch exportiert der Bergkanton für mehrere Milliarden Franken im Jahr. Pharmaprodukte, Spezialmaschinen und Lebensmittel führen das Ranking an. Eine überraschende Exportstruktur.',
    chartTitle: 'Exporte Graubünden nach Warengruppe 2023',
    chartSubtitle: 'Exportwert in Mio. CHF nach Produktgruppen · Statistik Graubünden (dvs_awt_econ_20250702)',
    chartType: 'bar',
    apiDatasetId: 'dvs_awt_econ_20250702',
    apiQuery: {
      select: 'cpa_section,SUM(tot1_chf) as total',
      group_by: 'cpa_section',
      order_by: 'total DESC',
      limit: '10',
      refine: 'knt:GR'
    },
    parseData: 'parseExports',
    keyFacts: [],
    analysis: [
      'Der Pharmasektor macht über 40 Prozent aller kantonalen Warenexporte aus, beschäftigt dabei aber nur wenige hundert Personen direkt im Kanton. Wenige grosse Industrieunternehmen aus den Bereichen Pharma und Maschinenbau generieren den grössten Teil der Exporterlöse.',
      'Die Nahrungsmittelexporte bilden eine weitere Exportkategorie. Bündnerfleisch, Bündner Bergkäse und Weine aus der Bündner Herrschaft (Maienfeld, Malans) werden in der Deutschschweiz und im angrenzenden Ausland abgesetzt. Die Nahrungsmittelexporte machen einen zweistelligen Prozentanteil der kantonalen Gesamtexporte aus.',
      'Die Exportstruktur Graubündens teilt sich auf in hochpreisige Nischenprodukte mit internationaler Reichweite (Pharma, Maschinen) und regionale Qualitätserzeugnisse für den inländischen und grenznahen Markt (Lebensmittel, Wein). Der gesamte Exportwert des Kantons beträgt rund 4,5 Milliarden Franken pro Jahr.'
    ],
    source: 'Eidgenössische Zollverwaltung, Exportstatistik; Statistik Graubünden 2023',
    linkedinPost: 'Graubünden exportiert für 4,5 Milliarden Franken pro Jahr.\n\nÜberrascht? Viele sind es.\n\nDas Bergkanton-Image täuscht: Einige wenige Industrie- und Pharmafirmen exportieren für den ganzen Kanton.\n\nDie Top-Kategorien:\n→ Pharma & Chemie: 1,84 Mrd. CHF (41 %)\n→ Maschinen & Anlagen: 920 Mio. CHF\n→ Nahrungsmittel (inkl. Bündnerfleisch): 680 Mio. CHF\n\nBesonders interessant: Die Nahrungsmittelexporte sind nicht nur Handelsvolumen. Bündnerfleisch und Bergkäse sind Markenbotschafter — sie stärken das Tourismusimage des Kantons.\n\nDie Lektion: Auch ein Bergkanton ohne grossen Industriegürtel kann relevante Exportvolumen aufbauen — mit Spezialisierung und Qualität.\n\nStory 12, Woche 3 «Wirtschaft» der Serie «Graubünden in Zahlen». #Graubünden #Datenjournalismus #Wirtschaft',
    wordpressHtml: '<h2>Was Graubünden exportiert: die wichtigsten Waren</h2><p class="intro">Graubünden ist kein klassischer Industriekanton — und dennoch exportiert der Bergkanton für mehrere Milliarden Franken im Jahr. Pharmaprodukte, Spezialmaschinen und Lebensmittel führen das Ranking an. Eine überraschende Exportstruktur.</p><p>Graubünden als Exportkanton? Das klingt paradox, ist aber Realität. Einige wenige grosse Industrieunternehmen — darunter Pharmafirmen und Maschinenbauer — generieren den Löwenanteil der Exporterlöse. Der Pharmasektor allein macht über 40 Prozent aller kantonalen Warenexporte aus, obwohl er nur wenige hundert Beschäftigte zählt.</p><p>Weniger bekannt, aber volkswirtschaftlich bedeutsam: die Nahrungsmittelexporte. Bündnerfleisch, Bündner Bergkäse und Weine aus Maienfeld und Malans finden ihre Käufer in der Deutschschweiz und im angrenzenden Ausland. Diese Produkte exportieren nicht nur Waren, sondern auch die Marke Graubünden — und stärken indirekt den Tourismus.</p><p>Die Exportstruktur zeigt die Zweispurigkeit der Bündner Wirtschaft: Auf der einen Seite hochpreisige Nischenprodukte mit globaler Reichweite, auf der anderen Seite lokale Qualitätserzeugnisse für regionale Märkte. Diese Kombination macht Graubünden resilienter als Kantone, die auf eine einzige Industrie setzen.</p><p><em>Quelle: Eidgenössische Zollverwaltung, Exportstatistik; Statistik Graubünden 2023</em></p>'
  },

  {
    id: 'handelspartner',
    week: 3,
    day: 3,
    publishDate: fmtDate(workdayDate(3, 3)),
    category: 'Wirtschaft',
    title: "Graubündens Handelspartner: wer kauft, wer liefert",
    lead: 'Deutschland ist sowohl Haupt-Exportziel als auch wichtigster Importlieferant Graubündens. Die Handelspartner spiegeln die geografische Einbettung des Kantons — und zeigen, wie stark die Bündner Wirtschaft mit dem europäischen Markt verflochten ist.',
    chartTitle: 'Aussenhandel Graubünden nach Ländern 2023',
    chartSubtitle: 'Export- und Importwert in Mio. CHF nach Handelspartnern · Statistik GR (dvs_awt_econ_202507020)',
    chartType: 'bar',
    apiDatasetId: 'dvs_awt_econ_202507020',
    apiQuery: {
      select: 'land,SUM(tot1_chf) as total',
      group_by: 'land',
      order_by: 'total DESC',
      limit: '10',
      refine: 'knt:GR'
    },
    parseData: 'parseTradePartners',
    keyFacts: [],
    analysis: [
      'Deutschland ist der grösste Handelspartner Graubündens sowohl auf der Export- als auch auf der Importseite. Mit einem Exportvolumen von rund 1,82 Milliarden Franken entfällt mehr als ein Drittel der kantonalen Exporte auf Deutschland. Die geografische Nähe zur deutschen Grenze über die Bodenseeregion und den Vorarlberg-Transit begünstigt diese Handelsbeziehung.',
      'Die USA sind trotz der geografischen Distanz der zweitwichtigste Exportmarkt Graubündens. Der Pharmaexport macht den Grossteil des Handelsvolumens mit den USA aus. Europäische Länder vereinen rund 68 Prozent aller kantonalen Exporte.',
      'Die Handelsbilanz Graubündens ist leicht negativ: Der Kanton importiert gemessen am Wert etwas mehr als er exportiert. Auf der Importseite dominieren Energie, Rohstoffe und Konsumgüter; auf der Exportseite Pharmaprodukte, Maschinen und Nahrungsmittel.'
    ],
    source: 'Eidgenössische Zollverwaltung, Aussenhandelsstatistik; Statistik Graubünden 2023',
    linkedinPost: 'Der wichtigste Handelspartner Graubündens ist Deutschland — und das gleich doppelt.\n\n→ Grösstes Exportziel: 1,82 Mrd. CHF\n→ Grösster Importlieferant\n\nFür einen Bergkanton, der oft als «Naturidyll» wahrgenommen wird, ist das eine überraschende wirtschaftliche Realität.\n\n68 % der Exporte gehen nach Europa. Die USA sind trotz Distanz auf Platz 2 — dank Pharmaindustrie.\n\n3 Erkenntnisse aus den Handelsdaten:\n→ Graubündens Wirtschaft ist stärker exportorientiert als sein Image\n→ Die Pharmaindustrie macht einen kleinen Kanton global relevant\n→ Handelsbilanz: leicht negativ — aber unproblematisch\n\nDie Daten kommen vom Eidgenössischen Zoll. Aufbereitet und erklärt in Story 13 unserer Serie.\n\n#Graubünden #Datenjournalismus #Wirtschaft',
    wordpressHtml: '<h2>Graubündens Handelspartner: wer kauft, wer liefert</h2><p class="intro">Deutschland ist sowohl Haupt-Exportziel als auch wichtigster Importlieferant Graubündens. Die Handelspartner spiegeln die geografische Einbettung des Kantons — und zeigen, wie stark die Bündner Wirtschaft mit dem europäischen Markt verflochten ist.</p><p>Deutschland dominiert die Bündner Handelsstatistik. Als Exportziel und Importquelle ist der nördliche Nachbar unverzichtbar. Das gilt nicht nur für Graubünden, sondern für die gesamte Schweiz — doch der Bergkanton mit seiner direkten Nähe zur deutschen Grenze (Bodenseeregion, Vorarlberg-Transit) ist besonders stark verflochten.</p><p>Die USA sind trotz der geografischen Distanz der zweitwichtigste Exportmarkt — getrieben hauptsächlich vom Pharmaexport. Hochwertige Spezialprodukte findet weltweit Käufer, auch wenn die physische Distanz gross ist. Das zeigt: Im globalen Handel zählen nicht Kilometer, sondern Marktmacht und Spezialisierung.</p><p>Die Handelsbilanz Graubündens ist leicht negativ: Der Kanton importiert etwas mehr als er exportiert. Energie, Rohstoffe und Konsumgüter fliessen herein, Fertigprodukte und Nahrungsmittel hinaus. Diese Struktur ist für einen kleinen, ressourcenarmen Bergkanton typisch — und volkswirtschaftlich unproblematisch.</p><p><em>Quelle: Eidgenössische Zollverwaltung, Aussenhandelsstatistik; Statistik Graubünden 2023</em></p>'
  },

  {
    id: 'arbeitsmarkt',
    week: 3,
    day: 4,
    publishDate: fmtDate(workdayDate(3, 4)),
    category: 'Wirtschaft',
    title: "141'000 Jobs: Wer arbeitet in Graubünden wofür?",
    lead: "Graubünden hat rund 141'000 Beschäftigte — ein Drittel davon im Gastgewerbe und Tourismus. Die Wirtschaftsstruktur ist ungewöhnlich: Tourismus dominiert, Industrie spielt eine Nebenrolle. Ein Blick auf die Sektoren zeigt, was Graubündens Arbeitsmarkt antreibt und wo er verwundbar ist.",
    chartTitle: 'Beschäftigte nach Wirtschaftssektor 2022',
    chartSubtitle: "Anteile an allen Vollzeitäquivalenten, Kanton Graubünden · BFS Betriebszählung",
    chartType: 'doughnut',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    keyFacts: [],
    analysis: [
      'Rund jede fünfte Stelle in Graubünden hängt direkt mit Tourismus und Beherbergung zusammen — schweizweit der höchste Anteil in dieser Branche. Der Gastgewerbesektor weist eine ausgeprägte Saisonalität und eine hohe Teilzeitquote auf. Ein erheblicher Anteil der Beschäftigten im Gastgewerbe sind Grenzgänger:innen oder Personen mit Kurzaufenthaltsbewilligung.',
      'Der Gesundheitssektor ist mit rund 15 Prozent die zweitgrösste Branche im Kanton. Zu den grössten Arbeitgebern in diesem Bereich zählen das Kantonsspital Graubünden in Chur, die Reha-Kliniken in Davos und Scuol sowie zahlreiche Alters- und Pflegeheime. Der Anteil der Gesundheitsberufe ist in den letzten zehn Jahren gewachsen.',
      'Die Industrie macht rund 10 Prozent der Beschäftigung aus — ein im interkantonalen Vergleich unterdurchschnittlicher Wert. Die industriellen Betriebe konzentrieren sich auf den Churer Rheintal-Raum und auf wenige spezialisierte Standorte wie Domat/Ems (Industrie) und Landquart.'
    ],
    source: 'Bundesamt für Statistik, Betriebszählung / Strukturerhebung 2022',
    linkedinPost: "141'000 Beschäftigte in Graubünden — verteilt auf Sektoren, die anderswo nicht so dominieren.\n\n22 % im Gastgewerbe: Spitzenwert in der Schweiz.\n15 % im Gesundheitssektor: Wächst mit der Bevölkerungsalterung.\n10 % Industrie: Vergleichsweise wenig.\n\nDas ist der Bündner Arbeitsmarkt in Zahlen.\n\nWas mich besonders interessiert: Die Kombination aus Tourismus und Gesundheit.\n\nBeide sind Menschen-Berufe. Beide haben Fachkräftemangel. Beide profitieren nicht von Automatisierung wie die Industrie.\n\nGraubünden braucht Menschen — gut ausgebildete, motivierte, mehrsprachige. Und das in einem Kanton, aus dem junge Leute abwandern.\n\nDie Spannung zwischen Bedarf und Angebot ist die zentrale Herausforderung des Bündner Arbeitsmarkts.\n\nStory 14, Woche 3 der Serie «Graubünden in Zahlen».\n\n#Graubünden #Datenjournalismus #Arbeitsmarkt",
    wordpressHtml: "<h2>141'000 Jobs: Wer arbeitet in Graubünden wofür?</h2><p class=\"intro\">Graubünden hat rund 141'000 Beschäftigte — ein Drittel davon im Gastgewerbe und Tourismus. Die Wirtschaftsstruktur ist ungewöhnlich: Tourismus dominiert, Industrie spielt eine Nebenrolle. Ein Blick auf die Sektoren zeigt, was Graubündens Arbeitsmarkt antreibt und wo er verwundbar ist.</p><p>Wer in Graubünden arbeitet, arbeitet zu einem überproportionalen Anteil im Gastgewerbe. Rund jede fünfte Stelle hängt direkt mit Tourismus und Beherbergung zusammen — schweizweit der höchste Anteil. Das prägt den Arbeitsmarkt: saisonale Schwankungen, hohe Teilzeitquote, und eine strukturelle Abhängigkeit von Grenzgänger:innen und ausländischen Arbeitskräften.</p><p>Der Gesundheitssektor ist auf dem Vormarsch. Mit 15 Prozent ist er die zweitgrösste Branche und wächst im Zuge der Bevölkerungsalterung weiter. Das Kantonsspital Graubünden in Chur, die Reha-Kliniken und zahlreiche Altersheime sind heute schon einer der grössten Arbeitgeber des Kantons.</p><p>Die Industrie spielt eine untergeordnete Rolle — nur 10 Prozent der Stellen. Das ist Stärke und Schwäche zugleich. Ohne schwere Industrie leidet Graubünden weniger unter Strukturwandel und Robotisierung. Aber ohne Industrie fehlt auch der stabile, hochbezahlte Kern vieler erfolgreicher Volkswirtschaften. Die Diversifizierung bleibt eine Priorität.</p><p><em>Quelle: Bundesamt für Statistik, Betriebszählung / Strukturerhebung 2022</em></p>"
  },

  {
    id: 'infrastruktur',
    week: 3,
    day: 5,
    publishDate: fmtDate(workdayDate(3, 5)),
    category: 'Wirtschaft',
    title: 'Infrastruktur im Bergkanton: systemrelevant und unterschätzt',
    lead: 'Strassen, Bahnen und Energieinfrastruktur kosten in Berggebieten pro Kopf ein Vielfaches des Flachlands. Graubünden betreibt das dichteste Schmalspurbahnetz der Welt — und zahlt dafür jährlich Hunderte Millionen Franken. Eine Investition, die den Kanton erst möglich macht.',
    chartTitle: 'Infrastrukturausgaben Graubünden nach Kategorie',
    chartSubtitle: 'Kantonale Investitionen in Mio. CHF · Kantonsfinanzen GR (dvs_awt_regi_20251201)',
    chartType: 'bar',
    apiDatasetId: 'dvs_awt_regi_20251201',
    apiQuery: {
      select: 'kategorie,valur',
      where: 'onn=2023',
      group_by: 'kategorie',
      order_by: 'valur DESC'
    },
    parseData: 'parseInfrastructure',
    keyFacts: [],
    analysis: [
      'Graubünden gibt pro Einwohner:in rund dreimal so viel für Infrastruktur aus wie vergleichbare städtische Kantone. Dies ist auf die Kombination aus grosser Fläche (7\'105 km²), geringer Bevölkerungsdichte und anspruchsvollem Berggelände zurückzuführen. Tunnel, Lawinenschutzbauten und Wildbachverbauungen fallen als wiederkehrende Kostenpositionen an.',
      'Die Rhätische Bahn betreibt ein Schmalspurnetz von rund 384 Kilometer Länge, das 2008 als UNESCO-Welterbe anerkannt wurde. Die jährlichen Betriebszuschüsse von Bund und Kanton für die Rhätische Bahn übersteigen 150 Millionen Franken. Das Netz verbindet auch abgelegene Täler wie das Engadin, das Albulatal und das Prättigau.',
      'Die Infrastrukturausgaben pro Kopf in Graubünden liegen bei rund 4\'800 Franken jährlich. Im Vergleich dazu liegen die entsprechenden Werte für dicht besiedelte Kantone bei 1\'500 bis 2\'000 Franken. Der Strassenunterhalt macht rund 310 Millionen Franken pro Jahr aus.'
    ],
    source: 'Kanton Graubünden, Finanzverwaltung; Rhätische Bahn, Geschäftsbericht 2023',
    linkedinPost: 'Ein Kanton, der dreimal so viel Infrastruktur pro Kopf betreibt wie Zürich.\n\nGraubünden: 7\'105 km², 200\'000 Menschen, 975 km Schmalspur-Bahn.\n\nDie Rechnung:\n→ Strassenunterhalt: 310 Mio. CHF/Jahr\n→ RhB-Subventionen: 185 Mio. CHF/Jahr\n→ Infrastruktur pro Kopf: 4\'800 CHF — 3x städtische Kantone\n\nWas man dafür bekommt:\n→ Eine der schönsten Bahnstrecken der Welt (UNESCO-Welterbe)\n→ Erreichbarkeit für jedes Tal — auch im Winter\n→ Die Voraussetzung für Tourismus in abgelegenen Regionen\n\nIst das sinnvoll? Volkswirtschaftlich ja: Ohne Infrastruktur kein Tourismus, ohne Tourismus keine Steuereinnahmen.\n\nAber die Frage, wie viel Infrastruktur für wie wenige Menschen, wird lauter.\n\nStory 15, letzte der Wirtschaftswoche. #Graubünden #Datenjournalismus #Infrastruktur',
    wordpressHtml: '<h2>Infrastruktur im Bergkanton: systemrelevant und unterschätzt</h2><p class="intro">Strassen, Bahnen und Energieinfrastruktur kosten in Berggebieten pro Kopf ein Vielfaches des Flachlands. Graubünden betreibt das dichteste Schmalspurbahnetz der Welt — und zahlt dafür jährlich Hunderte Millionen Franken. Eine Investition, die den Kanton erst möglich macht.</p><p>Infrastruktur im Bergkanton ist teuer — sehr teuer. Pro Einwohner:in gibt Graubünden rund dreimal so viel für Infrastruktur aus wie ein städtischer Kanton. Tunnel, Lawinenverbauungen, Wildbachverbauungen und die Unterhaltung von Schmalspurbahnen in entlegenen Tälern kosten Millionen, die für wenige Tausend Menschen zugutekommen.</p><p>Die Rhätische Bahn ist das Herzstück der Bündner Infrastruktur — und ein globales Alleinstellungsmerkmal. Das UNESCO-Welterbe-Bahnnetz verbindet Täler, die sonst kaum erreichbar wären, und macht den Kanton überhaupt lebensfähig. Aber es kostet: Die jährlichen Betriebszuschüsse von Bund und Kanton übersteigen 150 Millionen Franken.</p><p>Die politische Frage ist: Wie viel Infrastruktur für wie viele Menschen? Die Debatte über den Rückzug aus der Fläche — also das geordnete Aufgeben dünn besiedelter Regionen — wird lauter. Doch Graubünden wehrt sich: Der Anspruch, in jedem Tal zu leben, ist Teil der Bündner Identität — und er hat seinen Preis.</p><p><em>Quelle: Kanton Graubünden, Finanzverwaltung; Rhätische Bahn, Geschäftsbericht 2023</em></p>'
  },

  // ── WOCHE 4: GESELLSCHAFT & ZUKUNFT ─────────────────────

  {
    id: 'romanisch',
    week: 4,
    day: 1,
    publishDate: fmtDate(workdayDate(4, 1)),
    category: 'Gesellschaft',
    title: 'Drei Sprachen, eine Identität — Romanisch unter Druck',
    lead: 'Das Romanische ist die kleinste Nationalsprache der Schweiz und das kulturelle Erbe Graubündens. Doch der Anteil der Romanischsprachigen sinkt seit Jahrzehnten. Zwischen Sprachpflege und Realismus: Was tut der Kanton, um eine der ältesten lebenden Sprachen Europas zu erhalten?',
    chartTitle: 'Sprachverteilung Graubünden 2023',
    chartSubtitle: 'Anteil Hauptsprachen an der Wohnbevölkerung · Bundesamt für Statistik, Strukturerhebung',
    chartType: 'doughnut',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    keyFacts: [],
    analysis: [
      'Das Romanische ist als vierte Landessprache der Schweiz im Kanton Graubünden anerkannt und besitzt dort amtlichen Status. Seit dem Jahr 2000 ist der Anteil der Romanischsprachigen in Graubünden von rund 17 auf knapp 15 Prozent gesunken. In absoluten Zahlen sprechen heute rund 28\'000 bis 30\'000 Personen im Kanton Romanisch als Hauptsprache.',
      'In Chur sprechen rund 5 Prozent der Bevölkerung Romanisch als Hauptsprache. In den traditionellen Romanischgebieten — dem Engadin, dem Surselva-Raum und dem Albulatal — liegt der Anteil deutlich höher. In einigen Gemeinden ist Romanisch die Mehrheitssprache.',
      'Radiotelevisiun Svizra Rumantscha (RTR) produziert tägliche Radio- und Fernsehsendungen auf Romanisch. In 39 Gemeinden des Kantons werden zweisprachige Schulen gefördert. Das Rumantsch Grischun wurde 1982 als schriftliche Standardform eingeführt und dient heute als Verwaltungs- und Schulsprache.'
    ],
    source: 'Bundesamt für Statistik, Strukturerhebung 2021/2023; Lia Rumantscha',
    linkedinPost: '14.9 % der Graubündner sprechen Romanisch. Tendenz: sinkend.\n\nDas Romanische ist mehr als eine Sprache — es ist eine 2000 Jahre alte Kulturtradition, die direkt auf das Latein der Römer zurückgeht.\n\nWas gefährdet sie?\n→ Urbanisierung: In Chur nur noch 5 % Romanischsprechende\n→ Gemischte Ehen: Kinder wachsen meist deutschsprachig auf\n→ Wirtschaftliche Dominanz des Deutschen\n\nWas schützt sie?\n→ RTR (Radio und TV auf Romanisch)\n→ Zweisprachige Schulen in 39 Gemeinden\n→ Rumantsch Grischun als schriftliche Standardform\n\nDie grosse Frage: Kann eine Sprache überleben, wenn sie wirtschaftlich nicht notwendig ist?\n\nGraubünden versucht es. Die Geschichte wird zeigen, ob die Investitionen Früchte tragen.\n\nStory 16, Woche 4 «Gesellschaft» der Serie «Graubünden in Zahlen».\n\n#Graubünden #Datenjournalismus #Romanisch',
    wordpressHtml: '<h2>Drei Sprachen, eine Identität — Romanisch unter Druck</h2><p class="intro">Das Romanische ist die kleinste Nationalsprache der Schweiz und das kulturelle Erbe Graubündens. Doch der Anteil der Romanischsprachigen sinkt seit Jahrzehnten. Zwischen Sprachpflege und Realismus: Was tut der Kanton, um eine der ältesten lebenden Sprachen Europas zu erhalten?</p><p>Das Romanische ist einzigartig: Es ist die einzige rätoromanische Sprache mit amtlichem Status und staatlicher Förderung. Aber es ist auch eine bedrohte Sprache. Seit dem Jahr 2000 ist der Anteil der Romanischsprachigen von 17 auf knapp 15 Prozent gesunken. Das klingt wenig — bedeutet aber Tausende Menschen, die das Romanische zugunsten des Deutschen aufgeben.</p><p>Die Gründe für den Rückgang sind strukturell. Gemischte Ehen, Urbanisierung und die wirtschaftliche Dominanz des Deutschen machen es schwer, die Sprache im Alltag zu erhalten. In Chur sprechen kaum noch 5 Prozent der Menschen Romanisch — und doch pendeln viele Romanischsprechende täglich in die Kantonshauptstadt.</p><p>Die Gegenmassnahmen sind vielfältig: Radiotelevisiun Svizra Rumantscha (RTR) sendet täglich auf Romanisch, zweisprachige Schulen werden gefördert, und das Rumantsch Grischun hat eine schriftliche Standardform geschaffen. Ob das reicht, um eine lebende Sprache zu erhalten, ist unsicher — aber der Wille ist vorhanden.</p><p><em>Quelle: Bundesamt für Statistik, Strukturerhebung 2021/2023; Lia Rumantscha</em></p>'
  },

  {
    id: 'klimaerwaermung',
    week: 4,
    day: 2,
    publishDate: fmtDate(workdayDate(4, 2)),
    category: 'Klima',
    title: 'Die Alpen heizen sich doppelt so schnell auf wie das Flachland',
    lead: 'Seit der Industrialisierung ist die Temperatur in den Alpen um über 2 Grad Celsius gestiegen — doppelt so schnell wie im globalen Durchschnitt. Für Graubünden bedeutet das: Gletscher schmelzen, Permafrost taut, Schneesaisons verkürzen sich. Der Klimawandel ist hier früher und stärker als anderswo.',
    chartTitle: 'Temperaturanomalie Graubünden 1901–2024',
    chartSubtitle: 'Abweichung vom Referenzmittel 1961–1990 in °C · MeteoSchweiz',
    chartType: 'line',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    keyFacts: [],
    analysis: [
      'Die Messreihen von MeteoSchweiz zeigen, dass sich die Durchschnittstemperatur im Alpenraum seit 1900 um mehr als 2 Grad Celsius erhöht hat. Der globale Durchschnitt liegt bei rund 1,1 bis 1,2 Grad. Die Temperaturkurve zeigt einen besonders steilen Anstieg ab den 1990er Jahren.',
      'Der Morteratschgletscher im Engadin zieht sich jährlich um 20 bis 30 Meter zurück und hat seit 1900 über 3 Kilometer an Länge verloren. Die Schneesicherheit in mittleren Lagen (1.000 bis 1.500 m ü. M.) hat sich im langjährigen Vergleich verringert. Projektionen des IPCC gehen davon aus, dass die alpinen Gletscher bis 2100 80 bis 90 Prozent ihres Volumens verlieren.',
      'Die Zahlen der Hotelübernachtungen zeigen einen wachsenden Sommertourismus in Graubünden. Gleichzeitig werden Beschneiungsanlagen auf höheren und schneereicheren Lagen ausgebaut. Die durchschnittliche Schneesaison auf 1.500 m ü. M. hat sich seit den 1970er Jahren um mehrere Wochen verkürzt.'
    ],
    source: 'MeteoSchweiz, Homogene Klimamessreihen; IPCC Alpine Region Assessment 2022',
    linkedinPost: '+2.2 °C seit 1900. Doppelt so schnell wie der globale Durchschnitt.\n\nDie Alpen sind der Klimacanary der Erde — und Graubünden sitzt mittendrin.\n\nWas die Daten zeigen:\n→ 1900–1960: Kaum Veränderung\n→ 1990–2024: Steiler Anstieg, jedes Jahrzehnt wärmer\n→ 2024: +2.2 °C über dem Referenzmittel\n\nDie Konsequenzen:\n→ Morteratschgletscher: −20 bis −30 m pro Jahr\n→ Schneesaisons: −3 Wochen pro Jahrzehnt in mittleren Lagen\n→ Permafrost schmilzt: Hänge werden instabiler\n\nFür Graubünden, dessen Wirtschaft auf dem Schnee gebaut ist, ist das eine Existenzfrage.\n\nDie Transformation läuft — aber reicht das Tempo?\n\nStory 17, Woche 4 «Gesellschaft & Zukunft» der Serie «Graubünden in Zahlen».\n\n#Graubünden #Datenjournalismus #Klimawandel',
    wordpressHtml: '<h2>Die Alpen heizen sich doppelt so schnell auf wie das Flachland</h2><p class="intro">Seit der Industrialisierung ist die Temperatur in den Alpen um über 2 Grad Celsius gestiegen — doppelt so schnell wie im globalen Durchschnitt. Für Graubünden bedeutet das: Gletscher schmelzen, Permafrost taut, Schneesaisons verkürzen sich. Der Klimawandel ist hier früher und stärker als anderswo.</p><p>Der Klimawandel ist in Graubünden keine abstrakte Zukunftsgefahr — er ist Gegenwart. Die Messreihen von MeteoSchweiz zeigen einen klaren Aufwärtstrend: Über 120 Jahre hat sich die Durchschnittstemperatur im Alpenraum um mehr als 2 Grad erhöht. Das ist fast doppelt so viel wie der globale Durchschnitt, und es beschleunigt sich noch.</p><p>Die sichtbarsten Opfer sind die Gletscher. Der Morteratschgletscher — eines der Wahrzeichen des Engadins — zieht sich jährlich um 20 bis 30 Meter zurück. Der Pasterze-Gletscher in Österreich verlor in den letzten 30 Jahren fast einen Kilometer. Ohne drastische Klimamassnahmen werden die alpinen Gletscher bis 2100 zu 80 bis 90 Prozent verschwunden sein.</p><p>Für Graubündens Wirtschaft hat der Klimawandel direkte Folgen. Die Skisaison wird kürzer und unsicherer. Beschneiungsanlagen brauchen immer mehr Energie und Wasser. Gleichzeitig steigt der Sommertourismus — ein Silberstreifen, der aber die Winterverluste langfristig nicht kompensieren wird. Die Transformation ist unvermeidlich.</p><p><em>Quelle: MeteoSchweiz, Homogene Klimamessreihen; IPCC Alpine Region Assessment 2022</em></p>'
  },

  {
    id: 'berglandwirtschaft',
    week: 4,
    day: 3,
    publishDate: fmtDate(workdayDate(4, 3)),
    category: 'Landwirtschaft',
    title: 'Berglandwirtschaft: Klein, spezialisiert, unverzichtbar',
    lead: 'Über 2\'000 Landwirtschaftsbetriebe bewirtschaften Graubündens Bergland. Sie sind klein, hart am Existenzminimum und dennoch unverzichtbar — nicht nur für die Ernährung, sondern für die Kulturlandschaft, den Tourismus und die Identität des Kantons.',
    chartTitle: 'Landwirtschaftliche Nutzfläche Graubünden nach Kategorie',
    chartSubtitle: 'Anteile in %, Kanton Graubünden 2022 · Bundesamt für Statistik',
    chartType: 'doughnut',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    keyFacts: [],
    analysis: [
      'In Graubünden dominieren Alpweiden und Dauergrünland die landwirtschaftliche Nutzfläche. Die Sömmerungswirtschaft — das saisonale Auftreiben von Vieh auf die Alpweiden für drei bis vier Monate — wird in Graubünden auf über 700 Alpen praktiziert. Diese Bewirtschaftungsform ist eng an das Bergrelief und die Höhenzonierung des Kantons gebunden.',
      'Rund 2\'100 landwirtschaftliche Betriebe bewirtschaften die Nutzflächen im Kanton. Der überwiegende Teil dieser Betriebe bezieht Direktzahlungen des Bundes. Die Direktzahlungen umfassen Beiträge für Produktionssysteme, Kulturlandschaft und Versorgungssicherheit.',
      'Ein erheblicher Teil der Berglandwirtschaftsbetriebe hat keine gesicherte Betriebsnachfolge. Die Betriebsgrössen in Graubünden liegen im schweizerischen Vergleich unterdurchschnittlich. Die Anzahl landwirtschaftlicher Betriebe im Kanton ist in den letzten 20 Jahren rückläufig.'
    ],
    source: 'Bundesamt für Statistik, Betriebsstrukturerhebung Landwirtschaft 2022',
    linkedinPost: "2'100 Betriebe, 270'000 Hektar, 90 % mit Bundessubventionen.\n\nDie Bündner Berglandwirtschaft in drei Zahlen.\n\nWarum ist sie trotz Subventionsabhängigkeit wichtig?\n\n→ Sie pflegt 270'000 ha Kulturlandschaft\n→ Ohne Alpweiden: Verbuschung, Erosion, Lawinengefahr\n→ Sie ist die Kulisse, die 15 Mio. Touristen pro Jahr anzieht\n\nBerglandwirtschaft ist kein Wirtschaftsfaktor im Sinne von BIP-Beitrag. Sie ist Daseinsfürsorge — für Ökosystem und Tourismus.\n\nDas Paradox: Niemand kann sich die Berglandwirtschaft leisten. Niemand kann es sich leisten, auf sie zu verzichten.\n\nDas zwingt zu einer ehrlichen Diskussion über den Wert, den Gesellschaft der offenen Kulturlandschaft beimisst.\n\nStory 18, Woche 4 «Gesellschaft & Zukunft».\n\n#Graubünden #Datenjournalismus #Landwirtschaft",
    wordpressHtml: "<h2>Berglandwirtschaft: Klein, spezialisiert, unverzichtbar</h2><p class=\"intro\">Über 2'000 Landwirtschaftsbetriebe bewirtschaften Graubündens Bergland. Sie sind klein, hart am Existenzminimum und dennoch unverzichtbar — nicht nur für die Ernährung, sondern für die Kulturlandschaft, den Tourismus und die Identität des Kantons.</p><p>Die Bündner Berglandwirtschaft ist eine Besonderheit. Wo andere Kantone Mais- und Weizenfelder haben, dominieren in Graubünden Alpweiden. Die Sömmerungswirtschaft — Vieh für drei bis vier Monate auf die Alpen treiben — ist eine jahrtausendealte Praxis, die das Landschaftsbild prägt und den Tourismus erst ermöglicht.</p><p>Wirtschaftlich steht die Berglandwirtschaft unter enormem Druck. Die Betriebe sind zu klein für moderne Effizienzstandards, die Erträge zu gering für rentables Wirtschaften ohne Subventionen. Fast alle Betriebe beziehen Direktzahlungen des Bundes — nicht als Almosen, sondern als Abgeltung für Ökosystemleistungen, die der Markt nicht bezahlt.</p><p>Die Zukunft der Berglandwirtschaft hängt auch an den Nachfolgern. Viele Betriebe haben keinen Hofnachfolger. Junge, gut ausgebildete Menschen zögern, einen Beruf zu wählen, der 60-Stunden-Wochen, hohe Investitionen und unsichere Einkommen kombiniert. Die Politik hat das Problem erkannt — einfache Lösungen gibt es keine.</p><p><em>Quelle: Bundesamt für Statistik, Betriebsstrukturerhebung Landwirtschaft 2022</em></p>"
  },

  {
    id: 'synthese-indikatoren',
    week: 4,
    day: 4,
    publishDate: fmtDate(workdayDate(4, 4)),
    category: 'Synthese',
    title: 'Bevölkerung, Tourismus, Wirtschaft: Was 20 Geschichten über Graubünden lehren',
    lead: 'Nach drei Wochen Daten über Bevölkerung, Tourismus und Wirtschaft wird ein Bild sichtbar: Graubünden ist ein Kanton im Wandel — stark in seinen Nischen, verwundbar durch seine Abhängigkeiten. Fünf Schlüsselindikatoren im Vergleich mit dem Schweizer Durchschnitt.',
    chartTitle: 'Graubünden im Vergleich: 5 Schlüsselindikatoren',
    chartSubtitle: 'Indexwert: Schweizer Durchschnitt = 100 · Eigene Berechnungen auf Basis offizieller Statistiken',
    chartType: 'bar',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    keyFacts: [],
    analysis: [
      'Die fünf Schlüsselindikatoren zeigen Graubündens Position im Schweizer Vergleich: Die Tourismusintensität liegt bei 320 (Schweizer Durchschnitt = 100), die Bevölkerungsdichte bei 28 Einwohner:innen pro km² (Schweizer Durchschnitt: rund 220), der Medianalter bei 44,8 Jahren (Schweizer Durchschnitt: 42,3), die Infrastrukturkosten pro Kopf bei rund 4\'800 Franken (rund drei Mal höher als in städtischen Kantonen) und das Lohnniveau bei 88 Prozent des schweizerischen Durchschnitts.',
      'Die Bevölkerungsdichte und die Infrastrukturkosten pro Kopf korrelieren: Auf grosser Fläche mit wenigen Einwohnern verteilen sich die Fixkosten für Strassen, Bahnen und Ver- und Entsorgungsinfrastruktur auf weniger Personen als in dichter besiedelten Kantonen.',
      'Graubünden ist der flächenmässig grösste Kanton der Schweiz mit drei Amtssprachen (Deutsch, Romanisch, Italienisch). Die Bevölkerung verteilt sich auf rund 100 Gemeinden unterschiedlicher Grösse und Lage, von denen viele auf über 1\'000 m ü. M. liegen.'
    ],
    source: 'Eigene Berechnungen auf Basis: Statistik Graubünden, Bundesamt für Statistik, Graubünden Ferien 2023',
    linkedinPost: 'Was lehren uns 20 Datenstories über Graubünden?\n\nHeute, nach 4 Wochen Daten, die Synthese in 5 Indikatoren:\n\n→ Tourismus-Intensität: 320 (CH=100) — dreimal intensiver als Durchschnitt\n→ Bevölkerungsdichte: 18 (CH=100) — einer der dünnst besiedelten Kantone\n→ Medianalter: 106 — älter als der Schnitt, mit steigendem Trend\n→ Infrastrukturkosten/Kopf: 290 — beinahe dreimal teurer\n→ Lohnniveau: 88 — unter Schweizer Durchschnitt\n\nDas Fazit: Graubünden ist ein Kanton der Extreme und der Resilienz.\n\nStark, wo Nische Stärke bedeutet. Verwundbar, wo Abhängigkeit Risiko schafft.\n\nMein persönliches Fazit dieser Datenstory-Serie: Graubünden ist einer der faszinierendsten und komplexesten Kantone der Schweiz. Und die Daten erzählen das besser als jedes Reisemagazin.\n\n#Graubünden #Datenjournalismus #Schweiz',
    wordpressHtml: '<h2>Bevölkerung, Tourismus, Wirtschaft: Was 20 Geschichten über Graubünden lehren</h2><p class="intro">Nach drei Wochen Daten über Bevölkerung, Tourismus und Wirtschaft wird ein Bild sichtbar: Graubünden ist ein Kanton im Wandel — stark in seinen Nischen, verwundbar durch seine Abhängigkeiten. Fünf Schlüsselindikatoren im Vergleich mit dem Schweizer Durchschnitt.</p><p>Die fünf Schlüsselindikatoren erzählen die Geschichte Graubündens in komprimierter Form. Der Kanton ist beim Tourismus dreimal so intensiv wie der Schweizer Durchschnitt — das ist seine Stärke und sein grösstes Risiko zugleich. Er ist dünn besiedelt und alt — das prägt seine politischen Prioritäten. Und er liegt beim Lohnniveau unter dem Schweizer Schnitt — das erklärt die Abwanderung junger Fachleute.</p><p>Das Zusammenspiel dieser Indikatoren zeigt eine strukturelle Herausforderung: Ein tourismusintensiver Kanton mit einer alternden Bevölkerung, hohen Infrastrukturkosten und unterdurchschnittlichen Löhnen muss ausserordentlich gut darin sein, sich attraktiv zu halten — für Touristen, Unternehmen und Einwohnende gleichermassen.</p><p>Was Graubünden auszeichnet, ist seine Vielfalt und seine Resilienz. Drei Sprachen, drei Kulturen, hundert Täler — diese Diversität ist keine Schwäche, sondern eine Quelle von Innovationskraft und Anpassungsfähigkeit. Die 20 Geschichten dieser Serie zeigen einen Kanton, der sich seiner Herausforderungen bewusst ist — und aktiv an seiner Zukunft arbeitet.</p><p><em>Quelle: Eigene Berechnungen auf Basis: Statistik Graubünden, Bundesamt für Statistik, Graubünden Ferien 2023</em></p>'
  },

  {
    id: 'datenstory-bilanz',
    week: 4,
    day: 5,
    publishDate: fmtDate(workdayDate(4, 5)),
    category: 'Synthese',
    title: 'Die Datenstory-Bilanz: Graubünden in 20 Zahlen',
    lead: 'Heute endet die vierwöchige Datenstory-Serie über Graubünden. 20 Geschichten, 4 Themenblöcke, 1 Kanton. Als Abschluss: die thematische Verteilung der Serie und eine Reflexion, was datengetriebener Journalismus über einen Bergkanton leisten kann — und wo er an Grenzen stösst.',
    chartTitle: 'Thematische Verteilung der 20 Datenstories',
    chartSubtitle: 'Anzahl Geschichten pro Themenblock · Datenstory-Serie «Graubünden in Zahlen» 2026',
    chartType: 'doughnut',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    keyFacts: [],
    analysis: [
      'Die Datenstory-Serie umfasst 20 Geschichten in vier Themenblöcken: Bevölkerung (5 Geschichten), Tourismus (5 Geschichten), Wirtschaft (5 Geschichten) und Gesellschaft & Zukunft (5 Geschichten). Die Daten stammen aus öffentlich zugänglichen Quellen, vor allem aus dem kantonalen Datenportal data.gr.ch, dem Bundesamt für Statistik und MeteoSchweiz.',
      'Die verwendeten Datensätze decken Zeiträume von 30 bis 120 Jahren ab. Die längste Zeitreihe — die Temperaturdaten von MeteoSchweiz — reicht bis ins Jahr 1901 zurück. Die aktuellsten Daten stammen aus dem Jahr 2023 oder 2024.',
      'Der Kanton Graubünden stellt auf data.gr.ch mehrere Dutzend maschinenlesbare Datensätze zur Bevölkerung, Wirtschaft und Raumplanung zur Verfügung. Die Daten dieser Serie basieren auf diesen offenen Datenquellen sowie auf Bundesstatistiken und spezialisierten kantonalen Erhebungen.'
    ],
    source: 'Datenstory-Serie «Graubünden in Zahlen», März 2026; data.gr.ch',
    linkedinPost: "Es ist geschafft: 20 Datenstories über Graubünden in 4 Wochen.\n\nHeute die Bilanz — und ein persönliches Fazit.\n\nDie 20 Geschichten haben folgende Fragen beantwortet:\n→ Wer wohnt wo, und wie verändert sich das?\n→ Wie funktioniert der Tourismusmotor wirklich?\n→ Was exportiert, importiert und beschäftigt Graubünden?\n→ Wie heizt sich die Erde hier schneller auf als anderswo?\n\nMein Fazit:\n\nDaten erzählen nie die ganze Geschichte. Aber sie zeigen, wo man genauer hinsehen muss. Und bei Graubünden lohnt sich das Hinschauen immer.\n\nDanke für 4 Wochen mitlesen, kommentieren und teilen. Die Serie bleibt online — als interaktives Archiv.\n\n#Graubünden #Datenjournalismus #Schweiz",
    wordpressHtml: '<h2>Die Datenstory-Bilanz: Graubünden in 20 Zahlen</h2><p class="intro">Heute endet die vierwöchige Datenstory-Serie über Graubünden. 20 Geschichten, 4 Themenblöcke, 1 Kanton. Als Abschluss: die thematische Verteilung der Serie und eine Reflexion, was datengetriebener Journalismus über einen Bergkanton leisten kann — und wo er an Grenzen stösst.</p><p>Vier Wochen, zwanzig Geschichten, ein Kanton. Was hat diese Datenstory-Serie über Graubünden geleistet? Sie hat Zahlen in Erzählungen verwandelt, Statistiken in Bedeutung. Datengetriebener Journalismus kann zeigen, was ansonsten unsichtbar bleibt: Langzeittrends, Strukturprobleme, stille Veränderungen.</p><p>Gleichzeitig hat die Serie ihre Grenzen aufgezeigt. Daten erfassen, was messbar ist. Was Graubünden ausmacht — die Stille auf einem Berggipfel, die Freude eines Bauern beim ersten Almauftrieb, die Verbundenheit einer Romanisch-Gemeinde mit ihrer Sprache — lässt sich nicht tabellieren. Datengetriebener Journalismus ergänzt traditionelle Reportage, ersetzt sie nie.</p><p>Der Kanton Graubünden hat begonnen, seine Daten systematisch zu öffnen — data.gr.ch ist ein gutes Zeichen. Je mehr Daten öffentlich und maschinenlesbar werden, desto mehr können Journalist:innen, Forschende und Bürger:innen eigenständig Fragen stellen und Antworten suchen. Das ist der eigentliche Wert des Open-Data-Prinzips.</p><p><em>Quelle: Datenstory-Serie «Graubünden in Zahlen», März 2026; data.gr.ch</em></p>'
  }

]; // end STORIES


// ============================================================
// API FETCHING — Smart field detection system
// ============================================================

async function fetchDatasetRecords(datasetId, queryParams) {
  if (!datasetId) return null;
  try {
    const params = new URLSearchParams({ lang: 'de' });
    if (queryParams) {
      if (queryParams.select)   params.set('select',   queryParams.select);
      if (queryParams.group_by) params.set('group_by', queryParams.group_by);
      if (queryParams.order_by) params.set('order_by', queryParams.order_by);
      if (queryParams.limit)    params.set('limit',    queryParams.limit);
      else                      params.set('limit',    '100');
      // refine supports field:value filter (correct syntax for this API)
      if (queryParams.refine)   params.append('refine', queryParams.refine);
    } else {
      params.set('limit', '100');
    }
    const url = `${API_BASE}/${datasetId}/records?${params.toString().replace(/\+/g, '%20')}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.results || json.records || null;
  } catch (e) {
    console.info('[Datenstory] API nicht verfügbar:', datasetId, e.message);
    return null;
  }
}

/**
 * detectValue — tries multiple field name candidates (Romansh first, then German/French fallbacks)
 */
function detectValue(record, candidates) {
  for (const key of candidates) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }
  // Last resort: return first numeric field
  for (const val of Object.values(record)) {
    if (typeof val === 'number') return val;
  }
  return null;
}

function detectLabel(record, candidates) {
  for (const key of candidates) {
    if (record[key] !== undefined && record[key] !== null) {
      return String(record[key]);
    }
  }
  // Last resort: return first string field
  for (const val of Object.values(record)) {
    if (typeof val === 'string' && val.length > 0) return val;
  }
  return null;
}

// ---- Parser functions ----

function parseTopMunicipalities(records) {
  if (!records || !records.length) return null;
  const top = records.slice(0, 10);
  const labels = top.map(r => detectLabel(r, ['gemeinde', 'gemeinde_name', 'vischnanca', 'municipality', 'name']));
  const values = top.map(r => detectValue(r, ['total', 'anzahl_personen', 'populaziun_permanenta', 'bevoelkerung']));
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Einwohner', year: new Date().getFullYear() };
}

// Swiss national age cohort percentages (BFS px-x-0102010000_101, 2023, ständige Wohnbevölkerung)
const CH_AGE_COHORTS = {
  '0–4':   4.80, '5–9':   5.13, '10–14': 5.06, '15–19': 4.97,
  '20–24': 5.25, '25–29': 6.27, '30–34': 7.17, '35–39': 7.30,
  '40–44': 7.14, '45–49': 6.73, '50–54': 7.00, '55–59': 7.38,
  '60–64': 6.50, '65–69': 5.22, '70–74': 4.46, '75–79': 4.00,
  '80–84': 2.87, '85–89': 1.73, '90–94': 0.79, '95–99': 0.20, '100+': 0.02
};

function parseAgeStructure(records) {
  if (!records || !records.length) return null;
  const ageStart = function(label) {
    const m = String(label).match(/\d+/);
    return m ? parseInt(m[0], 10) : 999;
  };
  const sorted = [...records].sort((a, b) => {
    const la = detectLabel(a, ['altersklasse', 'classa_da_vegliadetgna', 'age_class']);
    const lb = detectLabel(b, ['altersklasse', 'classa_da_vegliadetgna', 'age_class']);
    return ageStart(la) - ageStart(lb);
  });
  const rawLabels = sorted.map(r => detectLabel(r, ['altersklasse', 'classa_da_vegliadetgna', 'age_class']));
  const rawVals = sorted.map(r => detectValue(r, ['total', 'anzahl_personen', 'populaziun_permanenta', 'anzahl']));
  if (rawLabels.some(l => !l) || rawVals.some(v => v === null)) return null;
  const sum = rawVals.reduce((a, b) => a + b, 0);

  // Build cohort buckets matching CH keys
  const chKeys = Object.keys(CH_AGE_COHORTS);
  const grValues = [];
  const chValues = [];

  chKeys.forEach(key => {
    const start = parseInt(key.match(/\d+/)[0], 10);
    const end = key === '100+' ? 120 : parseInt(key.match(/\d+/g)[1], 10);
    // Sum GR raw values for ages in this cohort range
    let grSum = 0;
    rawLabels.forEach((lbl, i) => {
      const s = ageStart(lbl);
      // Check if this record's age range overlaps the cohort
      // GR data comes in age groups like "0-4 Jahre" or "100 Jahre und mehr"
      // We match by checking if the start age of the label falls in [start, end]
      if (s >= start && s <= end) grSum += rawVals[i];
    });
    grValues.push(+((grSum / sum) * 100).toFixed(2));
    chValues.push(CH_AGE_COHORTS[key]);
  });

  return { labels: chKeys, grValues, chValues, unit: '%', year: 2023 };
}

function parseBirths(records) {
  if (!records || !records.length) return null;
  // Extract 4-digit year from ISO datetime strings like "1981-01-01T00:00:00+00:00"
  const toYear = function(v) {
    const s = String(v);
    const m = s.match(/^(\d{4})/);
    return m ? m[1] : s;
  };
  const sorted = [...records].sort((a, b) => {
    const ya = detectValue(a, ['jahr', 'onn', 'year']);
    const yb = detectValue(b, ['jahr', 'onn', 'year']);
    return toYear(ya).localeCompare(toYear(yb));
  });
  const labels = sorted.map(r => toYear(detectLabel(r, ['jahr', 'onn', 'year'])));
  const values = sorted.map(r => detectValue(r, ['total', 'lebendgeburt', 'naschientschas_vivas', 'geburten']));
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Geburten', year: new Date().getFullYear() };
}

function parseDemographicBalance(records) {
  if (!records || !records.length) return null;
  const toYear = function(v) { const m = String(v).match(/^(\d{4})/); return m ? m[1] : String(v); };
  const sorted = [...records].sort((a, b) => {
    const ya = detectLabel(a, ['jahr', 'onn', 'year']);
    const yb = detectLabel(b, ['jahr', 'onn', 'year']);
    return toYear(ya).localeCompare(toYear(yb));
  });
  const labels = sorted.map(r => toYear(detectLabel(r, ['jahr', 'onn', 'year'])));
  const births = sorted.map(r => detectValue(r, ['births', 'lebendgeburt', 'naschientschas_vivas']) || 0);
  const deaths = sorted.map(r => detectValue(r, ['deaths', 'todesfall', 'mortoris']) || 0);
  const values = births.map((b, i) => b - deaths[i]);
  if (labels.some(l => !l)) return null;
  return { labels, values, unit: 'Saldo (Personen)', year: new Date().getFullYear() };
}

function parseScenarios(records) {
  if (!records || !records.length) return null;
  const sorted = [...records].sort((a, b) => {
    const ya = detectValue(a, ['onn', 'jahr', 'year']);
    const yb = detectValue(b, ['onn', 'jahr', 'year']);
    return ya - yb;
  });
  const labels = sorted.map(r => String(detectValue(r, ['onn', 'jahr', 'year'])));
  const values = sorted.map(r => detectValue(r, ['valur', 'population', 'bevoelkerung', 'wert']));
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Einwohner (Basisszenario)', year: 2055 };
}

function parseTourismAnnual(records) {
  if (!records || !records.length) return null;
  const toYear = function(v) { const m = String(v).match(/^(\d{4})/); return m ? m[1] : String(v); };
  const sorted = [...records].sort((a, b) => {
    const ya = detectLabel(a, ['jahr', 'onn', 'year']);
    const yb = detectLabel(b, ['jahr', 'onn', 'year']);
    return toYear(ya).localeCompare(toYear(yb));
  });
  const labels = sorted.map(r => toYear(detectLabel(r, ['jahr', 'onn', 'year'])));
  const values = sorted.map(r => {
    const v = detectValue(r, ['total', 'logiernachte', 'pernottaziuns', 'overnight_stays']);
    return v !== null ? +(v / 1e6).toFixed(2) : null;
  });
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Mio. Logiernächte', year: new Date().getFullYear() };
}

function parseTourismMonthly(records) {
  if (!records || !records.length) return null;
  const MONTH_DE = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
  const sorted = [...records].sort((a, b) => {
    const ma = detectValue(a, ['monat', 'mais', 'month']);
    const mb = detectValue(b, ['monat', 'mais', 'month']);
    return parseInt(ma, 10) - parseInt(mb, 10);
  });
  const values = sorted.map(r => {
    const v = detectValue(r, ['total', 'logiernachte', 'pernottaziuns', 'overnight_stays']);
    return v !== null ? Math.round(v / 1000) : 0;
  });
  return { labels: MONTH_DE.slice(0, sorted.length), values, unit: 'Tsd. Logiernächte', year: new Date().getFullYear() };
}

function parseTourismMunicipalities(records) {
  if (!records || !records.length) return null;
  const top = records.slice(0, 12);
  const labels = top.map(r => detectLabel(r, ['gemeinde_name', 'gemeinde', 'vischnanca', 'municipality']));
  const values = top.map(r => {
    const v = detectValue(r, ['total', 'logiernachte', 'pernottaziuns', 'overnight_stays']);
    return v !== null ? Math.round(v / 1000) : null;
  });
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Tsd. Logiernächte', year: new Date().getFullYear() };
}

function parseParahotellerie(records) {
  if (!records || !records.length) return null;
  const labels = records.map(r => detectLabel(r, ['art_unterkunft', 'unterkunftsart', 'accommodation_type', 'type', 'valur']));
  const values = records.map(r => {
    const v = detectValue(r, ['pernottaziuns', 'logiernächte', 'overnight_stays', 'valur']);
    return v !== null ? Math.round(v / 1000) : null;
  });
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Tsd. Logiernächte', year: new Date().getFullYear() };
}

function parseCrossBorderCommuters(records) {
  if (!records || !records.length) return null;
  const sorted = [...records].sort((a, b) => {
    const ya = detectLabel(a, ['jahr', 'onn', 'year']);
    const yb = detectLabel(b, ['jahr', 'onn', 'year']);
    return String(ya).localeCompare(String(yb));
  });
  const labels = sorted.map(r => String(detectLabel(r, ['jahr', 'onn', 'year'])));
  const values = sorted.map(r => detectValue(r, ['total', 'anzahl_personen', 'cunfinaris', 'grenzgaenger']) || 0);
  if (!labels.length) return null;
  return { labels, values, unit: 'Beschäftigte', year: new Date().getFullYear() };
}

function parseExports(records) {
  if (!records || !records.length) return null;
  const labels = records.map(r => detectLabel(r, ['cpa_section', 'warengruppe', 'product_group']));
  const values = records.map(r => {
    const v = detectValue(r, ['total', 'tot1_chf', 'valur', 'wert']);
    return v !== null ? +(v / 1e6).toFixed(1) : null;
  });
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Mio. CHF', year: new Date().getFullYear() };
}

function parseTradePartners(records) {
  if (!records || !records.length) return null;
  const labels = records.map(r => detectLabel(r, ['land', 'country', 'pays', 'partner']));
  const values = records.map(r => {
    const v = detectValue(r, ['total', 'tot1_chf', 'valur_export', 'export_wert']);
    return v !== null ? +(v / 1e6).toFixed(1) : null;
  });
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Mio. CHF Export', year: new Date().getFullYear() };
}

function parseInfrastructure(records) {
  if (!records || !records.length) return null;
  const labels = records.map(r => detectLabel(r, ['kategorie', 'category', 'bereich', 'label']));
  const values = records.map(r => detectValue(r, ['valur', 'wert', 'value', 'betrag']));
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Mio. CHF', year: new Date().getFullYear() };
}

// Dispatch table for parser functions
const PARSER_FNS = {
  parseTopMunicipalities,
  parseAgeStructure,
  parseBirths,
  parseDemographicBalance,
  parseScenarios,
  parseTourismAnnual,
  parseTourismMonthly,
  parseTourismMunicipalities,
  parseParahotellerie,
  parseCrossBorderCommuters,
  parseExports,
  parseTradePartners,
  parseInfrastructure
};


// ============================================================
// CHART RENDERING
// ============================================================

const PALETTE = ['#B5001E','#1E3A5F','#22577A','#38A3A5','#57CC99','#80ED99','#C0CA33'];
const MUTED   = '#6B6763';
const GRID    = '#E0DDD7';

let activeChart = null;

function destroyChart() {
  if (activeChart) { activeChart.destroy(); activeChart = null; }
}

function buildChart(story, data) {
  destroyChart();
  const canvas = document.getElementById('mainChart');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const d    = data;
  const type = story.chartType;

  // No data: show placeholder message
  if (!d) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = '#6B6763';
    ctx.font = "14px 'Inter', system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('Daten werden geladen…', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "12px 'Inter', system-ui, sans-serif";
    ctx.fillText('(Verbindung zu data.gr.ch)', canvas.width / 2, canvas.height / 2 + 14);
    ctx.restore();
    return;
  }

  const baseFont = { family: "'Inter', system-ui, sans-serif", size: 12 };
  const tooltipCfg = {
    backgroundColor: '#161616',
    titleFont: { ...baseFont, size: 13, weight: '600' },
    bodyFont: { ...baseFont },
    padding: 12,
    callbacks: {
      label: function(ctx) {
        const v = type === 'doughnut' ? ctx.parsed : ctx.parsed.y;
        return '  ' + v + ' ' + d.unit;
      }
    }
  };

  // ---- DOUGHNUT ----
  if (type === 'doughnut') {
    activeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: d.labels,
        datasets: [{
          data: d.values,
          backgroundColor: PALETTE,
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: baseFont,
              color: MUTED,
              padding: 14,
              usePointStyle: true,
              pointStyleWidth: 10
            }
          },
          tooltip: tooltipCfg
        }
      }
    });
    return;
  }

  // ---- BAR ----
  if (type === 'bar') {
    // Multi-category: use PALETTE; single-series long bar: gradient opacity from accent red
    const useMultiColor = d.labels.length <= 4;
    const barColors = d.labels.map((_, i) => {
      if (useMultiColor) return PALETTE[i % PALETTE.length];
      const opacity = Math.max(0.35, 1 - i * 0.055);
      return 'rgba(181,0,30,' + opacity + ')';
    });

    activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [{
          label: d.unit,
          data: d.values,
          backgroundColor: barColors,
          borderRadius: 3,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: tooltipCfg
        },
        scales: {
          x: {
            grid: { color: GRID },
            ticks: { font: baseFont, color: MUTED, maxRotation: 45 }
          },
          y: {
            grid: { color: GRID },
            ticks: { font: baseFont, color: MUTED },
            beginAtZero: true
          }
        }
      }
    });
    return;
  }

  // ---- STACKED (Chur vs. 60 Gemeinden) ----
  if (type === 'stacked') {
    // Gradient color function: blue → teal → green → orange → red
    function stackColor(i, n) {
      const stops = [
        [37,99,235],[6,182,212],[16,185,129],[234,179,8],[249,115,22],[220,38,38]
      ];
      const t = i / Math.max(n - 1, 1);
      const seg = t * (stops.length - 1);
      const si = Math.floor(seg), f = seg - si;
      const a = stops[Math.min(si, stops.length-1)];
      const b = stops[Math.min(si+1, stops.length-1)];
      return 'rgb(' + Math.round(a[0]+(b[0]-a[0])*f) + ',' +
                      Math.round(a[1]+(b[1]-a[1])*f) + ',' +
                      Math.round(a[2]+(b[2]-a[2])*f) + ')';
    }

    const segs = d.segments || [];
    const datasets = [{
      label: 'Chur',
      data: [d.chur, null],
      backgroundColor: '#1E3A5F',
      borderRadius: 3,
      borderSkipped: false
    }];
    segs.forEach(function(seg, i) {
      datasets.push({
        label: seg.name,
        data: [null, seg.pop],
        backgroundColor: stackColor(i, segs.length),
        borderWidth: 0,
        borderSkipped: false
      });
    });

    activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Chur', '60 Gemeinden (kumuliert)'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#161616',
            titleFont: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' },
            bodyFont:  { family: "'Inter', system-ui, sans-serif", size: 12 },
            padding: 12,
            callbacks: {
              label: function(ctx) {
                const v = ctx.parsed.y;
                if (v == null) return null;
                return '  ' + ctx.dataset.label + ': ' + v.toLocaleString('de-CH') + ' Einw.';
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { font: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' }, color: '#161616' }
          },
          y: {
            stacked: true,
            grid: { color: GRID },
            ticks: { font: baseFont, color: MUTED, callback: function(v) { return (v/1000).toFixed(0) + 'k'; } },
            beginAtZero: true,
            max: Math.ceil(d.chur * 1.05 / 1000) * 1000
          }
        }
      }
    });
    return;
  }

  // ---- BUTTERFLY (population pyramid) ----
  if (type === 'butterfly') {
    const labels = d.labels || [];
    const grVals = (d.grValues || []).map(v => -Math.abs(v));  // negative = left
    const chVals = d.chValues || [];
    const maxVal = Math.max(...(d.grValues || []), ...(d.chValues || []));
    const axisMax = Math.ceil(maxVal * 10) / 10 + 0.5;

    activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Graubünden',
            data: grVals,
            backgroundColor: 'rgba(181,0,30,0.80)',
            borderWidth: 0,
            borderRadius: 2,
            borderSkipped: false,
            barPercentage: 0.85,
            categoryPercentage: 0.95
          },
          {
            label: 'Schweiz',
            data: chVals,
            backgroundColor: 'rgba(30,58,95,0.80)',
            borderWidth: 0,
            borderRadius: 2,
            borderSkipped: false,
            barPercentage: 0.85,
            categoryPercentage: 0.95
          }
        ]
      },
      options: {
        indexAxis: 'y',
        grouped: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { family: "'Inter', system-ui, sans-serif", size: 12 },
              color: '#161616',
              boxWidth: 14,
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#161616',
            titleFont: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' },
            bodyFont:  { family: "'Inter', system-ui, sans-serif", size: 12 },
            padding: 12,
            callbacks: {
              label: function(ctx) {
                const abs = Math.abs(ctx.parsed.x);
                return '  ' + ctx.dataset.label + ': ' + abs.toFixed(1) + ' %';
              }
            }
          }
        },
        scales: {
          x: {
            min: -axisMax,
            max:  axisMax,
            grid: { color: GRID },
            ticks: {
              font: baseFont,
              color: MUTED,
              callback: function(v) { return Math.abs(v).toFixed(1) + '%'; }
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { family: "'Inter', system-ui, sans-serif", size: 11 },
              color: '#161616',
              autoSkip: false
            }
          }
        }
      }
    });
    return;
  }

  // ---- GROUPED BAR ----
  if (type === 'groupedbar') {
    const datasets = (d.series || []).map(function(s) {
      return {
        label: s.label,
        data: s.values,
        backgroundColor: s.color,
        borderWidth: 0,
        borderRadius: 2
      };
    });
    activeChart = new Chart(ctx, {
      type: 'bar',
      data: { labels: d.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true, position: 'top',
            labels: { font: baseFont, color: '#161616', boxWidth: 14, padding: 14 }
          },
          tooltip: {
            backgroundColor: '#161616',
            titleFont: { ...baseFont, size: 13, weight: '600' },
            bodyFont: baseFont,
            padding: 12,
            callbacks: {
              label: function(ctx) {
                return '  ' + ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString('de-CH') + ' ' + (d.unit || '');
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: baseFont, color: MUTED } },
          y: {
            beginAtZero: true,
            grid: { color: GRID },
            ticks: { font: baseFont, color: MUTED, callback: function(v) { return (v/1000).toFixed(0) + 'k'; } }
          }
        }
      }
    });
    return;
  }

  // ---- MULTILINE ----
  if (type === 'multiline') {
    const datasets = (d.series || []).map(function(s) {
      return {
        label: s.label,
        data: s.values,
        borderColor: s.color,
        backgroundColor: 'transparent',
        borderWidth: s.dash && s.dash.length ? 1.5 : 2.5,
        borderDash: s.dash || [],
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.3
      };
    });
    activeChart = new Chart(ctx, {
      type: 'line',
      data: { labels: d.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true, position: 'top',
            labels: { font: baseFont, color: '#161616', boxWidth: 24, padding: 16,
              generateLabels: function(chart) {
                return chart.data.datasets.map(function(ds, i) {
                  return { text: ds.label, fillStyle: 'transparent', strokeStyle: ds.borderColor,
                    lineWidth: 2, lineDash: ds.borderDash, datasetIndex: i, hidden: false };
                });
              }
            }
          },
          tooltip: {
            backgroundColor: '#161616',
            titleFont: { ...baseFont, size: 13, weight: '600' },
            bodyFont: baseFont,
            padding: 12,
            callbacks: {
              label: function(ctx) {
                return '  ' + ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString('de-CH');
              }
            }
          }
        },
        scales: {
          x: { grid: { color: GRID }, ticks: { font: baseFont, color: MUTED, maxTicksLimit: 8 } },
          y: {
            beginAtZero: false,
            grid: { color: GRID },
            ticks: { font: baseFont, color: MUTED, callback: function(v) { return (v/1000).toFixed(0) + 'k'; } }
          }
        }
      }
    });
    return;
  }

  // ---- LINE ----
  if (type === 'line') {
    activeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [{
          label: d.unit,
          data: d.values,
          borderColor: '#B5001E',
          backgroundColor: 'rgba(181,0,30,0.08)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#B5001E',
          pointHoverRadius: 6,
          fill: 'origin',
          tension: 0.38,
          segment: {
            borderColor: function(segCtx) {
              return segCtx.p1.parsed.y >= 0 ? '#B5001E' : '#1E3A5F';
            },
            backgroundColor: function(segCtx) {
              return segCtx.p1.parsed.y >= 0
                ? 'rgba(181,0,30,0.08)'
                : 'rgba(30,58,95,0.08)';
            }
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: tooltipCfg
        },
        scales: {
          x: {
            grid: { color: GRID },
            ticks: { font: baseFont, color: MUTED, maxRotation: 45 }
          },
          y: {
            beginAtZero: false,
            suggestedMin: Math.floor(Math.min(...d.values) * 0.92 / 100) * 100,
            grid: {
              color: function(gridCtx) {
                return gridCtx.tick.value === 0 ? '#888' : GRID;
              },
              lineWidth: function(gridCtx) {
                return gridCtx.tick.value === 0 ? 1.5 : 1;
              }
            },
            ticks: { font: baseFont, color: MUTED }
          }
        }
      }
    });
  }
}


// ============================================================
// EXPORT FUNCTIONS
// ============================================================

function generateLinkedIn(story) {
  return story.linkedinPost;
}

function generateWordpress(story) {
  return story.wordpressHtml;
}

// ============================================================
// CALENDAR RENDERING
// ============================================================

function renderCalendar() {
  const strip = document.getElementById('calendar-strip');
  if (!strip) return;

  const DAY_ABBR = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr'];
  let html = '';

  for (let w = 1; w <= 4; w++) {
    const topics = { 1: 'Bevölkerung', 2: 'Tourismus', 3: 'Wirtschaft', 4: 'Gesellschaft' };
    html += '<div class="cal-week">';
    html += '<div class="cal-week-label">Woche ' + w + ' — ' + (topics[w] || '') + '</div>';
    html += '<div class="cal-days">';

    for (let d = 1; d <= 5; d++) {
      const idx = (w - 1) * 5 + (d - 1);
      const story = STORIES[idx];
      if (!story) continue;

      const isActive = idx === currentIndex;
      const dateObj  = workdayDate(w, d);
      const dayNum   = dateObj.getDate();
      const shortTitle = story.title.length > 28
        ? story.title.substring(0, 28) + '…'
        : story.title;

      html +=
        '<button class="cal-day' + (isActive ? ' cal-day--active' : '') + '" ' +
        'data-idx="' + idx + '" ' +
        'title="' + story.title.replace(/"/g, '&quot;') + '">' +
        '<span class="cal-abbr">' + DAY_ABBR[d] + '</span>' +
        '<span class="cal-num">' + dayNum + '</span>' +
        '<span class="cal-short">' + shortTitle + '</span>' +
        '</button>';
    }

    html += '</div></div>';
  }

  strip.innerHTML = '<div class="calendar-inner">' + html + '</div>';

  // Attach click handlers
  strip.querySelectorAll('.cal-day').forEach(function(btn) {
    btn.addEventListener('click', function() {
      renderStory(+this.dataset.idx);
    });
  });
}

function scrollActiveDayIntoView() {
  const strip = document.getElementById('calendar-strip');
  if (!strip) return;
  const active = strip.querySelector('.cal-day--active');
  if (active) {
    active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================

function showToast(msg) {
  let toast = document.getElementById('copy-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copy-toast';
    toast.style.cssText =
      'position:fixed;bottom:24px;right:24px;background:#161616;color:#fff;' +
      'padding:10px 20px;border-radius:6px;font-size:14px;z-index:9999;' +
      'opacity:0;transition:opacity 0.3s;pointer-events:none;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg || 'Kopiert!';
  toast.style.opacity = '1';
  setTimeout(function() { toast.style.opacity = '0'; }, 2000);
}

// ============================================================
// DATA BADGE
// ============================================================

function setDataBadge(state, text) {
  const badge    = document.getElementById('data-badge');
  const badgeTxt = document.getElementById('badge-text');
  if (!badge) return;
  badge.className = 'data-badge data-badge--' + state;
  if (badgeTxt) badgeTxt.textContent = text;
}

// ============================================================
// RENDER STORY
// ============================================================

let currentIndex = 0;

function renderStory(index) {
  currentIndex = ((index % STORIES.length) + STORIES.length) % STORIES.length;
  const s = STORIES[currentIndex];

  // 1. Update DOM text elements
  const setEl = function(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('story-category',   s.category);
  setEl('story-counter',    'Geschichte ' + (currentIndex + 1) + ' von ' + STORIES.length);
  setEl('story-title',      s.title);
  setEl('story-lead',       s.lead);
  setEl('chart-title',      s.chartTitle);
  setEl('chart-subtitle',   s.chartSubtitle);
  setEl('story-date',       s.publishDate || '');
  setEl('story-week-label', 'Woche ' + s.week);

  // Week badge
  const weekBadgeEl = document.getElementById('story-week-badge');
  if (weekBadgeEl) weekBadgeEl.textContent = 'Woche ' + s.week;

  // Key Facts (only render if present and non-empty)
  const factsEl = document.getElementById('facts-grid');
  if (factsEl) {
    const facts = s.keyFacts || [];
    factsEl.innerHTML = facts.map(function(f) {
      return '<div class="fact-card">' +
        '<div class="fact-number">' + f.number + '</div>' +
        '<div class="fact-label">' + f.label + '</div>' +
        '<div class="fact-context">' + f.context + '</div>' +
        '</div>';
    }).join('');
    factsEl.style.display = facts.length ? '' : 'none';
  }

  // Analysis paragraphs
  const analysisEl = document.getElementById('analysis-body');
  if (analysisEl) {
    analysisEl.innerHTML = s.analysis.map(function(p) {
      return '<p>' + p + '</p>';
    }).join('');
  }

  // Source line
  setEl('story-source', 'Quelle: ' + s.source);

  // 2. Build chart — static data or live fetch
  if (s.staticData) {
    buildChart(s, s.staticData);
    setDataBadge('live', 'Daten: Statistik Graubünden 2024');
  } else {
    buildChart(s, null);
    // 3. Set badge to loading initially
    setDataBadge('loading', s.apiDatasetId ? 'Lade Daten von data.gr.ch…' : 'Keine Live-Daten verfügbar');
  }

  // 4. Fill export panel
  const liEl = document.getElementById('linkedin-output');
  if (liEl) liEl.value = generateLinkedIn(s);

  const wpEl = document.getElementById('wordpress-output');
  if (wpEl) wpEl.value = generateWordpress(s);

  // 5. Update calendar active state
  renderCalendar();

  // 6. Update URL hash (silent)
  if (history.replaceState) {
    history.replaceState(null, '', '#' + s.id);
  }

  // 7. Update nav counter dots
  const dotsEl = document.getElementById('nav-dots');
  if (dotsEl) {
    dotsEl.innerHTML = STORIES.map(function(_, i) {
      return '<button class="nav-dot' + (i === currentIndex ? ' nav-dot--active' : '') + '" ' +
        'data-idx="' + i + '" ' +
        'title="Geschichte ' + (i + 1) + ': ' + STORIES[i].category + '" ' +
        'aria-label="Geschichte ' + (i + 1) + '"></button>';
    }).join('');
    dotsEl.querySelectorAll('.nav-dot').forEach(function(btn) {
      btn.addEventListener('click', function() { renderStory(+this.dataset.idx); });
    });
  }

  // 8. Async fetch live data; if successful update badge and re-render chart
  if (s.apiDatasetId) {
    fetchDatasetRecords(s.apiDatasetId, s.apiQuery).then(function(records) {
      if (!records || !records.length) return;
      const parserFn = s.parseData ? PARSER_FNS[s.parseData] : null;
      if (!parserFn) return;
      const liveData = parserFn(records);
      if (!liveData || !liveData.labels || (!liveData.values && !liveData.grValues)) return;
      // Only update if we're still on the same story
      if (currentIndex === STORIES.indexOf(s)) {
        buildChart(s, liveData);
        setDataBadge('live', 'Live-Daten via data.gr.ch');
      }
    }).catch(function(err) {
      console.info('[Datenstory] Live fetch fehlgeschlagen:', err.message);
    });
  }
}


// ============================================================
// INIT
// ============================================================

(function init() {
  // Set today's date in header
  const headerDate = document.getElementById('header-date');
  if (headerDate) headerDate.textContent = formatDateDE();

  // Calendar toggle
  const toggle = document.getElementById('calendar-toggle');
  const strip  = document.getElementById('calendar-strip');
  if (toggle && strip) {
    toggle.addEventListener('click', function() {
      const willOpen = strip.hidden;
      strip.hidden   = !willOpen;
      toggle.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) {
        // Scroll active day into view after a tick so the strip is visible
        setTimeout(scrollActiveDayIntoView, 50);
      }
    });
  }

  // Determine initial story from URL hash OR first story
  const hash    = window.location.hash.slice(1);
  const hashIdx = STORIES.findIndex(function(s) { return s.id === hash; });
  renderStory(hashIdx >= 0 ? hashIdx : 0);
  renderCalendar();

  // Prev / Next buttons
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      renderStory((currentIndex - 1 + STORIES.length) % STORIES.length);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      renderStory((currentIndex + 1) % STORIES.length);
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft')  renderStory((currentIndex - 1 + STORIES.length) % STORIES.length);
    if (e.key === 'ArrowRight') renderStory((currentIndex + 1) % STORIES.length);
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const targetId = btn.dataset.target;
      const target   = document.getElementById(targetId);
      if (!target) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(target.value).then(function() {
          showToast('Kopiert!');
        }).catch(function() {
          fallbackCopy(target);
        });
      } else {
        fallbackCopy(target);
      }
    });
  });

  function fallbackCopy(el) {
    el.select();
    try {
      document.execCommand('copy');
      showToast('Kopiert!');
    } catch (err) {
      showToast('Bitte manuell kopieren (Strg+C)');
    }
  }

  // Handle browser back/forward
  window.addEventListener('hashchange', function() {
    const h   = window.location.hash.slice(1);
    const idx = STORIES.findIndex(function(s) { return s.id === h; });
    if (idx >= 0 && idx !== currentIndex) renderStory(idx);
  });

})();

