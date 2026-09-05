import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobAlertById, getAllJobAlerts } from "@/lib/job-service";
import {
  Building2,
  Calendar,
  GraduationCap,
  FileText,
  DollarSign,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Download,
  Zap,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  Share2,
  Award,
} from "lucide-react";

export async function generateStaticParams() {
  const jobs = await getAllJobAlerts();
  return jobs.map((j) => ({
    id: j.slug || j.id,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const job = await getJobAlertById(id);

  if (!job) {
    return {
      title: "Job Alert Not Found | MahaExam",
    };
  }

  const title = `${job.titleMr || job.title} — संपूर्ण माहिती व सराव | MahaExam`;
  const description = `महाराष्ट्र ${job.department} भरती जाहिरात २०२६. एकूण पदे: ${job.vacancies}, पात्रता: ${job.qualification}, अर्ज अंतिम तारीख: ${job.lastDate}.`;
  const ogImageUrl = `/jobs/${id}/opengraph-image`;

  return {
    title,
    description,
    keywords: [
      job.title,
      job.department,
      "Maharashtra Govt Job Details",
      "भरती जाहिरात सविस्तर माहिती",
    ],
    openGraph: {
      title: `${job.titleMr || job.title} — MahaExam Alert`,
      description,
      type: "article",
      url: `/jobs/${id}`,
      siteName: "MahaExam",
      locale: "mr_IN",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: job.title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.titleMr || job.title} — MahaExam Alert`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function JobDetailPage({ params }) {
  const { id } = await params;
  const job = await getJobAlertById(id);

  if (!job) {
    notFound();
  }

  const jobPostingSchema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: job.department,
      value: job.id,
    },
    datePosted: job.publishedAt
      ? new Date(job.publishedAt).toISOString()
      : new Date().toISOString(),
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.department,
      sameAs: job.officialUrl || "https://maharashtra.gov.in",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: {
        "@type": "QuantitativeValue",
        unitText: "MONTH",
      },
    },
  };

  return (
    <div className="py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
        >
          <Link
            href="/"
            prefetch={true}
            className="transition hover:text-blue-600 dark:hover:text-white"
          >
            मुख्यपृष्ठ
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/jobs"
            prefetch={true}
            className="transition hover:text-blue-600 dark:hover:text-white"
          >
            भरती जाहिराती
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="max-w-[200px] truncate font-bold text-blue-600 dark:text-blue-400">
            {job.titleMr || job.title}
          </span>
        </nav>

        {/* Job Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-6 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${job.statusColor || "bg-emerald-100 text-emerald-800"}`}
              >
                {job.status === "ACTIVE" ? "अर्ज प्रक्रिया सुरू (Active)" : "नवीन भरती (New Alert)"}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                {job.vacancies}
              </span>
            </div>

            <Link
              href="/jobs"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>सर्व जाहिराती पहा</span>
            </Link>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>{job.departmentMr || job.department}</span>
            </div>

            <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
              {job.titleMr || job.title}
            </h1>

            <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
              {job.descriptionMr || job.description}
            </p>
          </div>

          {/* Quick Overview Specs Table */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="text-[11px] font-bold text-slate-400">एकूण रिक्त पदे</div>
              <div className="mt-1 text-lg font-black text-blue-600 dark:text-blue-400">
                {job.vacancies}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="text-[11px] font-bold text-slate-400">वेतन श्रेणी (Pay Scale)</div>
              <div className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                {job.salaryRange}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="text-[11px] font-bold text-slate-400">वयोमर्यादा (Age Limit)</div>
              <div className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                {job.ageLimit}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="text-[11px] font-bold text-slate-400">अर्ज अंतिम तारीख</div>
              <div className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                {job.lastDate}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/exams/police-bharti/${job.examSlug || "police-01"}`}
              prefetch={true}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
            >
              <Zap className="h-4 w-4 text-amber-300" />
              <span>या परीक्षेचा मोफत सराव करा (Start Mock Test)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {job.notificationPdf && (
              <a
                href={job.notificationPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download className="h-4 w-4 text-blue-600" />
                <span>अधिकृत जाहिरात PDF डाउनलोड करा</span>
              </a>
            )}

            {job.officialUrl && (
              <a
                href={job.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 px-5 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <span>ऑनलाईन अर्ज करा (Apply Online)</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Detailed Recruitment Criteria Breakdown */}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <span>शैक्षणिक पात्रता (Qualification & Criteria)</span>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                आवश्यक पात्रता:
              </div>
              <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {job.qualificationMr || job.qualification}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                निवड प्रक्रिया (Selection Process):
              </div>
              <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {job.selectionProcess}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <Award className="h-5 w-5 text-amber-500" />
              <span>परीक्षेची तयारी व मोफत टेस्ट्स</span>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              MahaExam प्लॅटफॉर्मवर या भरतीसाठी TCS व IBPS नवीन पॅटर्ननुसार परिपूर्ण ऑनलाइन सराव
              चाचण्या उपलब्ध आहेत.
            </p>

            <ul className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>१०० गुणांचे परिपूर्ण संगणकीय सराव पेपर्स (CBT)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>मागील वर्षांचे अधिकृत PYQ प्रश्नसंच</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>प्रत्येक प्रश्नाचे सविस्तर मराठी स्पष्टीकरण</span>
              </li>
            </ul>

            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Link
                href="/exams"
                prefetch={true}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-500"
              >
                <Zap className="h-4 w-4 text-amber-300" />
                <span>सर्व २९+ सराव पेपर्स पहा</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
