import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    const session = await verifySessionToken(token);

    if (!session?.sub) {
      return NextResponse.json({ error: "Unauthorized: Login required" }, { status: 401 });
    }

    const credentials = await prisma.passkeyCredential.findMany({
      where: { userId: session.sub },
      select: {
        id: true,
        credentialId: true,
        deviceType: true,
        backedUp: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      credentials,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch credentials" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    const session = await verifySessionToken(token);

    if (!session?.sub) {
      return NextResponse.json({ error: "Unauthorized: Login required" }, { status: 401 });
    }

    let credentialId = null;
    let id = null;

    try {
      const body = await request.json();
      credentialId = body.credentialId;
      id = body.id;
    } catch {
      // Fallback to URL search parameters
    }

    if (!id && !credentialId) {
      const { searchParams } = new URL(request.url);
      id = searchParams.get("id");
      credentialId = searchParams.get("credentialId");
    }

    if (!id && !credentialId) {
      return NextResponse.json(
        { error: "Credential ID or record ID is required to delete" },
        { status: 400 },
      );
    }

    // Verify ownership and delete
    const whereClause = {
      userId: session.sub,
      ...(id ? { id } : { credentialId }),
    };

    const deleted = await prisma.passkeyCredential.deleteMany({
      where: whereClause,
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Passkey not found or you do not have permission to delete it" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Passkey biometric credential removed successfully",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to delete passkey" }, { status: 500 });
  }
}
