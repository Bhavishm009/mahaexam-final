import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug } from "@/lib/blog-service";
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlogPostBySlug(slug);
  if (!blog) return { title: "Blog Not Found | MahaExam" };

  const pageTitle = `${blog.titleMr || blog.title} | MahaExam Blog`;
  const pageDesc = blog.excerpt || blog.content.substring(0, 160);
  const ogImg = blog.imageUrl || "/og-image.png";

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [blog.category, "MahaExam Blog", blog.title, "Maharashtra Exam News"],
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `/blogs/${blog.slug}`,
      siteName: "MahaExam",
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [ogImg],
    },
  };
}

export default async function BlogPostDetailPage({ params }) {
  const { slug } = await params;
  const blog = await getBlogPostBySlug(slug);

  if (!blog || !blog.published) {
    notFound();
  }

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/blogs"
          prefetch={true}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Articles
        </Link>

        <article className="space-y-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">
          {/* Category & Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/60 dark:text-indigo-400">
                {blog.category}
              </span>
              <span className="text-zinc-400">•</span>
              <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <Calendar className="h-4 w-4 text-zinc-400" />
                {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="text-zinc-400">•</span>
              <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <User className="h-4 w-4 text-zinc-400" />
                {blog.authorName || "MahaExam Team"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-extrabold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl md:text-5xl">
              {blog.title}
            </h1>

            {blog.titleMr && blog.titleMr !== blog.title && (
              <h2 className="text-xl font-semibold text-zinc-600 dark:text-zinc-400 sm:text-2xl">
                {blog.titleMr}
              </h2>
            )}
          </div>

          {/* Banner Image */}
          {blog.imageUrl && (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="max-h-[450px] w-full object-cover"
              />
            </div>
          )}

          {/* Excerpt Box */}
          {blog.excerpt && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 text-lg font-medium italic leading-relaxed text-indigo-950 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200">
              "{blog.excerpt}"
            </div>
          )}

          {/* Main Content */}
          <div className="prose dark:prose-invert max-w-none space-y-4 whitespace-pre-line font-sans text-base leading-relaxed text-zinc-800 dark:text-zinc-200 sm:text-lg">
            {blog.content}
          </div>

          {/* Marathi Content if available */}
          {blog.contentMr && blog.contentMr !== blog.content && (
            <div className="space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                मराठी माहिती (Marathi Details)
              </h3>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-line text-base leading-relaxed text-zinc-800 dark:text-zinc-200 sm:text-lg">
                {blog.contentMr}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
