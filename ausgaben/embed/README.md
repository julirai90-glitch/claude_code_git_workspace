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
  style="width:100%;border:0;height:780px"
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
  style="width:100%;border:0;height:700px"
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
  style="width:100%;border:0;height:680px"
  loading="lazy"
  title="Rangliste Altersstruktur Graubünden">
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
