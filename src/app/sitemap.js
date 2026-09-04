import { prisma } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mahaexam.com";
  const now = new Date();

  // Static core routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/exams`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/for-coaching`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/student/exams`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/student/leaderboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/coaching/register`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/coaching/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic published exams
  let examRoutes = [];
  try {
    const exams = await prisma.exam.findMany({
      where: { status: { in: ["SCHEDULED", "LIVE"] } },
      select: { id: true, slug: true, updatedAt: true },
      take: 200,
    });

    if (exams.length > 0) {
      examRoutes = exams.map((e) => ({
        url: `${baseUrl}/exam/${e.slug || e.id}`,
        lastModified: e.updatedAt || now,
        changeFrequency: "weekly",
        priority: 0.9,
      }));
    }
  } catch {
    // Fallback static exam list
    const fallbackIds = ["police-01", "mpsc-01", "talathi-01", "zp-01"];
    examRoutes = fallbackIds.map((id) => ({
      url: `${baseUrl}/exam/${id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    }));
  }

  return [...staticRoutes, ...examRoutes];
}
