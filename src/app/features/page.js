import Link from "next/link";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import {
  Sparkles,
  ShieldCheck,
  BarChart3,
  Globe,
  Clock,
  Smartphone,
  CheckCircle2,
  Zap,
  ArrowRight,
  BrainCircuit,
  Trophy,
  Layers,
} from "lucide-react";

import { getSeoForRoute } from "@/lib/seo-service";

export async function generateMetadata() {
  return await getSeoForRoute("/features", {
    title: "वैशिष्ट्ये (Features) — MahaExam ऑनलाइन टेस्ट प्लॅटफॉर्म",
    description:
      "MahaExam पोर्टलची प्रमुख वैशिष्ट्ये: अस्सल TCS/IBPS पॅटर्न, मराठी व इंग्रजी द्विभाषिक पेपर, AI निकाल विश्लेषण, स्टेट रँकिंग आणि अँटी-चीटिंग सिस्टीम.",
  });
}

export default function FeaturesPage() {
  const featuresList = [
    {
      icon: Clock,
      titleMr: "अस्सल TCS/IBPS पॅटर्न इंटरफेस",
      titleEn: "Authentic TCS/IBPS Exam Engine",
      descMr:
        "प्रत्यक्ष परीक्षेसारखा हुबेहूब अनुभव: टाइमर, प्रश्न पॅलेट (सोडवले, बाकी, रिव्ह्यू), निगेटिव्ह मार्किंग आणि रिअल-टाइम सबमिशन.",
      descEn:
        "Exact exam-hall replica with live countdown timer, question status palette, negative marking, and instant autosave.",
      badge: "TCS / IBPS Real Feel",
      badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
    },
    {
      icon: Globe,
      titleMr: "द्विभाषिक सपोर्ट (मराठी व English)",
      titleEn: "Bilingual Question Support",
      descMr:
        "एका क्लिकवर प्रश्न मराठी किंवा इंग्रजीत बदला. अचूक भाषांतर आणि स्पष्टीकरण दोन्ही भाषांमध्ये उपलब्ध.",
      descEn:
        "Toggle questions and options seamlessly between Marathi and English with one click during the test.",
      badge: "१००% मराठी व English",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
    },
    {
      icon: BrainCircuit,
      titleMr: "AI आधारित निकाल व विश्लेषण",
      titleEn: "AI Scorecard & Deep Analytics",
      descMr:
        "तुमचे कच्चे विषय आणि मजबूत विषय ओळखा. अचूकता (Accuracy), वेळ व्यवस्थापन (Time per question) आणि विषयानुसार गुण विश्लेषण.",
      descEn:
        "Instant performance diagnostics highlighting topic-wise strengths, weak areas, and time allocation per question.",
      badge: "Smart Diagnostics",
      badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300",
    },
    {
      icon: Trophy,
      titleMr: "महाराष्ट्र स्टेट रँक व पर्सेंटाइल",
      titleEn: "Statewide Leaderboard & Percentile",
      descMr:
        "हजारो विद्यार्थ्यांमध्ये तुमचा नंबर कितवा? थेट स्टेट रँक, पर्सेंटाइल आणि कटऑफ अंदाज मिळवा.",
      descEn:
        "Compare your performance with aspirants across Maharashtra with live state rank and percentile calculations.",
      badge: "Live Leaderboard",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300",
    },
    {
      icon: ShieldCheck,
      titleMr: "अँटी-चीटिंग व सुरक्षित प्रोक्टरिंग",
      titleEn: "Proctoring & Anti-Cheating Safeguards",
      descMr:
        "टॅब स्विच, विंडो ब्लर आणि गैरप्रकार शोधणारी प्रगत सुरक्षा प्रणाली, ज्यामुळे निकालांची विश्वासार्हता टिकून राहते.",
      descEn:
        "Automatic tab-switch warnings, fullscreen enforcement, and tamper detection ensuring authentic leaderboard results.",
      badge: "Strict Fairplay",
      badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300",
    },
    {
      icon: Smartphone,
      titleMr: "मोबाईल व PWA रेडी",
      titleEn: "Lightweight Mobile PWA",
      descMr:
        "कमीत कमी इंटरनेट डेटा वापर. 4G/3G वर अत्यंत वेगवान. ॲप डाऊनलोड न करता थेट होम स्क्रीनवर सेव्ह करा.",
      descEn:
        "Ultra-fast loading on mobile browsers, minimal bandwidth consumption, and installable as a native PWA app.",
      badge: "Fast & Offline Ready",
      badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <PublicNavbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              महाराष्ट्र स्पर्धा परीक्षांसाठी आधुनिक तंत्रज्ञान
            </span>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">
              MahaExam प्लॅटफॉर्मची वैशिष्ट्ये
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              पोलीस भरती, MPSC, तलाठी व जिल्हा परिषद परीक्षांच्या अचूक सरावासाठी तयार केलेले
              महाराष्ट्रातील एकमेव प्रगत टेस्ट पोर्टल.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuresList.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-blue-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:scale-110 dark:bg-blue-950/60 dark:text-blue-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${f.badgeColor}`}
                      >
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                      {f.titleMr}
                    </h3>
                    <div className="text-xs font-semibold text-slate-400">{f.titleEn}</div>

                    <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                      {f.descMr}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>परीक्षेसाठी १००% उपयुक्त</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Banner */}
          <div className="mt-16 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-8 text-center text-white shadow-xl sm:p-12">
            <h2 className="text-2xl font-black sm:text-3xl">
              आजच तुमची पहिली मोफत मॉक टेस्ट सोडवून पहा!
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-blue-100 sm:text-sm">
              कोणतीही फी नाही. थेट लॉग इन करा किंवा गेस्ट म्हणून सराव सुरू करा.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/exams"
                prefetch={true}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-xs font-black text-blue-700 shadow-md transition hover:bg-blue-50 active:scale-95 sm:text-sm"
              >
                <Zap className="h-4 w-4 text-amber-500" />
                <span>सर्व सराव परीक्षा पहा</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                prefetch={true}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-7 py-3.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/30 sm:text-sm"
              >
                मोफत खाते तयार करा
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
