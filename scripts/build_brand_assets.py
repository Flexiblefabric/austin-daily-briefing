#!/usr/bin/env python3
"""Build email-safe ADB logo assets with outlined glyphs and PNG fallbacks."""

from __future__ import annotations

import argparse
from pathlib import Path
from xml.sax.saxutils import escape

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont


PAPER = "#fffefa"
CHARCOAL = "#181818"
RED = "#db2d2d"


def glyph_runs(text: str, font_path: Path, size: float, x: float, baseline: float,
               letter_spacing: float) -> tuple[list[str], float]:
    """Return SVG path groups positioned with FreeType-compatible advances."""
    ttfont = TTFont(font_path)
    glyph_set = ttfont.getGlyphSet()
    cmap = ttfont.getBestCmap()
    units_per_em = ttfont["head"].unitsPerEm
    scale = size / units_per_em
    pil_font = ImageFont.truetype(str(font_path), round(size))
    groups: list[str] = []

    for index, char in enumerate(text):
        glyph_name = cmap[ord(char)]
        pen = SVGPathPen(glyph_set)
        glyph_set[glyph_name].draw(pen)
        path = pen.getCommands()
        offset = pil_font.getlength(text[:index]) + letter_spacing * index
        groups.append(
            f'<g transform="translate({x + offset:.3f} {baseline:.3f}) '
            f'scale({scale:.7f} {-scale:.7f})"><path d="{escape(path)}"/></g>'
        )

    width = pil_font.getlength(text) + letter_spacing * max(0, len(text) - 1)
    return groups, width


def draw_spaced(draw: ImageDraw.ImageDraw, xy: tuple[float, float], text: str,
                font: ImageFont.FreeTypeFont, fill: str, spacing: float,
                anchor: str = "ls") -> float:
    x, y = xy
    for index, char in enumerate(text):
        draw.text((x, y), char, font=font, fill=fill, anchor=anchor)
        x += font.getlength(text[index:index + 1])
        if index + 1 < len(text):
            pair = font.getlength(text[index:index + 2])
            x += pair - font.getlength(text[index:index + 1]) - font.getlength(text[index + 1:index + 2])
            x += spacing
    return x


def write_masthead(newsreader: Path, plex: Path, output_dir: Path) -> None:
    austin, _ = glyph_runs("AUSTIN", newsreader, 154, 18, 164, -8)
    daily, _ = glyph_runs("DAILY", plex, 62, 590, 99, 2)
    briefing, briefing_width = glyph_runs("BRIEFING", plex, 62, 590, 164, 2)
    period, _ = glyph_runs(".", plex, 62, 590 + briefing_width, 164, 0)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="220" viewBox="0 0 900 220" role="img" aria-labelledby="title desc">
  <title id="title">Austin Daily Briefing</title>
  <desc id="desc">Austin in a modern editorial serif, separated by a red vertical rule from Daily Briefing stacked in a condensed sans serif.</desc>
  <rect width="900" height="220" fill="{PAPER}"/>
  <g fill="{CHARCOAL}">{''.join(austin)}</g>
  <rect x="566" y="40" width="5" height="140" fill="{RED}"/>
  <g fill="{CHARCOAL}">{''.join(daily)}{''.join(briefing)}</g>
  <g fill="{RED}">{''.join(period)}</g>
</svg>
'''
    (output_dir / "adb-masthead-outlined.svg").write_text(svg, encoding="utf-8")

    scale = 2
    image = Image.new("RGB", (900 * scale, 220 * scale), PAPER)
    draw = ImageDraw.Draw(image)
    news_font = ImageFont.truetype(str(newsreader), 154 * scale)
    plex_font = ImageFont.truetype(str(plex), 62 * scale)
    draw_spaced(draw, (18 * scale, 164 * scale), "AUSTIN", news_font, CHARCOAL, -8 * scale)
    draw.rectangle((566 * scale, 40 * scale, 571 * scale, 180 * scale), fill=RED)
    draw_spaced(draw, (590 * scale, 99 * scale), "DAILY", plex_font, CHARCOAL, 2 * scale)
    end = draw_spaced(draw, (590 * scale, 164 * scale), "BRIEFING", plex_font, CHARCOAL, 2 * scale)
    draw.text((end, 164 * scale), ".", font=plex_font, fill=RED, anchor="ls")
    image.resize((900, 220), Image.Resampling.LANCZOS).save(output_dir / "adb-masthead.png", optimize=True)


def write_mark(newsreader: Path, output_dir: Path) -> None:
    _, width = glyph_runs("ADB", newsreader, 86, 0, 143, -4)
    mark, _ = glyph_runs("ADB", newsreader, 86, 128 - width / 2, 143, -4)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">ADB</title>
  <desc id="desc">The letters ADB in Newsreader inside a charcoal circle with a red underline.</desc>
  <circle cx="128" cy="128" r="122" fill="{CHARCOAL}"/>
  <g fill="{PAPER}">{''.join(mark)}</g>
  <rect x="74" y="166" width="108" height="8" fill="{RED}"/>
</svg>
'''
    (output_dir / "adb-mark-outlined.svg").write_text(svg, encoding="utf-8")

    scale = 3
    image = Image.new("RGBA", (256 * scale, 256 * scale), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)
    draw.ellipse((6 * scale, 6 * scale, 250 * scale, 250 * scale), fill=CHARCOAL)
    font = ImageFont.truetype(str(newsreader), 86 * scale)
    text_width = font.getlength("ADB") - 4 * scale * 2
    draw_spaced(draw, ((128 * scale) - text_width / 2, 143 * scale), "ADB", font, PAPER, -4 * scale)
    draw.rectangle((74 * scale, 166 * scale, 182 * scale, 174 * scale), fill=RED)
    image.resize((256, 256), Image.Resampling.LANCZOS).save(output_dir / "adb-mark.png", optimize=True)

    reversed_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">ADB</title>
  <desc id="desc">The letters ADB in Newsreader inside a white circular outline with a red underline.</desc>
  <circle cx="128" cy="128" r="118" fill="none" stroke="{PAPER}" stroke-width="8"/>
  <g fill="{PAPER}">{''.join(mark)}</g>
  <rect x="74" y="166" width="108" height="8" fill="{RED}"/>
</svg>
'''
    (output_dir / "adb-mark-reversed-outlined.svg").write_text(reversed_svg, encoding="utf-8")

    reversed_image = Image.new("RGBA", (256 * scale, 256 * scale), (255, 255, 255, 0))
    reversed_draw = ImageDraw.Draw(reversed_image)
    reversed_draw.ellipse(
        (10 * scale, 10 * scale, 246 * scale, 246 * scale),
        outline=PAPER,
        width=8 * scale,
    )
    draw_spaced(reversed_draw, ((128 * scale) - text_width / 2, 143 * scale), "ADB", font, PAPER, -4 * scale)
    reversed_draw.rectangle((74 * scale, 166 * scale, 182 * scale, 174 * scale), fill=RED)
    reversed_image.resize((256, 256), Image.Resampling.LANCZOS).save(
        output_dir / "adb-mark-reversed.png", optimize=True
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--newsreader", type=Path, required=True)
    parser.add_argument("--plex", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    write_masthead(args.newsreader, args.plex, args.output_dir)
    write_mark(args.newsreader, args.output_dir)


if __name__ == "__main__":
    main()
