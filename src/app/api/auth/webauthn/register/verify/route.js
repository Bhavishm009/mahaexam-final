import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { savePasskeyCredential } from "@/lib/webauthn-service";

export async function POST(request) {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Login required" }, { status: 401 });
    }

    const credentialData = await request.json();
    await savePasskeyCredential(session.sub, credentialData);

    return NextResponse.json({
      success: true,
      message: "Biometric / Fingerprint Sign-In registered successfully on this device!",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
