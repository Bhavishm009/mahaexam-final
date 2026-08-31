import { NextResponse } from "next/server";
import { createPasskeyLoginOptions } from "@/lib/webauthn-service";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;
    const origin = request.nextUrl.origin;

    const options = await createPasskeyLoginOptions(origin, email);
    return NextResponse.json(options);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
