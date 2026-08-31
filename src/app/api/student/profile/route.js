import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
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
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, profile: user });
}

export async function PATCH(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, targetExam, education, district, taluka, preferredLanguage, newPassword } =
      body;

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

    const updatedUser = await prisma.user.update({
      where: { id: session.sub },
      data: {
        ...updateUserData,
        studentProfile: {
          upsert: {
            create: updateProfileData,
            update: updateProfileData,
          },
        },
      },
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
