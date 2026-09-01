import { PrismaClient } from "@prisma/client";
import { runCompleteDatabaseSeed } from "../src/lib/seed-service.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Executing complete database seed and PYQ question linking...");
  await runCompleteDatabaseSeed(prisma);
  console.log("✅ Seed & question linking finished!");
}

main()
  .catch((err) => {
    console.error("Error in reseed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
