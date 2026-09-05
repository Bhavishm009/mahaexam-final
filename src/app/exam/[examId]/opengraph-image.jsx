import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { getDevanagariOgFont, ShapedText } from "@/lib/og-font";

export const runtime = "nodejs";
export const alt = "MahaExam सराव परीक्षा";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const fallbackExams = {
  "police-01": {
    title: "महाराष्ट्र पोलीस भरती सराव प्रश्नपत्रिका ०१",
    category: "पोलीस भरती",
    questions: 100,
    duration: 90,
    marks: 100,
  },
  "mpsc-01": {
    title: "MPSC राज्यसेवा सामान्य अध्ययन पेपर १ सराव चाचणी",
    category: "MPSC राज्यसेवा",
    questions: 100,
    duration: 120,
    marks: 200,
  },
  "talathi-01": {
    title: "महाराष्ट्र तलाठी भरती TCS पॅटर्न संपूर्ण सराव परीक्षा",
    category: "तलाठी भरती",
    questions: 100,
    duration: 120,
    marks: 200,
  },
  "zp-01": {
    title: "जिल्हा परिषद (ZP) भरती IBPS पॅटर्न सराव टेस्ट",
    category: "जिल्हा परिषद",
    questions: 100,
    duration: 120,
    marks: 200,
  },
};

export default async function Image({ params }) {
  const { examId } = await params;

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

  let exam = fallbackExams[examId] || null;

  if (!exam && examId) {
    try {
      const dbExam = await prisma.exam.findFirst({
        where: {
          OR: [{ id: examId }, { slug: examId }],
        },
        select: {
          title: true,
          totalQuestions: true,
          durationMinutes: true,
          totalMarks: true,
          category: { select: { name: true } },
        },
      });

      if (dbExam) {
        exam = {
          title: dbExam.title,
          category: dbExam.category?.name || "MahaExam Test Series",
          questions: dbExam.totalQuestions || 100,
          duration: dbExam.durationMinutes || 90,
          marks: dbExam.totalMarks || 100,
        };
      }
    } catch {
      // fallback below
    }
  }

  if (!exam) {
    exam = {
      title: `${examId?.replace(/-/g, " ")?.toUpperCase() || "सराव परीक्षा"}`,
      category: "MahaExam Test Series",
      questions: 100,
      duration: 90,
      marks: 100,
    };
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
        backgroundColor: "#050814",
        backgroundImage:
          "radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.45), transparent 45%), radial-gradient(circle at 10% 80%, rgba(220, 38, 38, 0.35), transparent 45%), radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.25), transparent 50%)",
        padding: "60px 70px",
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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 900,
            }}
          >
            ME
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text="MahaExam" fontSize={30} fill="#ffffff" />
            <ShapedText text="LIVE MOCK TEST PORTAL" fontSize={14} fill="#93c5fd" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            padding: "8px 20px",
            borderRadius: 9999,
            backgroundColor: "rgba(37, 99, 235, 0.25)",
            border: "1px solid rgba(59, 130, 246, 0.5)",
          }}
        >
          <ShapedText text={exam.category} fontSize={16} fill="#93c5fd" />
        </div>
      </div>

      {/* Center Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1050 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "6px 14px",
            borderRadius: 10,
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
          }}
        >
          <ShapedText text="● TCS / IBPS पॅटर्न ऑनलाईन परीक्षा" fontSize={15} fill="#6ee7b7" />
        </div>

        <ShapedText text={exam.title} fontSize={46} fill="#ffffff" />
        <ShapedText
          text="लगेच चाचणी सोडवा आणि आपला राज्यस्तरीय रँक व तपशीलवार निकाल पाहा!"
          fontSize={22}
          fill="#cbd5e1"
        />
      </div>

      {/* Bottom Exam Details & Badges */}
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
            <ShapedText text={`${exam.questions} प्रश्न`} fontSize={26} fill="#38bdf8" />
            <ShapedText text="वस्तुनिष्ठ बहुपर्यायी" fontSize={13} fill="#94a3b8" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text={`${exam.marks} गुण`} fontSize={26} fill="#facc15" />
            <ShapedText text="निगेटिव्ह मार्किंगसह" fontSize={13} fill="#94a3b8" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ShapedText text={`${exam.duration} मिनिटे`} fontSize={26} fill="#4ade80" />
            <ShapedText text="रिअल एक्झाम टायमर" fontSize={13} fill="#94a3b8" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 28px",
            borderRadius: 18,
            background: "linear-gradient(135deg, #10b981, #059669)",
            boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.5)",
          }}
        >
          <ShapedText text="आताच चाचणी सुरू करा ➔" fontSize={18} fill="#ffffff" />
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}
