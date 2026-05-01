# Artikel-Playbook «Graubünden in Zahlen»

Aktive Arbeitsdatei für die Datenstory-Serie. Vor Publikation jedes neuen Artikels die Checkliste in Abschnitt 3 durchgehen. Nach Erscheinen Performance-Tabelle und Learnings nachführen.

## 1. Performance-Übersicht

| Artikel | Pageviews |
|---|---|
| Altern (Graubünden altert – aber ein Dorf wird jünger) | 7'921 |
| Schlafdörfer | 3'056 |
| Männerkanton (Graubünden ist ein Männerkanton – aber eine Gemeinde hält dagegen) | 866 |
| Rongellen | 378 |
| Misox (Mafia-Recherche, Februar 2026) | 237 |

## 2. Drei Learnings aus den Leserzahlen

### 🥇 Learning 1: Die «Wo stehst du?»-Frage ist der Reichweiten-Booster

Die drei erfolgreichsten Artikel (Altern: 7'921 PV, Schlafdörfer: 3'056 PV, Männerkanton: 866 PV) haben alle einen interaktiven Grafik-Kern, bei dem Leserinnen und Leser ihre eigene Gemeinde nachschlagen können. Das schafft einen direkten Selbstbezug: Ist mein Dorf ein Schlafdorf? Wie alt ist meine Gemeinde im Vergleich? Die schwächsten Artikel (Rongellen: 378 PV, Misox: 237 PV) verzichten auf diesen Mechanismus – beim Misox-Artikel gibt es zwar Grafiken, aber keine Suchfunktion für die eigene Gemeinde.

**Empfehlung:** Jeder künftige Artikel sollte eine «Wo ist meine Gemeinde?»-Interaktion als Pflichtbestandteil haben – nicht als Nice-to-have.

### 🥈 Learning 2: Aktualitäts-Anker allein reichen nicht

Der Misox-Artikel ist der einzige in der Serie mit einem handfesten Nachrichtenanlass (Europol-Verhaftungen, Februar 2026) – und trotzdem der schwächste mit 237 Pageviews. Das deutet darauf hin, dass das Datenjournalismus-Format bei Kriminalthemen mit regionalem Nischenbezug nicht gut zündet: Das Publikum, das den Mafia-Anlass verfolgt hat, wollte vermutlich Ereignisjournalismus, nicht Handelsregister-Analyse. Der Rongellen-Artikel litt umgekehrt daran, als Serienstart noch keine Stammleserschaft hatte.

**Empfehlung:** Aktualitäts-Anker helfen nur, wenn das Datenprofil des Themas breit genug ist, um über die Kernregion hinaus Neugier zu wecken – also eher gesellschaftliche Trends als Ereignisse.

### 🥉 Learning 3: Der Titel-Trick «– aber X hält dagegen» funktioniert, braucht aber Substanz dahinter

Die beiden jüngsten Artikel nutzen dasselbe Titel-Muster: «Graubünden altert – aber ein Dorf wird jünger» und «Graubünden ist ein Männerkanton – aber eine Gemeinde hält dagegen». Das erste Mal hat es mit 7'921 Views eingeschlagen, das zweite Mal nur noch 866 Views erzielt. Der Inhalt des Demografie-Artikels liefert dabei mehr einlösbare Überraschungen (Ferrera verjüngt sich, Celerina altert, Animation über 15 Jahre), während der Geschlechter-Artikel das Versprechen des Titels weniger stark einlöst – die Gegenbeispiele (Avers, Rossa) sind Kleinstgemeinden mit statistischem Rauschen.

**Empfehlung:** Den Kontrast im Titel nur verwenden, wenn die Ausnahme im Text wirklich trägt – also eine Gemeinde mit echter, erklärbarer Geschichte hinter der Zahl, nicht bloss ein statistischer Zufall bei 166 Einwohnenden.

## 3. Pflicht-Checkliste vor Publikation

- [ ] **Selbstbezug:** Hat der Artikel eine «Wo ist meine Gemeinde?»-Interaktion (Suchfeld, Filter, eigene Position in der Grafik)? Wenn nein: nachrüsten oder bewusst begründen.
- [ ] **Themenbreite:** Ist das Datenprofil breit genug, um über die Kernregion hinaus zu interessieren (gesellschaftlicher Trend statt Einzelereignis)? Aktualitätsanker allein trägt nicht.
- [ ] **Titel-Kontrast nur mit Substanz:** Falls der Titel «X – aber Y hält dagegen» nutzt – liefert die Ausnahme im Text eine erklärbare Geschichte mit Substanz, nicht nur statistisches Rauschen einer Kleinstgemeinde?
- [ ] **Kernfrage testen:** Nach Lektüre des Aufmachers – kann der Lesende sich selbst (oder seinen Wohnort) im Artikel verorten?
- [ ] **Markenfarben Südostschweiz:** Hauptblau `#0068A4`, Akzent-Orange `#EE7733`, Akzent-Rot `#B5001E`, dunkles Blau `#1E3A5F`. Konvention: Männer/dominante Kategorie = Blau, Frauen/Gegenkategorie = Orange. Grün (`#1a9e5a`) nur für Live-/Active-Indikatoren, nicht als Hauptfarbe. Vorlage: `style.css`, `ausgaben/07-teil-2-alter.html`.
- [ ] **Datenmethodik klarstellen:** Bei Bestandszahlen vs. kumulierten Werten explizit machen, wie die Jahreszahl entsteht (z. B. Mittelwert aus Quartalsmessungen vs. Summe). Im Lead und im Methodik-Footer.
- [ ] **Container-Breite 696 px:** Alle `.wrap`/`.wide`-Container max-width: 696 px (Vorgabe für iframe-Einbettung in julianreich.ch via `wp-create-datenstories.js`). Innen-Padding 24 px. SVGs mit `viewBox` + `width: 100%` skalieren automatisch mit. Vorlage: `01-haefte-haefte.html`, `01-chur-60-gemeinden.html`, `02-schlafdoerfer.html`, `03-demografie-alter-geschlecht.html`.
- [ ] **Interaktivität in jeder Visualisierung:** Hover/Tap auf Daten-Elementen muss einen Tooltip mit Wert, Jahr und Kategorie zeigen. Linien-Charts mit Hover-Linie + Punkt pro Serie, Stacked Areas mit Total + Anteilen, Balken mit Hover-State. Tooltip-Style einheitlich: weisser Hintergrund, dünner Rand, leichter Schatten. Vorlage-Logik in `ausgaben/08-grenzgaenger-atlas.html`.
- [ ] **Keine politische/interpretative Schluss-Sektion:** Datenstories enden nüchtern mit der letzten Daten-Sektion und Methodik-Footer. Politische Lesart, Implikationen oder «Was das bedeutet»-Abschnitte gehören in einen separaten Kommentar, nicht in die Datenstory.
- [ ] **Cache-Busting:** Externe JS-/Daten-Files mit `?v=N`-Suffix versionieren, damit Iframe-Embeds auf julianreich.ch nach Updates frisch laden.
- [ ] **Fachbegriffe definieren:** Zentrale Begriffe (z. B. «Grenzgänger», «Zweitwohnungsanteil», «Logiernächte», «Beschäftigte vs. Vollzeitäquivalente») früh in der Story als kompakte Definitionsbox erklären – nicht voraussetzen, dass alle Leserinnen und Leser den Begriff kennen. Vorlage: `def-box`-Style in `ausgaben/08-grenzgaenger-atlas.html`.
- [ ] **Bezugsjahr-Konsistenz:** Wenn zwei Datensätze in einer Quote/Verhältniszahl kombiniert werden, beide auf das identische letzte verfügbare Bezugsjahr setzen. BFS-STATENT-Beschäftigtendaten erscheinen mit ~1.5 Jahren Verzögerung – Quote-Bezugsjahr entsprechend wählen, im Methodik-Footer erklären.

## 4. Pflege

- Nach jedem neuen Artikel: Performance-Tabelle in Abschnitt 1 ergänzen (Titel + Pageviews).
- Pageviews werden manuell aus dem Analytics-System eingetragen – kein Automatismus.
- Learnings in Abschnitt 2 nach 2–3 weiteren Artikeln revidieren: Bestätigen sich die Muster? Tauchen neue auf? Stimmen die Empfehlungen noch?
- Checkliste in Abschnitt 3 ist lebendig: Punkte streichen, wenn sie nicht mehr greifen, neue ergänzen, wenn ein Learning das nahelegt.
