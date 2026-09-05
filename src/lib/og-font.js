import fs from "fs";
import path from "path";

let cachedFontBuffer = null;

export async function getDevanagariOgFont() {
  if (cachedFontBuffer) {
    return cachedFontBuffer;
  }

  try {
    const fontPath = path.join(process.cwd(), "public", "fonts", "NotoSansDevanagari-Bold.ttf");
    if (fs.existsSync(fontPath)) {
      const buffer = await fs.promises.readFile(fontPath);
      cachedFontBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      return cachedFontBuffer;
    }
  } catch (e) {
    console.error("Failed reading local NotoSansDevanagari-Bold.ttf:", e);
  }

  try {
    const res = await fetch(
      "https://fonts.gstatic.com/s/notosansdevanagari/v30/TuGoUUFzXI5FBtUq5a8bjKYTZjtRU6Sgv3NaV_SNmI0b8QQCQmHn6B2OHjbL_08Alaoiy-A.ttf"
    );
    cachedFontBuffer = await res.arrayBuffer();
    return cachedFontBuffer;
  } catch (err) {
    console.error("Failed fetching Devanagari TTF for OG image:", err);
    return null;
  }
}
