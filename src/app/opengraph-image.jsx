import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "MahaExam — महाराष्ट्र स्पर्धा परीक्षा मॉक टेस्ट पोर्टल";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
        fontFamily: "sans-serif",
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              MahaExam
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#93c5fd",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              स्पर्धा परीक्षा पोर्टल २०२६
            </span>
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
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#10b981",
            }}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#f3f4f6",
            }}
          >
            TCS / IBPS लेटेस्ट पॅटर्न
          </span>
        </div>
      </div>

      {/* Center Main Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 10,
              backgroundColor: "rgba(249, 115, 22, 0.2)",
              border: "1px solid rgba(249, 115, 22, 0.4)",
              color: "#fdba74",
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            🎯 महाराष्ट्र भरती टेस्ट सिरीज
          </span>
        </div>

        <h1
          style={{
            fontSize: 54,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            margin: 0,
            background: "linear-gradient(to right, #ffffff, #e0e7ff, #93c5fd)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          पोलीस भरती • तलाठी • MPSC
          <br />
          १०० गुणांच्या ऑनलाइन मॉक टेस्ट
        </h1>

        <p
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: "#94a3b8",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          २,७००+ दर्जेदार प्रश्न, मराठी स्पष्टीकरण, इन्स्टंट महाराष्ट्र मेरिट रँक आणि अचूक
          उत्तरतालिका.
        </p>
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#38bdf8" }}>२,७००+ प्रश्न</span>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
              १० विषयनिहाय बँक
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#4ade80" }}>
              २७+ संपूर्ण टेस्ट
            </span>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
              १००% मोफत व सराव
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#c084fc" }}>राज्यस्तरीय रँक</span>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
              रिअल-टाइम विश्लेषण
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 24px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 800,
            boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4)",
          }}
        >
          <span>mahaexam.com</span>
          <span>➔</span>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
