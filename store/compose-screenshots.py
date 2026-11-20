#!/usr/bin/env python3
"""Compose App Store screenshots: headline above a floating, rounded device
capture on a brand gradient. Output is the 6.9-inch (1320x2868) set, which
App Store Connect scales down for every smaller iPhone.

    python3 store/compose-screenshots.py store/screenshots.json

Manifest (JSON):
{
  "output_dir": "fastlane/screenshots/en-GB",
  "background": ["#0B0A12", "#1A1230"],      # top -> bottom gradient
  "accent": "#B388FF",
  "shots": [
    {"raw": "path/to/raw.png", "out": "01_speak.png",
     "headline": "Speak your answer.\\nGet scored.",
     "subline": "Real feedback in seconds, no typing"}
  ]
}
Raw captures must be 1320x2868 (iPhone 17 Pro Max simulator). Fonts: Inter
variable from ~/Library/Fonts, falling back to Helvetica.
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1320, 2868
INTER = os.path.expanduser("~/Library/Fonts/Inter-VariableFont_opsz,wght.ttf")


def font(size: int, weight: int = 700) -> ImageFont.FreeTypeFont:
    try:
        f = ImageFont.truetype(INTER, size)
        try:
            f.set_variation_by_axes([size if size < 32 else 32, weight])
        except Exception:
            pass
        return f
    except OSError:
        return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)


def hex_rgb(h: str):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def gradient(top: str, bottom: str) -> Image.Image:
    t, b = hex_rgb(top), hex_rgb(bottom)
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        k = y / (H - 1)
        c = tuple(int(t[i] + (b[i] - t[i]) * k) for i in range(3))
        for x in range(W):
            px[x, y] = c
    return img


def rounded(img: Image.Image, radius: int) -> Image.Image:
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.width - 1, img.height - 1], radius=radius, fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def draw_centred(draw: ImageDraw.ImageDraw, text: str, y: int, f: ImageFont.FreeTypeFont, fill, line_gap: int = 12) -> int:
    for line in text.split("\n"):
        bbox = draw.textbbox((0, 0), line, font=f)
        w = bbox[2] - bbox[0]
        draw.text(((W - w) / 2 - bbox[0], y), line, font=f, fill=fill)
        y += (bbox[3] - bbox[1]) + line_gap
    return y


def compose(raw_path: str, headline: str, subline: str | None, bg: list[str], accent: str) -> Image.Image:
    canvas = gradient(bg[0], bg[1])
    draw = ImageDraw.Draw(canvas)

    # Headline block, top 22% of the frame.
    y = 200
    y = draw_centred(draw, headline, y, font(104, 800), (255, 255, 255), line_gap=8)
    if subline:
        y += 56
        y = draw_centred(draw, subline, y, font(46, 500), (200, 196, 214))

    # Device: raw capture scaled so it sits from ~30% down to below the bottom edge.
    raw = Image.open(raw_path).convert("RGB")
    if raw.size != (W, H):
        raw = raw.resize((W, H), Image.LANCZOS)
    scale = 0.82
    dw, dh = int(W * scale), int(H * scale)
    device = rounded(raw.resize((dw, dh), Image.LANCZOS), radius=int(150 * scale))
    x0 = (W - dw) // 2
    y0 = max(y + 120, int(H * 0.30))

    # Soft shadow + thin bezel.
    shadow = Image.new("RGBA", (dw + 200, dh + 200), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([100, 120, dw + 100, dh + 100], radius=int(150 * scale), fill=(0, 0, 0, 170))
    shadow = shadow.filter(ImageFilter.GaussianBlur(48))
    canvas.paste(shadow, (x0 - 100, y0 - 100), shadow)
    bezel = Image.new("RGBA", (dw + 28, dh + 28), (0, 0, 0, 0))
    ImageDraw.Draw(bezel).rounded_rectangle([0, 0, dw + 27, dh + 27], radius=int(164 * scale), fill=(28, 26, 36, 255))
    canvas.paste(bezel, (x0 - 14, y0 - 14), bezel)
    canvas.paste(device, (x0, y0), device)
    return canvas


def main() -> None:
    manifest = json.load(open(sys.argv[1]))
    out_dir = manifest["output_dir"]
    os.makedirs(out_dir, exist_ok=True)
    for shot in manifest["shots"]:
        img = compose(shot["raw"], shot["headline"], shot.get("subline"), manifest.get("background", ["#0B0A12", "#1A1230"]), manifest.get("accent", "#B388FF"))
        path = os.path.join(out_dir, shot["out"])
        img.save(path, optimize=True)
        print("wrote", path)


if __name__ == "__main__":
    main()
