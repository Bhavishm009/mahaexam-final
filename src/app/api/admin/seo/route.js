import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import {
  getAllSeoSettings,
  getSeoSettingForRoute,
  updateSeoForRoute,
  deleteSeoForRoute,
  bulkDeleteSeoRoutes,
} from "@/lib/seo-service";

export async function GET(req) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const route = searchParams.get("route") || searchParams.get("id");

    if (route) {
      const decodedRoute = decodeURIComponent(route);
      const setting = await getSeoSettingForRoute(decodedRoute);
      if (!setting) {
        return NextResponse.json({ error: "SEO setting not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, setting });
    }

    const settings = await getAllSeoSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("Error in GET /api/admin/seo:", err);
    return NextResponse.json({ error: "Failed to fetch SEO settings" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { route, title, titleMr, description, descriptionMr, keywords, canonicalUrl, ogImage } =
      body;

    if (!route?.trim()) {
      return NextResponse.json(
        { error: "Validation Error: Route path is required." },
        { status: 400 },
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Validation Error: SEO Title is required." },
        { status: 400 },
      );
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

    return NextResponse.json({
      success: true,
      seoSetting: updated,
      message: "SEO configuration saved successfully!",
    });
  } catch (error) {
    console.error("Error saving SEO settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save SEO settings." },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const queryRoute = searchParams.get("route");

    let body = {};
    try {
      body = await req.json();
    } catch {}

    const routesToDelete = body.routes || (queryRoute ? [queryRoute] : []);

    if (!routesToDelete.length) {
      return NextResponse.json(
        { error: "Missing route parameter or routes array to delete." },
        { status: 400 },
      );
    }

    if (routesToDelete.length === 1) {
      await deleteSeoForRoute(routesToDelete[0]);
      return NextResponse.json({
        success: true,
        message: `SEO override for '${routesToDelete[0]}' removed successfully.`,
      });
    }

    const result = await bulkDeleteSeoRoutes(routesToDelete);
    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully removed SEO overrides for ${routesToDelete.length} routes.`,
    });
  } catch (error) {
    console.error("Error deleting SEO settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete SEO settings." },
      { status: 500 },
    );
  }
}
