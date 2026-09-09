import { Suspense } from "react";
import { getAllJobAlerts } from "@/lib/job-service";
import { getSeoForRoute } from "@/lib/seo-service";
import { getBaseUrl } from "@/lib/base-url";
import JobsClient from "./jobs-client";
import JobsLoading from "./loading";

export async function generateMetadata() {
  const seo = await getSeoForRoute("/jobs");
  const siteUrl = getBaseUrl();
  const pageTitle =
    seo.title || "महाराष्ट्र सरकारी नोकरी व भरती जाहिराती २०२६ | MahaExam Job Alerts";
  const pageDesc =
    seo.description ||
    "महाराष्ट्र पोलीस भरती, तलाठी, MPSC, जिल्हा परिषद (ZP) आणि वनरक्षक भरतीच्या ताज्या अधिकृत जाहिराती, रिक्त पदे, पात्रता व अंतिम तारीख. मोफत सराव पेपर्ससह परिपूर्ण तयारी.";
  const ogImg = seo.ogImage || "/og-image.png";
  const canonicalUrl = `${siteUrl}/jobs`;

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      "Maharashtra Police Bharti 2026",
      "Talathi Bharti Notification",
      "MPSC Job Notification",
      "ZP Arogya Sevak Bharti",
      "Maharashtra Govt Jobs 2026",
      "सरकारी नोकरी महाराष्ट्र",
      "भरती जाहिराती २०२६",
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
          alt: "MahaExam Maharashtra Government Job Alerts",
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

export default async function JobAlertsPage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = (resolvedParams.q || "").trim();
  const category = (resolvedParams.category || "ALL").trim();
  const status = (resolvedParams.status || "ALL").trim().toUpperCase();

  const allJobs = await getAllJobAlerts();
  const siteUrl = getBaseUrl();

  // Pre-filter for deep linking, sharing, and SEO schema
  const displayedJobs = allJobs.filter((job) => {
    const matchesSearch =
      !query ||
      job.title?.toLowerCase().includes(query.toLowerCase()) ||
      job.titleMr?.toLowerCase().includes(query.toLowerCase()) ||
      job.department?.toLowerCase().includes(query.toLowerCase()) ||
      job.departmentMr?.toLowerCase().includes(query.toLowerCase()) ||
      job.qualification?.toLowerCase().includes(query.toLowerCase()) ||
      job.category?.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = status === "ALL" || !status || job.status?.toUpperCase() === status;

    const matchesCat =
      category === "ALL" ||
      !category ||
      job.category?.toLowerCase() === category.toLowerCase() ||
      job.department?.toLowerCase().includes(category.toLowerCase());

    return matchesSearch && matchesStatus && matchesCat;
  });

  // Schema.org CollectionPage & ItemList Schema for Jobs
  const jobsCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Maharashtra Government Job Alerts & Recruitment Notifications 2026",
    description:
      "Latest official recruitment notices, syllabus, qualifications, and mock tests for Maharashtra competitive exams.",
    url: `${siteUrl}/jobs`,
    publisher: {
      "@type": "Organization",
      name: "MahaExam",
      url: siteUrl,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: (displayedJobs.length > 0 ? displayedJobs : allJobs)
        .slice(0, 15)
        .map((job, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "JobPosting",
            title: job.titleMr || job.title,
            description: job.descriptionMr || job.description,
            url: `${siteUrl}/jobs/${job.slug || job.id}`,
            hiringOrganization: {
              "@type": "Organization",
              name: job.departmentMr || job.department || "Government of Maharashtra",
            },
            employmentType: "FULL_TIME",
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressRegion: "Maharashtra",
                addressCountry: "IN",
              },
            },
          },
        })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobsCollectionSchema) }}
      />
      <JobsClient
        initialJobs={allJobs}
        initialQuery={query}
        initialCategory={category}
        initialStatus={status}
      />
    </>
  );
}
