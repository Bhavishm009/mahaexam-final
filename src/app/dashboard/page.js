import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";

export default async function DashboardRedirect() {
  const token = (await cookies()).get(COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    redirect("/login");
  }
  if (session.role === "STUDENT") {
    redirect("/student/dashboard");
  }
  if (session.role === "COACHING_ADMIN" || session.role === "TEACHER") {
    redirect("/coaching/dashboard");
  }
  if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
    redirect("/admin");
  }
  redirect("/login");
}
