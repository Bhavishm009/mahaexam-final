import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function loginUser({ email, password }) {
  const identifier = (email || "").trim();
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: identifier, mode: "insensitive" } },
        { phone: identifier },
        { phone: identifier.replace(/^\+91/, "").trim() },
      ],
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

async function main() {
  console.log("--- Testing logins ---");
  // Test Bhavish
  try {
    const u1 = await loginUser({ email: "bhavishm009@gmail.com", password: "demo123" });
    console.log("✅ bhavishm009@gmail.com login success! Role:", u1.role);
  } catch (e) {
    console.log("❌ bhavishm009@gmail.com login failed:", e.message);
  }

  // Test with uppercase
  try {
    const u2 = await loginUser({ email: "Bhavishm009@Gmail.com", password: "demo123" });
    console.log("✅ Bhavishm009@Gmail.com (case insensitive) login success!");
  } catch (e) {
    console.log("❌ Bhavishm009@Gmail.com login failed:", e.message);
  }

  // Test with phone number
  try {
    const u3 = await loginUser({ email: "7721841331", password: "demo123" });
    console.log("✅ 7721841331 (phone login) success!");
  } catch (e) {
    console.log("❌ 7721841331 login failed:", e.message);
  }
}

main().finally(() => prisma.$disconnect());
