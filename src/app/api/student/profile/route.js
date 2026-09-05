import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { COOKIE, verifySessionToken } from "@/lib/auth";
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
      return NextResponse.json({ error: "Student login required" }, { status: 401 });
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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Auto-upsert student profile record if missing
    if (!user.studentProfile) {
      const newProfile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          coachingStatus: "INDIVIDUAL",
        },
        select: {
          id: true,
          targetExam: true,
          education: true,
          district: true,
          taluka: true,
          coachingStatus: true,
        },
      });
      user.studentProfile = newProfile;
    }

    return NextResponse.json({ success: true, profile: user });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load student profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
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
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, phone, targetExam, education, district, taluka, preferredLanguage, newPassword, profilePhoto } =
      body;

    const updateUserData = {};
    if (typeof name === "string" && name.trim()) {
      updateUserData.name = name.trim();
    }
    if (typeof phone === "string") {
      const cleanPhone = phone.trim();
      if (cleanPhone) {
        const existingPhone = await prisma.user.findFirst({
          where: { phone: cleanPhone, id: { not: userId } },
        });
        if (existingPhone) {
          return NextResponse.json(
            { error: "Phone number already registered with another account." },
            { status: 400 },
          );
        }
        updateUserData.phone = cleanPhone;
      } else {
        updateUserData.phone = null;
      }
    }
    if (typeof preferredLanguage === "string") {
      updateUserData.preferredLanguage = preferredLanguage;
    }
    if (newPassword && typeof newPassword === "string" && newPassword.length >= 6) {
      updateUserData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateUserData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateUserData,
      });
    }

    const updateProfileData = {};
    if (typeof targetExam === "string") {
      updateProfileData.targetExam = targetExam.trim();
    }
    if (typeof education === "string") {
      updateProfileData.education = education.trim();
    }
    if (typeof district === "string") {
      updateProfileData.district = district.trim();
    }
    if (typeof taluka === "string") {
      updateProfileData.taluka = taluka.trim();
    }
    if (typeof profilePhoto === "string") {
      updateProfileData.profilePhoto = profilePhoto.trim();
    }

    await prisma.studentProfile.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        ...updateProfileData,
      },
      update: updateProfileData,
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        preferredLanguage: true,
        studentProfile: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 400 },
    );
  }
}
