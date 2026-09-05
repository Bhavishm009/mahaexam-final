import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog-service";
import { getSeoForRoute } from "@/lib/seo-service";
import { FileText, Tag, ArrowRight, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const seo = await getSeoForRoute("/blogs");
  const pageTitle = seo.title || "महाराष्ट्र स्पर्धा परीक्षा ब्लॉग व बातम्या २०२६ | MahaExam Articles";
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Banner / Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
            <BookOpen className="w-96 h-96" />
          </div>

          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md inline-block">
              MahaExam Knowledge Hub 📚
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Latest Exam News, Articles & Preparation Guides
            </h1>
            <p className="text-indigo-100 text-base sm:text-lg">
              Stay updated with authentic notifications, syllabus updates, toppers strategy, and complete guides for Maharashtra Competitive Exams.
            </p>
          </div>
        </div>

        {/* Blogs Grid */}
        {blogs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-sm">
            <FileText className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No Articles Available Yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Check back soon for latest recruitment news and study materials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Image */}
                  {blog.imageUrl ? (
                    <div className="h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center relative">
                      <FileText className="w-12 h-12 text-white/60" />
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{blog.category}</span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="text-zinc-500 font-normal">
                        {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {blog.title}
                    </h2>

                    {blog.excerpt && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    Read Full Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
