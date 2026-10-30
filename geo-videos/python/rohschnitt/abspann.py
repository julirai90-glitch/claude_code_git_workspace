# Abspann für den Rohschnitt (1080x1920), TG-Schriften aus $TG_FONTS (lizenziert, nicht im Repo)
# usage: TG_FONTS=~/geo/fonts python3 abspann.py <ausgabe.png>
import os, sys; from PIL import Image, ImageDraw, ImageFont
T = os.environ['TG_FONTS']
f = lambda n, s: ImageFont.truetype(os.path.join(T, n + '.otf'), s)
H, R, M = f('StoneSerifStd-Semibold', 60), f('Klavika-Regular', 30), f('Klavika-Medium', 32)
im = Image.new('RGB', (1080, 1920), (245, 245, 242)); d = ImageDraw.Draw(im)
y = 285 + 40
d.text((70, y), 'Morteratschgletscher', font=H, fill=(28, 32, 38)); y += 120
for head, lines in [('Bilder', ['Fotos und Videos: Julian Reich, 28.10.2026']),
                    ('Daten', ['Luftbilder: © swisstopo (SWISSIMAGE HIST 1946,', 'SWISSIMAGE Zeitreise, SWISSIMAGE 2025)',
                               'Gelände: swissALTI3D, Stand 2023', 'Längenänderung: GLAMOS (2025)', 'Ausdehnung 1850: Inventar SGI 1850',
                               'Stand: 30.10.2026']),
                    ('Hinweis', ['Gletschertore und Eishöhlen können', 'jederzeit einstürzen.'])]:
    d.text((70, y), head, font=M, fill=(28, 32, 38)); y += 50
    for l in lines: d.text((70, y), l, font=R, fill=(55, 60, 68)); y += 42
    y += 30
d.text((70, 1635 - 70), 'Grafik: Julian Reich', font=M, fill=(28, 32, 38))
im.save(sys.argv[1])
