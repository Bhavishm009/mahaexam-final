import { NextResponse } from "next/server";
import { getAllJobAlerts } from "@/lib/job-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/jobs
 * Public API to search and filter job recruitment alerts by query (q), category, and status.
 * Query Params:
 *  - q: search term (matches title, titleMr, department, departmentMr, qualification, description, vacancies)
 *  - category: job category/department filter
 *  - status: "ACTIVE", "UPCOMING", or "ALL"
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const category = (searchParams.get("category") || "ALL").trim();
    const status = (searchParams.get("status") || "ALL").trim().toUpperCase();

    const allJobs = await getAllJobAlerts();

    const filtered = allJobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.title?.toLowerCase().includes(q) ||
        job.titleMr?.toLowerCase().includes(q) ||
        job.department?.toLowerCase().includes(q) ||
        job.departmentMr?.toLowerCase().includes(q) ||
        job.qualification?.toLowerCase().includes(q) ||
        job.qualificationMr?.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q) ||
        job.descriptionMr?.toLowerCase().includes(q) ||
        job.category?.toLowerCase().includes(q);

      const matchesStatus = status === "ALL" || !status || job.status?.toUpperCase() === status;

      const matchesCat =
        category === "ALL" ||
        !category ||
        job.category?.toLowerCase() === category.toLowerCase() ||
        job.department?.toLowerCase().includes(category.toLowerCase());

      return matchesSearch && matchesStatus && matchesCat;
    });

    return NextResponse.json(
      {
        success: true,
        count: filtered.length,
        total: allJobs.length,
        query: q,
        status: status,
        category: category,
        jobs: filtered,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs", jobs: [] },
      { status: 500 },
    );
  }
}
