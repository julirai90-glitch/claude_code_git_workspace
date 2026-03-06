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
      { number: '60',     label: 'Gemeinden',        context: 'kleinste Bündner Gemeinden zusammen' }
    ],
    analysis: [
      'Chur zählt 2024 genau 39\'177 Einwohnerinnen und Einwohner — mehr als dreimal so viele wie Davos, die zweitgrösste Gemeinde mit 10\'774 Personen. Unter den 26 Schweizer Kantonshauptorten liegt Chur damit im oberen Mittelfeld; innerhalb Graubündens aber ist der Abstand zur nächstgrösseren Gemeinde aussergewöhnlich gross.',
      'Addiert man die 60 kleinsten Gemeinden — von Rongellen mit 59 bis Celerina/Schlarigna mit 1\'415 Einwohnern — kommt man auf 39\'125 Personen: nahezu exakt Churs Bevölkerungszahl, Differenz 52 Personen. Diese 60 Gemeinden machen über die Hälfte aller 101 Bündner Gemeinden aus.',
      'Was das zeigt: Graubünden ist kein Kanton mit mehreren annähernd gleich grossen Zentren, sondern einer mit einer dominanten Stadt und sehr vielen kleinen Gemeinden. 58 der 101 Gemeinden zählen weniger als 1\'400 Einwohnerinnen und Einwohner — für sich allein eine bescheidene Zahl, zusammen aber das Gewicht einer Kantonshauptstadt.'
    ],
    source: 'Kanton Graubünden, DVS/AWT: Permanente Bevölkerung nach Gemeinde und Nationalität (dvs_awt_soci_20250507), Stand 2024',
        chartVariants: [
      {
        type: 'doughnut',
        title: 'Bevölkerungsverteilung GR 2024 (Total: 206.138 Einw.)',
        labels: ['Chur', '60 kleinste Gemeinden', 'Restliche 40 Gemeinden'],
        values: [39177, 39125, 127836],
        colors: ['#1E3A5F', '#B5001E', '#6B6763']
      },
      {
        type: 'hbar',
        title: '13 Gemeinden = eine Hälfte, 88 Gemeinden = die andere',
        labels: ['13 grösste Gemeinden', '88 kleinste Gemeinden'],
        values: [104299, 101839],
        colors: ['#1E3A5F', '#B5001E']
      },
      {
        type: 'pareto',
        title: 'Bevölkerungskonzentration: kumulativer Anteil nach Gemeindegrösse',
        labels: ["Chur", "Davos", "Landquart", "Domat/Ems", "Ilanz/Glion", "St. Moritz", "Scuol", "Klosters", "Zizers", "Bonaduz", "Poschiavo", "Thusis", "Trimmis", "Maienfeld", "Arosa", "Schiers", "Flims", "Samedan", "Felsberg", "Vaz/Obervaz", "Untervaz", "Roveredo (GR)", "Malans", "Surses", "Cazis", "Domleschg", "Grüsch", "Churwalden", "Disentis/Mustér", "Laax", "Lumnezia", "Pontresina", "Breil/Brigels", "Luzein", "Rhäzüns", "Zernez", "Bregaglia", "Grono", "Trin", "Seewis im Prättigau", "Val Müstair", "Celerina/Schlarigna", "Mesocco", "Albula/Alvra", "Zuoz", "Tamins", "Tujetsch", "Jenaz", "Obersaxen Mundaun", "Trun", "Silvaplana", "Brusio", "Sumvitg", "Sils im Domleschg", "Jenins", "Safiental", "San Vittore", "Vals", "Andeer", "Küblis", "Bergün Filisur", "Fläsch", "Lostallo", "Scharans", "Valsot", "Sagogn", "La Punt Chamues-ch", "Samnaun", "Cama", "S-chanf", "Sils im Engadin/Segl", "Falera", "Fideris", "Bever", "Schluein", "Rheinwald", "Masein", "Lantsch/Lenz", "Zillis-Reischen", "Muntogna da Schons", "Fürstenau", "Medel (Lucmagn)", "Soazza", "Tschiertschen-Praden", "Rothenbrunnen", "Flerden", "Castaneda", "Conters im Prättigau", "Schmitten (GR)", "Calanca", "Furna", "Madulain", "Avers", "Rossa", "Urmein", "Sufers", "Tschappina", "Santa Maria in Calanca", "Buseno", "Ferrera", "Rongellen"],
        values: [19.0, 24.2, 28.7, 32.8, 35.2, 37.7, 39.9, 42.0, 43.8, 45.6, 47.3, 48.9, 50.6, 52.2, 53.7, 55.2, 56.6, 58.0, 59.4, 60.7, 62.0, 63.3, 64.5, 65.7, 66.9, 68.0, 69.1, 70.1, 71.1, 72.1, 73.1, 74.1, 75.0, 75.8, 76.6, 77.3, 78.1, 78.9, 79.6, 80.3, 81.0, 81.7, 82.4, 83.0, 83.6, 84.2, 84.8, 85.4, 85.9, 86.5, 87.0, 87.6, 88.1, 88.6, 89.0, 89.5, 90.0, 90.4, 90.9, 91.3, 91.8, 92.2, 92.6, 93.0, 93.4, 93.8, 94.1, 94.5, 94.8, 95.2, 95.5, 95.8, 96.1, 96.4, 96.7, 97.0, 97.3, 97.5, 97.7, 97.9, 98.1, 98.2, 98.4, 98.6, 98.7, 98.8, 99.0, 99.1, 99.2, 99.3, 99.4, 99.5, 99.5, 99.6, 99.7, 99.8, 99.8, 99.9, 99.9, 100.0, 100.0],
        pops:   [39177, 10774, 9244, 8392, 5067, 4997, 4546, 4478, 3691, 3565, 3505, 3439, 3424, 3266, 3159, 2993, 2902, 2901, 2886, 2732, 2674, 2656, 2529, 2465, 2439, 2262, 2176, 2114, 2104, 2102, 2075, 2072, 1706, 1689, 1612, 1592, 1591, 1580, 1557, 1450, 1430, 1415, 1414, 1354, 1224, 1223, 1199, 1164, 1160, 1141, 1124, 1099, 1063, 976, 964, 964, 961, 958, 923, 910, 898, 879, 866, 836, 801, 769, 750, 750, 720, 713, 708, 635, 626, 618, 616, 570, 531, 518, 426, 368, 353, 328, 324, 309, 304, 255, 254, 224, 205, 204, 203, 196, 169, 168, 163, 147, 146, 113, 91, 76, 59]
      }
    ],
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
  },

  {
    id: 'geburtenrueckgang',
    week: 1,
    day: 3,
    publishDate: fmtDate(workdayDate(1, 3)),
    category: 'Bevölkerung',
    title: 'Weniger Babys im Bergkanton: 40 Jahre Geburtenrückgang',
    lead: 'Im Kanton Graubünden wurden 1981 noch 2\'127 Kinder geboren. 2024 waren es noch 1\'504 — ein Rückgang von 29 Prozent. Den Höchstwert der Zeitreihe verzeichnete der Kanton 1992 mit 2\'433 Geburten; seither sinkt die Zahl mit Schwankungen.',
    chartTitle: 'Lebendgeburten im Kanton Graubünden 1981–2024',
    chartSubtitle: 'Lebendgeburten pro Jahr · Statistik Graubünden (dvs_awt_soci_20250508)',
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
      'Die Zeitreihe umfasst die Jahre 1981 bis 2024. Den Höchstwert verzeichnete Graubünden 1992 mit 2\'433 Geburten. Seither sinkt die Zahl mit Schwankungen: 2000 waren es noch 2\'011, 2010 noch 1\'602.',
      'Zwischen 2020 und 2021 stieg die Geburtenzahl vorübergehend von 1\'637 auf 1\'793. Danach sank sie erneut: 2022 auf 1\'641, 2023 auf 1\'538, 2024 auf 1\'504 — den tiefsten Wert der gesamten Zeitreihe.',
      'Von 1992 bis 2024 sank die Zahl der Geburten von 2\'433 auf 1\'504, das entspricht einem Rückgang von 38 Prozent.'
    ],
    source: 'Statistik Graubünden, Natürliche Bevölkerungsbewegung (dvs_awt_soci_20250508)',
  },

  {
    id: 'demografische-bilanz',
    week: 1,
    day: 4,
    publishDate: fmtDate(workdayDate(1, 4)),
    category: 'Bevölkerung',
    title: 'Geburten und Todesfälle: Die natürliche Bevölkerungsbewegung',
    lead: 'Der Saldo aus Geburten minus Todesfällen war in Graubünden nicht immer negativ. Seit 2019 übersteigen die Todesfälle die Geburten kontinuierlich — mit zunehmender Differenz.',
    chartTitle: 'Natürliche Bevölkerungsbewegung Graubünden 1981–2024',
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
      'Der Saldo aus Geburten minus Todesfällen schwankte zwischen 1981 und 2018 zwischen +200 und −100 Personen pro Jahr — mal positiv, mal leicht negativ. Ab 2019 wurde der Saldo konstant negativ: 2019: −118, 2020: −163, 2021: −32.',
      '2022 und 2023 vergrösserte sich die Differenz deutlich: 2022 wurden 1\'641 Geburten und 1\'995 Todesfälle gezählt (Saldo: −354). 2023 waren es 1\'538 Geburten und 1\'866 Todesfälle (Saldo: −328). 2024: −363.',
      'Der Chart zeigt ausschliesslich den natürlichen Saldo (Geburten minus Todesfälle). Wanderungsbewegungen sind nicht enthalten.'
    ],
    source: 'Statistik Graubünden, Natürliche Bevölkerungsbewegung (dvs_awt_soci_20250508)',
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
      'Die Bevölkerungsszenarien umfassen drei Projektionen bis 2055. Das Referenzszenario sieht Graubünden 2055 bei 213\'100 Einwohnern — nach einem Peak von rund 215\'000 um 2044. Das Hochszenario erreicht 243\'794, das Tiefszenario sinkt auf 183\'830.',
      'Alle drei Szenarien gehen von einem steigenden Anteil der über 65-Jährigen aus. Von heute rund 22 Prozent steigt dieser Anteil bis 2055 auf zwischen 27 und 31 Prozent — je nach Szenario. Der Anteil der unter 20-Jährigen sinkt in allen Szenarien.',
      'Der Bevölkerungskorridor zwischen Hoch- und Tiefszenario beträgt 2055 rund 60\'000 Personen. Diese Spanne spiegelt die Unsicherheiten bei den Annahmen zu Geburtenrate, Lebenserwartung und Wanderungssaldo wider.'
    ],
    source: 'Statistik Graubünden, Kantonale Bevölkerungsszenarien 2024–2055; data.gr.ch dvs_awt_soci_202505121',
  },

  {
    id: 'geburten-alter-muetter',
    week: 1,
    day: 6,
    publishDate: fmtDate(workdayDate(1, 5)),
    category: 'Bevölkerung',
    title: 'Wann bekommen Frauen Kinder? Das Alter der Mütter in Graubünden',
    lead: '1970 war die grösste Altersgruppe bei Geburten die unter 25-Jährigen. 2023 sind es die 30- bis 34-Jährigen. Die Verschiebung zeigt sich in jeder Altersgruppe — und erklärt teilweise den Geburtenrückgang.',
    chartTitle: 'Geburten nach Alter der Mutter 1970–2023',
    chartSubtitle: 'Lebendgeburten pro Altersgruppe · Amt für Wirtschaft und Tourismus GR',
    chartType: 'stackedarea',
    apiDatasetId: null,
    staticData: {
      labels: ['1970', '1980', '1990', '2000', '2010', '2020', '2023'],
      series: [
        { label: 'unter 25 Jahre', values: [871, 524, 369, 208, 120, 77, 64],  color: '#B5001E', bgColor: 'rgba(181,0,30,0.65)' },
        { label: '25–29 Jahre',    values: [979, 811, 973, 616, 448, 337, 301], color: '#D4621A', bgColor: 'rgba(212,98,26,0.60)' },
        { label: '30–34 Jahre',    values: [550, 530, 668, 840, 578, 708, 648], color: '#1E3A5F', bgColor: 'rgba(30,58,95,0.60)' },
        { label: '35–39 Jahre',    values: [274, 163, 203, 303, 375, 419, 440], color: '#3A7CA5', bgColor: 'rgba(58,124,165,0.55)' },
        { label: '40+ Jahre',      values: [101, 26, 27, 44, 81, 96, 85],      color: '#6B4C8A', bgColor: 'rgba(107,76,138,0.55)' }
      ],
      unit: 'Geburten'
    },
    keyFacts: [
      { number: '−45 %', label: 'Geburten seit 1970', context: 'Von 2\'775 (1970) auf 1\'538 (2023)' },
      { number: '−93 %', label: 'unter 25-jährige Mütter', context: 'Von 871 (1970) auf 64 (2023)' },
      { number: '1995', label: 'Wendepunkt', context: 'Ab ca. 1995 überwiegen Geburten bei Müttern über 30 Jahren' }
    ],
    analysis: [
      '1970 entfielen 32 Prozent aller Geburten auf Mütter unter 25 Jahren (871 von 2\'775). 2023 sind es noch 4 Prozent (64 von 1\'538). Die Altersgruppe unter 25 Jahre ist damit um 93 Prozent zurückgegangen.',
      'Die Gruppe der 30- bis 34-Jährigen ist heute die zahlenmässig grösste: 648 Geburten (42 % aller Geburten 2023). 1970 lag ihr Anteil bei 20 Prozent (550 Geburten). Die 35- bis 39-Jährigen haben ebenfalls stark zugelegt: von 274 (1970) auf 440 (2023), ein Anstieg um 61 Prozent.',
      'Die Gesamtzahl der Geburten unter 30-jährigen Müttern sank von 1\'850 (1970) auf 365 (2023), ein Rückgang von 80 Prozent. Die Geburten bei Müttern ab 30 Jahren stiegen von 925 auf 1\'173 (+27 %).'
    ],
    source: 'Amt für Wirtschaft und Tourismus Graubünden, Bevölkerungsstatistik (Naschientschas vivas)',
  },

  // ── WOCHE 2: TOURISMUS ───────────────────────────────────

  {
    id: 'tourismus-30jahre',
    week: 2,
    day: 1,
    publishDate: fmtDate(workdayDate(2, 1)),
    category: 'Tourismus',
    title: '30 Jahre Hotellerie: Logiernächte Graubünden seit 1992',
    lead: '1992 zählte die Bündner Hotellerie 6,9 Millionen Logiernächte — der höchste Wert der gesamten Zeitreihe. Seither schwanken die Zahlen zwischen 4,6 und 5,7 Millionen. 2025 lagen sie bei 5,7 Millionen.',
    chartTitle: 'Hotelübernachtungen Graubünden 1992–2025',
    chartSubtitle: 'Klassifizierte Hotellerie, Mio. Logiernächte pro Jahr · Statistik Graubünden (dvs_awt_econ_202502031)',
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
      'Den Höchstwert der Zeitreihe verzeichnete Graubünden 1992 mit 6,88 Mio. Logiernächten. In den Folgejahren gingen die Zahlen schrittweise zurück. 2016 wurde mit 4,62 Mio. der tiefste Wert der gesamten Zeitreihe erreicht.',
      'Im Jahr 2020 sanken die Logiernächte von 5,25 Mio. (2019) auf 4,76 Mio. — ein Rückgang von 9 Prozent. 2016 lag der Wert mit 4,62 Mio. noch tiefer als im COVID-Jahr 2020.',
      'Seit 2021 erholen sich die Zahlen: 2021: 5,13 Mio., 2022: 5,54 Mio., 2023: 5,39 Mio., 2024: 5,49 Mio., 2025: 5,68 Mio. Das Niveau von 1992 (6,88 Mio.) wurde bisher nicht wieder erreicht.'
    ],
    source: 'Statistik Graubünden, HESTA Hotelübernachtungen (dvs_awt_econ_202502031)',
  },

  {
    id: 'tourismus-saisonalitaet',
    week: 2,
    day: 2,
    publishDate: fmtDate(workdayDate(2, 2)),
    category: 'Tourismus',
    title: 'Winter gegen Sommer: Die Saisonalität von Graubündens Tourismus',
    lead: 'Februar ist der stärkste Monat im Bündner Tourismus, November der schwächste. 2024 lagen zwischen diesen beiden Monaten 836\'000 gegenüber 132\'000 Hotelübernachtungen — ein Verhältnis von über 6 zu 1.',
    chartTitle: 'Hotelübernachtungen nach Monat 2024',
    chartSubtitle: 'Logiernächte in Tsd. pro Monat · Statistik Graubünden (dvs_awt_econ_202502031)',
    chartType: 'bar',
    apiDatasetId: 'dvs_awt_econ_202502031',
    apiQuery: {
      select: 'monat,SUM(logiernachte) as total',
      group_by: 'monat',
      order_by: 'monat ASC',
      refine: 'jahr:2024'
    },
    parseData: 'parseTourismMonthly',
    keyFacts: [],
    analysis: [
      '2024 war Februar der stärkste Monat mit 836\'000 Logiernächten, November der schwächste mit 132\'000. Das Verhältnis zwischen stärkstem und schwächstem Monat beträgt rund 6 zu 1.',
      'Frühling und Herbst sind die schwächsten Perioden: April (162\'000), Mai (171\'000) und November (132\'000) liegen deutlich unter den Winter- und Sommermonaten.',
      'Die stärksten Sommermonate Juli (582\'000) und August (628\'000) erreichen 70–75 Prozent des Februar-Wertes. Januar (716\'000) und März (619\'000) ergänzen die Winterperiode.'
    ],
    source: 'Statistik Graubünden, HESTA Hotelübernachtungen 2024 (dvs_awt_econ_202502031)',
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
      'Davos führt das Gemeinde-Ranking mit rund 810\'000 Hotelübernachtungen 2023 an. St. Moritz folgt mit rund 783\'000 an zweiter Stelle — der Abstand zwischen den beiden ist damit vergleichsweise gering. Dahinter folgen Arosa (404\'000) und Pontresina (347\'000). Vaz/Obervaz umfasst als Gemeinde das gesamte Lenzerheide-Gebiet.',
      'Die Zahlen erfassen ausschliesslich klassifizierte Hotelbetriebe (HESTA). Ferienwohnungen, Camping und Gruppenunterkünfte sind nicht enthalten. Der tatsächliche Gesamttourismus pro Gemeinde liegt daher deutlich höher — besonders in Zweitwohnungsgemeinden wie Laax, Flims und Sils.',
      'Die 12 stärksten Gemeinden vereinen rund 78 Prozent aller kantonalen Hotelübernachtungen (4,0 von 5,2 Mio.). Die übrigen Gemeinden des Kantons teilen sich die verbleibenden 22 Prozent. Diese Konzentration auf wenige grosse Tourismusorte ist ein strukturelles Merkmal des Bündner Tourismus.'
    ],
    source: 'Statistik Graubünden, HESTA Hotelübernachtungen nach Gemeinde 2023 (dvs_awt_econ_20250203)',
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
      { number: '+97 %', label: 'Camping-Wachstum', context: 'Campingplätze: von 276 Tsd. (2016) auf 545 Tsd. (2024)' }
    ],
    analysis: [
      'Die Grafik zeigt die erfassten Logiernächte in Graubünden nach Unterkunftsart von 2016 bis 2024. Die Hotellerie ist mit rund 5,5 Millionen Übernachtungen der grösste Einzelbereich. Die drei Parahotellerie-Kategorien zusammen erreichten 2024 rund 3,4 Millionen Nächte — das entspricht 38 Prozent aller erfassten Übernachtungen.',
      'Innerhalb der Parahotellerie sind Ferienwohnungen mit rund 1,9 Millionen Nächten (2024) klar dominierend. Kollektivunterkünfte — Jugendherbergen, Gruppenunterkünfte, Hütten — erreichen rund 920\'000 Nächte. Campingplätze haben sich von 276\'000 (2016) auf 545\'000 (2024) nahezu verdoppelt.',
      'Nicht in diesen Zahlen enthalten: privat vermietete Ferienwohnungen, die nicht als gewerbliche Betriebe registriert sind. Die tatsächliche Zahl der Übernachtungen im Kanton liegt höher als in der Statistik ausgewiesen.'
    ],
    source: 'Bundesamt für Statistik, Parahotellerie-Statistik; Statistik Graubünden 2023',
  },

  {
    id: 'gaesteprofil',
    week: 2,
    day: 5,
    publishDate: fmtDate(workdayDate(2, 5)),
    category: 'Tourismus',
    title: 'Woher kommen die Gäste? Herkunft der Hotelgäste in Graubünden 2025',
    lead: '66 Prozent der Hotelübernachtungen in Graubünden entfallen auf Gäste aus der Schweiz. Deutschland ist mit 14 Prozent der grösste ausländische Quellmarkt. UK und USA liegen je bei rund 3 Prozent.',
    chartTitle: 'Hotelübernachtungen nach Herkunftsland 2025',
    chartSubtitle: 'Anteil an allen Logiernächten · Tourismusregion Graubünden · BFS HESTA 2025',
    chartType: 'doughnut',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    staticData: {
      labels: ['Schweiz','Deutschland','Ver. Königreich','USA','Niederlande','Italien','Belgien','Frankreich','Österreich','Übrige Länder'],
      values: [66.2, 14.1, 3.3, 3.3, 2.1, 2.1, 1.6, 1.2, 0.9, 5.1],
      unit: '%'
    },
    keyFacts: [
      { number: '66 %', label: 'Inlandgäste', context: 'Anteil Schweizer Gäste an allen Hotelübernachtungen 2025' },
      { number: '14 %', label: 'Deutschland', context: 'Grösster ausländischer Quellmarkt, gefolgt von UK (3.3 %) und USA (3.3 %)' },
      { number: '5.39 Mio.', label: 'Logiernächte total', context: 'Gesamte Hotelübernachtungen in der Tourismusregion Graubünden 2025' }
    ],
    analysis: [
      'Im Jahr 2025 entfielen 66,2 Prozent aller Hotelübernachtungen in der Tourismusregion Graubünden auf Gäste aus der Schweiz. Deutschland folgt mit 14,1 Prozent als grösstem ausländischen Quellmarkt. Total wurden 5,39 Millionen Logiernächte erfasst.',
      'Das Vereinigte Königreich und die USA liegen mit je 3,3 Prozent gleichauf auf den Rängen drei und vier. Niederlande und Italien liegen je bei 2,1 Prozent, Belgien bei 1,6 Prozent. Frankreich (1,2 %) und Österreich (0,9 %) schliessen die Top-9 ab. Alle übrigen Herkunftsländer zusammen machen 5,1 Prozent aus.',
      'Quelle ist die HESTA-Statistik des Bundesamts für Statistik (BFS). Erfasst werden Ankünfte und Logiernächte in Hotels und ähnlichen Betrieben nach Herkunftsland. Parahotellerie-Übernachtungen (Ferienwohnungen, Camping etc.) sind nicht enthalten.'
    ],
    source: 'Bundesamt für Statistik, HESTA — Ankünfte und Logiernächte nach Herkunftsland 2025; data.gr.ch dvs_awt_econ_202503260',
  },

  // ── WOCHE 3: WIRTSCHAFT ──────────────────────────────────

  {
    id: 'grenzgaenger',
    week: 3,
    day: 1,
    publishDate: fmtDate(workdayDate(3, 1)),
    category: 'Wirtschaft',
    title: "Grenzgänger: Rund 10'000 Menschen mit Grenzgängerbewilligung im Kanton",
    lead: 'Im Jahr 2025 verzeichnet der Kanton Graubünden rund 9\'700 Grenzgänger:innen pro Quartal — dreimal so viele wie 1996. Die Kurve zeigt das Wachstum über 30 Jahre, unterbrochen vom deutlichen Einbruch während der COVID-19-Pandemie 2020.',
    chartTitle: 'Grenzgänger Kanton Graubünden 1996–2025',
    chartSubtitle: 'Beschäftigte mit Grenzgängerbewilligung pro Quartal · BFS Grenzgängerstatistik',
    chartType: 'line',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    staticData: {
      labels: ["1996 Q1","1996 Q2","1996 Q3","1996 Q4","1997 Q1","1997 Q2","1997 Q3","1997 Q4","1998 Q1","1998 Q2","1998 Q3","1998 Q4","1999 Q1","1999 Q2","1999 Q3","1999 Q4","2000 Q1","2000 Q2","2000 Q3","2000 Q4","2001 Q1","2001 Q2","2001 Q3","2001 Q4","2002 Q1","2002 Q2","2002 Q3","2002 Q4","2003 Q1","2003 Q2","2003 Q3","2003 Q4","2004 Q1","2004 Q2","2004 Q3","2004 Q4","2005 Q1","2005 Q2","2005 Q3","2005 Q4","2006 Q1","2006 Q2","2006 Q3","2006 Q4","2007 Q1","2007 Q2","2007 Q3","2007 Q4","2008 Q1","2008 Q2","2008 Q3","2008 Q4","2009 Q1","2009 Q2","2009 Q3","2009 Q4","2010 Q1","2010 Q2","2010 Q3","2010 Q4","2011 Q1","2011 Q2","2011 Q3","2011 Q4","2012 Q1","2012 Q2","2012 Q3","2012 Q4","2013 Q1","2013 Q2","2013 Q3","2013 Q4","2014 Q1","2014 Q2","2014 Q3","2014 Q4","2015 Q1","2015 Q2","2015 Q3","2015 Q4","2016 Q1","2016 Q2","2016 Q3","2016 Q4","2017 Q1","2017 Q2","2017 Q3","2017 Q4","2018 Q1","2018 Q2","2018 Q3","2018 Q4","2019 Q1","2019 Q2","2019 Q3","2019 Q4","2020 Q1","2020 Q2","2020 Q3","2020 Q4","2021 Q1","2021 Q2","2021 Q3","2021 Q4","2022 Q1","2022 Q2","2022 Q3","2022 Q4","2023 Q1","2023 Q2","2023 Q3","2023 Q4","2024 Q1","2024 Q2","2024 Q3","2024 Q4","2025 Q1","2025 Q2","2025 Q3","2025 Q4"],
      values: [3304,3130,3153,3018,2991,2908,2904,2754,2777,2820,2880,2866,2928,2972,3041,3060,3114,3234,3228,3200,3206,3372,3467,3572,3544,3510,3506,3326,3287,3392,3445,3074,3283,3447,3350,2834,3021,3207,3114,2745,2864,3142,3190,2880,3126,3384,3428,3141,3380,3596,3587,3338,3563,3796,3806,3587,3837,4211,4282,3931,4218,4822,4938,4336,4507,5113,5241,4734,4780,5424,5448,5072,5144,5691,5806,5583,5434,5800,5984,5711,5595,6016,6115,6246,5932,6339,6433,6433,6138,6600,6704,6775,6613,6987,7098,7186,6908,7222,7640,7689,7509,8152,8436,8628,8640,8896,9130,9318,9476,9658,9866,9878,10008,9746,9836,9864,9980,9795,9808,9330],
      unit: 'Personen'
    },
    keyFacts: [
      { number: "9'728", label: 'Jahresschnitt 2025', context: 'Durchschnittliche Grenzgänger:innen pro Quartal 2025 (Q1: 9\'980, Q2: 9\'795, Q3: 9\'808, Q4: 9\'330)' },
      { number: '+194 %', label: 'Wachstum seit 1996', context: 'Von ~3\'300 (1996) auf ~9\'700 (2025) — knapp Verdreifachung' },
      { number: '–3.9 %', label: 'COVID-Einbruch', context: 'Q4 2019 (7\'186) → Q1 2020 (6\'908): tiefster Stand, rasche Erholung ab Q2 2020' }
    ],
    analysis: [
      'Die Grafik zeigt die Zahl der Beschäftigten mit Grenzgängerbewilligung im Kanton Graubünden, quartalsweise von 1996 bis 2025. 1996 lag der Quartalswert bei rund 3\'300 Personen, 2025 bei rund 9\'700 — eine Zunahme um knapp das Dreifache in 30 Jahren.',
      'Der COVID-19-Einbruch im Jahr 2020 ist in der Kurve erkennbar: Im ersten Quartal 2020 sank der Wert auf 6\'908 — von 7\'186 im vierten Quartal 2019. Die Erholung setzte rasch ein; ab Q2 2020 stiegen die Werte wieder. 2024 Q1 wurde mit 10\'008 der bisherige Höchstwert erreicht.',
      'Die Daten stammen aus der Grenzgängerstatistik des Bundesamts für Statistik (BFS). Erfasst sind Personen mit Wohnsitz im Ausland, die regelmässig zur Arbeit in den Kanton einpendeln und eine Grenzgängerbewilligung (Ausweis G) besitzen.'
    ],
    source: 'Bundesamt für Statistik, Grenzgängerstatistik; data.gr.ch dvs_awt_econ_20250513',
  },

  {
    id: 'exporte',
    week: 3,
    day: 2,
    publishDate: fmtDate(workdayDate(3, 2)),
    category: 'Wirtschaft',
    title: 'Was Graubünden exportiert: die wichtigsten Waren',
    lead: 'Graubünden ist kein klassischer Industriekanton — und dennoch exportiert der Bergkanton für über 5 Milliarden Franken im Jahr. Chemische Erzeugnisse und Maschinen führen das Ranking an. Eine überraschende Exportstruktur für einen Bergkanton.',
    chartTitle: 'Exporte Graubünden nach Warengruppe 2024',
    chartSubtitle: 'Top-10-Produktgruppen, Exportwert in Mio. CHF · EZV/data.gr.ch 2024',
    chartType: 'hbar',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    staticData: {
      labels: ['Chemische Erzeugnisse','Maschinen','Diverses (a.n.g.)','EDV & Elektronik','Elektrogeräte','Pharmazeutika','Kunststoff & Gummi','Metallerzeugnisse','Papier & Pappe','Nahrungsmittel'],
      values: [764, 587, 191, 190, 113, 111, 95, 71, 67, 58],
      unit: 'Mio. CHF'
    },
    keyFacts: [
      { number: '5\'094', label: 'Mio. CHF Exporte 2024', context: 'Gesamte Warenexporte Kanton Graubünden 2024 (alle CPA-Sektionen)' },
      { number: '764', label: 'Mio. CHF Chemie', context: 'Grösste Einzelkategorie, vor Maschinen (587 Mio.) und Diverses (191 Mio.)' },
      { number: '97 %', label: 'Hergestellte Waren', context: '97 Prozent der GR-Exporte entfallen auf Sektion C (Verarbeitendes Gewerbe)' }
    ],
    analysis: [
      'Die Grafik zeigt die zehn grössten öffentlich verfügbaren Exportkategorien des Kantons Graubünden im Jahr 2024 (Aussenhandelsstatistik EZV). Chemische Erzeugnisse führen mit 764 Mio. CHF, gefolgt von Maschinen (587 Mio.) und diversen Waren (191 Mio.).',
      'EDV- und Elektronikgeräte (190 Mio.) sowie Elektrogeräte (113 Mio.) bilden zusammen mit den Maschinen einen Technologiecluster von rund 890 Mio. CHF. Pharmazeutische Erzeugnisse (111 Mio.) folgen auf Rang 6. Nahrungsmittel belegen mit 58 Mio. CHF Rang 10.',
      'Der Gesamtexport Graubündens betrug 2024 rund 5,1 Milliarden Franken. Davon entfallen 97 Prozent auf die Sektion C (Hergestellte Waren). Ein Teil der Exportdaten unterliegt der Geheimhaltungspflicht und ist in der Grafik nicht ausgewiesen.'
    ],
    source: 'Eidgenössische Zollverwaltung, Aussenhandelsstatistik; data.gr.ch dvs_awt_econ_20250702',
  },

  {
    id: 'handelspartner',
    week: 3,
    day: 3,
    publishDate: fmtDate(workdayDate(3, 3)),
    category: 'Wirtschaft',
    title: "Graubündens Handelspartner: wer kauft, wer liefert",
    lead: 'Deutschland ist sowohl grösstes Exportziel als auch wichtigster Importlieferant Graubündens. Die USA sind trotz Distanz auf Platz 2 der Exportmärkte. Ein Blick auf die Handelspartner nach Export und Import getrennt.',
    chartTitle: 'Handelspartner Graubünden 2024: Export vs. Import',
    chartSubtitle: 'Exportwert und Importwert in Mio. CHF nach Ländern · EZV/data.gr.ch 2024',
    chartType: 'groupedbar',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    staticData: {
      labels: ['Deutschland','USA','China','Italien','Frankreich','Österreich','Spanien','Japan'],
      series: [
        { label: 'Exporte', values: [598, 374, 228, 200, 176, 92, 64, 52], color: 'rgba(181,0,30,0.80)' },
        { label: 'Importe', values: [604, 50, 221, 335, 148, 129, 60, 72], color: 'rgba(30,58,95,0.70)' }
      ],
      unit: 'Mio. CHF'
    },
    keyFacts: [
      { number: '598', label: 'Mio. CHF Exporte nach DE', context: 'Deutschland ist grösstes Exportziel Graubündens (2024)' },
      { number: '335', label: 'Mio. CHF Importe aus IT', context: 'Italien ist zweitwichtigster Importlieferant nach Deutschland (604 Mio.)' },
      { number: '374', label: 'Mio. CHF Exporte in USA', context: 'USA auf Rang 2 der Exportmärkte, trotz geografischer Distanz' }
    ],
    analysis: [
      'Deutschland ist sowohl grösstes Exportziel (598 Mio. CHF) als auch wichtigster Importlieferant (604 Mio. CHF) Graubündens. Die geografische Nähe und die enge Wirtschaftsverflechtung der Schweiz mit dem nördlichen Nachbarn spiegelt sich auch auf Kantonsebene.',
      'Die USA stehen mit 374 Mio. CHF Exporten auf Rang 2 — deutlich vor China (228 Mio.) und Italien (200 Mio.). Auf der Importseite hingegen sind die USA mit 50 Mio. CHF weniger bedeutend: hier liegen Italien (335 Mio.) und Frankreich (148 Mio.) vor Österreich (129 Mio.).',
      'Die Unterschiede zwischen Export- und Importstruktur zeigen die Spezialisierung: Graubünden exportiert vor allem in industrielle Absatzmärkte (USA, China), importiert dagegen stärker aus geografisch nahen EU-Ländern.'
    ],
    source: 'Eidgenössische Zollverwaltung, Aussenhandelsstatistik; data.gr.ch dvs_awt_econ_202507020 (2024)',
  },

  {
    id: 'arbeitsmarkt',
    active: false,
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
  },

  {
    id: 'infrastruktur',
    active: false,
    week: 3,
    day: 5,
    publishDate: fmtDate(workdayDate(3, 5)),
    category: 'Wirtschaft',
    title: 'Infrastruktur im Bergkanton: Bahn, Strasse, Energie',
    lead: 'Graubünden ist mit 7\'105 km² der flächengrösste Kanton der Schweiz bei einer Bevölkerung von rund 200\'000 Personen. Das bedeutet eine der niedrigsten Bevölkerungsdichten — und entsprechend hohe Infrastrukturkosten pro Kopf.',
    chartTitle: 'Infrastrukturprojekte im Kanton Graubünden',
    chartSubtitle: 'Geförderte Projekte nach Gemeinde · Kanton Graubünden (dvs_awt_regi_20251201)',
    chartType: 'bar',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    keyFacts: [],
    analysis: [
      'Die Rhätische Bahn betreibt ein Schmalspurnetz von rund 384 Kilometer Länge. Die Strecken Albula/Bernina wurden 2008 als UNESCO-Welterbe anerkannt. Das Netz verbindet Täler wie das Engadin, das Albulatal, das Prättigau und das Vorderrheintal.',
      'Graubünden hat mit 7\'105 km² die grösste Kantonsfläche der Schweiz. Bei rund 200\'000 Einwohnern ergibt das eine Bevölkerungsdichte von etwa 28 Personen pro km² — der tiefste Wert aller Kantone.',
      'Die Kombination aus grosser Fläche, geringer Dichte und Berggelände führt zu vergleichsweise hohen Infrastrukturkosten pro Einwohner für Strassen, Bahnen, Wildbachverbauungen und Lawinenschutz.'
    ],
    source: 'Rhätische Bahn, Jahresbericht; Statistik Graubünden, Bevölkerungsstatistik',
  },

  // ── WOCHE 4: GESELLSCHAFT & ZUKUNFT ─────────────────────

  {
    id: 'romanisch',
    active: false,
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
  },

  {
    id: 'klimaerwaermung',
    active: false,
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
  },

  {
    id: 'berglandwirtschaft',
    active: false,
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
  },

  {
    id: 'synthese-indikatoren',
    active: false,
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
  },

  {
    id: 'datenstory-bilanz',
    active: false,
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
  }

].filter(function(s) { return s.active !== false; }); // end STORIES (active:false = Backlog)


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
let activeVariantCharts = [];

function destroyVariantCharts() {
  activeVariantCharts.forEach(function(c) { if (c) c.destroy(); });
  activeVariantCharts = [];
}

function buildVariantCharts(variants) {
  destroyVariantCharts();
  var container = document.getElementById('variants-container');
  if (!container) return;
  container.innerHTML = '';
  if (!variants || !variants.length) return;

  variants.forEach(function(variant, idx) {
    var isDonut = variant.type === 'doughnut';
    var areaClass = 'chart-area' + (isDonut ? ' chart-area--donut' : '');
    var card = document.createElement('div');
    card.className = 'chart-card chart-variant-card';
    card.innerHTML =
      '<div class="chart-meta">' +
        '<p class="chart-variant-label">Darstellungsvariante</p>' +
        '<h2 class="chart-title">' + (variant.title || '') + '</h2>' +
      '</div>' +
      '<div class="' + areaClass + '">' +
        '<canvas id="variantChart-' + idx + '"></canvas>' +
      '</div>';
    container.appendChild(card);

    var canvas = document.getElementById('variantChart-' + idx);
    var ctx = canvas.getContext('2d');
    var chart = null;
    var vBase = { family: "'Inter', system-ui, sans-serif", size: 12 };
    var vMuted = '#6B6763';

    if (variant.type === 'doughnut') {
      chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: variant.labels,
          datasets: [{
            data: variant.values,
            backgroundColor: variant.colors,
            borderWidth: 2, borderColor: '#fff', hoverOffset: 8
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '60%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: vBase, color: vMuted, padding: 14,
                usePointStyle: true, pointStyleWidth: 10,
                generateLabels: function(chart) {
                  var ds = chart.data.datasets[0];
                  var total = ds.data.reduce(function(a,b){return a+b;},0);
                  return chart.data.labels.map(function(label,i) {
                    var pct = (ds.data[i]/total*100).toFixed(1);
                    return { text: label + ' (' + pct + ' %)', fillStyle: ds.backgroundColor[i], strokeStyle: '#fff', lineWidth: 2, index: i };
                  });
                }
              }
            },
            tooltip: {
              backgroundColor: '#161616', padding: 12,
              titleFont: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' },
              bodyFont: vBase,
              callbacks: {
                label: function(ctx) {
                  var total = ctx.dataset.data.reduce(function(a,b){return a+b;},0);
                  var pct = (ctx.parsed/total*100).toFixed(1);
                  return '  ' + ctx.label + ': ' + ctx.parsed.toLocaleString('de-CH') + ' (' + pct + ' %)';
                }
              }
            }
          }
        }
      });
    } else if (variant.type === 'hbar') {
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: variant.labels,
          datasets: [{
            data: variant.values,
            backgroundColor: variant.colors,
            borderRadius: 4, borderSkipped: false
          }]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#161616', padding: 12,
              titleFont: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' },
              bodyFont: vBase,
              callbacks: {
                label: function(ctx) {
                  var total = variant.values.reduce(function(a,b){return a+b;},0);
                  var pct = (ctx.parsed.x/total*100).toFixed(1);
                  return '  ' + ctx.parsed.x.toLocaleString('de-CH') + ' Einw. (' + pct + ' %)';
                }
              }
            }
          },
          scales: {
            x: { grid: { color: '#E8E4E0' }, ticks: { font: vBase, color: vMuted, callback: function(v){ return (v/1000).toFixed(0)+'k'; } } },
            y: { grid: { display: false }, ticks: { font: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' }, color: '#161616' } }
          }
        }
      });
    } else if (variant.type === 'pareto') {
      var halfLine = variant.labels.map(function(){ return 50; });
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: variant.labels,
          datasets: [
            {
              label: 'Kumulativer Bevölkerungsanteil',
              data: variant.values,
              borderColor: '#1E3A5F', backgroundColor: 'rgba(30,58,95,0.08)',
              borderWidth: 2.5, fill: true, tension: 0.1,
              pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: '#1E3A5F'
            },
            {
              label: '50%-Marke',
              data: halfLine,
              borderColor: '#B5001E', borderWidth: 1.5,
              borderDash: [5,4], pointRadius: 0, fill: false
            }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#161616', padding: 12,
              titleFont: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' },
              bodyFont: vBase,
              callbacks: {
                title: function(items) { return items[0].label + ' (Rang ' + (items[0].dataIndex+1) + ')'; },
                label: function(ctx) {
                  if (ctx.datasetIndex === 1) return null;
                  var pop = variant.pops ? variant.pops[ctx.dataIndex] : '';
                  return [
                    '  Kumulativ: ' + ctx.parsed.y + ' %',
                    pop ? '  Einwohner: ' + pop.toLocaleString('de-CH') : ''
                  ];
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: '#E8E4E0' },
              ticks: {
                font: vBase, color: vMuted, maxTicksLimit: 10,
                callback: function(val, i) {
                  var marks = [0,4,9,12,24,49,74,99,100];
                  return marks.indexOf(i) !== -1 ? (i+1) : '';
                }
              }
            },
            y: {
              min: 0, max: 100, grid: { color: '#E8E4E0' },
              ticks: { font: vBase, color: vMuted, callback: function(v){ return v+'%'; } }
            }
          }
        }
      });
    }
    activeVariantCharts.push(chart);
  });
}


function buildVariantChart(variant) {
  destroyVariantChart();
  const card = document.getElementById('variant-card');
  if (!card) return;
  if (!variant) { card.style.display = 'none'; return; }
  card.style.display = '';
  const el = document.getElementById('variant-title');
  if (el) el.textContent = variant.title || '';
  const canvas = document.getElementById('variantChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  activeVariantChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: variant.labels,
      datasets: [{
        data: variant.values,
        backgroundColor: variant.colors,
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: { family: "'Inter', system-ui, sans-serif", size: 12 },
            color: '#6B6763',
            padding: 14,
            usePointStyle: true,
            pointStyleWidth: 10,
            generateLabels: function(chart) {
              const ds = chart.data.datasets[0];
              const total = ds.data.reduce(function(a,b){ return a+b; }, 0);
              return chart.data.labels.map(function(label, i) {
                const val = ds.data[i];
                const pct = (val/total*100).toFixed(1);
                return {
                  text: label + ' (' + pct + ' %)',
                  fillStyle: ds.backgroundColor[i],
                  strokeStyle: '#fff',
                  lineWidth: 2,
                  index: i
                };
              });
            }
          }
        },
        tooltip: {
          backgroundColor: '#161616',
          titleFont: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' },
          bodyFont:  { family: "'Inter', system-ui, sans-serif", size: 12 },
          padding: 12,
          callbacks: {
            label: function(ctx) {
              const total = ctx.dataset.data.reduce(function(a,b){ return a+b; }, 0);
              const pct = (ctx.parsed/total*100).toFixed(1);
              return '  ' + ctx.label + ': ' + ctx.parsed.toLocaleString('de-CH') + ' (' + pct + ' %)';
            }
          }
        }
      }
    }
  });
}

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

  // ---- HORIZONTAL BAR ----
  if (type === 'hbar') {
    const barColors = (d.labels || []).map((_, i) => {
      const opacity = Math.max(0.35, 1 - i * 0.07);
      return 'rgba(181,0,30,' + opacity + ')';
    });
    activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [{ label: d.unit, data: d.values, backgroundColor: barColors, borderRadius: 3, borderSkipped: false }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: tooltipCfg },
        scales: {
          x: { grid: { color: GRID }, ticks: { font: baseFont, color: MUTED }, beginAtZero: true },
          y: { grid: { display: false }, ticks: { font: { family: "'Inter', system-ui, sans-serif", size: 12 }, color: '#161616' } }
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

  // ---- STACKED AREA ----
  if (type === 'stackedarea') {
    const datasets = (d.series || []).map(function(s) {
      return {
        label: s.label,
        data: s.values,
        borderColor: s.color,
        backgroundColor: s.bgColor,
        borderWidth: 1.5,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: s.color
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
            labels: { font: baseFont, color: '#161616', boxWidth: 14, padding: 14 }
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
          x: { grid: { color: GRID }, ticks: { font: baseFont, color: MUTED } },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: GRID },
            ticks: { font: baseFont, color: MUTED, callback: function(v) { return v.toLocaleString('de-CH'); } }
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
          pointRadius: d.labels && d.labels.length > 40 ? 0 : 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#B5001E',
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
            ticks: {
              font: baseFont,
              color: MUTED,
              maxRotation: 0,
              maxTicksLimit: 10,
              callback: function(val, idx) {
                const lbl = this.getLabelForValue(val);
                if (!lbl) return '';
                // Quarterly data: show only Q1 as year
                if (String(lbl).includes('Q')) {
                  return lbl.includes('Q1') ? lbl.replace(' Q1', '') : '';
                }
                // Yearly data: show as-is (maxTicksLimit handles density)
                return lbl;
              }
            }
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
// STORY MENU
// ============================================================

function renderStoryMenu() {
  const menu = document.getElementById('story-menu');
  if (!menu) return;

  const categories = {};
  STORIES.forEach(function(story, idx) {
    if (!categories[story.category]) categories[story.category] = [];
    categories[story.category].push({ story: story, idx: idx });
  });

  let html = '';
  Object.keys(categories).forEach(function(cat) {
    html += '<div class="smenu-group">';
    html += '<div class="smenu-cat">' + cat + '</div>';
    categories[cat].forEach(function(item) {
      const isActive = item.idx === currentIndex;
      html += '<button class="smenu-item' + (isActive ? ' smenu-item--active' : '') + '" data-idx="' + item.idx + '">' +
        item.story.title + '</button>';
    });
    html += '</div>';
  });
  menu.innerHTML = html;

  menu.querySelectorAll('.smenu-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      renderStory(+this.dataset.idx);
      const nav = document.getElementById('story-menu-nav');
      const toggle = document.getElementById('menu-toggle');
      if (nav) nav.hidden = true;
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });
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

  // 3b. Variant chart
  buildVariantCharts(s.chartVariants || (s.chartVariant ? [s.chartVariant] : []));

  // 4. Update story menu active state
  renderStoryMenu();

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

  // Story menu toggle
  const toggle = document.getElementById('menu-toggle');
  const nav    = document.getElementById('story-menu-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      const willOpen = nav.hidden;
      nav.hidden     = !willOpen;
      toggle.setAttribute('aria-expanded', String(willOpen));
    });
  }

  // Determine initial story from URL hash OR first story
  const hash    = window.location.hash.slice(1);
  const hashIdx = STORIES.findIndex(function(s) { return s.id === hash; });
  renderStory(hashIdx >= 0 ? hashIdx : 0);

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

  // Handle browser back/forward
  window.addEventListener('hashchange', function() {
    const h   = window.location.hash.slice(1);
    const idx = STORIES.findIndex(function(s) { return s.id === h; });
    if (idx >= 0 && idx !== currentIndex) renderStory(idx);
  });

})();

