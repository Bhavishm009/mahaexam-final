import { ImageResponse } from "next/og";
import { getDevanagariOgFont, ShapedText } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function createDynamicOgResponse({
  categoryBadge = "MahaExam २०२६",
  badgeColor = "#4ade80",
  badgeBg = "rgba(74, 222, 128, 0.15)",
  badgeBorder = "rgba(74, 222, 128, 0.3)",
  title = "महाराष्ट्र स्पर्धा परीक्षा सराव दालन",
  subtitle = "TCS / IBPS पॅटर्न ऑनलाइन मॉक टेस्ट",
  description = "पोलीस भरती, तलाठी, MPSC व जिल्हा परिषद परीक्षांसाठी १०० गुणांच्या परिपूर्ण ऑनलाइन सराव टेस्ट्स.",
  accentGradient = "radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.45), transparent 45%), radial-gradient(circle at 90% 80%, rgba(147, 51, 234, 0.35), transparent 45%)",
  stats = [
    { label: "२,७००+ प्रश्न", sub: "विषयनिहाय बँक", color: "#38bdf8" },
    { label: "१००% मोफत", sub: "TCS / IBPS पॅटर्न", color: "#4ade80" },
    { label: "राज्यस्तरीय रँक", sub: "इन्स्टंट विश्लेषण", color: "#c084fc" },
  ],
  footerAction = "mahaexam.com ➔",
}) {
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
        backgroundImage: `${accentGradient}, radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.12), transparent 50%)`,
        padding: "55px 65px",
        color: "#ffffff",
        position: "relative",
      }}
    >
      {/* Decorative Border */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          right: 18,
          bottom: 18,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 24,
          pointerEvents: "none",
        }}
      />

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
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 900,
              boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.5)",
            }}
          >
            ME
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <ShapedText text="MahaExam" fontSize={30} fill="#ffffff" />
            <ShapedText
              text="महाराष्ट्र स्पर्धा परीक्षा पोर्टल २०२६"
              fontSize={13}
              fill="#93c5fd"
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 18px",
            borderRadius: 9999,
            backgroundColor: badgeBg,
            border: `1px solid ${badgeBorder}`,
          }}
        >
          <ShapedText text={categoryBadge} fontSize={15} fill={badgeColor} />
        </div>
      </div>

      {/* Center Body */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 1040,
        }}
      >
        {subtitle && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "5px 12px",
              borderRadius: 8,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <ShapedText text={subtitle} fontSize={15} fill="#fde047" />
          </div>
        )}

        <ShapedText text={title} fontSize={title.length > 35 ? 38 : 46} fill="#ffffff" />

        {description && (
          <ShapedText
            text={description}
            fontSize={description.length > 80 ? 18 : 21}
            fill="#94a3b8"
          />
        )}
      </div>

      {/* Bottom Stats Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          paddingTop: 20,
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <div style={{ display: "flex", gap: 32 }}>
          {stats.map((s, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <ShapedText text={s.label} fontSize={22} fill={s.color || "#38bdf8"} />
              <ShapedText text={s.sub} fontSize={13} fill="#64748b" />
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 22px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            boxShadow: "0 8px 16px -4px rgba(37, 99, 235, 0.4)",
          }}
        >
          <ShapedText text={footerAction} fontSize={16} fill="#ffffff" />
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}
