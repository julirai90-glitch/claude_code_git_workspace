# Embed-Codes — Zweitwohnungs-Datenstory Graubünden

Alle Embeds liegen unter `https://julirai90-glitch.github.io/claude_code_git_workspace/`.
Daten werden aus den geschwister-Files `zweitwohnungen_data.json`, `zweitwohnungen_kanton_zeitreihe.json` sowie der Datawrapper-Karte `uzHEN` zur Laufzeit geladen — bei jedem Datenupdate auf gh-pages aktualisiert sich der Embed automatisch.

Container-Breite: 696 px (Konvention Datenstory-Serie).
Höhen-Sync: jeder Embed hat das iframe-resizer/contentWindow-Script — die responsive Variante (Code A) passt sich automatisch an, die einfache (Code B) nutzt eine feste Mindesthöhe.

---

## Übersicht

| # | Embed | Was es zeigt | Direkt-Link |
|---|---|---|---|
| 1 | `zweitwohnungen_atlas.html` | Multi-View, 5 Tabs (Tabelle / Scatter / Zeitreihe / Kanton / Karte) | [öffnen](https://julirai90-glitch.github.io/claude_code_git_workspace/zweitwohnungen_atlas.html) |
| 2 | `zwg_embed_tabelle.html` | Sortier- und durchsuchbare Tabelle aller 100 Gemeinden, mit Region-Filter und Detail-Sparkline | [öffnen](https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_tabelle.html) |
| 3 | `zwg_embed_kanton.html` | Wohnungsbestand 2017–2026 als Stacked Area: Total / Erst / Erst-gleichgestellt / Zweit | [öffnen](https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_kanton.html) |
| 4 | `zwg_embed_scatter.html` | Animierter Scatter — Quote × Veränderung, alle Punkte bewegen sich über 10 Jahre | [öffnen](https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_scatter.html) |
| 5 | `zwg_embed_zeitreihe_gemeinden.html` | Slider 2017→2026, Bars aller Gemeinden sortieren sich neu, mit Suchfeld | [öffnen](https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_zeitreihe_gemeinden.html) |
| 6 | `zwg_embed_beeswarm.html` | Punkte bewegen sich rein vertikal entlang der Quote (kein horizontales Hüpfen) | [öffnen](https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_beeswarm.html) |
| 7 | `zwg_embed_slope.html` | 100 Linien von 2017 zu 2026, Region-Filter highlightet Auswahl | [öffnen](https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_slope.html) |
| 8 | `zwg_embed_bumpchart.html` | 100 Rang-Linien über die Zeit (Y = Rang 1–100) | [öffnen](https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_bumpchart.html) |
| 9 | `zwg_embed_bumpchart_animated.html` | Vertikale Liste aller Gemeinden, sortiert sich live nach Rang um, mit ↑↓-Pfeil | [öffnen](https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_bumpchart_animated.html) |
| 10 | `zwg_embed_karte.html` | Datawrapper-Choropleth aller 100 Bündner Gemeinden (Basemap 2025) | [öffnen](https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_karte.html) |
| 11 | `zwg_embed_wachstum.html` | HTML-Tabelle: Wachstum Total / Erst / Zweit 2017→2026, Erst-gleichgestellt in Fussnote | [öffnen](https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_wachstum.html) |

---

## Code-Varianten

Pro Embed gibt es zwei Code-Snippets:

- **Variante A (responsive)**: lädt einmalig `iframe-resizer` von jsdelivr, danach passt sich die Höhe automatisch an jeden Tab und jede Slider-Position an. Empfohlen.
- **Variante B (einfach)**: festes `min-height` (konservativ gewählt). Nutzen, wenn WordPress oder das CMS keine externen Scripts zulässt.

Wenn du **mehrere Embeds auf derselben Seite** einbindest, reicht Variante A — das `<script>`-Snippet braucht nur einmal eingebunden zu werden, der `iFrameResize`-Aufruf kann mehrere IDs auf einmal targetten.

---

## 1. Atlas (alle 5 Tabs)

**A — responsive:**
```html
<iframe id="zwg-atlas"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/zweitwohnungen_atlas.html"
  title="Zweitwohnungs-Atlas Graubünden — alle 100 Gemeinden"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#zwg-atlas');</script>
```

**B — einfach:**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/zweitwohnungen_atlas.html"
  title="Zweitwohnungs-Atlas Graubünden" loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:1100px; display:block;"></iframe>
```

---

## 2. Tabelle aller 100 Gemeinden

**A — responsive:**
```html
<iframe id="zwg-tabelle"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_tabelle.html"
  title="Zweitwohnungsanteil — alle 100 Bündner Gemeinden, März 2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#zwg-tabelle');</script>
```

**B — einfach:**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_tabelle.html"
  title="Zweitwohnungsanteil — alle 100 Bündner Gemeinden, März 2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:2600px; display:block;"></iframe>
```

---

## 3. Wohnungsbestand 2017–2026 (Stacked Area Kanton)

**A — responsive:**
```html
<iframe id="zwg-kanton"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_kanton.html"
  title="Wohnungsbestand Graubünden 2017–2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#zwg-kanton');</script>
```

**B — einfach:**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_kanton.html"
  title="Wohnungsbestand Graubünden 2017–2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:780px; display:block;"></iframe>
```

---

## 4. Scatter animiert (Quote × Veränderung)

**A — responsive:**
```html
<iframe id="zwg-scatter"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_scatter.html"
  title="Zweitwohnungsanteil vs. Veränderung 2017→2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#zwg-scatter');</script>
```

**B — einfach:**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_scatter.html"
  title="Zweitwohnungsanteil vs. Veränderung 2017→2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:680px; display:block;"></iframe>
```

---

## 5. Zeitreihe alle Gemeinden (Slider mit Suche)

**A — responsive:**
```html
<iframe id="zwg-zr"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_zeitreihe_gemeinden.html"
  title="Zeitverlauf aller Gemeinden 2017–2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#zwg-zr');</script>
```

**B — einfach:**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_zeitreihe_gemeinden.html"
  title="Zeitverlauf aller Gemeinden 2017–2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:680px; display:block;"></iframe>
```

---

## 6. Bee Swarm (vertikale Bewegung)

**A — responsive:**
```html
<iframe id="zwg-bee"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_beeswarm.html"
  title="Alle Gemeinden, vertikal sortiert nach Quote"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#zwg-bee');</script>
```

**B — einfach:**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_beeswarm.html"
  title="Alle Gemeinden, vertikal sortiert nach Quote"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:760px; display:block;"></iframe>
```

---

## 7. Slope-Chart (100 Linien 2017→2026)

**A — responsive:**
```html
<iframe id="zwg-slope"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_slope.html"
  title="Alle Gemeinden 2017→2026 auf einen Blick"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#zwg-slope');</script>
```

**B — einfach:**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_slope.html"
  title="Alle Gemeinden 2017→2026 auf einen Blick"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:680px; display:block;"></iframe>
```

---

## 8. Bumpchart (Rang-Linien)

**A — responsive:**
```html
<iframe id="zwg-bump"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_bumpchart.html"
  title="Wer überholt wen? Rangverlauf 2017→2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#zwg-bump');</script>
```

**B — einfach:**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_bumpchart.html"
  title="Wer überholt wen? Rangverlauf 2017→2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:880px; display:block;"></iframe>
```

---

## 9. Bumpchart animiert (Liste mit Namen, sortiert sich live)

**A — responsive:**
```html
<iframe id="zwg-bump-a"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_bumpchart_animated.html"
  title="Wer überholt wen? Animation 2017→2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#zwg-bump-a');</script>
```

**B — einfach:**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_bumpchart_animated.html"
  title="Wer überholt wen? Animation 2017→2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:2400px; display:block;"></iframe>
```

---

## 10. Karte (Datawrapper-Choropleth)

**A — responsive:**
```html
<iframe id="zwg-karte"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_karte.html"
  title="Zweitwohnungsanteil — alle 100 Bündner Gemeinden, März 2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#zwg-karte');</script>
```

**B — einfach:**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_karte.html"
  title="Zweitwohnungsanteil — alle 100 Bündner Gemeinden, März 2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:820px; display:block;"></iframe>
```

---

## 11. Wachstumsraten-Tabelle (Total / Erst / Zweit)

**A — responsive:**
```html
<iframe id="zwg-wachstum"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_wachstum.html"
  title="Wohnungsentwicklung Graubünden 2017–2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#zwg-wachstum');</script>
```

**B — einfach:**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/zwg_embed_wachstum.html"
  title="Wohnungsentwicklung Graubünden 2017–2026"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:320px; display:block;"></iframe>
```

---

## Mehrere Embeds auf einer Seite

Wenn du z.B. den Atlas und das Kanton-Embed auf derselben WordPress-Seite zeigen willst, reicht **eine** Script-Einbindung:

```html
<iframe id="zwg-atlas" src="…/zweitwohnungen_atlas.html" loading="lazy" scrolling="no"
  style="width:0;min-width:100%;border:none;display:block;"></iframe>

<iframe id="zwg-kanton" src="…/zwg_embed_kanton.html" loading="lazy" scrolling="no"
  style="width:0;min-width:100%;border:none;display:block;"></iframe>

<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>
  iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' },
    '#zwg-atlas', '#zwg-kanton');
</script>
```

---

## Datenquellen (für Story-Footer)

> Daten: Statistik Graubünden, dvs_awt_soci_20260112 (Zweitwohnungsanteil 2017–2026, 17 Halbjahres-Erhebungen).
> Bevölkerung: dvs_awt_soci_20250507 (Stand 2024).
> Geometrien: opendatasoft georef-switzerland-gemeinde 2025.
> Karten-Engine: Datawrapper.de (Basemap «Switzerland — Graubünden Municipalities 2025»).
> Datenquelle: Eidg. Gebäude- und Wohnungsregister (GWR).
> Verifikation: alle 17 Erhebungen × 4 Felder 1:1 gegen data.gr.ch geprüft (Skript `_research/verify_all.py`), 42 Story-Aussagen automatisiert geprüft.
> Grafik: Julian Reich.

---

*Letztes Update: 2026-05-04.
Bei Datenupdate auf gh-pages aktualisieren sich alle Embeds automatisch — keine Code-Änderung im einbettenden Artikel nötig.*
