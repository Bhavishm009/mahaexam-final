import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ready", database: "ok" });
  } catch {
    return NextResponse.json({ status: "not_ready", database: "error" }, { status: 503 });
  }
}
