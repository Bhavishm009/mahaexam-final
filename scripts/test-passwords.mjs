import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const testPasswords = [
    "demo123",
    "password",
    "admin",
    "123456",
    "bhavish",
    "admin123",
    "mahaexam",
  ];

  for (const u of users) {
    console.log(`\nUser: ${u.email} (${u.role}, phone: ${u.phone})`);
    for (const p of testPasswords) {
      if (u.passwordHash) {
        const ok = await bcrypt.compare(p, u.passwordHash);
        if (ok) {
          console.log(`  -> Matches password: "${p}"`);
        }
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
