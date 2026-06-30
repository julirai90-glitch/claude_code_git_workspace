# Klima-Dashboard Graubünden — Projekt-Handoff

> Für die Server-Claude-Code-Instanz auf dem Hetzner-Server. Dieses Dokument macht das Projekt ohne Vorwissen weiterbearbeitbar. Stand: 30.06.2026.

## 1. Ziel & Leitidee

Datenjournalistisches Klima-Projekt für Graubünden (Südostschweiz / Terra Grischuna).
**Leitidee:** bewusst KEIN „schlechteres MeteoSchweiz". Stärke = lange homogene Klimareihen, hyperlokal, historisch + journalistische Einordnung. Beim Live-Teil: nicht „was ist das Wetter", sondern „wie aussergewöhnlich ist es gerade".

## 2. Datenquelle: MeteoSchweiz Open Data (OGD)

- **STAC-API:** `https://data.geo.admin.ch/api/stac/v1/`
- **Direkt-Download (CORS erlaubt, `Access-Control-Allow-Origin: *`):** `https://data.geo.admin.ch/<collection>/<station>/<file>.csv`
- CSV-Trennzeichen `;`, Dezimal `.`, Datum `dd.mm.yyyy HH:MM`.
- **WICHTIG: alle Zeitstempel sind UTC** → für Anzeige nach `Europe/Zurich` umrechnen (DST automatisch via `toLocaleString(..., {timeZone:'Europe/Zurich'})`).
- **Live-Latenz:** 10-Min-Werte (`_t_now`) erscheinen ~20–30 Min verzögert. `Cache-Control: max-age=10`.
- **Live-Daten sind provisorisch/unkorrigiert** (nicht qualitätsgeprüft, nicht homogenisiert) → im Output immer kennzeichnen.

### Collections
| Collection | Inhalt | Eignung |
|---|---|---|
| `ch.meteoschweiz.ogd-nbcn` | **Homogene** Klima-Langreihen (täglich/monatlich/jährlich) | historische Stories, Warming Stripes, seriöse Trends |
| `ch.meteoschweiz.ogd-smn` | Automatisches Messnetz (10-Min/Stunde/Tag/Monat/Jahr) | **Live**-Dashboards; lange aber NICHT homogenisierte Reihen |

### Wichtige Dateien je SMN-Station (`ogd-smn_<abk>_*.csv`)
- `_t_now.csv` — 10-Min, aktueller Tag (Live). Temp-Spalte `tre200s0`.
- `_h_recent.csv` — stündlich, laufendes Jahr. Temp `tre200h0`. (Heute fehlt teils → mit `_t_now` ergänzen.)
- `_d_recent.csv` / `_d_historical.csv` — täglich. Mittel `tre200d0`, Max `tre200dx`, Min `tre200dn`, Niederschlag `rre150d0`.
- `_y.csv` — jährlich. Sommertage `tnd25xy0`, Hitzetage `tnd30xy0`, Frosttage `tnd00ny0`, Tropennächte `tnd20ny0`.

### Wichtige Parameter-Codes NBCN (Jahres-CSV `ogd-nbcn_<abk>_y.csv`)
- `ths200y0` Jahresmittel-Temp · `rhs150y0` Niederschlag-Jahressumme
- `ths25xy0` Sommertage (≥25°C) · `ths00ny0` Frosttage · `ths00xy0` Eistage · `ths20ny0` Tropennächte · `ths30xy0` Hitzetage
- `thl200yx`/`thl200yn` abs. Jahres-Max/Min · `shs000y0` Sonnenscheindauer
- Parameter-Metadaten: `https://data.geo.admin.ch/ch.meteoschweiz.ogd-nbcn/ogd-nbcn_meta_parameters.csv`
- Stations-Metadaten: `.../ogd-nbcn_meta_stations.csv` bzw. `.../ogd-smn/ogd-smn_meta_stations.csv`

## 3. Stationen Graubünden

### Homogene Langreihen (NBCN) — für seriöse historische Trends
| Abk | Station | Höhe | ab | Hinweis |
|---|---|---|---|---|
| dav | Davos | 1594 m | 1864 | voller Kennzahlensatz |
| sam | Samedan | 1709 m | 1864 | Kältepol, Rekord −37.9 °C (1901) |
| sia | Segl-Maria / Sils | 1804 m | 1864 | ~Zwilling von Samedan |
| sbe | S. Bernardino | 1639 m | 1864 | nur Temp + Frosttage (keine Sommer-/Eistage) |
| rag | Bad Ragaz | 497 m | 1864 | **Kanton SG** (nächste Tieflagen-Langreihe) |

### Automatik-Messnetz (SMN) — 26 GR-Stationen, alle live-fähig (`_t_now` etc.)
Tal-/Wohnorte (am besten für lokale Live-Dashboards), nach Höhe:
Grono 324 (1901) · **Chur 556 (1887)** · Schiers 626 (1885) · Ilanz 698 (1892) · Andeer 987 (1901) · Poschiavo/Robbia 1078 (1959) · Vicosoprano 1089 (1901) · Disentis 1197 (1959) · Vals 1242 (1892) · Scuol 1304 (1881) · Sta. Maria/Müstair 1386 (1900) · Bergün/Latsch 1408 (1973) · Valbella 1568 (1993) · Davos 1594 · S. Bernardino 1639 · Samedan 1709 · Segl-Maria 1804 · Bivio 1856 · Arosa 1878.
Hochalpin/Pässe (eher Extreme/Schnee/Wind als Wohnort):
Buffalora 1971 · Passo Bernina 2260 · Naluns 2380 · Crap Masegn 2468 · Piz Martegnas 2668 · Weissfluhjoch 2691 · Piz Corvatsch 3294.

> Für ein Live-Dashboard wie Chur eignen sich v. a. Wohnorte mit langem Record: **Chur, Scuol, Davos, Ilanz, Schiers, Poschiavo, Samedan, Arosa**.

## 4. Dateien im Repo

- `live-chur-v2.html` — **produktiver Live-Embed Chur** (gh-pages). Holt `t_now`+`h_recent`+`d_recent` client-seitig; eingebettetes Tages-Normal (1991–2020, 366 Werte) + Rekord-Konstanten; 24-h-Kurve mit Hover; 3 Kacheln (Mittel 24 h / wärmer-kühler als üblich / Abstand Hitzerekord); Rekord-Balken; Sommertage-Zähler. **Vergleich bias-frei über 24-h-Mittel.**
- `prototyp-klima-davos.html` — Davos-Prototyp (5 Ansichten: Warming Stripes, Dumbbell, Temp-Säulen, Sommer/Frost, Niederschlag, Rekorde).
- `station-{bad-ragaz,davos,san-bernardino,samedan}.html` — generierte Stationsseiten (NICHT auf gh-pages, nur lokal/Repo).
- `vergleich-warming-stripes.html` — 4-Stationen-Vergleich (Stripes, gemeinsame Skala).
- `_station-template.html`, `_vergleich-template.html` — **Templates** (Single Source of Truth). Seiten daraus generieren.
- `overlord-review-klima-davos.md`, `overlord-review-live-chur.md` — Multi-Modell-Reviews + Synthese.

## 5. Methodik-Entscheide (für Faktentreue zwingend)

- **Homogen (NBCN) vs. nicht-homogen (SMN)** sauber trennen. SMN-Live klar als „provisorisch/unkorrigiert" kennzeichnen; nicht in homogene Vergleiche mischen ohne Hinweis.
- **Warming Stripes:** Anomalie ggü. Stationsschnitt **1961–1990**; Vergleichsseite mit gemeinsamer Farbskala (globaler maxAbs).
- **Dumbbell:** zwei offizielle 30-Jahre-Klimanormen **1961–1990 → 1991–2020** (nicht selbstgewählte Perioden).
- **Tageszählungen** (Sommer-/Frosttage) gibt es bei NBCN erst **ab 1959**; Temperatur ab 1864; Niederschlag ab 1867; Tagesrekorde aus der täglichen Reihe.
- **Normal/„üblich"** = Tagesmittel-Klimatologie 1991–2020 (ein Wert pro Kalendertag, ±7-Tage geglättet). Es gibt KEINE stündliche Klimatologie im Projekt (bewusst weggelassen).
- **24-h-Bias-Fix (Live):** „wärmer/kühler als üblich" vergleicht das **Mittel der letzten 24 h** (voller Tag-Nacht-Zyklus → bias-frei) gegen das Tages-Normal — nicht „seit Mitternacht" (das wäre morgens verzerrt).
- Alle einschränkenden Hinweise (provisorisch etc.) gehören in die **Fussnote**, nicht in die Kernaussage.

## 6. Deployment

- **GitHub-Repo:** `https://github.com/julirai90-glitch/claude_code_git_workspace.git`, Branch **`gh-pages`** = die Live-Site.
- **Live-URL-Muster:** `https://julirai90-glitch.github.io/claude_code_git_workspace/<datei>.html`
  - Live: https://julirai90-glitch.github.io/claude_code_git_workspace/live-chur-v2.html
- **Push-Pattern (nur gewünschte Datei!):** `git add <datei> && git commit -m "..." -- <datei> && git push origin gh-pages`. (Im Working Tree liegen viele unrelated Änderungen → NIE `git add -A`.)
- **WordPress (Südostschweiz):** Einbindung per `<iframe src="<live-url>" style="width:100%;max-width:480px;height:560px;border:0">`.

## 7. Fallstricke

- **Encoding (nur Windows-Seite):** PowerShell 5.1 liest UTF-8-Dateien ohne `-Encoding` als ANSI → Umlaut-Salat (`Ã¼`). Beim Generieren immer .NET nutzen: `[System.IO.File]::ReadAllText/WriteAllText(path, text, (New-Object System.Text.UTF8Encoding($false)))`. (Auf dem Linux-Server irrelevant.)
- **UTC→Zürich** überall, wo Stunden/Minuten/Tage angezeigt werden.
- Pro neue Live-Station müssen **Rekorde (Allzeit-Max/Min aus Tagesreihe) und das Tages-Normal (1991–2020)** einmal vorberechnet und als Konstante eingebettet werden (wie bei Chur: Hitzerekord 37.6 °C/11.7.2023, Kälterekord −21.4 °C/7.1.1985, Sommertage-Normal 56/Jahr).

## 8. Offene nächste Schritte

1. Live-Embed für weitere Wohnort-Stationen generalisieren (Station als Parameter; Rekorde+Normal je Station vorberechnen).
2. Entscheiden, welche der 4 Stationsseiten + Vergleich auf gh-pages live gehen.
3. Stationsseiten als einzelne WordPress-Embeds zerlegen (eine Grafik pro Datei, ohne Rahmentext).
4. Optional: 24-h-Fenster / Tagesgang-Klimatologie, Phänologie-Story (Vegetationsbeginn), Schnee-Story (Tourismus).

## 9. Arbeitsumgebung Server

Dieses Repo liegt nach `git clone` z. B. unter `/root/klima-dashboard/` (siehe SETUP unten). HTML-Dateien sind eigenständig (kein Build nötig). Datenabrufe = einfache HTTP-GETs der CSVs (in Python via `urllib`/`requests`). Faktentreue zuerst; bei Unsicherheit Quelle (Stations-CSV + Spaltencode) angeben.
