# Verkehrs-Alarm für die Redaktion – Einstieg

Stand 17.09.2026. Dieses Dokument ist der Einstieg für eine neue Session zum
**Redaktionsteil**. Das kommerzielle Website-Projekt läuft getrennt
(`/home/julian/stauwetter/START-HIER.md`) – bitte nicht vermischen.

## Was läuft

Vier n8n-Workflows, alle aktiv:

| ID | Name | Zweck |
|---|---|---|
| `nT9K4coxFicfvl1U` | Verkehr GR – Fetch (latest) | Zählstellen, alle 5 Min |
| `R7spzjHnnljtjsiR` | Verkehr GR – Verkehrsmeldungen (ASTRA) | amtliche Meldungen |
| `qWNsUBgHtJLT48pX` | Verkehr GR – Strassenzustand (TBA GR) | Kantonsstrassen, Pässe |
| `zbVshbyGJuFYBWeK` | **Verkehr GR – Alarm (Mail)** | seit 15.09., alle 15 Min |

Dazu das Dashboard in `verkehr/verkehr-dashboard-kacheln.html` (GitHub Pages).

> Hinweis: Dieses Repo ist öffentlich. Empfängeradressen, Schlüssel und
> Redaktionsinterna stehen darum nicht hier, sondern in n8n bzw. in
> `~/.config/mcp-secrets.env`.

## Der Alarm in einem Absatz

Alle 15 Minuten, rund um die Uhr. Vier Regionen – **Graubünden, Glarus,
Sarganserland, Linth** – je eine eigene Mail mit der Region im Betreff, aktuell alle
an die Redaktionsadresse. Drei Quellen: Zählstellen (gefiltert), ASTRA-Meldungen
und TBA-Meldungen (beide ungefiltert). Code versioniert in `n8n_alarm_detect.js` und
`n8n_alarm_mail.js`, ausführliche Begründung in `alarm-konzept.md`.

**Sarganserland ist seit 23.09.2026 abgestellt** (Wunsch Julian): Die Zuordnung läuft
weiter, es geht nur keine Mail mehr raus – Zählstellen der Region zählen weiterhin als
«weitere Stelle» für die Wellenerkennung der Nachbarregionen. Schalter ist
`REGIONEN_AUS` in `n8n_alarm_detect.js`; Region aus der Liste nehmen, und der Versand
läuft wieder.

## Die drei Regeln, die man kennen muss

1. **Sprachregel:** Zählstellen sagen «deutlich langsamer als üblich» oder
   «Schritttempo». «Stau» und «gesperrt» bleiben ASTRA und dem Tiefbauamt vorbehalten.
2. **Auslöseregel Zählstellen:** Schritttempo unter 25 km/h **oder** zwei weitere
   Messstellen auffällig **oder** eine weitere ausserhalb der Pendlerzeiten.
   Die Schritttempo-Ausnahme darf nicht wegfallen – warum, steht in `alarm-konzept.md`.
3. **Kein stilles Schweigen:** Liefert eine Quelle strukturell nichts, bricht der Lauf
   mit Fehler ab statt «nichts Neues» zu melden.

## Beim Arbeiten beachten

- **Code-Änderungen** über die n8n-REST-API mit `N8N_API_KEY` aus
  `~/.config/mcp-secrets.env`. Danach **immer** zurücklesen und per sha256 gegen die
  Datei prüfen – am 10.08.2026 ging so ein `return` verloren.
- **`staticData` ist der Zustand.** Geht er verloren, kommt ein erneutes Seeding und
  damit ein stiller Tag. Nach jedem PUT prüfen, dass `seen` noch gefüllt ist.
- **Erfolgreiche Läufe speichert n8n hier nicht.** «0 Executions» beweist nichts;
  der Nachweis führt über `staticData`.
- **Fremde Meldungsobjekte** werden unverändert weitergereicht. Eigene Schlüssel
  gehören hinter den Spread und tragen einen Unterstrich (`_quelle`, `_region`).

## Offen

- Entwarnungen («Vereina offen») und TBA-Meldungen vom Typ `hinweis` alarmieren
  unnötig. Braucht einen Eingriff am ASTRA- und TBA-Parser.
- Zählstelle `CH:0169` Flüela liefert seit über 42 Tagen nichts.
- `CH:0216` Wangen SZ fehlt in der Baseline, wird nie eingestuft.
- `CH:0320` Chur Nord wartet auf eine saubere Baseline (siehe Kommentar im Dashboard).
- Die Verteileradressen der vier Redaktionen sind noch nicht gesetzt.
