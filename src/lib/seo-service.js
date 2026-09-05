import { unstable_cache as cache, revalidateTag } from "next/cache";
import { prisma } from "./db.js";
import { getBaseUrl } from "./base-url.js";

const siteBase = getBaseUrl();

export const DEFAULT_SEO_CONFIG = {
  "/": {
    route: "/",
    title: "MahaExam — महाराष्ट्र स्पर्धा परीक्षा पोर्टल २०२६ | Police, MPSC, Talathi Mock Tests",
    titleMr: "MahaExam — महाराष्ट्र स्पर्धा परीक्षा पोर्टल २०२६",
    description:
      "महाराष्ट्र पोलीस भरती, तलाठी, MPSC राज्यसेवा, संयुक्त गट ब व क, जिल्हा परिषद आणि वनरक्षक भरतीसाठी TCS/IBPS पॅटर्न मोफत ऑनलाइन मॉक टेस्ट व अधिकृत PYQ प्रश्नपत्रिका.",
    descriptionMr:
      "महाराष्ट्र पोलीस भरती, तलाठी, MPSC राज्यसेवा, संयुक्त गट ब व क, जिल्हा परिषद आणि वनरक्षक भरतीसाठी TCS/IBPS पॅटर्न मोफत ऑनलाइन मॉक टेस्ट पोर्टल.",
    keywords:
      "Police Bharti Mock Test, MPSC Test Series, Talathi TCS Exam, ZP Arogya Sevak Mock Test, Maharashtra Online CBT, पोलीस भरती सराव पेपर",
    canonicalUrl: `${siteBase}/`,
    ogImage: "/og-image.png",
  },
  "/exams": {
    route: "/exams",
    title: "सर्व महाराष्ट्र स्पर्धा परीक्षा ऑनलाईन सराव चाचण्या २०२६ | MahaExam",
    titleMr: "महाराष्ट्र स्पर्धा परीक्षा सराव दालन",
    description:
      "पोलीस भरती, तलाठी, MPSC, जिल्हा परिषद व सरळसेवा परीक्षांचे १०० गुणांचे परिपूर्ण ऑनलाईन CBT सराव पेपर्स. मोफत सोडवा व निकाल पहा.",
    descriptionMr:
      "पोलीस भरती, तलाठी, MPSC, जिल्हा परिषद व सरळसेवा परीक्षांचे परिपूर्ण ऑनलाईन CBT सराव पेपर्स.",
    keywords:
      "Maharashtra Exams Directory, Police Bharti Mock Test, MPSC Rajyaseva, Talathi Bharti TCS, ZP Mock Tests",
    canonicalUrl: `${siteBase}/exams`,
    ogImage: "/og-exams.png",
  },
  "/jobs": {
    route: "/jobs",
    title: "महाराष्ट्र सरकारी नोकरी व भरती जाहिराती २०२६ | Maharashtra Govt Job Alerts",
    titleMr: "महाराष्ट्र सरकारी नोकरी व भरती जाहिराती २०२६",
    description:
      "महाराष्ट्र पोलीस भरती, तलाठी, MPSC, जिल्हा परिषद (ZP) आणि वनरक्षक भरतीच्या ताज्या अधिकृत जाहिराती, रिक्त पदे, पात्रता व अंतिम तारीख.",
    descriptionMr:
      "महाराष्ट्र पोलीस भरती, तलाठी, MPSC, जिल्हा परिषद व वनरक्षक भरतीच्या ताज्या अधिकृत जाहिराती.",
    keywords:
      "Maharashtra Police Bharti 2026, MPSC Job Notification, Talathi Bharti 2026, ZP Bharti Alert, Govt Jobs Maharashtra",
    canonicalUrl: `${siteBase}/jobs`,
    ogImage: "/og-jobs.png",
  },
  "/blogs": {
    route: "/blogs",
    title: "महाराष्ट्र स्पर्धा परीक्षा ब्लॉग व बातम्या २०२६ | MahaExam Articles",
    titleMr: "महाराष्ट्र स्पर्धा परीक्षा ब्लॉग व बातम्या",
    description:
      "पोलीस भरती, MPSC, तलाठी व जिल्हा परिषद परीक्षांच्या ताज्या बातम्या, अभ्यासक्रम, मार्गदर्शक लेख आणि टॉपर नीती.",
    descriptionMr:
      "पोलीस भरती, MPSC, तलाठी व जिल्हा परिषद परीक्षांच्या ताज्या बातम्या व अभ्यास मार्गदर्शक.",
    keywords:
      "MahaExam Blog, Maharashtra Bharti News 2026, Exam Preparation Tips, MPSC Topper Strategy",
    canonicalUrl: `${siteBase}/blogs`,
    ogImage: "/og-image.png",
  },
  "/pricing": {
    route: "/pricing",
    title: "किंमत व प्लॅन्स — विद्यार्थी व अकॅडेमी | MahaExam Subscriptions",
    titleMr: "किंमत व प्लॅन्स — MahaExam",
    description:
      "विद्यार्थ्यांसाठी मोफत व अकॅडेमींसाठी परवडणारे परीक्षा पोर्टल प्लॅन्स. अमर्याद सराव पेपर्स व अँटी-चीट CBT सिम्युलेटर.",
    descriptionMr: "विद्यार्थ्यांसाठी मोफत व अकॅडेमींसाठी परवडणारे परीक्षा पोर्टल प्लॅन्स.",
    keywords: "MahaExam Pricing, Coaching Institute Software, Online Exam Portal Subscription",
    canonicalUrl: `${siteBase}/pricing`,
    ogImage: "/og-pricing.png",
  },
  "/faq": {
    route: "/faq",
    title: "वारंवार विचारले जाणारे प्रश्न (FAQ) | MahaExam Portal Support",
    titleMr: "वारंवार विचारले जाणारे प्रश्न (FAQ)",
    description:
      "MahaExam प्लॅटफॉर्म, ऑनलाईन सराव परीक्षा, TCS/IBPS पॅटर्न, निकाल आणि तांत्रिक अडचणींबाबत सर्व प्रश्नांची स्पष्ट उत्तरे.",
    descriptionMr:
      "MahaExam प्लॅटफॉर्म, सराव परीक्षा, निकाल आणि तांत्रिक अडचणींबाबत स्पष्ट उत्तरे.",
    keywords: "MahaExam FAQ, Online Exam Help, TCS IBPS Pattern Doubt Clear",
    canonicalUrl: `${siteBase}/faq`,
    ogImage: "/og-faq.png",
  },
  "/features": {
    route: "/features",
    title: "प्लॅटफॉर्म वैशिष्ट्ये — TCS/IBPS इंजिन व अँटी-चीट Guard | MahaExam",
    titleMr: "प्लॅटफॉर्म वैशिष्ट्ये — MahaExam",
    description:
      "महाराष्ट्रातील पहिल्या हाय-टेक CBT परीक्षा सिम्युलेटरची वैशिष्ट्ये: लाईव्ह रँकिंग, सविस्तर स्पष्टीकरणे, आणि फुलस्क्रीन अँटी-चीट लॉक.",
    descriptionMr: "हाय-टेक CBT परीक्षा सिम्युलेटरची वैशिष्ट्ये: लाईव्ह रँकिंग व अँटी-चीट लॉक.",
    keywords: "CBT Exam Engine, Anti Cheat Exam Guard, Live Leaderboard Maharashtra",
    canonicalUrl: `${siteBase}/features`,
    ogImage: "/og-features.png",
  },
  "/for-coaching": {
    route: "/for-coaching",
    title: "स्पर्धा परीक्षा अकॅडेमींसाठी ऑनलाईन पोर्टल सोल्यूशन्स | MahaExam",
    titleMr: "अकॅडेमी सोल्यूशन्स — MahaExam",
    description:
      "तुमच्या कोचिंग क्लाससाठी स्वतःच्या नावाने ऑनलाईन परीक्षा पोर्टल सुरू करा. ५ मिनिटांत बॅच व्यवस्थापन व टेस्ट सिरीज लाइव्ह करा.",
    descriptionMr: "तुमच्या कोचिंग क्लाससाठी स्वतःच्या नावाने ऑनलाईन परीक्षा पोर्टल सुरू करा.",
    keywords:
      "Coaching Class Test Portal, White Label Exam Engine Maharashtra, Academy Test Manager",
    canonicalUrl: `${siteBase}/for-coaching`,
    ogImage: "/og-coaching.png",
  },
  "/login": {
    route: "/login",
    title: "विद्यार्थी व शिक्षक लॉगिन | MahaExam",
    titleMr: "लॉगइन — MahaExam",
    description: "तुमच्या MahaExam खात्यात लॉगिन करा आणि सराव चाचण्या, निकाल व प्रगतीचा तक्ता पहा.",
    descriptionMr: "तुमच्या खात्यात लॉगिन करा आणि सराव चाचण्या व निकाल पहा.",
    keywords: "MahaExam Login, Student Portal Signin",
    canonicalUrl: `${siteBase}/login`,
  },
  "/register": {
    route: "/register",
    title: "मोफत खाते उघडा (Free Sign Up) | MahaExam",
    titleMr: "नवीन नोंदणी — MahaExam",
    description:
      "MahaExam वर १ मिनिटात मोफत नोंदणी करा आणि महाराष्ट्रातील सर्व स्पर्धा परीक्षांचे सराव पेपर्स सोडवा.",
    descriptionMr: "१ मिनिटात मोफत नोंदणी करा आणि सर्व सराव पेपर्स सोडवा.",
    keywords: "MahaExam Register, Free Account Creation",
    canonicalUrl: `${siteBase}/register`,
  },
};

/**
 * Internal DB fetcher for SEO route config
 */
async function fetchSeoForRouteInternal(routePath) {
  const cleanPath = routePath?.toLowerCase() || "/";

  try {
    if (prisma?.seoSetting) {
      const dbSeo = await prisma.seoSetting.findUnique({
        where: { route: cleanPath },
      });

      if (dbSeo) {
        return {
          route: dbSeo.route,
          title: dbSeo.title,
          titleMr: dbSeo.titleMr || dbSeo.title,
          description: dbSeo.description,
          descriptionMr: dbSeo.descriptionMr || dbSeo.description,
          keywords: dbSeo.keywords || "",
          canonicalUrl: dbSeo.canonicalUrl || `${siteBase}${cleanPath}`,
          ogImage: dbSeo.ogImage || "/og-image.png",
          structuredJson: dbSeo.structuredJson || null,
        };
      }
    }
  } catch (err) {
    console.error("getSeoForRoute DB Fetch Error:", err?.message);
  }

  const fallback = DEFAULT_SEO_CONFIG[cleanPath] || {
    route: cleanPath,
    title: `MahaExam — महाराष्ट्र स्पर्धा परीक्षा पोर्टल (${cleanPath})`,
    titleMr: `MahaExam स्पर्धा परीक्षा (${cleanPath})`,
    description:
      "महाराष्ट्र पोलीस भरती, तलाठी, MPSC, जिल्हा परिषद आणि सरळसेवा परीक्षांचे ऑनलाईन CBT सराव पेपर्स.",
    descriptionMr: "महाराष्ट्र स्पर्धा परीक्षांचे ऑनलाईन CBT सराव पेपर्स.",
    keywords: "Maharashtra Exam Portal, Online Mock Test, CBT Exam",
    canonicalUrl: `${siteBase}${cleanPath}`,
    ogImage: "/og-image.png",
  };

  return fallback;
}

/**
 * High-performance cached fetch for route SEO metadata
 */
export async function getSeoForRoute(routePath, overrides = {}) {
  const cleanPath = routePath?.toLowerCase() || "/";
  const seoData = await cache(
    () => fetchSeoForRouteInternal(cleanPath),
    [`seo-route-${cleanPath}`],
    { revalidate: 120, tags: ["seo-settings"] },
  )();

  const title = overrides.title || seoData.title;
  const description = overrides.description || seoData.description;
  const rawKeywords = overrides.keywords || seoData.keywords;
  const keywords = Array.isArray(rawKeywords)
    ? rawKeywords
    : typeof rawKeywords === "string" && rawKeywords.trim()
      ? rawKeywords.split(",").map((k) => k.trim())
      : [];

  const canonicalUrl = overrides.canonicalUrl || seoData.canonicalUrl || `${siteBase}${cleanPath}`;

  const rawOgImg = overrides.ogImage || seoData.ogImage;
  const ogImageUrl =
    rawOgImg &&
    rawOgImg !== "/og-image.png" &&
    rawOgImg !== "/og-exams.png" &&
    rawOgImg !== "/og-jobs.png" &&
    rawOgImg !== "/og-pricing.png" &&
    rawOgImg !== "/og-faq.png" &&
    rawOgImg !== "/og-features.png" &&
    rawOgImg !== "/og-coaching.png"
      ? rawOgImg
      : "/opengraph-image";

  const twitterImageUrl = ogImageUrl === "/opengraph-image" ? "/twitter-image" : ogImageUrl;

  return {
    metadataBase: new URL(siteBase),
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "MahaExam",
      locale: "mr_IN",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [twitterImageUrl],
    },
  };
}

/**
 * Update or upsert custom SEO overrides for a route path and revalidate cache
 */
export async function updateSeoForRoute(routePath, data) {
  const cleanPath = routePath?.toLowerCase() || "/";

  const updated = await prisma.seoSetting.upsert({
    where: { route: cleanPath },
    update: {
      title: data.title,
      titleMr: data.titleMr,
      description: data.description,
      descriptionMr: data.descriptionMr,
      keywords: data.keywords,
      canonicalUrl: data.canonicalUrl,
      ogImage: data.ogImage,
      structuredJson: data.structuredJson || null,
    },
    create: {
      route: cleanPath,
      title: data.title,
      titleMr: data.titleMr,
      description: data.description,
      descriptionMr: data.descriptionMr,
      keywords: data.keywords,
      canonicalUrl: data.canonicalUrl,
      ogImage: data.ogImage,
      structuredJson: data.structuredJson || null,
    },
  });

  try {
    revalidateTag("seo-settings");
  } catch {}

  return updated;
}

/**
 * Fetch all SEO settings in DB
 */
export async function getAllSeoSettings() {
  const dbRecords = prisma?.seoSetting
    ? await prisma.seoSetting.findMany({
        orderBy: { route: "asc" },
      })
    : [];

  const dbMap = new Map(dbRecords.map((r) => [r.route, r]));

  // Merge default routes with DB records
  const allRoutes = Array.from(
    new Set([...Object.keys(DEFAULT_SEO_CONFIG), ...dbRecords.map((r) => r.route)]),
  );

  return allRoutes.map((routePath) => {
    const dbItem = dbMap.get(routePath);
    const defItem = DEFAULT_SEO_CONFIG[routePath] || {};

    return {
      route: routePath,
      title: dbItem?.title || defItem.title || "",
      titleMr: dbItem?.titleMr || defItem.titleMr || "",
      description: dbItem?.description || defItem.description || "",
      descriptionMr: dbItem?.descriptionMr || defItem.descriptionMr || "",
      keywords: dbItem?.keywords || defItem.keywords || "",
      canonicalUrl: dbItem?.canonicalUrl || defItem.canonicalUrl || "",
      ogImage: dbItem?.ogImage || defItem.ogImage || "",
      isCustomized: !!dbItem,
    };
  });
}
