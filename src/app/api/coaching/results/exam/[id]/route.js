import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          student: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
      batches: {
        include: {
          batch: {
            include: {
              students: {
                include: {
                  student: {
                    include: {
                      user: { select: { id: true, name: true, email: true, phone: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      batchAssignments: {
        include: {
          batch: {
            include: {
              memberships: {
                where: { status: "ACTIVE" },
                include: {
                  student: { select: { id: true, name: true, email: true, phone: true } },
                },
              },
            },
          },
        },
      },
      examPurchaseRecords: {
        where: { status: "PAID" },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
    },
  });

  if (!exam || (s.role !== "SUPER_ADMIN" && exam.organizationId !== s.organizationId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 1. Gather all assigned unique students
  const assignedMap = new Map();
  for (const es of exam.students || []) {
    if (es.student) {
      assignedMap.set(es.student.id, es.student);
    }
  }
  for (const eb of exam.batches || []) {
    for (const bs of eb.batch?.students || []) {
      if (bs.student?.user) {
        assignedMap.set(bs.student.user.id, bs.student.user);
      }
    }
  }
  for (const ba of exam.batchAssignments || []) {
    for (const bm of ba.batch?.memberships || []) {
      if (bm.student) {
        assignedMap.set(bm.student.id, bm.student);
      }
    }
  }
  for (const ep of exam.examPurchaseRecords || []) {
    if (ep.user) {
      assignedMap.set(ep.user.id, ep.user);
    }
  }

  // 2. Fetch all attempts and results for this exam
  const [attempts, summaries] = await Promise.all([
    prisma.examAttempt.findMany({
      where: { examId: exam.id },
      include: {
        student: { select: { id: true, name: true, email: true, phone: true } },
        secureAnswers: { select: { id: true } },
        answers: { select: { id: true } },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.examResultSummary.findMany({
      where: { examId: exam.id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        subjectBreakdown: { include: { subject: true } },
      },
      orderBy: { rank: "asc" },
    }),
  ]);

  // Map students who attempted even if not directly in assignedMap (e.g. global/self-enrolled)
  for (const att of attempts) {
    if (att.student && !assignedMap.has(att.student.id)) {
      assignedMap.set(att.student.id, att.student);
    }
  }

  // 3. Build Student Status Roster
  const summaryByStudent = new Map();
  for (const sum of summaries) {
    summaryByStudent.set(sum.studentId, sum);
  }

  const latestAttemptByStudent = new Map();
  for (const att of attempts) {
    if (!latestAttemptByStudent.has(att.studentId)) {
      latestAttemptByStudent.set(att.studentId, att);
    }
  }

  let submittedCount = 0;
  let inProgressCount = 0;
  let absentCount = 0;

  const studentRoster = Array.from(assignedMap.values()).map((st) => {
    const sum = summaryByStudent.get(st.id);
    const att = latestAttemptByStudent.get(st.id);

    let status = "NOT_STARTED";
    let score = null;
    let percentage = null;
    let submittedAt = null;
    let attemptId = att?.id || null;

    if (sum || att?.status === "SUBMITTED" || att?.status === "AUTO_SUBMITTED") {
      status = "SUBMITTED";
      submittedCount++;
      score = sum?.obtainedMarks ?? att?.score ?? 0;
      percentage = sum?.percentage ?? att?.percentage ?? 0;
      submittedAt = sum?.evaluatedAt || att?.submittedAt;
    } else if (att?.status === "IN_PROGRESS") {
      status = "IN_PROGRESS";
      inProgressCount++;
    } else {
      absentCount++;
    }

    return {
      id: st.id,
      name: st.name || "Student",
      email: st.email,
      phone: st.phone,
      status,
      score,
      percentage,
      rank: sum?.rank || null,
      passed: sum?.passed ?? (percentage !== null ? percentage >= 40 : null),
      attemptId,
      startedAt: att?.startedAt || null,
      submittedAt,
      answeredCount: att?.secureAnswers?.length || att?.answers?.length || 0,
    };
  });

  const isPublished = Boolean(exam.frozenAt || exam.status === "RESULTS_PUBLISHED");

  return NextResponse.json({
    exam: {
      id: exam.id,
      title: exam.title,
      slug: exam.slug,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      totalQuestions: exam.totalQuestions,
      startAt: exam.startAt,
      endAt: exam.endAt,
      status: exam.status,
      frozenAt: exam.frozenAt,
      isPublished,
    },
    stats: {
      totalAssigned: assignedMap.size,
      submittedCount,
      inProgressCount,
      absentCount,
    },
    students: studentRoster,
    results: summaries,
  });
}

export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    select: { id: true, organizationId: true, title: true, status: true },
  });

  if (!exam || (s.role !== "SUPER_ADMIN" && exam.organizationId !== s.organizationId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { action, studentId } = body;

    if (action === "PUBLISH_RESULTS") {
      // Manually publish results & unlock answer keys for all students immediately
      await prisma.exam.update({
        where: { id },
        data: {
          frozenAt: new Date(),
          status: "RESULTS_PUBLISHED",
        },
      });

      return NextResponse.json({
        success: true,
        message: "निकाल व अचूक उत्तरतालिका सर्व विद्यार्थ्यांसाठी त्वरित प्रसिद्ध करण्यात आली आहे.",
      });
    }

    if (action === "RESET_ATTEMPT") {
      if (!studentId) {
        return NextResponse.json(
          { error: "Student ID is required to reset attempt" },
          { status: 400 },
        );
      }

      // Delete past attempts so the student can start fresh
      const deletedAttempts = await prisma.examAttempt.deleteMany({
        where: { examId: id, studentId },
      });

      // Also remove results
      await prisma.examResultSummary.deleteMany({
        where: { examId: id, studentId },
      });
      await prisma.examResult.deleteMany({
        where: { examId: id, studentId },
      });
      await prisma.result.deleteMany({
        where: { examId: id, studentId },
      });

      return NextResponse.json({
        success: true,
        message: `विद्यार्थ्यांचा प्रयत्न यशस्वीपणे रीसेट करण्यात आला आहे. विद्यार्थी पुन्हा परीक्षा देऊ शकतात. (${deletedAttempts.count} attempts reset)`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Coaching exam action error:", error);
    return NextResponse.json({ error: error.message || "Action failed" }, { status: 500 });
  }
}
