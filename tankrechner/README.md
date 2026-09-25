# Tankrechner

Drei interaktive Embeds für suedostschweiz.ch zur Frage: **Lohnt es sich, für eine
Tankfüllung weiter zu fahren?** Entstanden am 23./24. September 2026.

## Die drei Rechner

| Datei | Live | Wofür |
|---|---|---|
| `tankrechner-glarus.html` | [T1](https://julirai90-glitch.github.io/claude_code_git_workspace/tankrechner/tankrechner-glarus.html) | Glarus. Acht Ortschaften plus Balzers und Feldkirch als Ziel, Wechselkurs, Vignette, **Live-Tankstellenpreise aus Vorarlberg**, Break-even-Kurve und Tabelle |
| `tankrechner-einfach.html` | [T2](https://julirai90-glitch.github.io/claude_code_git_workspace/tankrechner/tankrechner-einfach.html) | Ortsunabhängig. Zwei Preise, Umweg in Kilometern frei eingebbar. Deckt den Fall «ich bin ohnehin unterwegs» ab |
| `tankrechner-graubuenden.html` | [T3](https://julirai90-glitch.github.io/claude_code_git_workspace/tankrechner/tankrechner-graubuenden.html) | Graubünden. 24 Orte inklusive Samnaun, Chur voreingestellt |
| `vorschau.html` | [Vorschau](https://julirai90-glitch.github.io/claude_code_git_workspace/tankrechner/vorschau.html) | Alle drei in einer 696-px-Spalte, mit Rahmen – nur zur Kontrolle, nicht publizieren |

Einbettungscodes stehen in `../EMBEDS.md` als T1 bis T3.

**Wichtiger Unterschied in der Distanzlogik:** T1 und T3 fragen die **einfache** Strecke und
verdoppeln sie (Hin- und Rückfahrt). T2 fragt den **gesamten Mehrweg** inklusive Rückweg. Wer
Code zwischen den Dateien kopiert, muss das beachten – genau daran ist beim Bau von T3 die
Break-even-Formel gescheitert (meldete 13,9 statt 7,0 km).

## Wo was dokumentiert ist

- `_research/quellen.md` – **jede sichtbare Zahl** mit Quelle und Datum: Treibstoffpreise,
  Wechselkurs, CO2-Faktoren, die Herleitung der 19 Rp./km, Zollregeln, Liechtenstein
- `_research/distanzen.md` – Glarner Ortschaften, Distanz- und Fahrzeitmatrix, Methode
- `_research/distanzen-gr.md` – dasselbe für Graubünden, plus Samnaun und sein Zollstatus
- `_research/overlord-review-2026-09-23.md` – Multi-Modell-Review mit Verifikationsstatus je
  Befund; zwei der fünf technischen Befunde hielten der Prüfung nicht stand

## Getroffene Entscheidungen

- **Keine automatische Preispflege** (24.09.2026). Technisch machbar – die TCS-Preisseite lässt
  sich mit headless Chromium auslesen –, aber die Embeds sollen eigenständig bleiben und nicht
  an einer fremden Seite hängen. Folge: Die Startwerte veralten. Alle drei weisen deshalb aus,
  von wann sie stammen. Nachführen von Hand: `REF.ch` in T1, `S` plus die `value`-Attribute in
  T2 und T3, dazu das Datum in der Fussnote.
- **CO2 nur als Verbrennung** (tank-to-wheel), ohne Förderung und Raffinerie. Amtlich belegt und
  eindeutig definiert; mit Vorketten läge der Wert rund ein Fünftel höher.
- **Zeit wird genannt, nicht bepreist.** Ein Stundenansatz wäre frei gewählt.
- **Kein CO2-Preis.** Die Schweiz erhebt auf Treibstoffe keine CO2-Abgabe.
- **Fahrzeugkosten 19 Rp./km**, nicht die oft zitierten 74 Rp. – darin stecken Fixkosten, die
  auch ohne die Fahrt anfallen. Herleitung in `quellen.md`.

## Einordnung des Ergebnisses

Der Rechner liefert für weite Fahrten fast immer ein Minus. Das ist geprüft und robust:
Glarus–Feldkirch bleibt selbst bei **null** Fahrzeugkosten und 30 Rappen Preisvorteil bei
−7 Franken. Bei mittleren Distanzen um 40 km entscheidet dagegen der Kostensatz über das
Vorzeichen – dort ist das Modell angreifbar, weil die Wertminderung in den 19 Rappen nicht
rein kilometerabhängig ist. Die 19 Rappen sind die obere Grenze, nicht die Mitte.

**Der Widerspruch zum realen Tanktourismus löst sich über die Distanz.** Tanktourismus gibt es
massiv – rund 10 Prozent des Schweizer Benzinabsatzes gingen an Grenzgänger (386 Mio. Liter
2008, Studie BFE/Erdöl-Vereinigung, Daten 2001–2008). Aber erstens lief er in die
Gegenrichtung: Ausländer tankten in der Schweiz, weil es hier billiger war. Dass die Schweiz
heute teurer ist als Österreich, ist die Umkehrung einer jahrzehntelangen Lage. Und zweitens
ist Tanktourismus ein Grenzphänomen: Basel, Kreuzlingen und Genf liegen ein bis fünf Kilometer
von der Grenze, Chur und Glarus 55 bis 60. Der Rechner sagt nicht «lohnt sich nie», sondern
«von hier aus nicht».

## Technische Fallstricke

- **`iFrameResize(opt, '#a', '#b')` funktioniert nicht.** Die Bibliothek verarbeitet nur den
  ersten Selektor, die übrigen iframes bleiben bei 150 px. Ein Selektor-String mit Kommas
  verwenden. Das falsche Muster stand lange in `EMBEDS.md` und betrifft auch ältere Embeds.
- **`height:100%` im iframe ist gefährlich.** Fällt der Resizer aus, bleiben 150 px statt einer
  brauchbaren Höhe. Stattdessen `min-height` setzen – es stört den Resizer nicht und fängt
  seinen Ausfall ab.
- **Zugeklappte `<details>` verfälschen `lowestElement`.** Chrome liefert dafür veraltete
  Rects; die Embeds geben deshalb selbst `documentElementScroll` vor.
- **Eingabefelder:** `num()` clampt den Zustand, korrigiert das Feld aber nur bei unmöglichen
  Werten sofort – sonst liesse sich in einem Feld mit Minimum 5 keine 12 mehr tippen.

## Offen

- **Redaktionell:** Rappengenaue Ausgaben bei groben Annahmen (Scheingenauigkeit); und ob die
  Voreinstellung Vorarlberg in T1 bleiben soll, obwohl sie die eigene Leitfrage sofort verneint.
- **Ungeprüft:** Ob an allen 24 Orten in Graubünden eine Tankstelle steht – die Overpass-API
  antwortete über vier Anläufe mit Timeouts. Für Glarus ist es geprüft.
- **Nicht abgebildet:** Verbundfahrten in T1 und T3 (Einkauf plus Tanken). Dafür ist T2 da.
