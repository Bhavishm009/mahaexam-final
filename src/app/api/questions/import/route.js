import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { importRows } from "@/lib/question-import-service";
import { parseCSV } from "@/lib/csv-parser";

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file.text !== "function") {
    return NextResponse.json({ error: "CSV file required" }, { status: 400 });
  }
  const name = file.name || "questions.csv";
  if (!name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json(
      {
        error:
          "V21 currently accepts CSV. Excel conversion can be added with SheetJS in the next patch.",
      },
      { status: 422 },
    );
  }
  const text = await file.text();
  const rows = parseCSV(text);
  if (!rows.length) {
    return NextResponse.json({ error: "CSV is empty" }, { status: 422 });
  }
  const defaultSubjectId = form.get("defaultSubjectId") || undefined;
  const result = await importRows({
    rows,
    userId: s.sub,
    organizationId: s.role === "SUPER_ADMIN" ? null : s.organizationId,
    filename: name,
    defaultSubjectId,
  });
  return NextResponse.json(result, { status: 201 });
}
