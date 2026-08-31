import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { listOrganizations } from "@/lib/admin-service";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendAcademyCredentialsEmail } from "@/lib/email-service";

export async function GET() {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || !["SUPER_ADMIN", "ADMIN"].includes(s.role)) {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }
    const organizations = await listOrganizations();
    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("GET /api/admin/organizations error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch organizations", organizations: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || !["SUPER_ADMIN", "ADMIN"].includes(s.role)) {
      return NextResponse.json(
        { error: "Forbidden: Super Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      name,
      adminName,
      email,
      phone,
      district = "Pune",
      state = "Maharashtra",
      subscriptionPlan = "PROFESSIONAL",
    } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Academy name and Admin email address are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: `An account with email ${normalizedEmail} already exists.` },
        { status: 400 },
      );
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let slug = baseSlug || "academy";
    const existingOrg = await prisma.organization.findUnique({ where: { slug } });
    if (existingOrg) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // Generate temporary password
    const tempPassword = `Maha@${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Create organization, admin user, and default batch inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: name.trim(),
          slug,
          email: normalizedEmail,
          phone: phone?.trim() || null,
          district: district.trim(),
          state: state.trim(),
          subscriptionPlan: subscriptionPlan || "PROFESSIONAL",
        },
      });

      const user = await tx.user.create({
        data: {
          name: (adminName || name).trim(),
          email: normalizedEmail,
          phone: phone?.trim() || null,
          passwordHash,
          role: "COACHING_ADMIN",
          status: "ACTIVE",
          organizationId: org.id,
        },
      });

      const batch = await tx.batch.create({
        data: {
          name: "General Mock Test Batch (नियमित बॅच)",
          examType: "Police Bharti / MPSC / Saralseva",
          startDate: new Date(),
          organizationId: org.id,
        },
      });

      return { org, user, batch };
    });

    const origin = request.nextUrl.origin || "http://localhost:3000";
    const loginUrl = `${origin}/login`;

    // Automatically send credentials email using Nodemailer
    await sendAcademyCredentialsEmail({
      email: normalizedEmail,
      name: result.org.name,
      adminName: result.user.name,
      password: tempPassword,
      district: result.org.district,
      loginUrl,
    }).catch((err) => {
      console.warn("Failed to dispatch academy onboarding email:", err.message);
    });

    return NextResponse.json(
      {
        success: true,
        message: `Academy '${result.org.name}' created successfully! Credentials sent to ${normalizedEmail}.`,
        organization: {
          id: result.org.id,
          name: result.org.name,
          slug: result.org.slug,
          email: result.org.email,
          district: result.org.district,
        },
        credentials: {
          email: normalizedEmail,
          password: tempPassword,
          loginUrl,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Super Admin Create Organization Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create academy" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || !["SUPER_ADMIN", "ADMIN"].includes(s.role)) {
      return NextResponse.json(
        { error: "Forbidden: Super Admin access required" },
        { status: 403 },
      );
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    const { deleteOrganizationSafely } = await import("@/lib/admin-service");
    await deleteOrganizationSafely(id);

    return NextResponse.json({
      success: true,
      message: "Academy deleted safely. All created questions and question bank items are preserved globally!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete academy" },
      { status: 500 },
    );
  }
}

