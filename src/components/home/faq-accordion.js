"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const defaultFaqsData = [
  {
    qMr: "मॉक टेस्ट्स मराठी आणि इंग्रजी दोन्ही भाषेत उपलब्ध आहेत का?",
    qEn: "Are the mock tests available in both Marathi and English?",
    aMr: "होय, महाएक्झामवरील सर्व परीक्षा मराठी आणि इंग्रजी दोन्ही भाषेत उपलब्ध आहेत. परीक्षेदरम्यान तुम्ही एका क्लिकवर प्रश्न मराठी किंवा इंग्रजीत पाहू शकता.",
    aEn: "Yes! All mock tests on MahaExam are fully bilingual. You can switch between Marathi and English with one click during the examination.",
  },
  {
    qMr: "परीक्षेत अँटी-चीटिंग आणि फुलस्क्रीन सुविधा आहे का?",
    qEn: "Does the platform enforce anti-cheating and fullscreen mode?",
    aMr: "होय, परीक्षा सुरू होताच ती सुरक्षित फुलस्क्रीन मोडमध्ये जाते. टॅब बदलणे, कॉपी-पेस्ट करणे आणि इतर गैरप्रकारांवर स्वयंचलित नियंत्रण ठेवले जाते.",
    aEn: "Yes! When an exam is started, it enters secure fullscreen mode, detects tab switching, and prevents copy-pasting with automated proctoring.",
  },
  {
    qMr: "कोचिंग क्लासेस स्वतःच्या प्रश्नपत्रिका तयार करू शकतात का?",
    qEn: "Can coaching academies create their own question papers?",
    aMr: "नक्कीच! अकॅडेमी संचालक स्वतःचे प्रश्न बँक तयार करू शकतात, CSV फाईलने प्रश्न अपलोड करू शकतात आणि बॅचनुसार परीक्षा घेऊ शकतात.",
    aEn: "Absolutely! Coaching institutes can upload MCQ questions in bulk via CSV, create custom question banks, and conduct batch-wise exams.",
  },
  {
    qMr: "परीक्षेनंतर निकाल व रँक कधी मिळते?",
    qEn: "When do students receive their rank and scorecards?",
    aMr: "परीक्षा सबमिट करताच त्वरित संपूर्ण निकाल, अचूकता टक्केवारी, निगेटिव्ह मार्किंग वजावट आणि राज्यस्तरीय रँक मिळते.",
    aEn: "Immediately upon submission! Students receive complete scorecards with accuracy breakdown, negative marking deduction, and statewide rank.",
  },
];

export function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState(null);
  const { language, t } = useLanguage();

  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            {t.faqTitle}
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            {t.faqSubtitle}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {defaultFaqsData.map((faq, idx) => {
            const isOpen = openFaq === idx;
            const questionText = language === "mr" ? faq.qMr : faq.qEn;
            const answerText = language === "mr" ? faq.aMr : faq.aEn;

            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-slate-900 transition hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800/50 sm:p-5 sm:text-sm"
                >
                  <span className="pr-4">{questionText}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-300 sm:p-5 sm:text-sm">
                    {answerText}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

