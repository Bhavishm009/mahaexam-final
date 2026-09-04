import Link from "next/link";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import {
  Building2,
  Users,
  FileCheck,
  Award,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers3,
  BookOpen,
} from "lucide-react";

import { getSeoForRoute } from "@/lib/seo-service";

export async function generateMetadata() {
  return await getSeoForRoute("/for-coaching", {
    title: "अकॅडेमी व शिक्षकांसाठी (For Coaching Institutes) — MahaExam",
    description:
      "तुमच्या अकॅडेमीसाठी स्वतःचे ऑनलाइन टेस्ट पोर्टल सुरू करा. ५०,०००+ प्रश्न बँक, ऑटो-पेपर जनरेटर, बॅच मॅनेजमेंट आणि थेट फी संकलन.",
  });
}

export default function ForCoachingPage() {
  const benefits = [
    {
      icon: BookOpen,
      title: "५०,०००+ अधिकृत प्रश्न बँक",
      desc: "पोलीस भरती, तलाठी, MPSC, जिल्हा परिषद परीक्षांचे वर्गीकरण केलेले प्रश्न तयार स्वरूपात उपलब्ध.",
    },
    {
      icon: Layers3,
      title: "१-क्लिक पेपर जनरेटर",
      desc: "विषय, काठिण्य पातळी आणि गुण निवडून काही सेकंदात १०० गुणांचा संपूर्ण सराव पेपर तयार करा.",
    },
    {
      icon: Users,
      title: "बॅच व विद्यार्थी व्यवस्थापन",
      desc: "विद्यार्थ्यांना बॅचनुसार ऍड करा, विशिष्ट बॅचसाठी टेस्ट शेड्युल करा आणि त्यांची उपस्थिती ट्रॅक करा.",
    },
    {
      icon: Award,
      title: "ऑटोमॅटिक निकाल व मेरिट लिस्ट",
      desc: "टेस्ट संपताच सर्व विद्यार्थ्यांचा निकाल, रँक आणि अचूकता एका क्लिकवर एक्सेल स्वरूपात मिळवा.",
    },
    {
      icon: Wallet,
      title: "टेस्ट सिरीज विक्री व थेट उत्पन्न",
      desc: "तुमच्या अकॅडेमीच्या टेस्ट सिरीज इतर विद्यार्थ्यांना विका. फी थेट तुमच्या बँक खात्यात जमा होते.",
    },
    {
      icon: ShieldCheck,
      title: "तुमचा स्वतःचा ब्रँड (White Label)",
      desc: "तुमच्या अकॅडेमीचे नाव, लोगो आणि वॉटरमार्कसह विद्यार्थ्यांना प्रगत डिजिटल अनुभव द्या.",
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
              <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              महाराष्ट्र कोचिंग क्लासेस व अकॅडेमीसाठी विशेष प्लॅटफॉर्म
            </span>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">
              तुमच्या अकॅडेमीला डिजिटल बनवा
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              कागदी प्रश्नपत्रिका आणि मॅन्युअल तपासणीचा त्रास थांबवा. MahaExam च्या मदतीने स्वतःचे
              ऑनलाइन टेस्ट पोर्टल फक्त ५ मिनिटांत सुरू करा.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/coaching/register"
                prefetch={true}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-xs font-black text-white shadow-md transition hover:bg-blue-500 active:scale-95 sm:text-sm"
              >
                <span>अकॅडेमी नोंदणी करा (मोफत ट्रायल)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/coaching/login"
                prefetch={true}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:text-sm"
              >
                संचालक लॉगिन (Director Login)
              </Link>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* How It Works */}
          <div className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12">
            <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
              अकॅडेमी कन्सोल कसे कार्य करते? (३ सोप्या पायऱ्या)
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">०१</div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  अकॅडेमी प्रोफाइल तयार करा
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  नाव, लोगो आणि पत्ता टाकून १ मिनिटात अकॅडेमी नोंदणी पूर्ण करा.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">०२</div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  पेपर तयार करा किंवा निवडा
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  तयार प्रश्न बँकेतून प्रश्न निवडा किंवा स्वतःचे प्रश्न टाईप/इम्पोर्ट करा.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">०३</div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  विद्यार्थ्यांना लिंक पाठवा
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  विद्यार्थी मोबाईलवर टेस्ट सोडवतील आणि तुम्हाला झटपट रँक लिस्ट मिळेल.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
