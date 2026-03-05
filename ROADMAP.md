# 🗺️ Somedia Sidekick - Feature Roadmap

## Phase 1: MVP (DONE ✅)
- [x] Titelvorschläge
- [x] ALT-Texte
- [x] Schreibregeln-Check
- [x] Lead-Generierung
- [x] GitHub Pages Deployment

## Phase 2: n8n-Backend (IN PROGRESS ⏳)
**Warum:** CORS-Problem lösen, damit Tool im CMS funktioniert

**Tasks:**
- [ ] n8n-Workflow erstellen
- [ ] sidekick.js anpassen (API-Endpoint)
- [ ] Im CMS testen
- [ ] Produktiv setzen

**ETA:** 1-2 Stunden

---

## Phase 3: Fact-Checker Integration 🔍

### Übersicht
**Was:** 5. Funktion "🔍 Fact-Check" hinzufügen
**Basierend auf:** Skill "fact-checker" (von Claude)
**Ziel:** Claims in Artikeln verifizieren + Credibility-Score

### Features

#### 1. Claim Extraction
- Identifiziert verifizierbare Aussagen im Artikel
- Filtert Meinungen/Spekulationen heraus
- Output: Liste von Claims mit Kontext

#### 2. Source Research
- Hierarchische Quellen-Priorisierung
- **CH-Fokus**: SRF, Swissinfo, BfS, etc.
- Automatische Quellensuche

#### 3. Credibility Assessment
```
TRUE / FALSE / PARTIAL / UNVERIFIED + Confidence (0-100%)

Weighted-Credibility-Formel:
Score = (Quellen-Glaubwürdigkeit × 40%)
      + (Methodik-Qualität × 30%)
      + (Aktualität × 15%)
      + (Koroborierung × 15%)
```

**Interpretation:**
- **90-100**: Publishable ohne Zweifel ✅
- **70-89**: Publishable mit Kontext-Hinweis ⚠️
- **<70**: Zurück zur Redaktion ❌

#### 4. Source Quality Rating
- Automatische Bewertung der Quellen
- Transparente Kriterien
- Audit-Trail für jede Claim

#### 5. Report Generation
```markdown
## Fact-Check-Report

### Claims (3 identifiziert)

**Claim 1:** "5,6 Millionen Franken Investition"
- Status: ✅ TRUE (Confidence: 95%)
- Quelle: Medienmitteilung Kanton GR, 12.02.2026
- Credibility-Score: 92/100

**Claim 2:** "Programm startet im März"
- Status: ⚠️ PARTIAL (Confidence: 70%)
- Quelle: Inoffizielle Aussage, nicht bestätigt
- Credibility-Score: 68/100
- Hinweis: Warten auf offizielle Bestätigung

**Claim 3:** "Alle Schulen profitieren"
- Status: ❓ UNVERIFIED (Confidence: 45%)
- Quelle: Keine verlässliche Quelle gefunden
- Credibility-Score: 42/100
- Empfehlung: Claim anpassen oder entfernen
```

---

### Domain-spezifische Module

Tailored für Schweizer Medienhaus:

| Domain | Prioritäre Quellen |
|--------|-------------------|
| 🏥 **Gesundheit** | BAG, Swissmedic, SRF Gesundheit |
| 🔬 **Wissenschaft** | ETH, EPFL, SNF, Google Scholar |
| 📊 **Statistik** | BfS, Seco, Eurostat |
| 🏛️ **Politik** | Parlament.ch, Admin.ch, SRF News |
| 💰 **Wirtschaft** | SNB, Seco, SIX, Handelszeitung |
| 🌍 **Lokales** | Kantonsregierungen, Gemeinden |

---

### Integration in Sidekick

#### UI-Erweiterung

**Neuer Button:**
```
🎯 Titel generieren
🖼️ ALT-Texte
✅ Schreibregeln prüfen
📝 Lead generieren
🔍 Fact-Check         ← NEU!
```

#### Workflow

```
User klickt "🔍 Fact-Check"
   ↓
Extract Content (Artikel-Text)
   ↓
n8n-Workflow "fact-check"
   ↓
① Claim Extraction
② Source Research (CH-Quellen)
③ Credibility Assessment
④ Source Quality Rating
⑤ Report Generation
   ↓
Anzeige in Sidebar mit Scores
```

---

### n8n-Workflow-Erweiterung

**Neue Branches im Switch Node:**

```
Switch Node
├─ type === 'titles'    (existing)
├─ type === 'alttext'   (existing)
├─ type === 'check'     (existing)
├─ type === 'lead'      (existing)
└─ type === 'factcheck' ← NEU!
       ↓
   Function Node (Fact-Check Prompt)
       ↓
   Anthropic Node (Claim Extraction)
       ↓
   Loop über Claims
       ↓
   HTTP Requests (Quellen-Recherche)
       ↓
   Function Node (Credibility-Score berechnen)
       ↓
   Anthropic Node (Report erstellen)
       ↓
   Response zurück
```

---

### Schweizer Quellen-Liste (zu ergänzen)

**Vertrauenswürdige CH-Quellen:**

#### News & Fakten
- SRF (Schweizer Radio und Fernsehen)
- Swissinfo.ch
- NZZ (Neue Zürcher Zeitung)
- Tages-Anzeiger
- Watson.ch (für Breaking News)

#### Behörden
- Admin.ch (Bundesverwaltung)
- Parlament.ch
- BfS (Bundesamt für Statistik)
- BAG (Bundesamt für Gesundheit)
- Seco (Staatssekretariat für Wirtschaft)
- Meteoschweiz

#### Wissenschaft
- ETH Zürich
- EPFL
- Universität Zürich
- SNF (Schweizerischer Nationalfonds)

#### Wirtschaft
- SNB (Schweizerische Nationalbank)
- SIX (Schweizer Börse)
- Economiesuisse

#### Regional (Graubünden)
- Kanton Graubünden (gr.ch)
- Südostschweiz
- Gemeinde-Websites

---

### Implementation-Plan

#### Schritt 1: Fact-Checker Skill integrieren (2-3h)

1. **Skill-File erstellen**
   - `fact-checker-skill.md` in Projekt-Ordner
   - CH-Quellen anpassen
   - Deutsche Lokalisierung

2. **Prompt-Template** in `prompts.js`
   ```javascript
   factCheck: (content) => ({
     system: `Du bist ein Fact-Checker für Somedia.

     Schweizer Quellen priorisieren:
     - SRF, Swissinfo, BfS, Admin.ch
     - Kantonsregierung Graubünden
     - Wissenschaft: ETH, EPFL

     Credibility-Formel:
     Score = (Quellen × 40%) + (Methodik × 30%) + (Aktualität × 15%) + (Koroborierung × 15%)`,

     user: `Fact-Check für folgenden Artikel:

     ${content}

     OUTPUT-FORMAT:
     1. Claims identifizieren (max 5)
     2. Für jeden Claim:
        - Status: TRUE/FALSE/PARTIAL/UNVERIFIED
        - Confidence: 0-100%
        - Quelle mit URL
        - Credibility-Score: 0-100
        - Empfehlung
     3. Gesamt-Score`
   })
   ```

3. **n8n-Branch** erweitern
   - Function Node für Fact-Check
   - Anthropic Node mit angepasstem Prompt
   - Optional: Loop für Claims (wenn mehrfach Claude aufgerufen werden soll)

4. **UI-Button** in `sidekick.js`
   ```javascript
   <button class="sidekick-btn" data-action="factcheck">🔍 Fact-Check</button>
   ```

5. **Handler** implementieren
   ```javascript
   async function factCheck() {
     const content = getFullArticleText();
     const result = await callAPI('factcheck', content);
     displayFactCheckReport(result);
   }
   ```

#### Schritt 2: Testen (1h)

1. Test mit echten Somedia-Artikeln
2. Credibility-Scores verifizieren
3. Schweizer Quellen prüfen
4. False Positives/Negatives identifizieren

#### Schritt 3: Team-Training (Optional)

1. Guidelines für Redaktion
2. Interpretation der Scores
3. Workflow: Wann Fact-Check nutzen?

---

### Vorteile für Somedia

#### ⏱️ Zeitersparnis
- **Vorher**: 15-30 Min pro Artikel manuell
- **Nachher**: 2-3 Min automatisiert
- **Einsparung**: ~80%

#### ✅ Qualitätssteigerung
- Konsistente Methodology
- Keine "Bauchgefühl"-Entscheidungen
- Objektivierbare Scores

#### 🛡️ Rechtssicherheit
- Vollständiger Audit-Trail
- Quellen dokumentiert
- Defensiv bei Anfechtungen

#### 📈 Skalierbarkeit
- Gleiche Qualität für 1 oder 100 Artikel/Tag
- Team kann wachsen ohne Quality-Loss

#### 🏆 Trust-Building
- Transparenz-Feature für Leser
- "Verifiziert mit 92% Confidence"
- Differenzierung von Konkurrenz

---

### Costs & ROI

#### Claude API-Kosten
- **Pro Fact-Check**: ~$0.05-0.10 (abhängig von Artikel-Länge)
- **Bei 20 Checks/Tag**: ~$1-2/Tag = $30-60/Monat

#### Zeit-Ersparnis (geschätzt)
- **Pro Artikel**: 20 Min gespart
- **Bei 20 Artikeln/Tag**: 400 Min = 6.6h/Tag
- **ROI**: Nach 1 Woche amortisiert

#### Qualitäts-Gain
- **Unbezahlbar**: Weniger Retractions/Korrekturen
- **Trust**: Langfristige Leser-Bindung

---

### Risiken & Mitigations

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| False Positives | Mittel | Human-in-the-Loop (Score <90) |
| Halluzinationen | Niedrig | Source-URLs verifizieren |
| Schweizer Quellen fehlen | Hoch | Manuelle Kuratierung |
| Team-Akzeptanz | Mittel | Training + Transparency |

---

### Next Steps (nach n8n-Backend)

1. **Fact-Checker Skill** testen (lokal mit Claude)
2. **CH-Quellen-Liste** erstellen
3. **n8n-Workflow** erweitern
4. **UI-Button** hinzufügen
5. **Beta-Test** mit 5-10 Artikeln
6. **Team-Feedback** einholen
7. **Production Launch**

---

## Phase 4: Weitere Features (Zukunft)

### Geplante Erweiterungen

- 🌍 **Mehrsprachigkeit** (Rätoromanisch, Italienisch)
- 📊 **Analytics** (Nutzungsstatistik, beliebteste Funktionen)
- 🎨 **Custom Prompts** (Redakteure können eigene Templates erstellen)
- 🔗 **SEO-Optimierung** (Meta-Descriptions, Keywords)
- 📸 **Bild-Upload** (ALT-Text direkt vom Bild generieren)
- 💾 **History** (Letzte 10 Generierungen speichern)
- ⌨️ **Keyboard-Shortcuts** (Schnellerer Zugriff)
- 🌙 **Dark Mode** (UI-Verbesserung)

---

**Version:** 1.0
**Stand:** 6. Februar 2026
