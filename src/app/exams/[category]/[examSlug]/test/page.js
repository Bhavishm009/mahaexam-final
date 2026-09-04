import { SecureExamClient } from "@/components/secure-exam-client";
import { prisma } from "@/lib/db";

export async function generateMetadata({ params }) {
  const { examSlug } = await params;
  return {
    title: `Live Examination — ${examSlug} | MahaExam`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LiveExamTestPage({ params }) {
  const { examSlug } = await params;

  let examIdToPass = examSlug;
  try {
    const dbExam = await prisma.exam.findFirst({
      where: { OR: [{ slug: examSlug }, { id: examSlug }] },
      select: { id: true },
    });
    if (dbExam?.id) examIdToPass = dbExam.id;
  } catch {}

  return <SecureExamClient examId={examIdToPass} />;
}
