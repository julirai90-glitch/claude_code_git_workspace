# Stau-Alarm in die Redaktion – Konzept

Stand 10.08.2026. Noch nicht gebaut; Entscheid über den Kanal ist offen.

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

## Offen

- Kanal (Telegram / Mail / beides) – Entscheid nach dem Pitch
- Entprellung serverseitig: Alarm erst nach 2 aufeinanderfolgenden 15-Minuten-Fenstern,
  danach Sperre für denselben Standort bis Mitternacht
- Verknüpfung Meldung ↔ Kachel über den TMC-Code (13 der 33 GR-Zählstellen sind direkt
  verknüpfbar, für den Rest bräuchte es Nachbarschaftslogik entlang der TMC-Kette).
  Nutzen: Bei signalisierter Engstelle ist «zäh» die vorgeschriebene Betriebsart und
  kein Stau – siehe Gegenverkehr im Kerenzerbergtunnel am 10.08., wo 50 km/h bei
  signalisiertem Tempo 60 als «zäh» gemeldet wurden, obwohl der Verkehr normal lief.
