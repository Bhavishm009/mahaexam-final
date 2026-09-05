import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/lib/blog-service";
import { getDevanagariOgFont } from "@/lib/og-font";

export const runtime = "nodejs";
export const alt = "MahaExam Blog Article";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = await params;
  let blog = null;
  try {
    blog = await getBlogPostBySlug(slug);
  } catch {}

  const fontData = await getDevanagariOgFont();
  const fonts = fontData
    ? [
        {
          name: "Noto Sans Devanagari",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ]
    : [];

  const title = blog?.title || "MahaExam स्पर्धा परीक्षा मार्गदर्शक व बातम्या";
  const category = blog?.category || "MahaExam Blog";
  const author = blog?.authorName || "MahaExam Team";
  const dateStr = blog?.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "2026";

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
          "radial-gradient(circle at 15% 20%, rgba(79, 70, 229, 0.45), transparent 45%), radial-gradient(circle at 85% 80%, rgba(147, 51, 234, 0.4), transparent 45%)",
        padding: "60px 70px",
        fontFamily: '"Noto Sans Devanagari", sans-serif',
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
              background: "linear-gradient(135deg, #4f46e5, #9333ea)",
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
              Maha<span style={{ color: "#818cf8" }}>Exam</span>
            </span>
            <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>
              Knowledge Hub & Articles 📚
            </span>
          </div>
        </div>

        <div
          style={{
            padding: "8px 20px",
            borderRadius: 30,
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            border: "1px solid rgba(129, 140, 248, 0.3)",
            fontSize: 15,
            fontWeight: 700,
            color: "#a5b4fc",
          }}
        >
          {category}
        </div>
      </div>

      {/* Middle Content Row */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1000 }}>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 900,
            lineHeight: 1.2,
            color: "#ffffff",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Bottom Footer Info */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: 16, color: "#cbd5e1", fontWeight: 600 }}>
            ✍️ {author}
          </span>
          <span style={{ fontSize: 16, color: "#94a3b8" }}>•</span>
          <span style={{ fontSize: 16, color: "#cbd5e1", fontWeight: 600 }}>
            📅 {dateStr}
          </span>
        </div>

        <span style={{ fontSize: 16, fontWeight: 700, color: "#818cf8" }}>
          mahaexam.in/blogs
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts,
    }
  );
}
