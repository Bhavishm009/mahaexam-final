import crypto from "crypto";
import { prisma } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";

const RP_NAME = "MahaExam Platform";

export async function createPasskeyRegistrationOptions(user, origin) {
  const challenge = crypto.randomBytes(32).toString("base64url");
  const userId = Buffer.from(user.id).toString("base64url");
  const hostname = new URL(origin || "http://localhost:3000").hostname;

  return {
    challenge,
    rp: {
      name: RP_NAME,
      id: hostname === "localhost" ? "localhost" : hostname,
    },
    user: {
      id: userId,
      name: user.email || user.name,
      displayName: user.name,
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" }, // ES256
      { alg: -257, type: "public-key" }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Fingerprint / Touch ID / Face ID / Windows Hello
      userVerification: "preferred",
      residentKey: "preferred",
    },
    timeout: 60000,
    attestation: "none",
  };
}

export async function savePasskeyCredential(userId, credentialData) {
  const { id, rawId, response } = credentialData;

  const credentialId = id || rawId;
  if (!credentialId) {
    throw new Error("Invalid passkey payload: missing credential ID");
  }

  const publicKey = response?.publicKey || Buffer.from(rawId || id).toString("base64");

  const credential = await prisma.passkeyCredential.upsert({
    where: { credentialId },
    update: {
      userId,
      publicKey,
      transports: JSON.stringify(response?.transports || ["internal"]),
    },
    create: {
      userId,
      credentialId,
      publicKey,
      deviceType: "platform_biometric",
      backedUp: true,
      transports: JSON.stringify(response?.transports || ["internal"]),
    },
  });

  return credential;
}

export async function createPasskeyLoginOptions(origin, email) {
  const challenge = crypto.randomBytes(32).toString("base64url");
  const hostname = new URL(origin || "http://localhost:3000").hostname;

  let allowCredentials = [];
  if (email && typeof email === "string" && email.trim()) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { passkeys: true },
    });
    if (user && user.passkeys && user.passkeys.length > 0) {
      allowCredentials = user.passkeys.map((p) => ({
        id: p.credentialId,
        type: "public-key",
      }));
    }
  }

  return {
    challenge,
    rpId: hostname === "localhost" ? "localhost" : hostname,
    allowCredentials,
    userVerification: "preferred",
    timeout: 60000,
  };
}

export async function verifyPasskeyLoginAndCreateSession(credentialData) {
  const { id, rawId } = credentialData;
  const credentialId = id || rawId;

  if (!credentialId) {
    throw new Error("Invalid credential data");
  }

  // Look up passkey in DB
  const passkey = await prisma.passkeyCredential.findUnique({
    where: { credentialId },
    include: {
      user: {
        include: { organization: true },
      },
    },
  });

  if (!passkey || !passkey.user) {
    throw new Error("No registered biometric credential found for this device");
  }

  const user = passkey.user;
  if (user.status === "SUSPENDED") {
    throw new Error("Your account is suspended. Please contact support.");
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Create JWT session
  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    name: user.name,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
    },
    token,
  };
}
