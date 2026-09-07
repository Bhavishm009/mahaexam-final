const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL.replace(/connection_limit=\d+/, 'connection_limit=1')
    }
  }
});

async function main() {
  const maxConn = await prisma.$queryRawUnsafe('SHOW max_connections');
  
  // Terminate stale idle connections from non-superuser clients that have been idle > 3 minutes
  const killed = await prisma.$queryRawUnsafe(`
    SELECT pg_terminate_backend(pid) as terminated, pid, client_addr, state, state_change
    FROM pg_stat_activity
    WHERE pid <> pg_backend_pid()
      AND state = 'idle'
      AND client_addr IS NOT NULL
      AND state_change < NOW() - INTERVAL '2 minutes'
  `);
  console.log('Terminated stale idle connections:', killed.length);

  const remaining = await prisma.$queryRawUnsafe(`
    SELECT pid, client_addr, client_port, state, backend_start, state_change
    FROM pg_stat_activity
    WHERE client_addr IS NOT NULL
  `);
  console.log('REMAINING CLIENT CONNECTIONS (' + remaining.length + '):', JSON.stringify(remaining, null, 2));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('DB Error:', err);
  process.exit(1);
});
