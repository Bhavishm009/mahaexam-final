import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "mahaexam-web",
    time: new Date().toISOString(),
  });
}
