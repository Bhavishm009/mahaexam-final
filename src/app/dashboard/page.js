import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { auth } from "@/auth";

export default async function DashboardRedirect() {
  const token = (await cookies()).get(COOKIE)?.value;
  let session = await verifySessionToken(token);

  if (!session) {
    try {
      const nextAuthSession = await auth();
      if (nextAuthSession?.user) {
        session = {
          sub: nextAuthSession.user.id,
          role: nextAuthSession.user.role || "STUDENT",
        };
      }
    } catch {}
  }

  if (!session) {
    redirect("/login");
  }

  if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
    redirect("/admin");
  }
  if (session.role === "COACHING_ADMIN" || session.role === "TEACHER") {
    redirect("/coaching/dashboard");
  }
  redirect("/student/dashboard");
}
