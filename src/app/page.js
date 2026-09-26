import dynamic from "next/dynamic";
import { getCachedPublicExams } from "@/lib/cached-exams";
import { HeroTitle } from "@/components/home/hero-title";
import { HeroCta } from "@/components/home/hero-cta";
import { HeroStatsBanner } from "@/components/home/hero-stats-banner";
import { PublicExamsSection } from "@/components/home/public-exams-section";

// Below-fold sections: SSR their HTML but defer JS hydration bundles
const FeaturesSection = dynamic(
  () => import("@/components/home/features-section").then((mod) => mod.FeaturesSection),
  { ssr: true },
);
const CoachingSection = dynamic(
  () => import("@/components/home/coaching-section").then((mod) => mod.CoachingSection),
  { ssr: true },
);
const PricingSection = dynamic(
  () => import("@/components/home/pricing-section").then((mod) => mod.PricingSection),
  { ssr: true },
);
const FaqAccordion = dynamic(
  () => import("@/components/home/faq-accordion").then((mod) => mod.FaqAccordion),
  { ssr: true },
);

import { getSeoForRoute } from "@/lib/seo-service";

export const revalidate = 60;

export async function generateMetadata() {
  return await getSeoForRoute("/", {
    title: "MahaExam — महाराष्ट्र स्पर्धा परीक्षा पोर्टल | Police Bharti, MPSC, Talathi Mock Tests",
    description:
      "पोलीस भरती, MPSC, तलाठी, जिल्हा परिषद आणि सर्व सरकारी स्पर्धा परीक्षांसाठी अस्सल TCS/IBPS पॅटर्न ऑनलाइन मॉक टेस्ट पोर्टल. १००% मराठी व इंग्रजी सराव.",
  });
}

export default async function Home() {
  let dbExams = [];
  try {
    dbExams = await getCachedPublicExams();
  } catch {
    dbExams = [];
  }

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pb-16 pt-12 sm:pb-24 sm:pt-20">
        <div className="bg-radial-gradient pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <HeroTitle />
          <HeroCta />
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
    </>
  );
}
