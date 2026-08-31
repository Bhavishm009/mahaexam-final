import { prisma } from "../src/lib/db.js";

async function verifyNew() {
  const latestQuestions = await prisma.question.findMany({
    take: 200,
    orderBy: { createdAt: 'desc' },
    include: { options: { orderBy: { optionOrder: 'asc' } } }
  });

  const positionCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  latestQuestions.forEach((q) => {
    const correctIdx = q.options.findIndex((o) => o.isCorrect);
    if (correctIdx !== -1) {
      positionCounts[correctIdx + 1] = (positionCounts[correctIdx + 1] || 0) + 1;
    }
  });

  console.log(`\n✅ Correct Option Distribution across latest 200 questions (Checking Randomization):`);
  console.log(`  Option 1: ${positionCounts[1]} times (${((positionCounts[1]/200)*100).toFixed(1)}%)`);
  console.log(`  Option 2: ${positionCounts[2]} times (${((positionCounts[2]/200)*100).toFixed(1)}%)`);
  console.log(`  Option 3: ${positionCounts[3]} times (${((positionCounts[3]/200)*100).toFixed(1)}%)`);
  console.log(`  Option 4: ${positionCounts[4]} times (${((positionCounts[4]/200)*100).toFixed(1)}%)`);

  await prisma.$disconnect();
}

verifyNew().catch(console.error);
