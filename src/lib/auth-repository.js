import bcrypt from "bcryptjs";
import { prisma } from "./db.js";

export async function registerUser({ name, email, phone, password, targetExam = "Police Bharti" }) {
  if (!email && !phone) {
    throw new Error("EMAIL_OR_PHONE_REQUIRED");
  }
  if (!password || password.length < 6) {
    throw new Error("PASSWORD_TOO_SHORT");
  }

  const existing = email
    ? await prisma.user.findUnique({ where: { email } })
    : await prisma.user.findUnique({ where: { phone } });

  if (existing) {
    throw new Error("USER_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      passwordHash,
      role: "STUDENT",
      studentProfile: {
        create: {
          targetExam: targetExam || "Police Bharti",
        },
      },
    },
  });

  return user;
}

export async function registerCoachingOrganization({
  organizationName,
  adminName,
  email,
  phone,
  district,
  password,
}) {
  if (!email && !phone) {
    throw new Error("EMAIL_OR_PHONE_REQUIRED");
  }
  if (!password || password.length < 6) {
    throw new Error("PASSWORD_TOO_SHORT");
  }
  if (!organizationName) {
    throw new Error("ORGANIZATION_NAME_REQUIRED");
  }

  const existing = email
    ? await prisma.user.findUnique({ where: { email } })
    : await prisma.user.findUnique({ where: { phone } });

  if (existing) {
    throw new Error("USER_EXISTS");
  }

  const baseSlug = organizationName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = `${baseSlug || "academy"}-${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: organizationName,
        slug,
        email: email || null,
        phone: phone || null,
        district: district || "Maharashtra",
        status: "ACTIVE",
      },
    });

    const user = await tx.user.create({
      data: {
        name: adminName,
        email: email || null,
        phone: phone || null,
        passwordHash,
        role: "COACHING_ADMIN",
        status: "ACTIVE",
        organizationId: org.id,
      },
    });

    const batchCode = `BATCH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const batch = await tx.coachingBatch.create({
      data: {
        organizationId: org.id,
        name: "General Batch 2025 (मुख्य बॅच)",
        code: batchCode,
        isActive: true,
      },
    });

    const inviteCode = `${slug.substring(0, 8).replace(/-/g, "").toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
    await tx.coachingInvite.create({
      data: {
        organizationId: org.id,
        batchId: batch.id,
        code: inviteCode,
        name: `${organizationName} Student Invite`,
      },
    });

    return { user, org, batch, inviteCode };
  });

  return result.user;
}

export async function loginUser({ email, identifier, phone, password }) {
  const loginIdentifier = (identifier || email || phone || "").trim();
  if (!loginIdentifier || !password) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Check if identifier is a phone number (e.g. 7721841331, +917721841331, 917721841331)
  const numericOnly = loginIdentifier.replace(/\D/g, "");
  const cleanPhone =
    numericOnly.length === 10
      ? numericOnly
      : numericOnly.length === 12 && numericOnly.startsWith("91")
        ? numericOnly.slice(2)
        : null;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: loginIdentifier, mode: "insensitive" } },
        ...(cleanPhone
          ? [{ phone: cleanPhone }, { phone: loginIdentifier }, { phone: `+91${cleanPhone}` }]
          : [{ phone: loginIdentifier }]),
      ],
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
      studentProfile: {
        select: {
          id: true,
          targetExam: true,
          district: true,
        },
      },
    },
  });

  if (!user || !user.passwordHash) {
    throw new Error("INVALID_CREDENTIALS");
  }
  if (user.status !== "ACTIVE") {
    throw new Error("USER_SUSPENDED");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error("INVALID_CREDENTIALS");
  }
  return user;
}
