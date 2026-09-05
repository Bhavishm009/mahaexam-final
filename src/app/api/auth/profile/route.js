import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { COOKIE, verifySessionToken, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { auth } from "@/auth";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    let token =
      cookieStore.get(COOKIE)?.value ||
      cookieStore.get("mahaexam_session")?.value ||
      cookieStore.get("maha_exam_session")?.value;

    if (!token && request) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    let session = await verifySessionToken(token);
    let userId = session?.sub || session?.id || session?.userId;

    if (!userId) {
      try {
        const nextAuthSession = await auth();
        userId = nextAuthSession?.user?.id;
      } catch {}
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Login required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        preferredLanguage: true,
        createdAt: true,
        organizationId: true,
        mfaEnabled: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            phone: true,
            address: true,
            district: true,
            state: true,
            status: true,
            subscriptionPlan: true,
          },
        },
        studentProfile: {
          select: {
            id: true,
            profilePhoto: true,
            targetExam: true,
            education: true,
            district: true,
            taluka: true,
            coachingStatus: true,
          },
        },
        teacherProfile: {
          select: {
            id: true,
            organizationId: true,
          },
        },
        passkeys: {
          select: {
            id: true,
            credentialId: true,
            deviceType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...user,
        profilePhoto: user.studentProfile?.profilePhoto || null,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    let token =
      cookieStore.get(COOKIE)?.value ||
      cookieStore.get("mahaexam_session")?.value ||
      cookieStore.get("maha_exam_session")?.value;

    if (!token && request) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    let session = await verifySessionToken(token);
    let userId = session?.sub || session?.id || session?.userId;

    if (!userId) {
      try {
        const nextAuthSession = await auth();
        userId = nextAuthSession?.user?.id;
      } catch {}
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Login required" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, preferredLanguage, newPassword, profilePhoto } = body;

    const updateUserData = {};
    if (typeof name === "string" && name.trim()) {
      updateUserData.name = name.trim();
    }
    if (typeof phone === "string") {
      updateUserData.phone = phone.trim() || null;
    }
    if (typeof preferredLanguage === "string") {
      updateUserData.preferredLanguage = preferredLanguage;
    }
    if (newPassword && typeof newPassword === "string" && newPassword.length >= 6) {
      updateUserData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (typeof profilePhoto === "string") {
      await prisma.studentProfile.upsert({
        where: { userId: userId },
        create: { userId: userId, profilePhoto },
        update: { profilePhoto },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateUserData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        preferredLanguage: true,
        createdAt: true,
        organizationId: true,
      },
    });

    // If name or email changed, update session token in cookie
    const newToken = await createSessionToken({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      organizationId: updatedUser.organizationId,
    });

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedUser,
    });

    response.cookies.set(COOKIE, newToken, sessionCookieOptions());

    return response;
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 400 });
  }
}
