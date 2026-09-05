import { ImageResponse } from "next/og";
import { getJobAlertById } from "@/lib/job-service";
import { getDevanagariOgFont, ShapedText } from "@/lib/og-font";

export const runtime = "nodejs";
export const alt = "MahaExam Job Recruitment Alert";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }) {
  const { id } = await params;
  let job = null;
  try {
    job = await getJobAlertById(id);
  } catch {}

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

  const title = job?.titleMr || job?.title || "महाराष्ट्र सरकारी नोकरी जाहिरात";
  const dept = job?.department || "Maharashtra Government";
  const vacancies = job?.vacancies || "विविध पदे";
  const lastDate = job?.lastDate || "लवकरच घोषित";

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
          "radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.5), transparent 45%), radial-gradient(circle at 85% 80%, rgba(225, 29, 72, 0.4), transparent 45%)",
        padding: "60px 70px",
        color: "#ffffff",
        position: "relative",
      }}
    >
      {/* Decorative Border */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          bottom: 20,
          border: "1px solid rgba(255, 255, 255, 0.12)",
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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg, #2563eb, #e11d48)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 900,
              color: "#ffffff",
            }}
          >
            M
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text="MahaExam" fontSize={28} fill="#ffffff" />
            <ShapedText text="Govt Job Alerts 🔔" fontSize={13} fill="#9ca3af" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            padding: "8px 20px",
            borderRadius: 30,
            backgroundColor: "rgba(225, 29, 72, 0.2)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
          }}
        >
          <ShapedText text={dept} fontSize={15} fill="#fda4af" />
        </div>
      </div>

      {/* Middle Content Row */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1000 }}>
        <ShapedText text={title} fontSize={44} fill="#ffffff" />
      </div>

      {/* Bottom Key Details Grid */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          paddingTop: 24,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text="एकूण रिक्त पदे" fontSize={13} fill="#94a3b8" />
            <ShapedText text={vacancies} fontSize={20} fill="#38bdf8" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text="अर्ज अंतिम तारीख" fontSize={13} fill="#94a3b8" />
            <ShapedText text={lastDate} fontSize={20} fill="#f43f5e" />
          </div>
        </div>

        <ShapedText text="mahaexam.in/jobs" fontSize={16} fill="#60a5fa" />
      </div>
    </div>,
    {
      ...size,
      fonts,
    }
  );
}
