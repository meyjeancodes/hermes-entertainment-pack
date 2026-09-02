#!/usr/bin/env python3
"""Generate NOUS NETWORK hero art with PIL — retro 1980s broadcast promo card."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math, random

W, H = 1024, 768  # 4:3
out = "/Users/megan/.hermes/plugins/entertainment/dashboard/public/feed/nous-feed-20260823.png"

# ── 1. SMPTE color bars background ──────────────────────────────────────────
img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
bars = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(bars)

# SMPTE bars: 7 columns, heights 1, 2/3, 1/2, 1/3, 1/4 of height
bar_w = W // 7
colors = [
    (1.0, 1.0, 1.0),  # white
    (1.0, 1.0, 0.0),  # yellow
    (0.0, 1.0, 0.0),  # green
    (0.0, 1.0, 1.0),  # cyan
    (0.0, 0.0, 1.0),  # blue
    (1.0, 0.0, 1.0),  # magenta
    (1.0, 0.0, 0.0),  # red
]
fractions = [1.0, 0.75, 0.667, 0.5, 0.375, 0.25, 0.125]
for i, (frac, col) in enumerate(zip(fractions, colors)):
    bh = int(H * frac)
    x0 = i * bar_w
    draw.rectangle([x0, 0, x0 + bar_w, bh], fill=(int(col[0]*255), int(col[1]*255), int(col[2]*255), 255))

# gradient overlay to darken edges
gradient = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gdraw = ImageDraw.Draw(gradient)
for y in range(H):
    t = y / H
    a = int(180 * (1 - abs(2 * t - 1)))  # darken top + bottom
    gdraw.rectangle([(0, y), (W, y + 1)], fill=(0, 0, 0, a))
bars = Image.alpha_composite(bars, gradient)

# ── 2. Scanlines ─────────────────────────────────────────────────────────────
scanlines = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sdraw = ImageDraw.Draw(scanlines)
for y in range(0, H, 4):
    sdraw.rectangle([(0, y), (W, y + 1)], fill=(0, 0, 0, 50))
bars = Image.alpha_composite(bars, scanlines)

# ── 3. VHS grain ─────────────────────────────────────────────────────────────
random.seed(42)
grain = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gdraw = ImageDraw.Draw(grain)
for _ in range(6000):
    x = random.randint(0, W - 1)
    y = random.randint(0, H - 1)
    v = random.randint(0, 40)
    gdraw.point((x, y), fill=(v, v, v, v))
bars = Image.alpha_composite(bars, grain)

# ── 4. Title: "NOUS NETWORK" in chrome/neon ────────────────────────────────
img = Image.alpha_composite(img, bars)

draw = ImageDraw.Draw(img)

# Try chrome font, fall back to Arial Black / Impact
def load_font(size, names):
    for n in names:
        try:
            return ImageFont.truetype(n, size)
        except Exception:
            continue
    return ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Black.ttf", size)

font_titles = [
    "/System/Library/Fonts/Supplemental/Arial Black.ttf",
    "/System/Library/Fonts/Impact.ttf",
    "/Library/Fonts/Arial Black.ttf",
]

# "NOUS NETWORK" — two lines, centered
font_big = load_font(120, font_titles)
font_small = load_font(60, font_titles)

# Chrome effect: white base + blue/gold highlight
title_lines = ["NOUS", "NETWORK"]
line_h = 130
total_h = len(title_lines) * line_h
y_start = (H - total_h) // 2 + 10

for idx, line in enumerate(title_lines):
    y = y_start + idx * line_h
    # measure
    bb = draw.textbbox((0, 0), line, font=font_big if idx == 0 else font_small)
    tw = bb[2] - bb[0]
    tx = (W - tw) // 2
    ty = y

    # neon glow (blue) under white
    for offset, alpha in [(5, 80), (3, 120), (1, 180)]:
        glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow_layer)
        gd.text((tx, ty + offset), line,
                font=font_big if idx == 0 else font_small,
                fill=(30, 144, 255, alpha))
        img = Image.alpha_composite(img, glow_layer)

    # white main text
    draw.text((tx, ty), line, font=font_big if idx == 0 else font_small,
              fill=(255, 255, 255, 255))

    # gold/cyan edge highlight top
    draw.text((tx - 1, ty - 1), line, font=font_big if idx == 0 else font_small,
              fill=(255, 215, 0, 100))

# ── 5. "BROADCAST" ticker at bottom ─────────────────────────────────────────
ticker = "★  BROADCAST  ★  SIGNAL LIVE  ★"
font_tick = load_font(36, font_titles)
bb = draw.textbbox((0, 0), ticker, font=font_tick)
tw = bb[2] - bb[0]
tx = (W - tw) // 2
ty = H - 80
draw.text((tx, ty), ticker, font=font_tick, fill=(0, 255, 100, 200))

# ── 6. Vignette ──────────────────────────────────────────────────────────────
vig = Image.new("RGBA", (W, H), (0, 0, 0, 0))
vd = ImageDraw.Draw(vig)
for y in range(H):
    for x in range(W):
        dx = (x - W / 2) / (W / 2)
        dy = (y - H / 2) / (H / 2)
        d = math.sqrt(dx * dx + dy * dy)
        if d > 0.7:
            a = int(min(200, (d - 0.7) * 600))
            vig.putpixel((x, y), (0, 0, 0, a))
img = Image.alpha_composite(img, vig)

# ── 7. Save ──────────────────────────────────────────────────────────────────
img = img.convert("RGB")
img.save(out, "PNG")
print(f"Saved: {out}  size={os.path.getsize(out)} bytes")
