import { createDynamicOgResponse, size, contentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "महाराष्ट्र स्पर्धा परीक्षा ज्ञान केंद्र व ब्लॉग २०२६ | MahaExam Articles";
export { size, contentType };

export default async function Image() {
  return await createDynamicOgResponse({
    categoryBadge: "📚 स्पर्धा परीक्षा ज्ञान केंद्र व टॉपर नीती",
    badgeColor: "#a855f7",
    badgeBg: "rgba(168, 85, 247, 0.15)",
    badgeBorder: "rgba(168, 85, 247, 0.3)",
    title: "महाराष्ट्र स्पर्धा परीक्षा ब्लॉग व अभ्यास मार्गदर्शक",
    subtitle: "चालू घडामोडी • अभ्यासक्रम • टॉपर स्ट्रॅटेजी",
    description:
      "स्पर्धा परीक्षेत यश मिळवण्यासाठी अचूक संदर्भ पुस्तके, रिव्हिजन नोट्स, चालू घडामोडी आणि तज्ज्ञांचे मार्गदर्शन.",
    accentGradient:
      "radial-gradient(circle at 10% 20%, rgba(147, 51, 234, 0.45), transparent 45%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.4), transparent 45%)",
    stats: [
      { label: "अभ्यास नोट्स", sub: "मराठी माध्यम", color: "#38bdf8" },
      { label: "टॉपर स्ट्रॅटेजी", sub: "नियोजन व टिप्स", color: "#4ade80" },
      { label: "चालू घडामोडी", sub: "दैनिक अपडेट्स", color: "#c084fc" },
    ],
    footerAction: "ब्लॉग वाचा ➔",
  });
}
