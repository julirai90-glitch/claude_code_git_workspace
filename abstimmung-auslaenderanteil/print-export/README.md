# Daten für Print-Grafiken — «Keine 10-Millionen-Schweiz!» (14.06.2026)

Drei CSV-Dateien (Semikolon-getrennt, UTF-8), je mit allen Werten zum Nachbauen der Grafiken.

---

## 1. `01-stimmverhalten-auslaenderanteil.csv` — Streudiagramm

- **X-Achse:** Ausländeranteil (%) — Spalte `Auslaenderanteil_Prozent`
- **Y-Achse:** Ja-Anteil «Keine 10-Millionen-Schweiz!» (%) — Spalte `Ja_Anteil_Prozent`
- **Punktgrösse:** proportional zu `Bevoelkerung` (Wurzel-Skala empfohlen, nicht linear — sonst dominiert Chur (39'740) zu stark)
- **Punktfarbe:** Blau `#0068A4` bei `Resultat = angenommen`, Orange `#EE7733` bei `Resultat = abgelehnt`
- **Referenzlinie:** horizontal bei 50 % (Mehrheitsschwelle)
- **Trendlinie:** Ja-Anteil = −0.1285 × Ausländeranteil + 53.825 (Pearson r = −0.12, **kein statistisch klarer Zusammenhang** — bitte nicht stärker betonen als die Punktwolke selbst zeigt)
- **n = 100** Gemeinden

## 2. `02-top15-tourismusorte.csv` — Balken/Ranking

- Sortiert nach Logiernächten 2025 (`Rang` 1–15, Davos grösster Tourismusort)
- **Balkenlänge:** `Ja_Anteil_Prozent`
- **Balkenfarbe:** Blau `#0068A4` bei `Resultat = angenommen`, Orange `#EE7733` bei `Resultat = abgelehnt`
- **Referenzlinie:** vertikal/horizontal bei 50 % (je nach Balkenrichtung)
- 11 von 15 lehnten ab (Schnitt 46.6 % vs. 51.6 % kantonal) — **statistisch über alle 38 Tourismus-Gemeinden nicht robust** (p≈0.08–0.11), Hinweis dazu im Begleittext sinnvoll

## 3. `03-maenneranteil-ja-stimmen.csv` — Streudiagramm

- **X-Achse:** Männeranteil an der Wohnbevölkerung 2024 (%) — Spalte `Maenneranteil_Prozent`
- **Y-Achse:** Ja-Anteil (%) — Spalte `Ja_Anteil_Prozent`
- **Punktgrösse:** proportional zu `Bevoelkerung` (Wurzel-Skala)
- **Punktfarbe:** gleiches Schema wie oben (Blau/Orange nach Resultat)
- **Referenzlinie:** horizontal bei 50 %
- **Trendlinie:** Ja-Anteil = 1.4432 × Männeranteil − 22.024 (Pearson r = 0.34, schwacher, aber statistisch robuster Zusammenhang — hält Rangkorrelation, Ausreissertest und Kontrolle für Gemeindegrösse stand)
- **Männeranteil-Spannweite ist eng** (45.9–56.6 %) — X-Achse nicht auf 0–100 % zoomen, sonst verschwindet die Punktwolke; eng um die tatsächliche Spannweite zoomen (z.B. 44–58 %)
- **n = 100** Gemeinden

---

## Allgemein

- **Quellen:** Kanton Graubünden, Statistikdaten Abstimmungen, 14.06.2026 · BFS STATPOP (Ausländeranteil, provisorisch, Stand 31.12.2025) · Statistik Graubünden Demografie 2024 (Männeranteil) · BFS HESTA via data.gr.ch (Logiernächte 2025)
- **Credit:** Grafik: Südostschweiz/Julian Reich
- **Farbcodierung durchgängig:** Südostschweiz-Blau `#0068A4` = angenommen, Orange `#EE7733` = abgelehnt
- Bei Rückfragen zu Achsen-Skalierung oder Methodik: Julian Reich
