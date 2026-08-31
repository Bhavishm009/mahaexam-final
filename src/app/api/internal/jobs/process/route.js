import { NextResponse } from "next/server";
import { processPendingJobs } from "@/lib/job-queue";

export async function POST(request) {
  const expected = process.env.INTERNAL_CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results = await processPendingJobs(50);
  return NextResponse.json({ processed: results.length, results });
}
