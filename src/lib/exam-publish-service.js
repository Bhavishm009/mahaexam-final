import crypto from "crypto";
import { prisma } from "@/lib/db";

export function hashSnapshots(snapshots) {
  const canonical = snapshots
    .sort((a, b) => a.position - b.position)
    .map((x) => ({
      position: x.position,
      sectionName: x.sectionName,
      marks: x.marks,
      negativeMarks: x.negativeMarks,
      snapshot: x.snapshot,
    }));
  return crypto.createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export async function freezeExam(session, examId) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questionSnapshots: true, sections: true },
  });
  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }
  if (session.role !== "SUPER_ADMIN" && exam.organizationId !== session.organizationId) {
    throw new Error("FORBIDDEN");
  }
  if (exam.status !== "SCHEDULED" && exam.status !== "PUBLISHED") {
    throw new Error("ONLY_SCHEDULED_OR_PUBLISHED_CAN_BE_FROZEN");
  }
  if (!exam.questionSnapshots.length) {
    throw new Error("NO_QUESTIONS");
  }
  const hash = hashSnapshots(exam.questionSnapshots);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.exam.update({ where: { id: examId }, data: { frozenAt: new Date() } });
    await tx.examPublishAudit.create({
      data: {
        examId,
        actorId: session.sub,
        action: "FROZEN",
        snapshotHash: hash,
        metadata: { questionCount: exam.questionSnapshots.length },
      },
    });
    return updated;
  });
}

export async function publishExam(session, examId) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questionSnapshots: true, sections: true, questionPools: true },
  });
  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }
  if (session.role !== "SUPER_ADMIN" && exam.organizationId !== session.organizationId) {
    throw new Error("FORBIDDEN");
  }
  if (exam.status !== "DRAFT") {
    throw new Error("ONLY_DRAFT_CAN_BE_PUBLISHED");
  }
  if (!exam.questionSnapshots.length && !exam.questionPools.length) {
    throw new Error("NO_QUESTIONS_OR_POOLS");
  }
  const hash = hashSnapshots(exam.questionSnapshots);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.exam.update({ where: { id: examId }, data: { status: "SCHEDULED" } });
    await tx.examPublishAudit.create({
      data: {
        examId,
        actorId: session.sub,
        action: "PUBLISHED",
        snapshotHash: hash,
        metadata: {
          questionCount: exam.questionSnapshots.length,
          poolCount: exam.questionPools.length,
        },
      },
    });
    return updated;
  });
}
