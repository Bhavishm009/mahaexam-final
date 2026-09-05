import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/lib/blog-service";
import { getDevanagariOgFont, ShapedText } from "@/lib/og-font";

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
          name: "Mukta",
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
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text="MahaExam" fontSize={28} fill="#ffffff" />
            <ShapedText text="Knowledge Hub & Articles 📚" fontSize={13} fill="#9ca3af" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            padding: "8px 20px",
            borderRadius: 30,
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            border: "1px solid rgba(129, 140, 248, 0.3)",
          }}
        >
          <ShapedText text={category} fontSize={15} fill="#a5b4fc" />
        </div>
      </div>

      {/* Middle Content Row */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1000 }}>
        <ShapedText text={title} fontSize={46} fill="#ffffff" />
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
          <ShapedText text={`✍️ ${author}`} fontSize={16} fill="#cbd5e1" />
          <span style={{ fontSize: 16, color: "#94a3b8" }}>•</span>
          <ShapedText text={`📅 ${dateStr}`} fontSize={16} fill="#cbd5e1" />
        </div>

        <ShapedText text="mahaexam.in/blogs" fontSize={16} fill="#818cf8" />
      </div>
    </div>,
    {
      ...size,
      fonts,
    }
  );
}
