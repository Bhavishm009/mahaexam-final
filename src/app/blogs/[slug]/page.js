import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/blog-service";
import { getBaseUrl } from "@/lib/base-url";
import {
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Clock,
  BookOpen,
  ArrowRight,
  Zap,
  Sparkles,
  Share2,
} from "lucide-react";
import Breadcrumbs from "@/components/breadcrumbs";
import SocialShare from "@/components/social-share";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlogPostBySlug(slug);
  if (!blog) return { title: "Blog Not Found | MahaExam" };

  const siteUrl = getBaseUrl();
  const pageTitle = `${blog.titleMr || blog.title} | MahaExam Blog`;
  const pageDesc = blog.excerpt || (blog.content || "").replace(/<[^>]*>/g, " ").substring(0, 160);
  const ogImg = blog.imageUrl || "/og-image.png";
  const canonicalUrl = `${siteUrl}/blogs/${blog.slug}`;

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      blog.category,
      "MahaExam Blog",
      blog.title,
      blog.titleMr,
      "Maharashtra Exam News",
      "पोलीस भरती माहिती",
      "MPSC तयारी",
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      siteName: "MahaExam",
      locale: "mr_IN",
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

  // Calculate estimated reading time
  const plainText = (blog.content || "").replace(/<[^>]*>/g, " ");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 180));

  // Fetch suggested / related blogs
  const allBlogs = await getAllBlogPosts({ includeDrafts: false });
  const suggestedBlogs = allBlogs
    .filter((b) => b.id !== blog.id && b.slug !== blog.slug)
    .sort((a, b) => {
      // Prioritize same category
      if (a.category === blog.category && b.category !== blog.category) return -1;
      if (b.category === blog.category && a.category !== blog.category) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, 3);

  const siteUrl = getBaseUrl();
  const postUrl = `${siteUrl}/blogs/${blog.slug}`;
  const publishDateIso = blog.createdAt
    ? new Date(blog.createdAt).toISOString()
    : new Date().toISOString();
  const updateDateIso = blog.updatedAt ? new Date(blog.updatedAt).toISOString() : publishDateIso;

  // Schema.org BlogPosting / Article JSON-LD
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    headline: blog.title,
    alternativeHeadline: blog.titleMr || undefined,
    description: blog.excerpt || (blog.content || "").replace(/<[^>]*>/g, " ").substring(0, 160),
    image: blog.imageUrl ? [blog.imageUrl] : [`${siteUrl}/og-image.png`],
    datePublished: publishDateIso,
    dateModified: updateDateIso,
    inLanguage: ["mr-IN", "en-IN"],
    articleSection: blog.category || "General",
    author: {
      "@type": "Organization",
      name: blog.authorName || "MahaExam Editorial Team",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "MahaExam",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  const isHtmlContent = (str) => /<[a-z][\s\S]*>/i.test(str || "");

  return (
    <div className="pb-12 pt-3 font-sans sm:pb-16 sm:pt-4">
      {/* Article Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="mx-auto max-w-4xl space-y-4 px-4 sm:px-6 lg:px-8">
        {/* Navigation & Breadcrumbs - Compact Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Articles & Blog", href: "/blogs" },
              {
                label: blog.category || "Exam Guide",
                href: `/blogs?category=${encodeURIComponent(blog.category || "")}`,
              },
              { label: blog.title },
            ]}
          />

          <Link
            href="/blogs"
            prefetch={true}
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-slate-600 transition hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Articles</span>
          </Link>
        </div>

        {/* Main Article Container Card */}
        <article className="glass-card overflow-hidden rounded-3xl p-6 shadow-md backdrop-blur-xl sm:p-10">
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-sky-700 dark:border-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
                <Tag className="h-3 w-3" />
                {blog.category || "General"}
              </span>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {readingTimeMin} min read
              </span>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {blog.authorName || "MahaExam Team"}
              </span>
            </div>

            {/* Main Article Title */}
            <h1 className="text-2xl font-black leading-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
              {blog.title}
            </h1>

            {/* Marathi Subtitle */}
            {blog.titleMr && blog.titleMr !== blog.title && (
              <h2 className="text-lg font-bold text-sky-700 dark:text-sky-400 sm:text-xl">
                {blog.titleMr}
              </h2>
            )}

            {/* Social Share Bar Top */}
            <div className="border-y border-slate-200/80 py-3.5 dark:border-slate-800/80">
              <SocialShare
                url={postUrl}
                title={blog.title}
                summary={blog.excerpt}
                showLabel={true}
              />
            </div>
          </div>

          {/* Featured Cover Banner Image */}
          {blog.imageUrl && (
            <div className="my-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-inner dark:border-slate-800/80 dark:bg-slate-950">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="max-h-[480px] w-full object-cover transition-transform duration-300 hover:scale-[1.01]"
              />
            </div>
          )}

          {/* Excerpt Highlight Box */}
          {blog.excerpt && (
            <div className="my-6 rounded-2xl border border-sky-200/80 bg-sky-50/70 p-5 text-sm font-medium italic leading-relaxed text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200 sm:text-base">
              "{blog.excerpt}"
            </div>
          )}

          {/* Main Article Body */}
          <div className="my-8">
            {isHtmlContent(blog.content) ? (
              <div
                className="prose prose-sm dark:prose-invert sm:prose-base max-w-none space-y-4 font-sans leading-relaxed text-slate-800 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 whitespace-pre-line font-sans text-sm leading-relaxed text-slate-800 dark:text-slate-200 sm:text-base">
                {blog.content}
              </div>
            )}
          </div>

          {/* Marathi Content Section if distinct */}
          {blog.contentMr && blog.contentMr !== blog.content && (
            <div className="my-8 space-y-4 border-t border-slate-200/80 pt-8 dark:border-slate-800/80">
              <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white sm:text-xl">
                <Sparkles className="h-5 w-5 text-sky-500" />
                <span>मराठी माहिती व सविस्तर मार्गदर्शन</span>
              </h3>
              {isHtmlContent(blog.contentMr) ? (
                <div
                  className="prose prose-sm dark:prose-invert sm:prose-base max-w-none space-y-4 font-sans leading-relaxed text-slate-800 dark:text-slate-200"
                  dangerouslySetInnerHTML={{ __html: blog.contentMr }}
                />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 whitespace-pre-line font-sans text-sm leading-relaxed text-slate-800 dark:text-slate-200 sm:text-base">
                  {blog.contentMr}
                </div>
              )}
            </div>
          )}

          {/* Interactive Exam Preparation Callout */}
          <div className="my-8 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold backdrop-blur-md">
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  <span>मोफत सराव चाचणी</span>
                </div>
                <h4 className="text-lg font-black sm:text-xl">
                  या परीक्षेची परिपूर्ण तयारी करताय?
                </h4>
                <p className="text-xs text-sky-100 sm:text-sm">
                  TCS & IBPS पॅटर्ननुसार १०० गुणांच्या अधिकृत ऑनलाईन मॉक टेस्ट लगेच सोडवा.
                </p>
              </div>

              <Link
                href="/exams"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-sky-800 shadow-md transition hover:bg-sky-50 active:scale-95"
              >
                <span>सराव सुरू करा</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Social Share Bar Bottom */}
          <div className="border-t border-slate-200/80 pt-6 dark:border-slate-800/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                मित्रांसोबत ही माहिती शेअर करा:
              </span>
              <SocialShare
                url={postUrl}
                title={blog.title}
                summary={blog.excerpt}
                showLabel={false}
              />
            </div>
          </div>

          {/* Author Attribution Card */}
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800/70 dark:bg-slate-950/60">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 font-bold text-white shadow-sm">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {blog.authorName || "MahaExam Editorial Team"}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                MahaExam अभ्यास मंच - महाराष्ट्र पोलीस भरती, तलाठी, MPSC व स्पर्धा परीक्षांचे अधिकृत
                मार्गदर्शन केंद्र.
              </p>
            </div>
          </div>
        </article>

        {/* Suggested / Related Articles Section */}
        {suggestedBlogs.length > 0 && (
          <section className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-500" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  संबंधित व सुचवलेले लेख (Suggested Articles)
                </h3>
              </div>
              <Link
                href="/blogs"
                className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                View All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {suggestedBlogs.map((suggested) => (
                <Link
                  key={suggested.id}
                  href={`/blogs/${suggested.slug}`}
                  prefetch={true}
                  className="glass-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/80"
                >
                  <div className="space-y-2.5">
                    {suggested.imageUrl ? (
                      <div className="h-28 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                        <img
                          src={suggested.imageUrl}
                          alt={suggested.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex h-28 w-full items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 text-sky-600">
                        <BookOpen className="h-8 w-8" />
                      </div>
                    )}

                    <span className="inline-block rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
                      {suggested.category || "Exam News"}
                    </span>

                    <h4 className="line-clamp-2 text-xs font-bold text-slate-900 transition group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                      {suggested.title}
                    </h4>

                    {suggested.excerpt && (
                      <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {suggested.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                    <span>वाचा</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
