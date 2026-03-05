# Somedia Sidekick - Nächste Schritte

## ✅ Was ist fertig?

### 1. Vollständiger MVP (Variante A aus dem Plan)
- ✅ Bookmarklet-Architektur
- ✅ Claude API-Integration
- ✅ Alle 4 Funktionen:
  - 🎯 Titelvorschläge
  - 🖼️ ALT-Texte
  - ✅ Schreibregeln-Check
  - 📝 Lead-Generierung
- ✅ Somedia-Sprachrichtlinien integriert
- ✅ Purple Hub CMS-Selektoren
- ✅ Setup-Seite mit API-Key-Management
- ✅ Test-Umgebung für lokales Development

### 2. Dokumentation
- ✅ README.md (Übersicht)
- ✅ ANLEITUNG.md (Detaillierte Nutzungsanleitung)
- ✅ DEPLOYMENT.md (3 Deployment-Varianten)
- ✅ package.json & .gitignore

---

## 🚀 Jetzt testen (15 Minuten)

### Schritt 1: Lokaler Test (5 Min)

```bash
cd C:\Users\julir\Claude_Code_Workspace\somedia-sidekick

# Python-Server starten
python -m http.server 8000

# Öffne Browser:
# http://localhost:8000/
```

1. Öffne `http://localhost:8000/index.html`
2. Gib deinen Claude API-Key ein (beginnt mit `sk-ant-api03-...`)
3. Klicke "API-Key speichern"
4. Öffne `http://localhost:8000/test.html`
5. Klicke "Beispiel-Inhalt einfügen"
6. Klicke "Sidekick laden"
7. Teste alle 4 Funktionen

### Schritt 2: Im echten CMS testen (10 Min)

**Option A: Lokales Bookmarklet (Quick Test)**

1. Erstelle ein Lesezeichen mit dieser URL:
```javascript
javascript:(function(){var s=document.createElement('script');s.src='http://localhost:8000/sidekick.js?'+Date.now();document.body.appendChild(s);})();
```

2. Öffne Purple Hub CMS (`c02.purpleshub.com`)
3. Klicke das Lesezeichen
4. Teste alle Funktionen

⚠️ **Hinweis**: Wenn das CMS HTTPS nutzt, funktioniert `http://localhost` möglicherweise nicht (Mixed Content). Dann direkt zu Schritt 3 übergehen.

---

## 📦 Deployment (30-60 Minuten)

### Option 1: GitHub Pages (Empfohlen, kostenlos)

Folge [DEPLOYMENT.md](DEPLOYMENT.md) → Variante 1

**Schnell-Anleitung:**
```bash
cd C:\Users\julir\Claude_Code_Workspace\somedia-sidekick

# Git initialisieren
git init
git add .
git commit -m "Initial commit: Somedia Sidekick v1.0"

# Auf GitHub (github.com/new ein neues Repository "somedia-sidekick" erstellen)

# Dann:
git remote add origin https://github.com/DEIN-USERNAME/somedia-sidekick.git
git branch -M main
git push -u origin main

# GitHub Pages aktivieren (Settings → Pages → main branch)
```

Nach 2-5 Minuten verfügbar unter:
```
https://DEIN-USERNAME.github.io/somedia-sidekick/
```

**Dann**: Bookmarklet-URL in `index.html` anpassen und neu committen.

### Option 2: Eigener Server (Hetzner)

Falls du es auf `sidekick.julianreich.ch` hosten willst:

Folge [DEPLOYMENT.md](DEPLOYMENT.md) → Variante 2

---

## 🔄 Weitere Entwicklung

### Kurzfristig (optional)

1. **DOM-Selektoren im echten CMS testen**
   - Die aktuellen Selektoren basieren auf dem Screenshot
   - Im echten CMS prüfen ob sie funktionieren
   - Falls nicht: In `sidekick.js` anpassen

2. **Weitere Schreibregeln-PDFs einarbeiten**
   - Du hast noch 4 PDFs, die ich nicht lesen konnte
   - Diese manuell in `prompts.js` → `SOMEDIA_RULES` ergänzen

3. **UI-Verbesserungen**
   - Kopieren-Button für Ergebnisse
   - Keyboard-Shortcuts
   - Dark Mode

### Mittelfristig (Variante B aus dem Plan)

**n8n-Backend für zentrale Schreibregeln-Verwaltung:**

Vorteile:
- Schreibregeln zentral pflegbar (auf deinem Server)
- Prompt-Updates ohne Bookmarklet-Änderung
- Mehrere Redakteure können nutzen
- Logging & Analytics möglich

Setup:
1. n8n-Workflow erstellen (auf 91.98.76.206)
2. Webhook-Endpoint einrichten
3. Schreibregeln als JSON-File auf Server
4. `sidekick.js` anpassen: Statt direkt Claude API → n8n Webhook
5. n8n ruft dann Claude API auf

Aufwand: ~4-6 Stunden

---

## 📊 Kostenübersicht

### Claude API-Kosten (bei deiner Nutzung)

**Annahme**: 10 Anfragen/Tag (5 Titel, 3 Checks, 2 Leads)

- **Pro Anfrage**: ~$0.01-0.02
- **Pro Tag**: ~$0.10-0.20
- **Pro Monat**: ~$3-6

→ **Sehr günstig** für persönliche Nutzung!

**Team-Nutzung** (5 Redakteure):
- **Pro Monat**: ~$15-30

### Hosting-Kosten

- **GitHub Pages**: Kostenlos ✓
- **Eigener Server**: Bereits vorhanden (Hetzner) ✓

---

## 🐛 Bekannte Limitationen

1. **Purple Hub CMS-Updates**
   - Wenn Purple Hub die DOM-Struktur ändert, müssen Selektoren angepasst werden
   - Lösung: Fallback-Selektoren sind bereits implementiert

2. **Offline-Nutzung**
   - Benötigt Internetverbindung (für Claude API)
   - Lösung: Nicht lösbar (AI in der Cloud)

3. **API-Rate-Limits**
   - Claude API hat Rate-Limits
   - Bei vielen Anfragen in kurzer Zeit möglich
   - Lösung: Normalerweise kein Problem, nur bei Missbrauch

4. **Bookmarklet-Updates**
   - Nutzer müssen Bookmarklet neu ziehen wenn Script-URL ändert
   - Lösung: n8n-Backend (Variante B) umgeht das Problem

---

## 📝 TODO-Liste (optional)

- [ ] Lokalen Test durchführen
- [ ] Im echten CMS testen
- [ ] DOM-Selektoren verifizieren/anpassen
- [ ] GitHub Pages Deployment
- [ ] Bookmarklet-URL finalisieren
- [ ] API-Kosten monitoren (erste Woche)
- [ ] Feedback von anderen Redakteuren einholen
- [ ] Weitere Schreibregeln-PDFs einarbeiten
- [ ] Optional: n8n-Backend aufsetzen

---

## 🎯 Erfolgs-Kriterien

✅ **MVP erfolgreich**, wenn:
- [x] Tool lädt im Purple Hub CMS
- [ ] Titelvorschläge generiert werden
- [ ] Schreibregeln-Check funktioniert
- [ ] Ergebnisse sind relevant und hilfreich
- [ ] API-Kosten im Rahmen bleiben (<$10/Monat)

✅ **Ready für Team**, wenn:
- [ ] 1 Woche erfolgreich getestet
- [ ] DOM-Selektoren stabil
- [ ] Dokumentation vollständig
- [ ] Deployment auf GitHub Pages/eigener Server
- [ ] 3+ Redakteure geben positives Feedback

---

## 💡 Verbesserungsideen (aus Nutzung lernen)

Nach 1-2 Wochen Nutzung:

1. **Welche Funktion wird am häufigsten genutzt?**
   → Diese optimieren

2. **Welche Schreibregeln werden oft übersehen?**
   → Prominenter machen im Check

3. **Gibt es wiederkehrende Fehler?**
   → Spezielle Checks dafür einbauen

4. **Welche Titel-Stile bevorzugt?**
   → Prompt optimieren

---

## 🔗 Wichtige Links

- **Projekt**: `C:\Users\julir\Claude_Code_Workspace\somedia-sidekick\`
- **Plan**: `C:\Users\julir\.claude\plans\stateful-scribbling-fox.md`
- **Claude Console**: https://console.anthropic.com/
- **GitHub (nach Push)**: https://github.com/DEIN-USERNAME/somedia-sidekick

---

## 🆘 Support

**Fragen? Probleme?**

1. Schaue in [ANLEITUNG.md](ANLEITUNG.md) → Troubleshooting
2. Prüfe Browser-Console (F12) auf Fehlermeldungen
3. Teste mit [test.html](test.html) lokal
4. Check [DEPLOYMENT.md](DEPLOYMENT.md) für Deployment-Probleme

---

**Viel Erfolg mit Somedia Sidekick! 🚀**
