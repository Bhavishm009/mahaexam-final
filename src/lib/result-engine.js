import { evaluateAttempt, rankResult } from "@/lib/evaluation-service";

export async function evaluateAttemptResult(attemptId) {
  return evaluateAttempt(attemptId);
}

export async function evaluateAndReturn(attemptId) {
  return evaluateAttempt(attemptId);
}

export { rankResult };
