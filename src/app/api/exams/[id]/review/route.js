import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scheduleExamNotifications } from "@/lib/exam-scheduler-service";

export async function GET(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden. Admin or Teacher access required." }, { status: 403 });
  }

  const { id: examIdOrSlug } = await params;
  if (!examIdOrSlug) {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
  }

  try {
    const exam = await prisma.exam.findFirst({
      where: {
        OR: [{ id: examIdOrSlug }, { slug: examIdOrSlug }],
      },
      include: {
        organization: { select: { id: true, name: true, district: true } },
        creator: { select: { id: true, name: true, email: true, role: true } },
        batches: { include: { batch: true } },
        sections: { orderBy: { position: "asc" } },
        questions: {
          orderBy: { questionOrder: "asc" },
          include: {
            question: {
              include: {
                options: { orderBy: { optionOrder: "asc" } },
                subject: true,
                topic: true,
              },
            },
          },
        },
        questionSnapshots: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Permission check for coaching admins and teachers
    if (s.role !== "SUPER_ADMIN") {
      if (exam.organizationId && exam.organizationId !== s.organizationId) {
        return NextResponse.json({ error: "Unauthorized access to this organization's exam" }, { status: 403 });
      }
    }

    return NextResponse.json({ exam, userRole: s.role });
  } catch (error) {
    console.error("Exam review API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: examIdOrSlug } = await params;
  try {
    const body = await request.json();
    const { action, startAt, endAt } = body;

    const exam = await prisma.exam.findFirst({
      where: { OR: [{ id: examIdOrSlug }, { slug: examIdOrSlug }] },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (s.role !== "SUPER_ADMIN" && exam.organizationId !== s.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let updatedStatus = exam.status;
    const updateData = {};

    if (action === "MAKE_LIVE") {
      updatedStatus = "LIVE";
      updateData.status = "LIVE";
    } else if (action === "SCHEDULE") {
      updatedStatus = "SCHEDULED";
      updateData.status = "SCHEDULED";
      if (startAt) {
        updateData.startAt = new Date(startAt);
      }
      if (endAt) {
        updateData.endAt = new Date(endAt);
      }
    } else if (action === "SET_DRAFT") {
      updatedStatus = "DRAFT";
      updateData.status = "DRAFT";
    }

    const updatedExam = await prisma.exam.update({
      where: { id: exam.id },
      data: updateData,
    });

    if (action === "MAKE_LIVE" || action === "SCHEDULE") {
      await scheduleExamNotifications(updatedExam, {
        isReschedule: action === "SCHEDULE" && Boolean(exam.startAt),
      });
    }

    return NextResponse.json({
      success: true,
      exam: updatedExam,
      message: `Exam status updated to ${updatedStatus}`,
    });
  } catch (error) {
    console.error("Exam review POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
