import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "mahaexam-super-secret-jwt-key-for-local-development-2026"
);
const COOKIE = process.env.AUTH_COOKIE_NAME || "maha_exam_session";

export async function createSessionToken(user) {
  return new SignJWT({
    sub: user.id,
    role: user.role,
    organizationId: user.organizationId || null,
    name: user.name,
    email: user.email || null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token) {
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export { COOKIE };
