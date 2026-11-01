# Social-Video «Heimweh – Fernweh» (Terra Grischuna 5 | 2026)

Ein Video, in dem das Heft durchgeblättert wird: 3D-Blättern mit Papierwölbung, Kamerafahrten auf einzelne Artikel, die dabei in Bewegung kommen. Ausgegeben wird 9:16 (Reels/Stories/TikTok), 30 fps, in zwei Fassungen: lang (~60 s) und kurz (~30 s: Cover, Kaffeebarone, Cathomas, Heidi, Schluss).

Die Heftseiten selbst (Revisions-PDF) liegen **nicht** im Repo, weil das Heft urheberrechtlich geschützt ist. `prepare.sh` erzeugt sie lokal aus dem PDF.

## Ablauf

| Zeit | Seite | Was sich bewegt |
|---|---|---|
| 0–2,5 s | Cover (Vorschlag 11, «Thorvaldsen») | Meer kräuselt sich, Umschlag klappt auf |
| +0–3 s | 1 (Inhalt) | Kamerafahrt, Titel «Heimweh – Fernweh» |
| 3–9 s | 4/5 Kaffeebarone | Gemälde löst sich aus der Seite, Ken Burns, das Wasser kräuselt sich |
| 9–17 s | 8/9 Statistik «Wer geht» | Zuckerbäcker-Städte pulsieren, Zähler bis 16 500, Balken 1874–1920 wachsen |
| 17–23 s | 14/15 Bruno Cathomas | Porträt mit Parallaxe, Zitat «Ich war wirklich das klassische Landei.» |
| 23–29 s | 18/19 Verner Soler | Laub wiegt im Wind, Zitat «Salbe für das Heimweh» |
| 29–36 s | 26/27 Statistik «Wer kommt» | Wanderungssaldo-Balken wachsen ab der Nulllinie, Hinweis auf 2025 |
| 36–38 s | 28–33 | Schnelles Blättern: Ilanz · Cazis · Ferrera |
| 38–43 s | 34/35 Heidi | Filmbild wird zur Schneekugel mit Schneefall |
| 43–52 s | Magazin | Museum Langwies, Jagd-Oper, Alpahirt, Kunstmuseum |
| 52–57 s | Schluss | Logo, Heftitel, terragrischuna.ch |

Zeiten der langen Fassung ohne Cover; mit Cover kommen 2,5 s dazu.

## Herkunft der Texte

Alle Texte im Video stammen aus dem Heft (Editorial S. 3, Titel, Leads, Grafiken). Die Balken werden nicht nachgezeichnet: Die Originalgrafik wird freigestellt und spaltenweise wieder eingeblendet. Erfundene Werte gibt es deshalb nicht.

## Neu rendern

```bash
./prepare.sh /pfad/revision_tg0526_inhalt_REV.pdf   # Seitenbilder + Diagramm-Geometrie
# Schriften (Barlow Semi Condensed, Source Serif 4; SIL OFL) nach assets/ laden, Logo nach assets/logo_white.png
./prepare_cover.sh /pfad/cover.pdf                   # U1 = rechte Hälfte, Seite 1 (Covervorschläge: Seite 11 -> Skript anpassen)
node render.js 1080 1920 30 out.mp4                  # lange Fassung, ohne Ton
Q='&cut=short' node render.js 1080 1920 30 kurz.mp4  # 30-s-Fassung (Q='&cover=0' = ohne Cover)
python3 sfx.py out_events.json sfx.wav               # synthetische Blättergeräusche
ffmpeg -i out.mp4 -i sfx.wav -c:v copy -c:a aac -b:a 192k -shortest out_sfx.mp4
```

Vorschau einzelner Frames: `node snap.js 1080 1920 shot 12.5 20`.
