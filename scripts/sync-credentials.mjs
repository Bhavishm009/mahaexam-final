import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Synchronizing and verifying credentials in PostgreSQL database...");
  const passwordHash = await bcrypt.hash("demo123", 12);

  // 1. Ensure primary Super Admin: bhavishm009@gmail.com
  const u1 = await prisma.user.upsert({
    where: { email: "bhavishm009@gmail.com" },
    update: { passwordHash, role: "SUPER_ADMIN", status: "ACTIVE" },
    create: {
      name: "Bhavish Muneshwar",
      email: "bhavishm009@gmail.com",
      phone: "7721841331",
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Super Admin active:", u1.email, "(phone: 7721841331, pass: demo123)");

  // 2. Ensure Student account: mr.bkumar1331@gmail.com
  const u2 = await prisma.user.upsert({
    where: { email: "mr.bkumar1331@gmail.com" },
    update: { passwordHash, role: "STUDENT", status: "ACTIVE" },
    create: {
      name: "Bhavish Muneshwar",
      email: "mr.bkumar1331@gmail.com",
      phone: "9730441331",
      passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
    },
  });
  console.log("✅ Student account active:", u2.email, "(phone: 9730441331, pass: demo123)");

  // 3. Ensure Demo Admin
  const u3 = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash, role: "SUPER_ADMIN", status: "ACTIVE" },
    create: {
      name: "Platform Admin",
      email: "admin@example.com",
      phone: "9876543200",
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Demo Admin active:", u3.email, "(pass: demo123)");

  // 4. Ensure Organization & Coaching Admin
  const org = await prisma.organization.upsert({
    where: { slug: "shivneri-academy" },
    update: {},
    create: {
      name: "Shivneri Competitive Academy",
      slug: "shivneri-academy",
      email: "academy@example.com",
      phone: "9876543210",
      district: "Pune",
      state: "Maharashtra",
      subscriptionPlan: "PROFESSIONAL",
    },
  });

  const u4 = await prisma.user.upsert({
    where: { email: "academy@example.com" },
    update: { passwordHash, role: "COACHING_ADMIN", status: "ACTIVE", organizationId: org.id },
    create: {
      name: "Prof. Rajesh Deshmukh",
      email: "academy@example.com",
      phone: "9876543210",
      passwordHash,
      role: "COACHING_ADMIN",
      status: "ACTIVE",
      organizationId: org.id,
    },
  });
  console.log("✅ Coaching Admin active:", u4.email, "(pass: demo123)");

  // 5. Ensure Demo Student
  const u5 = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: { passwordHash, role: "STUDENT", status: "ACTIVE" },
    create: {
      name: "Rahul Patil",
      email: "student@example.com",
      phone: "9876543220",
      passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
    },
  });
  console.log("✅ Demo Student active:", u5.email, "(pass: demo123)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
