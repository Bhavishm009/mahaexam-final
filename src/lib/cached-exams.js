import { unstable_cache as cache } from "next/cache";
import { prisma } from "@/lib/db";

/**
 * High-performance cached query for public live examinations.
 * Utilizes Next.js 16 caching with automatic ISR (60s) and on-demand cache tags.
 */
export const getCachedPublicExams = cache(
  async () => {
    try {
      const exams = await prisma.exam.findMany({
        where: {
          status: { in: ["SCHEDULED", "LIVE"] },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          examType: true,
          durationMinutes: true,
          totalQuestions: true,
          totalMarks: true,
          negativeMarks: true,
          isFree: true,
          visibilityMode: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { questions: true },
          },
        },
      });

      return exams.map((e) => {
        const isPyq =
          e.examType === "PREVIOUS_YEAR" ||
          e.slug?.includes("pyq") ||
          e.title?.toLowerCase().includes("pyq") ||
          e.title?.includes("मूळ");

        return {
          id: e.id,
          slug: e.slug,
          title: e.title,
          titleMr: e.title,
          titleEn: e.title,
          examType: e.examType,
          questions: e.totalQuestions || e._count?.questions || 100,
          duration: e.durationMinutes || 90,
          durationMinutes: e.durationMinutes || 90,
          marks: e.totalMarks || 100,
          totalMarks: e.totalMarks || 100,
          negativeMarks: e.negativeMarks ? `${e.negativeMarks}` : "०.२५",
          negativeMarksEn: e.negativeMarks ? `${e.negativeMarks}` : "0.25",
          isFree: e.isFree,
          visibilityMode: e.visibilityMode,
          isPyq,
          badgeMr: isPyq ? "अधिकृत PYQ" : "१००% लाइव्ह",
          badgeEn: isPyq ? "Official PYQ" : "100% Live",
          badgeColor: isPyq
            ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700"
            : "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700",
        };
      });
    } catch (err) {
      console.warn(
        "⚠️ [Build/Query Notice] getCachedPublicExams fallback triggered:",
        err?.message || err,
      );
      return [];
    }
  },
  ["public-live-exams"],
  {
    revalidate: 60, // revalidate every 60 seconds (ISR)
    tags: ["exams", "public-exams"],
  },
);
