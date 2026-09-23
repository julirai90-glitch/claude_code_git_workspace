# Overlord-Review: Tankrechner-Embeds

**Datum:** 23.09.2026
**Geprüft:** `tankrechner-glarus.html` (Vollversion) und `tankrechner-einfach.html` (Kurzversion)
**Verfahren:** Drei Modelle aus drei Labs, je eine eigene Interessenlage. Vorgelegt wurde der
echte Code (Rechenkern, Kurvenfunktion, Schnittstellenabfrage beider Dateien) plus die
dokumentierten Annahmen und drei nachrechenbare Ergebnisse.

| Perspektive | Modell | Auftrag |
|---|---|---|
| Methodenkritiker | `moonshotai/kimi-k2.6` | Ökonomische Stichhaltigkeit, Herleitung der 19 Rp./km, Scheingenauigkeit |
| Technischer Reviewer | `z-ai/glm-5.2` | Randwerte, Race Conditions, Zustandsverwaltung, Barrierefreiheit |
| Skeptischer Redaktionsleiter | `qwen/qwen3.7-max` | Publikationsentscheid, Irreführungspotenzial, Rechtliches |

## Qualitätskontrolle der Antworten

- **Methodenkritiker:** Erster Lauf mit `max_tokens=8000` bei 22'002 Zeichen abgebrochen – das
  Modell hatte das Budget im Denkprozess aufgebraucht, die Antwort endete mitten in Punkt 2 von 5.
  Wiederholt mit `max_tokens=20000` und der Auflage, die Denkphase kurz zu halten: vollständig
  (3'310 Zeichen).
- **Technischer Reviewer:** vollständig (4'163 Zeichen).
- **Skeptischer Redaktionsleiter:** vollständig (2'798 Zeichen).

Alle drei lieferten die Antwort im `reasoning`-Feld; der erzwungene `=== FINAL ANSWER ===`-Block
wurde extrahiert.

---

# Synthese (Claude) – mit Verifikationsstatus

**Jeder technische Befund wurde im Browser nachgestellt, nicht übernommen.** Zwei der fünf
hielten der Prüfung nicht stand.

## Bestätigt und behoben

### 1. Race Condition bei der E-Control-Abfrage — CONFIRMED
Gemeldet von `z-ai/glm-5.2`. `ladeStationen()` hatte keinen Schutz gegen überholende Antworten.

*Verifikation:* Im normalen Test trat der Fehler nicht auf (Timing-Glück). Deterministisch
erzwungen, indem im Testbrowser `fetch` so gepatcht wurde, dass Diesel-Antworten 3 Sekunden
später eintreffen: Nach schnellem Umschalten Diesel → Benzin stand bei Schalterstellung
«Benzin 95» der Dieselpreis **2,199 €** im Preisfeld. Der Rechner arbeitete mit dem falschen
Treibstoffpreis.

*Behoben* mit einer Laufnummer (`ladeLauf`); nur die jüngste Abfrage darf schreiben.
Nachgetestet mit demselben Aufbau: Der Benzinpreis bleibt stehen.

### 2. Feld und interner Zustand laufen auseinander — PLAUSIBLE, anders als gemeldet
`z-ai/glm-5.2` meldete, eine Distanz von −50 erzeuge negative Kosten und absurde Gewinne
(«Das Tool behauptet, negatives Fahren sei extrem lukrativ»).

*Verifikation:* Der Rechenkern ist korrekt – `num()` clampt intern auf 0. Aber das **Eingabefeld
zeigte weiter −50**, während das Ergebnis zu 0 km gehörte. Der Leser sieht also eine Distanz,
die nicht gerechnet wird. Dasselbe bei Tankmenge 0 (intern 5) und Verbrauch 0 (intern 2).

*Behoben:* Unmögliche Werte (negativ oder über dem Maximum) werden sofort im Feld
richtiggestellt; zu kleine Werte erst beim Verlassen des Feldes – sonst liesse sich in einem
Feld mit Minimum 5 keine 12 mehr tippen. Beides nachgetestet.

### 3. Ladezustand nicht für Screenreader angekündigt — CONFIRMED
`aria-live="polite"` am Hinweis der Tankstellenabfrage ergänzt.

## Widerlegt

### 4. «`pzChf: null` führt zu Preis 0 am Ziel» — WIDERLEGT
`z-ai/glm-5.2` behauptete, bei Ziel Balzers werde intern mit 0 CHF gerechnet und massive
Ersparnisse ausgewiesen.

*Verifikation im Browser:* Ziel Balzers wählen, nichts eintippen → Preisfeld zeigt 2.10,
Zeile «Ersparnis an der Säule» zeigt 0.00, Fazit «Sie zahlen CHF 35.26 drauf». Korrekt.
`preisfeldSetzen()` setzt den Wert, bevor er gebraucht wird.

*Trotzdem geändert:* Der `null`-Initialwert ist keine aktuelle Fehlerquelle, aber eine Falle für
spätere Umbauten – jetzt mit dem Referenzpreis initialisiert.

### 5. «Leeres Feld erzeugt NaN» — WIDERLEGT
*Verifikation:* Verbrauchsfeld geleert → der letzte gültige Wert bleibt stehen, Fazit und Grafik
unverändert. `num()` fängt `NaN` ab.

**Ursache beider Fehlalarme liegt beim Dossier, nicht bei den Modellen:** Die
Eingabe-Validierung `num()` war nicht Teil des vorgelegten Codes. Lehre für künftige Reviews:
Eingabe-Validierung immer mitliefern, sonst prüfen die Modelle einen Strohmann.

## Inhaltliche Befunde – nicht behoben, Entscheidung liegt bei der Redaktion

### 6. Zeitaufwand fehlt — stärkster inhaltlicher Punkt
`moonshotai/kimi-k2.6`: Für die Rundfahrt Glarus–Feldkirch seien 1,5–2 Stunden realistisch, bei
20 CHF/h entstünden 30–40 CHF Opportunitätskosten – mehr als jede mögliche Ersparnis.

*Verifikation:* Das Modell **untertreibt**. Die OSRM-Fahrzeit beträgt 71 Minuten einfach, also
rund **2,4 Stunden** hin und zurück. Bei 20 CHF/h wären das 47 CHF.

*Vorschlag:* Die Fahrzeit **anzeigen, ohne sie zu bewerten** («Dafür sind Sie rund 2 Stunden
20 Minuten unterwegs»). Die Zahlen liegen aus der OSRM-Abfrage bereits vor. Eine Monetarisierung
würde eine weitere angreifbare Annahme einführen; die Anzeige überlässt das Urteil dem Leser.

### 7. Schweizer Preise hartkodiert, österreichische live — von zwei Modellen genannt
`qwen/qwen3.7-max` nennt es den gravierendsten Punkt: In drei Monaten liegt der Default um rund
60 Rappen daneben, das Tool zeigt einen Vorteil, den es nicht gibt. Für die Schweiz existiert
keine öffentliche Preisschnittstelle (siehe `quellen.md`), ein Ersatz wäre ein wöchentliches
manuelles Update oder ein Verfallsdatum im Embed.

### 8. Voreinstellung beantwortet die Leitfrage mit «Nein»
`qwen/qwen3.7-max`: Das Tool locke mit «Lohnt sich Vorarlberg?» und beweise im ersten Screen,
dass die Idee absurd sei. Vorschlag: Voreinstellung auf einen Fall, der zunächst ein «Ja, aber
nur bis X km» zeigt. **Redaktionelle Abwägung:** Das negative Ergebnis *ist* der journalistische
Befund – eine geschönte Voreinstellung wäre ihrerseits fragwürdig.

### 9. Die 19 Rp./km skalieren nicht mit dem Verbrauch
`moonshotai/kimi-k2.6`: Wer 9 l/100 km einträgt, fährt ein schwereres Fahrzeug mit höherem
Verschleiss; realistisch seien dort 25–30 Rp./km. *Entschärft dadurch, dass der Satz ein
editierbares Feld ist.* Eine automatische Kopplung an den Verbrauch würde eine neue, nicht
belegte Annahme einführen.

### 10. Scheingenauigkeit
`moonshotai/kimi-k2.6`: Rappen- und kilometergenaue Ausgaben bei Inputs mit grossen
Unsicherheitsbändern (gerundete Distanzmatrix, grober Kostensatz, tagesschwankende Preise).
Vorschlag des Modells: «nicht lohnend, Verlust ca. CHF 35–55» statt «minus 37 Franken».

## Von allen drei Perspektiven bestätigt

Die **Mathematik ist korrekt.** `moonshotai/kimi-k2.6` prüfte die Herleitung der 19 Rp./km nach
(4'135 / 15'000 = 27,6 Rp./km, minus 8,6 Rp./km Treibstoff) und bestätigt sie ausdrücklich –
auch, dass der veraltete TCS-Treibstoffansatz von 1.71 die Logik **nicht** verzerrt, weil das
Tool den aktuellen Treibstoffpreis separat abbildet. `qwen/qwen3.7-max` bestätigt die exakte
Auflösung der Grenzwertformel inklusive der Rückkopplung des Mittelpreises. Die
Mittelpreis-Annahme gilt als ökonomisch vertretbar.

## Korrigierte Modellangabe

`moonshotai/kimi-k2.6` beziffert die Vignette mit «rund CHF 13,70». Richtig sind
**11.98 CHF** (12,80 EUR × 0.9363). Der Nettowert fiele damit von −37.02 auf −49.00, nicht auf
−51. Der Punkt selbst – die Vignette ist nicht voreingestellt – ist keine Fehlfunktion: Nach
Feldkirch gelangt man ohne österreichische Autobahn, wer eine Jahresvignette hat, zahlt nichts
extra, und für den Fall gibt es einen Knopf zum Einrechnen.

---

# Rohantworten

## Methodenkritiker — `moonshotai/kimi-k2.6`

**1. Vignette für Österreich fehlt im Standardfall (schwerwiegender Implementierungsfehler)**
Das Modell definiert zwar `REF.vignette: 12.80` (EUR, Zeile REF-Block), setzt aber im State `einmalig: 0`. Für das Kern-Szenario Glarus–Feldkirch (80 km einfach) wird die 10-Tages-Vignette nicht automatisch addiert. Das verzerrt den Nettoertrag um rund CHF 13,70 systematisch nach oben. Aus dem genannten «minus 37 Franken» werden korrekterweise «minus 51 Franken»; die maximal lohnende Strecke bricht von 21 km auf etwa 15 km ein.

**2. Zeitkosten werden vollständig ignoriert (ökonomisch massgeblich)**
Die Anwendung listet Zeitaufwand bewusst als «nicht berücksichtigt» (Annahme 5). Für 160 km Rundfahrt (Glarus–Feldkirch) sind mindestens 1,5–2 Stunden reine Fahrzeit realistisch. Selbst bei einem konservativen Zeitwert von CHF 20/h entstehen Opportunitätskosten von CHF 30–40. Das übertrifft in fast allen Szenarien die mögliche Ersparnis und würde die Kurve fundamental nach oben verschieben.

**3. Die 19 Rp./km sind nicht für alle Fahrzeugtypen gültig (Herleitungs- und Übertragungsfehler)**
Die Herleitung aus der TCS-Kilometerkostenrechnung (Medienmitteilung 06.01.2026) ist rechnerisch korrekt: CHF 4'135 / 15'000 km = 27,6 Rp./km, abzüglich 8,6 Rp./km Treibstoff (5 l/100 km × CHF 1,71) ergibt rund 19 Rp./km. Der veraltete Treibstoffansatz von CHF 1,71 stört die Logik nicht, weil das Tool den aktuellen Treibstoff separat abbildet (Formel `sprit = km*(v/100)*pM`). Entscheidend ist aber: Die 19 Rp./km gelten für das TCS-Musterauto (5 l/100 km). Wenn der Nutzer 6,5 l/100 km oder mehr eingibt, fährt er typischerweise ein schwereres Auto mit höherem Reifen-, Bremsen- und Wertminderungsaufwand. Das Modell skaliert diese Kosten nicht mit dem Verbrauch. Bei einem SUV (z. B. 9 l/100 km) liegen die echten variablen Nicht-Sprit-Kosten eher bei 25–30 Rp./km. Die Differenz von 6–11 Rp./km auf 160 km bedeutet zusätzliche Kosten von CHF 9,60–17,60, die das Ergebnis weiter ins Negative drücken.

**4. Scheingenauigkeit bei unsicheren Inputs (Darstellungsfehler)**
Das Tool gibt Ergebnisse rappen- und kilometergenau aus («minus 37 Franken», «lohnend bis 21 km»). Die Inputs haben aber erheblich grössere Unsicherheitsbänder: Die Distanzmatrix ist auf ganze Kilometer gerundet (z. B. Glarus–Feldkirch exakt 80 km), die 19 Rp./km sind eine grobe Kategorie durchschnittlicher Fahrzeuge, und die Preise schwanken tagesaktuell. Die Break-even-Kurve wird mit 160 Segmenten gezeichnet (`for (let i=0;i<=160;i++)`), was eine scheinbare Kontinuität suggeriert, obwohl die Ortsauswahl diskret ist. Eine Angabe wie «nicht lohnend, Verlust ca. CHF 35–55» wäre ehrlicher.

**5. Mittelpreis-Annahme und Mathematik (korrekt)**
Die Mittelpreis-Formel `pM = (pCh + pZ)/2` (Rechenkern, Zeile `const pM = (pCh + pZ)/2`) ist ökonomisch vertretbar: Sie spiegelt wider, dass die Hinfahrt mit teurem Start-Sprit, die Rückfahrt mit günstigem Ziel-Sprit verbraucht. Die Auflösung der Grenzwertformeln ist mathematisch sauber. Die Formel für `diffStar` berücksichtigt korrekt, dass der Mittelpreis selbst vom Preisvorteil abhängt (`pM = pCh – diff/2`), was zur exakten Gleichung `diffStar = (f*d*((v/100)*pCh + c) + e) / (L + f*d*v/200)` führt (Rechenkern, Zeile `diffStar`). Auch `dStar` ist für gegebenes `diff` richtig aufgelöst.

---

## Technischer Reviewer — `z-ai/glm-5.2`

**Review-Report: Tankrechner-Vollversion und Kurzversion**

Positiv hervorzuheben (knapp): Der Timeout-Mechanismus via `AbortController` in der E-Control-Abfrage ist grundsätzlich richtig implementiert. Die SVG-Grafik nutzt sauber ein responsives `viewBox`-Konzept für mobile Endgeräte.

Im Folgenden die gefundenen Fehler, geordnet nach Schweregrad:

**1. Kritisch: Race Condition bei der E-Control-Schnittstelle (Veraltete Antworten überschreiben neue)**
- **Fehler im Code:** In `ladeStationen()` (Vollversion) gibt es keine Request-ID oder Sequenznummern-Prüfung. Beim schnellen Umschalten von Benzin auf Diesel (oder mehrfachen Aufruf) laufen mehrere `fetch`-Aufrufe parallel.
- **Auswirkung:** Löst der erste Request (z. B. Diesel) erst nach 6 Sekunden durch das Timeout aus, während der zweite Request (Benzin) bereits nach 1 Sekode erfolgreich war, überschreibt der späte Diesel-Request das Dropdown `sel.innerHTML` und die Variable `STATIONEN`. Der Nutzer hat "Benzin" im Formular ausgewählt, sieht aber plötzlich Diesel-Preise. Die Berechnungen laufen mit falschen Preisen.
- **Reproduktion:** Feldkirch als Ziel wählen. Treibstoff auf Diesel stellen. Sofort auf Benzin umschalten. Das Dropdown zeigt kurz Benzin-Preise an und springt dann auf Diesel-Preise zurück.

**2. Kritisch: `null`-Wert bei Zielpreis führt zu absurden Rechenwerten**
- **Fehler im Code:** Im Zustand `S` ist `pzChf: null` definiert. Wählt der Nutzer ein Ziel in der Schweiz oder Liechtenstein (nicht "at"), liefert `zielPreis()` den Wert `null` zurück. In `calc()` wird `diff = pCh - zielPreis()` berechnet. JavaScript konvertiert `null` in mathematischen Operationen zu `0`.
- **Auswirkung:** Der Rechner nimmt fälschlicherweise einen Preis von 0 CHF am Zielort an. Das Skript errechnet einen fiktiven Preisvorteil von z. B. 2.10 CHF pro Liter. Die Ausgabe signalisiert massive Ersparnisse, und die Break-even-Kurve steigt extrem steil an.
- **Reproduktion:** Vollversion öffnen, Startort Glarus, Ziel Balzers wählen. Keinen Preis für das Ziel manuell eintragen. Das Fazit zeigt hohe Gewinne, weil intern mit 0 CHF/Liter am Ziel gerechnet wird.

**3. Hoch: Negative Distanzen erzeugen negative Kosten (invertierte Logik)**
- **Fehler im Code:** Die Distanz ist laut Kontext "nachträglich editierbar". `calc()` multipliziert ungeprüft: `const km = f * d;` und anschliessend `const sprit = km * ...` sowie `const fahrzeug = km * c;`.
- **Auswirkung:** Gibt der Nutzer eine negative Strecke ein (z. B. `-50`), wird `km` negativ (`-100`). Die Kosten `sprit` und `fahrzeug` werden negativ. In der Formel `netto = ersparnis - sprit - fahrzeug - e` subtrahiert man negative Werte, was den Netto-Gewinn massiv nach oben treibt. Das Tool behauptet, negatives Fahren sei extrem lukrativ.
- **Reproduktion:** Das Distanz-Eingabefeld auf `-50` setzen. Das Fazit weist einen stark positiven Ertrag aus.

**4. Mittel: Unbehandelte leere Felder brechen die Anzeige (`NaN`)**
- **Fehler im Code:** Wenn Eingabefelder (z. B. Verbrauch `S.verb` oder Tankmenge `S.menge`) geleert werden, liefern DOM-Events oft leere Strings `""` oder `undefined`. Dies führt in der Division `S.verb/100` oder Multiplikation zu `NaN` (Not-a-Number).
- **Auswirkung:** Das `NaN` pflanzt sich durch den gesamten Rechenkern (`proKm`, `dStar`, `netto`) fort. Im SVG-Chart (`drawChart`) schlägt die Koordinatenberechnung fehl, das Diagramm verschwindet oder zeigt wirre Linien. Das Fazit lautet "NaN CHF".
- **Reproduktion:** Das Eingabefeld für "Verbrauch" komplett leeren. Die Kurve und die tabellarische Ausgabe brechen zusammen oder zeigen "NaN".

**5. Niedrig (A11y): Dynamische Preis-Updates nicht für Screenreader angekündigt**
- **Fehler im Code:** `hint.textContent` wird in `ladeStationen()` aktualisiert, ohne dass das Element mit `aria-live="polite"` oder `role="status"` versehen ist.
- **Auswirkung:** Blinde Nutzer erfahren nicht, dass sich die Preise im Hintergrund geladen haben oder auf den Landesdurchschnitt gefallen sind.
- **Reproduktion:** Mit einem Screenreader die Ortsauswahl treffen. Es erfolgt keine akustische Rückmeldung zum erfolgreichen oder fehlgeschlagenen Laden der Tankstellenpreise.

---

## Skeptischer Redaktionsleiter — `qwen/qwen3.7-max`

Als Chefredaktor sehe ich bei diesem Tool mehr Risiken als Nutzwert. Interaktive Rechner suggerieren Objektivität, doch hier führen Design- und Daten-Entscheide den Leser in die Irre.

**1. Asynchrone Datenquellen produzieren Fehlentscheidungen (Schwere: Hoch)**
Der Schweizer Referenzpreis ist hartkodiert (`REF.ch.benzin: 2.10`), während Österreich live via E-Control-API abgefragt wird. Steigen die Schweizer Preise wöchentlich um 5 Rappen, liegt der Default-Wert in drei Monaten um rund 60 Rappen daneben. Konsequenz: Der Leser rechnet mit dem veralteten 2.10-Default, das Tool zeigt einen massiven Preisvorteil an, und der Leser fährt nach Feldkirch – nur um festzustellen, dass der reale Glarner Preis den Vorteil längst aufgefressen hat. Das Tool produziert so aktiv finanzielle Fehlentscheidungen.

**2. Die Voreinstellung ist ein redaktionelles Eigentor (Schwere: Hoch)**
Die Defaults (`start:4` Glarus, `ziel:9` Feldkirch, `dist:80`) liefern als erstes Ergebnis "minus 37 Franken". Wir locken den Leser mit der Frage "Lohnt sich Vorarlberg?", nur um ihm im ersten Screen zu beweisen, dass die Idee absurd ist. Ein Tool, das seine eigene Leitfrage standardmässig mit "Nein" beantwortet, frustriert und wirkt wie Clickbait.

**3. Fehlender Alltagskontext (Schwere: Mittel)**
Niemand fährt 160 Kilometer (Hin- und Rückweg, `FAKTOR = 2`) ausschliesslich zum Tanken. Das Tool ignoriert, dass solche Fahrten meist mit Einkäufen oder Pendeln verbunden sind. Es fehlt ein Schalter "Fahrt ohnehin geplant", der die variablen Fahrzeugkosten (`S.satz/100`) für die Basisstrecke auf null setzt und nur den echten Umweg berechnet.

**4. Rechtliches: Unproblematisch (Schwere: Tief)**
Die namentliche Nennung österreichischer Tankstellen mit Preisen ist rechtlich sauber. Die E-Control ist eine staatliche Regulierungsbehörde, die Daten sind öffentlich und für den Konsumentenschutz gedacht.

**5. Handwerklich gut gelöst**
Die Mathematik stimmt: Die `diffStar`-Formel löst die Break-even-Grenze exakt auf, obwohl der mittlere Preis (`pM`) selbst vom Preisvorteil abhängt. Auch der Fallback auf den Landesdurchschnitt bei API-Timeouts (`catch`-Block) ist sauber.

**Entscheid: Mit Auflagen publizieren.**

**Auflagen:**
- Schweizer Preise müssen zwingend über eine API oder ein wöchentliches CMS-Update gepflegt werden; Hardcoding ist bei volatilen Märkten inakzeptabel.
- Die Voreinstellung muss auf einen realistischen, positiven Use-Case geändert werden (z.B. `ziel:1` Niederurnen, `dist:4`), damit der Leser erst einmal ein "Ja, aber nur bis X Kilometer" sieht.
- Ergänzung des Schalters "Fahrt ohnehin geplant" (setzt `fahrzeug`-Kosten auf der Hauptstrecke aus).
- Ein klarer redaktioneller Hinweis, dass der Rechner nur den reinen Tank-Use-Case abbildet und Zeit oder Einkauf nicht monetarisiert.

---

