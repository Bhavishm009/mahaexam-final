// Demo server-side attempt store.
// Replace this Map with Prisma + PostgreSQL in production.
// The service API is intentionally shaped like a database-backed repository.
const attempts = globalThis.__MAHA_EXAM_ATTEMPTS__ || new Map();
globalThis.__MAHA_EXAM_ATTEMPTS__ = attempts;

export function createAttempt({
  examId,
  studentId = "demo-student",
  durationMinutes = 45,
  questions,
}) {
  const id = `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60_000);
  const attempt = {
    id,
    examId,
    studentId,
    startedAt,
    expiresAt,
    status: "IN_PROGRESS",
    questions: questions.map((q, index) => ({
      id: q.id,
      order: index + 1,
      marks: 1,
      negativeMarks: 0.25,
    })),
    answers: {},
    violations: [],
    submittedAt: null,
    result: null,
  };
  attempts.set(id, attempt);
  return attempt;
}

export function getAttempt(id) {
  return attempts.get(id);
}

export function saveAnswer(attempt, questionId, selectedOptionId, timeSpentSeconds = 0) {
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Attempt is no longer active");
  }
  if (new Date() > new Date(attempt.expiresAt)) {
    attempt.status = "AUTO_SUBMITTED";
    throw new Error("EXAM_EXPIRED");
  }
  attempt.answers[String(questionId)] = {
    selectedOptionId,
    timeSpentSeconds,
    answeredAt: new Date(),
  };
  return attempt.answers[String(questionId)];
}

export function addViolation(attempt, type, metadata = {}) {
  if (attempt.status !== "IN_PROGRESS") {
    return;
  }
  attempt.violations.push({ type, metadata, timestamp: new Date() });
  if (attempt.violations.length >= 3) {
    attempt.status = "AUTO_SUBMITTED";
    attempt.submittedAt = new Date();
  }
}

export function calculateResult(attempt, questions) {
  let correct = 0,
    wrong = 0,
    score = 0;
  for (const q of questions) {
    const answer = attempt.answers[String(q.id)];
    if (!answer) {
      continue;
    }
    if (answer.selectedOptionId === q.correct) {
      correct++;
      score += 1;
    } else {
      wrong++;
      score -= 0.25;
    }
  }
  const unanswered = questions.length - correct - wrong;
  const timeTakenSeconds = Math.max(
    0,
    Math.floor((new Date(attempt.submittedAt || new Date()) - new Date(attempt.startedAt)) / 1000),
  );
  return {
    score: Math.max(0, score),
    percentage: Math.max(0, Math.round((score / questions.length) * 10000) / 100),
    correctCount: correct,
    wrongCount: wrong,
    unansweredCount: unanswered,
    timeTakenSeconds,
    violations: attempt.violations.length,
  };
}

export function submitAttempt(attempt, questions, auto = false) {
  if (attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED") {
    if (!attempt.result) {
      attempt.result = calculateResult(attempt, questions);
    }
    return attempt;
  }
  attempt.status = auto ? "AUTO_SUBMITTED" : "SUBMITTED";
  attempt.submittedAt = new Date();
  attempt.result = calculateResult(attempt, questions);
  return attempt;
}
