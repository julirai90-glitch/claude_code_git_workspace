# Somedia Sidekick - Anleitung

## Übersicht

Somedia Sidekick ist ein AI-gestützter Schreibassistent, der direkt im Purple Hub CMS läuft. Er basiert auf den **Somedia-Sprachrichtlinien 2022** und nutzt die Claude API (Anthropic).

## Schnellstart

### 1. Claude API-Key besorgen

1. Gehe zu [console.anthropic.com](https://console.anthropic.com/)
2. Erstelle einen Account (falls noch nicht vorhanden)
3. Navigiere zu "API Keys"
4. Erstelle einen neuen Key
5. Kopiere den Key (beginnt mit `sk-ant-api03-...`)

### 2. Lokales Setup & Testing

1. Öffne `index.html` im Browser
2. Gib deinen API-Key ein und klicke "API-Key speichern"
3. Öffne `test.html` für lokale Tests
4. Klicke "Beispiel-Inhalt einfügen"
5. Klicke "Sidekick laden"
6. Teste alle Funktionen

### 3. Bookmarklet erstellen

**Option A: Für Deployment (GitHub Pages)**
1. Pushe den Code auf GitHub
2. Aktiviere GitHub Pages
3. Passe die URL im Bookmarklet an (in `index.html`)
4. Ziehe den Bookmarklet-Button in die Lesezeichen-Leiste

**Option B: Lokal (nur für Entwicklung)**
1. Erstelle ein neues Lesezeichen
2. Als URL verwende:
```javascript
javascript:(function(){var s=document.createElement('script');s.src='file:///C:/Users/julir/Claude_Code_Workspace/somedia-sidekick/sidekick.js?'+Date.now();document.body.appendChild(s);})();
```
3. Speichere das Lesezeichen

⚠️ **Hinweis**: `file://`-URLs funktionieren nicht in allen Browsern aus Sicherheitsgründen!

### 4. Im CMS verwenden

1. Öffne einen Artikel im Purple Hub CMS (`c02.purpleshub.com`)
2. Klicke auf das Sidekick-Bookmark
3. Die Sidebar erscheint rechts
4. Wähle eine Funktion aus den 4 Buttons

---

## Funktionen im Detail

### 🎯 Titelvorschläge

**Was es macht:**
- Analysiert den Artikel-Inhalt
- Generiert 5 verschiedene Titel-Varianten
- Berücksichtigt Somedia-Sprachrichtlinien

**Wann verwenden:**
- Wenn du Inspiration für einen Titel brauchst
- Um verschiedene Perspektiven zu bekommen
- Für A/B-Testing von Titeln

**Beispiel-Output:**
```
1. Graubünden investiert 5,6 Millionen Franken in Digitalisierung
2. Kantonsregierung lanciert Digitalisierungsprogramm
3. 5,6 Millionen für Schulen und Unternehmen
4. Digitalisierung: Regierung stellt umfassendes Programm vor
5. Start-ups und Schulen profitieren von neuem Programm
```

### 🖼️ ALT-Texte generieren

**Was es macht:**
- Erstellt barrierefreie Bildbeschreibungen
- Maximal 125 Zeichen
- Basierend auf Artikel-Kontext

**Wann verwenden:**
- Bei jedem Bild im Artikel
- Für Accessibility (Screenreader)
- Um SEO zu verbessern

**Beispiel-Output:**
```
Bild 1: Regierungsrat Mario Cavigelli präsentiert an Medienkonferenz in Chur das Digitalisierungsprogramm
Bild 2: Schülerinnen und Schüler arbeiten an Computern in modernem Klassenzimmer
```

### ✅ Schreibregeln prüfen

**Was es macht:**
- Prüft Text auf Verstöße gegen Somedia-Richtlinien
- Gibt konkrete Verbesserungsvorschläge
- Markiert problematische Stellen

**Wann verwenden:**
- Vor dem Veröffentlichen
- Bei unsicheren Formulierungen
- Für Qualitätskontrolle

**Beispiel-Output:**
```
1. [GENDERN] - Problem: "Lehrer und Schüler" → Vorschlag: "Lehrpersonen und Schulkinder" oder "Lehrerinnen und Lehrer sowie Schülerinnen und Schüler"
2. [ZAHLEN] - Problem: "14 Millionen" → Korrekt (ab 13 als Ziffern)
3. [WOCHENTAGE] - Problem: "gestern" → Vorschlag: "am Montag"
4. [ABKÜRZUNGEN] - Problem: "usw." → Vorschlag: ausschreiben oder weglassen
```

### 📝 Lead generieren

**Was es macht:**
- Erstellt einen prägnanten Vorspann (Lead)
- Maximal 280 Zeichen
- Beantwortet W-Fragen (Wer, Was, Wann, Wo)

**Wann verwenden:**
- Wenn du Schwierigkeiten hast, den Lead zu formulieren
- Um verschiedene Ansätze zu sehen
- Als Ausgangspunkt für eigene Formulierung

**Beispiel-Output:**
```
Die Kantonsregierung hat am Montag ein umfassendes Digitalisierungsprogramm vorgestellt. Insgesamt 5,6 Millionen Franken sollen in den kommenden drei Jahren in Bildung, Wirtschaft und Infrastruktur fliessen.
```

---

## Somedia-Sprachrichtlinien (Kurzübersicht)

Der Sidekick beachtet automatisch folgende Regeln:

### 1. Geschlechtergerecht schreiben
✅ **Erlaubt:**
- Neutrale Begriffe: Mitarbeitende, Studierende, Führungskraft
- Doppelformen: Bürgerinnen und Bürger, Politikerinnen und Politiker

❌ **Nicht erlaubt:**
- Sternchen: Mitarbeiter*innen
- Doppelpunkt: Konsument:innen
- Schrägstrich: Mitarbeiter/Mitarbeiterin
- Binnen-I: MitarbeiterInnen

### 2. Abkürzungen
- **3 Buchstaben**: Großgeschrieben (GKB, DMO, UNO)
- **Mehr als 3**: Nur erster Buchstabe groß, wenn aussprechbar (Fifa, Unesco)
- **Im Lauftext nicht erlaubt**: etc., z. Bsp, usw.

### 3. Zahlen
- **Bis 12**: Ausgeschrieben (drei, zwölf)
- **Ab 13**: Ziffern (14, 125)
- **Geldbeträge**: Immer Ziffern (80 Rappen, 5000 Franken)

### 4. Wochentage
- **Statt**: "gestern", "heute", "morgen"
- **Schreibe**: "am Montag", "am Dienstag", etc.

### 5. Kupplungen (Bindestriche)
- **Drei gleiche Vokale**: Tee-Ei, See-Elefant
- **Unübersichtlich**: Corona-Epidemie, Mehrzweck-Küchenmaschine

### 6. Namen
- **Zeitungen**: Angeführt («Bündner Tagblatt»)
- **Zeitungskürzel**: Nicht angeführt (NZZ, BaZ)
- **Online**: Kleingeschrieben + angeführt («suedostschweiz.ch»)

---

## Deployment

### GitHub Pages (Empfohlen)

1. **Repository erstellen**
   ```bash
   cd C:\Users\julir\Claude_Code_Workspace\somedia-sidekick
   git init
   git add .
   git commit -m "Initial commit: Somedia Sidekick v1.0"
   ```

2. **Auf GitHub pushen**
   ```bash
   # Repository auf GitHub erstellen (github.com/new)
   git remote add origin https://github.com/DEIN-USERNAME/somedia-sidekick.git
   git branch -M main
   git push -u origin main
   ```

3. **GitHub Pages aktivieren**
   - Gehe zu Repository Settings
   - Navigiere zu "Pages"
   - Source: "main" branch
   - Speichern

4. **Bookmarklet-URL anpassen**
   - Öffne `index.html`
   - Ändere die URL im Bookmarklet:
   ```javascript
   https://DEIN-USERNAME.github.io/somedia-sidekick/sidekick.js
   ```

5. **Testen**
   - Öffne `https://DEIN-USERNAME.github.io/somedia-sidekick/`
   - Folge den Setup-Anweisungen

### Alternative: Eigener Server

Falls du einen eigenen Webserver hast:

1. Kopiere alle Dateien auf den Server
2. Stelle sicher, dass `sidekick.js` über HTTPS erreichbar ist
3. Passe die URL im Bookmarklet entsprechend an

---

## Troubleshooting

### Sidekick lädt nicht

**Problem**: Bookmarklet reagiert nicht

**Lösung**:
1. Öffne Browser-Console (F12)
2. Schaue nach Fehlermeldungen
3. Prüfe ob du im richtigen CMS bist (purpleshub.com)
4. Stelle sicher, dass die Script-URL erreichbar ist

### API-Fehler

**Problem**: "API-Fehler" oder "Authentication Error"

**Lösung**:
1. Prüfe ob API-Key korrekt gespeichert ist
2. Teste Key auf [console.anthropic.com](https://console.anthropic.com/)
3. Stelle sicher, dass Guthaben vorhanden ist
4. Lösche den Key und gib ihn neu ein

### Content wird nicht gefunden

**Problem**: "Kein Inhalt gefunden"

**Lösung**:
1. Prüfe ob Purple Hub CMS-Struktur geändert wurde
2. Öffne Browser-Console und prüfe Selektoren
3. Passe `SELECTORS` in `sidekick.js` an
4. Teste mit `test.html` lokal

### CORS-Fehler

**Problem**: "CORS policy" Fehler in Console

**Lösung**:
- Das sollte nicht passieren (Claude API hat CORS aktiviert)
- Falls doch: Prüfe ob ein Browser-Plugin blockiert
- Teste in Incognito-Modus

---

## API-Kosten

### Claude API Pricing (Stand Februar 2024)

**Claude Sonnet 4.5:**
- Input: $3 per 1M tokens (~750k Wörter)
- Output: $15 per 1M tokens (~750k Wörter)

**Geschätzte Kosten pro Anfrage:**
- Titel generieren: ~$0.01-0.02
- Lead erstellen: ~$0.01
- ALT-Text: ~$0.005
- Schreibregeln-Check: ~$0.02-0.03

**Monatliche Kosten** (bei täglicher Nutzung):
- 5 Titel-Generierungen/Tag: ~$3/Monat
- 10 Schreibregeln-Checks/Tag: ~$9/Monat

→ **Ca. $10-20/Monat** bei intensiver Nutzung

---

## Erweiterungen

### Geplante Features (Future)

- [ ] **Mehrsprachigkeit**: Rätoromanisch, Italienisch
- [ ] **Sentiment-Analyse**: Tonalität des Textes prüfen
- [ ] **Fact-Checking**: Automatische Quellenprüfung
- [ ] **Bild-Upload**: ALT-Text direkt vom Bild generieren
- [ ] **Export**: Ergebnisse als Notizen speichern
- [ ] **Shortcuts**: Keyboard-Shortcuts für schnelleren Zugriff

### Backend-Integration (Optional)

Falls mehrere Redakteure das Tool nutzen:

1. **n8n-Workflow** auf deinem Server (91.98.76.206)
2. **Zentrale Schreibregeln-Verwaltung**
3. **Logging & Analytics**
4. **Team-API-Key** (statt individuellem Key)

Siehe [Plan](../plans/stateful-scribbling-fox.md) für Details.

---

## Support & Feedback

**Fragen?** Öffne ein Issue auf GitHub.

**Verbesserungsvorschläge?** Pull Requests sind willkommen!

---

## Lizenz

MIT License - Frei verwendbar für Somedia und externe Projekte.

---

**Version**: 1.0
**Stand**: Februar 2026
**Basierend auf**: Somedia-Sprachrichtlinien 2022
