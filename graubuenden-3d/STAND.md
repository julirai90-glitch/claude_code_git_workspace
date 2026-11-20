# STAND – Nachtauftrag 20./21.11.2026

Übergabe: 06:30 Europe/Zurich in `graubuenden-3d/GUTEN-MORGEN.md`. Nicht pushen.

Weckrufe (send_later): 02:00 trig_011oA4vWghrBevTAmHiwVJwD · 04:00 trig_01T9G1GW85WVeUdi3BQJvd7H · 05:45 trig_01UJ4BKLmJUMtVqoEQk6YB3o

Python-Umgebung: `~/.cache/orte-3d-venv/bin/python` (neu angelegt, fiona etc.). Cache `~/.cache/orte-3d`.
Lokaler Branch ist 43 Commits hinter origin/gh-pages (nicht gepullt, weil EMBEDS.md lokal geändert ist – fremde Änderung, nicht anfassen).

## Aktuell – ABGESCHLOSSEN (00:14)
- [x] 15 neue 3D-Orte, Atlas, Kritikrunden 1–3, Übergabe GUTEN-MORGEN.md
- [x] Weckrufe gelöscht, Testserver beendet
- Nichts gepusht.
## Probleme
- Thusis: Exklave Mutten grösser als Hauptteil → Ortsnamen fehlten; behoben (gebaeude.json `areas`).
- Soglio: Geländekacheln in Italien fehlen → terrain_km verschoben. 332/644 Gebäude ohne GWR-Treffer.
- Testserver: `python3 -m http.server 8766` im Repo-Root (Hintergrund), Skripte in /tmp/nacht (shot.js, thumb.js, edge.js, perf.js).
