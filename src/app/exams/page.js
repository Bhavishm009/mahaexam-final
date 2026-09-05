import { Suspense } from "react";
import { getCachedPublicExams } from "@/lib/cached-exams";
import { ExamsDirectoryClient } from "./exams-directory-client";
import { ExamsSkeleton } from "@/components/skeletons/exams-skeleton";
import { Sparkles } from "lucide-react";
import { getBaseUrl } from "@/lib/base-url";

import { getSeoForRoute } from "@/lib/seo-service";

export async function generateMetadata() {
  return await getSeoForRoute("/exams", {
    title: "महाराष्ट्र स्पर्धा परीक्षा सराव टेस्ट्स २०२६ | Police, MPSC, Talathi Mock Tests",
    description:
      "TCS/IBPS पॅटर्नवर आधारित १०० गुणांचे परिपूर्ण सराव पेपर्स. मोफत सोडवा आणि त्वरित निकाल व रँक पहा.",
    keywords: [
      "Police Bharti Mock Test",
      "MPSC Test Series Marathi",
      "Talathi Bharti TCS Exam",
      "ZP Arogya Sevak Mock Test",
      "Vanrakshak Bharti Exam",
      "Maharashtra Online Mock Test",
      "पोलीस भरती सराव पेपर",
      "तलाठी भरती प्रश्नपत्रिका",
    ],
  });
}

export default async function ExamsDirectoryPage() {
  const exams = await getCachedPublicExams();

  const siteBase = getBaseUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: exams.slice(0, 15).map((e, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: e.title,
      url: `${siteBase}/exam/${e.slug || e.id}`,
    })),
  };

  return (
    <div className="py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-8 text-white shadow-xl sm:p-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              {exams.length} लाइव्ह परीक्षा उपलब्ध (१००% मोफत व TCS/IBPS पॅटर्न)
            </span>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">
              महाराष्ट्र स्पर्धा परीक्षा सराव दालन
            </h1>
            <p className="mt-3 text-sm text-blue-100 sm:text-base">
              पोलीस भरती, तलाठी, MPSC, जिल्हा परिषद आणि सरळसेवा परीक्षांचे अस्सल ऑनलाइन CBT पेपर्स.
              तुमची अचूकता आणि वेळ व्यवस्थापन सुधारा.
            </p>
          </div>
        </div>

        {/* Directory Client */}
        <Suspense fallback={<ExamsSkeleton />}>
          <ExamsDirectoryClient exams={exams} />
        </Suspense>
      </div>
    </div>
  );
}
