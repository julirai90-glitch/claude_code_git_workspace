#!/usr/bin/env python3
"""
Graubünden Statistics Agent
============================
Scans the Graubünden open data portal (data.gr.ch) for statistically
interesting patterns and generates journalist-ready story pitches.

Implements four scenarios:
  1. Ausreisser-Finder   – flags values deviating >2σ from the mean
  2. Trend-Spürer        – detects multi-year up/down trends + counter-trend municipalities
  3. Kontext-Lieferant   – keyword search across all datasets for story background
  4. Gemeinde-Vergleicher– cross-municipal rankings (top 3 / bottom 3)

Usage:
  python agent.py                            # run all scenarios (20 datasets)
  python agent.py --scenario outlier         # only outlier detection
  python agent.py --scenario trend           # only trend analysis
  python agent.py --scenario ranking         # only municipality rankings
  python agent.py --scenario context --keyword tourismus
  python agent.py --list-datasets            # print dataset catalogue
  python agent.py --max-datasets 50 --output json
"""

import argparse
import json
import sys
import time
from datetime import datetime
from typing import Optional

import numpy as np
import pandas as pd
import requests

# ─────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────
API_BASE = "https://data.gr.ch/api/explore/v2.1"
REQUEST_TIMEOUT = 30
PAGE_SIZE = 100          # OpenDataSoft max per request
MAX_RECORDS = 10_000     # safety cap per dataset
OUTLIER_Z = 2.0          # z-score threshold
MIN_SERIES_LEN = 4       # minimum distinct years for trend analysis
POLITE_DELAY = 0.1       # seconds between paginated requests

# Field name heuristics (case-insensitive match)
YEAR_FIELDS = {"jahr", "year", "annee", "anno", "periode", "jahrgang", "referenzjahr"}
MUNI_FIELDS = {
    "gemeinde", "municipality", "commune", "gemeindename",
    "bfs_nr", "gemeinde_nr", "gemeindenummer", "bfs_gemeindenummer",
}
VALUE_FIELDS = {
    "anzahl", "wert", "value", "total", "summe", "count", "betrag",
    "anzahl_personen", "einwohner", "bestand",
}


# ─────────────────────────────────────────────
# API Client
# ─────────────────────────────────────────────

class DataGRClient:
    """HTTP client for the Graubünden open data portal (OpenDataSoft v2.1)."""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"Accept": "application/json"})

    def _get(self, path: str, params: dict = None) -> dict:
        url = f"{API_BASE}{path}"
        resp = self.session.get(url, params=params or {}, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    def list_datasets(self, limit: int = 100) -> list[dict]:
        """Return metadata for all available datasets (paginated)."""
        results, offset = [], 0
        while len(results) < limit:
            batch_size = min(PAGE_SIZE, limit - len(results))
            data = self._get(
                "/catalog/datasets",
                {"limit": batch_size, "offset": offset, "include_app_metas": "true"},
            )
            batch = data.get("results", [])
            results.extend(batch)
            if len(results) >= data.get("total_count", 0) or not batch:
                break
            offset += len(batch)
            time.sleep(POLITE_DELAY)
        return results

    def get_records(self, dataset_id: str, limit: int = MAX_RECORDS) -> pd.DataFrame:
        """Fetch records and return as flat DataFrame."""
        rows, offset = [], 0
        while len(rows) < limit:
            batch_size = min(PAGE_SIZE, limit - len(rows))
            try:
                data = self._get(
                    f"/catalog/datasets/{dataset_id}/records",
                    {"limit": batch_size, "offset": offset},
                )
            except requests.HTTPError as e:
                print(f"    HTTP {e.response.status_code} – überspringe {dataset_id}")
                break
            batch = data.get("results", [])
            if not batch:
                break
            rows.extend(batch)
            if len(rows) >= data.get("total_count", 0):
                break
            offset += len(batch)
            time.sleep(POLITE_DELAY)
        return pd.DataFrame(rows) if rows else pd.DataFrame()


# ─────────────────────────────────────────────
# Field Detection Helpers
# ─────────────────────────────────────────────

def _detect(df: pd.DataFrame, candidates: set) -> Optional[str]:
    """Return first column whose lowercase name is in candidates."""
    for col in df.columns:
        if col.lower() in candidates:
            return col
    return None


def _numeric_cols(df: pd.DataFrame, exclude: set = None) -> list[str]:
    """Return numeric columns that are not in the exclude set."""
    ex = {c for c in (exclude or set()) if c is not None}
    return [c for c in df.select_dtypes(include=[np.number]).columns if c not in ex]


def _coerce(df: pd.DataFrame, col: str) -> pd.Series:
    return pd.to_numeric(df[col], errors="coerce")


# ─────────────────────────────────────────────
# Scenario 1: Ausreisser-Finder
# ─────────────────────────────────────────────

def find_outliers(df: pd.DataFrame, dataset_id: str) -> list[dict]:
    """
    Flag values deviating more than OUTLIER_Z standard deviations from the mean.
    Returns up to 3 findings per dataset (most extreme first).
    """
    year_col = _detect(df, YEAR_FIELDS)
    muni_col = _detect(df, MUNI_FIELDS)
    vcols = _numeric_cols(df, {year_col, muni_col})
    findings = []

    for vcol in vcols[:5]:
        series = _coerce(df, vcol).dropna()
        if len(series) < 10:
            continue
        mean, std = series.mean(), series.std()
        if std == 0:
            continue
        z = (series - mean) / std
        for idx in series[z.abs() > OUTLIER_Z].index:
            val = float(series[idx])
            z_val = float(z[idx])
            finding = {
                "type": "outlier",
                "dataset": dataset_id,
                "field": vcol,
                "value": val,
                "mean": float(mean),
                "z_score": z_val,
                "direction": "hoch" if z_val > 0 else "tief",
                "pct_from_mean": float((val - mean) / mean * 100) if mean != 0 else None,
            }
            if year_col and pd.notna(df.at[idx, year_col]):
                finding["year"] = df.at[idx, year_col]
            if muni_col and pd.notna(df.at[idx, muni_col]):
                finding["municipality"] = str(df.at[idx, muni_col])
            findings.append(finding)

    findings.sort(key=lambda x: abs(x["z_score"]), reverse=True)
    return findings[:3]


# ─────────────────────────────────────────────
# Scenario 2: Trend-Spürer
# ─────────────────────────────────────────────

def find_trends(df: pd.DataFrame, dataset_id: str) -> list[dict]:
    """
    Detect long-term trends (linear regression over ≥4 distinct years).
    Also finds municipalities that buck the overall trend.
    Returns up to 2 strongest trends per dataset.
    """
    year_col = _detect(df, YEAR_FIELDS)
    if not year_col:
        return []

    df = df.copy()
    df[year_col] = _coerce(df, year_col)
    df = df.dropna(subset=[year_col])
    if df[year_col].nunique() < MIN_SERIES_LEN:
        return []

    muni_col = _detect(df, MUNI_FIELDS)
    vcols = _numeric_cols(df, {year_col, muni_col})
    findings = []

    for vcol in vcols[:3]:
        df[vcol] = _coerce(df, vcol)

        # Aggregate overall time series
        overall = df.groupby(year_col)[vcol].sum().dropna().reset_index()
        if len(overall) < MIN_SERIES_LEN:
            continue

        x = overall[year_col].values.astype(float)
        y = overall[vcol].values.astype(float)
        valid = ~np.isnan(y)
        if valid.sum() < MIN_SERIES_LEN:
            continue
        x, y = x[valid], y[valid]

        slope = np.polyfit(x, y, 1)[0]
        pct_change = float((y[-1] - y[0]) / abs(y[0]) * 100) if y[0] != 0 else None
        if pct_change is None or abs(pct_change) < 5 or abs(slope) < 1e-9:
            continue

        finding = {
            "type": "trend",
            "dataset": dataset_id,
            "field": vcol,
            "year_start": int(x[0]),
            "year_end": int(x[-1]),
            "n_years": int(x[-1] - x[0]),
            "direction": "steigend" if slope > 0 else "fallend",
            "pct_change": pct_change,
            "slope_per_year": float(slope),
            "exceptions": [],
        }

        # Find municipalities moving against the overall trend
        if muni_col:
            muni_agg = df.groupby([muni_col, year_col])[vcol].sum().reset_index()
            for muni, grp in muni_agg.groupby(muni_col):
                grp = grp.sort_values(year_col).dropna(subset=[vcol])
                if len(grp) < 3:
                    continue
                my = grp[vcol].values.astype(float)
                if my[0] == 0:
                    continue
                m_pct = float((my[-1] - my[0]) / abs(my[0]) * 100)
                if np.sign(m_pct) != np.sign(pct_change) and abs(m_pct) > 10:
                    finding["exceptions"].append(
                        {"municipality": str(muni), "pct_change": m_pct}
                    )
            finding["exceptions"].sort(key=lambda e: abs(e["pct_change"]), reverse=True)
            finding["exceptions"] = finding["exceptions"][:3]

        findings.append(finding)

    findings.sort(key=lambda x: abs(x["pct_change"]), reverse=True)
    return findings[:2]


# ─────────────────────────────────────────────
# Scenario 3: Kontext-Lieferant
# ─────────────────────────────────────────────

def search_context(df: pd.DataFrame, dataset_id: str, keyword: str) -> list[dict]:
    """
    Find columns or values matching a keyword.
    Returns descriptive stats for matching columns as context snippets.
    """
    kw = keyword.lower()
    findings = []

    # Match on column names
    matched_cols = [c for c in df.columns if kw in c.lower()]
    # Also scan string columns for keyword in values
    for col in df.select_dtypes(include="object").columns:
        if col in matched_cols:
            continue
        if df[col].astype(str).str.lower().str.contains(kw, na=False).any():
            matched_cols.append(col)

    for col in matched_cols[:4]:
        year_col = _detect(df, YEAR_FIELDS)
        num_col = _coerce(df, col)
        is_numeric = num_col.notna().sum() > len(df) * 0.5

        finding = {
            "type": "context",
            "dataset": dataset_id,
            "keyword": keyword,
            "field": col,
        }

        if is_numeric:
            s = num_col.dropna()
            finding.update({
                "n": int(len(s)),
                "min": float(s.min()),
                "max": float(s.max()),
                "mean": float(s.mean()),
                "latest": None,
            })
            if year_col:
                df[year_col] = _coerce(df, year_col)
                latest_year = df[year_col].max()
                latest_vals = df.loc[df[year_col] == latest_year, col]
                latest_vals = _coerce(pd.DataFrame({col: latest_vals}), col).dropna()
                if not latest_vals.empty:
                    finding["latest"] = float(latest_vals.sum())
                    finding["latest_year"] = int(latest_year)
        else:
            top_vals = df[col].value_counts().head(5).to_dict()
            finding["top_values"] = {str(k): int(v) for k, v in top_vals.items()}

        findings.append(finding)

    return findings


# ─────────────────────────────────────────────
# Scenario 4: Gemeinde-Vergleicher
# ─────────────────────────────────────────────

def rank_municipalities(df: pd.DataFrame, dataset_id: str) -> list[dict]:
    """
    Rank municipalities by key metrics; show top 3 / bottom 3.
    Uses most recent year if temporal data is present.
    """
    muni_col = _detect(df, MUNI_FIELDS)
    if not muni_col:
        return []

    year_col = _detect(df, YEAR_FIELDS)
    df = df.copy()

    if year_col:
        df[year_col] = _coerce(df, year_col)
        latest = df[year_col].max()
        df = df[df[year_col] == latest]

    vcols = _numeric_cols(df, {muni_col, year_col})
    findings = []

    for vcol in vcols[:2]:
        df[vcol] = _coerce(df, vcol)
        ranked = (
            df.groupby(muni_col)[vcol]
            .sum()
            .dropna()
            .reset_index()
            .sort_values(vcol, ascending=False)
        )
        if len(ranked) < 5:
            continue

        top3 = ranked.head(3).to_dict("records")
        bot3 = ranked.tail(3).to_dict("records")
        vmin = float(ranked[vcol].min())

        findings.append({
            "type": "ranking",
            "dataset": dataset_id,
            "field": vcol,
            "year": int(df[year_col].max()) if year_col else None,
            "n_municipalities": len(ranked),
            "top": [{"municipality": str(r[muni_col]), "value": float(r[vcol])} for r in top3],
            "bottom": [{"municipality": str(r[muni_col]), "value": float(r[vcol])} for r in bot3],
            "median": float(ranked[vcol].median()),
            "spread_ratio": float(ranked[vcol].max() / vmin) if vmin > 0 else None,
        })

    return findings[:1]


# ─────────────────────────────────────────────
# Reporter: German pitch formatting
# ─────────────────────────────────────────────

def _pitch_outlier(f: dict) -> str:
    pct = f.get("pct_from_mean")
    pct_str = f" ({pct:+.0f}% vom Durchschnitt)" if pct is not None else ""
    ctx = []
    if "year" in f:
        ctx.append(f"Jahr {f['year']}")
    if "municipality" in f:
        ctx.append(f"Gemeinde: {f['municipality']}")
    ctx_str = "  |  ".join(ctx)
    adj = "hohen" if f["direction"] == "hoch" else "tiefen"
    return (
        f"**Ausreisser** – `{f['field']}` in `{f['dataset']}`\n"
        f"Wert: **{f['value']:.1f}** (Ø {f['mean']:.1f}){pct_str}  "
        f"·  z = {f['z_score']:+.1f}σ\n"
        + (f"{ctx_str}\n" if ctx_str else "")
        + f"→ *Mögliche Geschichte: Was steckt hinter diesem ungewöhnlich {adj} Wert?*"
    )


def _pitch_trend(f: dict) -> str:
    exc_str = ""
    if f["exceptions"]:
        lines = [f"  - {e['municipality']}: {e['pct_change']:+.0f}%" for e in f["exceptions"]]
        exc_str = "\nGemeinden gegen den Trend:\n" + "\n".join(lines)
    hint = (
        f" Und warum läuft **{f['exceptions'][0]['municipality']}** gegen den Trend?"
        if f["exceptions"] else ""
    )
    return (
        f"**Trend** – `{f['field']}` in `{f['dataset']}`\n"
        f"{f['year_start']}–{f['year_end']}: **{f['pct_change']:+.0f}%** ({f['direction']})"
        f"  ·  Ø {f['slope_per_year']:+.1f}/Jahr über {f['n_years']} Jahre"
        + exc_str
        + f"\n→ *Mögliche Geschichte: Warum ist `{f['field']}` seit {f['n_years']} Jahren {f['direction']}?{hint}*"
    )


def _pitch_ranking(f: dict) -> str:
    year_str = f" ({f['year']})" if f.get("year") else ""
    top_str = "  |  ".join(f"{r['municipality']} ({r['value']:.0f})" for r in f["top"])
    bot_str = "  |  ".join(f"{r['municipality']} ({r['value']:.0f})" for r in f["bottom"])
    spread = f"  ·  Faktor **{f['spread_ratio']:.1f}×** zwischen höchstem und tiefstem Wert" if f.get("spread_ratio") else ""
    return (
        f"**Gemeinde-Ranking** – `{f['field']}` in `{f['dataset']}`{year_str}"
        f"  ({f['n_municipalities']} Gemeinden){spread}\n"
        f"Top 3:    {top_str}\n"
        f"Bottom 3: {bot_str}\n"
        f"→ *Mögliche Geschichte: Warum liegt **{f['top'][0]['municipality']}** vorne – "
        f"und **{f['bottom'][0]['municipality']}** hinten?*"
    )


def _pitch_context(f: dict) -> str:
    if "top_values" in f:
        vals = ", ".join(f"{k} ({v}×)" for k, v in list(f["top_values"].items())[:3])
        return (
            f"**Kontext** – `{f['field']}` in `{f['dataset']}` (Suche: «{f['keyword']}»)\n"
            f"Häufigste Werte: {vals}"
        )
    latest = ""
    if f.get("latest") is not None:
        latest = f"  ·  Aktuellster Wert ({f.get('latest_year', '?')}): **{f['latest']:.0f}**"
    return (
        f"**Kontext** – `{f['field']}` in `{f['dataset']}` (Suche: «{f['keyword']}»)\n"
        f"n={f['n']}  ·  Min {f['min']:.1f}  ·  Max {f['max']:.1f}  ·  Ø {f['mean']:.1f}{latest}"
    )


def format_finding(f: dict) -> str:
    dispatch = {
        "outlier": _pitch_outlier,
        "trend": _pitch_trend,
        "ranking": _pitch_ranking,
        "context": _pitch_context,
    }
    fn = dispatch.get(f["type"])
    return fn(f) if fn else json.dumps(f, ensure_ascii=False)


# ─────────────────────────────────────────────
# Website Bridge: Integration mit Datenstory-Website
# ─────────────────────────────────────────────
# Die Datenstory-Website (index.html / app.js) zeigt 7 kuratierte Geschichten
# mit apiDatasetId: null – der Agent kann diese Lücken füllen und neue
# Findings als website-kompatible Story-Objekte exportieren.

# Mapping: Story-ID → Suchbegriffe für data.gr.ch Datensätze
STORY_DATASET_HINTS: dict[str, list[str]] = {
    "sprachen":       ["sprache", "langue", "language", "mehrsprachig"],
    "tourismus":      ["tourismus", "logiernaechte", "logiernacht", "beherbergung", "hotel"],
    "bevoelkerung":   ["bevoelkerung", "einwohner", "population", "demographie", "wohnbev"],
    "wirtschaft":     ["wirtschaft", "beschaeftigung", "betriebe", "arbeit", "branche"],
    "klima":          ["klima", "temperatur", "wetter", "niederschlag", "gletscher"],
    "mobilitaet":     ["mobilitaet", "verkehr", "pendler", "oev", "strassennetz"],
    "landwirtschaft": ["landwirtschaft", "agrar", "landwirt", "tiere", "vieh"],
}


def discover_datasets_for_stories(client: DataGRClient, limit: int = 200) -> dict[str, Optional[str]]:
    """
    For each Datenstory-Website story, find the best matching dataset on data.gr.ch.
    Returns {story_id: dataset_id | None}.
    """
    print("Suche passende dataset_ids für die 7 Datenstory-Website-Geschichten …\n")
    datasets = client.list_datasets(limit=limit)

    # Build a searchable index from title + keywords + description
    index: list[tuple[str, str]] = []
    for ds in datasets:
        ds_id = ds.get("dataset_id", "")
        meta = ds.get("metas", {}).get("default", {}) or {}
        title = meta.get("title", "") or ""
        kws = " ".join(meta.get("keyword", []) or [])
        desc = meta.get("description", "") or ""
        searchable = f"{title} {kws} {desc}".lower()
        index.append((ds_id, searchable))

    results: dict[str, Optional[str]] = {}
    for story_id, hints in STORY_DATASET_HINTS.items():
        match = None
        for hint in hints:
            matches = [ds_id for ds_id, text in index if hint in text]
            if matches:
                match = matches[0]
                break
        results[story_id] = match
        status = f"✓  {match}" if match else "–  kein Match"
        print(f"  {story_id:<18} {status}")

    return results


def format_story_patch(story_datasets: dict[str, Optional[str]]) -> str:
    """Format discovered dataset IDs as a JS patch suggestion for app.js."""
    lines = [
        "// ── Vorschlag: Diese apiDatasetId-Werte in app.js eintragen ──",
        "// Ersetze null durch die Dataset-ID in der jeweiligen Story-Definition:\n",
    ]
    for story_id, ds_id in story_datasets.items():
        if ds_id:
            lines.append(f"  // {story_id:<18} apiDatasetId: '{ds_id}',")
        else:
            lines.append(f"  // {story_id:<18} apiDatasetId: null,  // kein Match gefunden")
    lines += [
        "",
        "// Tipp: Werte mit --discover-stories --output json ausgeben,",
        "//       um die Daten direkt in app.js zu übernehmen.",
    ]
    return "\n".join(lines)


def finding_to_story(f: dict) -> dict:
    """
    Convert an agent finding into a minimal story-compatible dict
    matching the Datenstory-Website's STORIES array structure.
    Journalists fill in analysis/keyFacts; the rest is auto-generated.
    """
    import hashlib
    story_id = f"agent-{f['type']}-{hashlib.md5(f['dataset'].encode()).hexdigest()[:6]}"

    if f["type"] == "outlier":
        muni = f" in {f['municipality']}" if "municipality" in f else ""
        year = f" ({f['year']})" if "year" in f else ""
        title = f"Ausreisser: «{f['field']}»{muni}{year}"
        lead = (
            f"Ein statistischer Ausreisser: «{f['field']}» liegt bei {f['value']:.1f} – "
            f"{abs(f['z_score']):.1f} Standardabweichungen vom Kantonsschnitt ({f['mean']:.1f})."
            + (f" Pct: {f['pct_from_mean']:+.0f}%." if f.get("pct_from_mean") else "")
            + " Was steckt dahinter?"
        )
        category, chart_type = "Statistik", "bar"

    elif f["type"] == "trend":
        dir_de = "gestiegen" if f["direction"] == "steigend" else "gesunken"
        title = f"Trend: «{f['field']}» ist {abs(f['pct_change']):.0f}% {dir_de} ({f['year_start']}–{f['year_end']})"
        lead = (
            f"Über {f['n_years']} Jahre hat sich «{f['field']}» um {f['pct_change']:+.0f}% verändert "
            f"(Ø {f['slope_per_year']:+.1f} pro Jahr)."
            + (
                f" Gegen den Trend läuft: {f['exceptions'][0]['municipality']} ({f['exceptions'][0]['pct_change']:+.0f}%)."
                if f["exceptions"] else ""
            )
        )
        category, chart_type = "Entwicklung", "line"

    elif f["type"] == "ranking":
        title = f"Gemeinde-Ranking: «{f['field']}»"
        top = f["top"][0]
        bot = f["bottom"][0]
        lead = (
            f"Unter {f['n_municipalities']} Graubündner Gemeinden führt {top['municipality']} "
            f"mit {top['value']:.0f} – {bot['municipality']} liegt mit {bot['value']:.0f} am Ende."
            + (f" Faktor {f['spread_ratio']:.1f}× zwischen Spitze und Schluss." if f.get("spread_ratio") else "")
        )
        category, chart_type = "Gemeinden", "bar"

    else:
        return {}

    return {
        "id": story_id,
        "category": category,
        "title": title,
        "lead": lead,
        "chartTitle": f['field'],
        "chartSubtitle": f"Datensatz: {f['dataset']} · data.gr.ch",
        "chartType": chart_type,
        "apiDatasetId": f["dataset"],
        "fallbackData": {
            "labels": [],
            "values": [],
            "unit": "",
            "year": f.get("year") or f.get("year_end"),
        },
        "keyFacts": [],
        "analysis": [format_finding(f)],
        "source": f"data.gr.ch – {f['dataset']}",
        "_agent_finding": f,
    }


# ─────────────────────────────────────────────
# Main Agent
# ─────────────────────────────────────────────

class GraubuendenStatsAgent:
    def __init__(
        self,
        scenarios: list[str] = None,
        max_datasets: int = 20,
        keyword: str = None,
    ):
        self.client = DataGRClient()
        self.scenarios = set(scenarios or ["outlier", "trend", "ranking"])
        self.max_datasets = max_datasets
        self.keyword = keyword

    def run(self) -> list[dict]:
        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        print(f"[{ts}] Graubünden Statistics Agent – Start")
        print(f"Szenarien: {', '.join(sorted(self.scenarios))}  |  max. {self.max_datasets} Datensätze\n")

        datasets = self.client.list_datasets(limit=self.max_datasets)
        print(f"{len(datasets)} Datensätze gefunden\n")

        all_findings: list[dict] = []

        for ds in datasets:
            ds_id = ds.get("dataset_id") or ds.get("datasetid", "")
            title = ds.get("metas", {}).get("default", {}).get("title", ds_id)
            if not ds_id:
                continue

            print(f"  ▸ {title}")
            try:
                df = self.client.get_records(ds_id)
            except Exception as e:
                print(f"    Fehler: {e}")
                continue

            if df.empty:
                print("    – keine Daten")
                continue

            cols_preview = list(df.columns)[:8]
            print(f"    {len(df)} Zeilen  ·  {len(df.columns)} Spalten  ·  {cols_preview}")

            findings: list[dict] = []
            if "outlier" in self.scenarios:
                findings += find_outliers(df, ds_id)
            if "trend" in self.scenarios:
                findings += find_trends(df, ds_id)
            if "ranking" in self.scenarios:
                findings += rank_municipalities(df, ds_id)
            if "context" in self.scenarios and self.keyword:
                findings += search_context(df, ds_id, self.keyword)

            if findings:
                print(f"    → {len(findings)} Befund(e)")
            all_findings.extend(findings)

        return all_findings

    def report(self, findings: list[dict]) -> str:
        ts = datetime.now().strftime("%Y-%m-%d")
        if not findings:
            return f"# Graubünden Statistics Agent – {ts}\n\nKeine auffälligen Muster gefunden."

        lines = [
            f"# Graubünden Statistics Agent – {ts}",
            f"\n{len(findings)} Befund(e) in {len({f['dataset'] for f in findings})} Datensätzen:\n",
        ]
        for i, f in enumerate(findings, 1):
            lines.append(f"---\n### Befund {i}\n")
            lines.append(format_finding(f))
            lines.append("")

        lines.append("\n---\n*Quelle: data.gr.ch – Datenportal Kanton Graubünden*")
        return "\n".join(lines)


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Graubünden Statistics Agent – findet journalistische Muster in Kantonsstatistiken"
    )
    parser.add_argument(
        "--scenario",
        choices=["outlier", "trend", "ranking", "context", "all"],
        default="all",
        help="Analyse-Szenario (default: all)",
    )
    parser.add_argument(
        "--max-datasets",
        type=int,
        default=20,
        metavar="N",
        help="Maximale Anzahl Datensätze (default: 20)",
    )
    parser.add_argument(
        "--keyword",
        metavar="TEXT",
        help="Suchbegriff für das Kontext-Szenario",
    )
    parser.add_argument(
        "--list-datasets",
        action="store_true",
        help="Nur Datensätze auflisten, keine Analyse",
    )
    parser.add_argument(
        "--discover-stories",
        action="store_true",
        help="Dataset-IDs für die 7 Datenstory-Website-Geschichten suchen",
    )
    parser.add_argument(
        "--export-stories",
        action="store_true",
        help="Findings als website-kompatible STORIES-JSON-Objekte ausgeben",
    )
    parser.add_argument(
        "--output",
        choices=["markdown", "json"],
        default="markdown",
        help="Ausgabeformat (default: markdown)",
    )
    args = parser.parse_args()

    client = DataGRClient()

    if args.discover_stories:
        story_datasets = discover_datasets_for_stories(client)
        print()
        if args.output == "json":
            print(json.dumps(story_datasets, ensure_ascii=False, indent=2))
        else:
            print(format_story_patch(story_datasets))
        return

    if args.list_datasets:
        datasets = client.list_datasets(limit=200)
        print(f"{'Dataset-ID':<55} Titel")
        print("─" * 100)
        for ds in datasets:
            ds_id = ds.get("dataset_id", "")
            title = ds.get("metas", {}).get("default", {}).get("title", "")
            print(f"{ds_id:<55} {title}")
        print(f"\n{len(datasets)} Datensätze total")
        return

    scenarios = (
        ["outlier", "trend", "ranking", "context"] if args.scenario == "all" else [args.scenario]
    )

    if "context" in scenarios and not args.keyword:
        print("Hinweis: --keyword fehlt für das Kontext-Szenario; wird übersprungen.")
        scenarios.remove("context")

    agent = GraubuendenStatsAgent(
        scenarios=scenarios,
        max_datasets=args.max_datasets,
        keyword=args.keyword,
    )
    findings = agent.run()

    print("\n" + "=" * 60 + "\n")

    if args.export_stories:
        stories = [finding_to_story(f) for f in findings if finding_to_story(f)]
        print(json.dumps(stories, ensure_ascii=False, indent=2, default=str))
        print(f"\n// {len(stories)} Story-Objekte – direkt in STORIES[] von app.js einfügbar")
        return

    if args.output == "json":
        print(json.dumps(findings, ensure_ascii=False, indent=2, default=str))
    else:
        print(agent.report(findings))


if __name__ == "__main__":
    main()
