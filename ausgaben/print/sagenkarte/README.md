# Sagenkarte Graubünden – Terra Grischuna (Print, Doppelseite 2× A4 quer = 420×297 mm)

**Dateien**
- `sagenkarte_doppelseite.svg` – Arbeitsdatei für die Grafik (Ebenen als `<g id>`: kanton, orientierung-orte, punkte, legende, massstab, hoehenstreifen, liste, quelle, hilfslinie-bund). Masse in mm.
- `sagenkarte_doppelseite.pdf` – dasselbe als PDF · `vorschau.png` – Vorschau
- `sagenorte_schorta.csv` – Daten (61 Namen, LV95, Höhe, Verortungsstatus)
- `buch.tsv`, `final.py`, `svg.py` – Rohliste und Skripte (reproduzierbar)

**Quellen**
- Namen, Kategorien, Bedeutungen: Andrea Schorta, «Wie der Berg zu seinem Namen kam», Ediziun Rein 2022, ISBN 978-3-033-09186-3.
  Annahme: Die Liste wurde (vermutlich KI-gestützt) aus dem Buch extrahiert – Einträge noch nicht seitengenau gegen das Buch geprüft.
- Koordinaten: swisstopo SearchServer (api3.geo.admin.ch, Gazetteer/swissNAMES3D), Abruf 10.11.2026
- Höhen: swisstopo Höhen-Service (api3.geo.admin.ch/rest/services/height), Abruf 10.11.2026
- Kantonsgrenze: swissBOUNDARIES3D (Layer ch.swisstopo.swissboundaries3d-kanton-flaeche.fill), Abruf 10.11.2026

**Verortung** (Spalte `verortung`)
- `exakt` (28): Name bei swisstopo gefunden, Gemeinde passt
- `ähnlich` (9): Schreibvariante, benachbartes Objekt oder Gemeinde weicht ab – siehe Bemerkung
- `nur Ort` (24): Name bei swisstopo nicht gefunden, Punkt auf Dorf/Gemeinde gesetzt → Lage ungefähr, gestrichelt dargestellt, keine Höhe

Höhenstreifen: nur `exakt` + `ähnlich` (37 Punkte); Median pro Kategorie ab 3 Werten. Richtstätten: nur 1 Höhenwert.

**Offen / prüfen**
- 23 «nur Ort»-Einträge: genaue Lage im Buch nachschlagen
- Korrekturen vom 10.11. (aus KI-Antwort, am gedruckten Buch zu prüfen): Nr. 2 = Nr. 44 zusammengeführt (Crap Sgnè / Platta da las Strias, KUL); Nr. 49 nach Parsonz; Nr. 33 ungefähr auf Grat hinter Plaun Segnas
- Widerspruch Diavolezza: Buch (gemäss Liste) leitet von *diavel* ab; andere Deutung: Sage der Bergfee
- Nr. 26 Cuvels da las Dialas (Tarasp) ≠ swisstopo «Fora da las Dialas» bei Scuol?
- Nr. 46 Unghürboda (Safien): swisstopo kennt nur «Unghürboden» in Klosters
- Nr. 59 Grip Sunteri (Scuol): swisstopo nur «Sunteri Tschanüff» in Valsot
- Nr. 51 Lagh della Tempesta: nur «Val Tempesta» gefunden
- Punkte im Bund (Mitte 210 mm) verschieben/abdecken
