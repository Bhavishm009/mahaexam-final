import Link from "next/link";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { HelpCircle, Sparkles, ChevronDown, ArrowRight, Zap } from "lucide-react";

export const metadata = {
  title: "वारंवार विचारले जाणारे प्रश्न (FAQ) — MahaExam",
  description:
    "महाराष्ट्र पोलीस भरती, तलाठी, MPSC, जिल्हा परिषद परीक्षांचे नियम, TCS/IBPS पॅटर्न, निगेटिव्ह मार्किंग आणि निकाल संबंधित सर्व प्रश्नांची उत्तरे.",
};

export default function FaqPage() {
  const faqs = [
    {
      q: "१. MahaExam वरील सराव परीक्षा खरोखर मोफत आहेत का?",
      a: "होय! आमच्या प्लॅटफॉर्मवर पोलीस भरती, तलाठी, MPSC, जिल्हा परिषद व वनरक्षक भरतीचे सर्व प्रमुख सराव पेपर्स १००% मोफत उपलब्ध आहेत. तुम्ही थेट 'Attempt Now' वर क्लिक करून सराव सुरू करू शकता.",
    },
    {
      q: "२. परीक्षांचा इंटरफेस प्रत्यक्ष परीक्षेसारखा (TCS / IBPS) असतो का?",
      a: "अगदी बरोबर! MahaExam चा टेस्ट इंजिन हुबेहूब TCS आणि IBPS च्या ऑनलाइन CBT इंटरफेसवर आधारित आहे. यामध्ये स्क्रीन टाइमर, प्रश्न पॅलेट, निगेटिव्ह मार्किंग आणि रिअल-टाइम स्कोअरिंग समाविष्ट आहे.",
    },
    {
      q: "३. परीक्षा दिल्यानंतर निकाल आणि रँक कधी समजते?",
      a: "टेस्ट सबमिट करताच एका सेकंदात तुमचा संपूर्ण निकाल, अचूकता (Accuracy), बरोबर व चुकीचे प्रश्न, मिळालेले गुण आणि महाराष्ट्र राज्यस्तरीय रँक स्क्रीनवर दिसते.",
    },
    {
      q: "४. मी मोबाईलवर किंवा 3G/4G नेटवर्कवर परीक्षा देऊ शकतो का?",
      a: "होय! MahaExam चे ॲप अत्यंत हलके (Lightweight PWA) आहे. हे कमी स्पीड असलेल्या इंटरनेटवरही विना-अडथळा चालते. तसेच तुम्ही Chrome किंवा Safari मध्ये 'Add to Home Screen' करून ॲपप्रमाणे वापरू शकता.",
    },
    {
      q: "५. अधिकृत PYQ (मागील वर्षांचे पेपर्स) मूळ स्वरूपात आहेत का?",
      a: "होय! तलाठी भरती २०२३ च्या विविध शिफ्ट्स, पोलीस भरती २०२१-२०२३, MPSC राज्यसेवा व संयुक्त पूर्व परीक्षांचे मूळ पेपर्स प्रश्न आणि अधिकृत उत्तरतालिकेसह समाविष्ट आहेत.",
    },
    {
      q: "६. कोचिंग क्लास किंवा शिक्षकांसाठी स्वतंत्र कन्सोल उपलब्ध आहे का?",
      a: "होय! कोचिंग क्लास संचालक स्वतःचे खाते उघडून स्वतःच्या अकॅडेमीच्या नावाने टेस्ट पेपर्स तयार करू शकतात, बॅच मॅनेज करू शकतात आणि विद्यार्थ्यांचे निकाल एक्सेल स्वरूपात डाउनलोड करू शकतात.",
    },
    {
      q: "७. परीक्षेदरम्यान इंटरनेट खंडित झाले तर काय होते?",
      a: "काळजी करू नका! आमचे टेस्ट इंजिन प्रत्येक प्रश्नाचे उत्तर तुमच्या ब्राऊझरमध्ये ऑटो-सेव्ह करते. इंटरनेट पुन्हा सुरू होताच तुमची उत्तरे सुरक्षितपणे सिंक होतात आणि वेळेचे नुकसान होत नाही.",
    },
    {
      q: "८. निगेटिव्ह मार्किंग कसे मोजले जाते?",
      a: "ज्या परीक्षांमध्ये निगेटिव्ह मार्किंग आहे (उदा. पोलीस भरती किंवा MPSC), तिथे नियमानुसार प्रत्येक चुकीच्या उत्तरासाठी ०.२५ किंवा ०.५० गुण वजा करून अंतिम अचूक गुण दाखवले जातात.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <PublicNavbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
              <HelpCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              मदत व मार्गदर्शन केंद्र
            </span>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              वारंवार विचारले जाणारे प्रश्न (FAQ)
            </h1>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
              MahaExam प्लॅटफॉर्म, सराव परीक्षा, निकाल आणि तंत्रज्ञानाबाबत सामान्य प्रश्नांची स्पष्ट
              उत्तरे.
            </p>
          </div>

          {/* FAQ Accordion List */}
          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-black text-slate-900 dark:text-white sm:text-base">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          {/* Support CTA */}
          <div className="mt-14 rounded-3xl bg-blue-50 p-8 text-center dark:bg-blue-950/40">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              तुमचा प्रश्न सापडला नाही का?
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              आमची सपोर्ट टीम तुम्हाला मदत करण्यासाठी सदैव तत्पर आहे.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/exams"
                prefetch={true}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"
              >
                <Zap className="h-4 w-4 text-amber-300" />
                <span>सराव सुरू करा</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
