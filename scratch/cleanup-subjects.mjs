import { prisma } from "../src/lib/db.js";

async function cleanup() {
  const unused = await prisma.subject.findMany({
    where: { questions: { none: {} } },
  });
  for (const s of unused) {
    console.log(`Removing empty unused subject: [${s.slug}] ${s.name}`);
    await prisma.subject.delete({ where: { id: s.id } });
  }
  await prisma.$disconnect();
}

cleanup().catch(console.error);
