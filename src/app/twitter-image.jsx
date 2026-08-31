import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "MahaExam — महाराष्ट्र स्पर्धा परीक्षा मॉक टेस्ट पोर्टल";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
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
          fontFamily: "sans-serif",
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
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#ffffff" }}>MahaExam</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd" }}>महाराष्ट्र स्पर्धा परीक्षा पोर्टल</span>
            </div>
          </div>

          <div
            style={{
              padding: "8px 18px",
              borderRadius: 9999,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#4ade80",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            ● TCS / IBPS Mock Tests
          </div>
        </div>

        {/* Center Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 900,
              lineHeight: 1.15,
              margin: 0,
              background: "linear-gradient(to right, #ffffff, #c7d2fe, #93c5fd)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            पोलीस भरती • MPSC • तलाठी भरती
            <br />
            १०० गुणांच्या मोफत सराव चाचण्या
          </h1>
          <p style={{ fontSize: 20, color: "#94a3b8", margin: 0, fontWeight: 500 }}>
            २,७००+ प्रश्न, अचूक मराठी स्पष्टीकरण, राज्यस्तरीय रँक आणि परिपूर्ण परीक्षा सराव.
          </p>
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
          <div style={{ display: "flex", gap: 24, fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>
            <span>✓ १००% अचूक उत्तरतालिका</span>
            <span>✓ इन्स्टंट निकाल व रँक</span>
            <span>✓ मोबाईल व लॅपटॉप कम्पॅटिबल</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8" }}>mahaexam.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
