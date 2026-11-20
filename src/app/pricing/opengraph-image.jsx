import { createDynamicOgResponse, size, contentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "किंमत व प्लॅन्स (Pricing & Plans) — MahaExam";
export { size, contentType };

export default async function Image() {
  return await createDynamicOgResponse({
    categoryBadge: "💎 १००% मोफत व परवडणारे प्लॅन्स",
    badgeColor: "#22c55e",
    badgeBg: "rgba(34, 197, 94, 0.15)",
    badgeBorder: "rgba(34, 197, 94, 0.3)",
    title: "पारदर्शक प्लॅन्स — विद्यार्थी व अकॅडेमीसाठी",
    subtitle: "कायमस्वरूपी मोफत सराव • प्रो पास • अकॅडेमी कन्सोल",
    description:
      "कोणतीही छुपी फी नाही. मोफत अमर्यादित सराव, अस्सल PYQ पेपर्स आणि अकॅडेमीसाठी संपूर्ण ऑनलाइन टेस्ट पोर्टल.",
    accentGradient:
      "radial-gradient(circle at 15% 20%, rgba(16, 185, 129, 0.45), transparent 45%), radial-gradient(circle at 85% 80%, rgba(37, 99, 235, 0.4), transparent 45%)",
    stats: [
      { label: "₹० मोफत प्लॅन", sub: "कायमस्वरूपी सराव", color: "#4ade80" },
      { label: "₹१९९ प्रो पास", sub: "६ महिने वैधता", color: "#38bdf8" },
      { label: "अकॅडेमी कन्सोल", sub: "अमर्यादित बॅच", color: "#f43f5e" },
    ],
    footerAction: "प्लॅन्स पहा ➔",
  });
}
