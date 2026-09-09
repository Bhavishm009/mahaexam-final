import { Suspense } from "react";
import { getAllBlogPosts } from "@/lib/blog-service";
import { getSeoForRoute } from "@/lib/seo-service";
import { getBaseUrl } from "@/lib/base-url";
import BlogsClient from "./blogs-client";
import BlogsLoading from "./loading";

export async function generateMetadata() {
  const seo = await getSeoForRoute("/blogs");
  const siteUrl = getBaseUrl();
  const pageTitle =
    seo.title || "महाराष्ट्र स्पर्धा परीक्षा ब्लॉग व बातम्या २०२६ | MahaExam Articles";
  const pageDesc =
    seo.description ||
    "पोलीस भरती, MPSC, तलाठी व जिल्हा परिषद परीक्षांच्या ताज्या बातम्या, अभ्यासक्रम, मार्गदर्शक लेख आणि टॉपर नीती.";
  const ogImg = seo.ogImage || "/og-image.png";
  const canonicalUrl = `${siteUrl}/blogs`;

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      "MahaExam Blog",
      "Maharashtra Bharti News 2026",
      "Exam Preparation Tips",
      "MPSC Topper Strategy",
      "Police Bharti Guide",
      "पोलीस भरती सराव",
      "तलाठी परीक्षा मार्गदर्शन",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
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

export default async function PublicBlogsPage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = (resolvedParams.q || "").trim();
  const category = (resolvedParams.category || "ALL").trim();

  const allBlogs = await getAllBlogPosts({ includeDrafts: false });
  const siteUrl = getBaseUrl();

  // Filtered list for server-rendered Schema.org JSON-LD and deep link pre-rendering
  const displayedBlogs = allBlogs.filter((b) => {
    const matchesQuery =
      !query ||
      b.title?.toLowerCase().includes(query.toLowerCase()) ||
      b.titleMr?.toLowerCase().includes(query.toLowerCase()) ||
      b.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
      b.category?.toLowerCase().includes(query.toLowerCase());

    const matchesCategory =
      category === "ALL" || !category || b.category?.toLowerCase() === category.toLowerCase();

    return matchesQuery && matchesCategory;
  });

  // Schema.org CollectionPage Schema for Articles Hub
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "MahaExam Articles & Exam Preparation Guides",
    description:
      "Educational articles, syllabus notifications, and exam guides for Maharashtra competitive examinations.",
    url: `${siteUrl}/blogs`,
    publisher: {
      "@type": "Organization",
      name: "MahaExam",
      url: siteUrl,
    },
    hasPart: (displayedBlogs.length > 0 ? displayedBlogs : allBlogs).slice(0, 10).map((b) => ({
      "@type": "BlogPosting",
      headline: b.title,
      url: `${siteUrl}/blogs/${b.slug}`,
      datePublished: b.createdAt ? new Date(b.createdAt).toISOString() : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <BlogsClient initialBlogs={allBlogs} initialQuery={query} initialCategory={category} />
    </>
  );
}
