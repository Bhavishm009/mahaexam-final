import { createDynamicOgResponse, size, contentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "अकॅडेमी व शिक्षकांसाठी (For Coaching Institutes) — MahaExam";
export { size, contentType };

export default async function Image() {
  return await createDynamicOgResponse({
    categoryBadge: "🏫 अकॅडेमी व शिक्षकांसाठी",
    badgeColor: "#ec4899",
    badgeBg: "rgba(236, 72, 153, 0.15)",
    badgeBorder: "rgba(236, 72, 153, 0.3)",
    title: "तुमच्या अकॅडेमीचे स्वतःचे ऑनलाइन टेस्ट पोर्टल",
    subtitle: "५०,०००+ प्रश्न बँक • १-क्लिक पेपर जनरेटर • बॅच व्यवस्थापन",
    description:
      "स्वतःच्या नावाचा ऑनलाइन सराव ब्रँड उभारा. बॅचनुसार टेस्ट शेड्युल करा आणि एक्सेल मेरिट लिस्ट डाउनलोड करा.",
    accentGradient:
      "radial-gradient(circle at 10% 20%, rgba(219, 39, 119, 0.45), transparent 45%), radial-gradient(circle at 90% 80%, rgba(79, 70, 229, 0.4), transparent 45%)",
    stats: [
      { label: "५०,०००+ बँक", sub: "वर्गीकृत प्रश्न", color: "#38bdf8" },
      { label: "१-क्लिक जनरेटर", sub: "झटपट पेपर्स", color: "#4ade80" },
      { label: "थेट फी संकलन", sub: "अकॅडेमी खाते", color: "#f43f5e" },
    ],
    footerAction: "अकॅडेमी सुरू करा ➔",
  });
}
