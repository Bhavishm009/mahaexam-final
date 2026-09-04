import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      passwordHash: true,
    },
  });
  console.log("Total users:", users.length);
  for (const u of users) {
    console.log({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      hasPassword: !!u.passwordHash,
      hashPrefix: u.passwordHash ? u.passwordHash.substring(0, 10) : null,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
