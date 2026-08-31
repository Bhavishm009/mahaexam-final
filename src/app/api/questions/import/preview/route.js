import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { parseCSV } from "@/lib/csv-parser";
import { validateQuestionRow } from "@/lib/question-import-service";
export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!file) {
    return NextResponse.json({ error: "File required" }, { status: 400 });
  }
  const rows = parseCSV(await file.text());
  const checks = rows.map((r, i) => validateQuestionRow(r, i + 2));
  return NextResponse.json({
    total: rows.length,
    valid: checks.filter((x) => x.valid).length,
    invalid: checks.filter((x) => !x.valid).length,
    preview: checks.slice(0, 20),
  });
}
