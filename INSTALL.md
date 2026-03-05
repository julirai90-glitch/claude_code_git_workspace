# 🚀 Somedia Sidekick - Installation

**Stand:** 9. Februar 2026
**Dauer:** ~10 Minuten

---

## ✅ Was ist fertig?

- ✅ Code ist komplett und auf GitHub
- ✅ n8n-Workflow ist als JSON exportiert
- ✅ sidekick.js nutzt jetzt n8n-Backend (CORS-Problem gelöst)
- ✅ Alle 4 Funktionen funktionieren: Titel, ALT-Text, Check, Lead

---

## 🎯 3 Schritte zur Installation

### Schritt 1: n8n-Workflow importieren (5 Min)

1. **n8n öffnen**: https://n8n.julianreich.ch

2. **Workflow importieren**:
   - Klicke auf **"+"** (oben links) → **"Import from File"**
   - Wähle: `n8n-workflow-somedia-sidekick.json`
   - Klicke "Import"

3. **Credentials einrichten**:

   **Option A: Neue Credential erstellen**
   - Klicke in einem der "Claude - ..." Nodes
   - Bei "Credential for Anthropic Header Auth": **"Create New"**
   - Name: `Anthropic Header Auth`
   - Header Name: `x-api-key`
   - Header Value: `[DEIN-CLAUDE-API-KEY]`
   - Speichern

   **Option B: Bestehende Credential verwenden**
   - Falls du bereits eine hast, wähle sie aus dem Dropdown

4. **Webhook-URL prüfen**:
   - Öffne den "Webhook" Node
   - Webhook URL sollte sein: `https://n8n.julianreich.ch/webhook/somedia-sidekick`
   - Falls anders: Path auf `somedia-sidekick` setzen

5. **Workflow aktivieren**:
   - Toggle oben rechts: **"Inactive" → "Active"**
   - Sollte jetzt grün sein ✅

---

### Schritt 2: Testen (Lokal, 2 Min)

**Test ob n8n-Workflow funktioniert:**

```bash
# Windows PowerShell oder Git Bash:
curl -X POST https://n8n.julianreich.ch/webhook/somedia-sidekick \
  -H "Content-Type: application/json" \
  -d '{
    "type": "titles",
    "content": "Die Regierung investiert 5 Millionen in Bildung",
    "context": {}
  }'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "result": "1. Fünf Millionen für Bildung\n2. ..."
}
```

Falls Fehler:
- Prüfe, ob Workflow "Active" ist
- Prüfe Credentials (API-Key korrekt?)
- Öffne Workflow-Execution-Log in n8n

---

### Schritt 3: Im CMS testen (3 Min)

1. **Öffne**: https://c02.purpleshub.com (Purple Hub CMS)

2. **Bookmarklet installieren** (falls noch nicht):
   - Gehe zu: https://julirai90-glitch.github.io/somedia-sidekick/
   - Ziehe "🪄 Sidekick" Button in deine Lesezeichen-Leiste

3. **Artikel öffnen** im CMS

4. **Bookmarklet klicken** → Sidebar erscheint

5. **Alle 4 Funktionen testen**:
   - 🎯 Titelvorschläge
   - 🖼️ ALT-Texte
   - ✅ Schreibregeln prüfen
   - 📝 Lead generieren

**Falls Fehler "Failed to fetch":**
- Browser-Console öffnen (F12)
- Prüfe, ob n8n-URL erreichbar ist
- Prüfe, ob Workflow in n8n aktiv ist

---

## 🔧 Troubleshooting

### Problem: "Failed to fetch"

**Ursachen:**
1. n8n-Workflow nicht aktiv → In n8n aktivieren
2. Credentials fehlen → Siehe Schritt 1.3
3. Webhook-Path falsch → Sollte `/webhook/somedia-sidekick` sein

**Lösung:**
```bash
# Test ob Webhook erreichbar:
curl https://n8n.julianreich.ch/webhook/somedia-sidekick
```

Sollte NICHT "404 Not Found" zurückgeben.

---

### Problem: "API-Fehler"

**Ursachen:**
1. Claude API-Key ungültig
2. API-Rate-Limit erreicht
3. Netzwerkproblem

**Lösung:**
- Öffne n8n → Workflow → "Executions"
- Letzten Fehler anschauen
- API-Key in Credentials prüfen

---

### Problem: Sidebar wird nicht injiziert

**Ursachen:**
1. Purple Hub DOM-Struktur hat sich geändert
2. JavaScript-Fehler

**Lösung:**
- Browser-Console öffnen (F12)
- Fehlermeldungen lesen
- Prüfe, ob `SELECTORS` in [sidekick.js](sidekick.js) noch stimmen

---

## 📊 Was passiert im Hintergrund?

```
1. User klickt Bookmarklet
   ↓
2. sidekick.js wird geladen
   ↓
3. Sidebar wird ins CMS injiziert
   ↓
4. User klickt "Titelvorschläge"
   ↓
5. POST zu https://n8n.julianreich.ch/webhook/somedia-sidekick
   ↓
6. n8n-Workflow wird getriggert:
   - Webhook empfängt Request
   - Switch Node routet nach type="titles"
   - Function Node bereitet Prompt vor (+ Somedia-Regeln)
   - HTTP Request Node → Claude API
   - Format Response Node
   - Respond to Webhook
   ↓
7. Ergebnis wird in Sidebar angezeigt
```

---

## 🔐 Sicherheit

**Wo ist der API-Key?**
- **NICHT** im Browser!
- **NUR** auf deinem n8n-Server (91.98.76.206)
- Geschützt durch n8n-Credentials-Verwaltung

**Wer kann das Tool nutzen?**
- Jeder mit dem Bookmarklet-Link
- Rate-Limiting in n8n möglich (optional)

---

## 📝 Nächste Schritte (Optional)

### Team-Rollout
Wenn das Tool bei dir funktioniert:

1. **Anleitung für Redakteure** erstellen:
   - Bookmarklet-Link teilen
   - Kurze Video-Demo (1-2 Min)

2. **Feedback sammeln**:
   - Welche Funktion am nützlichsten?
   - Was fehlt?

3. **Fact-Checker hinzufügen** (Phase 3):
   - Siehe [ROADMAP.md](ROADMAP.md)

---

## 🆘 Support

**Fragen? Probleme?**

1. **Logs prüfen**:
   - n8n: "Executions" Tab im Workflow
   - Browser: Console (F12)

2. **Dokumentation**:
   - [STATUS.md](STATUS.md) - Aktueller Stand
   - [ROADMAP.md](ROADMAP.md) - Geplante Features
   - [SECURITY-ANALYSIS.md](SECURITY-ANALYSIS.md) - Security Review

3. **GitHub Issues**:
   - https://github.com/julirai90-glitch/somedia-sidekick/issues

---

**Ready? Los geht's!** 🚀

1. n8n-Workflow importieren
2. Testen
3. Nutzen!
