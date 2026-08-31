import { prisma } from "@/lib/db";

const REQUIRED = ["questionText", "optionA", "optionB", "optionC", "optionD", "correctAnswer"];
const clean = (v) => String(v ?? "").trim();
const normalize = (v) => clean(v).toLowerCase().replace(/\s+/g, " ");
const answerIndex = (v) => ({ a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 })[normalize(v)];

export function validateQuestionRow(row, index) {
  const errors = [];
  for (const k of REQUIRED) {
    if (!clean(row[k])) {
      errors.push(`${k} is required`);
    }
  }
  const ai = answerIndex(row.correctAnswer);
  if (ai === undefined) {
    errors.push("correctAnswer must be A/B/C/D or 1/2/3/4");
  }
  const options = [row.optionA, row.optionB, row.optionC, row.optionD].map(clean);
  if (new Set(options.map(normalize)).size !== 4) {
    errors.push("Options A-D must be unique");
  }
  const difficulty = clean(row.difficulty || "MEDIUM").toUpperCase();
  if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
    errors.push("difficulty must be EASY, MEDIUM or HARD");
  }
  const marks = Number(row.marks || 1),
    negative = Number(row.negativeMarks || 0);
  if (!Number.isFinite(marks) || marks <= 0) {
    errors.push("marks must be > 0");
  }
  if (!Number.isFinite(negative) || negative < 0) {
    errors.push("negativeMarks must be >= 0");
  }
  return { index, errors, row, valid: errors.length === 0 };
}

export async function findDuplicateQuestion(row, organizationId) {
  const existing = await prisma.question.findMany({
    where: organizationId
      ? { organizationId, questionText: { equals: clean(row.questionText), mode: "insensitive" } }
      : {
          organizationId: null,
          questionText: { equals: clean(row.questionText), mode: "insensitive" },
        },
    select: { id: true, questionText: true },
  });
  return existing[0] || null;
}

export async function importRows({ rows, userId, organizationId, filename, defaultSubjectId }) {
  // Fetch all existing subjects to resolve subjectId
  const allSubjects = await prisma.subject.findMany();
  const defaultSubject =
    allSubjects.find((s) => s.id === defaultSubjectId) ||
    allSubjects.find((s) => s.name.toLowerCase().includes("general")) ||
    allSubjects[0];

  const batch = await prisma.questionImportBatch.create({
    data: {
      organizationId: organizationId || null,
      createdById: userId,
      filename,
      totalRows: rows.length,
      status: "PROCESSING",
    },
  });

  let valid = 0,
    invalid = 0,
    duplicates = 0,
    imported = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const check = validateQuestionRow(rows[i], i + 2);
    if (!check.valid) {
      invalid++;
      errors.push({ row: i + 2, errors: check.errors });
      continue;
    }
    valid++;

    if (await findDuplicateQuestion(rows[i], organizationId)) {
      duplicates++;
      continue;
    }

    try {
      const r = rows[i];
      const answer = answerIndex(r.correctAnswer);

      // Resolve subject
      let matchedSubjectId = defaultSubject?.id;
      const rawSubject = clean(r.subject || r.subjectId || r.subjectName);
      if (rawSubject) {
        const found = allSubjects.find(
          (s) =>
            s.id === rawSubject ||
            s.name.toLowerCase() === rawSubject.toLowerCase() ||
            (s.nameMr && s.nameMr.toLowerCase() === rawSubject.toLowerCase()) ||
            (s.code && s.code.toLowerCase() === rawSubject.toLowerCase()),
        );
        if (found) {
          matchedSubjectId = found.id;
        }
      }

      if (!matchedSubjectId) {
        // Create fallback subject if none exists in database
        const fallback = await prisma.subject.create({
          data: {
            name: "General Knowledge",
            nameMr: "सामान्य ज्ञान (GK)",
            slug: "general-knowledge",
          },
        });
        matchedSubjectId = fallback.id;
      }

      const diff = clean(r.difficulty || "MEDIUM").toUpperCase();
      const questionDifficulty = ["EASY", "MEDIUM", "HARD"].includes(diff) ? diff : "MEDIUM";

      const createdQuestion = await prisma.question.create({
        data: {
          organizationId: organizationId || null,
          subjectId: matchedSubjectId,
          createdBy: userId,
          createdById: userId,
          visibilityMode: organizationId ? "COACHING" : "FREE_GLOBAL",
          questionText: clean(r.questionText),
          questionTextMr: clean(r.questionTextMr) || null,
          difficulty: questionDifficulty,
          marks: Number(r.marks || 1),
          negativeMarks: Number(r.negativeMarks || 0),
          explanation: clean(r.explanation) || null,
          status: "PUBLISHED",
          options: {
            create: [r.optionA, r.optionB, r.optionC, r.optionD].map((x, j) => ({
              optionText: clean(x),
              optionOrder: j + 1,
              isCorrect: j === answer,
            })),
          },
        },
      });

      // Link to QuestionBankQuestion so it appears in Question Bank immediately
      await prisma.questionBankQuestion.create({
        data: {
          questionId: createdQuestion.id,
          organizationId: organizationId || null,
          source: organizationId ? "COACHING" : "PLATFORM",
          difficulty: questionDifficulty,
          explanation: clean(r.explanation) || null,
          explanationMr: clean(r.explanationMr) || null,
          isApproved: true,
          createdById: userId,
        },
      });

      imported++;
    } catch (e) {
      invalid++;
      errors.push({ row: i + 2, errors: [e.message] });
    }
  }

  const status = "COMPLETED";
  await prisma.questionImportBatch.update({
    where: { id: batch.id },
    data: {
      status,
      validRows: valid,
      invalidRows: invalid,
      duplicateRows: duplicates,
      importedRows: imported,
      errors: errors.slice(0, 500),
      completedAt: new Date(),
    },
  });

  return {
    batchId: batch.id,
    totalRows: rows.length,
    validRows: valid,
    invalidRows: invalid,
    duplicateRows: duplicates,
    importedRows: imported,
    errors,
  };
}
