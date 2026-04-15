# graubuenden-stats — Projekt-Vorgaben

Regelmässige Datenstories für die Südostschweiz-Onlineausgabe. Jede Story besteht aus einer Haupt-Datenstory (`index.html` + `app.js` + `style.css`) und optional eigenständigen, scrollytellenden **Embeds** unter `ausgaben/embed/`, die per iframe aus GitHub Pages ins Südostschweiz-CMS eingebunden werden. Zielplattform: primär Mobile (iPhone), Südostschweiz-Online-Leserschaft.

---

## 1 Quellen, Faktentreue, Verifikation

Oberste Regel: Alles muss überprüfbar und quellengenau sein.

- Jede Zahl/Behauptung mit **Datenquelle + Dataset-Name + Abrufdatum** belegen — nicht nur "data.gr.ch"
- **Quelle sichtbar im Embed**: Footer-Zeile mit Dataset-Name und Stand, z.B.
  `Daten: Statistik Graubünden · STATPOP 2024 · data.gr.ch · Stand: 2026-04-13`
- **Autorenzeile**: `Grafik: Südostschweiz/jr` — Pflicht neben der Datenquelle
- Bei Aggregationen: Berechnungsweise als Kommentar ins JS, z.B. `// avg_age = pop_weighted_mean über Altersklassen`
- **Vor Publikation**: Stichprobenartig 2–3 Werte gegen Originaldaten (data.gr.ch / BFS) gegenprüfen — nicht auf automatisches Feld-Mapping verlassen
- KI-generierte Analysen/Leads nie als Fakt präsentieren — immer gegen Primärquelle verifizieren
- Bei Unsicherheit: `// Annahme: ...` im Code vermerken, nicht raten
- Im Note-to-Self nach der Session festhalten: Dataset, Felder, Abrufdatum — damit später nachvollziehbar

---

## 2 Embed-Grundregeln (iframe-Kontext)

Die Embeds laufen im CMS der Südostschweiz als iframe. Daraus ergeben sich harte Regeln:

- **`overflow-x: hidden`** auf `html, body` UND Viz-Container — ohne das entsteht auf Mobile horizontaler Scroll
- **Nie `vw`-Einheiten** in Containern — immer `width: 100%` + `max-width: <px>`. `vw` referenziert die Viewport-Breite des äusseren Fensters, nicht des iframes → Overflow.
- **Viewport-Meta** setzen: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
- **Standard-Grafikbreite: 696px** — Viz-Container auf `max-width: 696px` setzen. Das ist die effektive Rendering-Breite im Südostschweiz-Artikel. 900px produzieren Weissflächen links/rechts.
- **Empfohlene iframe-Höhe im CMS: 700px** (nicht 900px). Muss im CMS manuell gesetzt werden.

---

## 3 Mobile-Breakpoints

- **Embeds**: `@media (max-width: 600px)`
- **Hauptsite** (`style.css`): `@media (max-width: 640px)`

---

## 4 Container-Breiten

Gilt für neue Embeds. Bestehende Embeds (alter-bubbles, alter-pyramide etc.) laufen noch auf 720/900/700px — bei nächster Bearbeitung auf 696px harmonisieren, kein separates Refactoring.

```css
/* Viz-Container */
#viz, #pyramid-container, #ranking-container {
  width: 100% !important;
  max-width: 696px;
  overflow-x: hidden !important;
  margin: 0 auto;
}

/* Content-Bereiche */
.hero, .search-section, .outro {
  max-width: 696px;
  margin: 0 auto;
}

/* Scrolly-Text-Boxen */
.text-box { max-width: 340px; }
```

---

## 5 Farbpalette (im Code bestätigt)

| Rolle | Hex | Verwendung |
|-------|-----|------------|
| **Standard-Blau** | `#0068A4` | Männer, junge Gemeinden, positive Akzente |
| Blau dunkel (Alt.) | `#005E94` | Optional, falls mehr Kontrast nötig |
| Blau sehr dunkel (Alt.) | `#003E62` | Optional |
| **Standard-Orange** | `#EE7733` | Frauen, ältere Gemeinden |
| **Grün** | `#1a9e5a` | Highlights, Zahlen, 100+ |
| **Hellgrün** | `#5cd68f` | Slider-Thumb, aktive Dots |
| **Bubble-Highlight** | `#ff9e2c` | Default für hervorgehobene Bubbles |
| Text Haupt | `#1a1a1a` | |
| Text Sekundär | `#555`, `#666`, `#888`, `#aaa` | |
| Hintergrund | `#ffffff` | |
| Flächen hell | `#f5f5f5`, `#f3f3f3` | |
| Borders | `#e8e8e8`, `#ddd`, `#ccc` | |

---

## 6 Typografie

- **Font-Stack Embed**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` (system fonts, kein Google-Fonts-Load in Embeds → schnelleres Rendering)
- **Hauptsite** (`index.html`): Playfair Display (Display) + Inter (Body) via Google Fonts
- Fliessende Font-Sizes via `clamp()` wo sinnvoll
- Body: 15–17px · Lead: 17px · Caption: 12–13px · Axis-Label: 11px (desktop) / 8px (mobile)

---

## 7 SVG-Chart-Muster auf Mobile

Bei 390px iPhone-Breite versagen Desktop-Defaults. Harte Regeln:

- **Achsen-Text**: 8px (statt 11px)
- **Rotierte Y-Achsen-Labels**: auf Mobile **komplett ausblenden** (nicht nur verkleinern — sie fressen Breite)
- **Achsen-Ticks reduzieren**: z.B. jedes 4. statt jedes 2. Element labeln
- **Bubble-Label-Threshold**: auf Mobile nur Chur + explizit hervorgehobene Gemeinden labeln (nicht alle >3000 EW)
- **Bubble-Radien kleiner**: max 16 statt 28, min 2 statt 3
- **X-Achsen-Label**: kürzerer Text auf Mobile (z.B. "Anteil 65+ (%)" statt "Anteil Bevölkerung 65 Jahre und älter (%)")

---

## 8 Interaktion auf Mobile

- **Touch-Tooltips**: `touchstart`-Handler an den interaktiven Elementen registrieren — `mouseleave` feuert auf Touch-Geräten nicht
- **Document-Level `touchstart`**: zum Schliessen des Tooltips beim Tap ausserhalb
- **Controls** (Such-Inputs, Buttons): `max-width: 100%`, damit nichts abgeschnitten wird

---

## 9 Viz-Container im Embed-Mode

Wenn der gleiche Code im Embed-Mode anders laufen soll (z.B. `#viz` ohne `90vw`):

```css
/* Embed-spezifisches Override */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
  max-width: 100%;
}
#viz, #pyramid-container, #ranking-container {
  width: 100% !important;
  max-width: 696px;
  margin: 0 auto;
  padding: 4px !important;
  box-sizing: border-box;
}
#bubble-svg { width: 100%; height: auto; display: block; }
```

---

## 10 Deployment (GitHub + GitHub Pages)

**GitHub Repo**
- Remote: `https://github.com/julirai90-glitch/claude_code_git_workspace.git`
- Branches:
  - **`main`** — Entwicklungsstand, alle Quelldateien
  - **`gh-pages`** — Live-Branch, von GitHub Pages serviert. Änderungen an Embeds müssen auf diesen Branch gemerged/cherry-gepickt werden, damit sie im CMS live sichtbar sind.

**Live-URL-Schema**
```
https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/<datei>.html
```
Der Repo-Name (`claude_code_git_workspace`) ist Teil der URL — nicht verändern.

**Deployment-Flow**
1. Änderung auf `main` entwickeln & committen
2. Auf `gh-pages` wechseln, Änderung einbringen (merge oder `git checkout main -- <datei>`), committen
3. Beide Branches pushen (`git push origin main gh-pages`)
4. GitHub Pages aktualisiert sich innerhalb ~1 Min automatisch
5. Browser-Cache im CMS aggressiv — Safari: langes Drücken auf Reload · Chrome: harter Refresh (Ctrl+Shift+R)

**iframe-Einbindung im CMS** (Südostschweiz WordPress)
```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/<datei>.html"
  style="width:100%;border:0;height:700px"
  loading="lazy"
  title="<aussagekräftiger Titel>">
</iframe>
```
Konkrete Snippets pro Embed: siehe [ausgaben/embed/README.md](ausgaben/embed/README.md).

**Optional: Auto-Resize via postMessage** — alle Embeds senden ihre Höhe, CMS-seitig kann ein Listener die iframe-Höhe dynamisch anpassen (Snippet in `ausgaben/embed/README.md`).

---

## 11 Verifikations-Checkliste (vor jeder Veröffentlichung)

**Daten & Redaktion**
- [ ] Datenquelle + Abrufdatum im Embed-Footer sichtbar
- [ ] "Grafik: Südostschweiz/jr" im Footer
- [ ] 2–3 Stichproben-Werte gegen Originaldaten gegengeprüft
- [ ] Berechnungsweise im Code kommentiert (bei Aggregationen)

**Technik Mobile**
- [ ] Viewport-Meta gesetzt
- [ ] `overflow-x: hidden` auf `html`/`body`
- [ ] Keine `vw`-Einheiten in Containern
- [ ] Mobile-Medienquery `@media (max-width: 600px)` vorhanden
- [ ] `touchstart`-Events auf interaktiven Elementen
- [ ] Rotierte SVG-Texte auf Mobile ausgeblendet

**Layout**
- [ ] `max-width: 696px` auf Viz-Containern
- [ ] Test auf iPhone-Breite (390px) UND Standard-Grafikbreite (696px)
- [ ] iframe-Höhe im CMS auf 700px gesetzt
