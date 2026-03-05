# 🔒 Somedia Sidekick - Security Analysis

**Für:** IT-Sicherheitsbeauftragter / Somedia Management
**Datum:** 6. Februar 2026
**Version:** 1.0

---

## Executive Summary

**Frage:** Ist die n8n-Backend-Architektur sicherheitstechnisch vertretbar für den Einsatz bei Somedia?

**Antwort:** ⚠️ **JA, aber mit Einschränkungen und Vorbedingungen.**

**Kritische Punkte:**
1. ⚠️ **Artikel-Inhalte** gehen durch externe Server (n8n → Claude API)
2. ⚠️ **Unveröffentlichte Inhalte** könnten exposed werden
3. ⚠️ **DSGVO/Datenschutz** muss geprüft werden
4. ✅ **Technisch umsetzbar** mit entsprechenden Maßnahmen

**Empfehlung:**
- **Pilot-Phase**: OK für **bereits publizierte** Artikel
- **Produktiv-Einsatz**: Nur mit **Somedia-eigenem Server** + zusätzlichen Security-Maßnahmen

---

## 🚨 Security-Bedenken (aus Sicht IT-Sicherheit)

### 1. Datenfluss & Vertraulichkeit

**Problem:**
```
Unveröffentlichter Artikel (vertraulich)
    ↓
n8n-Server (Hetzner, Drittanbieter)
    ↓
Claude API (Anthropic, USA)
    ↓
Zurück zu Redakteur
```

**Risiken:**
- ❌ **Data Leakage**: Unveröffentlichte Inhalte verlassen Somedia-Netzwerk
- ❌ **Third-Party Access**: Hetzner/Anthropic könnten theoretisch mitlesen
- ❌ **Compliance**: DSGVO, Journalistische Quellenschutz

**Auswirkung:** 🔴 **HOCH** (bei unveröffentlichten, sensiblen Artikeln)

**Mitigation:**
| Maßnahme | Effektivität | Aufwand |
|----------|--------------|---------|
| ✅ Nur publizierte Artikel verwenden | Hoch | Niedrig |
| ✅ Somedia-eigener Server statt Hetzner | Sehr hoch | Mittel |
| ✅ End-to-End-Verschlüsselung (E2EE) | Sehr hoch | Hoch |
| ✅ Claude API Vertrag mit DPA | Mittel | Niedrig |
| ⚠️ Lokales LLM (kein Cloud) | Sehr hoch | Sehr hoch |

---

### 2. API-Key-Verwaltung

**Problem:**
- Claude API-Key hat **unbegrenzten Zugriff** auf Anthropic-Account
- Gespeichert als **Environment Variable** auf n8n-Server
- **Root-Zugriff** auf Server = Zugriff auf Key

**Risiken:**
- ❌ **Key-Diebstahl**: Bei Server-Kompromittierung
- ❌ **Missbrauch**: Unbegrenzte API-Calls → Kosten-Explosion
- ❌ **Keine Rotation**: Key bleibt ewig gültig

**Auswirkung:** 🟡 **MITTEL** (finanzielles Risiko, kein Datenverlust)

**Mitigation:**
| Maßnahme | Beschreibung |
|----------|--------------|
| ✅ **Secrets Manager** | HashiCorp Vault, AWS Secrets Manager |
| ✅ **Rate-Limiting** | Max. X Requests/Tag in n8n |
| ✅ **Budget-Alerts** | Anthropic-Konto mit Kosten-Limit |
| ✅ **Key-Rotation** | Monatlich neuen Key generieren |
| ✅ **Restricted API-Key** | Falls Anthropic das anbietet (nur bestimmte Modelle) |

---

### 3. Server-Sicherheit (n8n auf Hetzner)

**Aktueller Zustand:**
- **Server**: Hetzner Cloud CPX11 (91.98.76.206)
- **OS**: Ubuntu 24.04
- **Zugriff**: SSH mit Private Key (root@91.98.76.206)
- **n8n**: Docker-Installation
- **Reverse Proxy**: Caddy (Auto-SSL)

**Risiken:**
| Risiko | Wahrscheinlichkeit | Impact |
|--------|-------------------|--------|
| 🔴 Root-Zugriff kompromittiert | Niedrig | Sehr hoch |
| 🟡 Ungepatchte Sicherheitslücken | Mittel | Hoch |
| 🟡 Docker-Container-Escape | Niedrig | Hoch |
| 🟢 DDoS auf n8n-Endpoint | Mittel | Niedrig |

**Mitigation - Hardening-Checklist:**

#### System-Ebene
- [ ] **SSH**: Key-only (kein Password), Port ändern, Fail2Ban
- [ ] **Firewall**: UFW/iptables, nur Port 80/443/SSH offen
- [ ] **Updates**: Automatische Security-Updates (unattended-upgrades)
- [ ] **Monitoring**: fail2ban, logwatch, OSSEC
- [ ] **User-Management**: Root-Login deaktiviert, Sudo-Only

#### n8n-Ebene
- [ ] **Authentifizierung**: Basic Auth oder API-Key für Webhook
- [ ] **HTTPS-Only**: Caddy mit Let's Encrypt (bereits aktiv)
- [ ] **CORS**: Nur c02.purpleshub.com erlauben
- [ ] **Rate-Limiting**: Max 100 Requests/Minute
- [ ] **Logging**: Alle Requests loggen (wer, wann, was)
- [ ] **Backup**: Tägliche Backups von n8n-Workflows

#### Docker-Ebene
- [ ] **Non-Root-Container**: n8n nicht als root laufen lassen
- [ ] **Network-Isolation**: Eigenes Docker-Network
- [ ] **Resource-Limits**: Memory/CPU-Caps
- [ ] **Image-Updates**: Regelmäßig n8n-Image aktualisieren

---

### 4. Datenschutz & DSGVO

**Rechtliche Fragen:**

#### Artikel-Inhalte
- **Personenbezogene Daten?** Möglich (Namen, Zitate, Fotos)
- **Verarbeitung durch Dritte?** Ja (Anthropic/Claude)
- **Rechtsgrundlage?** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)?
- **Datenübermittlung in Drittland?** Ja (USA → Anthropic)

#### Anthropic/Claude
- **Data Processing Agreement (DPA)?** ✅ Anthropic bietet DPA an
- **Datennutzung?** ❓ Anthropic sagt "No Training on Customer Data", aber:
  - Logs für 90 Tage gespeichert (Trust & Safety)
  - Möglicherweise für Model-Improvement verwendet

**Compliance-Maßnahmen:**

| Maßnahme | Status | Priorität |
|----------|--------|-----------|
| DPA mit Anthropic abschließen | ⏳ To-Do | 🔴 Hoch |
| Privacy Impact Assessment (PIA) | ⏳ To-Do | 🔴 Hoch |
| Mitarbeiter-Einwilligung (falls nötig) | ⏳ To-Do | 🟡 Mittel |
| Datenschutzhinweis für Redakteure | ⏳ To-Do | 🟡 Mittel |
| Opt-In für sensible Artikel | ⏳ To-Do | 🟢 Niedrig |

**Anthropic Data Policy (Stand Feb 2024):**
> "We don't train our generative models on inputs and outputs through our API...
> However, we may use inputs and outputs for Trust & Safety purposes (e.g., to prevent abuse)."

**Quelle:** https://www.anthropic.com/legal/privacy

---

### 5. Webhook-Sicherheit

**Aktuell (geplant):**
- **Endpoint**: `https://n8n.julianreich.ch/webhook/somedia-sidekick`
- **Authentifizierung**: Keine (öffentlich!)
- **Input-Validation**: Keine

**Risiken:**
- 🔴 **Jeder kann Requests senden** (wenn URL bekannt)
- 🔴 **API-Kosten-Explosion** durch Spam
- 🟡 **Code-Injection** (wenn Input nicht sanitized)

**Mitigation:**

#### Option 1: API-Key-Authentifizierung (Einfach)
```javascript
// Im Bookmarklet (sidekick.js)
const response = await fetch('https://n8n.julianreich.ch/webhook/somedia-sidekick', {
  headers: {
    'X-API-Key': 'somedia-secret-key-12345' // Hardcoded im Script
  }
});

// In n8n: Function Node prüft Header
if ($input.item.json.headers['x-api-key'] !== 'somedia-secret-key-12345') {
  return { error: 'Unauthorized' };
}
```

**Problem:** Key ist im öffentlichen JavaScript sichtbar!

#### Option 2: Domain-Whitelisting (Besser)
```javascript
// In n8n: Function Node prüft Referer
const referer = $input.item.json.headers.referer || '';
if (!referer.includes('c02.purpleshub.com')) {
  return { error: 'Forbidden - Invalid Origin' };
}
```

**Problem:** Referer kann gefälscht werden (aber aufwändiger).

#### Option 3: OAuth/JWT (Am sichersten, aber komplex)
- User authentifiziert sich im CMS
- CMS gibt JWT-Token aus
- Bookmarklet sendet Token an n8n
- n8n validiert Token gegen CMS

**Aufwand:** Hoch (CMS-Integration nötig)

#### Option 4: IP-Whitelisting (Nur für Somedia-Office)
```javascript
// In n8n: Nur Somedia-Office-IP erlauben
const allowedIPs = ['203.0.113.0/24']; // Somedia Office IP-Range
if (!allowedIPs.includes($input.item.json.headers['x-forwarded-for'])) {
  return { error: 'Access Denied' };
}
```

**Problem:** Funktioniert nicht für Homeoffice/Mobil.

---

### 6. Verfügbarkeit & Single Point of Failure

**Dependency-Chain:**
```
Redakteur → Bookmarklet → n8n (Hetzner) → Claude API (Anthropic)
              ↓              ↓                    ↓
         Browser-Bug    Server-Ausfall      API-Limit
```

**Risiken:**
- 🟡 **Hetzner-Ausfall**: n8n nicht erreichbar (SLA: 99.9% → ~8h/Jahr)
- 🟡 **Claude API-Limit**: Rate-Limiting bei vielen Requests
- 🟡 **n8n-Bug**: Workflow-Fehler
- 🟢 **GitHub Pages**: Bookmarklet nicht ladbar (SLA: 99.9%)

**Mitigation:**
| Maßnahme | Beschreibung |
|----------|--------------|
| ✅ **Fallback-Mode** | Bei n8n-Ausfall: Warnung anzeigen, kein Tool-Crash |
| ✅ **Monitoring** | UptimeRobot/Pingdom für n8n-Endpoint |
| ✅ **Caching** | Häufige Prompts cachen (Redis) |
| ⚠️ **Redundanz** | Zweiter n8n-Server (zu teuer für Pilot) |

---

### 7. Code-Injection & XSS

**Risiko:**
Ein böswilliger Redakteur (oder kompromittierter Account) könnte:

```javascript
// Im Artikel-Text:
<script>alert('XSS')</script>

// Wird an n8n gesendet → Claude API → Zurück an Browser
// Falls nicht sanitized: XSS in Sidekick-UI
```

**Mitigation:**
```javascript
// In sidekick.js: Output escapen
function displayResult(text) {
  const sanitized = text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  resultDiv.textContent = sanitized; // Nicht innerHTML!
}
```

**Status:** ✅ Bereits implementiert (textContent statt innerHTML in sidekick.js)

---

## ✅ Empfohlene Architektur für Somedia-Produktiv-Einsatz

### Variante A: Somedia-eigener Server (Empfohlen)

**Statt Hetzner-Server → Somedia-Rechenzentrum:**

```
┌─────────────────────────────────┐
│  Somedia-Rechenzentrum          │
│  ┌───────────────────────────┐  │
│  │ n8n (Docker)              │  │
│  │ - Hinter Firewall         │  │
│  │ - Nur Office-IP-Zugriff   │  │
│  │ - Monitoring              │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌───────────────────────────┐  │
│  │ Secrets Manager           │  │
│  │ - API-Keys verschlüsselt  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
           ↓
      Claude API (Anthropic)
```

**Vorteile:**
- ✅ **Volle Kontrolle** über Server
- ✅ **Compliance** einfacher (Daten bleiben in CH bis Claude-Call)
- ✅ **Integration** in Somedia-Monitoring/Backup
- ✅ **IT-Team** kann maintainen

**Nachteile:**
- ❌ **Aufwand**: IT-Team muss Server einrichten
- ❌ **Kosten**: Höher als Hetzner (~50-100€/Monat statt ~10€)

---

### Variante B: Hybrid (Pilot auf Hetzner, später Migration)

**Phase 1 (Pilot, 1-3 Monate):**
- n8n auf Hetzner (bestehend)
- Nur **bereits publizierte** Artikel testen
- Eingeschränkter Nutzerkreis (3-5 Redakteure)

**Phase 2 (Produktiv):**
- Migration zu Somedia-Server
- Alle Redakteure
- Auch unveröffentlichte Artikel

---

### Variante C: Lokales LLM (Langfristig)

**Vision:**
```
Somedia-Rechenzentrum
├── Lokales LLM (z.B. Llama 3, Mistral)
├── Fine-Tuned auf Somedia-Artikel
└── 100% Datenschutz (kein Cloud)
```

**Vorteile:**
- ✅ **Maximale Sicherheit** (keine Daten verlassen CH)
- ✅ **Kosten** (langfristig günstiger)
- ✅ **Customization** (Fine-Tuning möglich)

**Nachteile:**
- ❌ **Qualität**: Lokale Modelle (noch) schlechter als Claude
- ❌ **Hardware**: Leistungsfähiger Server nötig (GPU)
- ❌ **Aufwand**: Sehr hoch (ML-Expertise)

**Zeitrahmen:** 12-24 Monate

---

## 📋 Security-Checkliste für Produktiv-Einsatz

### Phase 1: Vorbereitung

- [ ] **DPA mit Anthropic** abschließen
- [ ] **Privacy Impact Assessment** (PIA) durchführen
- [ ] **IT-Security-Audit** für n8n-Server
- [ ] **Datenschutzbeauftragten** konsultieren
- [ ] **Redaktions-Guidelines** erstellen ("Nur publizierte Artikel")

### Phase 2: Technische Absicherung

- [ ] **Server-Hardening** (siehe Hardening-Checklist oben)
- [ ] **Webhook-Authentifizierung** (Domain-Whitelisting)
- [ ] **Rate-Limiting** (max 100 Req/Min)
- [ ] **Logging** (alle Requests mit Timestamp/User)
- [ ] **Monitoring** (UptimeRobot, Alerting)
- [ ] **Backup** (täglich n8n-Workflows)

### Phase 3: Prozess

- [ ] **Redakteur-Schulung** (Wie/Wann Tool nutzen)
- [ ] **Incident Response Plan** (Was bei Sicherheitsvorfall?)
- [ ] **Review nach 3 Monaten** (Logs prüfen, Optimierungen)

---

## 🎯 Antworten auf typische IT-Security-Fragen

### "Werden Artikel-Inhalte bei Anthropic gespeichert?"

**Antwort:**
- ✅ **Nicht für Training** (laut Anthropic-Policy)
- ⚠️ **Aber: 90 Tage Logs** für Trust & Safety
- ⚠️ **USA-Server** (EU-DSGVO-kritisch)

**Lösung:**
- DPA mit Anthropic (Standard Contractual Clauses)
- Nur publizierte Artikel verwenden (kein Scoop-Risiko)

---

### "Was wenn der API-Key gestohlen wird?"

**Antwort:**
- 🔴 **Risiko**: Unbegrenzte API-Calls → Kosten
- 🟢 **Kein Datenverlust** (Key hat nur Claude-Zugriff, kein Somedia-Zugriff)

**Lösung:**
- Secrets Manager (HashiCorp Vault)
- Budget-Limit bei Anthropic (z.B. $100/Monat)
- Monitoring + Alerts

---

### "Kann jemand den Webhook missbrauchen?"

**Antwort:**
- 🔴 **Ja**, wenn URL öffentlich bekannt

**Lösung:**
- Domain-Whitelisting (nur c02.purpleshub.com)
- Rate-Limiting (max X Requests/Tag)
- Monitoring (verdächtige Patterns)

---

### "Was wenn Hetzner/n8n gehackt wird?"

**Antwort:**
- 🔴 **Worst Case**: Angreifer hat Zugriff auf API-Key + Workflows
- 🟡 **Kein direkter Somedia-Zugriff** (n8n ist isoliert)

**Lösung:**
- Server-Hardening (siehe Checkliste)
- Regelmäßige Security-Audits
- Incident Response Plan

---

### "Ist das DSGVO-konform?"

**Antwort:**
- ⚠️ **Grauzone** (Datenübermittlung in USA)
- ✅ **Möglich** mit DPA + berechtigtem Interesse (Art. 6 Abs. 1 lit. f)

**Lösung:**
- DPA mit Anthropic
- Privacy Impact Assessment
- Datenschutzbeauftragten konsultieren
- Ggf. Opt-In für Redakteure

---

## 💡 Empfehlung an Somedia IT-Sicherheit

### Für Pilot-Phase (3 Monate):

**✅ GRÜNES LICHT** unter folgenden Bedingungen:

1. **Nur bereits publizierte Artikel** verwenden
2. **Max. 5 Test-Redakteure**
3. **n8n auf Hetzner** (mit Hardening-Maßnahmen)
4. **Budget-Limit** bei Anthropic (z.B. $100/Monat)
5. **Review nach 3 Monaten**

**Risiko:** 🟢 **NIEDRIG** (kein Datenverlust-Risiko, nur finanzielle Risiken)

---

### Für Produktiv-Einsatz:

**⚠️ GELBES LICHT** - Erst nach:

1. **Migration zu Somedia-Server**
2. **DPA mit Anthropic**
3. **Privacy Impact Assessment**
4. **IT-Security-Audit**
5. **Redaktions-Guidelines** (wann Tool nutzen)

**Risiko:** 🟡 **MITTEL** (managebar mit Maßnahmen)

---

## 📊 Risiko-Matrix

| Risiko | Wahrscheinlichkeit | Impact | Risiko-Level | Mitigation |
|--------|-------------------|--------|--------------|------------|
| Data Leakage (unveröffentlicht) | Mittel | Sehr hoch | 🔴 HOCH | Nur publizierte Artikel |
| API-Key-Diebstahl | Niedrig | Mittel | 🟡 MITTEL | Secrets Manager |
| Server-Kompromittierung | Niedrig | Hoch | 🟡 MITTEL | Hardening |
| DSGVO-Verstoß | Mittel | Hoch | 🟡 MITTEL | DPA, PIA |
| Webhook-Missbrauch | Mittel | Niedrig | 🟢 NIEDRIG | Domain-Whitelisting |
| Verfügbarkeit | Niedrig | Niedrig | 🟢 NIEDRIG | Monitoring |

**Gesamt-Risiko für Pilot:** 🟢 **AKZEPTABEL**
**Gesamt-Risiko für Produktiv:** 🟡 **MANAGEBAR** (mit Maßnahmen)

---

**Version:** 1.0
**Autor:** Claude (AI Assistant)
**Review:** Pending (IT-Sicherheitsbeauftragter Somedia)
**Nächste Schritte:** Diskussion mit Datenschutzbeauftragten + IT-Team
