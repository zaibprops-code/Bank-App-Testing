"""Normalize bank logos in assets/banks/ to a uniform, RN-friendly format:
- convert to straight RGBA PNG (removes palette-mode / JPEG quirks)
- trim surrounding white/transparent margin so the mark fills the slot
- cap the longest side at 220px
Run: python3 scripts/normalize_bank_logos.py
"""
import os
import glob
from PIL import Image

SRC = "assets/banks"
MAX = 220
PAD = 6  # px of transparent padding kept around the trimmed mark


def content_bbox(im):
    """Bounding box of non-white, non-transparent pixels."""
    px = im.load()
    w, h = im.size
    left, top, right, bottom = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 12 and not (r > 244 and g > 244 and b > 244):
                found = True
                left = min(left, x); right = max(right, x)
                top = min(top, y); bottom = max(bottom, y)
    if not found:
        return None
    return (left, top, right + 1, bottom + 1)


for path in sorted(glob.glob(os.path.join(SRC, "*"))):
    im = Image.open(path).convert("RGBA")
    bbox = content_bbox(im)
    if bbox:
        im = im.crop(bbox)
    # pad on a transparent canvas
    w, h = im.size
    canvas = Image.new("RGBA", (w + 2 * PAD, h + 2 * PAD), (0, 0, 0, 0))
    canvas.paste(im, (PAD, PAD), im)
    im = canvas
    # cap size
    w, h = im.size
    scale = min(1.0, MAX / max(w, h))
    if scale < 1.0:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    out = os.path.splitext(path)[0] + ".png"
    im.save(out)
    if out != path:
        os.remove(path)
    print("normalized", os.path.basename(out), im.size)
