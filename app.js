'use strict';

/* ============================================================
   DATENSTORY GRAUBÜNDEN — app.js
   Daten-Ressource für die wöchentliche Südostschweiz-Kolumne
   Bevölkerung, Tourismus, Wirtschaft und Gesellschaft in GR
   ============================================================ */

// ============================================================
// CONFIG
// ============================================================
const API_BASE = 'https://data.gr.ch/api/explore/v2.1/catalog/datasets';

// ============================================================
// HELPERS
// ============================================================
function formatDateDE(date) {
  const d = date || new Date();
  return d.toLocaleDateString('de-CH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ============================================================
// GEMEINDEN TREEMAP — 101 Gemeinden, Bevölkerung 2024
// (sortiert absteigend; wird von mehreren Varianten verwendet)
// ============================================================
const TREEMAP_101 = [
  {n:"Chur",v:39177},{n:"Davos",v:10774},{n:"Landquart",v:9244},{n:"Domat/Ems",v:8392},
  {n:"Ilanz/Glion",v:5067},{n:"St. Moritz",v:4997},{n:"Scuol",v:4546},{n:"Klosters",v:4478},
  {n:"Zizers",v:3691},{n:"Bonaduz",v:3565},{n:"Poschiavo",v:3505},{n:"Thusis",v:3439},
  {n:"Trimmis",v:3424},{n:"Maienfeld",v:3266},{n:"Arosa",v:3159},{n:"Schiers",v:2993},
  {n:"Flims",v:2902},{n:"Samedan",v:2901},{n:"Felsberg",v:2886},{n:"Vaz/Obervaz",v:2732},
  {n:"Untervaz",v:2674},{n:"Roveredo (GR)",v:2656},{n:"Malans",v:2529},{n:"Surses",v:2465},
  {n:"Cazis",v:2439},{n:"Domleschg",v:2262},{n:"Grüsch",v:2176},{n:"Churwalden",v:2114},
  {n:"Disentis/Mustér",v:2104},{n:"Laax",v:2102},{n:"Lumnezia",v:2075},{n:"Pontresina",v:2072},
  {n:"Breil/Brigels",v:1706},{n:"Luzein",v:1689},{n:"Rhäzüns",v:1612},{n:"Zernez",v:1592},
  {n:"Bregaglia",v:1591},{n:"Grono",v:1580},{n:"Trin",v:1557},{n:"Seewis im Prättigau",v:1450},
  {n:"Val Müstair",v:1430},{n:"Celerina/Schlarigna",v:1415},{n:"Mesocco",v:1414},{n:"Albula/Alvra",v:1354},
  {n:"Zuoz",v:1224},{n:"Tamins",v:1223},{n:"Tujetsch",v:1199},{n:"Jenaz",v:1164},
  {n:"Obersaxen Mundaun",v:1160},{n:"Trun",v:1141},{n:"Silvaplana",v:1124},{n:"Brusio",v:1099},
  {n:"Sumvitg",v:1063},{n:"Sils im Domleschg",v:976},{n:"Safiental",v:964},{n:"Vals",v:964},
  {n:"Jenins",v:961},{n:"Andeer",v:958},{n:"Küblis",v:923},{n:"San Vittore",v:910},
  {n:"Bergün Filisur",v:898},{n:"Fläsch",v:879},{n:"Lostallo",v:866},{n:"Scharans",v:836},
  {n:"Valsot",v:801},{n:"Sagogn",v:769},{n:"La Punt Chamues-ch",v:750},{n:"Samnaun",v:750},
  {n:"Cama",v:720},{n:"S-chanf",v:713},{n:"Sils im Engadin/Segl",v:708},{n:"Falera",v:635},
  {n:"Fideris",v:626},{n:"Bever",v:618},{n:"Schluein",v:616},{n:"Rheinwald",v:570},
  {n:"Masein",v:531},{n:"Lantsch/Lenz",v:518},{n:"Zillis-Reischen",v:426},{n:"Muntogna da Schons",v:368},
  {n:"Fürstenau",v:353},{n:"Medel (Lucmagn)",v:328},{n:"Soazza",v:324},{n:"Tschiertschen-Praden",v:309},
  {n:"Rothenbrunnen",v:304},{n:"Flerden",v:255},{n:"Castaneda",v:254},{n:"Conters im Prättigau",v:224},
  {n:"Schmitten (GR)",v:205},{n:"Calanca",v:204},{n:"Furna",v:203},{n:"Madulain",v:196},
  {n:"Avers",v:169},{n:"Rossa",v:168},{n:"Urmein",v:163},{n:"Sufers",v:147},
  {n:"Tschappina",v:146},{n:"Santa Maria in Calanca",v:113},{n:"Buseno",v:91},{n:"Ferrera",v:76},
  {n:"Rongellen",v:59}
];

// ============================================================
// STORIES ARRAY
// ============================================================
const STORIES = [

  {
    id: 'chur-60-gemeinden',
    ausgabe: 1,
    status: 'ready',
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
        type: 'half-split',
        title: '13 Gemeinden = eine Hälfte, 88 Gemeinden = die andere',
        top: [
          {name:'Chur',pop:39177},{name:'Davos',pop:10774},{name:'Landquart',pop:9244},
          {name:'Domat/Ems',pop:8392},{name:'Ilanz/Glion',pop:5067},{name:'St. Moritz',pop:4997},
          {name:'Scuol',pop:4546},{name:'Klosters',pop:4478},{name:'Zizers',pop:3691},
          {name:'Bonaduz',pop:3565},{name:'Poschiavo',pop:3505},{name:'Thusis',pop:3439},
          {name:'Trimmis',pop:3424}
        ],
        rest: 101839
      },
      {
        type: 'treemap', colorScheme: 'split13',
        title: 'Variante A: 13 grösste hervorgehoben (13/88-Logik)'
      },
      {
        type: 'treemap', colorScheme: 'gradient',
        title: 'Variante B: kontinuierlicher Gradient (gross = dunkel)'
      },
      {
        type: 'treemap', colorScheme: 'mono',
        title: 'Variante C: einfarbig — Grösse spricht für sich'
      }
    ],
  },

  {
    id: 'altersstruktur',
    status: 'ready',
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
    status: 'ready',
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
    status: 'ready',
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
    status: 'ready',
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
    status: 'ready',
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

  {
    id: 'tourismus-30jahre',
    status: 'ready',
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
    status: 'ready',
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
    status: 'ready',
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
    status: 'ready',
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
    status: 'ready',
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

  {
    id: 'grenzgaenger',
    status: 'ready',
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
    status: 'ready',
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
    status: 'ready',
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
    status: 'backlog',
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
    status: 'backlog',
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

  {
    id: 'romanisch',
    active: false,
    status: 'backlog',
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
    status: 'backlog',
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
    status: 'backlog',
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
    status: 'backlog',
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
    status: 'backlog',
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
  },


  {
    id: 'schlaf-vs-arbeitsort',
    ausgabe: 2,
    status: 'ready',
    category: 'Wirtschaft',
    title: 'St. Moritz schläft kaum — Santa Maria in Calanca arbeitet kaum',
    lead: 'In St. Moritz kommen auf 100 Einwohnerinnen 144 Vollzeitäquivalente — fast dreimal mehr Arbeitsplätze als Bewohner. In Santa Maria in Calanca sind es 6. Die Arbeitsplatzquote zeigt, wo Graubünden schläft und wo es arbeitet.',
    chartTitle: 'VZÄ pro 100 Einwohner — ausgewählte Gemeinden 2023',
    chartSubtitle: 'Vollzeitäquivalente je 100 Einw. · Statistik GR 2023 · Kantonaler Schnitt: 52.6 · Blau = Arbeitsort/Gemischt, Grau = Wohnort, Rot = Schlafdorf',
    chartType: 'bar',
    horizontal: true,
    chartColors: [
      '#1E3A5F','#1E3A5F','#1E3A5F','#1E3A5F','#1E3A5F','#1E3A5F',
      '#6B6763','#6B6763',
      '#B5001E','#B5001E','#B5001E','#B5001E','#B5001E','#B5001E'
    ],
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    staticData: {
      labels: ['St. Moritz','Samnaun','Sils im Engadin/Segl','Arosa','Davos','Chur','Landquart','Domat/Ems','Masein','Tamins','Felsberg','Rongellen','Sagogn','Santa Maria in Calanca'],
      values: [144, 128, 123, 74, 69, 67, 56, 40, 17, 16, 15, 10, 9, 6],
      unit: 'VZÄ / 100 Einw.'
    },
    keyFacts: [
      { number: '144', label: 'VZÄ / 100 Einw.', context: 'St. Moritz — extremster Arbeitsort Graubündens' },
      { number: '6', label: 'VZÄ / 100 Einw.', context: 'Santa Maria in Calanca — extremstes Schlafdorf' },
      { number: '52.6', label: 'Kantonaler Schnitt', context: 'VZÄ pro 100 Einwohner, Kanton GR 2023' }
    ],
    analysis: [
      'St. Moritz hat 144 Vollzeitäquivalente pro 100 Einwohnerinnen — fast dreimal den kantonalen Schnitt von 52.6. Das ist kein Zufall: Luxushotels, Restaurants und Boutiquen beschäftigen Tausende, die ausserhalb wohnen. Ähnlich Samnaun (128) und Sils im Engadin/Segl (123): touristische Arbeitsmagnete mit einem Bruchteil an eigener Wohnbevölkerung.',
      'Am anderen Ende der Skala liegt Santa Maria in Calanca mit 6 VZÄ pro 100 Einwohner. Von 119 Einwohnenden arbeiten die meisten ausserhalb — hauptsächlich in Roveredo oder Grono im Misox. Sagogn (9), Rongellen (10) und Buseno (11) zeigen ähnliche Muster: kleine Gemeinden ohne Wirtschaftsstruktur, wirtschaftlich vollständig von Nachbargemeinden abhängig.',
      'Diese Unterschiede haben steuerliche Konsequenzen. Schlafdörfer kassieren Einkommenssteuern von Pendlerinnen, müssen aber kaum in Gewerbeinfrastruktur investieren. Arbeitsorte tragen Lasten für viele, die anderswo steuerpflichtig sind. Der kantonale Finanzausgleich mildert diese Ungleichgewichte — aber die strukturelle Spannung bleibt ein Dauerthema der Bündner Regionalpolitik.'
    ],
    source: 'Statistik Graubünden, DVS/AWT: Beschäftigte/VZÄ nach Gemeinde (dvs_awt_econ_20250812) 2023; Wohnbevölkerung (dvs_awt_soci_20250507) 2023',
    chartVariants: [
      {
        type: 'hbar',
        title: 'Top 15 Arbeitsorte: VZÄ pro 100 Einwohner 2023',
        labels: ['St. Moritz','Samnaun','Sils im Engadin/Segl','Rothenbrunnen','Pontresina','Vaz/Obervaz','Samedan','Arosa','Silvaplana','Davos','Brusio','Chur','Val Müstair','Grono','Zuoz'],
        values: [144, 128, 123, 97, 86, 80, 79, 74, 70, 69, 68, 67, 61, 61, 58],
        colors: ['#0D2040','#1E3A5F','#1E3A5F','#2A5080','#2A5080','#3A6A9F','#3A6A9F','#3A6A9F','#4A7AAF','#4A7AAF','#4A7AAF','#4A7AAF','#5A8ABF','#5A8ABF','#5A8ABF']
      },
      {
        type: 'hbar',
        title: 'Top 15 Schlafdörfer: VZÄ pro 100 Einwohner 2023 (tiefste Werte)',
        labels: ['Santa Maria in Calanca','Sagogn','Rongellen','Buseno','Rossa','Felsberg','Tamins','Domleschg','Masein','Trin','Schmitten (GR)','Urmein','Flerden','Rhäzüns','Cama'],
        values: [6, 9, 10, 11, 11, 15, 16, 16, 17, 17, 17, 18, 18, 20, 22],
        colors: ['#800010','#8E0018','#9C0018','#AA0020','#B5001E','#C01828','#C01828','#C01828','#CC2030','#CC2030','#CC2030','#D83038','#D83038','#E04048','#E04048']
      }
    ]
  },

  {
    id: 'gemeinde-namen',
    ausgabe: 3,
    status: 'ready',
    category: 'Gesellschaft',
    title: 'Chur bleibt kurz — Santa Maria in Calanca braucht 22 Zeichen',
    lead: 'Die Länge eines Gemeindenamens verrät viel: über Sprachgeschichte, Gemeindefusionen und geografische Lage. Alle 101 Gemeinden im Überblick — nach Arbeitsplatzquote, Bevölkerung und Sprachzugehörigkeit.',
    chartTitle: 'Namenslänge, Bevölkerung und Wirtschaftscharakter — alle 101 Gemeinden 2023',
    chartSubtitle: 'X: VZÄ / 100 Einw. · Y: Wohnbevölkerung (log) · Grösse: Namenslänge · Farbe: Sprachregion',
    chartType: 'bubble',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    staticData: {
      series: [
      {label:"Deutschsprachig",color:"#1E3A5F",points:[{name:"St. Moritz",x:144.2,y:4926,nl:10},{name:"Samnaun",x:128.2,y:755,nl:7},{name:"Rothenbrunnen",x:97.4,y:312,nl:13},{name:"Arosa",x:74.0,y:3143,nl:5},{name:"Davos",x:69.2,y:10800,nl:5},{name:"Chur",x:66.6,y:38949,nl:4},{name:"Laax",x:57.3,y:2112,nl:4},{name:"Landquart",x:55.9,y:9191,nl:9},{name:"Vals",x:55.7,y:949,nl:4},{name:"Thusis",x:53.1,y:3459,nl:6},{name:"Maienfeld",x:53.0,y:3193,nl:9},{name:"Grüsch",x:52.7,y:2161,nl:6},{name:"Zizers",x:50.4,y:3589,nl:6},{name:"Flims",x:47.8,y:2939,nl:5},{name:"Küblis",x:47.3,y:920,nl:6},{name:"Cazis",x:47.2,y:2416,nl:5},{name:"Bonaduz",x:42.6,y:3533,nl:7},{name:"Klosters",x:40.1,y:4473,nl:8},{name:"Schiers",x:39.7,y:2951,nl:7},{name:"Fürstenau",x:38.1,y:349,nl:9},{name:"Andeer",x:36.9,y:926,nl:6},{name:"Zillis-Reischen",x:36.8,y:419,nl:15},{name:"Ferrera",x:36.6,y:82,nl:7},{name:"Seewis im Prättigau",x:35.2,y:1430,nl:19},{name:"Scharans",x:35.2,y:838,nl:8},{name:"Fläsch",x:33.6,y:868,nl:6},{name:"Churwalden",x:32.0,y:2147,nl:10},{name:"Untervaz",x:31.9,y:2675,nl:8},{name:"Tschappina",x:31.4,y:140,nl:10},{name:"Furna",x:29.6,y:203,nl:5},{name:"Conters im Prättigau",x:28.9,y:228,nl:20},{name:"Trimmis",x:28.1,y:3363,nl:7},{name:"Malans",x:27.5,y:2527,nl:6},{name:"Sils im Domleschg",x:26.1,y:966,nl:17},{name:"Jenaz",x:25.5,y:1145,nl:5},{name:"Tschiertschen-Praden",x:25.3,y:293,nl:20},{name:"Fideris",x:24.4,y:618,nl:7},{name:"Jenins",x:22.2,y:948,nl:6},{name:"Luzein",x:22.1,y:1625,nl:6},{name:"Rhäzüns",x:19.8,y:1633,nl:7},{name:"Flerden",x:18.1,y:254,nl:7},{name:"Urmein",x:17.8,y:163,nl:6},{name:"Schmitten (GR)",x:17.2,y:209,nl:14},{name:"Masein",x:17.1,y:532,nl:6},{name:"Domleschg",x:16.2,y:2219,nl:9},{name:"Tamins",x:15.6,y:1215,nl:6},{name:"Felsberg",x:15.1,y:2833,nl:8},{name:"Rongellen",x:9.8,y:61,nl:9},{name:"Avers",x:52.4,y:168,nl:5},{name:"Rheinwald",x:44.3,y:576,nl:9},{name:"Sufers",x:40.4,y:151,nl:6},{name:"Safiental",x:28.0,y:963,nl:9}]},
      {label:"R\u00e4toromanisch",color:"#16803A",points:[{name:"Pontresina",x:86.4,y:2077,nl:10},{name:"Samedan",x:78.5,y:2913,nl:7},{name:"Silvaplana",x:70.1,y:1089,nl:10},{name:"Zuoz",x:57.7,y:1218,nl:4},{name:"Scuol",x:55.2,y:4572,nl:5},{name:"Zernez",x:48.9,y:1579,nl:6},{name:"Surses",x:47.6,y:2424,nl:6},{name:"Bever",x:46.1,y:607,nl:5},{name:"Muntogna da Schons",x:44.7,y:371,nl:18},{name:"Valsot",x:41.7,y:811,nl:6},{name:"Trun",x:41.0,y:1154,nl:4},{name:"Tujetsch",x:39.6,y:1171,nl:8},{name:"Schluein",x:36.8,y:612,nl:8},{name:"Falera",x:34.6,y:627,nl:6},{name:"S-chanf",x:32.7,y:706,nl:7},{name:"Medel (Lucmagn)",x:31.7,y:328,nl:15},{name:"Lumnezia",x:30.2,y:2072,nl:8},{name:"La Punt Chamues-ch",x:29.2,y:732,nl:18},{name:"Sumvitg",x:29.0,y:1079,nl:7},{name:"Madulain",x:28.4,y:197,nl:8},{name:"Trin",x:17.1,y:1525,nl:4},{name:"Sagogn",x:9.4,y:766,nl:6},{name:"Val Müstair",x:61.1,y:1422,nl:11}]},
      {label:"Italienischsprachig",color:"#B5001E",points:[{name:"Bregaglia",x:52.7,y:1578,nl:9},{name:"Brusio",x:67.5,y:1105,nl:6},{name:"Grono",x:60.6,y:1556,nl:5},{name:"Poschiavo",x:47.6,y:3525,nl:9},{name:"San Vittore",x:46.5,y:912,nl:11},{name:"Calanca",x:44.1,y:211,nl:7},{name:"Roveredo (GR)",x:35.2,y:2625,nl:13},{name:"Mesocco",x:34.6,y:1420,nl:7},{name:"Castaneda",x:27.9,y:262,nl:9},{name:"Lostallo",x:27.3,y:850,nl:8},{name:"Soazza",x:26.8,y:332,nl:6},{name:"Cama",x:22.1,y:691,nl:4},{name:"Rossa",x:11.2,y:161,nl:5},{name:"Buseno",x:11.0,y:91,nl:6},{name:"Santa Maria in Calanca",x:5.9,y:119,nl:22}]},
      {label:"Zweisprachig",color:"#8B6914",points:[{name:"Bergün Filisur",x:45.6,y:901,nl:14},{name:"Obersaxen Mundaun",x:42.4,y:1148,nl:17},{name:"Sils im Engadin/Segl",x:122.9,y:708,nl:20},{name:"Vaz/Obervaz",x:80.4,y:2742,nl:11},{name:"Celerina/Schlarigna",x:52.7,y:1411,nl:19},{name:"Ilanz/Glion",x:49.6,y:5030,nl:11},{name:"Disentis/Mustér",x:44.0,y:2080,nl:15},{name:"Domat/Ems",x:39.5,y:8286,nl:9},{name:"Albula/Alvra",x:36.7,y:1313,nl:12},{name:"Breil/Brigels",x:32.5,y:1713,nl:13},{name:"Lantsch/Lenz",x:26.7,y:528,nl:12}]}
    ],
      xLabel: 'VZÄ / 100 Einw.',
      yLabel: 'Wohnbevölkerung'
    },
    keyFacts: [
      { number: '22', label: 'Zeichen', context: '"Santa Maria in Calanca" — längster Gemeindename GR' },
      { number: '4', label: 'Zeichen', context: '7 Gemeinden: Cama, Chur, Laax, Trin, Trun, Vals, Zuoz' },
      { number: '8.8', label: 'Zeichen Ø', context: 'Durchschnittliche Länge aller 101 Gemeindenamen' }
    ],
    analysis: [
      'Die Blase zeigt es direkt: Chur (4 Zeichen) ist dominierend gross — aber kurz benannt. St. Moritz (10 Zeichen) ist wirtschaftlich aktiv (144 VZÄ/100 EW) und eher mittelgross. Santa Maria in Calanca (22 Zeichen) hingegen ist winzig, arm an Arbeitsplätzen und hat den längsten Namen — ein klassisches Schlafdorf in der Peripherie.',
      'Lange Namen entstehen oft durch Fusionen: "Tschiertschen-Praden" (20 Zeichen) und "Conters im Prättigau" (20 Zeichen) tragen noch zwei Ortschaften im Namen. Zweisprachige Gemeinden führen beide Sprachversionen mit Schrägstrich — Disentis/Mustér, Breil/Brigels — und werden so automatisch länger.',
      'Kurze Namen sind oft die ältesten Toponyme. "Chur" geht auf lateinisch "Curia" zurück, "Trun" und "Zuoz" auf vorrömische Wurzeln. Die vier rätoromanischen 4-Zeichen-Namen (Trin, Trun, Zuoz, Bever) sind sprachwissenschaftliche Fossilien — komprimiert über Jahrhunderte.'
    ],
    chartVariants: [
      {
        type: 'bubble',
        title: 'Namenslänge × Durchschnittsalter — Blasengrösse = Bevölkerung 2024',
        xLabel: 'Durchschnittsalter (Jahre)',
        yLabel: 'Namenslänge (Zeichen)',
        series: [
          {label:'Deutschsprachig',color:'#1E3A5F',points:[
            {name:'St. Moritz',x:43.6,y:10,pop:4997},{name:'Samnaun',x:43.7,y:7,pop:750},{name:'Rothenbrunnen',x:43.7,y:13,pop:304},
            {name:'Arosa',x:44.2,y:5,pop:3159},{name:'Davos',x:43.8,y:5,pop:10774},{name:'Chur',x:44.3,y:4,pop:39177},
            {name:'Laax',x:45.3,y:4,pop:2102},{name:'Landquart',x:43.0,y:9,pop:9244},{name:'Vals',x:45.2,y:4,pop:964},
            {name:'Thusis',x:44.4,y:6,pop:3439},{name:'Maienfeld',x:44.2,y:9,pop:3266},{name:'Grüsch',x:45.5,y:6,pop:2176},
            {name:'Zizers',x:43.7,y:6,pop:3691},{name:'Flims',x:46.0,y:5,pop:2902},{name:'Küblis',x:45.5,y:6,pop:923},
            {name:'Cazis',x:43.7,y:5,pop:2439},{name:'Bonaduz',x:41.6,y:7,pop:3565},{name:'Klosters',x:47.6,y:8,pop:4478},
            {name:'Schiers',x:41.6,y:7,pop:2993},{name:'Fürstenau',x:46.5,y:9,pop:353},{name:'Andeer',x:46.9,y:6,pop:958},
            {name:'Zillis-Reischen',x:45.7,y:15,pop:426},{name:'Ferrera',x:40.3,y:7,pop:76},{name:'Seewis im Prättigau',x:43.0,y:19,pop:1450},
            {name:'Scharans',x:44.3,y:8,pop:836},{name:'Fläsch',x:43.3,y:6,pop:879},{name:'Churwalden',x:42.7,y:10,pop:2114},
            {name:'Untervaz',x:42.0,y:8,pop:2674},{name:'Tschappina',x:48.9,y:10,pop:146},{name:'Furna',x:43.6,y:5,pop:203},
            {name:'Conters im Prättigau',x:45.2,y:20,pop:224},{name:'Trimmis',x:42.9,y:7,pop:3424},{name:'Malans',x:43.9,y:6,pop:2529},
            {name:'Sils im Domleschg',x:44.1,y:17,pop:976},{name:'Jenaz',x:46.4,y:5,pop:1164},{name:'Tschiertschen-Praden',x:47.1,y:20,pop:309},
            {name:'Fideris',x:44.8,y:7,pop:626},{name:'Jenins',x:43.3,y:6,pop:961},{name:'Luzein',x:44.7,y:6,pop:1689},
            {name:'Rhäzüns',x:41.8,y:7,pop:1612},{name:'Flerden',x:42.9,y:7,pop:255},{name:'Urmein',x:52.1,y:6,pop:163},
            {name:'Schmitten (GR)',x:51.6,y:14,pop:205},{name:'Masein',x:41.2,y:6,pop:531},{name:'Domleschg',x:43.9,y:9,pop:2262},
            {name:'Tamins',x:45.0,y:6,pop:1223},{name:'Felsberg',x:40.1,y:8,pop:2886},{name:'Rongellen',x:45.6,y:9,pop:59},
            {name:'Avers',x:44.4,y:5,pop:169},{name:'Rheinwald',x:48.3,y:9,pop:570},{name:'Sufers',x:44.7,y:6,pop:147},{name:'Safiental',x:45.8,y:9,pop:964}
          ]},
          {label:'Rätoromanisch',color:'#16803A',points:[
            {name:'Pontresina',x:45.3,y:10,pop:2072},{name:'Samedan',x:44.7,y:7,pop:2901},{name:'Silvaplana',x:47.5,y:10,pop:1124},
            {name:'Zuoz',x:42.7,y:4,pop:1224},{name:'Scuol',x:47.0,y:5,pop:4546},{name:'Zernez',x:46.2,y:6,pop:1592},
            {name:'Surses',x:48.8,y:6,pop:2465},{name:'Bever',x:45.8,y:5,pop:618},{name:'Muntogna da Schons',x:45.4,y:18,pop:368},
            {name:'Valsot',x:47.5,y:6,pop:801},{name:'Trun',x:47.8,y:4,pop:1141},{name:'Tujetsch',x:49.3,y:8,pop:1199},
            {name:'Schluein',x:44.5,y:8,pop:616},{name:'Falera',x:47.0,y:6,pop:635},{name:'S-chanf',x:44.9,y:7,pop:713},
            {name:'Medel (Lucmagn)',x:51.6,y:15,pop:328},{name:'Lumnezia',x:49.7,y:8,pop:2075},{name:'La Punt Chamues-ch',x:47.8,y:18,pop:750},
            {name:'Sumvitg',x:50.0,y:7,pop:1063},{name:'Madulain',x:49.8,y:8,pop:196},
            {name:'Trin',x:43.8,y:4,pop:1557},{name:'Sagogn',x:45.8,y:6,pop:769},{name:'Val Müstair',x:51.7,y:11,pop:1430}
          ]},
          {label:'Italienischsprachig',color:'#B5001E',points:[
            {name:'Bregaglia',x:48.3,y:9,pop:1591},{name:'Brusio',x:49.7,y:6,pop:1099},{name:'Grono',x:44.7,y:5,pop:1580},
            {name:'Poschiavo',x:46.8,y:9,pop:3505},{name:'San Vittore',x:44.9,y:11,pop:910},{name:'Calanca',x:54.1,y:7,pop:204},
            {name:'Roveredo (GR)',x:44.9,y:13,pop:2656},{name:'Mesocco',x:48.6,y:7,pop:1414},{name:'Castaneda',x:53.3,y:9,pop:254},
            {name:'Lostallo',x:45.4,y:8,pop:866},{name:'Soazza',x:53.3,y:6,pop:324},{name:'Cama',x:43.9,y:4,pop:720},
            {name:'Rossa',x:55.6,y:5,pop:168},{name:'Buseno',x:57.4,y:6,pop:91},{name:'Santa Maria in Calanca',x:57.2,y:22,pop:113}
          ]},
          {label:'Zweisprachig',color:'#8B6914',points:[
            {name:'Bergün Filisur',x:47.5,y:14,pop:898},{name:'Obersaxen Mundaun',x:48.3,y:17,pop:1160},
            {name:'Sils im Engadin/Segl',x:44.0,y:20,pop:708},{name:'Vaz/Obervaz',x:44.7,y:11,pop:2732},
            {name:'Celerina/Schlarigna',x:47.2,y:19,pop:1415},{name:'Ilanz/Glion',x:45.8,y:11,pop:5067},
            {name:'Disentis/Mustér',x:47.1,y:15,pop:2104},{name:'Domat/Ems',x:42.5,y:9,pop:8392},
            {name:'Albula/Alvra',x:47.0,y:12,pop:1354},{name:'Breil/Brigels',x:46.1,y:13,pop:1706},{name:'Lantsch/Lenz',x:47.4,y:12,pop:518}
          ]}
        ]
      },
      {
        type: 'name-buckets',
        title: 'Wie lang sind Graubündner Gemeindenamen? — alle 101 Gemeinden in Töpfen',
        series: [
          {label:'Deutschsprachig',color:'#1E3A5F',names:['St. Moritz','Samnaun','Rothenbrunnen','Arosa','Davos','Chur','Laax','Landquart','Vals','Thusis','Maienfeld','Grüsch','Zizers','Flims','Küblis','Cazis','Bonaduz','Klosters','Schiers','Fürstenau','Andeer','Zillis-Reischen','Ferrera','Seewis im Prättigau','Scharans','Fläsch','Churwalden','Untervaz','Tschappina','Furna','Conters im Prättigau','Trimmis','Malans','Sils im Domleschg','Jenaz','Tschiertschen-Praden','Fideris','Jenins','Luzein','Rhäzüns','Flerden','Urmein','Schmitten (GR)','Masein','Domleschg','Tamins','Felsberg','Rongellen','Avers','Rheinwald','Sufers','Safiental']},
          {label:'Rätoromanisch',color:'#16803A',names:['Pontresina','Samedan','Silvaplana','Zuoz','Scuol','Zernez','Surses','Bever','Muntogna da Schons','Valsot','Trun','Tujetsch','Schluein','Falera','S-chanf','Medel (Lucmagn)','Lumnezia','La Punt Chamues-ch','Sumvitg','Madulain','Trin','Sagogn','Val Müstair']},
          {label:'Italienischsprachig',color:'#B5001E',names:['Bregaglia','Brusio','Grono','Poschiavo','San Vittore','Calanca','Roveredo (GR)','Mesocco','Castaneda','Lostallo','Soazza','Cama','Rossa','Buseno','Santa Maria in Calanca']},
          {label:'Zweisprachig',color:'#8B6914',names:['Bergün Filisur','Obersaxen Mundaun','Sils im Engadin/Segl','Vaz/Obervaz','Celerina/Schlarigna','Ilanz/Glion','Disentis/Mustér','Domat/Ems','Albula/Alvra','Breil/Brigels','Lantsch/Lenz']}
        ]
      }
    ],
    source: 'Statistik Graubünden, DVS/AWT: Beschäftigte/VZÄ (dvs_awt_econ_20250812) 2023; Wohnbevölkerung (dvs_awt_soci_20250507) 2023; Durchschnittsalter: dvs_awt_soci_202502111, 2024'
  },

  {
    id: 'zweitwohnungen',
    ausgabe: 4,
    status: 'ready',
    category: 'Gesellschaft',
    title: '79 von 100 Gemeinden: Graubünden und die Zweitwohnungen',
    lead: 'Die Lex Weber verbietet seit 2012 neue Zweitwohnungen in Gemeinden mit über 20% Anteil. In Graubünden liegt diese Grenze für fast alle Gemeinden weit unter der Realität: 79 von 100 Gemeinden überschreiten die 20%-Schwelle — manche wie Obersaxen Mundaun mit über 81%.',
    chartTitle: 'Zweitwohnungsanteil März 2025 — Höchst- und Tiefstwerte (Top 10 / Bottom 10)',
    chartSubtitle: 'Statistik Graubünden (dvs_awt_soci_20260112) · Quelle: Bundesregister Gebäude und Wohnungen (GWR)',
    chartType: 'bar',
    horizontal: true,
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    staticData: {
      labels: [
        'Obersaxen Mundaun','Calanca','Madulain','Ferrera','Falera',
        'Vaz/Obervaz','Tschappina','Surses','Buseno','Lantsch/Lenz',
        'Fürstenau','Chur','Bonaduz','Fläsch','Zizers',
        'Trimmis','Rongellen','Landquart','Domat/Ems','Felsberg'
      ],
      values: [
        81.06, 79.92, 78.60, 78.53, 78.52,
        76.44, 75.39, 74.81, 74.36, 74.25,
        13.13, 12.04, 11.71, 11.37, 11.14,
        10.18, 8.33, 8.30, 8.21, 7.60
      ],
      unit: '%'
    },
    chartColors: [
      'rgba(181,0,30,0.90)','rgba(181,0,30,0.82)','rgba(181,0,30,0.75)','rgba(181,0,30,0.68)','rgba(181,0,30,0.62)',
      'rgba(181,0,30,0.55)','rgba(181,0,30,0.50)','rgba(181,0,30,0.44)','rgba(181,0,30,0.38)','rgba(181,0,30,0.33)',
      'rgba(30,58,95,0.33)','rgba(30,58,95,0.38)','rgba(30,58,95,0.44)','rgba(30,58,95,0.50)','rgba(30,58,95,0.55)',
      'rgba(30,58,95,0.62)','rgba(30,58,95,0.68)','rgba(30,58,95,0.75)','rgba(30,58,95,0.82)','rgba(30,58,95,0.90)'
    ],
    keyFacts: [
      { number: '79%', label: 'über Lex-Weber-Grenze', context: '79 von 100 Gemeinden liegen über 20% Zweitwohnungsanteil' },
      { number: '81%', label: 'Höchstwert GR', context: 'Obersaxen Mundaun — 4 von 5 Wohnungen sind Ferienwohnungen' },
      { number: '7.6%', label: 'Tiefstwert GR', context: 'Felsberg — am stärksten dauerhaft bewohnte Gemeinde GR' }
    ],
    analysis: [
      'Graubünden ist der Kanton mit dem schweizweit höchsten Zweitwohnungsanteil. Die Lex Weber (Volksinitiative 2012, in Kraft 2016) begrenzt Neubauten auf Gemeinden mit unter 20% Feriendomizilen — trifft aber faktisch kaum jemanden in GR. Spitzenreiter Obersaxen Mundaun liegt bei 81%: Von knapp 2\'800 Wohneinheiten sind nur rund 530 dauerhaft bewohnt.',
      'Die tiefsten Quoten finden sich im dicht besiedelten Rheintal: Felsberg (7.6%), Domat/Ems (8.2%), Landquart (8.3%) sind echte Wohnorte. Auch Chur liegt mit 12% deutlich unter dem Kantonsdurchschnitt — obwohl das schon bedeutet, dass jede 8. Wohnung der Kantonshauptstadt leer steht.',
      'Die Entwicklung seit 2017 zeigt ein geteiltes Bild: Grono (Misox) ist organisch unter 20% gefallen — durch Zuzug, nicht durch Regulierung. Fürstenau (Domleschg) halbierte seinen Anteil von 21% auf 13%, vermutlich durch Post-Corona-Zuzug und Wohnsitzwechsel. Auf der anderen Seite legten Brusio (+15.8 Prozentpunkte), Soazza (+14.5 Pp.) und Zillis-Reischen (+14.3 Pp.) stark zu. Der Druck auf den Wohnungsmarkt bleibt in GR ein Dauerthema.'
    ],
    source: 'Statistik Graubünden, dvs_awt_soci_20260112: Zweitwohnungsanteil 2017–2025 (Erhebung März 2025). Quelle: Eidg. Gebäude- und Wohnungsregister (GWR)'
  },

  {
    id: 'schlafdoerfer-arbeitsorte',
    ausgabe: 13,
    status: 'ready',
    category: 'Arbeit',
    title: 'Schlafdörfer & Arbeitsorte — wer pendelt, wer bleibt?',
    lead: 'In 101 Graubündner Gemeinden verteilen sich die Vollzeitäquivalente unterschiedlich über Wohnen und Arbeiten. Manche sind reine Arbeitsorte (höhere Quote), manche Schlafdörfer (tiefe Quote). Die interaktive Grafik zeigt die geografische und ökonomische Gliederung des Kantons 2023.',
    chartTitle: 'Schlafdörfer & Arbeitsorte in Graubünden 2023',
    chartSubtitle: 'Vollzeitäquivalente (VZÄ) pro Einwohner:in · Filterbar und sortierbar · Quelle: Somedia/Kanton GR',
    chartType: 'embedded',
    source: 'Somedia / Kanton Graubünden',
    embedUrl: 'schlafdoerfer_arbeitsorte_gr.html',
    keyFacts: [],
    analysis: [
      'Die interaktive Visualisierung zeigt alle 101 Graubündner Gemeinden, geordnet nach ihrer Quote von Vollzeitäquivalenten pro Einwohner. Gemeinden mit hoher Quote (≥0.8) sind Arbeitsorte — mehr Jobs als Einwohner, Menschen pendeln zu. Gemeinden mit tieferer Quote (<0.3) sind Schlafdörfer — die Menschen arbeiten anderswo.'
    ]
  }

].filter(function(s) { return s.active !== false; }); // end STORIES


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

function parseConcentration(records) {
  if (!records || !records.length) return null;
  const rows = records
    .map(r => ({
      name: detectLabel(r, ['vischnanca', 'gemeinde', 'municipality', 'nom', 'name']),
      pop:  detectValue(r, ['populaziun_permanenta', 'bevoelkerung', 'population', 'einwohner', 'valur'])
    }))
    .filter(r => r.name && r.pop !== null && r.pop > 0)
    .sort((a, b) => b.pop - a.pop);
  if (!rows.length) return null;
  const total = rows.reduce((s, r) => s + r.pop, 0);
  const half  = total / 2;
  let cum = 0, threshold = 0;
  for (let i = 0; i < rows.length; i++) {
    cum += rows[i].pop;
    if (cum >= half) { threshold = i + 1; break; }
  }
  if (!threshold) return null;
  const rest = rows.length - threshold;
  const topRows = rows.slice(0, threshold);
  const listItems = topRows.map(function(r) {
    return '<li>' + r.name + ' (' + r.pop.toLocaleString('de-CH') + ')</li>';
  }).join('');
  const listHtml =
    '<strong>Diese ' + threshold + ' Gemeinden bilden die erste Hälfte (2023):</strong>' +
    '<ul style="columns:2;column-gap:2em;margin:0.5em 0 0;padding-left:1.2em;font-size:0.9em">' +
    listItems + '</ul>';
  return {
    labels: [threshold + ' Gemeinden – erste Hälfte', rest + ' Gemeinden – zweite Hälfte'],
    values: [threshold, rest],
    unit: 'Gemeinden',
    year: new Date().getFullYear(),
    municipalityList: listHtml
  };
}

function parseArbeitsplatzquote(records) {
  if (!records || !records.length) return null;
  const rows = records
    .map(r => ({
      name:  detectLabel(r, ['gemeinde', 'vischnanca', 'municipality', 'nom']),
      jobs:  detectValue(r, ['vzae', 'vollzeitaequivalente', 'fte', 'arbeitsplaetze', 'jobs']),
      pop:   detectValue(r, ['einwohner', 'populaziun_permanenta', 'bevoelkerung', 'population'])
    }))
    .filter(r => r.name && r.jobs !== null && r.pop > 0)
    .map(r => ({ name: r.name, ratio: +(r.jobs / r.pop * 100).toFixed(1) }))
    .sort((a, b) => b.ratio - a.ratio);
  if (!rows.length) return null;
  return {
    labels: rows.map(r => r.name),
    values: rows.map(r => r.ratio),
    unit: 'Arbeitspl. / 100 Einw.',
    year: new Date().getFullYear()
  };
}


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
    } else if (variant.type === 'bubble') {
      var bSeries = (variant.series || []).map(function(s) {
        return {
          label: s.label,
          data: s.points.map(function(p) {
            return { x: p.x, y: p.y, r: Math.max(3, Math.sqrt(p.pop) * 0.1), name: p.name, pop: p.pop };
          }),
          backgroundColor: s.color + '99', borderColor: s.color, borderWidth: 1.5
        };
      });
      chart = new Chart(ctx, {
        type: 'bubble',
        data: { datasets: bSeries },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'top', labels: { font: vBase, color: vMuted, usePointStyle: true, pointStyleWidth: 10, padding: 16 } },
            tooltip: {
              backgroundColor: '#161616', padding: 12,
              titleFont: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' },
              bodyFont: vBase,
              callbacks: {
                title: function(items) { return items[0].raw.name; },
                label: function(ctx) {
                  return ['  Namenslänge: '+ctx.raw.y+' Zeichen', '  Ø Alter: '+ctx.raw.x+' Jahre', '  Bevölkerung: '+ctx.raw.pop.toLocaleString('de-CH')];
                }
              }
            }
          },
          scales: {
            x: { title: { display: true, text: variant.xLabel||'X', font: vBase, color: vMuted }, grid: { color: '#E8E4E0' }, ticks: { font: vBase, color: vMuted } },
            y: { title: { display: true, text: variant.yLabel||'Y', font: vBase, color: vMuted }, grid: { color: '#E8E4E0' }, ticks: { font: vBase, color: vMuted, stepSize: 2 }, min: 2, max: 24 }
          }
        }
      });
    } else if (variant.type === 'name-buckets') {
      var bucketData = {};
      var langList = [];
      var langColorNB = {};
      (variant.series || []).forEach(function(s) {
        langList.push(s.label);
        langColorNB[s.label] = s.color;
        (s.names || []).forEach(function(nm) {
          var len = nm.length;
          if (!bucketData[len]) bucketData[len] = {};
          if (!bucketData[len][s.label]) bucketData[len][s.label] = [];
          bucketData[len][s.label].push(nm);
        });
      });
      var allLens = Object.keys(bucketData).map(Number).sort(function(a, b) { return a - b; });
      var nbLabels = allLens.map(function(l) { return l + ' Zeichen'; });
      var nbDatasets = langList.map(function(lang) {
        var _names = allLens.map(function(len) {
          return (bucketData[len] && bucketData[len][lang]) ? bucketData[len][lang] : [];
        });
        return {
          label: lang,
          data: allLens.map(function(len) {
            return (bucketData[len] && bucketData[len][lang]) ? bucketData[len][lang].length : 0;
          }),
          backgroundColor: langColorNB[lang] + 'CC',
          borderColor: langColorNB[lang],
          borderWidth: 1,
          _names: _names
        };
      });
      chart = new Chart(ctx, {
        type: 'bar',
        data: { labels: nbLabels, datasets: nbDatasets },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'top', labels: { font: vBase, color: vMuted, usePointStyle: true, pointStyleWidth: 10, padding: 16 } },
            tooltip: {
              backgroundColor: '#161616', padding: 12,
              titleFont: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' },
              bodyFont: vBase,
              callbacks: {
                title: function(items) { return items[0].label; },
                label: function(ci) {
                  var names = ci.dataset._names[ci.dataIndex];
                  if (!names || !names.length) return null;
                  return [ci.dataset.label + ' (' + names.length + '):'].concat(names.map(function(n) { return '  ' + n; }));
                }
              }
            }
          },
          scales: {
            x: { stacked: true, title: { display: true, text: 'Anzahl Gemeinden', font: vBase, color: vMuted }, grid: { color: '#E8E4E0' }, ticks: { font: vBase, color: vMuted, stepSize: 1 } },
            y: { stacked: true, grid: { color: '#E8E4E0' }, ticks: { font: vBase, color: vMuted } }
          }
        }
      });
    } else if (variant.type === 'half-split') {
      var halfColor = function(i, n) {
        var stops = [[37,99,235],[6,182,212],[16,185,129],[234,179,8],[249,115,22],[220,38,38]];
        var t = i / Math.max(n - 1, 1);
        var seg = t * (stops.length - 1);
        var si = Math.floor(seg), f = seg - si;
        var a = stops[Math.min(si, stops.length - 1)];
        var b = stops[Math.min(si + 1, stops.length - 1)];
        return 'rgb(' + Math.round(a[0]+(b[0]-a[0])*f) + ',' + Math.round(a[1]+(b[1]-a[1])*f) + ',' + Math.round(a[2]+(b[2]-a[2])*f) + ')';
      }
      var top = variant.top;
      var total = top.reduce(function(s, m) { return s + m.pop; }, 0) + variant.rest;
      var datasets = top.map(function(m, i) {
        return { label: m.name, data: [m.pop, null], backgroundColor: halfColor(i, top.length), borderWidth: 0, borderSkipped: false };
      });
      datasets.push({ label: '88 übrige Gemeinden', data: [null, variant.rest], backgroundColor: '#B8B4AE', borderWidth: 0, borderSkipped: false });
      chart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['13 grösste Gemeinden', '88 übrige Gemeinden'], datasets: datasets },
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
                  var v = ctx.raw; if (v == null) return null;
                  return '  ' + ctx.dataset.label + ': ' + v.toLocaleString('de-CH') + ' (' + (v/total*100).toFixed(1) + ' %)';
                }
              }
            }
          },
          scales: {
            x: { stacked: true, grid: { color: '#E8E4E0' }, ticks: { font: vBase, color: vMuted, callback: function(v) { return (v/1000).toFixed(0)+'k'; } } },
            y: { stacked: true, grid: { display: false }, ticks: { font: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' }, color: '#161616' } }
          }
        }
      });
    } else if (variant.type === 'treemap') {
      var scheme = variant.colorScheme || 'split13';
      var items = TREEMAP_101;
      var n101 = items.length;
      var treemapColor = function(item) {
        var i = items.indexOf(item);
        if (scheme === 'gradient') {
          var t = i / Math.max(n101 - 1, 1);
          return 'rgb(' + Math.round(30+t*163) + ',' + Math.round(58+t*155) + ',' + Math.round(95+t*138) + ')';
        }
        if (scheme === 'mono') { return '#1E3A5F'; }
        // split13: Chur dark, top 13 medium, rest gray
        if (i === 0) return '#1E3A5F';
        if (i < 13)  return '#2A5A8F';
        return '#B8B4AE';
      };
      chart = new Chart(ctx, {
        type: 'treemap',
        data: {
          datasets: [{
            label: variant.title,
            tree: items,
            key: 'v',
            backgroundColor: function(ctx) {
              if (!ctx.raw || !ctx.raw._data) return '#B8B4AE';
              return treemapColor(ctx.raw._data);
            },
            borderWidth: 1,
            borderColor: '#fff',
            captions: {
              display: true,
              color: scheme === 'gradient' ? '#fff' : (scheme === 'mono' ? '#fff' : '#fff'),
              font: { size: 11, family: "'Inter', system-ui, sans-serif" },
              formatter: function(ctx) {
                if (!ctx.raw || !ctx.raw._data) return '';
                return ctx.raw.v > 2000 ? ctx.raw._data.n : '';
              }
            }
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#161616', padding: 12,
              callbacks: {
                title: function(items) { return items[0] && items[0].raw._data ? items[0].raw._data.n : ''; },
                label: function(ctx) { return '  ' + (ctx.raw.v || 0).toLocaleString('de-CH') + ' Einwohner'; }
              }
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
  const isHorizontal = !!(story.horizontal);
  const tooltipCfg = {
    backgroundColor: '#161616',
    titleFont: { ...baseFont, size: 13, weight: '600' },
    bodyFont: { ...baseFont },
    padding: 12,
    callbacks: {
      label: function(ctx) {
        const v = type === 'doughnut'
          ? ctx.parsed
          : (isHorizontal ? ctx.parsed.x : ctx.parsed.y);
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

  // ---- BAR (vertical or horizontal) ----
  if (type === 'bar') {
    // Per-bar colors: prefer story.chartColors array, then palette/gradient fallback
    const useMultiColor = d.labels.length <= 4;
    const barColors = story.chartColors
      ? story.chartColors
      : d.labels.map((_, i) => {
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
        indexAxis: isHorizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: tooltipCfg
        },
        scales: {
          x: {
            grid: { color: GRID },
            ticks: { font: baseFont, color: MUTED, maxRotation: isHorizontal ? 0 : 45 },
            beginAtZero: isHorizontal ? true : undefined
          },
          y: {
            grid: { color: GRID },
            ticks: { font: baseFont, color: MUTED },
            beginAtZero: isHorizontal ? undefined : true
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
    return;
  }

  // ---- BUBBLE ----
  if (type === 'bubble') {
    const series = (d.series || []).map(function(s) {
      return {
        label: s.label,
        data: s.points.map(function(p) {
          return { x: p.x, y: p.y, r: Math.max(3, Math.sqrt(p.nl) * 2.8), name: p.name, nl: p.nl };
        }),
        backgroundColor: s.color + '99',
        borderColor: s.color,
        borderWidth: 1.5,
        hoverRadius: 4
      };
    });
    activeChart = new Chart(ctx, {
      type: 'bubble',
      data: { datasets: series },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { font: baseFont, color: MUTED, usePointStyle: true, pointStyleWidth: 10, padding: 16 }
          },
          tooltip: {
            backgroundColor: '#161616',
            titleFont: { family: "'Inter', system-ui, sans-serif", size: 13, weight: '600' },
            bodyFont: baseFont,
            padding: 12,
            callbacks: {
              title: function(items) { return items[0].raw.name; },
              label: function(ctx) {
                return [
                  '  Name: ' + ctx.raw.nl + ' Zeichen',
                  '  VZÄ/100 EW: ' + ctx.raw.x,
                  '  Einwohner: ' + ctx.raw.y.toLocaleString('de-CH')
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: d.xLabel || 'X', font: baseFont, color: MUTED },
            grid: { color: GRID },
            ticks: { font: baseFont, color: MUTED },
            beginAtZero: true
          },
          y: {
            type: 'logarithmic',
            title: { display: true, text: d.yLabel || 'Y', font: baseFont, color: MUTED },
            grid: { color: GRID },
            ticks: {
              font: baseFont, color: MUTED,
              callback: function(v) { return v >= 1000 ? (v/1000).toFixed(0)+'k' : v; }
            }
          }
        }
      }
    });
    return;
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
  setEl('story-publish-date', s.ausgabe ? 'Ausgabe ' + s.ausgabe : '');


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
  // Special case: embedded visualizations (links to external pages)
  if (s.chartType === 'embedded' && s.embedUrl) {
    const chartArea = document.querySelector('.chart-area');
    if (chartArea) {
      chartArea.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:400px;background:#f5f5f0;border-radius:8px;flex-direction:column;gap:20px;"><p style="font-size:16px;color:#666;text-align:center;">Interaktive Visualisierung</p><a href="' + s.embedUrl + '" target="_blank" style="padding:12px 24px;background:#1E3A5F;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Zur vollständigen Visualisierung →</a></div>';
    }
    setDataBadge('live', 'Interaktive Visualisierung');
  } else if (s.staticData) {
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

  // Copy chart data as TSV (for Datawrapper)
  const copyBtn = document.getElementById('copy-data-btn');
  const copyConfirm = document.getElementById('copy-confirm');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      const s = STORIES[currentIndex];
      const d = s.staticData;
      if (!d || !d.labels || !d.values) return;
      const tsv = 'Gemeinde\t' + (d.unit || 'Wert') + '\n' +
        d.labels.map(function(l, i) { return l + '\t' + d.values[i]; }).join('\n');
      navigator.clipboard.writeText(tsv).then(function() {
        if (copyConfirm) {
          copyConfirm.hidden = false;
          setTimeout(function() { copyConfirm.hidden = true; }, 2000);
        }
      });
    });
  }

  // Handle browser back/forward
  window.addEventListener('hashchange', function() {
    const h   = window.location.hash.slice(1);
    const idx = STORIES.findIndex(function(s) { return s.id === h; });
    if (idx >= 0 && idx !== currentIndex) renderStory(idx);
  });

})();

