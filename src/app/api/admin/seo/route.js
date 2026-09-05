import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getAllSeoSettings, updateSeoForRoute } from "@/lib/seo-service";

export async function GET() {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const settings = await getAllSeoSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { route, title, titleMr, description, descriptionMr, keywords, canonicalUrl, ogImage } = body;

    if (!route?.trim()) {
      return NextResponse.json({ error: "Validation Error: Route path is required." }, { status: 400 });
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: "Validation Error: SEO Title is required." }, { status: 400 });
    }

    const updated = await updateSeoForRoute(route.trim(), {
      title: title.trim(),
      titleMr,
      description: description ? description.trim() : "",
      descriptionMr,
      keywords,
      canonicalUrl,
      ogImage,
    });

    return NextResponse.json({ success: true, seoSetting: updated, message: "SEO configuration saved successfully!" });
  } catch (error) {
    console.error("Error saving SEO settings:", error);
    return NextResponse.json({ error: error.message || "Failed to save SEO settings." }, { status: 500 });
  }
}
