const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const aiven = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

const supabase = new PrismaClient({
  datasources: { db: { url: process.env.SECONDARY_DATABASE_URL } }
});

async function main() {
  console.log('Comparing Aiven vs Supabase data...');
  
  const tables = await aiven.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  const comparison = [];

  for (const t of tables) {
    const tableName = t.table_name;
    try {
      const aivenCountRes = await aiven.$queryRawUnsafe(`SELECT count(*)::int as count FROM "public"."${tableName}"`);
      const aCount = aivenCountRes[0].count;
      
      let sCount = 0;
      try {
        const supaCountRes = await supabase.$queryRawUnsafe(`SELECT count(*)::int as count FROM "public"."${tableName}"`);
        sCount = supaCountRes[0].count;
      } catch (e) {
        sCount = 'TABLE_MISSING_OR_ERR';
      }

      if (aCount > 0 || sCount > 0) {
        comparison.push({ table: tableName, aiven: aCount, supabase: sCount });
      }
    } catch (err) {
      console.error(`Error checking table ${tableName}:`, err.message);
    }
  }

  console.table(comparison);

  await aiven.$disconnect();
  await supabase.$disconnect();
}

main().catch(console.error);
