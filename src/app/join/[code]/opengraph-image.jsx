import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { getDevanagariOgFont } from "@/lib/og-font";

export const runtime = "nodejs";
export const alt = "MahaExam कोचिंग बॅच आमंत्रण";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }) {
  const { code } = await params;

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

  let batchTitle = "स्पर्धा परीक्षा कोचिंग बॅच";
  let academyName = "MahaExam Partner Academy";

  if (code) {
    try {
      const invite = await prisma.coachingInvite.findUnique({
        where: { code: code.toUpperCase() },
        include: {
          organization: { select: { name: true } },
          batch: { select: { name: true } },
        },
      });

      if (invite) {
        if (invite.organization?.name) academyName = invite.organization.name;
        if (invite.batch?.name) batchTitle = invite.batch.name;
        else if (invite.name) batchTitle = invite.name;
      }
    } catch {
      // fallback
    }
  }

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        backgroundColor: "#060919",
        backgroundImage:
          "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.45), transparent 45%), radial-gradient(circle at 10% 80%, rgba(37, 99, 235, 0.35), transparent 45%)",
        padding: "60px 70px",
        fontFamily: '"Noto Sans Devanagari", sans-serif',
        color: "#ffffff",
      }}
    >
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 900,
            }}
          >
            ME
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: "#ffffff" }}>MahaExam</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#a5b4fc" }}>
              COACHING BATCH INVITE
            </span>
          </div>
        </div>

        <div
          style={{
            padding: "10px 22px",
            borderRadius: 9999,
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            border: "1px solid rgba(129, 140, 248, 0.5)",
            color: "#c7d2fe",
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          Code: {code?.toUpperCase()}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b" }}>🏛️ {academyName}</span>
        <h1
          style={{
            fontSize: 50,
            fontWeight: 900,
            lineHeight: 1.15,
            margin: 0,
            background: "linear-gradient(to right, #ffffff, #e0e7ff, #c7d2fe)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {batchTitle}
        </h1>
        <p style={{ fontSize: 22, color: "#94a3b8", margin: 0, fontWeight: 500 }}>
          अकॅडमीच्या खास सराव चाचण्या, रँकिंग आणि टेस्ट सिरीजमध्ये सहभागी होण्यासाठी लिंकवर क्लिक
          करा.
        </p>
      </div>

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
        <span style={{ fontSize: 18, color: "#cbd5e1", fontWeight: 700 }}>
          ✓ मोफत नोंदणी • इन्स्टंट टेस्ट अॅक्सेस • अचूक विश्लेषण
        </span>
        <div
          style={{
            padding: "14px 28px",
            borderRadius: 18,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 900,
          }}
        >
          बॅचमध्ये जॉईन व्हा ➔
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}
