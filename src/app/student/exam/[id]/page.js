import SecureExamClient from "@/components/secure-exam-client";

export default async function StudentExamDirectAttemptPage({ params }) {
  const { id } = await params;
  return <SecureExamClient examId={id} />;
}
