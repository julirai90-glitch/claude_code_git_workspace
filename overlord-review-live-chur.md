# Overlord-Review – Live-Temperatur-Embed Chur

**Datum:** 29.06.2026
**Geprüfte Datei:** `live-chur-v2.html` (live auf gh-pages)
**Aufgabe:** Review (1) Faktentreue/Statistik/Methodik, (2) Frontend-Code/Robustheit/Mobile/A11y, (3) Datenjournalismus/UX.

**Modelle (OpenRouter):**
| Perspektive | Modell |
|---|---|
| Faktentreue/Statistik | `deepseek/deepseek-chat-v3.1` |
| Frontend/Code/A11y | `qwen/qwen3-coder` |
| Datenjournalismus/UX | `moonshotai/kimi-k2-0905` |

Alle drei Antworten vollständig.

---

## Claude-Synthese & Faktencheck

### Wichtigster Befund (offen, Entscheid Julian)
**Morgendlicher Bias beim «wärmer als üblich».** Das *bisherige* Tagesmittel (seit Mitternacht) wird gegen das *volle* Tages-Normal verglichen. Morgens enthält der Mittelwert v. a. kühle Nachtstunden → kann fälschlich «kühler als üblich» zeigen; abends umgekehrt. (DeepSeek kritisch; Kimi implizit.) **Echtes methodisches Problem.**
Optionen: (a) Vergleich über ein **rollendes 24-h-Mittel** statt seit Mitternacht (24 h enthält immer einen vollen Tag-Nacht-Zyklus → bias-frei); (b) stündliche Klimatologie (vom User früher abgelehnt); (c) Vergleich erst ab X Stunden Tagesdaten anzeigen. Empfehlung: (a).

### Umgesetzt (unstrittig)
- **Performance (Qwen, Hauptpunkt):** Jahres-Stunden-/Tages-CSV nicht mehr alle 3 Min komplett laden – `csvCached` (Stunden 20 Min, Tage 30 Min Cache). Nur `t_now` bleibt 3-Min-Takt.
- `<title>` von «… Prototyp V2» auf «Live-Temperatur Chur» bereinigt (Kimi).
- «Schnitt» → «Durchschnitt» (Kimi, Sprache).

### Verworfen (Fehlalarm / bereits erledigt)
- **DeepSeek «Zeitzone inkonsistent»:** Falsch – `hhmm()` setzt `timeZone:'Europe/Zurich'` (ZRH), ist korrekt.
- **Qwen «Division durch null (vmax-vmin)»:** Bereits abgesichert (`if(vmax-vmin<3)…`).
- **Qwen «ARIA fehlt auf SVG»:** `role="img"`+`aria-label` ist vorhanden (Keyboard-Navigation fehlt aber – siehe offen).
- **Qwen «Promise.all bricht ab»:** `h_recent` hat eigenen `.catch`; `t_now`-Fehler wird vom äusseren try gefangen.

### Offen / optional (Editorial – nicht automatisch geändert)
- **A11y:** echter Tastaturzugang zur Kurve (Pfeiltasten) fehlt; `<title>/<desc>` im SVG ergänzbar.
- **Kimi UX:** Titel einordnender («So warm ist es – und so ungewöhnlich»); Rekord-Kachel evtl. zu viel Info; «provisorisch» → «vorläufig»; Y-Achse an der Kurve; Sommertage-Block aus- oder abbauen. Alles bewusste frühere User-Entscheide → nur als Vorschlag.
- **Hover-Edge / Tooltip-Position:** marginal verbesserbar.

---

## Rohantwort 1 – Faktentreue/Statistik (DeepSeek)
KRITISCH: (1) Tagesmittel-bisher vs. volles Tages-Normal → Morgen-/Abend-Verzerrung. (2) Zeitzone angeblich inkonsistent (→ widerlegt). MITTEL: provisorisch-Hinweis nur klein; Rekorde hartkodiert (Wartung); Mittel bei sehr wenigen Messwerten verzerrt. GERING: Sommertage-Lücken bei fehlenden Maxima; Farbverlauf <−15 °C. Empfehlung: Tagesmittel-Logik überarbeiten (Mindeststunden oder «vorläufig»).

## Rohantwort 2 – Frontend/Code/A11y (Qwen3-Coder)
HOCH: Fetch-Error-Handling (Promise.all), Division durch null (→ bereits gelöst), **Performance: h_recent ganzes Jahr alle 3 Min** (→ umgesetzt via Cache). MITTEL: Zeitstempel-Merge-Dedupe, Leere-Daten-Anzeige, Tooltip-Kollision. NIEDRIG: ARIA/Keyboard-Navigation, Caching/ETag. Fazit: gut strukturiert, robust; einzelne Edge-Cases offen.

## Rohantwort 3 – Datenjournalismus/UX (Kimi)
1. Titel auf Einordnung ausrichten; «Prototyp V2» raus (→ Titel bereinigt). 2. Kacheln vereinfachen, Normal klarer; «+X °C über dem Normal» statt «wärmer als üblich»; Rekord-Distanz evtl. in Fliesstext. 3. Balken fokussieren (−15..+40), Rekorde unter den Balken schreiben. 4. Kurve: Y-Achse + Normal als Fläche + Hover mit Normal. 5. «provisorisch»→«vorläufig». 6. Sommertage aus- oder abbauen. 7. «Schnitt»→«Durchschnitt» (→ umgesetzt), Tropennacht erklären (ist erklärt). Fazit: kein MeteoSchweiz-Klon erreicht – jetzt konsequenter journalistisch einordnen.
