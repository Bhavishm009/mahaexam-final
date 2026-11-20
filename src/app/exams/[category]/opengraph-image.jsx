import { createDynamicOgResponse, size, contentType } from "@/lib/og-template";
import { getCategoryBySlug } from "@/lib/exam-category-helper";

export const runtime = "nodejs";
export const alt = "महाराष्ट्र स्पर्धा परीक्षा कॅटेगरी सराव चाचण्या";
export { size, contentType };

export default async function Image({ params }) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);

  const title = cat ? `${cat.titleMr} संपूर्ण सराव चाचण्या` : "महाराष्ट्र स्पर्धा परीक्षा सराव";
  const desc =
    cat?.descriptionMr ||
    "TCS/IBPS पॅटर्नवर आधारित १०० गुणांचे ऑनलाइन सराव पेपर्स, निगेटिव्ह मार्किंग आणि निकाल विश्लेषण.";

  return await createDynamicOgResponse({
    categoryBadge: cat ? `🎯 ${cat.titleMr}` : "● सराव परीक्षा",
    badgeColor: "#38bdf8",
    badgeBg: "rgba(56, 189, 248, 0.15)",
    badgeBorder: "rgba(56, 189, 248, 0.3)",
    title,
    subtitle: "TCS / IBPS ऑनलाइन मॉक टेस्ट सिरीज २०२६",
    description: desc,
    accentGradient:
      "radial-gradient(circle at 15% 20%, rgba(14, 165, 233, 0.5), transparent 45%), radial-gradient(circle at 85% 80%, rgba(59, 130, 246, 0.4), transparent 45%)",
    stats: [
      { label: "१०० गुण", sub: "९० मिनिटे वेळ", color: "#38bdf8" },
      { label: "०.२५ निगेटिव्ह", sub: "अस्सल परीक्षा पॅटर्न", color: "#facc15" },
      { label: "इन्स्टंट रँक", sub: "राज्यस्तरीय गुणवत्ता", color: "#4ade80" },
    ],
    footerAction: "टेस्ट द्या ➔",
  });
}
