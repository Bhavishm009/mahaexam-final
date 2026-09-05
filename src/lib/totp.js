import crypto from "crypto";
import QRCode from "qrcode";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Convert Buffer to RFC 4648 Base32 string
 */
export function bufferToBase32(buf) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Convert RFC 4648 Base32 string to Buffer
 */
export function base32ToBuffer(base32Str) {
  const clean = base32Str.toUpperCase().replace(/=+$/, "").replace(/[\s-]/g, "");
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate cryptographically secure Base32 secret for TOTP (160 bits = 20 bytes = 32 chars)
 */
export function generateTotpSecret(bytes = 20) {
  const randomBytes = crypto.randomBytes(bytes);
  return bufferToBase32(randomBytes);
}

/**
 * Generate 6-digit TOTP token for given secret and timestamp
 */
export function generateTotpToken(secret, timeStep = 30, digits = 6, timestamp = Date.now()) {
  const keyBuffer = base32ToBuffer(secret);
  const epochSeconds = Math.floor(timestamp / 1000);
  const counter = Math.floor(epochSeconds / timeStep);

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac("sha1", keyBuffer);
  hmac.update(counterBuffer);
  const hmacResult = hmac.digest();

  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const code =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  const mod = Math.pow(10, digits);
  return (code % mod).toString().padStart(digits, "0");
}

/**
 * Verify TOTP token with ±window (default 1 = ±30 seconds tolerance)
 */
export function verifyTotpToken(secret, token, window = 1, timestamp = Date.now()) {
  if (!secret || !token) return false;
  const cleanToken = token.toString().trim();
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

  const keyBuffer = base32ToBuffer(secret);
  if (keyBuffer.length === 0) return false;

  const epochSeconds = Math.floor(timestamp / 1000);
  const currentCounter = Math.floor(epochSeconds / 30);

  for (let i = -window; i <= window; i++) {
    const counter = currentCounter + i;
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter), 0);

    const hmac = crypto.createHmac("sha1", keyBuffer);
    hmac.update(counterBuffer);
    const hmacResult = hmac.digest();

    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const code =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    const expectedToken = (code % 1000000).toString().padStart(6, "0");
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(expectedToken))) {
      return true;
    }
  }

  return false;
}

/**
 * Generate standard otpauth:// URI for Authenticator apps
 */
export function generateTotpUri(secret, accountEmail, issuer = "MahaExam") {
  const cleanEmail = (accountEmail || "user").trim();
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(cleanEmail)}`;
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate random 8 one-time backup recovery codes formatted as XXXX-XXXX
 */
export function generateBackupCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}`);
  }
  return codes;
}

/**
 * Hash a backup code with SHA-256 for secure DB storage
 */
export function hashBackupCode(code) {
  const normalized = code.toUpperCase().replace(/[\s-]/g, "");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Verify a backup code against hashed list
 * Returns { valid: boolean, index: number }
 */
export function verifyBackupCode(inputCode, hashedCodes = []) {
  if (!inputCode || !Array.isArray(hashedCodes) || hashedCodes.length === 0) {
    return { valid: false, index: -1 };
  }
  const inputHash = hashBackupCode(inputCode);
  const index = hashedCodes.findIndex((h) => h === inputHash);
  return { valid: index !== -1, index };
}

/**
 * Generate standard, 100% scannable QR Code SVG
 */
export async function generateQrCodeSvg(text, size = 220) {
  try {
    return await QRCode.toString(text, {
      type: "svg",
      margin: 2,
      width: size,
      errorCorrectionLevel: "M",
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR Code SVG error:", err);
    return "";
  }
}

/**
 * Generate standard, 100% scannable QR Code PNG Data URL
 */
export async function generateQrCodeDataUrl(text, size = 240) {
  try {
    return await QRCode.toDataURL(text, {
      margin: 2,
      width: size,
      errorCorrectionLevel: "M",
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR Code DataURL error:", err);
    return "";
  }
}
