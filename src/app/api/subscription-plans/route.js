import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET() {
  return NextResponse.json({
    plans: await prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
    }),
  });
}
