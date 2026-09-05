import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import {
  getAllBlogPosts,
  createBlogPost,
  deleteBlogPost,
  updateBlogPost,
} from "@/lib/blog-service";

export async function GET() {
  try {
    const blogs = await getAllBlogPosts({ includeDrafts: true });
    return NextResponse.json({ success: true, blogs });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || !["SUPER_ADMIN", "COACHING_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      title,
      titleMr,
      content,
      contentMr,
      excerpt,
      imageUrl,
      category,
      published,
      authorName,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Validation Error: Blog Title is required." },
        { status: 400 },
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Validation Error: Blog Content is required." },
        { status: 400 },
      );
    }

    let blog;
    if (id) {
      blog = await updateBlogPost(id, {
        title: title.trim(),
        titleMr: titleMr?.trim() || title.trim(),
        content: content.trim(),
        contentMr: contentMr?.trim() || content.trim(),
        excerpt: excerpt?.trim() || "",
        imageUrl: imageUrl?.trim() || null,
        category: category?.trim() || "Exam News",
        published: published !== false,
        authorName: authorName?.trim() || "MahaExam Team",
      });
    } else {
      blog = await createBlogPost({
        title: title.trim(),
        titleMr: titleMr?.trim() || title.trim(),
        content: content.trim(),
        contentMr: contentMr?.trim() || content.trim(),
        excerpt: excerpt?.trim() || "",
        imageUrl: imageUrl?.trim() || null,
        category: category?.trim() || "Exam News",
        published: published !== false,
        authorName: authorName?.trim() || "MahaExam Team",
      });
    }

    return NextResponse.json({
      success: true,
      blog,
      message: id ? "Blog post updated successfully!" : "Blog post published successfully!",
    });
  } catch (error) {
    console.error("Error saving blog post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save blog post." },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || !["SUPER_ADMIN", "COACHING_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing blog post ID" }, { status: 400 });
    }

    await deleteBlogPost(id);
    return NextResponse.json({ success: true, message: "Blog post deleted successfully." });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete blog post." },
      { status: 500 },
    );
  }
}
