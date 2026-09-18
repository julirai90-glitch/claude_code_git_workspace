# Stau-Alarm in die Redaktion – Konzept

Konzept vom 10.08.2026. **Gebaut am 15.09.2026** als n8n-Workflow
`zbVshbyGJuFYBWeK` «Verkehr GR – Alarm (Mail)» – Stand der Umsetzung unten.

## Warum

Die Erkennung funktioniert, das Problem ist die Zustellung. Am 10.08.2026 zeigte das
Dashboard den gesperrten Kerenzerbergtunnel um **07:25 Uhr** an (Weesen 34 km/h statt
100) und grenzte den Ort allein aus den Messwerten ein. Nur schaut um Viertel nach
sieben niemand auf eine Website. Ein Signal, das niemanden erreicht, ist keins –
darum braucht es eine aktive Meldung.

## Rekonstruktion 10.08.2026 (aus `f=today`, 5-Minuten-Reihe)

| Zeit | Ereignis | Quelle |
|---|---|---|
| kurz nach 07:00 | Unfall im Tunnel, Sperrung unmittelbar danach | Kapo Glarus |
| 07:15 | Sperrung im ASTRA-Feed erfasst | DATEX II |
| 07:20 | Weesen zäh: 71 km/h | Zählstelle CH:0053 |
| 07:25 | **Weesen Stau: 34 km/h** | Zählstelle CH:0053 |
| 07:40 | Niederurnen Stau: 16 km/h (Rückstau wächst) | Zählstelle CH:0830 |
| 08:05 | Reichenburg Stau: 41 km/h | Zählstelle CH:0314 |

Ortung ohne Vorwissen: Um 07:25 stand Weesen bei 34 km/h, **Walenstadt gleichzeitig bei
120 km/h**. Die Blockade lag damit zwischen diesen beiden Zählstellen – dort steht der
Tunnel. Diese Einkreisung gehört in jede Alarmmeldung.

## Auslöseregel (von Julian gewählt, 10.08.2026)

Hauptachsen (A13/A3/A28), Stufe «Stau», mindestens 30 Minuten am Stück.

Getestet über 42 Tage (29.06.–09.08.2026):

| Variante | Alarme/Tag | Mo–Do | Sonntag |
|---|---|---|---|
| roh | 4.0 | 2.4 | 7.2 |
| **B: max. 1 pro Standort und Tag** | 2.4 | 1.4 | 4.8 |
| **C: wie B, ohne Rothenbrunnen/Isla Bella** | **2.0** | 1.2 | 4.3 |

Ohne Entprellung sind es 166 Alarme in 42 Tagen – zu viel für einen Push. **Variante C
ist die empfohlene Regel.** Rothenbrunnen/Isla Bella allein stellt 33 der 166 Ereignisse
(20 %): Die Stelle ist ein chronischer Engpass, dort ist Stau keine Nachricht. Wer sie
drin behalten will, sollte für sie eine höhere Schwelle setzen statt sie ganz zu streichen.

## Inhalt der Meldung

- Ort, Strasse, Richtung
- gemessenes Tempo und das ortsübliche zum Vergleich («34 statt 100 km/h»)
- seit wann
- **Einkreisung**: nächste Zählstelle in Fahrtrichtung, die noch frei ist
- liegt eine amtliche ASTRA-Meldung für den Abschnitt vor?
  - ja → Ursache mitschicken (Unfall, Baustelle, Überlastung)
  - **nein → ausdrücklich vermerken.** Genau dann ist die Redaktion früher dran als die
    amtliche Meldung, und genau das ist der Wert des Ganzen.
- Link auf den `?view=stau`-Embed

## Zwei getrennte Anwendungsfälle

**Ereignis-Ticker** (wie 10.08.): Push nötig, Embed `?view=stau` läuft im Artikel mit
und aktualisiert sich selbst.

**Wochenend-Stauticker**: kein Alarm nötig, das ist Disposition. Der Sonntag 09.08.2026
ergab 480 Minuten Stau an 6 Standorten, und die Rückreisewelle wandert sichtbar nordwärts:

| Zeit | Ort | langsamstes Tempo |
|---|---|---|
| 13:30–14:15 | San Bernardino-Tunnel Ri. Nord | 18 km/h |
| 15:30–17:15 | Maienfeld A13 Ri. Nord (105 Min) | 22 km/h |
| 16:45–17:15 | Rothenbrunnen/Isla Bella | 22 km/h |
| 16:45–18:15 | Weesen/Kerenzerberg A3 Ri. Zürich (90 Min) | 34 km/h |
| 16:45–18:15 | Niederurnen A3 Ri. Zürich (3 Phasen) | 17 km/h |
| 17:00–17:30 | Glarus N | 18 km/h |

Fünf Stunden von Süden ins Linthgebiet. Daraus lässt sich sonntags um 14 Uhr sagen, wo
der Stau um 17 Uhr stehen wird – und am Abend ein Rückblick aus dem Archiv bauen.

## Umsetzung (15.09.2026)

Workflow `zbVshbyGJuFYBWeK` «Verkehr GR – Alarm (Mail)», aktiv, alle 15 Minuten,
rund um die Uhr, Mail an die Redaktionsadresse über das Gmail-Credential
«Gmail account terra» (Empfänger steht im Gmail-Node, bewusst nicht hier – dieses
Repo ist öffentlich). Von Julian gewählte Einstellungen: alle drei Quellen,
Bündelung auf 15 Minuten, 24/7.

**Bewusst ein vierter, eigener Workflow.** Er liest die drei bestehenden nur über
ihre Webhooks (`f=latest`, `f=baseline`, `f=today`, `verkehr-meldungen`,
`verkehr-strassen-gr`) und fasst sie nicht an – dieselbe Trennung, aus der auch
ASTRA und TBA je einen eigenen Workflow bekommen haben. Ein Fehler im Alarm kann
die laufende Zähler-Pipeline nicht mitreissen.

Code versioniert in `_research/n8n_alarm_detect.js` (Erkennung) und
`_research/n8n_alarm_mail.js` (Mail). Das ist die Soll-Fassung; der Live-Stand
steht in n8n und wurde beim Deployment per sha256 gegen diese Dateien geprüft.

**Die Klassifikation ist aus `verkehr-dashboard-kacheln.html` dupliziert**
(`classify` / `buildFreeflow` / `recentSpeed` / `flow15` / `lageSince`, samt aller
Schwellen). n8n kann die HTML-Datei nicht laden, ein Import war nicht möglich.
Das ist die grösste Schwachstelle der Konstruktion: Wer im Dashboard eine Schwelle
ändert und hier nicht nachzieht, bekommt eine Mail, die etwas anderes behauptet
als die Kachel – und merkt es nicht. Der Spuren-Katalog hat dasselbe Problem an
drei Orten; dies ist der vierte.

### Drei Auslöser

| Quelle | Regel |
|---|---|
| Zählstellen | Variante C: Hauptachsen, Stufe «Stau», ≥ 30 Min, max. 1 pro Standort und Richtung und Tag, ohne CH:0611 Rothenbrunnen/Isla Bella |
| ASTRA | jede neue Meldung im bestehenden Regionsfilter |
| TBA GR | jede neue Meldung (Strasse + Zustand + Art) |

### Entscheide beim Bauen, die im Konzept noch nicht standen

- **Seeding beim ersten Lauf.** Beim Start ist formal jede laufende Meldung «neu» –
  die Brienzerstrasse ist seit November 2024 gesperrt. Der erste produktive Lauf
  merkt sich darum nur den Stand und schweigt. Ohne das käme zum Start eine Mail
  mit der ganzen Altlast.
- **Geplante ASTRA-Baustellen werden unterdrückt.** Beim Test am 15.09.2026 stand
  im Feed eine Sperrung mit `beginnt = 14.11.2026` – eine Ankündigung, keine Lage.
  Alarmiert wird nur, was läuft oder binnen 2 Stunden beginnt.
- **Einkreisung beidseitig.** Die nächsten Nachbarstellen auf derselben Achse,
  je zwei pro Seite, mit Himmelsrichtung und Distanz. Einseitig wäre die
  Eingrenzung wertlos gewesen: Weesens drei nächste Nachbarn liegen alle westlich,
  der entscheidende Gegenbeleg vom 10.08. war aber Walenstadt 17,6 km **östlich**
  bei 120 km/h. Die Fahrtrichtung wird bewusst nicht behauptet – was «positive»
  geografisch heisst, ist aus dem Feed nicht belegt. Die Himmelsrichtung ist aus
  den Koordinaten belegbar, die Fahrtrichtung nicht.
- **Der Hinweis «Keine amtliche Meldung» wurde am 15.09.2026 aus der Mail gestrichen**
  (Julians Entscheid, Mailtext soll knapp bleiben). Das Feld `astraHinweis` wird im
  Erkennungs-Node weiterhin berechnet und steht in den Daten – nur angezeigt wird es
  nicht mehr. Wer es zurückholen will, braucht nur die Zeile im Mail-Node.
- **Abbruch statt stiller Leermeldung.** Liefert eine Quelle strukturell nichts
  mehr, bricht der Lauf mit Fehler ab, statt «nichts Neues» zu melden. Ein
  fehlgeschlagener Lauf ist in n8n sichtbar, Schweigen nicht. Das ist dieselbe
  Regel, die nach dem Overlord-Review vom 24.08.2026 für den TBA-Parser gilt.
- **Sprachregel gilt auch in der Mail.** Zählstellen melden «Deutlich langsamer als
  üblich» bzw. «Schritttempo», nur ASTRA und TBA sagen «Stau» und «gesperrt».

### Links in der Mail (15.09.2026)

Jeder Block trägt Links; bei den Zählstellen auf die Kachel, den Tagesverlauf und die
Übersicht der auffälligen Stellen, bei den TBA-Meldungen auf `strassen.gr.ch`.

**Zu einer einzelnen ASTRA-Meldung gibt es keinen amtlichen Link.** Nachgeprüft am
15.09.2026 im Roh-XML (161 `situationRecord` aus dem Live-Feed): Die Meldungen tragen
nur eine interne Id der Form `situation.652879.1.1.1`, das XML enthält ausser den
Schema-Namespaces **keine einzige URL**. Auch aussen herum gibt es nichts:
`verkehrsinfo.ch` und `autobahnschweiz.ch` antworten nicht, `map.geo.admin.ch` führt
keinen Echtzeit-Verkehrslage-Layer, und die ASTRA-Seite `astra.admin.ch/de/verkehrsdaten`
verlinkt selbst keine öffentliche Live-Karte. Der Link geht darum auf die
Meldungsansicht des eigenen Dashboards, die denselben amtlichen Wortlaut zeigt; die
Mail weist diese Grenze im Fussbereich aus. Zusätzlich steht neu der TMC-Code in der
Meldung – über ihn liesse sich später an die Zählstellen anknüpfen.

**Gegencheck TCS (von Julian verlangt, 15.09.2026).** Weil das ASTRA keine
Einzelmeldung ausweist, trägt jeder ASTRA-Block einen Link auf die TCS-Verkehrslage
(`tcs.ch/de/tools/verkehrsinfo-verkehrslage/aktuelle-lage.php`) mit der Aufforderung,
vor der Publikation dort gegenzulesen. In der Mail steht ausdrücklich, dass der TCS
**nicht amtlich** ist – sonst liest sich der Link wie eine zweite Amtsquelle, und er
ist der Gegencheck, nicht die Bestätigung. Der Hinweis steht doppelt: unter jeder
Meldung und im Fussbereich.

`strassen.gr.ch` kennt ebenfalls keine Deep-Links: Der JSON-Endpunkt liefert je Meldung
nur `Id`, `Message`, `MessageTime`, `RegionDescription`, `RegionNumber` und `Icon`, und
die Seite wertet keine Query-Parameter aus. Der Link führt deshalb auf die Übersicht.

**Fallstrick bei den Dashboard-Links:** `?site=` wirkt nur zusammen mit `?view=` –
ohne `view` wird der Parameter ignoriert und man landet auf der Gesamtübersicht.
Gültige Views: `voll`, `tile`, `chart`, `stau`, `meldungen`. Geprüft wurde ausserdem,
dass die auf GitHub Pages **publizierte** Fassung diese Parameter kennt: Sie ist
byte-identisch mit der Arbeitskopie (sha256 `73eb1ef0…`, 81'823 Bytes).

### Fehler im Betrieb: leere Mail am 16.09.2026, 07:30

Um 07:30 ging eine vollständig leere Alarm-Mail raus – Betreff «Verkehr GR:» ohne
Inhalt, Body ohne einen einzigen Block. Ausgelöst hatte sie die neue TBA-Meldung
«Reschenstrasse gesperrt zwischen Kajetansbrücke und Nauders».

**Ursache:** Der Alarm wurde mit `{ typ: 'tba', ...m }` gebaut. Die TBA-Meldungen
führen aber **selbst ein Feld `typ`** (Wert `'zustand'`), und weil der Spread nach
dem Schlüssel steht, überschrieb er ihn. Der Mail-Node filtert auf `typ === 'tba'`,
fand nichts und rendert entsprechend nichts – verschickte aber trotzdem, weil
`anzahl` grösser null war und die IF-Weiche korrekt aufging. ASTRA war nie
betroffen, dessen Meldungen haben kein `typ`-Feld.

**Behoben** durch einen Schlüssel, der nicht kollidieren kann: `_quelle` statt `typ`,
und der Spread steht jetzt vorne. Dazu zwei Prüfungen: Der Erkennungs-Node wirft,
wenn ein Alarm keine gültige Quelle trägt; der Mail-Node wirft, wenn trotz
gemeldeter Alarme kein Block darstellbar ist. Beides ist als fehlgeschlagener Lauf
in n8n sichtbar – anders als eine leere Mail.

**Lehre für künftige Quellen:** Fremde Meldungsobjekte werden unverändert
weitergereicht, ihre Feldnamen sind also nicht unter unserer Kontrolle. Eigene
Schlüssel gehören deshalb hinter den Spread und tragen einen Unterstrich.

### Regionalisierung und Filter (17.09.2026)

Vier Redaktionsgebiete, je eine eigene Mail mit der Region im Betreff: **Graubünden,
Glarus, Sarganserland, Linth**. Zählstellen werden über ihre Id zugeordnet, Meldungen
über Ortslisten je Region, TBA-Meldungen immer Graubünden (kantonales Amt, Nebentäler
stehen in keiner Ortsliste).

Zwei Fehler, die dabei sichtbar wurden:

- **«Wangen» ohne Kanton** fing am 17.09. eine A15-Meldung von Dübendorf ein. Die
  gemeinsame 101er-Ortsliste war zu grob; je Region geführt, muss man genauer benennen.
- **Der Korridor-Präfix** («A3 Zürich → *Chur* zwischen Walenstadt und Mels») nennt das
  Fahrtziel, nicht den Abschnitt. Ohne Abschneiden landet jede Meldung Richtung Chur
  bei der Bündner Redaktion. Dieselbe Regel gilt im ASTRA-Parser schon.

**Auslöseregel Zählstellen, drei Wege – einer genügt:**

1. Schritttempo unter 25 km/h
2. breite Welle: mindestens zwei weitere Messstellen gleichzeitig auffällig
3. sonst: mindestens eine weitere Stelle **und** ausserhalb der Pendlerzeiten
   (Mo–Fr 6–9 und 16–19 Uhr)

Ergebnis im 42-Tage-Test: 60 Ereignisse statt 78 ungefiltert, also 1,4 statt 1,9 pro Tag.

**Warum Punkt 1 nicht wegfallen darf:** Eine Zwischenfassung ohne die
Schritttempo-Ausnahme kam auf 1,0 Ereignisse pro Tag – hätte aber am 10.08.2026 den
gesperrten Kerenzerbergtunnel **unterdrückt**, weil er auf einen Montagmorgen fiel.
Also genau den Fall, der dieses System begründet hat. Nachgerechnet waren 34 der 42
gefilterten Ereignisse auffällig schwer (unter 25 km/h oder länger als eine Stunde).
Ein Filter, der nach Tageszeit statt nach Schwere entscheidet, wirft das Falsche weg.

Ehrlich dazu: Am 10.08. stand die Sperrung um 07:15 im ASTRA-Feed, die Zählstellen
zeigten sie um 07:25. Der Meldungskanal war also **schneller**. Der Zählstellen-Alarm
ist der Rückfall für Lagen, zu denen gar keine Amtsmeldung kommt – nicht der schnellere
Weg für solche, die gemeldet werden.

### Verifiziert am 15.09.2026

Trockenlauf gegen die echten Payloads, nicht gegen Testdaten: Seeding unterdrückt
12 laufende Meldungen, ein unveränderter Folgelauf meldet 0, eine eingeschleuste
neue ASTRA- und TBA-Meldung kommen durch, die Baustelle mit Beginn in 60 Tagen
wird unterdrückt. Der Kerenzerberg-Fall vom 10.08. wurde nachgestellt (CH:0053,
30 km/h über 55 Min): erkannt mit «sonst 64 km/h», Nachbarn Niederurnen 1,3 km
westlich frei und Walenstadt 17,6 km östlich frei – die Einkreisung aus dem
Konzept. Der Wiederholungslauf alarmiert nicht erneut (Entprellung greift).

**Zustelltest am 15.09.2026:** über einen temporären Workflow mit dem echten
`Mail bauen`-Code und dem echten Gmail-Node ausgelöst; Gmail quittierte mit
Message-Id und Label `SENT`. Der temporäre Workflow wurde danach gelöscht (sein
Webhook antwortet 404). Nicht abgedeckt ist damit die IF-Weiche des Produktiv-
workflows – die ist nur strukturell geprüft und läuft erstmals im Ernstfall.
Ein zweiter Zustelltest am selben Tag prüfte alle drei Meldungstypen samt Links.
Nach jedem Code-Update per PUT wurde ausserdem geprüft, dass der 15-Minuten-Trigger
weiterläuft (Läufe 20:00 bis 21:15 UTC lückenlos) und `staticData` erhalten bleibt –
ginge es verloren, käme ein zweites Seeding und damit ein stiller Tag.

## Offen

- **Zustand geht bei Neustart verloren.** Die Entprellung liegt in `staticData`
  des Workflows. Wird er deaktiviert und neu aktiviert, greift wieder das Seeding –
  das ist gewollt. Bei manuellen Testläufen in der n8n-Oberfläche wird `staticData`
  aber gar nicht erst gespeichert; ein Testlauf beweist darum nichts über die
  Entprellung.
- Kein Nacht-/Ruhefenster (bewusst, 24/7 gewählt). Falls nachts zu viel kommt:
  Zeitfenster im Code-Node ergänzen.
- Die Schwelle «2 aufeinanderfolgende 15-Minuten-Fenster» aus dem Konzept ist
  **nicht** gebaut – stattdessen wirkt die 30-Minuten-Mindestdauer aus `lageSince`,
  die dasselbe Ziel auf den vorhandenen Daten erreicht.
- Verknüpfung Meldung ↔ Kachel über den TMC-Code (13 der 33 GR-Zählstellen sind
  direkt verknüpfbar, für den Rest bräuchte es Nachbarschaftslogik entlang der
  TMC-Kette). Aktuell läuft der Abgleich über Ortsnamen und ist entsprechend grob.
  Nutzen: Bei signalisierter Engstelle ist «zäh» die vorgeschriebene Betriebsart und
  kein Stau – siehe Gegenverkehr im Kerenzerbergtunnel am 10.08., wo 50 km/h bei
  signalisiertem Tempo 60 als «zäh» gemeldet wurden, obwohl der Verkehr normal lief.
- Fehlalarmquote im Echtbetrieb ist unbelegt. Die 2.0 Alarme/Tag stammen aus der
  Rückrechnung über 42 Archivtage, nicht aus dem Livebetrieb.
