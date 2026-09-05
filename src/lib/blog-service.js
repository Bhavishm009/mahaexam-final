import { primaryPrisma } from "@/lib/db";

export async function getAllBlogPosts({ includeDrafts = false } = {}) {
  try {
    if (primaryPrisma.blogPost) {
      return await primaryPrisma.blogPost.findMany({
        where: includeDrafts ? {} : { published: true },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (_) {}

  try {
    const rows = await primaryPrisma.$queryRawUnsafe(
      `SELECT * FROM "BlogPost" ${includeDrafts ? "" : 'WHERE "published" = true'} ORDER BY "createdAt" DESC`
    );
    return rows || [];
  } catch (err) {
    console.error("Error fetching blog posts:", err);
    return [];
  }
}

export async function getBlogPostBySlug(slug) {
  if (!slug) return null;
  try {
    if (primaryPrisma.blogPost) {
      return await primaryPrisma.blogPost.findUnique({
        where: { slug },
      });
    }
  } catch (_) {}

  try {
    const rows = await primaryPrisma.$queryRawUnsafe(
      `SELECT * FROM "BlogPost" WHERE "slug" = $1 LIMIT 1`,
      slug
    );
    return rows?.[0] || null;
  } catch (err) {
    console.error("Error fetching blog post by slug:", err);
    return null;
  }
}

export async function createBlogPost(data) {
  const slugBase = (data.title || "blog-post")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = slugBase || "blog-post";
  let count = 1;

  while (await getBlogPostBySlug(slug)) {
    slug = `${slugBase}-${count}`;
    count++;
  }

  try {
    if (primaryPrisma.blogPost) {
      return await primaryPrisma.blogPost.create({
        data: {
          slug,
          title: data.title,
          titleMr: data.titleMr || data.title,
          content: data.content,
          contentMr: data.contentMr || data.content,
          excerpt: data.excerpt || "",
          imageUrl: data.imageUrl || null,
          category: data.category || "Exam News",
          published: data.published !== false,
          authorName: data.authorName || "MahaExam Team",
        },
      });
    }
  } catch (_) {}

  const id = `blog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const title = data.title;
  const titleMr = data.titleMr || title;
  const content = data.content;
  const contentMr = data.contentMr || content;
  const excerpt = data.excerpt || "";
  const imageUrl = data.imageUrl || null;
  const category = data.category || "Exam News";
  const published = data.published !== false;
  const authorName = data.authorName || "MahaExam Team";
  const now = new Date();

  await primaryPrisma.$queryRawUnsafe(
    `INSERT INTO "BlogPost" ("id", "slug", "title", "titleMr", "content", "contentMr", "excerpt", "imageUrl", "category", "published", "authorName", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    id,
    slug,
    title,
    titleMr,
    content,
    contentMr,
    excerpt,
    imageUrl,
    category,
    published,
    authorName,
    now,
    now
  );

  return {
    id,
    slug,
    title,
    titleMr,
    content,
    contentMr,
    excerpt,
    imageUrl,
    category,
    published,
    authorName,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateBlogPost(id, data) {
  try {
    if (primaryPrisma.blogPost) {
      return await primaryPrisma.blogPost.update({
        where: { id },
        data: {
          title: data.title,
          titleMr: data.titleMr,
          content: data.content,
          contentMr: data.contentMr,
          excerpt: data.excerpt,
          imageUrl: data.imageUrl,
          category: data.category,
          published: data.published,
          authorName: data.authorName,
        },
      });
    }
  } catch (_) {}

  const now = new Date();
  await primaryPrisma.$queryRawUnsafe(
    `UPDATE "BlogPost"
     SET "title" = $1, "titleMr" = $2, "content" = $3, "contentMr" = $4, "excerpt" = $5, "imageUrl" = $6, "category" = $7, "published" = $8, "authorName" = $9, "updatedAt" = $10
     WHERE "id" = $11`,
    data.title,
    data.titleMr,
    data.content,
    data.contentMr,
    data.excerpt,
    data.imageUrl,
    data.category,
    data.published,
    data.authorName,
    now,
    id
  );

  return (await getBlogPostBySlug(data.slug)) || { id, ...data };
}

export async function deleteBlogPost(id) {
  try {
    if (primaryPrisma.blogPost) {
      return await primaryPrisma.blogPost.delete({
        where: { id },
      });
    }
  } catch (_) {}

  await primaryPrisma.$queryRawUnsafe(`DELETE FROM "BlogPost" WHERE "id" = $1`, id);
  return { id };
}
