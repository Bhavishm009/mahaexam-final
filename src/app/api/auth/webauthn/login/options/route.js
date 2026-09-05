import { NextResponse } from "next/server";
import { createPasskeyLoginOptions } from "@/lib/webauthn-service";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = body.identifier || body.email || body.phone;
    const origin = request.nextUrl.origin;

    const options = await createPasskeyLoginOptions(origin, identifier);
    return NextResponse.json(options);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
