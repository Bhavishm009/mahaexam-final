import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Load all subjects from database into lookup map
  const allSubjects = await prisma.subject.findMany();
  const subjectMap = new Map(allSubjects.map((sub) => [sub.id, sub]));

  function getSubjectName(subId, subObj) {
    const found = subObj || subjectMap.get(subId);
    if (found) {
      if (found.nameMr && found.name && found.nameMr !== found.name) {
        return `${found.nameMr} (${found.name})`;
      }
      return found.nameMr || found.name;
    }
    // Fallback if ID is unknown
    return "General Section (सामान्य घटक)";
  }

  // 1. Try ExamResultSummary
  const summary = await prisma.examResultSummary.findFirst({
    where: {
      OR: [{ id }, { attemptId: id }],
      studentId: s.sub,
    },
    include: {
      exam: {
        select: {
          id: true,
          slug: true,
          title: true,
          language: true,
          totalQuestions: true,
          totalMarks: true,
          passingScore: true,
        },
      },
      subjectBreakdown: {
        include: {
          subject: true,
        },
      },
      chapterBreakdown: true,
    },
  });

  if (summary) {
    const subjectResults = summary.subjectBreakdown?.map((sb) => {
      const subjectName = getSubjectName(sb.subjectId, sb.subject);
      const total = sb.total || 0;
      const obtained = sb.obtained || 0;
      const correct = sb.correct || 0;
      const wrong = sb.wrong || 0;
      const unanswered = sb.unanswered || 0;
      const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
      const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;

      return {
        id: sb.id,
        subjectId: sb.subjectId,
        subjectName,
        totalQuestions: total,
        correct,
        wrong,
        unanswered,
        score: obtained,
        percentage,
        accuracy,
      };
    });

    return NextResponse.json({
      result: {
        id: summary.id,
        attemptId: summary.attemptId,
        examId: summary.examId,
        exam: summary.exam,
        obtainedMarks: summary.obtainedMarks,
        score: summary.obtainedMarks,
        totalMarks: summary.totalMarks,
        percentage: summary.percentage,
        correctCount: summary.correct,
        correct: summary.correct,
        wrongCount: summary.wrong,
        wrong: summary.wrong,
        unansweredCount: summary.unanswered,
        unanswered: summary.unanswered,
        passed: summary.passed,
        rank: summary.rank,
        percentile: summary.percentile,
        evaluatedAt: summary.evaluatedAt,
        subjectResults,
      },
    });
  }

  // 2. Try ExamResult
  const examResult = await prisma.examResult.findFirst({
    where: {
      OR: [{ id }, { attemptId: id }],
      studentId: s.sub,
    },
    include: {
      subjects: {
        include: {
          subject: true,
        },
      },
      sectionResults: true,
      exam: {
        select: {
          id: true,
          slug: true,
          title: true,
          language: true,
          totalQuestions: true,
          totalMarks: true,
          passingScore: true,
        },
      },
    },
  });

  if (examResult) {
    const subjectResults = examResult.subjects?.map((sub) => {
      const subjectName = getSubjectName(sub.subjectId, sub.subject);
      const total = sub.totalQuestions || 0;
      const score = sub.score || 0;
      const correct = sub.correctCount || 0;
      const wrong = sub.wrongCount || 0;
      const unanswered = sub.unansweredCount || 0;
      const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
      const percentage = sub.percentage ?? (total > 0 ? Math.round((score / total) * 100) : 0);

      return {
        id: sub.id,
        subjectId: sub.subjectId,
        subjectName,
        totalQuestions: total,
        correct,
        wrong,
        unanswered,
        score,
        percentage,
        accuracy,
      };
    });

    return NextResponse.json({
      result: {
        id: examResult.id,
        attemptId: examResult.attemptId,
        examId: examResult.examId,
        exam: examResult.exam,
        obtainedMarks: examResult.obtainedMarks,
        score: examResult.obtainedMarks,
        totalMarks: examResult.totalMarks,
        percentage: examResult.percentage,
        correctCount: examResult.correctCount,
        correct: examResult.correctCount,
        wrongCount: examResult.wrongCount,
        wrong: examResult.wrongCount,
        unansweredCount: examResult.unansweredCount,
        unanswered: examResult.unansweredCount,
        passed: examResult.passed,
        rank: examResult.rank,
        percentile: examResult.percentile,
        evaluatedAt: examResult.evaluatedAt,
        subjectResults,
      },
    });
  }

  // 3. Try Result model
  const legacyResult = await prisma.result.findFirst({
    where: {
      OR: [{ id }, { attemptId: id }],
      studentId: s.sub,
    },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          language: true,
          totalQuestions: true,
          totalMarks: true,
          passingScore: true,
        },
      },
    },
  });

  if (legacyResult) {
    return NextResponse.json({
      result: {
        id: legacyResult.id,
        attemptId: legacyResult.attemptId,
        examId: legacyResult.examId,
        exam: legacyResult.exam,
        obtainedMarks: legacyResult.score,
        score: legacyResult.score,
        totalMarks: legacyResult.totalMarks || legacyResult.exam?.totalMarks || 100,
        percentage: legacyResult.percentage,
        correctCount: legacyResult.correct,
        correct: legacyResult.correct,
        wrongCount: legacyResult.wrong,
        wrong: legacyResult.wrong,
        unansweredCount: legacyResult.unanswered,
        unanswered: legacyResult.unanswered,
        passed: legacyResult.passed,
        rank: legacyResult.rank,
        percentile: legacyResult.percentile,
        evaluatedAt: legacyResult.evaluatedAt || legacyResult.createdAt,
        subjectResults: [],
      },
    });
  }

  return NextResponse.json({ error: "Result not found" }, { status: 404 });
}
