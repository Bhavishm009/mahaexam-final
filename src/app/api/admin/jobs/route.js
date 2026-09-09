import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import {
  getAllJobAlerts,
  getJobAlertById,
  createJobAlert,
  updateJobAlert,
  deleteJobAlert,
  deleteJobAlerts,
} from "@/lib/job-service";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const job = await getJobAlertById(id);
      if (!job) {
        return NextResponse.json({ error: "Job alert not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, jobAlert: job });
    }

    const alerts = await getAllJobAlerts();
    return NextResponse.json({ success: true, jobAlerts: alerts });
  } catch (err) {
    console.error("Error in GET /api/admin/jobs:", err);
    return NextResponse.json({ error: "Failed to fetch job alerts" }, { status: 500 });
  }
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
      status,
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
        status: status || "ACTIVE",
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

export async function PUT(req) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || !["SUPER_ADMIN", "COACHING_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Job ID is required for editing." }, { status: 400 });
    }

    const updatedJob = await updateJobAlert(id, data);
    return NextResponse.json({
      success: true,
      jobAlert: updatedJob,
      message: "Job alert updated successfully!",
    });
  } catch (error) {
    console.error("Error updating job alert:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update job notification." },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || !["SUPER_ADMIN", "COACHING_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");

    let body = {};
    try {
      body = await req.json();
    } catch {}

    const idsToDelete = body.ids || (queryId ? [queryId] : []);

    if (!idsToDelete.length) {
      return NextResponse.json({ error: "Missing job alert ID(s) to delete" }, { status: 400 });
    }

    if (idsToDelete.length === 1) {
      await deleteJobAlert(idsToDelete[0]);
      return NextResponse.json({ success: true, message: "Job alert deleted successfully." });
    }

    const result = await deleteJobAlerts(idsToDelete);
    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully deleted ${idsToDelete.length} job alerts.`,
    });
  } catch (error) {
    console.error("Error deleting job alert:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete job alert." },
      { status: 500 },
    );
  }
}
