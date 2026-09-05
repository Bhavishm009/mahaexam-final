const { PrismaClient } = require('@prisma/client');

const secondaryUrl = process.env.SECONDARY_DATABASE_URL || process.env.SHADOW_DATABASE_URL;

async function main() {
  console.log("Connecting to Supabase...");
  const prisma = new PrismaClient({
    datasources: { db: { url: secondaryUrl } }
  });

  try {
    console.log("Wiping public schema...");
    await prisma.$executeRawUnsafe(`DROP SCHEMA public CASCADE;`);
    await prisma.$executeRawUnsafe(`CREATE SCHEMA public;`);
    await prisma.$executeRawUnsafe(`GRANT ALL ON SCHEMA public TO postgres;`);
    await prisma.$executeRawUnsafe(`GRANT ALL ON SCHEMA public TO public;`);
    console.log("✅ Public schema reset successfully!");
  } catch (err) {
    console.error("Error resetting schema:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
