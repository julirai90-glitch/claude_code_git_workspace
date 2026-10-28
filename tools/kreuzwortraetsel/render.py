"""Rendert raetsel.json als druckfertiges PDF (Rätsel, Auflösung, Kontrollliste).

Aufruf: python3 render.py [raetsel.json] [raetsel.pdf]
Fragen kommen aus raetsel.json (Feld "clue"). "|" markiert erlaubte Trennstellen.
"""
import json
import sys
from datetime import date
from pathlib import Path

from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

HERE = Path(__file__).parent
FONT_DIR = Path("/usr/share/fonts/truetype/liberation")
pdfmetrics.registerFont(TTFont("Sans", str(FONT_DIR / "LiberationSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Sans-Bold", str(FONT_DIR / "LiberationSans-Bold.ttf")))

CELL = 9 * mm
LINE = 0.35            # Linienstärke Gitter (pt)
CONDENSE = 82          # horizontale Stauchung der Fragen in % (ersetzt Condensed-Schnitt)
GREY = HexColor("#c8c8c8")
TEXT2 = HexColor("#555555")


def fit_lines(text, width, height, max_size=6.2, min_size=4.2):
    """Bricht Fragetext in Zeilen um (Trennung an '|'), grösste passende Schrift."""
    size = max_size
    while size >= min_size:
        lines = wrap(text, width, size)
        lead = size * 1.02
        if lines is not None and len(lines) * lead <= height:
            return size, lines
        size -= 0.2
    return min_size, wrap(text, width, min_size, force=True)


def text_w(s, size):
    return pdfmetrics.stringWidth(s, "Sans", size) * CONDENSE / 100


def wrap(text, width, size, force=False):
    """Zeilen umbrechen; Wörter dürfen an '|' getrennt werden. None, wenn es nicht passt."""
    lines, cur = [], ""
    for word in text.split():
        parts = word.split("|")
        while parts:
            sep = " " if cur else ""
            if text_w(cur + sep + "".join(parts), size) <= width:
                cur += sep + "".join(parts)
                break
            # grösstes Stück, das mit Trennstrich noch auf die Zeile passt
            for i in range(len(parts) - 1, 0, -1):
                if text_w(cur + sep + "".join(parts[:i]) + "-", size) <= width:
                    lines.append(cur + sep + "".join(parts[:i]) + "-")
                    cur, parts = "", parts[i:]
                    break
            else:
                if cur:
                    lines.append(cur)
                    cur = ""
                    continue
                if not force:
                    return None
                cur, parts = "".join(parts), []
    if cur:
        lines.append(cur)
    return lines


def tri(c, x, y, d, s=1.6 * mm):
    """Gefülltes Dreieck mit Spitze bei (x,y) in Richtung d ('r' oder 'd')."""
    p = c.beginPath()
    if d == "r":
        p.moveTo(x, y); p.lineTo(x - s * 0.8, y + s / 2); p.lineTo(x - s * 0.8, y - s / 2)
    else:
        p.moveTo(x, y); p.lineTo(x - s / 2, y + s * 0.8); p.lineTo(x + s / 2, y + s * 0.8)
    p.close()
    c.drawPath(p, fill=1, stroke=0)


def bent_arrow(c, x, y, typ):
    """Abgewinkelter Pfeil im Zielfeld (x,y = linke obere Ecke)."""
    c.setLineWidth(0.6)
    if typ == "BA":   # von oben kommend, nach rechts
        x0 = x + 2.2 * mm
        c.line(x0, y, x0, y - 2.2 * mm)
        c.line(x0, y - 2.2 * mm, x0 + 1.4 * mm, y - 2.2 * mm)
        tri(c, x0 + 2.6 * mm, y - 2.2 * mm, "r", 1.4 * mm)
    else:             # von links kommend, nach unten
        y0 = y - 2.2 * mm
        c.line(x, y0, x + 2.2 * mm, y0)
        c.line(x + 2.2 * mm, y0, x + 2.2 * mm, y0 - 1.4 * mm)
        tri(c, x + 2.2 * mm, y0 - 2.6 * mm, "d", 1.4 * mm)


def draw_text_block(c, text, x, y_top, w, h):
    size, lines = fit_lines(text, w - 1.0 * mm, h - 0.6 * mm)
    lead = size * 1.02
    total = len(lines) * lead
    ty = y_top - (h - total) / 2 - size * 0.8
    c.setFont("Sans", size)
    c.setFillColor(black)
    for ln in lines:
        c.saveState()
        tw = text_w(ln, size)
        c.translate(x + (w - tw) / 2, ty)
        c.scale(CONDENSE / 100, 1)
        c.drawString(0, 0, ln)
        c.restoreState()
        ty -= lead


def draw_grid(c, data, ox, oy, solution=False):
    grid = data["grid"]
    H, W = len(grid), len(grid[0])
    by_cell = {}
    for e in data["entries"]:
        by_cell.setdefault((e["r"], e["c"]), []).append(e)
    sol_nr = {tuple(p): i + 1 for i, p in enumerate(data.get("loesung_zellen", []))}
    arrows = []

    for r in range(H):
        for col in range(W):
            x, y = ox + col * CELL, oy - r * CELL   # y = Oberkante
            ch = grid[r][col]
            c.setStrokeColor(black)
            c.setLineWidth(LINE)
            if ch == "+":  # reservierte Fläche, wird unten gezeichnet
                continue
            if ch == "#":
                if solution:
                    c.setFillColor(HexColor("#222222"))
                    c.rect(x, y - CELL, CELL, CELL, fill=1, stroke=1)
                    continue
                c.setFillColor(white)
                c.rect(x, y - CELL, CELL, CELL, fill=1, stroke=1)
                ents = sorted(by_cell.get((r, col), []), key=lambda e: e["typ"] not in ("A", "BD"))
                n = len(ents)
                for i, e in enumerate(ents):
                    hh = CELL / n
                    top = y - i * hh
                    draw_text_block(c, e["clue"] or "??? " + e["word"], x, top, CELL, hh)
                    if e["typ"] == "A":
                        arrows.append((x + CELL + 1.3 * mm, top - hh / 2, "r"))
                    elif e["typ"] == "D":
                        arrows.append((x + CELL / 2, y - CELL - 1.3 * mm, "d"))
                if n == 2:
                    c.setLineWidth(0.25)
                    c.line(x + 0.8 * mm, y - CELL / 2, x + CELL - 0.8 * mm, y - CELL / 2)
            else:
                c.setFillColor(white)
                c.rect(x, y - CELL, CELL, CELL, fill=1, stroke=1)
                if (r, col) in sol_nr and not solution:
                    c.setLineWidth(0.4)
                    c.circle(x + CELL / 2, y - CELL / 2, CELL * 0.36, stroke=1, fill=0)
                    c.setFont("Sans", 5.5)
                    c.setFillColor(black)
                    c.drawRightString(x + CELL - 0.6 * mm, y - CELL + 0.7 * mm, str(sol_nr[(r, col)]))
                if solution:
                    c.setFont("Sans-Bold", 13)
                    c.setFillColor(black)
                    c.drawCentredString(x + CELL / 2, y - CELL / 2 - 4.5, ch)
    # Lösungswort-Kästchen in der letzten Zeile
    n = len(data.get("loesungswort") or "")
    if n and grid[-1].endswith("+" * n):
        draw_solution_row(c, data, ox + (W - n) * CELL, oy - (H - 1) * CELL, solution)
    # Box «Auflösung des letzten Rätsels»
    if data.get("box"):
        br, bc, bh, bw = data["box"]
        bx, by = ox + bc * CELL, oy - br * CELL
        c.setFillColor(white)
        c.setStrokeColor(black)
        c.setLineWidth(1.6)
        c.rect(bx, by - bh * CELL, bw * CELL, bh * CELL, fill=1, stroke=1)
        c.setFillColor(black)
        c.setFont("Sans-Bold", 8)
        c.drawCentredString(bx + bw * CELL / 2, by - 6 * mm, "Auflösung des letzten Rätsels")
        c.setFont("Sans", 7)
        c.setFillColor(TEXT2)
        c.drawCentredString(bx + bw * CELL / 2, by - bh * CELL / 2, "(Platzhalter)")
    # abgewinkelte Pfeile und Pfeile über Feldgrenzen zuletzt zeichnen
    if not solution:
        c.setFillColor(black)
        c.setStrokeColor(black)
        for ax, ay, d in arrows:
            tri(c, ax, ay, d)
        for e in data["entries"]:
            if e["typ"] in ("BA", "BD"):
                sr, sc = e["start"]
                bent_arrow(c, ox + sc * CELL, oy - sr * CELL, e["typ"])
    # Aussenrahmen
    c.setLineWidth(1.6)
    c.rect(ox, oy - H * CELL, W * CELL, H * CELL, fill=0, stroke=1)


def draw_solution_row(c, data, ox, y, solution=False):
    word = data.get("loesungswort") or ""
    c.setLineWidth(LINE)
    for i, ch in enumerate(word):
        x = ox + i * CELL
        c.setFillColor(GREY)
        c.setStrokeColor(black)
        c.rect(x, y - CELL, CELL, CELL, fill=1, stroke=1)
        c.setFillColor(black)
        c.setFont("Sans", 5.5)
        c.drawString(x + 1.2 * mm, y - 3.2 * mm, str(i + 1))
        if solution:
            c.setFont("Sans-Bold", 13)
            c.drawCentredString(x + CELL / 2, y - CELL / 2 - 4.5, ch)


def footer(c, ox, y, text):
    c.setFont("Sans", 6.5)
    c.setFillColor(TEXT2)
    c.drawString(ox, y, text)


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "raetsel.json"
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix(".pdf")
    data = json.loads(src.read_text(encoding="utf-8"))
    # Fragen, die nach dem Generieren in den TSV-Dateien ergänzt wurden, nachtragen
    from generate import read_clues
    clues = {**read_clues(HERE / "ergaenzt.tsv"), **read_clues(HERE / "kuratiert.tsv")}
    for e in data["entries"]:
        e["clue"] = e.get("clue") or clues.get(e["word"], "")
    H, W = len(data["grid"]), len(data["grid"][0])
    pw, ph = A4
    ox = (pw - W * CELL) / 2
    oy = ph - 30 * mm
    stand = f"Rätsel: Südostschweiz/jr · Prototyp, generiert {date.today().isoformat()}"
    c = canvas.Canvas(str(dst), pagesize=A4)
    c.setTitle("Schwedenrätsel – Prototyp")

    for solution in (False, True):
        c.setFont("Sans-Bold", 14)
        c.setFillColor(black)
        c.drawString(ox, ph - 20 * mm, "Auflösung" if solution else "Schwedenrätsel")
        draw_grid(c, data, ox, oy, solution)
        sy = oy - H * CELL - 5 * mm
        if solution and data.get("loesungswort"):
            c.setFont("Sans-Bold", 9)
            c.setFillColor(black)
            c.drawString(ox, sy, f"Lösungswort: {data['loesungswort']}")
        footer(c, ox, sy - 6 * mm, stand)
        c.showPage()

    # Kontrollliste für die Redaktion
    c.setFont("Sans-Bold", 12)
    c.drawString(20 * mm, ph - 20 * mm, "Kontrollliste: Wörter und Fragen")
    y = ph - 30 * mm
    c.setFont("Sans", 8)
    for e in sorted(data["entries"], key=lambda e: (e["dir"], e["start"])):
        arrow = "→" if e["dir"] == "a" else "↓"
        c.drawString(20 * mm, y, f"{arrow} Z{e['start'][0] + 1}/S{e['start'][1] + 1}")
        c.drawString(45 * mm, y, e["word"])
        c.drawString(85 * mm, y, (e["clue"] or "—").replace("|", ""))
        y -= 4 * mm
        if y < 20 * mm:
            c.showPage()
            c.setFont("Sans", 8)
            y = ph - 20 * mm
    c.showPage()
    c.save()
    print(f"PDF -> {dst}")


if __name__ == "__main__":
    main()
