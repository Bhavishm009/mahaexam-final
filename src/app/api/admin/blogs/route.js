import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import {
  getAllBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
  createBlogPost,
  deleteBlogPost,
  deleteBlogPosts,
  updateBlogPost,
} from "@/lib/blog-service";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (id) {
      const blog = await getBlogPostById(id);
      if (!blog) {
        return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, blog });
    }

    if (slug) {
      const blog = await getBlogPostBySlug(slug);
      if (!blog) {
        return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, blog });
    }

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
    const queryId = searchParams.get("id");

    let body = {};
    try {
      body = await req.json();
    } catch {}

    const idsToDelete = body.ids || (queryId ? [queryId] : []);

    if (!idsToDelete.length) {
      return NextResponse.json({ error: "Missing blog post ID(s) to delete" }, { status: 400 });
    }

    if (idsToDelete.length === 1) {
      await deleteBlogPost(idsToDelete[0]);
      return NextResponse.json({ success: true, message: "Blog post deleted successfully." });
    }

    const result = await deleteBlogPosts(idsToDelete);
    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully deleted ${idsToDelete.length} blog posts.`,
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete blog post." },
      { status: 500 },
    );
  }
}
