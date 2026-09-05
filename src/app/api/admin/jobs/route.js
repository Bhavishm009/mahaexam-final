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
      imageUrl,
      notifyStudents,
    } = body;

    if (!title?.trim() && !titleMr?.trim()) {
      return NextResponse.json(
        { error: "Validation Error: Job Title is required." },
        { status: 400 },
      );
    }

    if (!department?.trim() && !departmentMr?.trim()) {
      return NextResponse.json(
        { error: "Validation Error: Department name is required." },
        { status: 400 },
      );
    }

    if (!description?.trim() && !descriptionMr?.trim()) {
      return NextResponse.json(
        { error: "Validation Error: Job Description is required." },
        { status: 400 },
      );
    }

    const newJob = await createJobAlert(
      {
        title: title?.trim() || titleMr?.trim(),
        titleMr: titleMr?.trim() || title?.trim(),
        department: department?.trim() || departmentMr?.trim(),
        departmentMr: departmentMr?.trim() || department?.trim(),
        vacancies: vacancies?.trim() || "Not Specified",
        qualification: qualification?.trim() || "",
        qualificationMr: qualificationMr?.trim() || qualification?.trim() || "",
        lastDate: lastDate?.trim() || "",
        officialUrl: officialUrl?.trim() || "",
        notificationPdf: notificationPdf?.trim() || "",
        description: description?.trim() || descriptionMr?.trim() || "",
        descriptionMr: descriptionMr?.trim() || description?.trim() || "",
        examSlug: examSlug?.trim() || "",
        salaryRange: salaryRange?.trim() || "",
        ageLimit: ageLimit?.trim() || "",
        selectionProcess: selectionProcess?.trim() || "",
        imageUrl: imageUrl?.trim() || "",
      },
      notifyStudents !== false,
    );

    return NextResponse.json({
      success: true,
      jobAlert: newJob,
      message: "Job notification created successfully!",
    });
  } catch (error) {
    console.error("Error creating job alert:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save job notification. Please try again." },
      { status: 500 },
    );
  }
}
