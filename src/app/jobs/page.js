import Link from "next/link";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import {
  Bell,
  Calendar,
  Building2,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  Zap,
  Sparkles,
  BadgeAlert,
} from "lucide-react";

export const metadata = {
  title: "महाराष्ट्र सरकारी नोकरी व भरती जाहिराती २०२६ | Maharashtra Govt Job Alerts",
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
};

export default function JobAlertsPage() {
  const jobAlerts = [
    {
      id: "police-2026",
      department: "महाराष्ट्र पोलीस विभाग (Maharashtra Police Dept)",
      title: "महाराष्ट्र पोलीस शिपाई व चालक भरती २०२६ (Police Bharti)",
      vacancies: "१७,४७१+ पदे (अंदाजित)",
      qualification: "१२ वी उत्तीर्ण (HSC) + शारीरिक पात्रता",
      lastDate: "लवकरच सुरू (Up Next)",
      status: "आगामी भरती (Upcoming)",
      statusColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300",
      examSlug: "police-bharti-mock-01",
      officialUrl: "https://policeshipai2024.mahait.org",
      description:
        "महाराष्ट्र राज्य पोलीस दलातील शिपाई, चालक आणि SRPF पदांसाठीची महाभरती. शारीरिक चाचणी व लेखी परीक्षेची परिपूर्ण तयारी आत्ताच सुरू करा.",
    },
    {
      id: "mpsc-rajyaseva-2026",
      department: "महाराष्ट्र लोकसेवा आयोग (MPSC)",
      title: "MPSC महाराष्ट्र नागरी सेवा राजपत्रित संयुक्त पूर्व परीक्षा (Civil Services)",
      vacancies: "५२४+ पदे",
      qualification: "कोणत्याही शाखेची पदवी (Graduate)",
      lastDate: "अधिसूचना प्रसिद्ध (Official)",
      status: "अर्ज प्रक्रिया सुरू (Active)",
      statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300",
      examSlug: "mpsc-rajyaseva-mock-01",
      officialUrl: "https://mpsc.gov.in",
      description:
        "उपजिल्हाधिकारी, डीवायएसपी, तहसीलदार व वर्ग-१/वर्ग-२ पदांसाठी राज्यसेवा पूर्व परीक्षा. GS पेपर १ व CSAT चा सराव उपलब्ध.",
    },
    {
      id: "talathi-2026",
      department: "महसूल व वन विभाग (Revenue Department)",
      title: "महाराष्ट्र तलाठी भरती TCS पॅटर्न CBT परीक्षा २०२६",
      vacancies: "४,६४४+ पदे",
      qualification: "पदवीधर + MS-CIT",
      lastDate: "अपेक्षित लवकरच (Expected Soon)",
      status: "प्रतीक्षित (Awaited)",
      statusColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300",
      examSlug: "talathi-mock-01",
      officialUrl: "https://mahabhumi.gov.in",
      description:
        "TCS द्वारे घेतली जाणारी १०० प्रश्नांची २०० गुणांची ऑनलाइन CBT परीक्षा. मागील वर्षांच्या अधिकृत TCS शिफ्ट्सचे पेपर्स सोडवा.",
    },
    {
      id: "zp-arogya-2026",
      department: "ग्रामविकास विभाग, जिल्हा परिषद (Rural Dev & ZP)",
      title: "जिल्हा परिषद आरोग्य सेवक व ग्रामसेवक भरती परीक्षा",
      vacancies: "१९,४६०+ पदे",
      qualification: "१० वी / १२ वी / पदवी (पदानुसार)",
      lastDate: "टप्प्याटप्प्याने परीक्षा (Ongoing)",
      status: "सध्या सुरू (Live)",
      statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300",
      examSlug: "zp-gramsevak-mock-01",
      officialUrl: "https://rdd.maharashtra.gov.in",
      description:
        "आरोग्य सेवक (पुरुष/महिला), ग्रामसेवक व औषध निर्माण अधिकारी पदांसाठी IBPS पॅटर्ननुसार होणाऱ्या परीक्षांचे सराव पेपर्स.",
    },
    {
      id: "vanrakshak-2026",
      department: "महाराष्ट्र वन विभाग (Forest Department)",
      title: "महाराष्ट्र वनरक्षक (Forest Guard) ऑनलाइन CBT भरती",
      vacancies: "२,४१७+ पदे",
      qualification: "१२ वी (विज्ञान/गणित/भूगोल/अर्थशास्त्र)",
      lastDate: "नवी जाहिरात लवकरच (Next Phase)",
      status: "आगामी (Upcoming)",
      statusColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300",
      examSlug: "vanrakshak-mock-01",
      officialUrl: "https://mahaforest.gov.in",
      description:
        "वनरक्षक CBT परीक्षेमध्ये मराठी, इंग्रजी, सामान्य ज्ञान व बौद्धिक चाचणीचे ६० प्रश्न १२० गुणांसाठी विचारले जातात.",
    },
    {
      id: "mpsc-combine-bc",
      department: "महाराष्ट्र लोकसेवा आयोग (MPSC)",
      title: "महाराष्ट्र अराजपत्रित गट-ब व गट-क सेवा संयुक्त पूर्व परीक्षा",
      vacancies: "१,१००+ पदे",
      qualification: "कोणत्याही शाखेची पदवी",
      lastDate: "वार्षिक कॅलेंडरनुसार (Annual Calendar)",
      status: "नियमित भरती (Standard)",
      statusColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300",
      examSlug: "mpsc-combine-mock-01",
      officialUrl: "https://mpsc.gov.in",
      description:
        "PSI, STI, ASO, दुय्यम निबंधक, कर सहाय्यक आणि लिपिक-टंकलेखक पदांसाठी संयुक्त पूर्व परीक्षा सराव.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <PublicNavbar />

      <main className="flex-1 py-10 sm:py-14">
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
                      {job.status}
                    </span>
                    <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                      {job.vacancies}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="truncate">{job.department}</span>
                  </div>

                  <h2 className="mt-2 text-base font-black leading-snug text-slate-900 dark:text-white sm:text-lg">
                    {job.title}
                  </h2>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {job.description}
                  </p>

                  <div className="mt-4 space-y-1.5 rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="font-semibold truncate">{job.qualification}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="font-semibold">{job.lastDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    href={`/exam/${job.examSlug}/attempt`}
                    prefetch={true}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-black text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>या परीक्षेचा मोफत सराव करा</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <a
                    href={job.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <span>अधिकृत संकेतस्थळ (Official Website)</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
