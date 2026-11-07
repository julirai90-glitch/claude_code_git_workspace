# Quellen

## Daten
- **OpenParlData.ch**, API `https://api.openparldata.ch/v1/`, body_id 42 (Bundesparlament),
  Lizenz CC BY 4.0, «Source: OpenParlData.ch». Abruf: siehe `data/fetch_meta.json` (UTC-Zeitstempel).
  Rohdaten stammen von parlament.ch (Feld `url_external` der Abstimmungen verweist auf die
  offiziellen Abstimmungs-Excel-Dateien der Parlamentsdienste).
- Reproduzierbar: `python3 scripts/01_fetch.py`, danach `scripts/02_analyse.py`.

## Ausgangslage Wahlen 2027 (Medienberichte)
Alle aus dem Somedia-Artikelarchiv (DRIVE), abgerufen 07.11.2026; Online-URLs im Archiv nicht hinterlegt.

| Datum | Medium / Titel | Belegte Aussage |
|---|---|---|
| 24.09.2026 | Keystone-SDA, «Bündner FDP-Nationalrätin Giacometti tritt Ende November zurück» ([swissinfo](https://www.swissinfo.ch/ger/b%C3%BCndner-fdp-nationalr%C3%A4tin-giacometti-tritt-ende-november-zur%C3%BCck/92114371)) | Giacometti tritt per Ende November 2026 zurück; Herbstsession 2026 war ihre letzte; Nachfolger Christian Rathgeb (zweitbestes Resultat FDP-Liste); Engler tritt 2027 nicht an; Candinas interessiert an Engler-Nachfolge; GR hat ab 2027 nur noch 4 statt 5 Nationalratssitze. |
| 06.11.2026 | Südostschweiz (Sarina von Weissenfluh), «Überraschender Rücktritt: Martin Schmid kandidiert 2027 nicht mehr für den Ständerat» | Schmid (FDP, seit 2011 im Ständerat) kandidiert 2027 nicht mehr; Engler hatte im Mai 2026 ebenfalls Verzicht angekündigt; Martin Bühler (FDP, Regierungspräsident) bewirbt sich um FDP-Nomination. |
| 06.11.2026 | Südostschweiz, «So viel hatte Graubünden lange nicht zu wählen …» | Engler ist amtierender Ständeratspräsident; Candinas war Nationalratspräsident 2022/23. |

Hinweis: Die SDA-Meldung vom 24.09.2026 schrieb noch, Schmid wolle in Bern bleiben, und bezeichnete ihn als «Mitte» – beides überholt bzw. falsch (Schmid ist FDP, Verzicht am 06.11.2026).
Widerspruch in den Quellen: Wahltermin wird einmal «September», einmal «Oktober 2027» genannt → auf der Seite kein Datum genannt.
