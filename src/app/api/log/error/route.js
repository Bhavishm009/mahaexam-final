import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { logError } from "@/lib/logger";

export async function POST(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    const body = await request.json();
    const { message, stack, route, source = "CLIENT", metadata = {} } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await logError({
      message,
      stack,
      source,
      route,
      userId: s?.sub || null,
      organizationId: s?.organizationId || null,
      metadata,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
