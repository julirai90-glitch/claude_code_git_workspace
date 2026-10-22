"""Automatic, rule-based extraction of water and building pixels from Zeitreise map rasters."""
import sys, numpy as np
from PIL import Image
from skimage import measure, morphology, color

def load(p): return np.asarray(Image.open(p).convert('RGB'), np.float32) / 255

def water_mask(rgb):
    hsv = color.rgb2hsv(rgb)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m = (h > 0.52) & (h < 0.68) & (s > 0.22) & (v > 0.35)
    m = morphology.binary_closing(m, morphology.disk(2))
    lab = measure.label(m)
    keep = np.zeros(lab.max() + 1, bool)
    for r in measure.regionprops(lab):
        bb = r.bbox; diag = np.hypot(bb[2] - bb[0], bb[3] - bb[1])
        if r.area > 2500 or diag > 400: keep[r.label] = True
    keep[0] = False
    return keep[lab]

def building_mask(rgb):
    hsv = color.rgb2hsv(rgb)
    dark = (hsv[..., 2] < 0.38) & (hsv[..., 1] < 0.45)
    lab = measure.label(dark)
    keep = np.zeros(lab.max() + 1, bool)
    for r in measure.regionprops(lab):
        if r.area < 40 or r.area > 6000: continue
        h = r.bbox[2] - r.bbox[0]; w = r.bbox[3] - r.bbox[1]
        if min(h, w) < 6: continue
        if r.solidity > 0.86 and r.extent > 0.55 and r.minor_axis_length > 5.5: keep[r.label] = True
    keep[0] = False
    return keep[lab]

if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]
    rgb = load(src)
    np.savez_compressed(out, water=water_mask(rgb), bld=building_mask(rgb))
