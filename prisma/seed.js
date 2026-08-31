const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const { runCompleteDatabaseSeed } = await import("../src/lib/seed-service.js");
  await runCompleteDatabaseSeed(prisma);
}

main()
  .catch((e) => {
    console.error("Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
