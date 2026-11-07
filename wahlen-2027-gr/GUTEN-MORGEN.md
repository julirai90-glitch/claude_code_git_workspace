# Guten Morgen

## 1. Was gebaut wurde
Die interaktive Seite **«Wie bündnerisch stimmt Bern?»** wertet alle elektronischen Abstimmungen der laufenden Legislatur aus: 4’201 im Nationalrat und 2’058 im Ständerat, Stand Ende Herbstsession 2026. Dazu kommen die eingereichten Vorstösse der sieben Bündner Mitglieder.

Die Seite zeigt:
- wer aus der Delegation mit wem stimmt,
- wie oft die fünf Bündner Nationalratsmitglieder geschlossen abstimmen, heute und seit 2007,
- wie die Delegation bei Bündner Themen gestimmt hat: Wolf, Tourismus, Zweitwohnungen, Wasserkraft, Berggebiet,
- eine Bilanz für die drei Abtretenden Engler, Schmid und Giacometti.

Alle Zahlen stammen aus Skripten, keine ist von Hand getippt. Die Hauptquelle ist der Webservice der Parlamentsdienste. Ein zweiter, unabhängiger Datenweg (OpenParlData) dient zur Kreuzprüfung.

## 2. Verwenden / einsetzen
- **Live (gepusht, wie besprochen):** https://julirai90-glitch.github.io/claude_code_git_workspace/wahlen-2027-gr/
  Oben steht der Hinweis «Entwurf · noch nicht redaktionell geprüft». Im Fuss steht «Umsetzung: Claude (KI-Assistent) im Auftrag von Julian Reich». Beides können Sie nach Ihrer Prüfung in `index.html` anpassen.
- **Einsatz als Artikelgrundlage:** Die Kernbefunde stehen oben auf der Seite. Die Liste der 14 Abstimmungen «geschlossen über Fraktionsgrenzen» (Abschnitt 3) liefert Stoff für Nachfragen bei den Parlamentarierinnen und Parlamentariern.
- **Vorschlag, nicht entschieden:** Nach der Wintersession 2026 aktualisieren, dann mit Rathgeb (Anleitung in `README.md`). Einzelne Abschnitte liessen sich als Embed herauslösen, etwa die Matrix oder der Rückblick.

## 3. Screenshots (`screenshots/`)
- `desktop-oben.jpg`: Einstieg mit Kernbefunden
- `iphone-oben.jpg`: dasselbe auf dem Handy
- `matrix.jpg`: wer mit wem stimmt
- `geschlossenheit.jpg`: Abschnitt 3 mit Rückblick und den 14 Abstimmungen
- `themen-wolf.jpg`: Thema Wolf, Abstimmung für Abstimmung
- `abtretende.jpg`: Karten der Abtretenden und Vorstoss-Tabelle

## 4. Was funktioniert, was nicht, was als Nächstes

**Befunde (deskriptiv, aus den Daten):**
- Geschlossene Delegation: In 305 von 3’287 Nationalratsabstimmungen mit voller Teilnahme stimmten alle fünf gleich, das sind 9 %.
- Über Fraktionsgrenzen hinweg geschlossen: 14 Abstimmungen. In 10 davon wich Jon Pult von der SP ab, in 4 Anna Giacometti von der FDP (nachgezählt aus `data/page.json`).
- Paare: Martullo-Blocher und Hug stimmten in 97 % gleich. Pult und Martullo-Blocher in 13 %.
- Ständerat: Engler und Schmid stimmten in 78 % der Abstimmungen gleich, an denen beide teilnahmen. Engler führte in 662 Abstimmungen den Vorsitz.
- Rückblick, Anteil geschlossener Abstimmungen: 40 % (2007–11), 14 % (2011–15), 11 % (2015–19), 14 % (2019–23), 9 % (2023–26). Die Delegationen waren jeweils anders zusammengesetzt.
- Vorstösse in dieser Legislatur (als Urheberin/Urheber): Candinas 47, Pult 27, Giacometti 18, Martullo-Blocher 9, Hug 8, Engler 5, Schmid 3.

**Prüfung:**
- Kreuzprüfung Nationalrat: 540’607 Einzelstimmen stimmen in beiden Quellen überein, 4 weichen ab. 11’238 Stimmen liessen sich nicht zuordnen, weil bei OpenParlData Personendatensätze fehlen.
- Kreuzprüfung Ständerat, Sommer 2026: 6’970 von 6’970 Einzelstimmen identisch.
- Seite getestet auf Desktop, iPhone 13 und Pixel 7: keine Konsolenfehler, kein horizontales Scrollen. Ladezeit lokal rund 0,7 s, Datenpaket live 243 KB komprimiert.

**Befund zur Datenquelle:** OpenParlData enthält Nationalratsabstimmungen nur bis zur Herbstsession 2025, dort fehlen rund 1’400 Abstimmungen. Deshalb stammt der Nationalrat aus der Primärquelle ws.parlament.ch. Das ist auch für andere Projekte relevant.

**Was nicht ideal ist:**
- Die Themenauswahl beruht auf Stichwörtern im Geschäftstitel. Sie ist offengelegt, aber unvollständig und enthält Randtreffer wie «Shoppingtourismus».
- «Auf der Seite der Mehrheit» ist eine einfache Auszählung. Ein qualifiziertes Mehr, etwa bei der Ausgabenbremse, ist nicht modelliert.
- Die Seite ist lang und hat keine Sprungnavigation.

**Als Nächstes (Vorschläge):**
- Eine Bilanz von Engler und Schmid über alle 16 Jahre. Ständerats-Namenslisten gibt es ab 2014 als Excel, sie sind noch nicht geparst.
- Rathgeb ab der Wintersession aufnehmen.
- Nachfragen zu den 14 Abstimmungen über Fraktionsgrenzen.

## 5. Annahmen und Unsicherheiten
- **Annahme:** Die 52. Legislatur beginnt am 4.12.2023 (Wintersession). Belegt durch die LegislativePeriod-Tabelle von ws.parlament.ch.
- **Annahme:** Die Fraktionsposition ist die häufigste Stimme unter den teilnehmenden Fraktionsmitgliedern, die Person selbst eingeschlossen. Bei Gleichstand gibt es keine Position.
- **Nicht sicher:** ob die Fraktionscodes in den früheren Legislaturen des Webservices historisch korrekt sind. Candinas erscheint 2011–15 schon als «M-E». Der Rückblick zeigt deshalb keine Fraktionen.
- **Nicht sicher:** Wahltermin 2027. Die Quellen nennen einmal «September» und einmal «Oktober». Auf der Seite steht deshalb kein Datum.
- **Zu Ihrer Angabe zu Schmid:** Die SDA-Meldung vom 24.09.2026 sagte noch, Schmid wolle bleiben, und bezeichnete ihn als «Mitte». Beides ist durch den Südostschweiz-Artikel vom 06.11.2026 überholt. Den Artikel fand ich im Somedia-Archiv, dort ist keine Online-URL hinterlegt.
- Die Angaben zu den Personen («seit 2011», «seit 2019», «derzeit Ständeratspräsident», «Mai 2026») stammen aus den in `QUELLEN.md` genannten Artikeln.

## 6. Arbeitszeit und Unterbrüche
- Start 23:00, letzter Arbeitsschritt vor der Übergabe um ca. 23:42. Das ergibt rund 42 Minuten, gemäss den Git-Zeitstempeln von 23:00 bis 23:40 (Lokalzeit).
- Es gab keinen Unterbruch durch das Nutzungslimit. Keiner der Weckrufe (02:00, 04:00, 05:45) musste wirken. Ich lösche sie beim Aufräumen, damit sie Sie in der Nacht nicht stören.

## 7. Nicht getestet
- Echte Wischgesten auf echten Geräten. Getestet wurde nur mit Emulation.
- Safari auf iOS selbst. Die Emulation nutzt Chromium.
- Das Verhalten bei sehr langsamer Verbindung. Gemessen wurde nur die Grösse (243 KB komprimiert), keine Drosselung.
- Die Einbettung in das Südostschweiz-CMS.

## 8. Veröffentlichungsstatus
- **Gepusht auf `gh-pages`:** ja, wie von Ihnen erlaubt. Die Seite ist öffentlich, mit dem Hinweis «Entwurf».
- Die Commits sind im Log unter `wahlen-2027-gr` zu finden (`git log -- wahlen-2027-gr`).
- Nicht committet sind die Rohdaten (`data/raw/`, ca. 60 MB) und `data/abstimmungen.json`. Beides lässt sich mit den Skripten neu erzeugen.
