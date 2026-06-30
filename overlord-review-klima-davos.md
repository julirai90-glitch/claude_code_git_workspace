# Overlord-Review – Klima-Datastory Davos (Prototyp)

**Datum:** 26.06.2026
**Geprüfte Datei:** `prototyp-klima-davos.html`
**Aufgabe:** Review auf (1) faktische/statistische Korrektheit, (2) Datenjournalismus-Qualität/Verständlichkeit, (3) Code/JS-Bugs, (4) Mobile/Accessibility.

**Eingesetzte Modelle (OpenRouter):**
| Perspektive | Modell |
|---|---|
| Faktencheck & Statistik | `deepseek/deepseek-chat-v3.1` |
| Datenjournalismus & Verständlichkeit | `moonshotai/kimi-k2-0905` |
| Code, Bugs, Mobile & A11y | `qwen/qwen-2.5-72b-instruct` |

Alle drei Antworten vollständig (kein Abbruch).

---

## Claude-Synthese & Faktencheck der Befunde

> Wichtig: Zwei der drei «kritischen» DeepSeek-Befunde sind selbst falsch (Halluzination), gegen die echten Daten geprüft.

### Verworfen (Modell-Halluzination)
- **«2025 ist nur eine Projektion»** – Falsch. Stand Juni 2026 ist 2025 abgeschlossen, finale homogene Werte liegen vor (verifiziert aus der offiziellen Jahres-CSV, 2025: 14 Sommertage / 171 Frosttage).
- **«−31.2 °C / 2.1.1905 erfunden»** – Falsch. Wert direkt aus den Tages-CSV (`ths200dn`, historical+recent) verifiziert. DeepSeek sah nur das im HTML eingebettete `EXTRA`-Array (beginnt erst 1959, Min −28.3) und schloss falsch.

### Angenommen & umgesetzt
- **Klimanorm-Periode** (DeepSeek, berechtigt): Dumbbell verglich 1961–1990 mit 1996–2025 (keine offizielle Norm). → Geändert auf **1961–1990 vs. 1991–2020** (offizielle WMO-Normen). Unterschied real klein (Frosttage 187 statt 183), aber methodisch sauber.
- **Tooltip-Überlauf unten** (Qwen): vertikale Begrenzung ergänzt.
- **ARIA-Labels/`role="img"`** auf alle fünf SVGs (Qwen, A11y).
- **`prefers-reduced-motion`** für Tooltip-Transition.

### Angenommen, noch offen (Entscheid Julian)
- **Einordnung/Lead fehlt** (Kimi): Kernbotschaft in 2 Sätzen, «Was bedeutet das?» (Tourismus/Skilifte). Für Publikationsreife nötig.
- **Reihenfolge**: Dumbbell ggf. vor Stripes; ③ (Temp-Säulen) evtl. redundant zu ① → streichen erwägen.
- **Stripes-Legende** für Laien klarer («rot = wärmer als 1961–1990»).
- **Rekord-Transparenz**: −31.2 °C ist korrekt, aber nicht aus den Seitendaten ableitbar → Quelle/Methode klar ausweisen (teilweise schon in Notiz).
- Niederschlags-Datenlücken 1871–1873 (DeepSeek, gering), Randjahre der gleitenden Mittel auf unvollständigem Fenster (gering).

### Nicht übernommen (falsch/irrelevant)
- Qwens `setBox` mit `style.width=W+'px'` würde die Responsive-Breite (width:100%) brechen.
- Qwens Keyboard-Handler nutzt `ev.clientX` im `keydown` (existiert dort nicht) – Konzept (Tastaturzugang) richtig, Code fehlerhaft. Offen als echte A11y-Aufgabe.
- Modularisierung in ES6-Dateien: für Single-File-Embed nicht sinnvoll.
- Kimis konkrete Zahlen (z.B. «−44 Frosttage», «40 Frosttage im Mai») sind erfunden – nur als Stil-Anregung, nicht als Fakten verwenden.

---

## Rohantwort 1 – Faktencheck & Statistik (DeepSeek)

# Prüfbericht: Klima-Datastory Davos – Faktencheck

## KRITISCHE BEFUNDE
1. Tagesrekord −31.2 °C/1905 angeblich nicht belegt (→ widerlegt, s. Synthese).
2. 2025 angeblich Projektion (→ widerlegt).
3. 1996–2025 keine offizielle Norm; 1991–2020 wäre Standard; Wahl überzeichnet Trend leicht / «Cherry-Picking»-Vorwurf möglich. (→ übernommen)

## MITTLERE BEFUNDE
4. Herkunft/Startjahr der homogenen Tagesreihe präzisieren (vermutet ~1931 statt 1888 – Spekulation; Daten zeigen Abdeckung ab ~1888/1890).
5. Doppelachse (④) erklärungsbedürftig, aber methodisch akzeptabel (kein Achsenbruch).
6. Warming-Stripes-Methode korrekt (Anomalie ggü. 1961–1990, symmetrische Skala); Farbschema leicht abweichend, journalistisch ok.

## GERINGE BEFUNDE
7. Rundungen/Einheiten konsistent.
8. Startjahre korrekt deklariert; Niederschlagslücken 1871–1873 nicht als Lücke visualisiert.
9. Gleitendes 10-Jahre-Mittel korrekt; Randjahre auf unvollständigem Fenster.

**Empfehlung:** Periode begründen/ändern, Rekord-Herkunft präzisieren.

---

## Rohantwort 2 – Datenjournalismus & Verständlichkeit (Kimi)

Kernpunkte:
- **Inhaltliche Leerstelle**: keine Einordnung («wie stark ist +2 °C im Alpenraum?»), keine «So geht es weiter».
- **Ansichten-Bewertung**: ② Dumbbell zentral (vor Stripes stellen); ③ Temp-Säulen redundant zu ① → streichen; ⑤ Niederschlag behalten («hier ändert sich kaum etwas»); ① Stripes behalten, aber Legende/Einleitung für Laien.
- **Verständlichkeit**: Stripes-Farbcode in Klartext, Einheit °C beim ersten Mal erklären.
- **Titelvorschlag**: «Zwei Grad mehr – wie sich Davos in 161 Jahren erwärmt hat».
- **Dramaturgie**: Lead → Dumbbell → Stripes als Hintergrund → Detail (④/⑤) → Ausblick (Tourismus/Lawinen).
- (Hinweis: einige konkrete Zahlen Kimis sind erfunden, nur als Stil zu lesen.)

---

## Rohantwort 3 – Code, Bugs, Mobile & A11y (Qwen)

Kernpunkte:
- `running()` gegen zu grosses Fenster absichern (Clamp) – defensiv, bei 162 Punkten unkritisch.
- **Tooltip vertikal begrenzen** (Überlauf unten) – übernommen.
- Resize via `debounce` zusätzlich zu rAF – optional.
- **ARIA-Labels/`role="img"`** auf SVGs – übernommen.
- **Tastaturzugang** zu Tooltips (Konzept richtig, Qwens Code fehlerhaft) – offen.
- `prefers-reduced-motion`, `forced-colors`/Kontrast – teils übernommen.
- Modularisierung – für Single-File nicht relevant.
- (`setBox` mit fixer Pixelbreite – würde Responsiveness brechen, nicht übernommen.)
