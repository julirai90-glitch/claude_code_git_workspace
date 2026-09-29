# Rohdaten des BAG

Dieser Ordner bleibt leer. Die Dateien stammen aus dem Datensatz
«Krankenversicherungsprämien» des Bundesamts für Gesundheit:

https://opendata.swiss/de/dataset/health-insurance-premiums

Benötigt werden:

| Datei | Zweck |
|---|---|
| `Prämien_CH.csv` | alle Prämien (Semikolon, ISO-8859-1) |
| `Prämien_CHEU.xlsx` | enthält im Sheet «Data» die Zuordnung BAG-Nummer → Kassenname |
| `Tarife.xlsx` | Bezeichnungen der Tarife und Altersuntergruppen |
| `Einzugsgebiete.xlsx` | Gemeindeeinschränkungen einzelner Kassen |

Achtung: Zwischen der Freigabe eines neuen Prämienjahrs und der Publikation
(jeweils Ende September, zur Medienkonferenz des Bundesrats) sind die Dateien
auf opendata.swiss bereits ausgetauscht, enthalten aber nur die Kopfzeile.
Eine Datei von wenigen hundert Bytes ist kein Fehler des Skripts.

Lizenz der Daten: «Freie Nutzung. Quellenangabe ist Pflicht.»
