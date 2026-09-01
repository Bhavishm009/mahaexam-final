import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const exams = await prisma.exam.findMany({
    include: {
      _count: {
        select: { questions: true, questionSnapshots: true },
      },
    },
  });
  console.log(`Total Exams in DB: ${exams.length}`);
  for (const e of exams) {
    console.log(
      `Exam [${e.slug}] (${e.status}): totalQuestions=${e.totalQuestions}, questions.count=${e._count.questions}, snapshots.count=${e._count.questionSnapshots}`,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
