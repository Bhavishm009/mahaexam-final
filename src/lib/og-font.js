import { openSync } from "fontkit";
import fs from "fs";
import path from "path";
import React from "react";

let cachedFontBuffer = null;
let cachedFontkitFont = null;

export async function getDevanagariOgFont() {
  if (cachedFontBuffer) {
    return cachedFontBuffer;
  }

  const fontCandidates = [
    "Mukta-Bold.ttf",
    "TiroDevanagariMarathi-Regular.ttf",
    "SakalMarathi-Normal.ttf",
  ];

  for (const candidate of fontCandidates) {
    try {
      const fontPath = path.join(process.cwd(), "public", "fonts", candidate);
      if (fs.existsSync(fontPath)) {
        const stats = await fs.promises.stat(fontPath);
        if (stats.size > 50000) {
          const buffer = await fs.promises.readFile(fontPath);
          cachedFontBuffer = buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength,
          );
          return cachedFontBuffer;
        }
      }
    } catch (e) {
      console.error(`Failed reading local ${candidate}:`, e);
    }
  }

  return null;
}

function getFontkitFont() {
  if (!cachedFontkitFont) {
    const fontCandidates = ["Baloo2-Bold.ttf", "Mukta-Bold.ttf", "SakalMarathi-Normal.ttf"];
    for (const candidate of fontCandidates) {
      const fontPath = path.join(process.cwd(), "public", "fonts", candidate);
      if (fs.existsSync(fontPath)) {
        cachedFontkitFont = openSync(fontPath);
        break;
      }
    }
  }
  return cachedFontkitFont;
}

const DEV_FEATURES = [
  "dev2",
  "deva",
  "akhn",
  "rphf",
  "rkrf",
  "cjct",
  "half",
  "blwf",
  "pres",
  "abvs",
  "blws",
  "psts",
  "haln",
  "liga",
  "rlig",
  "dlig",
];

export function ShapedText({ text = "", fontSize = 32, fill = "#ffffff", style = {} }) {
  if (!text) return null;

  const font = getFontkitFont();
  if (!font) {
    return React.createElement("span", { style: { fontSize, color: fill, ...style } }, text);
  }

  const run = font.layout(String(text), DEV_FEATURES);
  const scale = fontSize / font.unitsPerEm;
  const fontAscent = font.ascent || 1000;
  const yBaseline = fontAscent * scale;

  let xCursor = 0;
  const paths = [];

  for (let i = 0; i < run.glyphs.length; i++) {
    const g = run.glyphs[i];
    const pos = run.positions[i];
    const gx = (xCursor + pos.xOffset) * scale;
    const gy = yBaseline - pos.yOffset * scale;
    const svgPath = g.path ? g.path.toSVG() : "";

    if (svgPath) {
      paths.push(
        React.createElement("path", {
          key: i,
          d: svgPath,
          transform: `translate(${gx.toFixed(2)},${gy.toFixed(2)}) scale(${scale},-${scale})`,
        }),
      );
    }
    xCursor += pos.xAdvance;
  }

  const totalWidth = Math.ceil(xCursor * scale);
  const totalHeight = Math.ceil((font.ascent - font.descent) * scale);

  return React.createElement(
    "svg",
    {
      width: totalWidth,
      height: totalHeight,
      viewBox: `0 0 ${totalWidth} ${totalHeight}`,
      style: {
        display: "flex",
        flexShrink: 0,
        overflow: "visible",
        ...style,
      },
    },
    React.createElement("g", { fill }, paths),
  );
}
