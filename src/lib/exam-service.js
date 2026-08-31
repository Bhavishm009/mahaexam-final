import { questions } from "./demo-data";
import {
  createAttempt,
  getAttempt,
  saveAnswer,
  addViolation,
  submitAttempt,
} from "./attempt-store";

export function startExam(examId) {
  return createAttempt({
    examId,
    questions,
    durationMinutes: 45,
  });
}

export function fetchAttempt(id) {
  const attempt = getAttempt(id);
  if (!attempt) {
    return null;
  }

  // Server-authoritative expiry check.
  if (attempt.status === "IN_PROGRESS" && new Date() > new Date(attempt.expiresAt)) {
    return submitAttempt(attempt, questions, true);
  }
  return attempt;
}

export function answerQuestion(id, questionId, selectedOptionId, timeSpentSeconds) {
  const attempt = getAttempt(id);
  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }
  return saveAnswer(attempt, questionId, selectedOptionId, timeSpentSeconds);
}

export function recordViolation(id, type, metadata) {
  const attempt = getAttempt(id);
  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }
  addViolation(attempt, type, metadata);
  return attempt;
}

export function finishExam(id) {
  const attempt = getAttempt(id);
  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }
  return submitAttempt(attempt, questions, false);
}
