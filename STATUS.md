# 🪄 Somedia Sidekick - Status & Nächste Schritte

**Stand:** 6. Februar 2026
**Projekt:** AI-gestützter Schreibassistent für Somedia (basierend auf Somedia-Sprachrichtlinien 2022)

---

## ✅ Was ist fertig?

### 1. Vollständiger Code (MVP Variante A)

**Alle Dateien erstellt** (11 Files):
- ✅ **[sidekick.js](sidekick.js)** - Haupt-Script (Bookmarklet-Logik, 450 Zeilen)
- ✅ **[index.html](index.html)** - Setup-Seite mit API-Key-Management
- ✅ **[test.html](test.html)** - Lokale Test-Umgebung (Purple Hub Simulator)
- ✅ **[prompts.js](prompts.js)** - Prompt-Templates mit Somedia-Regeln
- ✅ **[config.js](config.js)** - CMS-Selektoren & Konfiguration
- ✅ **[README.md](README.md)**, **[ANLEITUNG.md](ANLEITUNG.md)**, **[DEPLOYMENT.md](DEPLOYMENT.md)**, **[NEXT-STEPS.md](NEXT-STEPS.md)**
- ✅ **[package.json](package.json)**, **[.gitignore](.gitignore)**

### 2. Funktionen (alle 4 implementiert)

| Funktion | Status | Beschreibung |
|----------|--------|--------------|
| 🎯 Titelvorschläge | ✅ | 5 Titel-Varianten nach Somedia-Regeln |
| 🖼️ ALT-Texte | ✅ | Barrierefreie Bildbeschreibungen (max 125 Zeichen) |
| ✅ Schreibregeln-Check | ✅ | Prüfung gegen Somedia-Sprachrichtlinien |
| 📝 Lead-Generierung | ✅ | Vorspann erstellen (max 280 Zeichen) |

### 3. Somedia-Sprachrichtlinien integriert

Basierend auf **Sprachrichtlinien_2022.pdf**:
- ✅ Geschlechtergerecht (Neutrale Begriffe / Doppelformen, keine *, :, /)
- ✅ Abkürzungen (3 Buchstaben groß, >3 nur erster)
- ✅ Zahlen (bis 12 ausgeschrieben, ab 13 Ziffern)
- ✅ Wochentage (statt "gestern/heute/morgen")
- ✅ Kupplungen (Bindestriche-Regeln)
- ✅ Namen (Zeitungen angeführt, Kürzel nicht)

### 4. Deployment

**GitHub Pages ist live:**
- ✅ Repository: https://github.com/julirai90-glitch/somedia-sidekick
- ✅ Website: https://julirai90-glitch.github.io/somedia-sidekick/
- ✅ Code ist gepusht und öffentlich verfügbar

### 5. Purple Hub CMS-Integration

**CMS erkannt & Selektoren implementiert:**
- ✅ Custom WordPress: "Purple Hub" (c02.purpleshub.com)
- ✅ DOM-Selektoren:
  - Titel: `h1[contenteditable="true"]`
  - Lead: `[data-placeholder="Lead"]`
  - Content: `.ProseMirror`

---

## ✅ Phase 2 Abgeschlossen: n8n-Backend bereit!

### CORS-Problem gelöst

Das **n8n-Backend ist fertig konfiguriert** und löst das CORS-Problem:

```
✅ Browser → n8n (n8n.julianreich.ch) → Claude API
```

**Was wurde umgesetzt:**
- ✅ n8n-Workflow als JSON exportiert ([n8n-workflow-somedia-sidekick.json](n8n-workflow-somedia-sidekick.json))
- ✅ sidekick.js angepasst (nutzt jetzt n8n-Backend statt direkter API)
- ✅ Alle 4 Funktionen umgebaut (Titel, ALT-Text, Check, Lead)
- ✅ API-Key-Management entfernt (wird jetzt auf Server verwaltet)

### Wie es jetzt funktioniert

**Architektur:**
```
Bookmarklet (Browser)
    ↓ POST zu https://n8n.julianreich.ch/webhook/somedia-sidekick
n8n-Workflow (Server)
    ↓ Claude API + Somedia-Regeln
Response zurück → Anzeige im Sidebar
```

**Request-Format:**
```json
{
  "type": "titles|alttext|check|lead",
  "content": "Artikel-Text...",
  "context": {
    "title": "...",
    "lead": "..."
  }
}
```

---

## 🎯 Nächste Schritte: n8n-Workflow importieren

### Warum n8n-Backend?

**Das ist DIE Lösung für das CORS-Problem:**

```
AKTUELL (funktioniert nicht):
Bookmarklet → Claude API (❌ CORS-Blockade)

MIT N8N (funktioniert):
Bookmarklet → n8n-Server → Claude API (✅ Kein CORS)
```

**Vorteile:**
1. ✅ **Umgeht CORS** (Server-zu-Server-Kommunikation)
2. ✅ **API-Key sicher** (nur auf Server, nicht im Browser)
3. ✅ **Schreibregeln zentral** (auf Server, leicht änderbar)
4. ✅ **Team-fähig** (mehrere Redakteure nutzen gleichen Endpoint)
5. ✅ **Logging möglich** (wer nutzt was, wann?)
6. ✅ **Budget-Kontrolle** (Rate-Limiting auf Server-Seite)

---

## 📋 Installation (3 einfache Schritte)

### Schritt 1: n8n-Workflow importieren (5 Min)

1. **n8n öffnen**: https://n8n.julianreich.ch
2. **Workflow importieren**:
   - Klicke auf "+" → "Import from File"
   - Wähle Datei: `n8n-workflow-somedia-sidekick.json`
3. **Credentials erstellen**:
   - Gehe zu "Settings" → "Credentials"
   - Erstelle neue "Header Auth" Credential
   - Name: "Anthropic Header Auth"
   - Header Name: `x-api-key`
   - Header Value: `[DEIN-CLAUDE-API-KEY]`
4. **Workflow aktivieren**: Toggle oben rechts auf "Active"

### Schritt 2: Code zu GitHub pushen (2 Min)

```bash
cd C:\Users\julir\Claude_Code_Workspace\somedia-sidekick

git add .
git commit -m "feat: Add n8n backend proxy to bypass CORS"
git push
```

### Schritt 3: Testen (5 Min)

1. **Warte 2-3 Min** (GitHub Pages Update)
2. **Purple Hub CMS** öffnen: https://c02.purpleshub.com
3. **Sidekick-Bookmark** klicken (oder neu ziehen von https://julirai90-glitch.github.io/somedia-sidekick/)
4. **Alle 4 Funktionen testen**:
   - 🎯 Titelvorschläge
   - 🖼️ ALT-Texte
   - ✅ Schreibregeln prüfen
   - 📝 Lead generieren
5. **Fertig!** 🎉

---

## 🔧 n8n-Workflow-Struktur (Detailplan)

### Workflow-Nodes

```
① Webhook Node
   ├─ Path: /webhook/somedia-sidekick
   ├─ Method: POST
   └─ Authentication: None (oder Basic Auth optional)

② Switch Node (Routing)
   ├─ Branch 1: type === 'titles'
   ├─ Branch 2: type === 'alttext'
   ├─ Branch 3: type === 'check'
   └─ Branch 4: type === 'lead'

③ Function Node (pro Branch)
   ├─ Prompt vorbereiten
   ├─ Somedia-Regeln einbauen
   └─ System + User Message erstellen

④ Anthropic Chat Model Node ⭐
   ├─ Model: claude-sonnet-4-5-20250929
   ├─ System Message: {{ $json.system }}
   ├─ User Message: {{ $json.user }}
   └─ API Key: {{ $env.CLAUDE_API_KEY }}

⑤ Respond to Webhook
   └─ Return: { success: true, result: "..." }
```

### Beispiel: Function Node für "Titel generieren"

```javascript
const content = $input.item.json.content;

const SOMEDIA_RULES = `
SOMEDIA-SPRACHRICHTLINIEN:
1. GESCHLECHTERGERECHT: Neutrale Begriffe (Mitarbeitende) oder Doppelformen
   NICHT: *, :, /, -Innen
2. ABKÜRZUNGEN: 3 Buchstaben groß (UNO), >3 nur erster (Fifa)
3. ZAHLEN: Bis 12 ausgeschrieben, ab 13 Ziffern
4. WOCHENTAGE: Statt "gestern/heute/morgen" → konkreter Wochentag
`;

return {
  json: {
    system: `Du bist ein erfahrener Redakteur bei Somedia (Südostschweiz).
${SOMEDIA_RULES}

Deine Aufgabe: Erstelle prägnante, informative Titel.`,
    user: `Erstelle 5 verschiedene Titel für folgenden Artikel.

${content}

FORMAT: Nur die 5 Titel, nummeriert (1. bis 5.), keine Erklärungen.`,
    model: "claude-sonnet-4-5-20250929"
  }
};
```

---

## 📚 Wichtige Dateien & Links

### Lokal
- **Projekt**: `C:\Users\julir\Claude_Code_Workspace\somedia-sidekick\`
- **Plan**: `C:\Users\julir\.claude\plans\stateful-scribbling-fox.md`
- **Dieser Status**: `STATUS.md`

### Online
- **GitHub Repo**: https://github.com/julirai90-glitch/somedia-sidekick
- **Setup-Seite**: https://julirai90-glitch.github.io/somedia-sidekick/
- **n8n**: https://n8n.julianreich.ch
- **Purple Hub CMS**: https://c02.purpleshub.com

### Dokumentation
- **[ANLEITUNG.md](ANLEITUNG.md)** - Vollständige Nutzungsanleitung
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - 3 Deployment-Varianten
- **[NEXT-STEPS.md](NEXT-STEPS.md)** - Originale Schritte (vor CORS-Problem)

---

## 🔑 Wichtige Infos

### API-Key
- **Status**: Neuer Key erstellt (alter wurde exposed)
- **Wo**: Anthropic Console (https://console.anthropic.com/settings/keys)
- **Speicherort nach n8n-Setup**: Environment Variable auf Server

### GitHub
- **Username**: julirai90-glitch
- **Email**: (in git config gesetzt)

### Server
- **IP**: 91.98.76.206
- **n8n**: Docker in `/home/n8n/n8n-docker-caddy`
- **SSH**: `ssh root@91.98.76.206`

---

## ⚡ Quick-Start beim nächsten Mal

**Wenn du weitermachst:**

1. Lies diese Datei (**STATUS.md**)
2. Öffne **n8n**: https://n8n.julianreich.ch
3. Sage Claude: "Erstelle mir den n8n-Workflow für Somedia Sidekick"
4. Importiere/baue den Workflow
5. Passe **sidekick.js** an (Zeile ~129)
6. Push zu GitHub
7. Teste im CMS
8. **Fertig!** 🎉

---

## 💡 Warum so komplex?

**Frage**: Warum nicht einfach direkt Claude API aufrufen?
**Antwort**: **CORS-Policy** - Browser blockieren aus Sicherheitsgründen API-Aufrufe über Domain-Grenzen.

**Frage**: Warum nicht einfach eine Browser-Extension?
**Antwort**: **Aufwand höher** (2-3h), **Installation komplexer**, **Updates aufwändiger**. n8n-Lösung ist professioneller und team-fähig.

**Frage**: Warum n8n und nicht ein anderer Server?
**Antwort**: **Hast du bereits**, **visuell konfigurierbar**, **keine Programmierung nötig**, **schneller**.

---

## 🎯 Ziel

**Ein funktionierendes Somedia Sidekick Tool**, das:
- ✅ Im Purple Hub CMS läuft
- ✅ Somedia-Sprachrichtlinien prüft
- ✅ Von mehreren Redakteuren nutzbar ist
- ✅ Sicher und professionell ist

**Fast geschafft** - nur noch der n8n-Workflow fehlt! 💪

---

**Version:** 1.0
**Letztes Update:** 6. Februar 2026, 09:30 Uhr
**Nächster Schritt:** n8n-Workflow erstellen
