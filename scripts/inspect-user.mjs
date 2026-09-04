import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    console.log({
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      passwordHash: u.passwordHash,
    });
  }
}

main().finally(() => prisma.$disconnect());
