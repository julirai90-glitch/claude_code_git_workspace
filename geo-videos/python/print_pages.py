"""Zwei A4-Hochformatseiten (PDF) Morteratsch – Layoutentwurf mit echten Daten.
usage: python3 print_pages.py <datenordner> <bildordner (hero.png, hero.json, am_*.png)> <out.pdf>"""
import sys, os, csv, json, math
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib import font_manager as fm
from matplotlib.patches import Rectangle, Polygon, FancyBboxPatch
from PIL import Image

DATA, IMG, OUT = sys.argv[1:4]
for f in fm.findSystemFonts('/usr/share/fonts/opentype/inter'): fm.fontManager.addfont(f)
plt.rcParams.update({'font.family': 'Inter', 'pdf.fonttype': 42, 'axes.spines.top': False, 'axes.spines.right': False})
INK, SUB, BLUE, OR, RED = '#1a1a1a', '#555555', '#0068A4', '#EE7733', '#c0392b'
YCOL = {'1850': '#ffffff', '1931': '#ffe08a', '1973': '#ffb347', '2010': '#f07a2e', '2016': '#d7301f'}
PW, PH = 210, 297                       # mm
MM = 1 / 25.4

def page():
    fig = plt.figure(figsize=(PW * MM, PH * MM))
    return fig

def ax_mm(fig, x, y, w, h, **kw):
    """Achse in mm, Ursprung oben links."""
    return fig.add_axes([x / PW, 1 - (y + h) / PH, w / PW, h / PH], **kw)

def text_mm(fig, x, y, s, **kw):
    fig.text(x / PW, 1 - y / PH, s, **kw)

rows = [r for r in csv.DictReader(open(os.path.join(DATA, '01_laengenaenderung_messungen.csv'))) if r['laengenaenderung_m']]
cum = {int(r['jahr_ende']): float(r['kumuliert_seit_1878_m']) for r in rows}
dec = list(csv.DictReader(open(os.path.join(DATA, '02_laengenaenderung_dekaden.csv'))))
prof = list(csv.DictReader(open(os.path.join(DATA, '06_laengsprofil.csv'))))
klima = [r for r in csv.DictReader(open(os.path.join(DATA, '08_klima_samedan_homogen.csv'))) if r['abw_sommer_vs_1871_1900'] and int(r['jahr']) <= 2025]
vol = [r for r in csv.DictReader(open(os.path.join(DATA, '03_volumen_flaeche.csv'))) if r['gletscher'] == 'Vadret da Morteratsch']
hero = json.load(open(os.path.join(IMG, 'hero.json')))

FOOT = ('Daten: GLAMOS (Längenänderung r2025, Volumenänderung r2025, Gletscherinventare SGI 1850–2016) · MeteoSchweiz (NBCN Samedan, homogen)\n'
        '© swisstopo (SWISSIMAGE, swissALTI3D) · Stand: 29.10.2026 · Grafik: Südostschweiz/jr')

with PdfPages(OUT) as pdf:
    # =========================================================== SEITE 1
    fig = page()
    text_mm(fig, 15, 16, 'TERRA GRISCHUNA · SAGEN UND MYTHEN', fontsize=8, color=SUB, fontweight='semibold')
    text_mm(fig, 15, 30, 'Die Sage liess ihn wachsen.', fontsize=25, fontweight='bold', color=INK, fontfamily='Inter Display')
    text_mm(fig, 15, 41, 'Gemessen wird sein Rückzug.', fontsize=25, fontweight='bold', color=RED, fontfamily='Inter Display')
    text_mm(fig, 15, 50, 'Der Morteratschgletscher und seine Ränder von 1850 bis 2016, eingetragen auf das Luftbild von 2025.',
            fontsize=9.5, color=SUB)
    # Hero
    im = Image.open(os.path.join(IMG, 'hero.png')); W, H = im.size
    crop_top, crop_bot = int(H * 0.0), int(H * 0.78)
    im = im.crop((0, crop_top, W, crop_bot))
    hy, hh = 56, 210 * (crop_bot - crop_top) / W
    ax = ax_mm(fig, 0, hy, 210, hh); ax.imshow(im); ax.axis('off')
    sx = lambda p: p[0]; sy = lambda p: p[1] - crop_top
    # Jahresmarken an den Zungenspitzen
    offs = {'1850': (-260, -70), '1931': (-260, -10), '1973': (-300, -40), '2010': (300, -120), '2016': (-330, -150)}
    for y, p in hero['tips'].items():
        x0, y0 = sx(p), sy(p); dx, dy = offs[y]
        ax.annotate(y, (x0, y0), xytext=(x0 + dx, y0 + dy), fontsize=10, fontweight='bold', color=INK,
                    ha='center', va='center', bbox=dict(boxstyle='round,pad=0.25', fc=YCOL[y], ec='#333333', lw=0.6),
                    arrowprops=dict(arrowstyle='-', color='white', lw=1.2))
    places = {'Haltestelle Morteratsch (RhB)': ('Bahnhof Morteratsch', (320, 60)), 'Chamanna da Boval CAS': ('Bovalhütte', (-180, -60)),
              'Isla Persa': ('Isla Persa\n«verlorene Insel»', (-60, -170)), 'Munt Pers': ('Munt Pers\n«verlorener Berg»', (200, -120))}
    for k, (lab, (dx, dy)) in places.items():
        p = hero['orte'][k]; x0, y0 = sx(p), sy(p)
        if not (0 <= y0 <= crop_bot - crop_top): continue
        ax.plot([x0], [y0], 'o', ms=4.5, mfc=INK, mec='white', mew=1.2)
        ax.annotate(lab, (x0, y0), xytext=(x0 + dx, y0 + dy), fontsize=8.5, color=INK, ha='center', va='center', fontweight='semibold',
                    bbox=dict(boxstyle='round,pad=0.3', fc=(1, 1, 1, 0.85), ec='none'), arrowprops=dict(arrowstyle='-', color='white', lw=0.9))
    ax.set_xlim(0, W); ax.set_ylim(crop_bot - crop_top, 0)
    # Grosse Zahl
    yb = hy + hh + 8
    text_mm(fig, 15, yb + 15, '3059 m', fontsize=44, fontweight='bold', color=RED, fontfamily='Inter Display')
    text_mm(fig, 15, yb + 23, 'hat sich die Gletscherzunge seit Beginn der Messungen\n1878 zurückgezogen (Stand Oktober 2024).',
            fontsize=9.5, color=INK, va='top')
    # Legende Linien
    lx, ly = 112, yb + 2
    text_mm(fig, lx, ly + 3, 'Gletscherrand gemäss Inventar', fontsize=8.5, fontweight='bold', color=INK)
    POS = [('1850', '1850 (rekonstruiert)', 0, 0), ('1931', '1931', 44, 0), ('1973', '1973', 0, 1), ('2010', '2010', 22, 1), ('2016', '2016', 44, 1)]
    for y, lab, dx, row in POS:
        a = ax_mm(fig, lx + dx, ly + 6 + row * 6, 8, 3); a.axis('off'); a.set_xlim(0, 1); a.set_ylim(0, 1)
        a.plot([0, 1], [0.5, 0.5], color='#333333', lw=5, solid_capstyle='round'); a.plot([0, 1], [0.5, 0.5], color=YCOL[y], lw=3.2, solid_capstyle='round')
        text_mm(fig, lx + dx + 10, ly + 7.5 + row * 6, lab, fontsize=8, color=INK, va='center')
    # Sage-Kasten
    by = yb + 30
    fig.patches.append(FancyBboxPatch(((15) / PW, 1 - (by + 33) / PH), 180 / PW, 33 / PH, boxstyle='round,pad=0,rounding_size=0.01',
                                      transform=fig.transFigure, fc='#f3f3f3', ec='none'))
    text_mm(fig, 20, by + 7, 'Die Sage', fontsize=9.5, fontweight='bold', color=INK)
    text_mm(fig, 20, by + 10.5,
            'Der Senn Aratsch stirbt im Gletscher, der Geist seiner Geliebten Annetta klagt nachts «Mort Aratsch» – Aratsch ist tot.\n'
            'Nach einem Fluch stösst das Eis vor und begräbt die Alp. Geblieben sind Namen: Munt Pers («verlorener Berg»)\n'
            'und Isla Persa («verlorene Insel»). Um 1850 reichte das Eis tatsächlich bis vor den heutigen Bahnhof – seither\n'
            'zieht es sich zurück.', fontsize=8.3, color=INK, va='top', linespacing=1.45)
    text_mm(fig, 15, 289, FOOT, fontsize=5.8, color=SUB, va='top', linespacing=1.4)
    text_mm(fig, 15, 284.5, 'Sage nach Pontresina Tourismus; Fassungen weichen ab. Gletscherrand 1850 aus historischen Karten und Moränen rekonstruiert (Maisch et al. 2000).',
            fontsize=5.6, color=SUB)
    pdf.savefig(fig, dpi=300); plt.close(fig)

    # =========================================================== SEITE 2
    fig = page()
    text_mm(fig, 15, 18, '150 Jahre Rückzug in Zahlen', fontsize=20, fontweight='bold', color=INK, fontfamily='Inter Display')
    text_mm(fig, 15, 24.5, 'Jedes Jahr misst der Kanton, wie weit sich die Zunge zurückgezogen hat – seit 1878.', fontsize=9, color=SUB)

    # A: Barcode / Balken
    ax = ax_mm(fig, 15, 34, 180, 50)
    for r in rows:
        y0 = int(r['beginn'][:4]) + int(r['beginn'][5:7]) / 12; y1 = int(r['ende'][:4]) + int(r['ende'][5:7]) / 12
        v = float(r['laengenaenderung_m']); rate = v / (y1 - y0)
        col = OR if v > 0 else (BLUE if not r['hinweis'] else '#7fb3d5')
        ax.add_patch(Rectangle((y0, 0), (y1 - y0) * 0.86, rate, color=col, lw=0))
    ax.axvspan(1893.7, 1894.7, color='#dddddd', lw=0)
    ax.set_xlim(1877, 2025.5); ax.set_ylim(-192, 15); ax.axhline(0, color=INK, lw=0.6)
    ax.spines['bottom'].set_visible(False); ax.tick_params(labelsize=7, length=2, colors=SUB)
    ax.set_xticks(range(1880, 2030, 20)); ax.set_yticks([0, -50, -100, -150]); ax.set_yticklabels(['0', '−50', '−100', '−150 m'])
    ax.annotate('2014/15: −164 m', (2015, -160), xytext=(2008, -150), fontsize=7.5, ha='right', color=INK, arrowprops=dict(arrowstyle='-', color=SUB, lw=0.6))
    ax.text(1898, 7, 'kurze Vorstösse', fontsize=7, color=OR)
    ax.text(1894.9, -60, 'keine\nMessung\n1893/94', fontsize=6, color=SUB)
    for r in dec:
        d0 = int(r['dekade_nach_endjahr'][:4]); v = float(r['mittel_m_pro_jahr'])
        ax.text(min(d0 + 5, 2023), -186, f'{v:.0f}'.replace('-', '−'), fontsize=6.3, ha='center', color=SUB)
    ax.text(1877.5, -170, 'Ø m/Jahr je Jahrzehnt:', fontsize=6, color=SUB)
    ax.set_title('Rückzug pro Jahr', loc='left', fontsize=9.5, fontweight='bold', color=INK, pad=4)

    # B: Luftbildreihe
    text_mm(fig, 15, 92, 'Dieselbe Zunge aus der Luft', fontsize=9.5, fontweight='bold', color=INK)
    hs = json.load(open(os.path.join(IMG, 'hero.json')))
    for i, y in enumerate((1946, 1971, 1998, 2025)):
        a = ax_mm(fig, 15 + i * 45.5, 95, 43, 64.5); a.imshow(Image.open(os.path.join(IMG, f'am_{y}.png'))); a.axis('off')
        a.text(0.04, 0.97, str(y), transform=a.transAxes, fontsize=10, fontweight='bold', color='white', va='top',
               bbox=dict(boxstyle='round,pad=0.2', fc=(0, 0, 0, 0.45), ec='none'))
        # Bahnhof & Zungenspitze 1850 markieren (Bildausschnitt E 2790700–2793300, N 1143900–1147800, 2 m/px)
        for (E, N), mk, lab in (((2792185, 1147437), 's', 'Bahnhof'), ((2792358, 1147177), 'o', '1850')):
            px, py = (E - 2790700) / 2, (1147800 - N) / 2
            a.plot(px, py, mk, ms=4, mfc='white', mec=INK, mew=0.8)
            if i == 0: a.text(px + 40, py + 10 if mk == 'o' else py - 25, lab, fontsize=6.5, color='white', fontweight='semibold')
    text_mm(fig, 15, 162.5, 'Luftbilder SWISSIMAGE HIST 1946 und SWISSIMAGE Zeitreise 1971, 1998, 2025 (© swisstopo); Ausschnitt 2,6 × 3,9 km, Norden oben.',
            fontsize=6.3, color=SUB)

    # C: Wanderung durch die Zeit (Profil)
    ax = ax_mm(fig, 15, 172, 112, 52)
    s = np.array([float(r['distanz_m']) for r in prof]); h = np.array([float(r['hoehe_2023_m']) for r in prof])
    s1850 = [float(r['distanz_m']) for r in prof if r['zungenspitze_inventar'] == '1850'][0]
    st = s1850 + 310                                        # Haltestelle ~310 m talabwärts der Zungenspitze 1850 (Luftlinie)
    walk = (st - s) / 1000                                  # km ab Bahnhof
    m = (walk >= -0.05) & (walk <= 3.6)
    ax.fill_between(walk[m], h[m], 1850, color='#e8e8e8', lw=0); ax.plot(walk[m], h[m], color=INK, lw=1.1)
    ax.set_xlim(-0.05, 3.55); ax.set_ylim(1870, 2260)
    s2016 = [float(r['distanz_m']) for r in prof if r['zungenspitze_inventar'] == '2016'][0]
    marks = [(y, float(r['distanz_m'])) for r in prof for y in [r['zungenspitze_inventar']] if y] + [('≈2024*', s2016 - 410)]
    for y, sv in marks:
        x = (st - sv) / 1000; hv = np.interp(sv, s, h)
        ax.plot([x, x], [hv, hv + 95], color=YCOL.get(y, RED) if y in YCOL else RED, lw=2.2)
        ax.plot([x, x], [hv, hv + 95], color='#333333', lw=0.4)
        ax.text(x, hv + 102, y, fontsize=7.5, ha='center', fontweight='bold', color=INK)
    ax.plot(0, 1896, 's', ms=5, mfc=INK); ax.text(0.04, 1905, 'Bahnhof\nMorteratsch', fontsize=6.8, color=INK)
    ax.tick_params(labelsize=7, length=2, colors=SUB); ax.set_xlabel('Kilometer ab Bahnhof (entlang Talachse)', fontsize=7, color=SUB, labelpad=1)
    ax.set_yticks([1900, 2000, 2100, 2200]); ax.set_yticklabels(['1900', '2000', '2100', '2200 m'])
    ax.set_title('Wandern durch die Zeit', loc='left', fontsize=9.5, fontweight='bold', color=INK, pad=4)
    ax.text(0, 2235, 'Wo die Gletscherzunge jeweils endete', fontsize=7, color=SUB)
    text_mm(fig, 15, 236.5, '* Lage 2024 aus Inventar 2016 und Messreihe 2015–2024 (−410 m) geschätzt. Höhen: heutiges Gelände.',
            fontsize=6, color=SUB)

    # D: Eiswürfel
    ax = ax_mm(fig, 135, 172, 60, 52); ax.axis('off'); ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    c, d, o = 0.42, 0.18, (0.12, 0.08)
    front = [(o[0], o[1]), (o[0] + c, o[1]), (o[0] + c, o[1] + c), (o[0], o[1] + c)]
    top = [(o[0], o[1] + c), (o[0] + c, o[1] + c), (o[0] + c + d, o[1] + c + d), (o[0] + d, o[1] + c + d)]
    side = [(o[0] + c, o[1]), (o[0] + c + d, o[1] + d), (o[0] + c + d, o[1] + c + d), (o[0] + c, o[1] + c)]
    for pts, fc in ((front, '#cfe6f5'), (top, '#eaf5fc'), (side, '#9cc9e6')): ax.add_patch(Polygon(pts, fc=fc, ec='#5b8fb0', lw=0.8))
    ax.text(0, 0.98, '1,1 km³ Eis', fontsize=14, fontweight='bold', color=INK, va='top', fontfamily='Inter Display')
    ax.text(0, 0.84, 'verlor der Gletscher von 1850 bis 2015.\nAls Würfel: über 1 km Kantenlänge.', fontsize=7.3, color=INK, va='top')
    ax.text(o[0] + c / 2, o[1] - 0.06, '1038 m', fontsize=7.5, ha='center', color=SUB)
    ax.text(0.66, 0.12, 'Die Eisoberfläche sank\nim Mittel um 55 m.', fontsize=7, color=INK)

    # E: Sommerstreifen Samedan
    ax = ax_mm(fig, 15, 246, 180, 14)
    pal = matplotlib.colormaps['RdBu_r']
    for r in klima:
        v = float(r['abw_sommer_vs_1871_1900']); ax.add_patch(Rectangle((int(r['jahr']), 0), 1, 1, color=pal(np.clip(0.5 + v / 7, 0, 1)), lw=0))
    ax.set_xlim(1864, 2026); ax.set_ylim(0, 1); ax.axis('off')
    text_mm(fig, 15, 243.5, 'Sommer in Samedan, 1864–2025', fontsize=9.5, fontweight='bold', color=INK)
    text_mm(fig, 15, 264, '1864', fontsize=7, color=SUB); text_mm(fig, 189, 264, '2025', fontsize=7, color=SUB)
    text_mm(fig, 30, 264, 'Jeder Streifen ein Sommer (Juni–August): blau kühler, rot wärmer als 1871–1900. Mittel 2016–2025: +2,5 °C.',
            fontsize=7, color=SUB)

    # Fussnoten
    text_mm(fig, 15, 271.5, 'Hinweise: Längenänderung = Summe der jährlichen Messungen (AWN Graubünden/GLAMOS); 1893/94 fehlt. Mehrjährige Messperioden hellblau,\n'
            'als Mittel pro Jahr. Volumen 1850–2015 inkl. Vadret Pers (bis 2015 gemeinsam erfasst). Klima: zeitliche Parallele, kein Nachweis für den einzelnen Gletscher.',
            fontsize=6, color=SUB, va='top', linespacing=1.4)
    text_mm(fig, 15, 284.5, FOOT, fontsize=5.8, color=SUB, va='top', linespacing=1.4)
    pdf.savefig(fig, dpi=300); plt.close(fig)
print('ok', OUT)
