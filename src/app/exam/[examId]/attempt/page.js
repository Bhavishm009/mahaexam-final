import { SecureExamClient } from "@/components/secure-exam-client";

export default async function ExamAttemptPage({ params }) {
  const { examId } = await params;
  return <SecureExamClient examId={examId} />;
}
