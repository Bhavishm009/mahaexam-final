import { createDynamicOgResponse, size, contentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "महाराष्ट्र सरकारी नोकरी व भरती जाहिराती २०२६ | MahaExam Job Alerts";
export { size, contentType };

export default async function Image() {
  return await createDynamicOgResponse({
    categoryBadge: "📢 अधिकृत भरती जाहिराती २०२६",
    badgeColor: "#f43f5e",
    badgeBg: "rgba(244, 63, 94, 0.15)",
    badgeBorder: "rgba(244, 63, 94, 0.3)",
    title: "महाराष्ट्र सरकारी भरती व नोकरी अलर्ट २०२६",
    subtitle: "पोलीस भरती • तलाठी • MPSC • जिल्हा परिषद • वनरक्षक",
    description:
      "रिक्त पदे, शैक्षणिक पात्रता, वयोमर्यादा, अधिकृत PDF जाहिरात आणि मोफत सराव पेपर्ससह परिपूर्ण तयारी.",
    accentGradient:
      "radial-gradient(circle at 15% 20%, rgba(225, 29, 72, 0.45), transparent 45%), radial-gradient(circle at 85% 80%, rgba(234, 88, 12, 0.4), transparent 45%)",
    stats: [
      { label: "दैनिक अलर्ट", sub: "अधिकृत जाहिराती", color: "#38bdf8" },
      { label: "पात्रता व अर्ज", sub: "थेट अधिकृत लिंक", color: "#4ade80" },
      { label: "मोफत सराव", sub: "ऑनलाइन टेस्ट्स", color: "#fb923c" },
    ],
    footerAction: "जाहिराती पहा ➔",
  });
}
