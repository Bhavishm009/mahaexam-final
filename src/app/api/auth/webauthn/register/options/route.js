import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPasskeyRegistrationOptions } from "@/lib/webauthn-service";

export async function POST(request) {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Login required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const origin = request.nextUrl.origin;
    const options = await createPasskeyRegistrationOptions(user, origin);

    return NextResponse.json(options);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
