import { prisma } from "@/lib/db";

const FALLBACK_BLOGS = [
  {
    id: "blog_police_2026",
    slug: "police-bharti-2026-complete-guide",
    title: "Maharashtra Police Bharti 2026: Complete Preparation Guide & Syllabus",
    titleMr:
      "महाराष्ट्र पोलीस भरती २०२६: नवीन परीक्षा पद्धती, मैदानी चाचणी व संपूर्ण तयारी मार्गदर्शक",
    excerpt:
      "पोलीस शिपाई व चालक भरती २०२६ साठी लेखी परीक्षा पॅटर्न, मैदानी चाचणीचे गुण वितरण, वयोमर्यादा आणि अभ्यासाचे अचूक नियोजन.",
    content:
      "महाराष्ट्र पोलीस भरती २०२६ ची तयारी करणाऱ्या उमेदवारांसाठी लेखी परीक्षा व मैदानी चाचणी ही दोन्ही अत्यंत महत्त्वाची टप्पे आहेत. १०० गुणांच्या लेखी परीक्षेत अंकगणित (२५ गुण), बुद्धिमत्ता चाचणी (२५ गुण), मराठी व्याकरण (२५ गुण) आणि सामान्य ज्ञान व चालू घडामोडी (२५ गुण) यांचा समावेश असतो. नियमित सराव टेस्ट सोडवून वेळ व्यवस्थापन सुधारणे अत्यंत आवश्यक आहे.",
    contentMr:
      "महाराष्ट्र पोलीस भरती २०२६ ची तयारी करणाऱ्या उमेदवारांसाठी लेखी परीक्षा व मैदानी चाचणी ही दोन्ही अत्यंत महत्त्वाची टप्पे आहेत. १०० गुणांच्या लेखी परीक्षेत अंकगणित (२५ गुण), बुद्धिमत्ता चाचणी (२५ गुण), मराठी व्याकरण (२५ गुण) आणि सामान्य ज्ञान व चालू घडामोडी (२५ गुण) यांचा समावेश असतो. नियमित सराव टेस्ट सोडवून वेळ व्यवस्थापन सुधारणे अत्यंत आवश्यक आहे.",
    category: "Police Bharti",
    published: true,
    authorName: "MahaExam Team",
    createdAt: new Date("2026-09-01"),
    updatedAt: new Date("2026-09-01"),
  },
  {
    id: "blog_talathi_2026",
    slug: "talathi-bharti-2026-tcs-ibps-pattern",
    title: "Maharashtra Talathi Bharti 2026: TCS/IBPS Pattern Exam Strategy",
    titleMr: "महाराष्ट्र तलाठी भरती २०२६ TCS/IBPS पॅटर्न: यश मिळवण्यासाठी अभ्यासाचे नियोजन",
    excerpt:
      "TCS व IBPS ऑनलाईन परीक्षेतील २०० गुणांच्या १०० प्रश्नांसाठी विषयानुसार तयारी, शॉर्टकट ट्रिक्स आणि कट ऑफ विश्लेषण.",
    content:
      "तलाठी भरती परीक्षेत मराठी (५० गुण), इंग्रजी (५० गुण), सामान्य ज्ञान (५० गुण) आणि बौद्धिक चाचणी (५० गुण) असा एकूण २०० गुणांचा पेपर असतो. TCS/IBPS द्वारे घेतल्या जाणाऱ्या संगणक आधारित CBT परीक्षेत अचूकता आणि वेगाला अनन्यसाधारण महत्त्व आहे.",
    contentMr:
      "तलाठी भरती परीक्षेत मराठी (५० गुण), इंग्रजी (५० गुण), सामान्य ज्ञान (५० गुण) आणि बौद्धिक चाचणी (५० गुण) असा एकूण २०० गुणांचा paper असतो. TCS/IBPS द्वारे घेतल्या जाणाऱ्या संगणक आधारित CBT परीक्षेत अचूकता आणि वेगाला अनन्यसाधारण महत्त्व आहे.",
    category: "Talathi Bharti",
    published: true,
    authorName: "MahaExam Team",
    createdAt: new Date("2026-09-02"),
    updatedAt: new Date("2026-09-02"),
  },
  {
    id: "blog_mpsc_2026",
    slug: "mpsc-rajyaseva-prelims-topper-strategy",
    title: "MPSC Rajyaseva Prelims 2026: GS Paper 1 Topper Strategy & Tips",
    titleMr:
      "MPSC राज्यसेवा पूर्व परीक्षा: सामान्य अध्ययन (GS Paper 1) मध्ये १४०+ गुण मिळवण्याची टॉपर नीती",
    excerpt:
      "इतिहास, भूगोल, राज्यघटना, अर्थशास्त्र व चालू घडामोडी या विषयांमध्ये पैकीच्या पैकी गुण मिळवण्यासाठी संदर्भ पुस्तके व सराव नीती.",
    content:
      "एमपीएससी राज्यसेवा पूर्व परीक्षेत यश मिळवण्यासाठी सामान्य अध्ययन पेपर १ मधील इतिहास, भूगोल, नागरिकशास्त्र व अर्थशास्त्र या विषयांची सखोल उजळणी आवश्यक आहे. PYQ चे विश्लेषणात्मक वाचन करून नियमित सराव संच सोडवल्यास यश निश्चित मिळते.",
    contentMr:
      "एमपीएससी राज्यसेवा पूर्व परीक्षेत यश मिळवण्यासाठी सामान्य अध्ययन पेपर १ मधील इतिहास, भूगोल, नागरिकशास्त्र व अर्थशास्त्र या विषयांची सखोल उजळणी आवश्यक आहे. PYQ चे विश्लेषणात्मक वाचन करून नियमित सराव संच सोडवल्यास यश निश्चित मिळते.",
    category: "MPSC Special",
    published: true,
    authorName: "MahaExam Team",
    createdAt: new Date("2026-09-03"),
    updatedAt: new Date("2026-09-03"),
  },
  {
    id: "blog_zp_2026",
    slug: "zp-bharti-2026-preparation-tips",
    title: "Zilla Parishad (ZP) Bharti 2026: Arogya Sevak & Gramsevak Guide",
    titleMr:
      "महाराष्ट्र जिल्हा परिषद (ZP) भरती २०२६: आरोग्य सेवक, ग्रामसेवक व लिपिक पदांची तयारी कशी करावी?",
    excerpt:
      "जिल्हा परिषद विविध पदांसाठी आवश्यक शैक्षणिक पात्रता, तांत्रिक विषय तयारी व सराव टेस्ट सिरीजची संपूर्ण माहिती.",
    content:
      "जिल्हा परिषद भरतीत तांत्रिक घटकांना मोठे महत्त्व असते. आरोग्य सेवक, ग्रामसेवक व लिपिक संवर्गातील ऑनलाईन परीक्षांसाठी विषयानुसार वस्तुनिष्ठ प्रश्नांचा सराव MahaExam पोर्टलवर मोफत उपलब्ध आहे.",
    contentMr:
      "जिल्हा परिषद भरतीत तांत्रिक घटकांना मोठे महत्त्व असते. आरोग्य सेवक, ग्रामसेवक व लिपिक संवर्गातील ऑनलाईन परीक्षांसाठी विषयानुसार वस्तुनिष्ठ प्रश्नांचा सराव MahaExam पोर्टलवर मोफत उपलब्ध आहे.",
    category: "Zilla Parishad",
    published: true,
    authorName: "MahaExam Team",
    createdAt: new Date("2026-09-04"),
    updatedAt: new Date("2026-09-04"),
  },
  {
    id: "blog_marathi_2026",
    slug: "marathi-grammar-full-marks-guide",
    title: "Marathi Grammar & Vocabulary: Full Marks Tips for All Govt Exams",
    titleMr:
      "मराठी व्याकरण व शब्दसंग्रह: पोलीस भरती व तलाठी परीक्षेत पैकीच्या पैकी गुण कसे मिळवावेत?",
    excerpt:
      "संधी, समास, प्रयोग, समानार्थी व विरुद्धार्थी शब्द, म्हणी व वाक्प्रचार यांवर विचारल्या जाणाऱ्या प्रश्नांची अचूक तयारी.",
    content:
      "मराठी व्याकरण हा स्पर्धा परीक्षांमध्ये सर्वाधिक स्कोरिंग विषय मानला जातो. शब्दसिद्धी, विभक्ती, प्रयोग आणि वाक्य रूपांतरण या घटकांवर वारंवार विचारले जाणारे प्रश्न व्यवस्थित समजून घेतल्यास २५ पैकी २५ गुण मिळवणे सोपे जाते.",
    contentMr:
      "मराठी व्याकरण हा स्पर्धा परीक्षांमध्ये सर्वाधिक स्कोरिंग विषय मानला जातो. शब्दसिद्धी, विभक्ती, प्रयोग आणि वाक्य रूपांतरण या घटकांवर वारंवार विचारले जाणारे प्रश्न व्यवस्थित समजून घेतल्यास २५ पैकी २५ गुण मिळवणे सोपे जाते.",
    category: "Preparation Tips",
    published: true,
    authorName: "MahaExam Team",
    createdAt: new Date("2026-09-05"),
    updatedAt: new Date("2026-09-05"),
  },
];

export async function getAllBlogPosts({ includeDrafts = false } = {}) {
  try {
    if (prisma?.blogPost) {
      const posts = await prisma.blogPost.findMany({
        where: includeDrafts ? {} : { published: true },
        orderBy: { createdAt: "desc" },
      });
      if (posts && posts.length > 0) {
        return posts;
      }
    }
  } catch (err) {
    console.error("Error fetching blog posts via Prisma:", err?.message);
  }

  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT * FROM "BlogPost" ${includeDrafts ? "" : 'WHERE "published" = true'} ORDER BY "createdAt" DESC`,
    );
    if (rows && rows.length > 0) {
      return rows;
    }
  } catch (err) {
    console.error("Error fetching blog posts via Raw SQL:", err?.message);
  }

  return FALLBACK_BLOGS;
}

export async function getBlogPostBySlug(slug) {
  if (!slug) return null;
  try {
    if (prisma?.blogPost) {
      const post = await prisma.blogPost.findUnique({
        where: { slug },
      });
      if (post) return post;
    }
  } catch (err) {
    console.error("Error fetching blog post by slug via Prisma:", err?.message);
  }

  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT * FROM "BlogPost" WHERE "slug" = $1 LIMIT 1`,
      slug,
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    console.error("Error fetching blog post by slug via Raw SQL:", err?.message);
  }

  return FALLBACK_BLOGS.find((b) => b.slug === slug) || null;
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
    if (prisma?.blogPost) {
      return await prisma.blogPost.create({
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
  } catch (err) {
    console.error("Error creating blog post:", err?.message);
  }

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

  await prisma.$queryRawUnsafe(
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
    now,
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
    if (prisma?.blogPost) {
      return await prisma.blogPost.update({
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
  } catch (err) {
    console.error("Error updating blog post:", err?.message);
  }

  const now = new Date();
  await prisma.$queryRawUnsafe(
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
    id,
  );

  return (await getBlogPostBySlug(data.slug)) || { id, ...data };
}

export async function deleteBlogPost(id) {
  try {
    if (prisma?.blogPost) {
      return await prisma.blogPost.delete({
        where: { id },
      });
    }
  } catch (err) {
    console.error("Error deleting blog post:", err?.message);
  }

  await prisma.$queryRawUnsafe(`DELETE FROM "BlogPost" WHERE "id" = $1`, id);
  return { id };
}
