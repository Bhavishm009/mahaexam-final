import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { auth } from "@/auth";
import { listStudentAvailableExams } from "@/lib/exam-access-service";
import { StudentExamsClient } from "./exams-client";

export const metadata = {
  title: "Available Mock Tests — MahaExam",
  description: "Browse and practice official TCS/IBPS pattern exams.",
};

export default async function StudentExamsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  let session = await verifySessionToken(token);
  let userId = session?.role === "STUDENT" ? session.sub : null;

  if (!userId) {
    try {
      const nextAuthSession = await auth();
      if (nextAuthSession?.user?.role === "STUDENT") {
        userId = nextAuthSession.user.id;
      }
    } catch {}
  }

  let exams = [];
  try {
    exams = await listStudentAvailableExams(userId);
  } catch (error) {
    console.error("Failed to list student exams on server:", error);
  }

  return <StudentExamsClient initialExams={exams} />;
}
