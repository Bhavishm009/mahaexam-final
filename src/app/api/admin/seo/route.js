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

    if (!route || !title || !description) {
      return NextResponse.json({ error: "MISSING_REQUIRED_FIELDS" }, { status: 400 });
    }

    const updated = await updateSeoForRoute(route, {
      title,
      titleMr,
      description,
      descriptionMr,
      keywords,
      canonicalUrl,
      ogImage,
    });

    return NextResponse.json({ success: true, seoSetting: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
