import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { HeroTitle } from "@/components/home/hero-title";
import { HeroCta } from "@/components/home/hero-cta";
import { HeroStatsBanner } from "@/components/home/hero-stats-banner";
import { PublicExamsSection } from "@/components/home/public-exams-section";
import { FeaturesSection } from "@/components/home/features-section";
import { CoachingSection } from "@/components/home/coaching-section";
import { PricingSection } from "@/components/home/pricing-section";
import { FaqAccordion } from "@/components/home/faq-accordion";

export const metadata = {
  title: "MahaExam — महाराष्ट्र स्पर्धा परीक्षा पोर्टल | Police Bharti, MPSC, Talathi Mock Tests",
  description:
    "पोलीस भरती, MPSC, तलाठी, जिल्हा परिषद आणि सर्व सरकारी स्पर्धा परीक्षांसाठी अस्सल TCS/IBPS पॅटर्न ऑनलाइन मॉक टेस्ट पोर्टल. १००% मराठी व इंग्रजी सराव.",
};

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  const session = await verifySessionToken(token);

  let dbExams = [];
  try {
    const examsFromDb = await prisma.exam.findMany({
      where: {
        status: { in: ["SCHEDULED", "LIVE"] },
      },
      take: 12,
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
        _count: {
          select: { questions: true },
        },
      },
    });

    dbExams = examsFromDb.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      titleMr: e.title,
      titleEn: e.title,
      examType: e.examType,
      questions: e.totalQuestions || e._count?.questions || 100,
      duration: e.durationMinutes || 90,
      marks: e.totalMarks || 100,
      totalMarks: e.totalMarks || 100,
      negativeMarks: e.negativeMarks ? `${e.negativeMarks}` : "०.२५",
      negativeMarksEn: e.negativeMarks ? `${e.negativeMarks}` : "0.25",
      isFree: e.isFree,
      badgeMr:
        e.examType === "PREVIOUS_YEAR" || e.slug?.includes("pyq") ? "अधिकृत PYQ" : "१००% लाइव्ह",
      badgeEn:
        e.examType === "PREVIOUS_YEAR" || e.slug?.includes("pyq") ? "Official PYQ" : "100% Live",
      badgeColor:
        e.examType === "PREVIOUS_YEAR" || e.slug?.includes("pyq")
          ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700"
          : "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700",
    }));
  } catch {
    dbExams = [];
  }

  const initialSession = session
    ? {
        id: session.sub,
        name: session.name,
        email: session.email,
        role: session.role,
        organizationId: session.organizationId,
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pb-16 pt-12 sm:pb-24 sm:pt-20">
          <div className="bg-radial-gradient pointer-events-none absolute inset-0 -z-10 opacity-60" />
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <HeroTitle />
            <HeroCta initialSession={initialSession} />
            <HeroStatsBanner />
          </div>
        </section>

        {/* MOCK TESTS CATALOG */}
        <PublicExamsSection initialExams={dbExams} />

        {/* FEATURES GRID */}
        <FeaturesSection />

        {/* COACHING PROMO */}
        <CoachingSection />

        {/* PRICING PLANS */}
        <PricingSection />

        {/* FAQS ACCORDION */}
        <FaqAccordion />
      </main>

      <PublicFooter />
    </div>
  );
}
