# 🔧 n8n-Workflow manuell erstellen (10 Min)

**Problem:** JSON-Import funktioniert nicht? Kein Problem!
**Lösung:** Workflow manuell erstellen (ist schneller als debuggen)

---

## Schritt-für-Schritt Anleitung

### 1. Neuen Workflow erstellen

1. Öffne https://n8n.julianreich.ch
2. Klicke **"+ New Workflow"**
3. Name: **"Somedia Sidekick Proxy"**

---

### 2. Webhook Node (Trigger)

1. Klicke **"Add first step"** → **"On app event"** → **"Webhook"**
2. Konfiguration:
   - **HTTP Method:** POST
   - **Path:** `somedia-sidekick`
   - **Response Mode:** "Respond to Webhook"
3. Klicke **"Listen for Test Event"** (bleibt offen)

---

### 3. Switch Node (Routing)

1. Füge Node hinzu: **"+"** → **"Flow"** → **"Switch"**
2. Verbinde Webhook → Switch
3. Konfiguration:
   - **Mode:** "Rules"
   - Klicke **"Add Routing Rule"** (4x, für 4 Branches)

**Rule 1: titles**
- Output Name: `titles`
- Conditions: `{{ $json.body.type }}` equals `titles`

**Rule 2: alttext**
- Output Name: `alttext`
- Conditions: `{{ $json.body.type }}` equals `alttext`

**Rule 3: check**
- Output Name: `check`
- Conditions: `{{ $json.body.type }}` equals `check`

**Rule 4: lead**
- Output Name: `lead`
- Conditions: `{{ $json.body.type }}` equals `lead`

---

### 4. Function Node: Prepare Titles Prompt

1. Füge Node hinzu (an Output "titles"): **"+"** → **"Data transformation"** → **"Code"**
2. Name: `Prepare Titles Prompt`
3. Code:

```javascript
const content = $input.item.json.body.content;
const context = $input.item.json.body.context || {};

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

Deine Aufgabe: Erstelle prägnante, informative Titel.
- Titel sollen neugierig machen
- Wichtigste Info zuerst
- Keine Clickbait
- Maximal 60-70 Zeichen`,
    user: `Erstelle 5 verschiedene Titel-Varianten für folgenden Artikel.

${content}

FORMAT: Nur die 5 Titel, nummeriert (1. bis 5.), keine Erklärungen.`,
    model: "claude-sonnet-4-5-20250929"
  }
};
```

---

### 5. HTTP Request Node: Claude API (Titles)

1. Füge Node hinzu: **"+"** → **"Helpers"** → **"HTTP Request"**
2. Name: `Claude - Titles`
3. Konfiguration:
   - **Method:** POST
   - **URL:** `https://api.anthropic.com/v1/messages`
   - **Authentication:** Generic Credential Type
   - **Generic Auth Type:** Header Auth
   - **Credential for Header Auth:** [Erstelle neue - siehe unten]
   - **Send Headers:** ON
     - Header 1: Name: `anthropic-version`, Value: `2023-06-01`
   - **Send Body:** ON
   - **Body Content Type:** JSON
   - **Specify Body:** Using Fields Below
   - **JSON/RAW Parameters:**
     ```
     {
       "model": "={{ $json.model }}",
       "max_tokens": 2000,
       "system": "={{ $json.system }}",
       "messages": [
         {
           "role": "user",
           "content": "={{ $json.user }}"
         }
       ]
     }
     ```

**Header Auth Credential erstellen:**
- Klicke bei "Credential for Header Auth" auf **"+ Create New"**
- Name: `Anthropic Header Auth`
- Header Name: `x-api-key`
- Header Value: `[DEIN-CLAUDE-API-KEY]`
- Speichern

---

### 6. Function Node: Format Response

1. Füge Node hinzu: **"+"** → **"Code"**
2. Name: `Format Response`
3. Code:

```javascript
const response = $input.first().json.content[0].text;

return {
  json: {
    success: true,
    result: response
  }
};
```

---

### 7. Respond to Webhook Node

1. Füge Node hinzu: **"+"** → **"Flow"** → **"Respond to Webhook"**
2. Konfiguration:
   - **Respond With:** JSON
   - **Response Body:** `{{ $json }}`

---

### 8. Weitere Branches (alttext, check, lead)

**Für jede der 3 anderen Branches wiederholen:**

#### alttext Branch:

**Function Node: Prepare ALT-Text Prompt**
```javascript
const content = $input.item.json.body.content;
const context = $input.item.json.body.context || {};

const SOMEDIA_RULES = `
SOMEDIA-SPRACHRICHTLINIEN:
1. GESCHLECHTERGERECHT: Neutrale Begriffe oder Doppelformen
2. ABKÜRZUNGEN: 3 Buchstaben groß, >3 nur erster
3. ZAHLEN: Bis 12 ausgeschrieben, ab 13 Ziffern
`;

return {
  json: {
    system: `Du bist Experte für barrierefreie Bildbeschreibungen.

Richtlinien:
- Maximal 125 Zeichen
- Sachlich und informativ
- Beschreibe was zu sehen ist
- Wichtigste Elemente zuerst`,
    user: `Erstelle einen ALT-Text für folgendes Bild:

${content}

KONTEXT:
Titel: ${context.title || 'N/A'}

FORMAT: Nur der ALT-Text, keine Erklärungen.`,
    model: "claude-sonnet-4-5-20250929"
  }
};
```

**HTTP Request Node:** Wie bei Titles (gleiche Config, gleiche Credential)

#### check Branch:

**Function Node: Prepare Style Check Prompt**
```javascript
const content = $input.item.json.body.content;

const SOMEDIA_RULES = `
SOMEDIA-SPRACHRICHTLINIEN:
1. GESCHLECHTERGERECHT: Neutrale Begriffe oder Doppelformen
   ✗ Falsch: Lehrer*innen, Bürger:innen
   ✓ Richtig: Lehrpersonen, Bürgerinnen und Bürger
2. ABKÜRZUNGEN: 3 Buchstaben groß (UNO), >3 nur erster (Fifa)
3. ZAHLEN: Bis 12 ausgeschrieben, ab 13 Ziffern
4. WOCHENTAGE: Statt "gestern/heute/morgen" → Wochentag
`;

return {
  json: {
    system: `Du bist Qualitätsprüfer für Somedia.

${SOMEDIA_RULES}

Prüfe Texte auf Verstöße. Gib nummerierte Liste zurück.
Falls OK: "✅ Keine Regelverstöße gefunden."`,
    user: `Prüfe folgenden Text:

${content}`,
    model: "claude-sonnet-4-5-20250929"
  }
};
```

**HTTP Request Node:** Wie bei Titles

#### lead Branch:

**Function Node: Prepare Lead Prompt**
```javascript
const content = $input.item.json.body.content;
const context = $input.item.json.body.context || {};

return {
  json: {
    system: `Du bist Redakteur bei Somedia und erstellst Leads.

LEAD-REGELN:
- Maximal 280 Zeichen
- W-Fragen beantworten
- Geschlechtergerecht
- Ergänzt Titel, wiederholt ihn nicht`,
    user: `Erstelle einen Lead für:

Titel: ${context.title || 'N/A'}

${content}

FORMAT: Nur der Lead, max 280 Zeichen.`,
    model: "claude-sonnet-4-5-20250929"
  }
};
```

**HTTP Request Node:** Wie bei Titles

---

### 9. Alle Branches zusammenführen

**Wichtig:** Alle 4 HTTP Request Nodes → Format Response Node → Respond to Webhook

Verbindungen:
```
Switch → titles → Function (Titles) → HTTP (Titles) ┐
Switch → alttext → Function (ALT) → HTTP (ALT)      ├→ Format Response → Respond to Webhook
Switch → check → Function (Check) → HTTP (Check)    │
Switch → lead → Function (Lead) → HTTP (Lead)       ┘
```

---

### 10. Workflow aktivieren

1. Klicke **"Save"** (oben rechts)
2. Toggle **"Active"** (oben rechts)
3. **Fertig!** ✅

---

## Testen

### Test 1: In n8n (Production URL)

1. Kopiere die Webhook-URL:
   ```
   https://n8n.julianreich.ch/webhook/somedia-sidekick
   ```

2. Terminal-Test:
```bash
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
  "result": "1. Fünf Millionen für Bildung\n2. Regierung investiert in Schulen\n..."
}
```

### Test 2: Im CMS

1. Öffne https://c02.purpleshub.com
2. Öffne einen Artikel
3. Klicke Sidekick-Bookmarklet
4. Teste alle Funktionen

---

## Troubleshooting

### Fehler: "Could not find property"
→ Doppelklicke auf Node, prüfe ob alle Felder ausgefüllt sind

### Fehler: "401 Unauthorized"
→ API-Key in Credentials prüfen

### Fehler: "Cannot read property 'body'"
→ Webhook empfängt falsches Format. Request-Body prüfen.

### Keine Response
→ Prüfe, ob "Respond to Webhook" Node verbunden ist

---

## Visual Guide (Workflow-Layout)

```
Webhook
   ↓
Switch
   ├─ titles → Function → HTTP → ┐
   ├─ alttext → Function → HTTP → ├→ Format Response → Respond to Webhook
   ├─ check → Function → HTTP → ─┤
   └─ lead → Function → HTTP → ──┘
```

---

## Shortcuts

- **Node hinzufügen:** Klicke auf **"+"** zwischen Nodes
- **Node duplizieren:** Rechtsklick → Duplicate
- **Verbindungen löschen:** Klicke auf Verbindung → Backspace
- **Workflow testen:** Klicke "Test Workflow" (oben)

---

**Fertig?** Dann weiter zu [INSTALL.md](INSTALL.md) Schritt 3!
