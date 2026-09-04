import { Suspense } from "react";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getCachedPublicExams } from "@/lib/cached-exams";
import { ExamsSkeleton } from "@/components/skeletons/exams-skeleton";
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
    dbExams = await getCachedPublicExams();
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
        <Suspense fallback={<ExamsSkeleton />}>
          <PublicExamsSection initialExams={dbExams} />
        </Suspense>

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
