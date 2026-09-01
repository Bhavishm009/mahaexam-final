import { PrismaClient } from "@prisma/client";
import { runPYQDatabaseSeed } from "../src/lib/pyq-seeder.js";

const prisma = new PrismaClient();

async function main() {
  console.warn("🚀 Launching Dedicated Real Official PYQ Seeder...");
  await runPYQDatabaseSeed(prisma);
  console.warn("✅ Real PYQ Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("❌ PYQ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
