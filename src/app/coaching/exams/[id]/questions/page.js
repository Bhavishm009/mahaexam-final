import ExamQuestionPaperEditor from "@/components/exam-question-paper-editor";

export const metadata = {
  title: "Coaching Exam Paper Editor",
  description:
    "Manage questions in coaching examination paper with subject and difficulty filters.",
};

export default async function CoachingExamQuestionsPage({ params }) {
  const { id } = await params;
  return (
    <ExamQuestionPaperEditor
      examId={id}
      backHref="/coaching/dashboard"
      backLabel="Back to Coaching Portal"
      portalRole="Coaching"
    />
  );
}
