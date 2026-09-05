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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back link */}
        <Link
          href="/blogs"
          prefetch={true}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Articles
        </Link>

        <article className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm p-6 sm:p-10 space-y-8">
          {/* Category & Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                {blog.category}
              </span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-zinc-400" />
                {blog.authorName || "MahaExam Team"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
              {blog.title}
            </h1>

            {blog.titleMr && blog.titleMr !== blog.title && (
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-600 dark:text-zinc-400">
                {blog.titleMr}
              </h2>
            )}
          </div>

          {/* Banner Image */}
          {blog.imageUrl && (
            <div className="rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full max-h-[450px] object-cover"
              />
            </div>
          )}

          {/* Excerpt Box */}
          {blog.excerpt && (
            <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200 text-lg leading-relaxed font-medium italic">
              "{blog.excerpt}"
            </div>
          )}

          {/* Main Content */}
          <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-base sm:text-lg leading-relaxed whitespace-pre-line font-sans space-y-4">
            {blog.content}
          </div>

          {/* Marathi Content if available */}
          {blog.contentMr && blog.contentMr !== blog.content && (
            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                मराठी माहिती (Marathi Details)
              </h3>
              <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                {blog.contentMr}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
