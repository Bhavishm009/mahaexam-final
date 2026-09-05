import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog-service";
import { getSeoForRoute } from "@/lib/seo-service";
import { FileText, Tag, ArrowRight, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const seo = await getSeoForRoute("/blogs");
  const pageTitle =
    seo.title || "महाराष्ट्र स्पर्धा परीक्षा ब्लॉग व बातम्या २०२६ | MahaExam Articles";
  const pageDesc =
    seo.description ||
    "पोलीस भरती, MPSC, तलाठी व जिल्हा परिषद परीक्षांच्या ताज्या बातम्या, अभ्यासक्रम, मार्गदर्शक लेख आणि टॉपर नीती.";
  const ogImg = seo.ogImage || "/og-image.png";

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      "MahaExam Blog",
      "Maharashtra Bharti News 2026",
      "Exam Preparation Tips",
      "MPSC Topper Strategy",
      "Police Bharti Guide",
    ],
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: "/blogs",
      siteName: "MahaExam",
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: "MahaExam Knowledge Hub & Articles",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [ogImg],
    },
  };
}

export default async function PublicBlogsPage() {
  const blogs = await getAllBlogPosts({ includeDrafts: false });

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        {/* Banner / Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-8 text-white shadow-xl sm:p-12">
          <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-15">
            <BookOpen className="h-96 w-96" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              MahaExam Knowledge Hub 📚
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Latest Exam News, Articles & Preparation Guides
            </h1>
            <p className="text-base text-indigo-100 sm:text-lg">
              Stay updated with authentic notifications, syllabus updates, toppers strategy, and
              complete guides for Maharashtra Competitive Exams.
            </p>
          </div>
        </div>

        {/* Blogs Grid */}
        {blogs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <FileText className="mx-auto mb-3 h-12 w-12 text-zinc-400" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              No Articles Available Yet
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Check back soon for latest recruitment news and study materials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  {/* Image */}
                  {blog.imageUrl ? (
                    <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="relative flex h-44 w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700">
                      <FileText className="h-12 w-12 text-white/60" />
                    </div>
                  )}

                  <div className="space-y-3 p-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <Tag className="h-3.5 w-3.5" />
                      <span>{blog.category}</span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="font-normal text-zinc-500">
                        {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h2 className="line-clamp-2 text-xl font-bold text-zinc-900 transition-colors group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {blog.title}
                    </h2>

                    {blog.excerpt && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Read Full Article
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
