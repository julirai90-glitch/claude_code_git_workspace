"""Synthetische Papier-Geräusche zum Video (keine Fremd-Samples, keine Lizenzfragen).
python3 sfx.py events.json out.wav
"""
import json, sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
ev = json.load(open(sys.argv[1]))
dur = ev['dur'] + 0.5
out = np.zeros((int(dur * SR), 2))
rng = np.random.default_rng(5)

def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype='band', fs=SR, output='sos'), x)

def place(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR); n = min(len(sig), len(out) - i)
    if n <= 0: return
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    out[i:i + n, 0] += sig[:n] * l * gain
    out[i:i + n, 1] += sig[:n] * r * gain

def page_turn(d, k):
    n = int((d + 0.25) * SR); tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # Luftzug: breitbandig, Hüllkurve mit Maximum bei ~45 % der Drehung
    u = np.clip(tt / d, 0, 1.2)
    env = np.exp(-((u - 0.45) / 0.22) ** 2)
    swish = bp(noise, 900, 7000) * env * 0.35
    # Papierknistern: kurze Impulse, dichter beim Anheben
    crk = np.zeros(n)
    for _ in range(int(14 + 8 * rng.random())):
        c = int(rng.uniform(0, 0.55) * d * SR)
        L = int(SR * rng.uniform(0.002, 0.008))
        if c + L < n: crk[c:c + L] += rng.standard_normal(L) * np.hanning(L) * rng.uniform(0.3, 1)
    crk = bp(crk, 2000, 9000) * 0.5
    # Aufliegen: dumpfer Klapp
    land = np.zeros(n); c = int(d * 0.97 * SR); L = int(0.06 * SR)
    if c + L < n:
        land[c:c + L] = rng.standard_normal(L) * np.exp(-np.linspace(0, 7, L))
    land = bp(land, 150, 1800) * 0.9
    return swish + crk + land

for i, f in enumerate(ev['flips']):
    place(page_turn(f['dur'], i), f['t'], pan=0.25 - 0.5 * ((i * 7) % 5) / 4, gain=0.8 + 0.2 * rng.random())

def whoosh(L=1.0):
    n = int(L * SR); tt = np.linspace(0, 1, n)
    x = rng.standard_normal(n)
    lo = bp(x, 120, 900) * np.sin(np.pi * tt) ** 2
    return lo * 0.5

for t in ev['pops']:
    place(whoosh(1.1), t, gain=0.7)

# Schlusston-Akzent: weiches Rauschen beim Endtitel
place(whoosh(1.6), ev['T']['s14'] + 0.6, gain=0.6)

peak = np.max(np.abs(out)) + 1e-9
out = out / peak * 0.7
# sanfter Fade-out
fo = int(0.8 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
wavfile.write(sys.argv[2], SR, (out * 32767).astype(np.int16))
print('ok', len(ev['flips']), 'flips')
