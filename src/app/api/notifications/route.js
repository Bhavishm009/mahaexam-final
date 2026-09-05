import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getNotifications, markNotificationRead } from "@/lib/result-service";

export async function GET() {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || !session.sub) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }
  const isSuperAdmin = session.role === "SUPER_ADMIN";
  return NextResponse.json({
    notifications: await getNotifications(session.sub, isSuperAdmin),
  });
}

export async function PATCH(request) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }
  const { id } = await request.json();
  await markNotificationRead(id, session.sub);
  return NextResponse.json({ success: true });
}
