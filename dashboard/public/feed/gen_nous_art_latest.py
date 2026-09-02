#!/usr/bin/env python3
"""Generate NOUS NETWORK hero art — dated feed file."""
from PIL import Image, ImageDraw, ImageFont
import os, math, random, datetime

today = datetime.date.today().strftime("%Y%m%d")
W, H = 1024, 768
out = f"/Users/megan/.hermes/plugins/entertainment/dashboard/public/feed/nous-feed-{today}.png"

img = Image.new("RGBA", (W, H), (0, 0, 0, 255))

# SMPTE color bars
bars = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(bars)
bar_w = W // 7
colors = [(1,1,1),(1,1,0),(0,1,0),(0,1,1),(0,0,1),(1,0,1),(1,0,0)]
fractions = [1.0, 0.75, 0.667, 0.5, 0.375, 0.25, 0.125]
for i, (frac, col) in enumerate(zip(fractions, colors)):
    bh = int(H * frac)
    draw.rectangle([i*bar_w, 0, i*bar_w+bar_w, bh],
                   fill=(int(col[0]*255), int(col[1]*255), int(col[2]*255), 255))
img = Image.alpha_composite(img, bars)

# gradient darken
gradient = Image.new("RGBA", (W, H), (0,0,0,0))
gd = ImageDraw.Draw(gradient)
for y in range(H):
    t = y / H
    a = int(180 * (1 - abs(2*t - 1)))
    gd.rectangle([(0,y),(W,y+1)], fill=(0,0,0,a))
img = Image.alpha_composite(img, gradient)

# scanlines
sl = Image.new("RGBA", (W, H), (0,0,0,0))
sd = ImageDraw.Draw(sl)
for y in range(0, H, 4):
    sd.rectangle([(0,y),(W,y+1)], fill=(0,0,0,60))
img = Image.alpha_composite(img, sl)

# VHS grain
random.seed(42)
grain = Image.new("RGBA", (W, H), (0,0,0,0))
gd2 = ImageDraw.Draw(grain)
for _ in range(6000):
    x = random.randint(0, W-1)
    y = random.randint(0, H-1)
    v = random.randint(0, 40)
    gd2.point((x,y), fill=(v,v,v,v))
img = Image.alpha_composite(img, grain)

draw = ImageDraw.Draw(img)

def load_font(sz):
    for p in ["/System/Library/Fonts/Supplemental/Arial Black.ttf",
              "/System/Library/Fonts/Impact.ttf"]:
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            continue
    return ImageFont.load_default()

font_big = load_font(120)
font_small = load_font(62)

lines = ["NOUS", "NETWORK"]
lh = 135
y0 = (H - len(lines)*lh)//2 + 15

for i, line in enumerate(lines):
    f = font_big if i == 0 else font_small
    bb = draw.textbbox((0,0), line, font=f)
    tw = bb[2]-bb[0]
    tx = (W-tw)//2
    ty = y0 + i*lh
    # neon glow
    for off, alpha in [(6,70),(3,110),(1,170)]:
        layer = Image.new("RGBA",(W,H),(0,0,0,0))
        ld = ImageDraw.Draw(layer)
        ld.text((tx, ty+off), line, font=f, fill=(30,144,255,alpha))
        img = Image.alpha_composite(img, layer)
    draw.text((tx,ty), line, font=f, fill=(255,255,255,255))
    draw.text((tx-1,ty-1), line, font=f, fill=(255,215,0,110))

# ticker
ticker = "★  BROADCAST  ★  SIGNAL LIVE  ★"
ft = load_font(34)
bb = draw.textbbox((0,0), ticker, font=ft)
draw.text(((W-(bb[2]-bb[0]))//2, H-75), ticker, font=ft, fill=(0,255,100,210))

# vignette
vig = Image.new("RGBA",(W,H),(0,0,0,0))
for y in range(0,H,2):
    for x in range(0,W,2):
        dx=(x-W/2)/(W/2)
        dy=(y-H/2)/(H/2)
        d=math.sqrt(dx*dx+dy*dy)
        if d>0.65:
            a=int(min(220,(d-0.65)*700))
            vig.putpixel((x,y),(0,0,0,a))
img = Image.alpha_composite(img, vig)

img = img.convert("RGB")
img.save(out, "PNG")
print(f"Saved: {out}  bytes={os.path.getsize(out)}")
