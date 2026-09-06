import ExamQuestionPaperEditor from "@/components/exam-question-paper-editor";

export const metadata = {
  title: "Exam Question Paper Editor | Super Admin",
  description:
    "Manage and edit questions in the examination paper with subject and difficulty filters.",
};

export default async function AdminExamQuestionsPage({ params }) {
  const { id } = await params;
  return (
    <ExamQuestionPaperEditor
      examId={id}
      backHref="/admin/global-exams"
      backLabel="Back to Global Exams"
      portalRole="Super Admin"
    />
  );
}
