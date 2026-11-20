import { createDynamicOgResponse, size, contentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "वैशिष्ट्ये (Features) — MahaExam ऑनलाइन टेस्ट प्लॅटफॉर्म";
export { size, contentType };

export default async function Image() {
  return await createDynamicOgResponse({
    categoryBadge: "⚡ प्रगत ऑनलाइन टेस्ट वैशिष्ट्ये",
    badgeColor: "#38bdf8",
    badgeBg: "rgba(56, 189, 248, 0.15)",
    badgeBorder: "rgba(56, 189, 248, 0.3)",
    title: "MahaExam ची अत्याधुनिक वैशिष्ट्ये",
    subtitle: "अस्सल TCS/IBPS इंजिन • द्विभाषिक • AI ॲनालिटिक्स",
    description:
      "रिअल-टाइम स्क्रीन टाइमर, ०.२५ निगेटिव्ह मार्किंग, राज्यस्तरीय गुणवत्ता यादी आणि प्रत्येक प्रश्नाचे सविस्तर मराठी स्पष्टीकरण.",
    accentGradient:
      "radial-gradient(circle at 10% 20%, rgba(2, 132, 199, 0.5), transparent 45%), radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.4), transparent 45%)",
    stats: [
      { label: "TCS / IBPS", sub: "रिअल एक्झाम फील", color: "#38bdf8" },
      { label: "AI विश्लेषण", sub: "कमकुवत विषय शोध", color: "#c084fc" },
      { label: "द्विभाषिक", sub: "मराठी व इंग्रजी", color: "#4ade80" },
    ],
    footerAction: "फीचर्स पहा ➔",
  });
}
