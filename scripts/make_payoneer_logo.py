"""Generate the Payoneer brand mark (multicolour gradient ring) as a
transparent PNG. Rendered at 4x and downsampled for smooth, anti-aliased edges.
Run: python3 scripts/make_payoneer_logo.py
"""
import math
from PIL import Image

SS = 4                      # supersample factor
SIZE = 240                  # final px (square)
S = SIZE * SS
cx = cy = S / 2
outer = S * 0.46
inner = S * 0.30            # ring thickness

# Conic colour stops sweeping around the ring (angle fraction -> RGB).
# Approximates the Payoneer rainbow ring: red -> orange -> yellow -> green
# -> teal -> blue -> purple -> back to red.
STOPS = [
    (0.00, (0xF5, 0x3B, 0x57)),  # red
    (0.14, (0xFF, 0x7A, 0x2F)),  # orange
    (0.28, (0xFF, 0xC4, 0x1F)),  # yellow
    (0.44, (0x69, 0xC8, 0x2E)),  # green
    (0.58, (0x1F, 0xC6, 0xC6)),  # teal
    (0.72, (0x2E, 0x8B, 0xF5)),  # blue
    (0.86, (0x8B, 0x4B, 0xE8)),  # purple
    (1.00, (0xF5, 0x3B, 0x57)),  # back to red
]


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def color_at(frac):
    frac %= 1.0
    for i in range(len(STOPS) - 1):
        f0, c0 = STOPS[i]
        f1, c1 = STOPS[i + 1]
        if f0 <= frac <= f1:
            t = (frac - f0) / (f1 - f0) if f1 > f0 else 0
            return lerp(c0, c1, t)
    return STOPS[-1][1]


img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
px = img.load()

for y in range(S):
    for x in range(S):
        dx = x - cx
        dy = y - cy
        r = math.hypot(dx, dy)
        if inner <= r <= outer:
            # angle: start at top (12 o'clock), sweep clockwise
            ang = math.atan2(dx, -dy)          # 0 at top, +ve clockwise
            frac = (ang / (2 * math.pi)) % 1.0
            px[x, y] = color_at(frac) + (255,)

img = img.resize((SIZE, SIZE), Image.LANCZOS)
out = "assets/payoneer.png"
img.save(out)
print("wrote", out, img.size)
