import { ImageResponse } from "next/og";
import { getDevanagariOgFont, ShapedText } from "@/lib/og-font";

export const runtime = "nodejs";
export const alt = "MahaExam — महाराष्ट्र स्पर्धा परीक्षा मॉक टेस्ट पोर्टल";
export const size = {
  width: 1200,
  height: 630,
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
        backgroundColor: "#030712",
        backgroundImage:
          "radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.45), transparent 45%), radial-gradient(circle at 90% 80%, rgba(147, 51, 234, 0.35), transparent 45%), radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.15), transparent 50%)",
        padding: "60px 70px",
        color: "#ffffff",
        position: "relative",
      }}
    >
      {/* Subtle grid border overlay */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          bottom: 20,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 28,
          pointerEvents: "none",
        }}
      />

      {/* Top Header Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {/* Logo Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
              borderRadius: 18,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 900,
              boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.5)",
            }}
          >
            ME
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text="MahaExam" fontSize={32} fill="#ffffff" />
            <ShapedText text="स्पर्धा परीक्षा पोर्टल २०२६" fontSize={14} fill="#93c5fd" />
          </div>
        </div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 9999,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <ShapedText text="● TCS / IBPS लेटेस्ट पॅटर्न" fontSize={16} fill="#4ade80" />
        </div>
      </div>

      {/* Center Main Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 1050,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "6px 14px",
            borderRadius: 10,
            backgroundColor: "rgba(249, 115, 22, 0.2)",
            border: "1px solid rgba(249, 115, 22, 0.4)",
          }}
        >
          <ShapedText text="🎯 महाराष्ट्र भरती टेस्ट सिरीज" fontSize={16} fill="#fdba74" />
        </div>

        <ShapedText text="पोलीस भरती • तलाठी • MPSC" fontSize={48} fill="#ffffff" />
        <ShapedText text="१०० गुणांच्या ऑनलाइन मॉक टेस्ट" fontSize={42} fill="#c7d2fe" />
        <ShapedText
          text="२,७००+ दर्जेदार प्रश्न, मराठी स्पष्टीकरण, इन्स्टंट महाराष्ट्र मेरिट रँक आणि अचूक उत्तरतालिका."
          fontSize={20}
          fill="#94a3b8"
        />
      </div>

      {/* Bottom Stats Pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          paddingTop: 24,
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <div style={{ display: "flex", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text="२,७००+ प्रश्न" fontSize={24} fill="#38bdf8" />
            <ShapedText text="१० विषयनिहाय बँक" fontSize={13} fill="#64748b" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text="२७+ संपूर्ण टेस्ट" fontSize={24} fill="#4ade80" />
            <ShapedText text="१००% मोफत व सराव" fontSize={13} fill="#64748b" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text="राज्यस्तरीय रँक" fontSize={24} fill="#c084fc" />
            <ShapedText text="रिअल-टाइम विश्लेषण" fontSize={13} fill="#64748b" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 24px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4)",
          }}
        >
          <ShapedText text="mahaexam.com ➔" fontSize={18} fill="#ffffff" />
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}
