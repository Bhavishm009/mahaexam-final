import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getAllJobAlerts, createJobAlert } from "@/lib/job-service";

export async function GET() {
  const alerts = await getAllJobAlerts();
  return NextResponse.json({ success: true, jobAlerts: alerts });
}

export async function POST(req) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || !["SUPER_ADMIN", "COACHING_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      titleMr,
      department,
      departmentMr,
      vacancies,
      qualification,
      qualificationMr,
      lastDate,
      officialUrl,
      notificationPdf,
      description,
      descriptionMr,
      examSlug,
      salaryRange,
      ageLimit,
      selectionProcess,
      notifyStudents,
    } = body;

    if (!title || !department || !description) {
      return NextResponse.json({ error: "MISSING_REQUIRED_FIELDS" }, { status: 400 });
    }

    const newJob = await createJobAlert(
      {
        title,
        titleMr,
        department,
        departmentMr,
        vacancies,
        qualification,
        qualificationMr,
        lastDate,
        officialUrl,
        notificationPdf,
        description,
        descriptionMr,
        examSlug,
        salaryRange,
        ageLimit,
        selectionProcess,
      },
      notifyStudents !== false
    );

    return NextResponse.json({ success: true, jobAlert: newJob });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
