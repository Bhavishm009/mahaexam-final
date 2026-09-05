import Link from "next/link";
import { Check, Sparkles, Zap, Building2, User, ArrowRight } from "lucide-react";

import { getSeoForRoute } from "@/lib/seo-service";

export async function generateMetadata() {
  return await getSeoForRoute("/pricing", {
    title: "किंमत व प्लॅन्स (Pricing & Plans) — MahaExam",
    description:
      "विद्यार्थी आणि अकॅडेमीसाठी पारदर्शक व परवडणारे प्लॅन्स. १००% मोफत सराव पेपर्स आणि प्रगत टेस्ट सिरीज पॅकेजेस.",
  });
}

export default function PricingPage() {
  const studentPlans = [
    {
      name: "मोफत सराव (Free Plan)",
      price: "₹०",
      period: "कायमस्वरूपी मोफत",
      desc: "स्पर्धा परीक्षेची सुरुवात करणाऱ्या विद्यार्थ्यांसाठी उत्तम.",
      features: [
        "सर्व २९+ लाइव्ह सराव परीक्षा",
        "प्रत्येक परीक्षेचा अचूक स्कोर",
        "महाराष्ट्र राज्यस्तरीय रँक",
        "मराठी व इंग्रजी भाषा सपोर्ट",
        "मोबाईल व PWA ॲप सपोर्ट",
      ],
      ctaText: "आताच मोफत सराव करा",
      ctaHref: "/exams",
      popular: false,
    },
    {
      name: "विद्यार्थी प्रो पास (Pro Aspirant)",
      price: "₹१९९",
      period: "६ महिने वैधता",
      desc: "अस्सल PYQ पेपर्स आणि सविस्तर स्पष्टीकरणांसह संपूर्ण तयारी.",
      features: [
        "सर्व मोफत फीचर्स समाविष्ट",
        "मागील १० वर्षांचे अधिकृत PYQ पेपर्स",
        "प्रत्येक प्रश्नाचे सविस्तर स्पष्टीकरण (PDF)",
        "AI आधारित कमकुवत विषय विश्लेषण",
        "अमर्यादित वेळा फेरपरीक्षा (Re-attempt)",
        "जाहिरातमुक्त अनुभव (Ad-Free)",
      ],
      ctaText: "प्रो पास मिळवा",
      ctaHref: "/register",
      popular: true,
    },
  ];

  const coachingPlans = [
    {
      name: "अकॅडेमी स्टार्टर (Starter)",
      price: "₹९९९",
      period: "प्रति महिना",
      desc: "लहान क्लास किंवा वैयक्तिक शिक्षकांसाठी योग्य.",
      features: [
        "१०० विद्यार्थ्यांपर्यंत क्षमता",
        "५०,०००+ प्रश्न बँक ऍक्सेस",
        "महिन्याला २० स्वतःचे पेपर्स तयार करा",
        "ऑटोमॅटिक निकाल व रँक लिस्ट",
        "ईमेल व व्हॉट्सॲप सपोर्ट",
      ],
      ctaHref: "/coaching/register",
    },
    {
      name: "अकॅडेमी प्रो (Pro Coaching)",
      price: "₹२,४९९",
      period: "प्रति महिना",
      desc: "मोठ्या अकॅडेमी आणि टेस्ट सिरीज संस्थांसाठी परिपूर्ण.",
      features: [
        "अमर्यादित विद्यार्थी क्षमता",
        "अमर्यादित पेपर्स व सराव परीक्षा",
        "अकॅडेमीच्या स्वतःच्या नावाने व लोगोने टेस्ट",
        "विद्यार्थी टेस्ट सिरीज विक्री प्लॅटफॉर्म (Monetization)",
        "एक्सेल निकाल डाउनलोड व पालक रिपोर्ट",
        "प्राधान्य २४/७ सपोर्ट",
      ],
      ctaHref: "/coaching/register",
      popular: true,
    },
  ];

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            पारदर्शक व परवडणारे दर
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">
            योग्य प्लॅन निवडा व यश मिळवा
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            कोणतीही छुपी फी नाही. विद्यार्थी आणि अकॅडेमी दोघांसाठी सोयीस्कर पॅकेजेस.
          </p>
        </div>

        {/* Student Plans Section */}
        <div className="mt-14">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              विद्यार्थ्यांसाठी प्लॅन्स (Student Plans)
            </h2>
          </div>

          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {studentPlans.map((p, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col justify-between rounded-3xl border bg-white p-8 shadow-sm transition hover:shadow-xl dark:bg-slate-900 ${
                  p.popular
                    ? "border-2 border-blue-600 shadow-blue-500/10 dark:border-blue-500"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 right-6 rounded-full bg-blue-600 px-3.5 py-1 text-xs font-black text-white shadow-sm">
                    सर्वात लोकप्रिय (Most Popular)
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{p.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.desc}</p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {p.price}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      / {p.period}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {p.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <div className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href={p.ctaHref}
                    prefetch={true}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold transition active:scale-95 ${
                      p.popular
                        ? "bg-blue-600 text-white shadow-md hover:bg-blue-500"
                        : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <span>{p.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coaching Plans Section */}
        <div className="mt-16">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              अकॅडेमी व क्लासेससाठी प्लॅन्स (For Coaching Institutes)
            </h2>
          </div>

          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {coachingPlans.map((p, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col justify-between rounded-3xl border bg-white p-8 shadow-sm transition hover:shadow-xl dark:bg-slate-900 ${
                  p.popular
                    ? "border-2 border-indigo-600 shadow-indigo-500/10 dark:border-indigo-500"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{p.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.desc}</p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {p.price}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      / {p.period}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {p.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <div className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href={p.ctaHref}
                    prefetch={true}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-500 active:scale-95"
                  >
                    <span>अकॅडेमी सुरू करा</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
