# Wie bündnerisch stimmt Bern?

Interaktive Seite zur Bündner Delegation im Bundesparlament, 52. Legislatur, vor den Wahlen 2027.
Live (Entwurf): https://julirai90-glitch.github.io/claude_code_git_workspace/wahlen-2027-gr/

## Daten neu rechnen
```bash
cd wahlen-2027-gr
python3 scripts/01_fetch.py              # OpenParlData: Personen, Abstimmungen, Ständerat-Stimmen (~3 min)
python3 scripts/01b_fetch_parlament.py   # ws.parlament.ch: alle Nationalratsstimmen (~10 min, 840k Zeilen)
python3 scripts/01c_parse_sr_excel.py    # offizielle SR-Excel Sommer + Herbst 2026
python3 scripts/01d_fetch_sr_affairs.py  # Geschäftsnummern/Links Ständerat
python3 scripts/01e_fetch_vorstoesse.py  # Vorstösse (Urheberschaft)
python3 scripts/01f_fetch_gr_history.py  # GR-Nationalratsstimmen Legislaturen 47–51 (~12 min)
python3 scripts/04_kreuzpruefung.py      # Abgleich der Quellen
python3 scripts/02_analyse.py            # -> data/kennzahlen.json, data/abstimmungen.json
python3 scripts/02b_history.py           # -> data/history.json
python3 scripts/03_build_page.py         # -> data/page.json (alle Zahlen im Seitentext)
```
Rohdaten liegen in `data/raw/` (gitignored). Test: `scripts/05_test.js` (Playwright, Desktop/iPhone/Pixel).

Neue Session (z. B. nach der Wintersession 2026 mit Rathgeb): Ständerat-Excel der neuen Session in
`01c_parse_sr_excel.py` ergänzen (Argument z. B. `2026WS`) und in `02_analyse.py` einlesen;
`ORDER` in `03_build_page.py` um Rathgeb erweitern.

## Quellen und Definitionen
Siehe `QUELLEN.md` und Abschnitt «So wurde gerechnet» auf der Seite. Verlauf der Qualitätsprüfung: `KRITIK.md`.
