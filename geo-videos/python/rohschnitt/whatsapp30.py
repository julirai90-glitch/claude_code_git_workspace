"""WhatsApp-Status 30 s, 720x1280, ohne Ton: Nachbau des Descript-Rohschnitts «Rohschnitt 60s» ohne Wasserzeichen.
Untertitel in Klavika (TG_FONTS), roter Strich #CC0000 darüber. Medien liegen ausserhalb des Repos.
usage: GEO=~/geo TG_FONTS=~/geo/fonts python3 whatsapp30.py"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFilter, ImageFont

GEO = os.path.expanduser(os.environ.get('GEO', '~/geo')); T = os.environ['TG_FONTS']
F, V, O = f'{GEO}/auswahl/fotos', f'{GEO}/auswahl/videos', f'{GEO}/wa/build'
os.makedirs(O, exist_ok=True)
W, H, FPS = 720, 1280, 30
FM = ImageFont.truetype(f'{T}/Klavika-Medium.otf', 38); FS = ImageFont.truetype(f'{T}/Klavika-Regular.otf', 26)

# (quelle, start, dauer, untertitel); Quelle: Video (vNN) oder Foto (fNN mit Schwenk)
SEQ = [('v08', 4.5, 3.5, 'Morteratschgletscher\nOktober 2026'),
       ('v01', 1.0, 3.4, 'Der Weg beginnt am\nBahnhof Morteratsch, Pontresina'),
       ('v02', 4.5, 2.8, '… und führt durch den Herbst'),
       ('f04', 0, 3.4, 'Hier lag früher Eis'),
       ('v05', 1.5, 3.6, 'Seit 1878 ist die Gletscherzunge\nrund 3 km zurückgewichen'),     # GLAMOS: −3059 m (1878–2024)
       ('v06', 0.0, 3.6, 'Allein seit 2000 mehr als 1 km'),                               # GLAMOS: −1060 m (2000–2024)
       ('v03', 2.0, 2.0, None),
       ('v09', 1.0, 2.0, None),
       ('f20', 0, 1.8, None),
       ('v10', 7.0, 3.9, 'Die Wanderreportage\nab Dezember in der\nTerra Grischuna|www.terragrischuna.ch')]

def caption(txt, path):
    # 'Haupttext|Zusatzzeile': Zusatzzeile kleiner darunter (z.B. URL)
    main, _, sub = txt.partition('|')
    rows = [(l, FM) for l in main.split('\n')] + ([(sub, FS)] if sub else [])
    y = int(H * 0.68) if not sub else int(H * 0.58)
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    d.rectangle((W / 2 - 22, y - 26, W / 2 + 22, y - 20), fill=(204, 0, 0, 255))
    pos = []; yy = y
    for l, font in rows:
        if font is FS: yy += 16
        pos.append((l, font, yy)); yy += font.size * 1.25
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
    for l, font, yy in pos: ds.text((W / 2 + 2, yy + 2), l, font=font, fill=(0, 0, 0, 200), anchor='ma')
    L = Image.alpha_composite(sh.filter(ImageFilter.GaussianBlur(4)), L); d = ImageDraw.Draw(L)
    for l, font, yy in pos: d.text((W / 2, yy), l, font=font, fill=(255, 255, 255, 255), anchor='ma')
    L.save(path)

parts = []
for n, (src, ss, dur, txt) in enumerate(SEQ):
    out = f'{O}/{n:02d}.mp4'
    if src[0] == 'v':
        inp = ['-ss', str(ss), '-t', str(dur), '-i', f'{V}/{src[1:]}.mp4']
        base = f'scale={W}:{H},setsar=1'
    else:
        inp = ['-loop', '1', '-t', str(dur), '-i', f'{F}/{src[1:]}.jpg']
        base = f"scale=-2:{H},crop={W}:{H}:x='(iw-{W})/2-60+120*t/{dur}':y=0,setsar=1"   # Querformat, leichter Schwenk
    fc = f'[0:v]{base},fps={FPS}[b]'
    if txt:
        cp = f'{O}/{n:02d}_cap.png'; caption(txt, cp)
        inp += ['-loop', '1', '-t', str(dur), '-i', cp]
        fc += f";[1:v]format=rgba,fade=in:st=0.2:d=0.3:alpha=1,fade=out:st={dur - 0.35}:d=0.3:alpha=1[c];[b][c]overlay[b]"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', fc, '-map', '[b]', '-an', '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '18', '-r', str(FPS), out], check=True)
    parts.append(out)
open(f'{O}/concat.txt', 'w').write(''.join(f"file '{p}'\n" for p in parts))
# WhatsApp-Status: max. 10 MB -> 2-Pass mit ~2,4 Mbit/s (30 s ≈ 9 MB)
dst = f'{GEO}/wa/morteratsch_whatsapp_30s.mp4'
enc = ['-an', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-b:v', '2400k', '-maxrate', '2800k', '-bufsize', '4800k',
       '-pix_fmt', 'yuv420p', '-passlogfile', f'{O}/pass']
src = ['-f', 'concat', '-safe', '0', '-i', f'{O}/concat.txt']
subprocess.run(['ffmpeg', '-v', 'error', '-y', *src, *enc, '-pass', '1', '-f', 'mp4', os.devnull], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', *src, *enc, '-pass', '2', '-movflags', '+faststart', dst], check=True)
print(dst, os.path.getsize(dst))
