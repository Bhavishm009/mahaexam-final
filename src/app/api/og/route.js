import { createDynamicOgResponse } from "@/lib/og-template";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "महाराष्ट्र स्पर्धा परीक्षा पोर्टल २०२६";
  const subtitle = searchParams.get("subtitle") || "TCS / IBPS पॅटर्न ऑनलाइन मॉक टेस्ट";
  const categoryBadge = searchParams.get("badge") || "MahaExam २०२६";
  const description =
    searchParams.get("desc") ||
    "पोलीस भरती, तलाठी, MPSC व जिल्हा परिषद परीक्षांसाठी १०० गुणांच्या परिपूर्ण ऑनलाइन सराव टेस्ट्स.";

  return await createDynamicOgResponse({
    title,
    subtitle,
    categoryBadge,
    description,
  });
}
