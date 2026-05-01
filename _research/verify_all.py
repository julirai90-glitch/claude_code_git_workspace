"""
Master-Runner für graubuenden-stats: Wasserdichtigkeit prüfen.

Führt in dieser Reihenfolge aus:
  1. manifest_build.py    — registriert alle Datenfiles + Hashes
  2. verify_kanton.py     — Doppelabfrage gegen data.gr.ch (17 Erhebungen × 4 Felder)
  3. anomaly_detect.py    — generiert _research/anomalies.md
  4. claims_check.py      — vergleicht 42 Story-Aussagen mit den aktuellen Daten

Wenn alles PASS: Exit 0.
Wenn irgendetwas fehlschlägt: Exit 1, mit klarer Angabe wo es brach.

Anwendung:
  python _research/verify_all.py
"""
import os
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))

STEPS = [
    ('Manifest aktualisieren',                'manifest_build.py'),
    ('API-Doppelabfrage (kanton)',            'verify_kanton.py'),
    ('Anomalie-Bericht erzeugen',             'anomaly_detect.py'),
    ('Claims-Check (Story vs. Daten)',        'claims_check.py'),
]

def run(label, script):
    print()
    print('━' * 78)
    print(f'▶ {label}  ({script})')
    print('━' * 78)
    p = subprocess.run([sys.executable, os.path.join(HERE, script)], cwd=os.path.dirname(HERE))
    return p.returncode

def main():
    print()
    print('═' * 78)
    print('  WASSERDICHTIGKEITS-PIPELINE  graubuenden-stats')
    print('═' * 78)
    fail = 0
    for label, script in STEPS:
        rc = run(label, script)
        if rc != 0:
            fail += 1
            print(f'\n   ⚠ {label} → Exit {rc}')
        else:
            print(f'\n   ✓ {label}')
    print()
    print('═' * 78)
    if fail == 0:
        print('  GESAMT: ALLE STUFEN PASS')
        print('  Daten und Story sind konsistent.')
        print('═' * 78)
        return 0
    print(f'  GESAMT: {fail} VON {len(STEPS)} STUFEN FEHLGESCHLAGEN')
    print('  Story darf nicht publiziert werden, bevor das behoben ist.')
    print('═' * 78)
    return 1

if __name__ == '__main__':
    sys.exit(main())
