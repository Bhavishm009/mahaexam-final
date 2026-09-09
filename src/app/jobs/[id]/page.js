import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobAlertById, getAllJobAlerts } from "@/lib/job-service";
import { getBaseUrl } from "@/lib/base-url";
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
  ArrowLeft,
  Award,
  Clock,
  Sparkles,
  Share2,
} from "lucide-react";
import Breadcrumbs from "@/components/breadcrumbs";
import SocialShare from "@/components/social-share";

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

  const siteUrl = getBaseUrl();
  const title = `${job.titleMr || job.title} — संपूर्ण माहिती व सराव | MahaExam`;
  const description = `महाराष्ट्र ${job.department} भरती जाहिरात २०२६. एकूण पदे: ${job.vacancies}, पात्रता: ${job.qualification}, अर्ज अंतिम तारीख: ${job.lastDate}.`;
  const canonicalUrl = `${siteUrl}/jobs/${job.slug || job.id}`;
  const ogImg = job.imageUrl || "/og-jobs.png";

  return {
    title,
    description,
    keywords: [
      job.title,
      job.department,
      "Maharashtra Govt Job Details",
      "भरती जाहिरात सविस्तर माहिती",
      "पोलीस भरती अपडेट",
      "MPSC भरती २०२६",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${job.titleMr || job.title} — MahaExam Alert`,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: "MahaExam",
      locale: "mr_IN",
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: job.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.titleMr || job.title} — MahaExam Alert`,
      description,
      images: [ogImg],
    },
  };
}

export default async function JobDetailPage({ params }) {
  const { id } = await params;
  const job = await getJobAlertById(id);

  if (!job) {
    notFound();
  }

  const allJobs = await getAllJobAlerts();
  const otherJobs = allJobs.filter((j) => j.id !== job.id && j.slug !== job.slug).slice(0, 3);

  const siteUrl = getBaseUrl();
  const postUrl = `${siteUrl}/jobs/${job.slug || job.id}`;

  const jobPostingSchema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.descriptionMr,
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

  const isHtmlContent = (str) => /<[a-z][\s\S]*>/i.test(str || "");

  return (
    <div className="pb-12 pt-3 font-sans sm:pb-16 sm:pt-4">
      {/* Schema.org JobPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />

      <div className="mx-auto max-w-5xl space-y-4 px-4 sm:px-6 lg:px-8">
        {/* Navigation & Breadcrumbs - Compact Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Job Alerts", href: "/jobs" },
              { label: job.departmentMr || job.department || "General" },
              { label: job.titleMr || job.title },
            ]}
          />

          <Link
            href="/jobs"
            prefetch={true}
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-slate-600 transition hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Job Alerts</span>
          </Link>
        </div>

        {/* Main Job Hero Banner Card */}
        <div className="glass-card overflow-hidden rounded-3xl p-6 shadow-md backdrop-blur-xl sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-6 dark:border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  job.status === "ACTIVE"
                    ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                    : job.status === "UPCOMING"
                      ? "border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                      : "border border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {job.status === "ACTIVE"
                  ? "अर्ज प्रक्रिया सुरू (Active)"
                  : job.status === "UPCOMING"
                    ? "आगामी भरती (Upcoming)"
                    : "मुदत संपली (Expired)"}
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
                एकूण: {job.vacancies}
              </span>
            </div>

            <SocialShare
              url={postUrl}
              title={job.titleMr || job.title}
              summary={`${job.departmentMr || job.department} भरती जाहिरात - एकूण ${job.vacancies}`}
              showLabel={true}
            />
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
              <Building2 className="h-4 w-4" />
              <span>{job.departmentMr || job.department}</span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
              {job.titleMr || job.title}
            </h1>

            {job.title && job.titleMr && job.title !== job.titleMr && (
              <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400 sm:text-lg">
                {job.title}
              </h2>
            )}
          </div>

          {/* Banner Image if Available */}
          {job.imageUrl && (
            <div className="my-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-inner dark:border-slate-800/80 dark:bg-slate-950">
              <img
                src={job.imageUrl}
                alt={job.title}
                className="max-h-[420px] w-full object-cover"
              />
            </div>
          )}

          {/* Quick Overview Specs Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
              <div className="text-[11px] font-extrabold uppercase text-slate-400">
                एकूण रिक्त पदे
              </div>
              <div className="mt-1 text-base font-black text-sky-600 dark:text-sky-400 sm:text-lg">
                {job.vacancies}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
              <div className="text-[11px] font-extrabold uppercase text-slate-400">वेतन श्रेणी</div>
              <div className="mt-1 text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                {job.salaryRange || "७व्या वेतन आयोगानुसार"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
              <div className="text-[11px] font-extrabold uppercase text-slate-400">वयोमर्यादा</div>
              <div className="mt-1 text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                {job.ageLimit || "१८ ते ३८ वर्षे"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
              <div className="text-[11px] font-extrabold uppercase text-slate-400">
                अर्ज अंतिम तारीख
              </div>
              <div className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400 sm:text-sm">
                {job.lastDate || "लवकरच जाहीर"}
              </div>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/exams"
              prefetch={true}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition hover:from-sky-600 hover:to-blue-700 active:scale-95 sm:flex-none"
            >
              <Zap className="h-4 w-4 text-amber-300" />
              <span>मोफत सराव चाचणी सोडवा (Start Mock Test)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {job.notificationPdf && (
              <a
                href={job.notificationPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Download className="h-4 w-4 text-sky-600" />
                <span>अधिकृत जाहिरात PDF</span>
              </a>
            )}

            {job.officialUrl && (
              <a
                href={job.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>ऑनलाईन अर्ज करा</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Detailed Recruitment Criteria & Syllabus Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Eligibility & Selection */}
          <div className="glass-card space-y-5 rounded-3xl p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <GraduationCap className="h-5 w-5 text-sky-600" />
              <span>शैक्षणिक पात्रता व निवड पद्धती</span>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800/80 dark:bg-slate-900/60">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                आवश्यक पात्रता (Eligibility):
              </div>
              <div className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {job.qualificationMr || job.qualification}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800/80 dark:bg-slate-900/60">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                निवड प्रक्रिया (Selection Process):
              </div>
              <div className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {job.selectionProcess || "१) संगणकीय लेखी परीक्षा (CBT)  २) कागदपत्र पडताळणी"}
              </div>
            </div>
          </div>

          {/* Exam Prep Card */}
          <div className="glass-card space-y-5 rounded-3xl p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <Award className="h-5 w-5 text-amber-500" />
              <span>MahaExam परिपूर्ण परीक्षा सराव</span>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              MahaExam प्लॅटफॉर्मवर या भरतीसाठी TCS व IBPS नवीन पॅटर्ननुसार परिपूर्ण ऑनलाइन सराव
              चाचण्या मोफत उपलब्ध आहेत.
            </p>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>१०० गुणांचे परिपूर्ण संगणकीय सराव पेपर्स (CBT)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>मागील वर्षांचे अधिकृत PYQ प्रश्नसंच</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>प्रत्येक प्रश्नाचे सविस्तर मराठी स्पष्टीकरण</span>
              </li>
            </ul>

            <div className="border-t border-slate-200/80 pt-3 dark:border-slate-800/80">
              <Link
                href="/exams"
                prefetch={true}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-sky-500"
              >
                <Zap className="h-4 w-4 text-amber-300" />
                <span>सर्व मोफत सराव पेपर्स पहा</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Job Description (Rich Text Body) */}
        {(job.descriptionMr || job.description) && (
          <div className="glass-card space-y-4 rounded-3xl p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <FileText className="h-5 w-5 text-sky-600" />
              <span>सविस्तर जाहिरात व अभ्यासक्रम (Job Details & Syllabus)</span>
            </div>

            {isHtmlContent(job.descriptionMr || job.description) ? (
              <div
                className="prose prose-sm dark:prose-invert sm:prose-base max-w-none space-y-4 font-sans leading-relaxed text-slate-800 dark:text-slate-200"
                dangerouslySetInnerHTML={{
                  __html: job.descriptionMr || job.description,
                }}
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 whitespace-pre-line font-sans text-sm leading-relaxed text-slate-800 dark:text-slate-200 sm:text-base">
                {job.descriptionMr || job.description}
              </div>
            )}
          </div>
        )}

        {/* Social Share Bar Bottom */}
        <div className="glass-card rounded-2xl p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              मित्रांसोबत ही भरती जाहिरात लगेच शेअर करा:
            </span>
            <SocialShare
              url={postUrl}
              title={job.titleMr || job.title}
              summary={`${job.departmentMr || job.department} भरती जाहिरात - एकूण ${job.vacancies}`}
              showLabel={false}
            />
          </div>
        </div>

        {/* Other Active Job Alerts */}
        {otherJobs.length > 0 && (
          <section className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-500" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  इतर ताज्या भरती जाहिराती (Other Job Alerts)
                </h3>
              </div>
              <Link
                href="/jobs"
                className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                View All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {otherJobs.map((other) => (
                <Link
                  key={other.id}
                  href={`/jobs/${other.slug || other.id}`}
                  prefetch={true}
                  className="glass-card group flex flex-col justify-between rounded-2xl border border-slate-200/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800/80"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                      <span className="truncate text-sky-600 dark:text-sky-400">
                        {other.departmentMr || other.department}
                      </span>
                      <span className="shrink-0 text-rose-600 dark:text-rose-400">
                        {other.vacancies}
                      </span>
                    </div>

                    <h4 className="line-clamp-2 text-xs font-bold text-slate-900 transition group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                      {other.titleMr || other.title}
                    </h4>

                    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>{other.lastDate || "लवकरच"}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                    <span>तपशील पहा</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
