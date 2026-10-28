"""Schwedenrätsel-Generator: füllt ein Gitter und schreibt raetsel.json.

Regeln (wie im Rätsel im Bündner Tagblatt / in der Südostschweiz):
- Jedes Wort (≥2 Buchstaben) braucht eine Frage im Feld davor:
  waagrecht links davon (→), senkrecht darüber (↓).
- Am Rand gibt es abgewinkelte Pfeile: ein Wort, das in Spalte 0 beginnt,
  bekommt seine Frage vom Feld darüber (↓→); ein Wort, das in Zeile 0
  beginnt, vom Feld links davon (→↓).
- Ein Fragefeld trägt 1 oder 2 Fragen.
- Einzelbuchstaben (Lauflänge 1) sind erlaubt, wenn die andere Richtung ein Wort ist.

Aufruf: python3 generate.py [--seed N] [--versuche N] [--breite 13] [--hoehe 15]
"""
import argparse
import json
import random
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.setrecursionlimit(10000)

WALL = "+"  # reservierte Fläche (Lösungswort-Kästchen, Auflösungsbox)
LOESUNGSWOERTER = ["STEINBOCK", "BERGDORF", "ALPSOMMER", "WINTERTAG", "SCHNEEMANN", "RHEINTAL", "BERGSTERN"]


def read_clues(path):
    """WORT<TAB>Frage, '#' = Kommentar. Fehlt die Datei, leeres Dict."""
    out = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip() and not line.startswith("#"):
                w, clue = line.split("\t")
                out[w] = clue
    return out


def load_words():
    words, clues = {}, {}
    for line in (HERE / "woerter.tsv").read_text(encoding="utf-8").splitlines():
        w, wt = line.split("\t")
        words[w] = int(wt)
    for name, weight in (("ergaenzt.tsv", None), ("kuratiert.tsv", 40)):
        for w, clue in read_clues(HERE / name).items():
            if weight:  # kuratierte Wörter bevorzugen, Kürzel (2 Buchstaben) nur mässig
                words[w] = weight if len(w) > 2 else 8
            clues[w] = clue
    prefix, minlen = {}, {}
    for w, wt in words.items():
        for i in range(1, len(w) + 1):
            prefix[w[:i]] = prefix.get(w[:i], 0) + wt
            minlen[w[:i]] = min(minlen.get(w[:i], 99), len(w))
    return words, clues, (prefix, minlen)


def clue_clients(g, r, c, possible=False):
    """Wörter, die das Fragefeld (r,c) bedienen kann: Liste von (typ, start_r, start_c, richtung).
    A: → rechts, D: ↓ darunter, BA: ↓→ (nur Spalte 0), BD: →↓ (nur Zeile 0).
    possible=True: leere Felder zählen als mögliche Buchstaben."""
    H, W = len(g), len(g[0])
    ok = ("#", WALL) if possible else ("#", WALL, None)

    def letter(rr, cc):
        return 0 <= rr < H and 0 <= cc < W and g[rr][cc] not in ok

    out = []
    if letter(r, c + 1) and letter(r, c + 2):
        out.append(("A", r, c + 1, "a"))
    if letter(r + 1, c) and letter(r + 2, c):
        out.append(("D", r + 1, c, "d"))
    if c == 0 and letter(r + 1, 0) and letter(r + 1, 1):
        out.append(("BA", r + 1, 0, "a"))
    if r == 0 and letter(0, c + 1) and letter(1, c + 1):
        out.append(("BD", 0, c + 1, "d"))
    return out


class Filler:
    def __init__(self, W, H, words, prefix, rng, node_limit, walls=()):
        self.W, self.H = W, H
        self.words, self.rng = words, rng
        self.prefix, self.minlen = prefix
        self.g = [[None] * W for _ in range(H)]
        self.g[0][0] = "#"
        for r, c in walls:  # reservierte Fläche (Lösungswort, Auflösungsbox)
            self.g[r][c] = WALL
        # Platz bis zum Rand bzw. zur reservierten Fläche
        self.room_a = [[0] * W for _ in range(H)]
        self.room_d = [[0] * W for _ in range(H)]
        for r in range(H - 1, -1, -1):
            for c in range(W - 1, -1, -1):
                if c + 1 < W and self.g[r][c + 1] != WALL:
                    self.room_a[r][c] = self.room_a[r][c + 1] + 1
                if r + 1 < H and self.g[r + 1][c] != WALL:
                    self.room_d[r][c] = self.room_d[r + 1][c] + 1
        self.used = set()
        self.single = {}  # (r,c,dir) -> True: Lauflänge 1 in dieser Richtung
        self.cells = [(r, c) for r in range(H) for c in range(W) if self.g[r][c] is None]
        self.idx = {p: i for i, p in enumerate(self.cells)}
        self.nodes, self.node_limit, self.maxk = 0, node_limit, 0
        self.hashes = 1
        self.inner_hashes = 0
        self.max_density = 0.3
        self.inner_idx = {p: i for i, p in enumerate(q for q in self.cells if min(q) > 0)}
        # Fragefelder erst prüfen, wenn ihr ganzes Umfeld gesetzt ist
        self.check_after = {}
        for r in range(H):
            for c in range(W):
                rel = [p for p in ((r, c + 1), (r, c + 2), (r + 1, c), (r + 2, c), (r + 1, c + 1))
                       if p[0] < H and p[1] < W and self.g[p[0]][p[1]] != WALL]
                last = max(rel, default=None)
                if last:
                    self.check_after.setdefault(last, []).append((r, c))

    def get(self, r, c):
        """Wie g[r][c], aber Rand und reservierte Fläche zählen als Grenze ('#')."""
        if 0 <= r < self.H and 0 <= c < self.W and self.g[r][c] != WALL:
            return self.g[r][c]
        return "#"

    def run_left(self, r, c):
        s = c
        while self.get(r, s - 1) != "#":
            s -= 1
        return "".join(self.g[r][s:c])

    def run_up(self, r, c):
        s = r
        while self.get(s - 1, c) != "#":
            s -= 1
        return "".join(self.g[i][c] for i in range(s, r))

    def finish(self, word, cell, d, undo):
        """Abgeschlossene Lauflänge prüfen und registrieren."""
        if len(word) >= 2:
            if word not in self.words or word in self.used:
                return False
            self.used.add(word)
            undo.append(("used", word))
        elif len(word) == 1:
            other = (cell[0], cell[1], "d" if d == "a" else "a")
            if self.single.get(other):
                return False
            self.single[(cell[0], cell[1], d)] = True
            undo.append(("single", (cell[0], cell[1], d)))
        return True

    def check(self, r, c, x, pa, pd, undo):
        W, H, get = self.W, self.H, self.get
        if x == "#":
            if self.room_a[r][c] == 0 and self.room_d[r][c] == 0:
                return False
            if get(r - 1, c) == "#" and get(r, c - 1) == "#" and get(r - 1, c - 1) == "#":
                return False
            if not (self.finish(pa, (r, c - 1), "a", undo) and self.finish(pd, (r - 1, c), "d", undo)):
                return False
        else:
            a, d = pa + x, pd + x
            if a not in self.prefix or d not in self.prefix:
                return False
            # passt das kürzeste mögliche Wort noch bis zum Rand?
            if len(a) >= 2 and self.minlen[a] - len(a) > self.room_a[r][c]:
                return False
            if len(d) >= 2 and self.minlen[d] - len(d) > self.room_d[r][c]:
                return False
            # Randwörter brauchen ein Fragefeld für den abgewinkelten Pfeil
            if c == 1 and get(r, 0) != "#" and get(r - 1, 0) != "#":
                return False
            if r == 1 and get(0, c) != "#" and get(0, c - 1) != "#":
                return False
            if self.room_a[r][c] == 0 and not self.finish(a, (r, c), "a", undo):
                return False
            if self.room_d[r][c] == 0 and not self.finish(d, (r, c), "d", undo):
                return False
        return True

    def apply(self, r, c, x):
        undo = []
        pa, pd = self.run_left(r, c), self.run_up(r, c)
        ok = self.check(r, c, x, pa, pd, undo)
        self.g[r][c] = x
        undo.append(("cell", (r, c)))
        if x == "#":
            self.hashes += 1
            self.inner_hashes += r > 0 and c > 0
        if ok:
            for q in self.check_after.get((r, c), []):
                if self.g[q[0]][q[1]] == "#" and not 1 <= len(clue_clients(self.g, *q)) <= 2:
                    ok = False
                    break
        if ok and x == "#":
            # früh erkennen, wenn ein Fragefeld in der Nähe keine Frage mehr bekommen kann
            for q in ((r, c), (r - 1, c), (r, c - 1), (r - 2, c), (r, c - 2), (r - 1, c - 1)):
                if min(q) >= 0 and q != (0, 0) and self.g[q[0]][q[1]] == "#" and not clue_clients(self.g, *q, possible=True):
                    ok = False
                    break
        if not ok:
            self.revert(undo)
            return None
        return undo

    def revert(self, undo):
        for kind, v in reversed(undo):
            if kind == "used":
                self.used.discard(v)
            elif kind == "single":
                self.single.pop(v, None)
            else:
                if self.g[v[0]][v[1]] == "#":
                    self.hashes -= 1
                    self.inner_hashes -= v[0] > 0 and v[1] > 0
                self.g[v[0]][v[1]] = None

    def options(self, r, c):
        pa, pd = self.run_left(r, c), self.run_up(r, c)
        pw = self.prefix
        letters = []
        for x in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
            a, d = pa + x, pd + x
            if a in pw and d in pw:
                letters.append((pw[a] ** 0.5 * pw[d] ** 0.5 * (0.3 + self.rng.random()), x))
        letters.sort(reverse=True)
        opts = [x for _, x in letters]
        k = self.inner_idx.get((r, c), 0)
        too_dense = k > 12 and self.inner_hashes / (k + 1) > self.max_density
        if not too_dense and (len(pa) <= 1 or pa in self.words) and (len(pd) <= 1 or pd in self.words):
            p = 0.08
            if len(pa) >= 2:
                p += 0.04 * min(self.words[pa], 10)
            if len(pd) >= 2:
                p += 0.02 * min(self.words[pd], 10)
            if len(pa) >= 7 or len(pd) >= 8:
                p += 0.3
            if k and self.inner_hashes / (k + 2) > 0.3:
                p *= 0.2
            if r == 0 or c == 0:
                p = 0.85  # Rand: fast immer Fragefeld, wie im Original
            opts.insert(0 if self.rng.random() < p else len(opts), "#")
        return opts

    def conflicts(self, r, c):
        """Zellen, die die Optionen von (r,c) einschränken (für Backjumping)."""
        g, idx = self.g, self.idx
        out = set()
        for rr in range(r - 2, r + 1):
            for cc in range(c - 2, c + 3):
                if (rr, cc) != (r, c) and (rr, cc) in idx and g[rr][cc] is not None:
                    out.add(idx[(rr, cc)])
        for dr, dc in ((0, -1), (-1, 0)):
            rr, cc = r + dr, c + dc
            while self.get(rr, cc) != "#":
                out.add(idx.get((rr, cc)))
                rr, cc = rr + dr, cc + dc
            out.add(idx.get((rr, cc)))
        out.discard(None)
        return out

    def solve(self, k=0):
        """Conflict-directed Backjumping. Gibt (ok, Konfliktmenge) zurück."""
        if k == len(self.cells):
            return True, None
        self.nodes += 1
        self.maxk = max(self.maxk, k)
        if self.nodes > self.node_limit:
            return False, set()
        r, c = self.cells[k]
        conf = self.conflicts(r, c)
        for x in self.options(r, c):
            undo = self.apply(r, c, x)
            if undo is None:
                continue
            ok, child = self.solve(k + 1)
            if ok:
                return True, None
            self.revert(undo)
            if k not in child:
                return False, child  # Sprung über diese Zelle hinweg
            conf |= child - {k}
        return False, conf


def entries(g):
    """Alle Wörter mit ihrem Fragefeld und Pfeiltyp."""
    out = []
    for r, row in enumerate(g):
        for c, x in enumerate(row):
            if x != "#":
                continue
            for typ, sr, sc, d in clue_clients(g, r, c):
                dr, dc = (0, 1) if d == "a" else (1, 0)
                rr, cc, w = sr, sc, ""
                while rr < len(g) and cc < len(row) and g[rr][cc] not in "#" + WALL:
                    w += g[rr][cc]
                    rr, cc = rr + dr, cc + dc
                out.append({"r": r, "c": c, "typ": typ, "start": [sr, sc], "dir": d, "word": w})
    return out


def pick_solution(g, rng, length):
    # Rand auslassen: dort sitzen die abgewinkelten Pfeile
    cells = [(r, c) for r in range(1, len(g)) for c in range(1, len(g[0])) if g[r][c] not in "#" + WALL]
    for word in LOESUNGSWOERTER:
        if len(word) != length:
            continue
        chosen = []
        for ch in word:
            cand = [p for p in cells if g[p[0]][p[1]] == ch and p not in chosen]
            if not cand:
                break
            # möglichst weit verteilt
            cand.sort(key=lambda p: -min([abs(p[0] - q[0]) + abs(p[1] - q[1]) for q in chosen] or [99]) + rng.random())
            chosen.append(cand[0])
        else:
            return word, chosen
    return None, []


def score(g, ents, clues):
    hashes = sum(row.count("#") for row in g)
    curated = sum(1 for e in ents if e["word"] in clues)
    twos = sum(1 for e in ents if len(e["word"]) == 2)
    return curated * 2 - hashes * 3 - twos * 2


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--versuche", type=int, default=20)
    ap.add_argument("--breite", type=int, default=13)
    ap.add_argument("--hoehe", type=int, default=15)
    ap.add_argument("--knoten", type=int, default=50000)
    ap.add_argument("--loesung", type=int, default=9, help="Anzahl Lösungswort-Kästchen in der letzten Zeile")
    ap.add_argument("--box", default="5x7", help="Auflösungsbox unten rechts (BxH), 0 = keine")
    ap.add_argument("--out", default=str(HERE / "raetsel.json"))
    a = ap.parse_args()
    words, clues, prefix = load_words()
    # reservierte Fläche wie im Original: Lösungswort-Kästchen in der letzten Zeile,
    # darüber die Box «Auflösung des letzten Rätsels»
    walls = {(a.hoehe - 1, c) for c in range(a.breite - a.loesung, a.breite)}
    box = None
    if a.box != "0":
        bw, bh = map(int, a.box.split("x"))
        box = [a.hoehe - 1 - bh, a.breite - bw, bh, bw]
        walls |= {(r, c) for r in range(box[0], box[0] + bh) for c in range(box[1], a.breite)}
    best = None
    for i in range(a.versuche):
        rng = random.Random(a.seed * 1000 + i)
        f = Filler(a.breite, a.hoehe, words, prefix, rng, a.knoten, walls)
        if not f.solve()[0]:
            print(f"Versuch {i}: kein Gitter ({f.nodes} Knoten, max Zelle {f.maxk}/{len(f.cells)})")
            continue
        ents = entries(f.g)
        s = score(f.g, ents, clues)
        print(f"Versuch {i}: ok, Score {s}, {len(ents)} Wörter, {f.hashes} Fragefelder")
        if best is None or s > best[0]:
            best = (s, [row[:] for row in f.g], ents, rng)
    if not best:
        sys.exit("Kein Gitter gefunden – mehr --versuche oder --knoten probieren.")
    _, g, ents, rng = best
    for e in ents:
        e["clue"] = clues.get(e["word"], "")
    sol, cells = pick_solution(g, rng, a.loesung)
    json.dump({"grid": ["".join(row) for row in g], "entries": ents,
               "loesungswort": sol, "loesung_zellen": cells, "box": box},
              open(a.out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("\n".join(" ".join(row) for row in g))
    print("Lösungswort:", sol)
    print("Ohne Frage:", sorted(e["word"] for e in ents if not e["clue"]))


if __name__ == "__main__":
    main()
