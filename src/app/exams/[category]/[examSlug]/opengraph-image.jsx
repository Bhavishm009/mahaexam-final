import { createDynamicOgResponse, size, contentType } from "@/lib/og-template";
import { prisma } from "@/lib/db";
import { getCategoryBySlug } from "@/lib/exam-category-helper";

export const runtime = "nodejs";
export const alt = "MahaExam ऑनलाइन सराव प्रश्नपत्रिका";
export { size, contentType };

export default async function Image({ params }) {
  const { category, examSlug } = await params;
  const cat = getCategoryBySlug(category);

  let exam = null;
  try {
    exam = await prisma.exam.findFirst({
      where: {
        OR: [{ slug: examSlug }, { id: examSlug }],
      },
      select: {
        title: true,
        totalMarks: true,
        durationMinutes: true,
        negativeMarks: true,
        totalQuestions: true,
      },
    });
  } catch {}

  const title = exam?.title || `${cat?.titleMr || "स्पर्धा परीक्षा"} ऑनलाइन मॉक टेस्ट`;
  const marks = exam?.totalMarks ? `${exam.totalMarks} गुण` : "१०० गुण";
  const duration = exam?.durationMinutes ? `${exam.durationMinutes} मिनिटे` : "९० मिनिटे";
  const questions = exam?.totalQuestions ? `${exam.totalQuestions} प्रश्न` : "१०० प्रश्न";

  return await createDynamicOgResponse({
    categoryBadge: cat ? `📋 ${cat.titleMr}` : "● ऑनलाइन परीक्षा",
    badgeColor: "#fbbf24",
    badgeBg: "rgba(251, 191, 36, 0.15)",
    badgeBorder: "rgba(251, 191, 36, 0.3)",
    title,
    subtitle: "TCS / IBPS लेटेस्ट परीक्षा पॅटर्न २०२६",
    description:
      "परीक्षेची परिपूर्ण तयारी: ऑनलाइन टाइमर, निगेटिव्ह मार्किंग, त्वरित निकाल आणि अचूक मराठी स्पष्टीकरण.",
    accentGradient:
      "radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.45), transparent 45%), radial-gradient(circle at 90% 80%, rgba(225, 29, 72, 0.35), transparent 45%)",
    stats: [
      { label: questions, sub: "TCS/IBPS प्रश्न", color: "#38bdf8" },
      { label: marks, sub: "एकूण गुण", color: "#4ade80" },
      { label: duration, sub: "वेळेचे नियोजन", color: "#c084fc" },
    ],
    footerAction: "Attempt Now ➔",
  });
}
