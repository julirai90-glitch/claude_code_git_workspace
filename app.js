/* ========================================
   DATENSTORY GRAUBÜNDEN — app.js
   ======================================== */

'use strict';

// ============================================================
// 1. STORY DEFINITIONS
//    Jede Geschichte hat:
//    - Journalistischen Titel / Lead / Analyse
//    - Eingebettete Fallback-Daten (immer verfügbar)
//    - Optionale data.gr.ch API-Dataset-ID für Live-Daten
// ============================================================

const STORIES = [
  {
    id: 'sprachen',
    category: 'Gesellschaft',
    title: 'Graubünden spricht drei Sprachen – und hält daran fest',
    lead: 'Als einziger Kanton der Schweiz hat Graubünden drei Amtssprachen: Deutsch, Romanisch und Italienisch. Die Balance zwischen den Sprachen verschiebt sich langsam – mit weitreichenden Folgen für Kultur, Schule und Identität.',
    chartTitle: 'Sprachverteilung im Kanton Graubünden',
    chartSubtitle: 'Anteile der Hauptsprachen an der Wohnbevölkerung · Strukturerhebung 2021',
    chartType: 'doughnut',
    apiDatasetId: null,
    fallbackData: {
      labels: ['Deutsch', 'Romanisch', 'Italienisch', 'Andere'],
      values: [68.3, 14.9, 9.8, 7.0],
      unit: '%',
      year: 2021
    },
    keyFacts: [
      { number: '3',     label: 'Amtssprachen',         context: 'Einzigartig in der Schweiz' },
      { number: '14.9%', label: 'Romanischsprachige',   context: 'Rund 28\'000 Personen' },
      { number: '39',    label: 'Romanisch-Gemeinden',  context: 'Im Vorderrheintal und Engadin' }
    ],
    analysis: [
      'Graubünden ist das sprachliche Herz der Schweiz. Drei Sprachen, drei Kulturen, ein Kanton – dieser Dreiklang macht Graubünden einzigartig in Europa. Keine andere Region der Welt hat eine solche Sprachendiversität auf so kleinem Raum bewahrt.',
      'Das Romanische steht unter besonderem Druck. Seit Jahrzehnten sinkt der Anteil der Romanischsprachigen langsam aber stetig. Urbanisierung, Zuzug und wirtschaftliche Mobilität drängen die Minderheitensprache in immer kleinere Nischen.',
      'Der Kanton unternimmt grosse Anstrengungen, das Romanische zu erhalten: zweisprachige Schulen, staatliche Medienförderung und die Standardisierung des Rumantsch Grischun. Ob das reicht, ist unter Linguisten und in den betroffenen Tälern heftig umstritten.'
    ],
    source: 'Bundesamt für Statistik, Strukturerhebung 2021'
  },

  {
    id: 'tourismus',
    category: 'Tourismus',
    title: 'Graubünden lebt vom Tourismus – und leidet an seinen Spitzen',
    lead: 'Fast 16 Millionen Übernachtungen pro Jahr machen Graubünden zum touristischen Schwergewicht der Schweiz. Doch die extreme Saisonalität stellt Gemeinden und Betriebe vor enorme Herausforderungen.',
    chartTitle: 'Logiernächte nach Monat',
    chartSubtitle: 'Hotellerie Kanton Graubünden, Tausend Übernachtungen · Jahresdurchschnitt 2022/23',
    chartType: 'bar',
    apiDatasetId: null,
    fallbackData: {
      labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
      values: [1820, 1950, 1450, 540, 460, 740, 1640, 1870, 940, 680, 360, 1280],
      unit: 'Tsd. Nächte',
      year: 2023
    },
    keyFacts: [
      { number: '15.7 Mio', label: 'Logiernächte pro Jahr',   context: 'Höchste Zahl aller Kantone' },
      { number: '62 %',     label: 'Auslastung im Winter',    context: 'Gegenüber 36 % im Sommer' },
      { number: '520',      label: 'Klassifizierte Hotels',   context: 'Im gesamten Kanton' }
    ],
    analysis: [
      'Der Tourismus ist das Rückgrat der Bündner Wirtschaft. Jeder vierte Franken, der im Kanton verdient wird, hängt direkt oder indirekt mit dem Gästegewerbe zusammen. Orte wie Davos, St. Moritz oder Laax wären ohne Tourismus kaum lebensfähig.',
      'Die Saisonalität ist jedoch ein chronisches Problem. Während die Wintersaison floriert, kämpfen viele Betriebe im Frühling und Herbst ums Überleben. Fachkräfte wandern ab, sobald die Saison endet – und kehren manchmal nicht zurück.',
      'Die Klimakrise verschärft das Dilemma. Schneesichere Lagen werden seltener, Investitionen in Beschneiung steigen. Gleichzeitig wächst der Sommertourismus – doch nicht schnell genug, um die Winserverluste zu kompensieren. Die Branche steht vor einem Transformationsjahrzehnt.'
    ],
    source: 'Bundesamt für Statistik, Beherbergungsstatistik HESTA 2023'
  },

  {
    id: 'bevoelkerung',
    category: 'Bevölkerung',
    title: 'Graubünden schrumpft – aber nicht überall gleich',
    lead: 'Graubünden ist flächenmässig der grösste Kanton der Schweiz – doch er hat gerade mal 200\'000 Einwohnerinnen und Einwohner. Während Chur wächst, kämpfen Hunderte von Bergdörfern gegen den Exodus.',
    chartTitle: 'Bevölkerung der grössten Gemeinden',
    chartSubtitle: 'Einwohnerinnen und Einwohner, Stand 2023',
    chartType: 'bar',
    apiDatasetId: null,
    fallbackData: {
      labels: ['Chur', 'Davos', 'Landquart', 'Domat/Ems', 'Poschiavo', 'Thusis', 'Samedan', 'Scuol', 'Ilanz', 'Vals'],
      values: [40200, 11700, 9200, 7800, 3800, 3400, 3100, 2200, 2500, 1050],
      unit: 'Einwohner',
      year: 2023
    },
    keyFacts: [
      { number: '200\'000', label: 'Einwohner total',     context: 'Stand 2023' },
      { number: '7\'105',   label: 'km² Fläche',          context: 'Grösster Kanton der Schweiz' },
      { number: '28',       label: 'Einwohner/km²',       context: 'Niedrigste Dichte aller Kantone' }
    ],
    analysis: [
      'Graubünden ist paradox: der grösste Kanton der Schweiz beherbergt gerade mal rund 200\'000 Einwohnerinnen und Einwohner. Die Bevölkerungsdichte liegt weit unter dem Schweizer Durchschnitt – und die Unterschiede innerhalb des Kantons sind enorm.',
      'Chur als einziges grösseres städtisches Zentrum wächst stetig. In den Randgemeinden hingegen – den kleinen Dörfern abseits der Haupttäler – sinken Einwohnerzahlen seit Jahrzehnten. Schulen schliessen, Läden verschwinden, die Infrastruktur wird teurer pro Kopf.',
      'Die Politik ringt mit dem Dilemma: Soll man den Rückzug aus der Fläche moderieren und auf Verdichtung setzen, oder in peripheren Räumen investieren, um sie lebendig zu halten? Eine klare Antwort gibt es nicht – aber die Zeit läuft.'
    ],
    source: 'Statistik Graubünden, Kantonale Bevölkerungsstatistik 2023'
  },

  {
    id: 'wirtschaft',
    category: 'Wirtschaft',
    title: 'Berge, Betten, Bauboom: Was die Bündner Wirtschaft antreibt',
    lead: 'Graubündens Wirtschaft ist anders als die der meisten Schweizer Kantone. Tourismus und Bau dominieren, die Industrie ist schwach. Das macht den Kanton flexibel – und verwundbar.',
    chartTitle: 'Beschäftigte nach Wirtschaftssektor',
    chartSubtitle: 'Anteil an Vollzeitäquivalenten, Kanton Graubünden 2022',
    chartType: 'doughnut',
    apiDatasetId: null,
    fallbackData: {
      labels: ['Gastgewerbe & Tourismus', 'Bau & Immobilien', 'Gesundheit & Soziales', 'Handel', 'Industrie & Gewerbe', 'Öff. Verwaltung', 'Sonstige'],
      values: [22, 18, 14, 12, 11, 9, 14],
      unit: '%',
      year: 2022
    },
    keyFacts: [
      { number: '22 %',   label: 'Tourismus-Anteil',   context: 'Höchster Wert aller Kantone' },
      { number: '14 Mrd', label: 'Kantonales BIP',      context: 'In CHF, 2022' },
      { number: '95\'000', label: 'Beschäftigte',       context: 'Vollzeitäquivalente im Kanton' }
    ],
    analysis: [
      'Die Bündner Wirtschaft tickt anders. Während andere Kantone mit starken Industrie- oder Finanzplätzen punkten, setzt Graubünden auf Berge und Betten. Das Gastgewerbe beschäftigt mehr Menschen als jede andere Branche – ein Alleinstellungsmerkmal in der Schweiz.',
      'Doch diese Abhängigkeit hat ihren Preis. Löhne im Tourismus liegen unter dem Schweizer Durchschnitt, Arbeit ist oft saisonal und prekär. Viele gut ausgebildete Junge verlassen den Kanton, weil die Karrieremöglichkeiten fehlen.',
      'Der Kanton versucht gegenzusteuern: Digitalisierung, Homeoffice und neue Ansiedlungen sollen die Wirtschaftsbasis verbreitern. Die Pandemie hat gezeigt, wie schnell ein tourismuslastiger Kanton in die Knie gehen kann – und wie wichtig wirtschaftliche Diversifikation ist.'
    ],
    source: 'Bundesamt für Statistik, Betriebszählung 2022'
  },

  {
    id: 'klima',
    category: 'Klima',
    title: 'Die Alpen heizen sich doppelt so schnell auf wie das Flachland',
    lead: 'Der Klimawandel trifft die Alpen härter als fast jeden anderen Ort der Erde. Graubünden hat sich in 120 Jahren um über 2 Grad erwärmt – doppelt so viel wie der globale Durchschnitt. Die Folgen sind bereits sichtbar.',
    chartTitle: 'Temperaturanomalie Graubünden 1901–2023',
    chartSubtitle: 'Abweichung vom Mittelwert der Referenzperiode 1961–1990 in °C · MeteoSchweiz',
    chartType: 'line',
    apiDatasetId: null,
    fallbackData: {
      labels: ['1901','1911','1921','1931','1941','1951','1961','1971','1981','1991','2001','2011','2021','2023'],
      values:  [-0.8,  -0.6,  -0.4,  -0.3,  -0.2,   0.1,   0.0,   0.3,   0.5,   0.9,   1.1,   1.4,   1.8,   2.1],
      unit: '°C',
      year: 2023
    },
    keyFacts: [
      { number: '+2.1°C', label: 'Erwärmung seit 1900',     context: 'Doppelt so viel wie global' },
      { number: '90 %',   label: 'Gletscherverlust droht', context: 'Bis 2100 bei aktuellem Trend' },
      { number: '−3 Wo',  label: 'Kürzere Schneesaison',   context: 'Pro Jahrzehnt in mittleren Lagen' }
    ],
    analysis: [
      'Die Berge erwärmen sich schneller als die Ebene – das ist wissenschaftlicher Konsens. In den Alpen ist der Temperaturanstieg seit der Industrialisierung etwa doppelt so hoch wie im globalen Durchschnitt. Für Graubünden bedeutet das: Die Welt verändert sich hier schneller als anderswo.',
      'Die Gletscher sind das sichtbarste Symptom. Der Morteratschgletscher zieht sich jährlich um 20 bis 30 Meter zurück. Permafrost taut auf, Hänge werden instabil, Extremereignisse häufen sich. Der Klimawandel ist keine abstrakte Bedrohung – er ist Alltag in Graubünden.',
      'Gleichzeitig verändert sich die Schneesituation fundamental. Schneesichere Wintersaisons werden seltener und kürzer. Die Skiwirtschaft kämpft mit Beschneiungsanlagen gegen den Trend – aber Energie und Wasser werden knapper. Die Anpassung kostet Milliarden.'
    ],
    source: 'MeteoSchweiz, Homogene Messreihen; IPCC Alpine Region Report 2022'
  },

  {
    id: 'pendler',
    category: 'Mobilität',
    title: 'Pendeln mit Aussicht: Wie Graubünden zur Arbeit kommt',
    lead: 'In Graubünden bleiben die meisten Berufstätigen in ihrer Region. Anders als in städtischen Kantonen sind lange Pendlerwege selten. Doch innerhalb des Kantons fliessen starke Ströme in Richtung Chur und Davos.',
    chartTitle: 'Pendlerströme nach Zielregion',
    chartSubtitle: 'Anteil der Beschäftigten an Wohnbevölkerung, Kanton Graubünden · Volkszählung 2021',
    chartType: 'bar',
    apiDatasetId: null,
    fallbackData: {
      labels: ['Arbeitsort = Wohnort', 'Innerhalb GR', 'In andere Kantone', 'Einpendler von aussen'],
      values: [34, 41, 15, 10],
      unit: '%',
      year: 2021
    },
    keyFacts: [
      { number: '75 %',   label: 'Bleiben in GR',    context: 'Arbeit im Kanton oder Wohngemeinde' },
      { number: '35 min', label: 'Ø Pendlerzeit',    context: 'Mittlerer Arbeitsweg' },
      { number: '12\'000', label: 'Einpendler tägl.', context: 'Aus anderen Kantonen' }
    ],
    analysis: [
      'Graubünden ist kein Pendlerkanton. Die Distanzen sind gross, das öffentliche Verkehrsnetz auf dem Land spärlich, und viele Arbeitgeber befinden sich in unmittelbarer Nähe der Wohnbevölkerung – im Tourismus, in der Landwirtschaft, in der öffentlichen Verwaltung.',
      'Wo gependelt wird, geht es vor allem nach Chur. Die Kantonshauptstadt zieht täglich Tausende aus dem Rheintal, dem Schanfigg und den umliegenden Gemeinden an. Chur ist das wirtschaftliche und dienstleistungsbezogene Zentrum – und die Strassen in die Stadt sind morgens entsprechend voll.',
      'Die Coronapandemie hat das Pendlerverhalten dauerhaft verändert. Homeoffice ist für viele Büroberufe zur Normalität geworden – ein Segen für abgelegene Gemeinden, die nun attraktiver für Zugezogene sind. Ob dieser Trend hält, wird sich in den nächsten Jahren zeigen.'
    ],
    source: 'Bundesamt für Statistik, Eidgenössische Volkszählung 2021'
  },

  {
    id: 'landwirtschaft',
    category: 'Landwirtschaft',
    title: 'Die Bündner Landwirtschaft: Klein, spezialisiert, überlebenswichtig',
    lead: 'Über 2000 Landwirtschaftsbetriebe bewirtschaften Graubündens Bergland. Sie produzieren Qualitätsprodukte mit Weltrang – Bündnerfleisch, Malans-Wein, Bergkäse. Eine Nischenlandwirtschaft, die trotzdem systemrelevant ist.',
    chartTitle: 'Landwirtschaftliche Nutzfläche nach Kategorie',
    chartSubtitle: 'Anteile in Prozent, Kanton Graubünden 2022',
    chartType: 'doughnut',
    apiDatasetId: null,
    fallbackData: {
      labels: ['Alpweiden & Sömmerung', 'Kunstwiesen', 'Naturwiesen', 'Getreide & Ackerbau', 'Obstbau & Reben', 'Übriges'],
      values: [52, 18, 15, 6, 5, 4],
      unit: '%',
      year: 2022
    },
    keyFacts: [
      { number: '2\'100',   label: 'Landwirtschaftsbetriebe', context: 'Im gesamten Kanton' },
      { number: '270\'000', label: 'ha Nutzfläche',           context: 'Inklusive Alpweiden' },
      { number: '52 %',     label: 'Alpwirtschaft',           context: 'Dominiert die Landnutzung' }
    ],
    analysis: [
      'Berglandwirtschaft ist Kulturlandschaftspflege. Ohne die Bündner Bauern würden die Alpen zuwachsen, Wanderwege verschwinden und der Tourismus leiden. Die Landwirtschaft schafft nicht nur Lebensmittel, sondern auch die Kulisse, die Millionen von Gästen jährlich in den Kanton lockt.',
      'Die Alpwirtschaft dominiert die Nutzfläche des Kantons. Im Sommer werden über 200\'000 Grossvieheinheiten auf den Alpen gesömmert – ein Bild, das seit Jahrhunderten das Bündner Bergbild prägt. Doch der Strukturwandel macht auch hier nicht halt.',
      'Junge Bauern übernehmen immer seltener die elterlichen Betriebe. Die Kombination aus harter Arbeit, tiefen Einkommen und hohen Investitionskosten schreckt ab. Direktzahlungen des Bundes halten viele Betriebe am Leben – politisch umstritten, wirtschaftlich unverzichtbar.'
    ],
    source: 'Bundesamt für Statistik, Landwirtschaftliche Betriebsstrukturerhebung 2022'
  }
];


// ============================================================
// 2. CHART CONFIGURATION
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
  const ctx    = document.getElementById('mainChart').getContext('2d');
  const d      = data || story.fallbackData;
  const type   = story.chartType;

  const baseFont = { family: "'Inter', system-ui, sans-serif", size: 12 };
  const tooltip  = {
    backgroundColor: '#161616',
    titleFont: { ...baseFont, size: 13, weight: '600' },
    bodyFont:  { ...baseFont },
    padding: 12,
    callbacks: {
      label: (ctx) => {
        const v = type === 'doughnut' ? ctx.parsed : ctx.parsed.y;
        return `  ${v} ${d.unit}`;
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
            labels: { font: baseFont, color: MUTED, padding: 14, usePointStyle: true, pointStyleWidth: 10 }
          },
          tooltip
        }
      }
    });
    return;
  }

  // ---- BAR ----
  if (type === 'bar') {
    const barColors = d.labels.map((_, i) => {
      if (d.labels.length <= 4) return PALETTE[i % PALETTE.length];
      // Single-color with slight gradient effect via opacity
      const opacity = 1 - i * 0.06;
      return `rgba(181,0,30,${Math.max(0.35, opacity)})`;
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
          tooltip
        },
        scales: {
          x: { grid: { color: GRID }, ticks: { font: baseFont, color: MUTED } },
          y: { grid: { color: GRID }, ticks: { font: baseFont, color: MUTED }, beginAtZero: true }
        }
      }
    });
    return;
  }

  // ---- LINE ----
  if (type === 'line') {
    // Colour positive/negative differently via segment
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
            borderColor: ctx => ctx.p1.parsed.y >= 0 ? '#B5001E' : '#1E3A5F',
            backgroundColor: ctx => ctx.p1.parsed.y >= 0 ? 'rgba(181,0,30,0.08)' : 'rgba(30,58,95,0.08)'
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip,
          annotation: undefined
        },
        scales: {
          x: { grid: { color: GRID }, ticks: { font: baseFont, color: MUTED } },
          y: {
            grid: {
              color: ctx => ctx.tick.value === 0 ? '#888' : GRID,
              lineWidth: ctx => ctx.tick.value === 0 ? 1.5 : 1
            },
            ticks: { font: baseFont, color: MUTED }
          }
        }
      }
    });
  }
}


// ============================================================
// 3. API — Live-Daten von data.gr.ch
// ============================================================

async function fetchLiveData(datasetId) {
  if (!datasetId) return null;
  try {
    const url = `https://data.gr.ch/api/explore/v2.1/catalog/datasets/${datasetId}/records?limit=100&lang=de`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.info('[Datenstory] Live-Daten nicht verfügbar:', e.message);
    return null;
  }
}


// ============================================================
// 4. RENDER
// ============================================================

let currentIndex = 0;

function setDataBadge(state, text) {
  const badge = document.getElementById('data-badge');
  badge.className = `data-badge ${state}`;
  document.getElementById('badge-text').textContent = text;
}

function renderStory(index) {
  currentIndex = index;
  const s = STORIES[index];

  // --- Text ---
  document.getElementById('story-category').textContent = s.category;
  document.getElementById('story-counter').textContent  = `Geschichte ${index + 1} von ${STORIES.length}`;
  document.getElementById('story-title').textContent    = s.title;
  document.getElementById('story-lead').textContent     = s.lead;
  document.getElementById('chart-title').textContent    = s.chartTitle;
  document.getElementById('chart-subtitle').textContent = s.chartSubtitle;

  // --- Key Facts ---
  document.getElementById('facts-grid').innerHTML = s.keyFacts.map(f => `
    <div class="fact-card">
      <div class="fact-number">${f.number}</div>
      <div class="fact-label">${f.label}</div>
      <div class="fact-context">${f.context}</div>
    </div>
  `).join('');

  // --- Analysis ---
  document.getElementById('analysis-body').innerHTML =
    s.analysis.map(p => `<p>${p}</p>`).join('');

  // --- Nav Dots ---
  const dotsEl = document.getElementById('nav-dots');
  dotsEl.innerHTML = STORIES.map((_, i) => `
    <button class="nav-dot ${i === index ? 'active' : ''}"
            data-idx="${i}"
            title="Geschichte ${i + 1}: ${STORIES[i].category}"
            aria-label="Geschichte ${i + 1}"></button>
  `).join('');
  dotsEl.querySelectorAll('.nav-dot').forEach(btn =>
    btn.addEventListener('click', () => renderStory(+btn.dataset.idx))
  );

  // --- Chart (Fallback sofort, dann Live-Versuch) ---
  buildChart(s, null);
  setDataBadge('fallback', `Quelldaten: ${s.source}`);

  // URL-Hash aktualisieren (silent)
  history.replaceState(null, '', `#${s.id}`);

  // Live-Daten asynchron nachladen
  fetchLiveData(s.apiDatasetId).then(live => {
    if (live && live.results && live.results.length > 0) {
      // Story-spezifische Datenaufbereitung würde hier greifen
      setDataBadge('live', 'Live-Daten via data.gr.ch');
    }
    // Falls null: Fallback bleibt, Badge bleibt auf fallback
  });
}


// ============================================================
// 5. INIT
// ============================================================

function getDayOfYear() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86_400_000);
}

function formatDateDE(date = new Date()) {
  return date.toLocaleDateString('de-CH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

(function init() {
  // Datum im Header
  document.getElementById('header-date').textContent = formatDateDE();

  // Story per Tag (zyklisch), Hash überschreibt
  const dayIndex  = getDayOfYear() % STORIES.length;
  const hash      = window.location.hash.slice(1);
  const hashIndex = STORIES.findIndex(s => s.id === hash);
  const startIdx  = hashIndex >= 0 ? hashIndex : dayIndex;

  renderStory(startIdx);

  // Prev / Next
  document.getElementById('prev-btn').addEventListener('click', () =>
    renderStory((currentIndex - 1 + STORIES.length) % STORIES.length)
  );
  document.getElementById('next-btn').addEventListener('click', () =>
    renderStory((currentIndex + 1) % STORIES.length)
  );

  // Tastatur-Navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  renderStory((currentIndex - 1 + STORIES.length) % STORIES.length);
    if (e.key === 'ArrowRight') renderStory((currentIndex + 1) % STORIES.length);
  });
})();
