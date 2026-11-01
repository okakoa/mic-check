"""Regenerates icon-192.png, icon-512.png and og-image.png in /public.
Usage:  python scripts/make-images.py   (needs Pillow: pip install pillow)
The OG image is for social previews only; every fact also exists as page text."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

PUB = Path(__file__).resolve().parent.parent / "public"
BLUE, WHITE, DARK, GREEN = (26, 79, 214), (255, 255, 255), (15, 20, 25), (79, 209, 139)


def mic(draw, cx, cy, s, color, width):
    """Draw a microphone centered at (cx, cy); s = overall height."""
    bw, bh = s * 0.30, s * 0.52
    top = cy - s * 0.5
    draw.rounded_rectangle([cx - bw / 2, top, cx + bw / 2, top + bh], radius=bw / 2, fill=color)
    r = s * 0.28
    arc_cy = top + bh * 0.62
    draw.arc([cx - r, arc_cy - r, cx + r, arc_cy + r], start=0, end=180, fill=color, width=width)
    stem_top = arc_cy + r
    draw.line([cx, stem_top, cx, top + s * 0.94], fill=color, width=width)
    draw.line([cx - s * 0.16, top + s * 0.96, cx + s * 0.16, top + s * 0.96], fill=color, width=width)


def icon(size):
    scale = 4
    big = size * scale
    img = Image.new("RGBA", (big, big), BLUE + (255,))
    d = ImageDraw.Draw(img)
    # maskable-safe: keep the glyph within the central 60%
    mic(d, big / 2, big / 2, big * 0.56, WHITE, max(2, int(big * 0.055)))
    img.resize((size, size), Image.LANCZOS).save(PUB / f"icon-{size}.png", optimize=True)


def font(size, bold=True):
    for name in (["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"] if bold
                 else ["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"]):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), DARK)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([80, 165, 380, 465], radius=60, fill=BLUE)
    mic(d, 230, 315, 190, WHITE, 16)
    d.text((440, 190), "Mic Test", font=font(96), fill=WHITE)
    d.text((440, 310), "Is your microphone working?", font=font(46, False), fill=(200, 208, 218))
    d.text((440, 375), "One button. One answer. Audio stays on your device.", font=font(30, False), fill=(160, 170, 182))
    # decorative level bars
    for i, h in enumerate([30, 60, 95, 70, 120, 85, 50, 100, 65, 35, 80, 45]):
        x = 440 + i * 30
        d.rounded_rectangle([x, 520 - h / 2, x + 16, 520 + h / 2], radius=8, fill=GREEN)
    img.save(PUB / "og-image.png", optimize=True)


if __name__ == "__main__":
    icon(192)
    icon(512)
    og()
    print("Wrote icon-192.png, icon-512.png, og-image.png to", PUB)

