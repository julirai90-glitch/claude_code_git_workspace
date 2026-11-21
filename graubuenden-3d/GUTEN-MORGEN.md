# Guten Morgen, Herr Reich

Nachtauftrag vom 20./21.11.2026 – «Graubünden 3D». Am Morgen des 21.11.2026 auf Julians Wunsch gepusht (siehe Punkt 8).

## 1. Was gebaut wurde

**15 neue 3D-Orte** mit der bestehenden Chur-Pipeline: die grössten Gemeinden nach Chur und Davos (Landquart,
Domat/Ems, Ilanz, Scuol, Klosters, Thusis, Poschiavo) und besondere Ortsbilder (Guarda, Soglio, Vals, Zuoz, Arosa,
Flims, Maienfeld, Bergün) – zusammen mit Chur, Davos und St. Moritz jetzt 18 Orte. Dazu, als «etwas komplett anderes»,
eine **Einstiegsseite mit einem Bauzeit-Atlas aller 100 Bündner Gemeinden**: Karte, drei automatisch berechnete Befunde,
Detail pro Gemeinde mit Kantonsvergleich, 100 kleine Diagramme und Kacheln zu allen 3D-Orten. Grundlage ist überall das
Gebäude- und Wohnungsregister (GWR, Export vom 20.11.2026).

## 2. Starten und verwenden

- Lokal: im Repo-Root `python3 -m http.server 8766`, dann `http://localhost:8766/graubuenden-3d/`
- Gemeinde direkt öffnen: `…/graubuenden-3d/?g=Scuol` · Einbettung in Artikel: `…/graubuenden-3d/?embed` (oder
  automatisch im iframe; ohne Titel/Lead, Links öffnen einen neuen Tab). In einer 696-px-Spalte getestet.
- 3D-Orte: `…/<ort>-3d/` (z. B. `scuol-3d/`, `guarda-3d/`). Jede 3D-Seite hat oben rechts «Alle Orte» zurück zum Atlas.
- Neuen Ort bauen: `<ort>-3d/ort.json` anlegen, dann `~/.cache/orte-3d-venv/bin/python chur-3d/_bau_gelaende.py <ort>-3d`,
  `… _bau_gebaeude.py <ort>-3d`, `… _bau_boden.py <ort>-3d [--list]`, Seite aus `chur-3d/index.html` kopieren
  (sed-Befehl in `chur-3d/NOTIZEN.md`), danach `graubuenden-3d/_bau_atlas.py` (nimmt den Ort automatisch in den Atlas auf).
- Veröffentlichen (wenn Sie wollen): `git fetch origin gh-pages`, rebasen, pushen. **Achtung:** Ihr lokaler Stand ist
  43 Commits hinter origin, und `EMBEDS.md`/`.gitignore` haben lokale Änderungen, die nicht von mir sind – ich habe
  deshalb nicht gepullt.

**Einsatz – Vorschlag, nicht entschieden:**
- Serie «Wann wurde Ihr Dorf gebaut?» für die Südostschweiz: pro Region ein Text, Atlas eingebettet, 3D-Ort als Vertiefung.
- Terra Grischuna: Ortsbild-Porträts (Guarda, Soglio, Vals) mit 3D-Ansicht online als Ergänzung zum Heft.
- Gemeinden/Tourismusorganisationen als mögliche Partner für weitere Orte (Pipeline braucht pro Ort wenige Minuten).

## 3. Screenshots (`graubuenden-3d/screenshots/`)

`atlas-desktop.jpg`, `atlas-vergleich.jpg`, `atlas-mobil.jpg`, `3d-sechs-orte.jpg`, `3d-guarda-soglio-vals-zuoz.jpg`,
`3d-arosa-flims-maienfeld-berguen.jpg`, `3d-baujahr-suche.jpg` (Ebene Baujahr + Adresssuche in Scuol und Poschiavo).

## 4. Was gut funktioniert, was nicht, was als Nächstes

Gut:
- Alle 18 3D-Seiten laden ohne Konsolenfehler (Headless-Chromium), Suche, Infobox, Baujahr-Ebene geprüft; Antippen auf
  emuliertem Pixel 7 öffnet die Infobox.
- Atlas: Randfälle per Skript geprüft (ungültiger Link, Umlaute, Schrägstriche in Namen, keine Treffer, Einheit Wohnungen).
- Befunde (live berechnet, nur Gemeinden ≥ 300 Wohngebäude): stärkste Periode im Kanton 1986–1990 (pro Jahr gerechnet);
  höchster Anteil 1961–1980: Zernez 40 %; höchster Anteil seit 2001: Bonaduz 34 %.

Nicht gut / offen:
- **GWR-Lücken sichtbar:** Soglio 332 von 644 Gebäuden ohne Registertreffer (grau), Ilanz/Klosters/Flims/Bergün viele nur
  mit Bauperiode. Die Felsentherme Vals (eröffnet 1996) hat im GWR gar kein Baujahr.
- 3D-Markierungen auf der Atlas-Karte sind auf dem Handy kleine Tippziele (Ausweg: Gemeinde antippen → 3D-Knopf).
- Karte nicht per Tastatur bedienbar (Suche ist der Tastaturweg).

Als Nächstes (Vorschläge):
- Zweitwohnungen: Das GWR zeigt z. B. für Sils 1'233 Wohnungen bei 693 Einwohnern – eine eigene Geschichte.
- Den Befund «vor 1919 heute mehr als im Jahr 2000» (siehe Annahmen) beim BFS oder Amt für Raumentwicklung klären.
- Weitere Orte: Zizers, Bonaduz, Trimmis, Schiers, Samedan, Pontresina, Disentis, Splügen.

## 5. Annahmen und Unsicherheiten

- **Unerwarteter Befund (nicht geprüft):** Das GWR zählt heute 22'630 Bündner Wohngebäude von vor 1919, die
  Volkszählung 2000 (BFS-Tabelle px-x-0902020100_107, gleiche Gebäudekategorien) zählte 16'514. Abbrüche würden die Zahl
  senken. Annahme: umgebaute Ställe/Nebengebäude und Nachträge im Register. Steht so in der Methode der Seite.
- Annahme: GWR-Bauperiode (GBAUP) ist verlässlicher als das Baujahr (GBAUJ fehlt bei rund einem Drittel; 1900 ist ein
  Sammelwert). Der Atlas verwendet deshalb Perioden.
- Einwohner: BFS STATPOP «2025», Annahme: Stand Ende 2025.
- Flächenangaben in den Gebietstexten sind aus den vereinfachten Gemeindepolygonen («rund»); drei Werte hatte ich zuerst
  geschätzt und falsch – korrigiert (Klosters, Vals, Zuoz).
- Ausschnitte (clip) bei grossen Gemeinden sind meine Wahl; im Gebietstext steht jeweils, was fehlt.
- Kartenbeschriftung «Schloss Maienfeld» wie in der swisstopo-Basiskarte (Nicht sicher, ob damit Schloss Brandis gemeint ist).

## 6. Arbeitszeit und Unterbrüche

Laut Git-Zeitstempeln (Europe/Zurich): erster Commit 23:07 (20.11.), letzter 00:14 (21.11.2026); Start der Arbeit 23:04.
Keine Unterbrüche durch das Nutzungslimit. Kein Weckruf war nötig; die drei geplanten Weckrufe (02:00, 04:00, 05:45)
habe ich nach Abschluss gelöscht.

## 7. Nicht getestet

- Echte Handys (nur emuliert: iPhone 13, Pixel 7). Wischen/Pinch in 3D headless nicht echt testbar.
- Ladezeit auf schwachen Geräten: Messung mit 4-facher CPU-Drosselung hing im Software-Renderer und wurde abgebrochen.
  Datenmengen: 1,1 MB (Soglio) bis 4,7 MB (Chur) je Ort plus three.js (CDN).
- Safari/Firefox nicht getestet.
- Einbettung in WoodWing/das echte CMS nicht getestet (nur iframe in einer Testseite).

## 8. Veröffentlichungsstatus

**Gepusht am 21.11.2026** auf `gh-pages` (online unter julirai90-glitch.github.io/claude_code_git_workspace/graubuenden-3d/).
Danach ergänzt: Gebäude, die im 3D-Modell fehlen (z. B. Bahnhof Thusis), als vereinfachte Blöcke über dem
Vermessungsgrundriss – 1'396 in 18 Orten, Details in `chur-3d/NOTIZEN.md`. Der Server-Klon ist wieder synchron mit GitHub.

Geändert ausserhalb der neuen Ordner: `chur-3d/_bau_gebaeude.py`, `chur-3d/_bau_boden.py`, `chur-3d/index.html` + Kopien
in `davos-3d/`, `st-moritz-3d/` (Link «Alle Orte», optionaler Startzoom, vereinfachte Blöcke), `chur-3d/NOTIZEN.md`.
Dateien: `graubuenden-3d/` (Atlas, `_bau_atlas.py`, `atlas.json`, `IDEE.md`, `KRITIK.md`), 15 neue Ordner `<ort>-3d/`.
