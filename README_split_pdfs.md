Kurzanleitung zum Splitten der PDFs

1) Voraussetzungen
- Python 3.8+ installiert
- PowerShell oder Terminal

2) Installation
```powershell
python -m pip install -r requirements.txt
```

3) Ausführen
- Standardlauf (verwendet die in `split_pdfs.py` eingestellten Pfade):
```powershell
python split_pdfs.py
```
- Oder spezifische Dateien übergeben:
```powershell
python split_pdfs.py "C:\Users\julir\Downloads\StAGR_Bibliothek_STG-RG-15a-2.pdf" "C:\Users\julir\Downloads\StAGR_Bibliothek_STG-RG-15a-3.pdf"
```

4) Ergebnis
- Für jede Quelldatei werden drei Ausgabedateien im selben Ordner erstellt, z.B. `StAGR_Bibliothek_STG-RG-15a-2_part1.pdf`, `_part2.pdf`, `_part3.pdf`.

Wenn du willst, kann ich das Skript anpassen (andere Aufteilung, Namensschema, oder es direkt hier ausführen falls die Dateien ins Workspace kopiert werden).