import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { getDevanagariOgFont, ShapedText } from "@/lib/og-font";

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
          name: "Mukta",
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
          "radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.5), transparent 45%), radial-gradient(circle at 85% 80%, rgba(124, 58, 237, 0.4), transparent 45%)",
        padding: "60px 70px",
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
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text="MahaExam" fontSize={30} fill="#ffffff" />
            <ShapedText text="COACHING BATCH INVITE" fontSize={14} fill="#a5b4fc" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            padding: "10px 22px",
            borderRadius: 9999,
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            border: "1px solid rgba(129, 140, 248, 0.5)",
          }}
        >
          <ShapedText text={`Code: ${code?.toUpperCase()}`} fontSize={16} fill="#c7d2fe" />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <ShapedText text={`🏛️ ${academyName}`} fontSize={18} fill="#f59e0b" />
        <ShapedText text={batchTitle} fontSize={48} fill="#ffffff" />
        <ShapedText
          text="अकॅडमीच्या खास सराव चाचण्या, रँकिंग आणि टेस्ट सिरीजमध्ये सहभागी होण्यासाठी लिंकवर क्लिक करा."
          fontSize={22}
          fill="#94a3b8"
        />
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
        <ShapedText
          text="✓ मोफत नोंदणी • इन्स्टंट टेस्ट अॅक्सेस • अचूक विश्लेषण"
          fontSize={18}
          fill="#cbd5e1"
        />
        <div
          style={{
            display: "flex",
            padding: "14px 28px",
            borderRadius: 18,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          }}
        >
          <ShapedText text="बॅचमध्ये जॉईन व्हा ➔" fontSize={18} fill="#ffffff" />
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
    }
  );
}
