import { ImageResponse } from "next/og";
import { getJobAlertById } from "@/lib/job-service";

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
        fontFamily: "sans-serif",
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}>
              Maha<span style={{ color: "#60a5fa" }}>Exam</span>
            </span>
            <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>
              Govt Job Alerts 🔔
            </span>
          </div>
        </div>

        <div
          style={{
            padding: "8px 20px",
            borderRadius: 30,
            backgroundColor: "rgba(225, 29, 72, 0.2)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            fontSize: 15,
            fontWeight: 700,
            color: "#fda4af",
          }}
        >
          {dept}
        </div>
      </div>

      {/* Middle Content Row */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1000 }}>
        <h1
          style={{
            fontSize: 46,
            fontWeight: 900,
            lineHeight: 1.2,
            color: "#ffffff",
            margin: 0,
          }}
        >
          {title}
        </h1>
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>एकूण रिक्त पदे</span>
            <span style={{ fontSize: 20, color: "#38bdf8", fontWeight: 900 }}>{vacancies}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>अर्ज अंतिम तारीख</span>
            <span style={{ fontSize: 20, color: "#f43f5e", fontWeight: 900 }}>{lastDate}</span>
          </div>
        </div>

        <span style={{ fontSize: 16, fontWeight: 700, color: "#60a5fa" }}>
          mahaexam.in/jobs
        </span>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
