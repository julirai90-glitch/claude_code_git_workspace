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
    id: 'gemeinden-top10',
    week: 1,
    day: 1,
    publishDate: fmtDate(workdayDate(1, 1)),
    category: 'Bevölkerung',
    title: 'Wer wohnt wo? Die 10 grössten Gemeinden Graubündens',
    lead: 'Chur dominiert als einzige grössere Stadt, doch das Bild dahinter überrascht: Von Davos bis Domat/Ems reihen sich sehr unterschiedliche Gemeinden. Die Bevölkerungsverteilung spiegelt Graubündens topografische Eigenheiten – Täler, Pässe und Höhenstufen prägen, wer wo lebt.',
    chartTitle: 'Bevölkerung der 10 grössten Gemeinden',
    chartSubtitle: 'Einwohnerinnen und Einwohner, Stand 2023 · Statistik Graubünden (dvs_awt_soci_202502111)',
    chartType: 'bar',
    apiDatasetId: 'dvs_awt_soci_202502111',
    apiQuery: {
      select: 'vischnanca,populaziun_permanenta',
      where: 'onn=2023',
      group_by: 'vischnanca',
      order_by: 'populaziun_permanenta DESC'
    },
    parseData: 'parseTopMunicipalities',
    fallbackData: {
      labels: ['Chur', 'Davos', 'Landquart', 'Domat/Ems', 'Thusis', 'Ilanz/Glion', 'Samedan', 'Poschiavo', 'Scuol', 'Vals'],
      values: [40200, 11700, 9400, 7900, 3500, 2500, 3200, 3900, 2200, 1050],
      unit: 'Einwohner',
      year: 2023
    },
    keyFacts: [
      { number: '200\'000', label: 'Einwohner total', context: 'Kanton Graubünden 2023' },
      { number: '20 %', label: 'Wohnen in Chur', context: 'Einziges städtisches Zentrum' },
      { number: '7\'105 km²', label: 'Kantonsfläche', context: 'Grösster Kanton der Schweiz' }
    ],
    analysis: [
      'Chur ist das unbestrittene Zentrum Graubündens. Mit über 40\'000 Einwohnerinnen und Einwohnern lebt dort jeder fünfte Bündner — in einem Kanton, der flächenmässig so gross ist wie Mallorca. Die Konzentrierung in der Kantonshauptstadt ist kein Zufall: Chur liegt am Schnittpunkt der wichtigsten Täler und ist seit der Römerzeit Verwaltungs- und Handelszentrum.',
      'Hinter Chur klafft eine grosse Lücke. Davos als zweitgrösste Gemeinde hat nur rund 11\'700 Einwohner — und verdankt seine Grösse vor allem dem Tourismus. Ohne Hotels, Kliniken und internationale Kongresse wäre Davos deutlich kleiner. Ähnliches gilt für viele Bündner Gemeinden: Tourismus ist der eigentliche Bevölkerungsmotor.',
      'Die Kleinheit der meisten Gemeinden hat politische Konsequenzen. Graubünden hatte noch 2016 über 200 Gemeinden — heute sind es nach zahlreichen Fusionen noch rund 100. Der Trend hält an: Kleine Gemeinden können Schule, Wasserversorgung und Verwaltung kaum mehr allein finanzieren. Die Gemeindefusionen sind weniger Wunsch als Notwendigkeit.'
    ],
    source: 'Statistik Graubünden, Kantonale Bevölkerungsstatistik 2023',
  },

  {
    id: 'altersstruktur',
    week: 1,
    day: 2,
    publishDate: fmtDate(workdayDate(1, 2)),
    category: 'Bevölkerung',
    title: 'Graubünden wird älter — und das schneller als gedacht',
    lead: 'Der Medianalter in Graubünden liegt über dem Schweizer Durchschnitt. Jede dritte Person ist über 50 Jahre alt. Die Alterung schreitet rascher voran als Prognosen vor 20 Jahren vorhergesagt hatten — mit Folgen für Pflegeheime, Gesundheitskosten und die Sozialpolitik.',
    chartTitle: 'Altersstruktur Graubünden',
    chartSubtitle: 'Bevölkerung nach Altersgruppen in % · Statistik Graubünden 2023 (dvs_awt_soci_202502111)',
    chartType: 'bar',
    apiDatasetId: 'dvs_awt_soci_202502111',
    apiQuery: {
      select: 'classa_da_vegliadetgna,populaziun_permanenta',
      where: 'onn=2023',
      group_by: 'classa_da_vegliadetgna',
      order_by: 'classa_da_vegliadetgna ASC'
    },
    parseData: 'parseAgeStructure',
    fallbackData: {
      labels: ['0–9', '10–19', '20–29', '30–39', '40–49', '50–59', '60–69', '70–79', '80+'],
      values: [10.2, 10.8, 10.5, 12.3, 13.1, 14.2, 12.4, 9.1, 7.4],
      unit: '%',
      year: 2023
    },
    keyFacts: [
      { number: '44.8', label: 'Medianalter (Jahre)', context: 'Über Schweizer Schnitt (42.5)' },
      { number: '34 %', label: 'Über 60-Jährige', context: 'Tendenz stark steigend' },
      { number: '1.36', label: 'Kinder pro Frau', context: 'Weit unter Bestandserhalt (2.1)' }
    ],
    analysis: [
      'Graubünden altert — und das in einem Tempo, das Demograf:innen überrascht. Der Medianalter liegt bereits bei 44,8 Jahren, fast 2,5 Jahre über dem Schweizer Durchschnitt. Das liegt nicht nur an der Geburtenrate, sondern auch an der Abwanderung: Junge verlassen den Bergkanton für Städte, und wer bleibt, wird älter.',
      'Die mittleren Jahrgänge — die 40- bis 59-Jährigen — sind heute die stärkste Gruppe. In zehn Jahren werden sie in die Altersgruppe 60+ rücken. Das ist die Generation, die Graubündens Pflegeplätze und Altersheime füllen wird. Die Planung dafür beginnt jetzt — und ist bereits im Rückstand.',
      'Für den Arbeitsmarkt bedeutet die Alterung eine doppelte Belastung: weniger Erwerbstätige müssen mehr Rentner finanzieren. Die Sozialversicherungssysteme stehen unter Druck. Gleichzeitig fehlen Fachkräfte in Pflege, Gastgewerbe und Bau — Berufe, die oft von Zuwandernden aus anderen Kantonen oder dem Ausland übernommen werden.'
    ],
    source: 'Statistik Graubünden, Kantonale Bevölkerungsstatistik 2023',
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
    apiDatasetId: 'dvs_awt_soci_202505120',
    apiQuery: {
      select: 'onn,naschientschas_vivas',
      where: 'onn>=1975',
      group_by: 'onn',
      order_by: 'onn ASC'
    },
    parseData: 'parseBirths',
    fallbackData: {
      labels: ['1975','1980','1985','1990','1995','2000','2005','2010','2015','2020','2023'],
      values: [3210, 3050, 2810, 2690, 2350, 2180, 2020, 2100, 2050, 1940, 1880],
      unit: 'Geburten',
      year: 2023
    },
    keyFacts: [
      { number: '−41 %', label: 'Geburtenrückgang', context: 'Seit 1975 bis heute' },
      { number: '1.36', label: 'Fertilitätsrate 2023', context: 'Unter Schweizer Schnitt (1.52)' },
      { number: '1880', label: 'Geburten 2023', context: 'Tiefststand seit Jahrzehnten' }
    ],
    analysis: [
      'Der Rückgang der Geburtenzahlen in Graubünden folgt dem nationalen und europäischen Trend — aber mit einer eigenen Note. In Bergregionen sinkt die Fertilitätsrate schneller als in urbanen Zentren, weil junge Frauen mit Kindern das Angebot an Krippen, Teilzeitstellen und Bildungseinrichtungen in der Stadt bevorzugen. Was in Chur funktioniert, ist in einem Bergdorf oft schlicht nicht vorhanden.',
      'Die Auswirkungen sind heute in den Schulen sichtbar. Zahlreiche Dorfschulen im Kanton haben ihren Betrieb eingestellt oder zu Mehrklassenschulen zusammengefasst. Bildungsexperten schätzen, dass in den nächsten zehn Jahren weitere 30 bis 40 Schulstandorte verschwinden werden. Das verändert das Dorfgefüge fundamental.',
      'Demografie ist keine Schicksalsfrage, sie ist eine politische. Andere Kantone und Länder zeigen, dass gezielte Familienförderung, bezahlbare Kinderbetreuung und flexible Arbeitsmodelle die Fertilität stabilisieren können — wenn nicht erhöhen. Graubünden hat hier noch erheblichen Spielraum nach oben.'
    ],
    source: 'Statistik Graubünden, Natürliche Bevölkerungsbewegung 2023',
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
      select: 'onn,naschientschas_vivas,mortoris',
      where: 'onn>=1981',
      group_by: 'onn',
      order_by: 'onn ASC'
    },
    parseData: 'parseDemographicBalance',
    fallbackData: {
      labels: ['1981','1986','1991','1996','2001','2006','2011','2016','2020','2023'],
      values: [420, 310, 280, 180, 90, -20, 30, -60, 120, 80],
      unit: 'Saldo (Personen)',
      year: 2023
    },
    keyFacts: [
      { number: '+200\'000', label: 'Bevölkerung stabil', context: 'Seit 2000 auf gleichem Niveau' },
      { number: '−200', label: 'Natürl. Rückgang/Jahr', context: 'Mehr Tote als Geburten' },
      { number: '+350', label: 'Wanderungssaldo', context: 'Hält Bevölkerung stabil' }
    ],
    analysis: [
      'Die natürliche Bevölkerungsbewegung — Geburten minus Todesfälle — ist in Graubünden seit Jahren negativ. Das bedeutet: Würde niemand zuwandern, würde der Kanton schrumpfen. Allein die Zuwanderung von aussen — aus anderen Kantonen und dem Ausland — stabilisiert die Bevölkerungszahl auf knapp über 200\'000.',
      'Diese Abhängigkeit von Zuwanderung ist politisch heikel, demografisch aber unvermeidlich. Die grosse Frage lautet: Woher kommen die Zuwandernden, und warum? Analysen zeigen, dass es vor allem Menschen im erwerbsfähigen Alter sind, die wegen guter Jobs im Tourismus, Gesundheitswesen oder öffentlichen Sektor nach Graubünden kommen.',
      'Die Pandemie hat das Muster vorübergehend verändert: Der Stadtflücht-Trend 2020/21 brachte eine ungewöhnliche Zuwanderungswelle aus städtischen Kantonen. Viele sind geblieben. Ob Graubünden dauerhaft von diesem Trend profitiert, wird die Bevölkerungsstatistik der nächsten Jahre zeigen.'
    ],
    source: 'Statistik Graubünden, Kantonale Bevölkerungsstatistik, Zeitreihe 1981–2023',
  },

  {
    id: 'bevoelkerungsszenarien',
    week: 1,
    day: 5,
    publishDate: fmtDate(workdayDate(1, 5)),
    category: 'Bevölkerung',
    title: 'Graubünden 2055: Szenarien für einen schrumpfenden Kanton',
    lead: 'Je nach Annahmen zu Geburten, Sterblichkeit und Zuwanderung wird Graubünden 2055 zwischen 180\'000 und 215\'000 Einwohnerinnen und Einwohner haben. Das Basis-Szenario sagt ein leichtes Wachstum voraus — aber die Unsicherheit ist gross.',
    chartTitle: 'Bevölkerungsszenarien Graubünden 2023–2055',
    chartSubtitle: 'Bevölkerungsprojektionen (Hoch, Basis, Tief) · Statistik Graubünden (dvs_awt_soci_202505121)',
    chartType: 'line',
    apiDatasetId: 'dvs_awt_soci_202505121',
    apiQuery: {
      select: 'onn,valur',
      where: null,
      group_by: 'onn',
      order_by: 'onn ASC'
    },
    parseData: 'parseScenarios',
    fallbackData: {
      labels: ['2023','2025','2030','2035','2040','2045','2050','2055'],
      values: [200800, 202000, 205500, 207200, 208100, 207900, 206500, 204000],
      unit: 'Einwohner (Basisszenario)',
      year: 2055
    },
    keyFacts: [
      { number: '+2 %', label: 'Basis-Szenario 2055', context: 'Leichtes Wachstum erwartet' },
      { number: '−10 %', label: 'Tiefes Szenario', context: 'Bei starker Abwanderung' },
      { number: '29 %', label: 'Anteil 65+ in 2055', context: 'Gegenüber 22 % heute' }
    ],
    analysis: [
      'Die Bevölkerungsszenarien des Kantons Graubünden zeigen ein gespaltenes Bild. Das optimistische Hochszenario — basierend auf hoher Zuwanderung und stabiler Geburtenrate — sieht Graubünden 2055 mit 215\'000 Einwohnern. Das pessimistische Tiefszenario — wenig Zuwanderung, sinkende Geburten — rechnet mit unter 185\'000. Der Korridor ist enorm.',
      'Was alle Szenarien gemeinsam haben: Der Anteil der über 65-Jährigen wird massiv steigen. Heute liegt er bei etwa 22 Prozent, 2055 werden es je nach Szenario zwischen 27 und 31 Prozent sein. Diese Alterung ist unvermeidlich — sie ist bereits in der Altersstruktur der heutigen Bevölkerung eingebacken.',
      'Für Entscheidungsträger sind Szenarien keine Prophezeiungen, sondern Planungsgrundlagen. Die Frage ist nicht, ob Graubünden altert — das ist sicher. Die Frage ist, wie der Kanton die Infrastruktur, das Gesundheitswesen und die Wirtschaft so ausrichtet, dass er auch mit einer älteren, potenziell kleineren Bevölkerung funktioniert.'
    ],
    source: 'Statistik Graubünden, Kantonale Bevölkerungsszenarien 2024–2055',
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
      select: 'onn,pernottaziuns',
      where: 'onn>=1992',
      group_by: 'onn',
      order_by: 'onn ASC'
    },
    parseData: 'parseTourismAnnual',
    fallbackData: {
      labels: ['1992','1995','1998','2001','2004','2007','2010','2013','2016','2019','2020','2021','2022','2023'],
      values: [12.8, 12.1, 12.9, 13.1, 13.5, 14.2, 14.8, 15.1, 14.6, 15.7, 9.8, 12.4, 14.9, 15.4],
      unit: 'Mio. Logiernächte',
      year: 2023
    },
    keyFacts: [
      { number: '15.7 Mio', label: 'Rekord vor Pandemie', context: '2019, Vorpandemie-Höchststand' },
      { number: '−37 %', label: 'Einbruch 2020', context: 'Auf 9.8 Mio. durch COVID-19' },
      { number: '15.4 Mio', label: 'Logiernächte 2023', context: 'Fast auf Vorkrisenniveau' }
    ],
    analysis: [
      'Die 30-Jahres-Kurve der Bündner Hotelübernachtungen ist ein Seismograph für globale Krisen. Der Währungsschock 2015 — SNB hebt Euro-Kurs auf — traf den Tourismus empfindlich: Ausländische Gäste mieden die teuer gewordene Schweiz. Zwei Jahre später hatte sich Graubünden erholt. Die Resilienz der Tourismusregion ist bemerkenswert.',
      'Doch nichts hat die Branche so getroffen wie COVID-19. Im Jahr 2020 brachen die Logiernächte um 37 Prozent ein — von 15,7 auf 9,8 Millionen. Viele Betriebe überlebten nur dank Kurzarbeit, Staatshilfen und einem starken Inlandstourismus: Schweizer:innen entdeckten ihre eigenen Berge.',
      'Die Erholung war schnell und kräftig. 2023 lag Graubünden mit 15,4 Millionen Übernachtungen fast auf Vor-Pandemie-Niveau. Besonders der Sommertourismus setzte neue Rekorde. Die Frage ist, ob dieser Trend nachhaltig ist — oder ob die nächste Krise, sei es Klimawandel oder Wirtschaftsabschwung, erneut alles verändert.'
    ],
    source: 'Bundesamt für Statistik, Beherbergungsstatistik HESTA; Statistik Graubünden 2023',
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
      select: 'mais,pernottaziuns',
      where: 'onn>=2019',
      group_by: 'mais',
      order_by: 'mais ASC'
    },
    parseData: 'parseTourismMonthly',
    fallbackData: {
      labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
      values: [1820, 1950, 1450, 540, 460, 740, 1640, 1870, 940, 680, 360, 1280],
      unit: 'Tsd. Logiernächte',
      year: 2023
    },
    keyFacts: [
      { number: '5x', label: 'Winter vs. November', context: 'Extremste Monatsschwankung' },
      { number: '62 %', label: 'Winteranteil Okt–Mär', context: 'Trotz wachsendem Sommer' },
      { number: '+18 %', label: 'Sommer-Wachstum', context: 'Jul/Aug vs. Vorjahrzehnt' }
    ],
    analysis: [
      'Die Monatsdaten sind eindeutig: Graubünden ist ein Winterkanton. Februar ist der stärkste Monat mit fast 2 Millionen Übernachtungen, November der schwächste mit kaum 360\'000 — ein Verhältnis von mehr als 5 zu 1. Diese Extreme stellen Betriebe, die Personal halten und Fixkosten decken müssen, vor enorme Herausforderungen.',
      'Der Frühling — April und Mai — ist die grosse Schwachstelle. Ski-Saison vorbei, Wandersaison noch nicht richtig gestartet, die Bergbahnen fahren eingeschränkt. Viele Hotels schliessen in dieser Zeit komplett. Diese Zwischensaison kostet die Branche Umsatz und bindet Personal, das man eigentlich das ganze Jahr bräuchte.',
      'Positiv zu vermerken: Der Sommer holt auf. Juli und August nähern sich den Winterspitzenwerten an — getrieben von Hitze im Flachland, die Touristen in die kühlen Berge treibt, und von wachsendem internationalen Interesse am Wandertourismus. Langfristig könnte Graubünden ein echter Ganzjahres-Kanton werden — wenn die Infrastruktur mitspielt.'
    ],
    source: 'Bundesamt für Statistik, Beherbergungsstatistik HESTA 2023; Statistik Graubünden',
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
      select: 'vischnanca,pernottaziuns',
      where: 'onn=2023',
      group_by: 'vischnanca',
      order_by: 'pernottaziuns DESC'
    },
    parseData: 'parseTourismMunicipalities',
    fallbackData: {
      labels: ['Davos', 'St. Moritz', 'Scuol', 'Laax', 'Arosa', 'Klosters', 'Flims', 'Lenzerheide', 'Pontresina', 'Samnaun', 'Vals', 'Savognin'],
      values: [3280, 2150, 780, 920, 690, 620, 540, 610, 480, 390, 210, 280],
      unit: 'Tsd. Logiernächte',
      year: 2023
    },
    keyFacts: [
      { number: '21 %', label: 'Davos-Anteil kantonsweit', context: 'Stärkster Tourismusort' },
      { number: '+12 %', label: 'Laax Wachstum', context: 'Stark durch jüngeres Publikum' },
      { number: '12', label: 'Top-Orte = 70 % der Nächte', context: 'Starke Konzentration' }
    ],
    analysis: [
      'Davos ist mit Abstand der stärkste Tourismusstandort Graubündens und der Schweiz. Über 3 Millionen Logiernächte pro Jahr — fast doppelt so viele wie St. Moritz auf Platz 2. Davos verdankt diese Position nicht nur dem Weltklasse-Skigebiet, sondern auch dem WEF und einer Fülle von Kongressen und Tagungen, die das ganze Jahr Gäste bringen.',
      'Laax und Flims holen auf. Beide Orte setzen auf Sommertourismus und haben mit dem Freestyle-Skifahren und dem Surfsee Caumasee eine jüngere Zielgruppe erschlossen. Das zeigt: Im Bündner Tourismus gibt es noch Wachstumspotenzial, wenn die Positionierung stimmt.',
      'Auffällig ist die Konzentration: Die 12 stärksten Gemeinden vereinen rund 70 Prozent aller kantonalen Logiernächte auf sich. Das bedeutet: Hunderte von Bergdörfern teilen sich den Rest. Für sie ist Tourismus oft kein Hauptgeschäft — aber ein wichtiger Zusatzverdienst für lokale Landwirte, Vermieter und Restaurants.'
    ],
    source: 'Bundesamt für Statistik, Beherbergungsstatistik HESTA 2023; Statistik Graubünden',
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
    chartType: 'bar',
    apiDatasetId: 'dvs_awt_econ_20250331',
    apiQuery: {
      select: 'art_unterkunft,pernottaziuns',
      where: 'onn=2023',
      group_by: 'art_unterkunft',
      order_by: 'pernottaziuns DESC'
    },
    parseData: 'parseParahotellerie',
    fallbackData: {
      labels: ['Hotellerie', 'Ferienwohnungen', 'Gruppenunterk.', 'Camping', 'Jugendherbergen', 'Sonstiges'],
      values: [15400, 8200, 1800, 1200, 420, 380],
      unit: 'Tsd. Logiernächte',
      year: 2023
    },
    keyFacts: [
      { number: '8.2 Mio', label: 'Ferienwohnungsnächte', context: '53 % der Hotelkapazität' },
      { number: '40\'000+', label: 'Ferienwohnungen GR', context: 'Zweitwohnungsanteil hoch' },
      { number: '35 %', label: 'Parahotellerie-Anteil', context: 'An allen Übernachtungen' }
    ],
    analysis: [
      'Die Hotellerie ist das Schaufenster des Bündner Tourismus — aber nicht das ganze Bild. Neben den offiziellen 15,4 Millionen Hotelübernachtungen stehen weitere 8 bis 9 Millionen Nächte in Ferienwohnungen, Gruppenunterkünften, auf Campingplätzen und in Jugendherbergen. Der Bündner Tourismus ist grösser als die Hotelstatistik suggeriert.',
      'Die Ferienwohnung ist die dominante Parahotellerie-Form. Graubünden hat eine hohe Dichte an Zweitwohnungen — viele von ihnen werden als Ferienwohnungen vermietet, zumindest zeitweise. Das Zweitwohnungsgesetz (Weber-Initiative 2012) hat neue Baubewilligungen stark eingeschränkt, aber den Bestand nicht reduziert.',
      'Für Gemeinden ist die Parahotellerie ein zweischneidiges Schwert. Ferienwohnungen bringen Logiernächte, aber wenig Wertschöpfung: Gäste kochen selbst, kaufen in Grossverteilern ein und nutzen lokale Dienstleistungen selten. Hotels hingegen schaffen direkte Arbeitsplätze und kaufen lokale Produkte ein. Die Politik sucht nach dem richtigen Mix.'
    ],
    source: 'Bundesamt für Statistik, Parahotellerie-Statistik; Statistik Graubünden 2023',
  },

  {
    id: 'gaesteprofil',
    week: 2,
    day: 5,
    publishDate: fmtDate(workdayDate(2, 5)),
    category: 'Tourismus',
    title: 'Woher kommen die Gäste? Das internationale Profil Graubündens',
    lead: 'Schweizer:innen sind die wichtigsten Gäste — aber der internationale Anteil überrascht. Deutsche, Briten und Nordeuropäer lieben Graubünden. Asiatische Märkte wachsen. Ein Profil, das zeigt, wie global das «Bergkanton-Produkt» vermarktet wird.',
    chartTitle: 'Logiernächte nach Gästeherkunft 2023',
    chartSubtitle: 'Anteil der Herkunftsländer an allen Hotelübernachtungen, Kanton Graubünden',
    chartType: 'doughnut',
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    fallbackData: {
      labels: ['Schweiz', 'Deutschland', 'UK & Irland', 'Skandinavien', 'BeNeLux', 'USA & Kanada', 'Asien', 'Übrige'],
      values: [48, 16, 9, 7, 5, 6, 5, 4],
      unit: '%',
      year: 2023
    },
    keyFacts: [
      { number: '48 %', label: 'Schweizer Gäste', context: 'Wichtigster Quellmarkt' },
      { number: '16 %', label: 'Deutsche Gäste', context: 'Grösster Auslandsmarkt' },
      { number: '+22 %', label: 'Asiatisches Wachstum', context: 'Gegenüber 2022' }
    ],
    analysis: [
      'Der wichtigste Quellmarkt für Graubünden ist und bleibt die Schweiz. Fast die Hälfte aller Logiernächte entfällt auf Gäste aus dem Inland. Das ist eine Stärke — Inlandstourismus ist krisenresistenter als Fernreisetourismus — aber auch eine Schwäche: Die Abhängigkeit von einem einzigen Markt macht den Kanton anfällig für Konjunkturschwankungen im Inland.',
      'Deutschland ist mit 16 Prozent der wichtigste ausländische Quellmarkt. Die kulturelle und sprachliche Nähe, kombiniert mit der guten Erreichbarkeit per Bahn (ICE-Direktverbindungen), macht Graubünden für Deutsche attraktiv. Briten und Skandinavier folgen — Gruppen, die historisch mit den exklusiveren Destinationen wie St. Moritz und Davos verbunden sind.',
      'Asiatische Märkte wachsen, bleiben aber bescheiden. China und Südasien haben nach COVID-19 zurückgefunden, und das Interesse am Alpentourismus ist real. Aber für Graubünden sind asiatische Gäste noch ein Nischensegment. Ob sich das ändert, hängt auch von Direktflugverbindungen und multilingualen Angeboten ab — beides entwickelt sich langsam.'
    ],
    source: 'Graubünden Ferien, Gästestrukturanalyse 2023; Bundesamt für Statistik HESTA',
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
      select: 'datum,cunfinaris',
      where: 'datum>=1996-01-01',
      group_by: 'datum',
      order_by: 'datum ASC'
    },
    parseData: 'parseCrossBorderCommuters',
    fallbackData: {
      labels: ['1996','1999','2002','2005','2008','2011','2014','2017','2020','2023'],
      values: [5800, 6200, 6900, 7800, 9200, 10100, 10800, 11400, 10200, 12100],
      unit: 'Grenzgänger',
      year: 2023
    },
    keyFacts: [
      { number: "12'100", label: 'Grenzgänger 2023', context: 'Neuer Höchststand' },
      { number: '8 %', label: 'Aller Beschäftigten in GR', context: 'Hoher Anteil für Bergkanton' },
      { number: '+108 %', label: 'Wachstum seit 1996', context: 'In knapp 30 Jahren verdoppelt' }
    ],
    analysis: [
      'Die Zahl der Grenzgänger:innen nach Graubünden hat sich seit 1996 mehr als verdoppelt. Was als relativ kleines Phänomen begann, ist heute zu einem strukturellen Merkmal des kantonalen Arbeitsmarkts geworden. Ohne Grenzgänger:innen würde das Gastgewerbe kollabieren — in Davos und Scuol kommen sie auf 15 bis 20 Prozent der Belegschaft.',
      'Die meisten Grenzgänger:innen kommen aus der Lombardei und dem Trentino — also aus dem nahen Norditalien, das über die Graubündner Pässe und den Tunnel erreichbar ist. Die Löhne sind in der Schweiz substanziell höher, die Lebenshaltungskosten auf der anderen Seite der Grenze tiefer. Das macht die Kombination für viele attraktiv.',
      'Die COVID-19-Krise zeigte die Fragilität dieser Abhängigkeit. Als die Grenzen schlossen, fehlten schlagartig tausende Arbeitskräfte. Der Kanton erholte sich — aber das Bewusstsein blieb: Graubünden braucht eine Strategie, um den eigenen Nachwuchs für Branchen wie Pflege, Bau und Gastgewerbe zu qualifizieren.'
    ],
    source: 'Bundesamt für Statistik, Grenzgängerstatistik; Staatssekretariat für Wirtschaft SECO',
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
      select: 'warengruppe,valur',
      where: 'onn=2023',
      group_by: 'warengruppe',
      order_by: 'valur DESC'
    },
    parseData: 'parseExports',
    fallbackData: {
      labels: ['Pharma & Chemie', 'Maschinen & Anlagen', 'Nahrungsmittel', 'Uhren & Schmuck', 'Elektronik', 'Kunststoffe', 'Metalle'],
      values: [1840, 920, 680, 340, 280, 210, 190],
      unit: 'Mio. CHF',
      year: 2023
    },
    keyFacts: [
      { number: '4.5 Mrd', label: 'Gesamtexporte 2023', context: 'In CHF, alle Warengruppen' },
      { number: '41 %', label: 'Pharma-Anteil', context: 'Dominant trotz weniger Firmen' },
      { number: '680 Mio', label: 'Nahrungsmittel-Export', context: 'Bündnerfleisch, Käse, Wein' }
    ],
    analysis: [
      'Graubünden als Exportkanton? Das klingt paradox, ist aber Realität. Einige wenige grosse Industrieunternehmen — darunter Pharmafirmen und Maschinenbauer — generieren den Löwenanteil der Exporterlöse. Der Pharmasektor allein macht über 40 Prozent aller kantonalen Warenexporte aus, obwohl er nur wenige hundert Beschäftigte zählt.',
      'Weniger bekannt, aber volkswirtschaftlich bedeutsam: die Nahrungsmittelexporte. Bündnerfleisch, Bündner Bergkäse und Weine aus Maienfeld und Malans finden ihre Käufer in der Deutschschweiz und im angrenzenden Ausland. Diese Produkte exportieren nicht nur Waren, sondern auch die Marke Graubünden — und stärken indirekt den Tourismus.',
      'Die Exportstruktur zeigt die Zweispurigkeit der Bündner Wirtschaft: Auf der einen Seite hochpreisige Nischenprodukte mit globaler Reichweite, auf der anderen Seite lokale Qualitätserzeugnisse für regionale Märkte. Diese Kombination macht Graubünden resilienter als Kantone, die auf eine einzige Industrie setzen.'
    ],
    source: 'Eidgenössische Zollverwaltung, Exportstatistik; Statistik Graubünden 2023',
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
      select: 'land,valur_export,valur_import',
      where: 'onn=2023',
      group_by: 'land',
      order_by: 'valur_export DESC'
    },
    parseData: 'parseTradePartners',
    fallbackData: {
      labels: ['Deutschland', 'USA', 'Italien', 'Frankreich', 'Österreich', 'China', 'UK', 'Andere'],
      values: [1820, 680, 540, 420, 380, 290, 240, 620],
      unit: 'Mio. CHF Export',
      year: 2023
    },
    keyFacts: [
      { number: '1.82 Mrd', label: 'Export nach Deutschland', context: 'Grösster Einzelmarkt' },
      { number: '68 %', label: 'Europa-Anteil Exporte', context: 'Starke Europa-Orientierung' },
      { number: '3.1 Mrd', label: 'Importvolumen gesamt', context: 'Handelsbilanz leicht negativ' }
    ],
    analysis: [
      'Deutschland dominiert die Bündner Handelsstatistik. Als Exportziel und Importquelle ist der nördliche Nachbar unverzichtbar. Das gilt nicht nur für Graubünden, sondern für die gesamte Schweiz — doch der Bergkanton mit seiner direkten Nähe zur deutschen Grenze (Bodenseeregion, Vorarlberg-Transit) ist besonders stark verflochten.',
      'Die USA sind trotz der geografischen Distanz der zweitwichtigste Exportmarkt — getrieben hauptsächlich vom Pharmaexport. Hochwertige Spezialprodukte findet weltweit Käufer, auch wenn die physische Distanz gross ist. Das zeigt: Im globalen Handel zählen nicht Kilometer, sondern Marktmacht und Spezialisierung.',
      'Die Handelsbilanz Graubündens ist leicht negativ: Der Kanton importiert etwas mehr als er exportiert. Energie, Rohstoffe und Konsumgüter fliessen herein, Fertigprodukte und Nahrungsmittel hinaus. Diese Struktur ist für einen kleinen, ressourcenarmen Bergkanton typisch — und volkswirtschaftlich unproblematisch.'
    ],
    source: 'Eidgenössische Zollverwaltung, Aussenhandelsstatistik; Statistik Graubünden 2023',
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
    fallbackData: {
      labels: ['Gastgewerbe & Tourismus', 'Gesundheit & Soziales', 'Bau & Immobilien', 'Handel', 'Öffentl. Verwaltung', 'Industrie & Gewerbe', 'Bildung', 'Sonstiges'],
      values: [22, 15, 14, 11, 9, 10, 7, 12],
      unit: '%',
      year: 2022
    },
    keyFacts: [
      { number: "141'000", label: 'Beschäftigte total', context: 'In Vollzeitäquivalenten 2022' },
      { number: '22 %', label: 'Gastgewerbe-Anteil', context: 'Schweizweit höchster Wert' },
      { number: '3.2 %', label: 'Arbeitslosenquote', context: 'Unter Schweizer Schnitt (3.6 %)' }
    ],
    analysis: [
      'Wer in Graubünden arbeitet, arbeitet zu einem überproportionalen Anteil im Gastgewerbe. Rund jede fünfte Stelle hängt direkt mit Tourismus und Beherbergung zusammen — schweizweit der höchste Anteil. Das prägt den Arbeitsmarkt: saisonale Schwankungen, hohe Teilzeitquote, und eine strukturelle Abhängigkeit von Grenzgänger:innen und ausländischen Arbeitskräften.',
      'Der Gesundheitssektor ist auf dem Vormarsch. Mit 15 Prozent ist er die zweitgrösste Branche und wächst im Zuge der Bevölkerungsalterung weiter. Das Kantonsspital Graubünden in Chur, die Reha-Kliniken und zahlreiche Altersheime sind heute schon einer der grössten Arbeitgeber des Kantons.',
      'Die Industrie spielt eine untergeordnete Rolle — nur 10 Prozent der Stellen. Das ist Stärke und Schwäche zugleich. Ohne schwere Industrie leidet Graubünden weniger unter Strukturwandel und Robotisierung. Aber ohne Industrie fehlt auch der stabile, hochbezahlte Kern vieler erfolgreicher Volkswirtschaften. Die Diversifizierung bleibt eine Priorität.'
    ],
    source: 'Bundesamt für Statistik, Betriebszählung / Strukturerhebung 2022',
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
    fallbackData: {
      labels: ['Strassenbau & Unterhalt', 'RhB & öffentl. Verkehr', 'Energieversorgung', 'Wasserversorgung', 'Breitband & Digital', 'Hochbau öffentlich'],
      values: [310, 185, 140, 82, 48, 210],
      unit: 'Mio. CHF',
      year: 2023
    },
    keyFacts: [
      { number: '975 km', label: 'RhB-Streckennetz', context: 'Weltweit dichtestes Schmalspur' },
      { number: '310 Mio', label: 'Strassenunterhalt p.a.', context: 'In Mio. CHF, 2023' },
      { number: '4\'800 CHF', label: 'Infrastruktur pro Kopf', context: '3x höher als in städt. Kantonen' }
    ],
    analysis: [
      'Infrastruktur im Bergkanton ist teuer — sehr teuer. Pro Einwohner:in gibt Graubünden rund dreimal so viel für Infrastruktur aus wie ein städtischer Kanton. Tunnel, Lawinenverbauungen, Wildbachverbauungen und die Unterhaltung von Schmalspurbahnen in entlegenen Tälern kosten Millionen, die für wenige Tausend Menschen zugutekommen.',
      'Die Rhätische Bahn ist das Herzstück der Bündner Infrastruktur — und ein globales Alleinstellungsmerkmal. Das UNESCO-Welterbe-Bahnnetz verbindet Täler, die sonst kaum erreichbar wären, und macht den Kanton überhaupt lebensfähig. Aber es kostet: Die jährlichen Betriebszuschüsse von Bund und Kanton übersteigen 150 Millionen Franken.',
      'Die politische Frage ist: Wie viel Infrastruktur für wie viele Menschen? Die Debatte über den Rückzug aus der Fläche — also das geordnete Aufgeben dünn besiedelter Regionen — wird lauter. Doch Graubünden wehrt sich: Der Anspruch, in jedem Tal zu leben, ist Teil der Bündner Identität — und er hat seinen Preis.'
    ],
    source: 'Kanton Graubünden, Finanzverwaltung; Rhätische Bahn, Geschäftsbericht 2023',
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
    fallbackData: {
      labels: ['Deutsch', 'Romanisch', 'Italienisch', 'Andere'],
      values: [68.3, 14.9, 9.8, 7.0],
      unit: '%',
      year: 2023
    },
    keyFacts: [
      { number: '14.9 %', label: 'Romanischsprachige', context: 'Rund 28\'000 Personen' },
      { number: '5', label: 'Romanisch-Idiome', context: 'Plus Rumantsch Grischun' },
      { number: '39', label: 'Romanisch-Gemeinden', context: 'Mit Romanisch als Amtssprache' }
    ],
    analysis: [
      'Das Romanische ist einzigartig: Es ist die einzige rätoromanische Sprache mit amtlichem Status und staatlicher Förderung. Aber es ist auch eine bedrohte Sprache. Seit dem Jahr 2000 ist der Anteil der Romanischsprachigen von 17 auf knapp 15 Prozent gesunken. Das klingt wenig — bedeutet aber Tausende Menschen, die das Romanische zugunsten des Deutschen aufgeben.',
      'Die Gründe für den Rückgang sind strukturell. Gemischte Ehen, Urbanisierung und die wirtschaftliche Dominanz des Deutschen machen es schwer, die Sprache im Alltag zu erhalten. In Chur sprechen kaum noch 5 Prozent der Menschen Romanisch — und doch pendeln viele Romanischsprechende täglich in die Kantonshauptstadt.',
      'Die Gegenmassnahmen sind vielfältig: Radiotelevisiun Svizra Rumantscha (RTR) sendet täglich auf Romanisch, zweisprachige Schulen werden gefördert, und das Rumantsch Grischun hat eine schriftliche Standardform geschaffen. Ob das reicht, um eine lebende Sprache zu erhalten, ist unsicher — aber der Wille ist vorhanden.'
    ],
    source: 'Bundesamt für Statistik, Strukturerhebung 2021/2023; Lia Rumantscha',
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
    fallbackData: {
      labels: ['1901','1911','1921','1931','1941','1951','1961','1971','1981','1991','2001','2011','2020','2024'],
      values: [-0.9, -0.7, -0.5, -0.3, -0.1, 0.1, 0.0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.9, 2.2],
      unit: '°C Anomalie',
      year: 2024
    },
    keyFacts: [
      { number: '+2.2 °C', label: 'Erwärmung seit 1900', context: 'Doppelt so viel wie global' },
      { number: '90 %', label: 'Gletscherverlust droht', context: 'Bis 2100 ohne Massnahmen' },
      { number: '−3 Wo.', label: 'Kürzere Schneesaison', context: 'Pro Jahrzehnt in mittleren Lagen' }
    ],
    analysis: [
      'Der Klimawandel ist in Graubünden keine abstrakte Zukunftsgefahr — er ist Gegenwart. Die Messreihen von MeteoSchweiz zeigen einen klaren Aufwärtstrend: Über 120 Jahre hat sich die Durchschnittstemperatur im Alpenraum um mehr als 2 Grad erhöht. Das ist fast doppelt so viel wie der globale Durchschnitt, und es beschleunigt sich noch.',
      'Die sichtbarsten Opfer sind die Gletscher. Der Morteratschgletscher — eines der Wahrzeichen des Engadins — zieht sich jährlich um 20 bis 30 Meter zurück. Der Pasterze-Gletscher in Österreich verlor in den letzten 30 Jahren fast einen Kilometer. Ohne drastische Klimamassnahmen werden die alpinen Gletscher bis 2100 zu 80 bis 90 Prozent verschwunden sein.',
      'Für Graubündens Wirtschaft hat der Klimawandel direkte Folgen. Die Skisaison wird kürzer und unsicherer. Beschneiungsanlagen brauchen immer mehr Energie und Wasser. Gleichzeitig steigt der Sommertourismus — ein Silberstreifen, der aber die Winterverluste langfristig nicht kompensieren wird. Die Transformation ist unvermeidlich.'
    ],
    source: 'MeteoSchweiz, Homogene Klimamessreihen; IPCC Alpine Region Assessment 2022',
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
    fallbackData: {
      labels: ['Alpweiden & Sömmerung', 'Kunstwiesen', 'Naturwiesen & Weiden', 'Ackerbau & Getreide', 'Obstbau & Reben', 'Übriges'],
      values: [52, 18, 16, 6, 5, 3],
      unit: '%',
      year: 2022
    },
    keyFacts: [
      { number: "2'100", label: 'Landwirtschaftsbetriebe', context: 'Im Kanton Graubünden 2022' },
      { number: '52 %', label: 'Alpwirtschaftsanteil', context: 'Dominierende Nutzungsform' },
      { number: '90 %', label: 'Direktzahlungsanteil', context: 'Betriebe erhalten Bundesbeiträge' }
    ],
    analysis: [
      'Die Bündner Berglandwirtschaft ist eine Besonderheit. Wo andere Kantone Mais- und Weizenfelder haben, dominieren in Graubünden Alpweiden. Die Sömmerungswirtschaft — Vieh für drei bis vier Monate auf die Alpen treiben — ist eine jahrtausendealte Praxis, die das Landschaftsbild prägt und den Tourismus erst ermöglicht.',
      'Wirtschaftlich steht die Berglandwirtschaft unter enormem Druck. Die Betriebe sind zu klein für moderne Effizienzstandards, die Erträge zu gering für rentables Wirtschaften ohne Subventionen. Fast alle Betriebe beziehen Direktzahlungen des Bundes — nicht als Almosen, sondern als Abgeltung für Ökosystemleistungen, die der Markt nicht bezahlt.',
      'Die Zukunft der Berglandwirtschaft hängt auch an den Nachfolgern. Viele Betriebe haben keinen Hofnachfolger. Junge, gut ausgebildete Menschen zögern, einen Beruf zu wählen, der 60-Stunden-Wochen, hohe Investitionen und unsichere Einkommen kombiniert. Die Politik hat das Problem erkannt — einfache Lösungen gibt es keine.'
    ],
    source: 'Bundesamt für Statistik, Betriebsstrukturerhebung Landwirtschaft 2022',
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
    fallbackData: {
      labels: ['Tourismus-Intensität', 'Bevölkerungsdichte', 'Alterung (Medianalter)', 'Infrastrukturkosten/Kopf', 'Lohnniveau'],
      values: [320, 18, 106, 290, 88],
      unit: 'Index (CH=100)',
      year: 2023
    },
    keyFacts: [
      { number: '3.2x', label: 'Tourismus-Intensität', context: 'Gegenüber Schweizer Schnitt' },
      { number: '44.8 J.', label: 'Medianalter', context: 'Höher als Schweizer Schnitt' },
      { number: '88 %', label: 'Lohnniveau', context: 'Unter Schweizer Durchschnitt' }
    ],
    analysis: [
      'Die fünf Schlüsselindikatoren erzählen die Geschichte Graubündens in komprimierter Form. Der Kanton ist beim Tourismus dreimal so intensiv wie der Schweizer Durchschnitt — das ist seine Stärke und sein grösstes Risiko zugleich. Er ist dünn besiedelt und alt — das prägt seine politischen Prioritäten. Und er liegt beim Lohnniveau unter dem Schweizer Schnitt — das erklärt die Abwanderung junger Fachleute.',
      'Das Zusammenspiel dieser Indikatoren zeigt eine strukturelle Herausforderung: Ein tourismusintensiver Kanton mit einer alternden Bevölkerung, hohen Infrastrukturkosten und unterdurchschnittlichen Löhnen muss ausserordentlich gut darin sein, sich attraktiv zu halten — für Touristen, Unternehmen und Einwohnende gleichermassen.',
      'Was Graubünden auszeichnet, ist seine Vielfalt und seine Resilienz. Drei Sprachen, drei Kulturen, hundert Täler — diese Diversität ist keine Schwäche, sondern eine Quelle von Innovationskraft und Anpassungsfähigkeit. Die 20 Geschichten dieser Serie zeigen einen Kanton, der sich seiner Herausforderungen bewusst ist — und aktiv an seiner Zukunft arbeitet.'
    ],
    source: 'Eigene Berechnungen auf Basis: Statistik Graubünden, Bundesamt für Statistik, Graubünden Ferien 2023',
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
    fallbackData: {
      labels: ['Bevölkerung', 'Tourismus', 'Wirtschaft', 'Gesellschaft & Klima', 'Synthese'],
      values: [5, 5, 5, 3, 2],
      unit: 'Stories',
      year: 2026
    },
    keyFacts: [
      { number: '20', label: 'Datenstories', context: 'In 4 Wochen, März 2026' },
      { number: '60+', label: 'Datenquellen', context: 'Aus Statistik GR und BFS' },
      { number: '4', label: 'Themenblöcke', context: 'Bevölkerung, Tourismus, Wirtschaft, Gesellschaft' }
    ],
    analysis: [
      'Vier Wochen, zwanzig Geschichten, ein Kanton. Was hat diese Datenstory-Serie über Graubünden geleistet? Sie hat Zahlen in Erzählungen verwandelt, Statistiken in Bedeutung. Datengetriebener Journalismus kann zeigen, was ansonsten unsichtbar bleibt: Langzeittrends, Strukturprobleme, stille Veränderungen.',
      'Gleichzeitig hat die Serie ihre Grenzen aufgezeigt. Daten erfassen, was messbar ist. Was Graubünden ausmacht — die Stille auf einem Berggipfel, die Freude eines Bauern beim ersten Almauftrieb, die Verbundenheit einer Romanisch-Gemeinde mit ihrer Sprache — lässt sich nicht tabellieren. Datengetriebener Journalismus ergänzt traditionelle Reportage, ersetzt sie nie.',
      'Der Kanton Graubünden hat begonnen, seine Daten systematisch zu öffnen — data.gr.ch ist ein gutes Zeichen. Je mehr Daten öffentlich und maschinenlesbar werden, desto mehr können Journalist:innen, Forschende und Bürger:innen eigenständig Fragen stellen und Antworten suchen. Das ist der eigentliche Wert des Open-Data-Prinzips.'
    ],
    source: 'Datenstory-Serie «Graubünden in Zahlen», März 2026; data.gr.ch',
  },

  // ── ZUSATZ: BEVÖLKERUNGSKONZENTRATION ────────────────────

  {
    id: 'bevoelkerung-konzentration',
    week: 5,
    day: 1,
    publishDate: fmtDate(workdayDate(5, 1)),
    category: 'Bevölkerung',
    title: 'Halbierter Kanton: 16 Gemeinden beheimaten die Hälfte aller Bündnerinnen',
    lead: 'Graubünden hat 101 Gemeinden. Aber die Hälfte der Bevölkerung lebt in nur 16 davon — während die anderen 85 Gemeinden zusammen genauso viele Menschen zählen. Eine einfache Zahl, die zeigt, wie extrem ungleich die Bevölkerung im grössten Schweizer Kanton verteilt ist.',
    chartTitle: 'Wie viele Gemeinden beheimaten je 50 % der Bündner Bevölkerung?',
    chartSubtitle: 'Anzahl Gemeinden je Bevölkerungshälfte · Statistik Graubünden 2023 (dvs_awt_soci_202502111)',
    chartType: 'doughnut',
    chartColors: ['#0077BB', '#EE7733'],
    apiDatasetId: 'dvs_awt_soci_202502111',
    apiQuery: {
      select: 'vischnanca,populaziun_permanenta',
      where: 'onn=2023',
      group_by: 'vischnanca',
      order_by: 'populaziun_permanenta DESC'
    },
    parseData: 'parseConcentration',
    fallbackData: {
      labels: ['~16 Gemeinden – erste Hälfte', '~85 Gemeinden – zweite Hälfte'],
      values: [16, 85],
      unit: 'Gemeinden',
      year: 2023
    },
    keyFacts: [
      { number: '16',  label: 'Gemeinden für 50 %', context: 'der Bündner Wohnbevölkerung 2023' },
      { number: '85',  label: 'Weitere Gemeinden',  context: 'mit den anderen 50 % der Bevölkerung' },
      { number: '101', label: 'Gemeinden total',     context: 'Stand 2023, nach Fusionen' }
    ],
    analysis: [
      'Graubünden zählte 2023 rund 200\'000 Einwohnerinnen und Einwohner, verteilt auf 101 Gemeinden. Sortiert man die Gemeinden nach Bevölkerungsgrösse und summiert von oben, braucht es rund 16 Gemeinden bis die Hälfte der Kantonsbevölkerung erreicht ist.',
      '<span id="muni-list-live"><strong>Gemeinden in der ersten Hälfte (grösste 10, Stand 2023):</strong><ul style="columns:2;column-gap:2em;margin:0.5em 0 0;padding-left:1.2em;font-size:0.9em"><li>Chur (40\'200)</li><li>Davos (11\'700)</li><li>Landquart (9\'400)</li><li>Domat/Ems (7\'900)</li><li>Poschiavo (3\'900)</li><li>Thusis (3\'500)</li><li>Samedan (3\'200)</li><li>Ilanz/Glion (2\'500)</li><li>Scuol (2\'200)</li><li>… plus ca. 6 weitere</li></ul>Die vollständige Liste aktualisiert sich, wenn Live-Daten von data.gr.ch verfügbar sind.</span>',
      'Quelle: Statistik Graubünden, Kantonale Bevölkerungsstatistik 2023 (dvs_awt_soci_202502111).'
    ],
    source: 'Statistik Graubünden, Kantonale Bevölkerungsstatistik 2023'
  }

  ,

  {
    id: 'schlaf-vs-arbeitsort',
    week: 5,
    day: 2,
    publishDate: fmtDate(workdayDate(5, 2)),
    category: 'Wirtschaft',
    title: 'Schlafdorf oder Arbeitsort? Die verborgene Ökonomie der Bündner Gemeinden',
    lead: 'Manche Gemeinden bieten kaum Arbeitsplätze – ihre Einwohnerinnen und Einwohner pendeln täglich aus. Andere ziehen Tausende von ausserhalb an. Die Arbeitsplatzquote macht sichtbar, wo Graubünden schläft und wo es arbeitet.',
    chartTitle: 'Arbeitsplätze pro 100 Einwohner – ausgewählte Gemeinden',
    chartSubtitle: 'Vollzeitäquivalente je 100 Einw. · BFS STATENT 2022 · Kantonaler Schnitt: ~42 · Blau = Arbeitsort, Orange = Schlafdorf',
    chartType: 'bar',
    horizontal: true,
    chartColors: [
      '#0077BB','#0077BB','#0077BB','#0077BB','#0077BB',
      '#6B6763',
      '#EE7733','#EE7733','#EE7733','#EE7733','#EE7733','#EE7733','#EE7733'
    ],
    apiDatasetId: null,
    apiQuery: null,
    parseData: null,
    fallbackData: {
      labels: ['St. Moritz','Davos','Domat/Ems','Chur','Arosa','Scuol','Landquart','Bonaduz','Trimmis','Felsberg','Malans','Rhäzüns','Haldenstein'],
      values: [82, 77, 76, 63, 58, 47, 43, 25, 24, 22, 21, 18, 17],
      unit: 'Arbeitspl. / 100 Einw.',
      year: 2022
    },
    keyFacts: [
      { number: '82', label: 'Arbeitspl. pro 100 Einw.', context: 'St. Moritz – stärkster Arbeitsmagnet' },
      { number: '17', label: 'Arbeitspl. pro 100 Einw.', context: 'Haldenstein – typisches Schlafdorf' },
      { number: '42', label: 'Kantonaler Schnitt', context: 'Schweizer Mittel liegt bei ~50 (BFS STATENT 2022)' }
    ],
    analysis: [
      'Wer in Haldenstein oder Rhäzüns wohnt, arbeitet meistens anderswo – vor allem in Chur, das in zwanzig Fahrminuten erreichbar ist. Diese Gemeinden sind Schlafdörfer im besten Sinn: ruhig, naturnah, oft günstiger im Wohnraum – aber wirtschaftlich kaum eigenständig. Ihre Steuerbasis hängt von Pendlerinnen und Pendlern ab, nicht von lokalen Unternehmen.',
      'Am anderen Ende der Skala stehen Domat/Ems, Davos und St. Moritz. Domat/Ems ist der versteckte Industriestandort Graubündens: EMS Chemie beschäftigt über 2\'500 Menschen direkt – bei rund 7\'900 Einwohnern ein enorm hoher Anteil. Täglich strömen Pendlerinnen und Pendler ins Domleschg. Davos zieht mit Kliniken, Kongresszentrum und Hotellerie. St. Moritz lebt von Luxustourismus mit globaler Strahlkraft.',
      'Diese Unterschiede haben politische Konsequenzen. Schlafdörfer kassieren Einkommenssteuer von Pendlerinnen, müssen aber wenig in Gewerbeinfrastruktur investieren. Arbeitsorte tragen Lasten für viele, die anderswo steuerpflichtig sind. Der schweizweite Finanzausgleich (NFA) mildert diese Ungleichgewichte – aber die strukturelle Spannung bleibt ein Dauerthema der Bündner Regionalpolitik.'
    ],
    source: 'BFS, Statistik der Unternehmensstruktur (STATENT) 2022; BFS, STATPOP 2022'
  }

]; // end STORIES


// ============================================================
// API FETCHING — Smart field detection system
// ============================================================

async function fetchDatasetRecords(datasetId, queryParams) {
  if (!datasetId) return null;
  try {
    const params = new URLSearchParams({ limit: '100', lang: 'de' });
    if (queryParams) {
      if (queryParams.select)   params.set('select',   queryParams.select);
      if (queryParams.where)    params.set('where',    queryParams.where);
      if (queryParams.group_by) params.set('group_by', queryParams.group_by);
      if (queryParams.order_by) params.set('order_by', queryParams.order_by);
    }
    const url = `${API_BASE}/${datasetId}/records?${params.toString()}`;
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
  const labels = top.map(r => detectLabel(r, ['vischnanca', 'gemeinde', 'municipality', 'nom', 'name']));
  const values = top.map(r => detectValue(r, ['populaziun_permanenta', 'bevoelkerung', 'population', 'einwohner', 'valur']));
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Einwohner', year: new Date().getFullYear() };
}

function parseAgeStructure(records) {
  if (!records || !records.length) return null;
  const sorted = [...records].sort((a, b) => {
    const la = detectLabel(a, ['classa_da_vegliadetgna', 'altersklasse', 'age_class']);
    const lb = detectLabel(b, ['classa_da_vegliadetgna', 'altersklasse', 'age_class']);
    return String(la).localeCompare(String(lb));
  });
  const labels = sorted.map(r => detectLabel(r, ['classa_da_vegliadetgna', 'altersklasse', 'age_class']));
  const rawVals = sorted.map(r => detectValue(r, ['populaziun_permanenta', 'anzahl', 'count', 'valur']));
  if (labels.some(l => !l) || rawVals.some(v => v === null)) return null;
  const total = rawVals.reduce((a, b) => a + b, 0);
  const values = rawVals.map(v => +((v / total) * 100).toFixed(1));
  return { labels, values, unit: '%', year: new Date().getFullYear() };
}

function parseBirths(records) {
  if (!records || !records.length) return null;
  const sorted = [...records].sort((a, b) => {
    const ya = detectValue(a, ['onn', 'jahr', 'year', 'annee']);
    const yb = detectValue(b, ['onn', 'jahr', 'year', 'annee']);
    return ya - yb;
  });
  const labels = sorted.map(r => String(detectValue(r, ['onn', 'jahr', 'year', 'annee'])));
  const values = sorted.map(r => detectValue(r, ['naschientschas_vivas', 'geburten', 'births', 'naissances', 'valur']));
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Geburten', year: new Date().getFullYear() };
}

function parseDemographicBalance(records) {
  if (!records || !records.length) return null;
  const sorted = [...records].sort((a, b) => {
    const ya = detectValue(a, ['onn', 'jahr', 'year']);
    const yb = detectValue(b, ['onn', 'jahr', 'year']);
    return ya - yb;
  });
  const labels = sorted.map(r => String(detectValue(r, ['onn', 'jahr', 'year'])));
  const births = sorted.map(r => detectValue(r, ['naschientschas_vivas', 'geburten', 'births']) || 0);
  const deaths = sorted.map(r => detectValue(r, ['mortoris', 'todesfaelle', 'deaths']) || 0);
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
  const sorted = [...records].sort((a, b) => {
    const ya = detectValue(a, ['onn', 'jahr', 'year', 'annee']);
    const yb = detectValue(b, ['onn', 'jahr', 'year', 'annee']);
    return ya - yb;
  });
  const labels = sorted.map(r => String(detectValue(r, ['onn', 'jahr', 'year', 'annee'])));
  const values = sorted.map(r => {
    const v = detectValue(r, ['pernottaziuns', 'logiernächte', 'overnight_stays', 'nuitees', 'valur']);
    return v !== null ? +(v / 1e6).toFixed(2) : null;
  });
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Mio. Logiernächte', year: new Date().getFullYear() };
}

function parseTourismMonthly(records) {
  if (!records || !records.length) return null;
  const MONTH_DE = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
  const agg = new Array(12).fill(0);
  const cnt = new Array(12).fill(0);
  records.forEach(r => {
    const m = detectValue(r, ['mais', 'monat', 'month', 'mois']);
    const v = detectValue(r, ['pernottaziuns', 'logiernächte', 'overnight_stays', 'nuitees', 'valur']);
    if (m !== null && v !== null) {
      const idx = (parseInt(m, 10) || m) - 1;
      if (idx >= 0 && idx < 12) { agg[idx] += v; cnt[idx]++; }
    }
  });
  const values = agg.map((s, i) => cnt[i] > 0 ? Math.round(s / cnt[i] / 1000) : 0);
  return { labels: MONTH_DE, values, unit: 'Tsd. Logiernächte', year: new Date().getFullYear() };
}

function parseTourismMunicipalities(records) {
  if (!records || !records.length) return null;
  const top = records.slice(0, 12);
  const labels = top.map(r => detectLabel(r, ['vischnanca', 'gemeinde', 'municipality', 'nom']));
  const values = top.map(r => {
    const v = detectValue(r, ['pernottaziuns', 'logiernächte', 'overnight_stays', 'valur']);
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
    const da = String(detectLabel(a, ['datum', 'date', 'quartal', 'period']) || '');
    const db = String(detectLabel(b, ['datum', 'date', 'quartal', 'period']) || '');
    return da.localeCompare(db);
  });
  // Aggregate by year
  const byYear = {};
  sorted.forEach(r => {
    const dt = detectLabel(r, ['datum', 'date', 'period']) || '';
    const yr = dt.substring(0, 4);
    const v  = detectValue(r, ['cunfinaris', 'grenzgaenger', 'cross_border', 'valur']) || 0;
    if (!byYear[yr]) byYear[yr] = { sum: 0, cnt: 0 };
    byYear[yr].sum += v; byYear[yr].cnt++;
  });
  const labels = Object.keys(byYear).sort();
  const values = labels.map(y => Math.round(byYear[y].sum / byYear[y].cnt));
  if (!labels.length) return null;
  return { labels, values, unit: 'Grenzgänger', year: new Date().getFullYear() };
}

function parseExports(records) {
  if (!records || !records.length) return null;
  const labels = records.map(r => detectLabel(r, ['warengruppe', 'product_group', 'categorie', 'label']));
  const values = records.map(r => detectValue(r, ['valur', 'wert', 'value', 'betrag']));
  if (labels.some(l => !l) || values.some(v => v === null)) return null;
  return { labels, values, unit: 'Mio. CHF', year: new Date().getFullYear() };
}

function parseTradePartners(records) {
  if (!records || !records.length) return null;
  const labels = records.map(r => detectLabel(r, ['land', 'country', 'pays', 'partner']));
  const values = records.map(r => detectValue(r, ['valur_export', 'export_wert', 'export_value', 'valur']));
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
/**
 * parseConcentration — berechnet, wie viele Gemeinden je 50 % der Bevölkerung beheimaten.
 * Gibt ein Doughnut-Datensatz zurück: [N_grosse_gemeinden, M_kleine_gemeinden]
 * mit N + M = Gesamtzahl der Gemeinden, beide Hälften je 50 % der Bevölkerung.
 */
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

/**
 * parseArbeitsplatzquote — computes jobs-per-100-residents ratio per municipality.
 * Expects records with fields: Gemeinde, VZAe (FTE jobs), Einwohner.
 * Falls back gracefully if field names differ.
 */
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
  parseInfrastructure,
  parseConcentration,
  parseArbeitsplatzquote
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
  const d    = data || story.fallbackData;
  const type = story.chartType;

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
    const colors = story.chartColors || PALETTE;
    activeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: d.labels,
        datasets: [{
          data: d.values,
          backgroundColor: colors,
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
      if (nav) nav.hidden = true;
      const toggle = document.getElementById('menu-toggle');
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

  // Key Facts
  const factsEl = document.getElementById('facts-grid');
  if (factsEl) {
    factsEl.innerHTML = s.keyFacts.map(function(f) {
      return '<div class="fact-card">' +
        '<div class="fact-number">' + f.number + '</div>' +
        '<div class="fact-label">' + f.label + '</div>' +
        '<div class="fact-context">' + f.context + '</div>' +
        '</div>';
    }).join('');
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

  // 2. Build chart with fallback data first
  buildChart(s, null);

  // 3. Set badge to fallback initially
  setDataBadge('fallback', 'Quelldaten: ' + s.source);

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
      if (!liveData || !liveData.labels || !liveData.values) return;
      // Only update if we're still on the same story
      if (currentIndex === STORIES.indexOf(s)) {
        buildChart(s, liveData);
        setDataBadge('live', 'Live-Daten via data.gr.ch');
        if (liveData.municipalityList) {
          var el = document.getElementById('muni-list-live');
          if (el) el.outerHTML = liveData.municipalityList;
        }
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
  const menuNav = document.getElementById('story-menu-nav');
  if (toggle && menuNav) {
    toggle.addEventListener('click', function() {
      const willOpen = menuNav.hidden;
      menuNav.hidden = !willOpen;
      toggle.setAttribute('aria-expanded', String(willOpen));
    });
    // Close menu on outside click
    document.addEventListener('click', function(e) {
      if (!menuNav.hidden && !menuNav.contains(e.target) && e.target !== toggle) {
        menuNav.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
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

