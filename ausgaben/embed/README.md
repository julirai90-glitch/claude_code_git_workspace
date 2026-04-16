# Embeds — Altersstruktur Graubünden

Diese Dateien sind iframe-fähige Varianten von `ausgaben/07-teil-2-alter.html`,
zugeschnitten für die Einbettung im Südostschweiz-WordPress-CMS.

Live-URLs (GitHub Pages):
`https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/<datei>.html`

---

## Variante A — Komplettes Scrollytelling

**Datei:** `alter-scrolly-full.html`

Das gesamte Original-Scrollytelling als ein einziger iframe. Texte sind fest
enthalten, der Leser scrollt durch die ganze Geschichte.

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/alter-scrolly-full.html"
  style="width:100%;border:0;height:600vh"
  loading="lazy"
  title="Jung oder alt? Graubünden 2024">
</iframe>
```

> Tipp: `height:600vh` reicht für die 7 Steps. Bei Bedarf anpassen oder das
> postMessage-Resize-Snippet (siehe unten) verwenden.

---

## Variante B — 3 einzelne Blöcke (Text dazwischen im CMS)

Jeder Block ist ein eigenständiger iframe mit Tabs / Dropdowns statt Scroll.
Du kannst dazwischen im CMS frei Text schreiben.

### Block 1 — Bubble-Karte mit Tabs

**Datei:** `alter-bubbles.html`
Tabs: *Übersicht · Jüngste · Älteste · Wandel 2010–2024* (Time-Slider).

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/alter-bubbles.html"
  style="width:100%;border:0;height:820px"
  loading="lazy"
  title="Bündner Gemeinden — Alter & Geschlecht">
</iframe>
```

### Block 2 — Bevölkerungspyramide mit Gemeinde-Wahl

**Datei:** `alter-pyramide.html`
Dropdown wählt Gemeinde, Default = Kanton Graubünden gesamt.

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/alter-pyramide.html"
  style="width:100%;border:0;height:820px"
  loading="lazy"
  title="Bevölkerungspyramide Graubünden">
</iframe>
```

### Block 3 — Ranglisten

**Datei:** `alter-rankings.html`
Tabs: *Heute (älteste & jüngste)* · *Veränderung 2010–2024*.

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/alter-rankings.html"
  style="width:100%;border:0;height:720px"
  loading="lazy"
  title="Rangliste Altersstruktur Graubünden">
</iframe>
```

---

# Embeds — Geschlechterverteilung Graubünden

Fünf eigenständige Embeds zur Gender-Story "Wo fehlen die Frauen, wo fehlen die Männer?"
Jeder Block ist ein eigener iframe mit Tabs/Dropdowns — Fliesstext dazwischen im CMS.
Gemeinsame Datenbasis: [`data/gender-data.json`](data/gender-data.json), gebaut von
[`data/prepare-gender-data.py`](data/prepare-gender-data.py).

Stand 2025p (provisorisch) aus Statistik-Graubünden-Excel + Altersstruktur 2024 aus data.gr.ch.

### Block 1 — Blasen: Männer- und Frauenanteil der 100 Gemeinden

**Datei:** `gender-bubbles.html`
Jede Blase eine Gemeinde · X = Männeranteil (44–60%) · Y = Einwohnerzahl (log) · Tabs
*Alle · Männlichste 10 · Weiblichste 10* · Such-Input highlightet.

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/gender-bubbles.html"
  style="width:100%;border:0;height:620px"
  loading="lazy"
  title="Männer- und Frauenanteil in Graubündens Gemeinden (2025p)">
</iframe>
```

### Block 2 — Alterspyramide

**Datei:** `gender-pyramide.html`
Dropdown Gemeinde (Default: Kanton). Kennzahlen oben (EW · Männeranteil · Ø Alter).
View-Toggle *Absolut* / *Anteile pro Altersgruppe* — letzteres zeigt divergent um die 50 %-Linie,
in welchen Altersklassen Männer bzw. Frauen überwiegen, unabhängig von der Gruppengrösse.

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/gender-pyramide.html"
  style="width:100%;border:0;height:760px"
  loading="lazy"
  title="Alterspyramide Graubünden — Männer und Frauen">
</iframe>
```

### Block 3 — Ranglisten

**Datei:** `gender-rankings.html`
Tabs: *Top 10 männlichste · Top 10 weiblichste · Grösste Abweichungen*.

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/gender-rankings.html"
  style="width:100%;border:0;height:640px"
  loading="lazy"
  title="Rangliste Männer- und Frauenanteil Graubünden">
</iframe>
```

### Block 4 — Zwei Geschlechterverteilungen (wertneutral)

**Datei:** `gender-ch-vs-auslaender.html`
Drei 100%-Stacked-Bars: Gesamt · Schweizer · Ausländer. Dropdown optional auf einzelne
Gemeinden. Erklär-Box markiert das Bild als strukturellen Unterschied, nicht als Wertung.

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/gender-ch-vs-auslaender.html"
  style="width:100%;border:0;height:620px"
  loading="lazy"
  title="Männeranteil nach Staatsangehörigkeit Graubünden 2025p">
</iframe>
```

### Block 5 — Gemeinde-Matching (Augenzwinkern)

**Datei:** `gender-matching.html`
Zufallspaar- oder Gemeinde-Dropdown. Das Tool paart jede Gemeinde mit deutlichem
Geschlechter-Überschuss mit einer passenden Gegengemeinde und zeigt die kombinierte
Quote. Disclaimer: statistische Spielerei — keine Fusions-Empfehlung.

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/gender-matching.html"
  style="width:100%;border:0;height:560px"
  loading="lazy"
  title="Gemeinde-Matching Graubünden — statistische Spielerei">
</iframe>
```

### Block 6 — Zeitverlauf seit 1981 (100 % gestapelte Flächen)

**Datei:** `gender-timeline.html`
Dropdown wählt zwischen Kanton (seit 1981), 11 Regionen und 100 Gemeinden (beide seit 2010).
Erzählt visuell, wie sich der Männer-/Frauenanteil über die Jahre verschoben hat —
Kanton-Default zeigt den Wandel vom historischen Frauenüberschuss (1981: 49.2 % Männer) zum
heutigen leichten Männerüberschuss (2025p: 50.4 %).

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/embed/gender-timeline.html"
  style="width:100%;border:0;height:560px"
  loading="lazy"
  title="Geschlechterverhältnis Graubünden seit 1981">
</iframe>
```

---

## Optional: Auto-Resize via postMessage

Alle 4 Embeds senden ihre Höhe per `postMessage` an die Parent-Seite. Wenn du
das im CMS nutzen willst, einmalig folgendes Script in den Seitenkopf legen:

```html
<script>
window.addEventListener('message', function(e){
  if (!e.data || e.data.type !== 'embed-size') return;
  document.querySelectorAll('iframe').forEach(function(f){
    if (f.contentWindow === e.source) f.style.height = e.data.height + 'px';
  });
});
</script>
```

---

## Quelle

Generiert aus `ausgaben/07-teil-2-alter.html` mit `/tmp/build_embeds.py`
(Build-Script ist im Repo nicht enthalten — bei Bedarf in der PR nachreichen).
Daten: Kanton Graubünden, Amt für Wirtschaft und Tourismus, 2024.
