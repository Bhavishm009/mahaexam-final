import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCachedPublicExams } from "@/lib/cached-exams";
import { EXAM_CATEGORIES, getCategoryBySlug, getCategorySlugFromExam } from "@/lib/exam-category-helper";
import { getBaseUrl } from "@/lib/base-url";
import { ExamsDirectoryClient } from "../exams-directory-client";
import { ExamsSkeleton } from "@/components/skeletons/exams-skeleton";
import { ChevronRight, Sparkles, BookOpen, Shield, Award, FileText, Building, Trees, Layers, ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return EXAM_CATEGORIES.map((c) => ({
    category: c.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);

  if (!cat) {
    return {
      title: "Category Not Found | MahaExam",
    };
  }

  const siteBase = getBaseUrl();
  const title = `${cat.titleMr} | MahaExam Mock Tests`;
  const description = cat.descriptionMr;

  return {
    metadataBase: new URL(siteBase),
    title,
    description,
    keywords: cat.keywords,
    openGraph: {
      title: `${cat.titleMr} — MahaExam`,
      description,
      type: "website",
      url: `${siteBase}/exams/${cat.slug}`,
      siteName: "MahaExam",
      locale: "mr_IN",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: cat.titleMr,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cat.titleMr} — MahaExam`,
      description,
      images: ["/twitter-image"],
    },
  };
}

export default async function ExamCategoryPage({ params }) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);

  if (!cat) {
    notFound();
  }

  const allExams = await getCachedPublicExams();
  const categoryExams = allExams.filter((e) => getCategorySlugFromExam(e) === cat.slug);

  const siteBase = getBaseUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.titleMr,
    description: cat.descriptionMr,
    url: `${siteBase}/exams/${cat.slug}`,
    hasPart: categoryExams.map((e) => ({
      "@type": "LearningResource",
      name: e.title,
      url: `${siteBase}/exams/${cat.slug}/${e.slug || e.id}`,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/" prefetch={true} className="transition hover:text-blue-600 dark:hover:text-white">
              मुख्यपृष्ठ
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/exams" prefetch={true} className="transition hover:text-blue-600 dark:hover:text-white">
              सर्व परीक्षा
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-bold text-blue-600 dark:text-blue-400">{cat.badgeMr}</span>
          </nav>

          {/* Category Banner */}
          <div className="mb-10 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-8 text-white shadow-xl sm:p-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${cat.badgeColor}`}>
                    {cat.badgeMr}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-200">
                    {categoryExams.length} उपलब्ध पेपर्स
                  </span>
                </div>
                <h1 className="mt-4 text-2xl font-black sm:text-3xl lg:text-4xl">
                  {cat.titleMr}
                </h1>
                <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {cat.descriptionMr}
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href="/exams"
                  prefetch={true}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>इतर परीक्षा प्रवर्ग पहा</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Exams List in Category */}
          <Suspense fallback={<ExamsSkeleton />}>
            <ExamsDirectoryClient
              exams={categoryExams.length > 0 ? categoryExams : allExams}
              hideCategoriesHub={true}
              hideCategoryPills={true}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
