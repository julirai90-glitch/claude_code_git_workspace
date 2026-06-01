# Instagram-Tracker — Regierungsratswahlen GR 2026

Öffentliche Webseite und WordPress-Embeds zur Instagram-Aktivität der Kandidierenden.  
Live: `https://julirai90-glitch.github.io/claude_code_git_workspace/graubuenden-rr-instagram/`

## Embeds (iframe-Snippets für südostschweiz.ch WordPress)

### Posting-Frequenz

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/graubuenden-rr-instagram/embed/rr-frequenz.html"
  style="width:100%;border:0;height:420px"
  loading="lazy"
  title="Instagram-Posting-Frequenz RR GR 2026">
</iframe>
```

### Themen-Überblick

```html
<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/graubuenden-rr-instagram/embed/rr-themen.html"
  style="width:100%;border:0;height:440px"
  loading="lazy"
  title="Instagram-Themen RR GR 2026">
</iframe>
```

### Post-Archiv (mit Auto-Resize)

```html
<!-- einmalig im Seitenkopf: -->
<script>
window.addEventListener('message', function(e) {
  if (!e.data || e.data.type !== 'embed-size') return;
  document.querySelectorAll('iframe').forEach(function(f) {
    if (f.contentWindow === e.source) f.style.height = (e.data.height + 16) + 'px';
  });
});
</script>

<iframe
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/graubuenden-rr-instagram/embed/rr-archiv.html"
  style="width:100%;border:0;height:600px"
  loading="lazy"
  title="Instagram-Post-Archiv RR GR 2026">
</iframe>
```

## Setup & Betrieb

### Einmalig

```bash
# API-Token setzen (Scoutpost → Agents → API)
export SCOUTPOST_TOKEN=cj_...
export OPENAI_API_KEY=sk-...

# Ersten Daten-Pull
cd graubuenden-rr-instagram
python fetch_units.py
python analyze_themes.py
```

### Automatisch (GitHub Actions)

Montags um 09:00 UTC läuft `.github/workflows/fetch.yml` — nach dem wöchentlichen
Scoutpost-Run (07:00 UTC). Secrets benötigt:
- `SCOUTPOST_TOKEN`: API-Key von scoutpost.ai → Agents → API
- `OPENAI_API_KEY`: für Themen-Klassifikation

### Manuell

Workflow über GitHub Actions → "Fetch Instagram Posts" → "Run workflow" manuell starten.

## Scoutpost-Scouts

| Kandidatin/Kandidat | Partei | Instagram | Scout-ID |
|---|---|---|---|
| Valérie Favre Accola | SVP | @valeriefavreaccola | 8aab06f9-... |
| Martin Bühler | FDP | @martin.buehler.gr | 47cf6355-... |
| Marcus Caduff | Die Mitte | @marcuscaduff | 2484b416-... |
| Carmelia Maissen | Die Mitte | @carmelia_maissen | 1b18c06c-... |
| Peter Peyer | SP | @rrpeterpeyer | 9d7ceeaf-... |
| Nora Saratz Cazin | GLP | @norasaratz | 30ff47d7-... |
| Maurizio Michael | FDP | — | kein öff. Profil |
| Aita Zanetti | Die Mitte | — | kein öff. Profil |
| Reto Bott | parteilos | — | kein öff. Profil |

## Methodik

**Datenquelle:** Öffentliche Instagram-Profile werden wöchentlich (montags) über
[Scoutpost](https://scoutpost.ai) erhoben. Erfasst: Caption-Text, Post-URL, Post-Typ.

**Nicht erfasst:** Engagement-Daten (Likes, Kommentare) sind über Scoutpost nicht
verfügbar. Stories, private Posts und Accounts ohne öffentliches Profil.

**Post-Datum:** Wird aus dem Instagram-Shortcode dekodiert (Näherungswert, ±Stunden).
Fallback: Erfassungsdatum Scoutpost.

**Themen:** Automatisch via OpenAI GPT-4o-mini klassifiziert. Kategorien:
Wahlkampf, Sachpolitik, Persönliches, Region GR, Veranstaltung.
Nicht redaktionell geprüft — als automatisch gekennzeichnet.

**Credits:** 6 Scouts × 2 Credits/Run × ~4 Runs/Monat ≈ 48 Credits/Monat.
Scoutpost Free-Tier: 100 Credits/Monat (reicht).
