import { prisma, getFailoverStatus } from "../src/lib/db.js";

async function main() {
  console.log("--------------------------------------------------");
  console.log("🔍 Live Application Database Inspection");
  console.log("--------------------------------------------------");
  console.log("Failover Status Helper:", getFailoverStatus());

  // Execute raw PostgreSQL system queries against the active connection
  const [dbMeta] = await prisma.$queryRawUnsafe(`
    SELECT 
      inet_server_addr() as server_ip,
      inet_server_port() as server_port,
      current_database() as database_name,
      current_user as connected_user,
      version() as postgresql_version
  `);

  console.log("\n📦 LIVE DATABASE CONNECTION DETAILS:");
  console.log(`   - Connected Database: ${dbMeta.database_name}`);
  console.log(`   - Connected User:     ${dbMeta.connected_user}`);
  console.log(`   - Server IP:          ${dbMeta.server_ip}`);
  console.log(`   - Server Port:        ${dbMeta.server_port} (Port 6543 = Supabase PgBouncer Pooler)`);
  console.log(`   - PostgreSQL Version: ${dbMeta.postgresql_version}`);

  // Inspect active connection counts on this database
  const connectionStats = await prisma.$queryRawUnsafe(`
    SELECT count(*)::int as active_connections, state 
    FROM pg_stat_activity 
    GROUP BY state
  `);
  console.log("\n⚡ ACTIVE DATABASE SESSIONS ON POSTGRESQL:");
  console.log(connectionStats);

  // Inspect live data row counts
  const [userCount, examCount, questionCount, resultCount, attemptCount] = await Promise.all([
    prisma.user.count(),
    prisma.exam.count(),
    prisma.question.count(),
    prisma.examResult.count(),
    prisma.examAttempt.count(),
  ]);

  console.log("\n📊 LIVE DATA RECORD COUNTS IN CURRENT DATABASE:");
  console.log(`   - Users:          ${userCount}`);
  console.log(`   - Exams:          ${examCount}`);
  console.log(`   - Questions:      ${questionCount}`);
  console.log(`   - Exam Results:   ${resultCount}`);
  console.log(`   - Exam Attempts:  ${attemptCount}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error("❌ Inspection failed:", err);
  process.exit(1);
});
