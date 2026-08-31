import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runCompleteDatabaseSeed } from "@/lib/seed-service";

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const secretQuery = url.searchParams.get("secret");
    const cronHeader = request.headers.get("x-cron-secret");
    const authHeader = request.headers.get("authorization");

    const expectedSecret =
      process.env.INTERNAL_CRON_SECRET || "mahaexam-cron-super-secret-key-2026";

    let authorized = false;

    // Check secret token
    if (
      secretQuery === expectedSecret ||
      cronHeader === expectedSecret ||
      authHeader === `Bearer ${expectedSecret}`
    ) {
      authorized = true;
    }

    // Check Super Admin session
    if (!authorized) {
      const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
      if (session?.role === "SUPER_ADMIN") {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin login or valid secret token required." },
        { status: 401 },
      );
    }

    console.warn("🌱 Triggering Database Seeding via API...");
    const result = await runCompleteDatabaseSeed(prisma);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with 27 Live Mock Exams and 2,700 questions!",
      ...result,
    });
  } catch (error) {
    console.error("Database seed API error:", error);
    return NextResponse.json(
      { error: "Database seed failed", details: error.message },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  // Allow GET with secret parameter for easy 1-click browser trigger
  return POST(request);
}
