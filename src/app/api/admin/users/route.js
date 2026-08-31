import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { listUsers, updateUserStatus } from "@/lib/admin-service";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ users: await listUsers() });
}
export async function PATCH(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, status } = await request.json();
  if (!["ACTIVE", "SUSPENDED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  }
  return NextResponse.json({ user: await updateUserStatus(id, status) });
}

export async function DELETE(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || s.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { deleteUserSafely } = await import("@/lib/admin-service");
    await deleteUserSafely(id);

    return NextResponse.json({
      success: true,
      message: "User deleted safely. All question bank items and exams have been preserved!",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}

