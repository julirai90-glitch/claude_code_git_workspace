#!/bin/sh
# Pre-commit safety net: blocks commits that stage known-private folders.
# Purpose: this repo is public on GitHub. Private/personal folders live
# in the same working directory by convention only (never `git add -A`
# in this repo) — this hook is the structural backstop for that convention.
#
# Install (per clone, hooks are not versioned by git itself):
#   cp scripts/git-hooks/pre-commit-privacy-check.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# See PLAN-REPO-ORDNUNG.md / CLAUDE.md for background.

staged=$(git diff --cached --name-only)

# Top-level folders that must never be staged (fully private, nothing
# in them is ever meant to be tracked).
blocked_dirs="FINANZEN/ KARRIERE-STRATEGIE/ Wissen/ TERRA GRISCHUNA/ _ARCHIV_INBOX/ backup/"

# SUEDOSTSCHWEIZ/ is mixed: almost everything in it is private research,
# except these two files which are intentionally tracked.
suedostschweiz_allowlist="SUEDOSTSCHWEIZ/_gen_wahlhilfe.py SUEDOSTSCHWEIZ/wahlhilfe-glarus.html"

blocked=""

for f in $staged; do
    case "$f" in
        FINANZEN/*|"KARRIERE-STRATEGIE/"*|Wissen/*|"TERRA GRISCHUNA/"*|_ARCHIV_INBOX/*|backup/*)
            blocked="$blocked\n  $f"
            ;;
        SUEDOSTSCHWEIZ/*)
            allowed=0
            for a in $suedostschweiz_allowlist; do
                [ "$f" = "$a" ] && allowed=1
            done
            [ "$allowed" -eq 0 ] && blocked="$blocked\n  $f"
            ;;
    esac
done

if [ -n "$blocked" ]; then
    echo "BLOCKED: staged files look like private/personal content, not meant for this public repo:"
    printf "%b\n" "$blocked"
    echo ""
    echo "If this is genuinely intended, unstage with 'git restore --staged <file>' to review,"
    echo "or edit scripts/git-hooks/pre-commit-privacy-check.sh to adjust the allowlist, then retry."
    exit 1
fi

exit 0
