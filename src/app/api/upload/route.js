import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";

export async function POST(req) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") || formData.get("image") || formData.get("avatar");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if Supabase storage credentials exist
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const fileExt = file.name ? file.name.split(".").pop() : "png";
        const fileName = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const bucket = "uploads";

        const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`;
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": file.type || "image/png",
            "x-upsert": "true",
          },
          body: buffer,
        });

        if (res.ok) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
          return NextResponse.json({ success: true, url: publicUrl });
        }
      } catch (sbErr) {
        console.warn("Supabase upload fallback to base64:", sbErr?.message);
      }
    }

    // High-performance Base64 Data URL fallback (works everywhere without extra storage config)
    const mimeType = file.type || "image/png";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
    });
  } catch (err) {
    console.error("Upload API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process image upload." },
      { status: 500 },
    );
  }
}
