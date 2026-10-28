# Schwedenrätsel-Generator (Prototyp)

Erzeugt ein Schwedenrätsel im Layout des Südostschweiz-/Bündner-Tagblatt-Rätsels
(13×15 Felder, Lösungswort-Kästchen unten, Box «Auflösung des letzten Rätsels»)
und setzt es als PDF: Rätsel, Auflösung, Kontrollliste.

## Ablauf

```bash
python3 build_wordlist.py          # einmalig: Wortliste bauen (lädt Quellen herunter)
python3 generate.py --seed 7       # Gitter füllen -> raetsel.json
# fehlende Fragen in ergaenzt.tsv nachtragen (Liste gibt generate.py aus)
python3 render.py raetsel.json raetsel.pdf
```

`generate.py` macht mehrere Versuche und nimmt das beste Gitter. Nicht jeder Versuch
findet ein Gitter; bei «Kein Gitter gefunden» mit anderem `--seed` oder mehr
`--versuche` erneut starten (ein Durchlauf dauert einige Minuten).

## Dateien

| Datei | Inhalt |
|---|---|
| `kuratiert.tsv` | Wörter mit fertiger Frage, werden bevorzugt (inkl. Graubünden-Begriffe) |
| `ergaenzt.tsv` | Fragen, die nach einem Durchlauf ergänzt wurden (wiederverwendbar) |
| `blacklist.txt` | Wörter, die nie ins Rätsel sollen |
| `woerter.tsv` | Füll-Wortliste (generiert, nicht von Hand bearbeiten) |

Schreibweise: Umlaute als AE/OE/UE, kein ß. In Fragen markiert `|` eine Trennstelle.

## Quellen der Füll-Wortliste

- Grundformen: LibreOffice-Wörterbuch `de_CH_frami` (GPL/LGPL/MPL)
- Häufigkeit: hermitdave/FrequencyWords `de_50k` (Untertitel-Korpus, CC-BY-SA 4.0)

## Grenzen (Stand Prototyp)

- Fragen für nicht-kuratierte Wörter müssen von Hand geschrieben und **gegengelesen** werden.
- Die Füll-Wortliste enthält Namen, Abkürzungen und vereinzelt schwache Wörter;
  die Kontrollliste (Seite 3 im PDF) vor dem Druck durchgehen und Unpassendes in
  `blacklist.txt` eintragen.
- Schrift: Liberation Sans, horizontal gestaucht (kein echter Condensed-Schnitt).
