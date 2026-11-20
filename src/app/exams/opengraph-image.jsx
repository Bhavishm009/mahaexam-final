import { createDynamicOgResponse, size, contentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "महाराष्ट्र स्पर्धा परीक्षा सराव दालन २०२६ | MahaExam";
export { size, contentType };

export default async function Image() {
  return await createDynamicOgResponse({
    categoryBadge: "● TCS / IBPS अधिकृत पॅटर्न",
    badgeColor: "#4ade80",
    badgeBg: "rgba(74, 222, 128, 0.15)",
    badgeBorder: "rgba(74, 222, 128, 0.3)",
    title: "महाराष्ट्र स्पर्धा परीक्षा सराव दालन २०२६",
    subtitle: "पोलीस भरती • तलाठी • MPSC • जिल्हा परिषद",
    description:
      "२९+ मोफत ऑनलाइन टेस्ट्स, अचूक निगेटिव्ह मार्किंग, राज्यस्तरीय गुणवत्ता यादी व सविस्तर निकाल विश्लेषण.",
    accentGradient:
      "radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.5), transparent 45%), radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.4), transparent 45%)",
    stats: [
      { label: "२९+ टेस्ट्स", sub: "१००% मोफत व लाइव्ह", color: "#38bdf8" },
      { label: "२,७००+ प्रश्न", sub: "TCS / IBPS पॅटर्न", color: "#4ade80" },
      { label: "मेरिट रँक", sub: "राज्यस्तरीय तुलना", color: "#c084fc" },
    ],
    footerAction: "सराव सुरू करा ➔",
  });
}
