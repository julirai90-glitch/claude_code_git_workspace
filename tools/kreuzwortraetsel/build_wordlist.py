"""Baut die Füll-Wortliste für den Gittergenerator.

Quellen (werden heruntergeladen, nicht eingecheckt):
- de_CH_frami (LibreOffice-Wörterbuch, Grundformen):
  https://github.com/LibreOffice/dictionaries/tree/master/de
- FrequencyWords de_50k (Untertitel-Häufigkeiten, CC-BY-SA 4.0):
  https://github.com/hermitdave/FrequencyWords

Ergebnis: woerter.tsv mit WORT<TAB>Gewicht. Nur Wörter, die im Wörterbuch als
Grundform stehen UND unter den häufigsten RANK_LIMIT Wörtern sind.
"""
import re
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
CACHE = HERE / ".cache"
DIC_URL = "https://raw.githubusercontent.com/LibreOffice/dictionaries/master/de/de_CH_frami.dic"
FREQ_URL = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/de/de_50k.txt"
RANK_LIMIT = 45000

# Wörter, die nie ins Rätsel sollen (anstössig, zu obskur, Partizip-Formen etc.)
BLACKLIST = set((HERE / "blacklist.txt").read_text(encoding="utf-8").split()) if (HERE / "blacklist.txt").exists() else set()


def fetch(url):
    CACHE.mkdir(exist_ok=True)
    p = CACHE / url.rsplit("/", 1)[1]
    if not p.exists():
        urllib.request.urlretrieve(url, p)
    return p


def norm(w):
    w = w.upper().replace("Ä", "AE").replace("Ö", "OE").replace("Ü", "UE").replace("ß", "SS")
    return w if re.fullmatch("[A-Z]+", w) else None


def is_participle(stem):
    # Annahme: kleingeschriebene ge-...-t/-en-Formen sind meist Partizipien (gespürt, geflogen)
    return stem[0].islower() and re.search(r"ge\w+(t|en)$", stem) is not None


def main():
    freq = {}
    for i, line in enumerate(fetch(FREQ_URL).read_text(encoding="utf-8").splitlines()):
        freq.setdefault(line.split()[0], i)
    words = {}
    for line in fetch(DIC_URL).read_text(encoding="latin-1").splitlines():
        stem = line.split("/")[0].strip()
        if not stem or not stem[0].isalpha() or is_participle(stem):
            continue
        rank = freq.get(stem.lower())
        n = norm(stem)
        if rank is None or rank >= RANK_LIMIT or not n or not 3 <= len(n) <= 12 or n in BLACKLIST:
            continue
        # gewicht: häufige Wörter bevorzugen (1..5)
        weight = 5 if rank < 3000 else 3 if rank < 10000 else 1
        words[n] = max(words.get(n, 0), weight)
    with open(HERE / "woerter.tsv", "w", encoding="utf-8") as f:
        for w in sorted(words):
            f.write(f"{w}\t{words[w]}\n")
    print(f"{len(words)} Wörter -> woerter.tsv")


if __name__ == "__main__":
    main()
