import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "mahaexam-super-secret-jwt-key-for-local-development-2026"
);
const COOKIE = process.env.AUTH_COOKIE_NAME || "mahaexam_session";

export async function createSessionToken(user) {
  const userId = user.id || user.sub;
  return new SignJWT({
    sub: userId,
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

export async function createMfaTicket(user) {
  return new SignJWT({
    sub: user.id,
    role: user.role,
    organizationId: user.organizationId || null,
    name: user.name,
    email: user.email || null,
    type: "mfa_login",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret);
}

export async function verifyMfaTicket(ticket) {
  if (!ticket) return null;
  try {
    const { payload } = await jwtVerify(ticket, secret);
    if (payload.type !== "mfa_login") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createMfaSetupTicket({ userId, secretKey, backupCodesHashed }) {
  return new SignJWT({
    userId,
    secretKey,
    backupCodesHashed,
    type: "mfa_setup",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function verifyMfaSetupTicket(ticket) {
  if (!ticket) return null;
  try {
    const { payload } = await jwtVerify(ticket, secret);
    if (payload.type !== "mfa_setup") return null;
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
