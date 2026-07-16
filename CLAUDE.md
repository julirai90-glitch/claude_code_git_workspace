# Memory

## Me
Julian Reich – Redaktionsleiter Terra Grischuna (70%, Somedia AG) und KI-Officer bei Somedia (30%).

## People
<!-- Format: | **Spitzname** | Voller Name, Rolle | -->

## Terms
<!-- Format: | Kürzel | Bedeutung | -->
| TG | Terra Grischuna (Magazin/Redaktion) |

## Projects
<!-- Format: | **Codename** | Worum es geht | -->

## Preferences
- Schweizer Rechtschreibung (kein ß)
- Antworten auf Deutsch, Code-Kommentare/Commits Englisch
- Kurz, token-sparsam; Annahmen explizit markieren
- Faktentreue zuerst – bei Unsicherheit nachfragen statt raten

## Repo-Hygiene (dieses Repo ist öffentlich auf GitHub!)
- **Nie `git add -A` oder `git add .`** in diesem Ordner – immer explizite Pfade stagen.
  Private/berufliche Ordner (`FINANZEN/`, `KARRIERE-STRATEGIE/`, `Wissen/`, `TERRA GRISCHUNA/`,
  `_ARCHIV_INBOX/`, `backup/`, die meisten `SUEDOSTSCHWEIZ/`-Recherchen ausser
  `_gen_wahlhilfe.py`/`wahlhilfe-glarus.html`) liegen absichtlich unversioniert im selben
  Arbeitsverzeichnis und dürfen nie eingecheckt werden.
- Zusätzlicher struktureller Schutz: Pre-Commit-Hook
  `scripts/git-hooks/pre-commit-privacy-check.sh` blockiert das Stagen bekannter privater
  Ordner. Hooks werden nicht mitgeklont – bei jedem neuen Klon einmalig installieren:
  `cp scripts/git-hooks/pre-commit-privacy-check.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit`
- **Zwei Klone desselben Repos existieren bewusst:** `graubuenden-stats/` (verschachtelt,
  eigenes `.git`) für Datenstories (GH Pages + Datawrapper), `Claude_Code_Workspace`
  (dieser Ordner) für alles andere. Weil beide dasselbe Origin-Repo sind, driften sie
  auseinander, wenn man nicht aufpasst:
  - Vor jeder Arbeitssession in einem der beiden: `git fetch origin gh-pages` +
    `git log HEAD..origin/gh-pages` prüfen, ob der andere Klon zwischenzeitlich gepusht hat.
  - **Dateien nie manuell per Explorer/Skript zwischen den Klonen verschieben oder aus
    einem Klon löschen** – das erzeugt unsichtbare, uncommittete Lücken (ist am 16.07.2026
    schon einmal passiert, siehe `PLAN-REPO-ORDNUNG.md`). Verschieben/Löschen immer über
    `git mv`/`git rm` + Commit + Push, in nur einem Klon, danach im anderen pullen.
  - Vor jedem Push: `git fetch origin gh-pages` + Diff-Check.
- Lose `PLAN-*.md` im Root vermeiden – erledigte Handoff-Dokumente nach Abschluss löschen
  oder in `handoffs/` archivieren, nicht liegen lassen.
