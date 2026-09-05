import Link from "next/link";
import { getAllJobAlerts } from "@/lib/job-service";
import { getSeoForRoute } from "@/lib/seo-service";
import {
  Bell,
  Calendar,
  Building2,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  Zap,
  FileText,
} from "lucide-react";

export async function generateMetadata() {
  return await getSeoForRoute("/jobs", {
    title: "महाराष्ट्र सरकारी नोकरी व भरती जाहिराती २०२६ | MahaExam Job Alerts",
    description:
      "महाराष्ट्र पोलीस भरती, तलाठी, MPSC, जिल्हा परिषद (ZP) आणि वनरक्षक भरतीच्या ताज्या अधिकृत जाहिराती, रिक्त पदे, पात्रता व अंतिम तारीख. मोफत सराव पेपर्ससह परिपूर्ण तयारी.",
    keywords: [
      "Maharashtra Police Bharti 2026",
      "Talathi Bharti Notification",
      "MPSC Job Notification",
      "ZP Arogya Sevak Bharti",
      "Maharashtra Govt Jobs 2026",
      "सरकारी नोकरी महाराष्ट्र",
      "भरती जाहिराती",
    ],
  });
}

export default async function JobAlertsPage() {
  const jobAlerts = await getAllJobAlerts();

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-8 text-white shadow-xl sm:p-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
              <Bell className="h-3.5 w-3.5 text-amber-300 animate-bounce" />
              अधिकृत नोकरी व भरती अपडेट्स २०२६
            </span>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">
              महाराष्ट्र सरकारी भरती जाहिराती व सूचना
            </h1>
            <p className="mt-3 text-sm text-blue-100 sm:text-base">
              पोलीस भरती, MPSC, तलाठी आणि जिल्हा परिषद परीक्षांच्या ताज्या जाहिराती, पात्रता व
              थेट मोफत सराव पेपर्स.
            </p>
          </div>
        </div>

        {/* Job Alerts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobAlerts.map((job) => (
            <article
              key={job.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${job.statusColor}`}>
                    {job.status === "ACTIVE" ? "अर्ज प्रक्रिया सुरू (Active)" : job.status === "UPCOMING" ? "आगामी भरती (Upcoming)" : job.status}
                  </span>
                  <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                    {job.vacancies}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="truncate">{job.departmentMr || job.department}</span>
                </div>

                <Link href={`/jobs/${job.slug || job.id}`} prefetch={true} className="group">
                  <h2 className="mt-2 text-base font-black leading-snug text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
                    {job.titleMr || job.title}
                  </h2>
                </Link>

                <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-3 dark:text-slate-400">
                  {job.descriptionMr || job.description}
                </p>

                <div className="mt-4 space-y-1.5 rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="font-semibold truncate">{job.qualificationMr || job.qualification}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="font-semibold">{job.lastDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Link
                  href={`/jobs/${job.slug || job.id}`}
                  prefetch={true}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-black text-white shadow-sm transition hover:bg-slate-800 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  <span>पूर्ण जाहिरात व तपशील पहा</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/exam/${job.examSlug || "police-01"}/attempt`}
                    prefetch={true}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>सराव परीक्षा</span>
                  </Link>

                  <a
                    href={job.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <span>अधिकृत साईट</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

