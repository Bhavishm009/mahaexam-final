import { NextResponse } from "next/server";
import { getAllBlogPosts } from "@/lib/blog-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/blogs
 * Public API to search and filter blogs by query (q) and category.
 * Query Params:
 *  - q: search term (matches title, titleMr, excerpt, content, category)
 *  - category: blog category (e.g., "Police Bharti", "Talathi Bharti", "MPSC Special", "ALL")
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const category = (searchParams.get("category") || "ALL").trim();

    const allBlogs = await getAllBlogPosts({ includeDrafts: false });

    const filtered = allBlogs.filter((blog) => {
      const matchesSearch =
        !q ||
        blog.title?.toLowerCase().includes(q) ||
        blog.titleMr?.toLowerCase().includes(q) ||
        blog.excerpt?.toLowerCase().includes(q) ||
        blog.category?.toLowerCase().includes(q) ||
        blog.content?.toLowerCase().includes(q);

      const matchesCat =
        category === "ALL" || !category || blog.category?.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCat;
    });

    return NextResponse.json(
      {
        success: true,
        count: filtered.length,
        total: allBlogs.length,
        query: q,
        category: category,
        blogs: filtered,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs", blogs: [] },
      { status: 500 },
    );
  }
}
