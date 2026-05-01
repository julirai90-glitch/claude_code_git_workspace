/* zwg_common.js — gemeinsame Helper für Zweitwohnungs-Atlas und Einzel-Embeds.
   Wird sowohl von zweitwohnungen_atlas.html als auch von zwg_embed_*.html geladen.
   Keine Frameworks, kein Build — pure ES5/ES6.
*/
(function (global) {
  'use strict';

  // Markenfarben Südostschweiz (gemäss Playbook).
  var MARKEN = {
    blue:     '#0068A4',  // Hauptblau, Erstwohnungen
    blueDark: '#1E3A5F',  // Headlines, Total
    blueLight:'#cce0ee',
    orange:   '#EE7733',  // Akzent, Zweitwohnungen
    red:      '#B5001E',  // Schwellwert / Warnung
    cream:    '#f5e0c0'
  };

  // Calanca 2020: dokumentierter GWR-Datenfehler (Quote 98.48 % statt ~73 %).
  // Wert bleibt unverändert in den Daten, nur visuell markiert.
  function isAnomaly(name, jahr, semester) {
    return name === 'Calanca' && jahr === 2020;
  }

  // Linear interpolierte Farbskala über Quote 0–100 %.
  function colorForAnteil(a) {
    var stops = [
      [0,  [  0, 104, 164]],
      [20, [204, 224, 238]],
      [40, [245, 224, 192]],
      [70, [238, 119,  51]],
      [100,[181,   0,  30]]
    ];
    var lo = stops[0], hi = stops[stops.length - 1];
    for (var i = 0; i < stops.length - 1; i++) {
      if (a >= stops[i][0] && a <= stops[i + 1][0]) { lo = stops[i]; hi = stops[i + 1]; break; }
    }
    var t = (a - lo[0]) / (hi[0] - lo[0] || 1);
    var rgb = lo[1].map(function (c, k) { return Math.round(c + t * (hi[1][k] - c)); });
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
  }

  // Schweizer Zahlenformat: Apostroph als Tausender-Trenner, Komma als Dezimal.
  function fmtN(v) { return v == null ? '–' : v.toLocaleString('de-CH'); }
  function fmtPct(v) { return v.toFixed(2).replace('.', ',') + '%'; }
  function fmtPp(v) {
    if (v == null || isNaN(v)) return '–';
    return (v > 0 ? '+' : '') + v.toFixed(2).replace('.', ',') + ' Pp';
  }

  // Sortierschlüssel Erhebungs-Reihenfolge: März < Oktober pro Jahr.
  function periodKey(jahr, semester) { return jahr * 2 + (semester === 'März' ? 0 : 1); }

  // fetch JSON mit Fehler-Anzeige im targetEl.
  // cache: 'no-store' verhindert, dass Browser eine veraltete JSON-Version
  // ausliefert, wenn das Datenfile aktualisiert wurde.
  function loadData(url, targetEl, onSuccess) {
    fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(onSuccess).catch(function (e) {
      if (targetEl) {
        targetEl.innerHTML = '<div style="padding:12px;background:#fef2f2;border:1px solid #fca5a5;'
          + 'border-radius:4px;color:#991b1b;font-size:12px;">Daten konnten nicht geladen werden: '
          + e.message + '. Datei <code>' + url + '</code> muss neben dieser HTML-Seite liegen, '
          + 'die Seite muss von einem Webserver (nicht <code>file://</code>) ausgeliefert werden.</div>';
      }
    });
  }

  // Tooltip-Helper. Erstellt ein div#tooltip, falls nicht vorhanden.
  function getTooltip() {
    var t = document.getElementById('zwg-tooltip');
    if (!t) {
      t = document.createElement('div');
      t.id = 'zwg-tooltip';
      t.style.cssText = 'position:fixed;pointer-events:none;background:#fff;border:1px solid #ccc;'
        + 'border-radius:4px;padding:6px 8px;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,.12);'
        + 'z-index:1000;opacity:0;transition:opacity .1s;max-width:240px;';
      document.body.appendChild(t);
    }
    return t;
  }
  function showTooltip(html, evt) {
    var t = getTooltip();
    t.innerHTML = html;
    t.style.opacity = 1;
    positionTooltip(evt);
  }
  function positionTooltip(evt) {
    var t = getTooltip();
    var x = evt.clientX + 12, y = evt.clientY + 12;
    t.style.left = Math.min(x, window.innerWidth  - 260) + 'px';
    t.style.top  = Math.min(y, window.innerHeight -  90) + 'px';
  }
  function hideTooltip() { var t = document.getElementById('zwg-tooltip'); if (t) t.style.opacity = 0; }

  // Standard-Footer für jede Embed-HTML.
  function footerHTML(zusatz) {
    var src = 'Daten: Statistik Graubünden, dvs_awt_soci_20260112 (Zweitwohnungsanteil 2017–2026, '
            + '17 Halbjahres-Erhebungen). Quelle: Eidg. Gebäude- und Wohnungsregister (GWR). '
            + 'Abgerufen 2026-04-29. Grafik: Julian Reich.';
    if (zusatz) src += ' ' + zusatz;
    return '<div class="src" style="font-size:11px;color:#aaa;padding:10px 0 4px;line-height:1.5;">' + src + '</div>';
  }

  global.ZWG = {
    MARKEN: MARKEN,
    isAnomaly: isAnomaly,
    colorForAnteil: colorForAnteil,
    fmtN: fmtN, fmtPct: fmtPct, fmtPp: fmtPp,
    periodKey: periodKey,
    loadData: loadData,
    showTooltip: showTooltip, positionTooltip: positionTooltip, hideTooltip: hideTooltip,
    footerHTML: footerHTML
  };
})(window);
