import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { processMarketplaceTransfer } from "@/lib/payout-service";
import { prisma } from "@/lib/db";
export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const ledger = await prisma.marketplaceTransfer.findUnique({ where: { id: params.id } });
  if (!ledger) {
    return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
  }
  try {
    return NextResponse.json({ transfer: await processMarketplaceTransfer(params.id) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
