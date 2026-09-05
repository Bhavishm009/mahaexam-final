import { ImageResponse } from "next/og";
import { getDevanagariOgFont, ShapedText } from "@/lib/og-font";

export const runtime = "nodejs";
export const alt = "MahaExam — महाराष्ट्र स्पर्धा परीक्षा मॉक टेस्ट पोर्टल";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default async function Image() {
  const fontData = await getDevanagariOgFont();
  const fonts = fontData
    ? [
        {
          name: "Mukta",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ]
    : [];

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        backgroundColor: "#090d16",
        backgroundImage:
          "radial-gradient(circle at 15% 25%, rgba(37, 99, 235, 0.4), transparent 45%), radial-gradient(circle at 85% 75%, rgba(124, 58, 237, 0.35), transparent 45%)",
        padding: "50px 60px",
        color: "#ffffff",
        position: "relative",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "#ffffff",
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            ME
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text="MahaExam" fontSize={28} fill="#ffffff" />
            <ShapedText text="महाराष्ट्र स्पर्धा परीक्षा पोर्टल" fontSize={13} fill="#93c5fd" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            padding: "8px 18px",
            borderRadius: 9999,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <ShapedText text="● TCS / IBPS Mock Tests" fontSize={14} fill="#4ade80" />
        </div>
      </div>

      {/* Center Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ShapedText text="पोलीस भरती • MPSC • तलाठी भरती" fontSize={44} fill="#ffffff" />
        <ShapedText text="१०० गुणांच्या मोफत सराव चाचण्या" fontSize={38} fill="#c7d2fe" />
        <ShapedText
          text="२,७००+ प्रश्न, अचूक मराठी स्पष्टीकरण, राज्यस्तरीय रँक आणि परिपूर्ण परीक्षा सराव."
          fontSize={20}
          fill="#94a3b8"
        />
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          paddingTop: 18,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", gap: 24 }}>
          <ShapedText text="✓ १००% अचूक उत्तरतालिका" fontSize={15} fill="#e2e8f0" />
          <ShapedText text="✓ इन्स्टंट निकाल व रँक" fontSize={15} fill="#e2e8f0" />
          <ShapedText text="✓ मोबाईल व लॅपटॉप कम्पॅटिबल" fontSize={15} fill="#e2e8f0" />
        </div>
        <ShapedText text="mahaexam.com" fontSize={16} fill="#38bdf8" />
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}
