import { createDynamicOgResponse, size, contentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "वारंवार विचारले जाणारे प्रश्न (FAQ) — MahaExam";
export { size, contentType };

export default async function Image() {
  return await createDynamicOgResponse({
    categoryBadge: "❓ मदत व FAQ केंद्र",
    badgeColor: "#f59e0b",
    badgeBg: "rgba(245, 158, 11, 0.15)",
    badgeBorder: "rgba(245, 158, 11, 0.3)",
    title: "MahaExam मदत व FAQ केंद्र",
    subtitle: "परीक्षा नियम • निगेटिव्ह मार्किंग • तांत्रिक मदत",
    description:
      "पोलीस भरती, तलाठी, MPSC परीक्षा पद्धत, निकाल, अकॅडेमी नोंदणी आणि तांत्रिक अडचणींसंबंधित सर्व प्रश्नांची सविस्तर उत्तरे.",
    accentGradient:
      "radial-gradient(circle at 15% 20%, rgba(217, 119, 6, 0.45), transparent 45%), radial-gradient(circle at 85% 80%, rgba(37, 99, 235, 0.35), transparent 45%)",
    stats: [
      { label: "२४/७ मदत", sub: "ऑनलाईन मार्गदर्शन", color: "#38bdf8" },
      { label: "नियम व पॅटर्न", sub: "सविस्तर माहिती", color: "#4ade80" },
      { label: "मोफत सराव", sub: "विना-अडथळा", color: "#f59e0b" },
    ],
    footerAction: "मदत मिळवा ➔",
  });
}
