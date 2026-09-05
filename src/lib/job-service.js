import { unstable_cache as cache, revalidateTag } from "next/cache";
import { prisma } from "./db.js";
import { sendWebPushNotification } from "./push-notification-service.js";

export const INITIAL_JOB_ALERTS = [
  {
    id: "police-2026",
    slug: "police-constable-recruitment-2026",
    department: "महाराष्ट्र पोलीस विभाग (Maharashtra Police Dept)",
    departmentMr: "महाराष्ट्र पोलीस विभाग",
    title: "महाराष्ट्र पोलीस शिपाई व चालक भरती २०२६ (Police Bharti)",
    titleMr: "महाराष्ट्र पोलीस शिपाई व चालक भरती २०२६",
    vacancies: "१७,४७१+ पदे (अंदाजित)",
    qualification: "१२ वी उत्तीर्ण (HSC) + शारीरिक पात्रता",
    qualificationMr: "१२ वी उत्तीर्ण (HSC) व शारीरिक पात्रता",
    lastDate: "लवकरच सुरू (Up Next)",
    status: "ACTIVE",
    statusColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300",
    officialUrl: "https://policeshipai2024.mahait.org",
    notificationPdf: "https://policeshipai2024.mahait.org/pdf/police-bharti-2026-notice.pdf",
    description:
      "महाराष्ट्र राज्य पोलीस दलातील शिपाई, चालक आणि SRPF पदांसाठीची महाभरती. शारीरिक चाचणी व लेखी परीक्षेची परिपूर्ण तयारी आत्ताच सुरू करा.",
    descriptionMr:
      "महाराष्ट्र राज्य पोलीस दलातील शिपाई, चालक आणि SRPF पदांसाठीची महाभरती. शारीरिक चाचणी व लेखी परीक्षेची परिपूर्ण तयारी करा.",
    examSlug: "police-bharti-mock-01",
    salaryRange: "₹२१,७०० - ₹६९,१०० (S-6 Level) + भत्ते",
    ageLimit: "१८ ते २८ वर्षे (मागासवर्गीय उमेदवारांसाठी ५ वर्षे सूट)",
    selectionProcess: "१) मैदानी चाचणी (५० गुण)  २) संगणकीय लेखी परीक्षा (१०० गुण)",
  },
  {
    id: "mpsc-rajyaseva-2026",
    slug: "mpsc-civil-services-2026",
    department: "महाराष्ट्र लोकसेवा आयोग (MPSC)",
    departmentMr: "महाराष्ट्र लोकसेवा आयोग (MPSC)",
    title: "MPSC महाराष्ट्र नागरी सेवा राजपत्रित संयुक्त पूर्व परीक्षा २०२६",
    titleMr: "MPSC महाराष्ट्र नागरी सेवा संयुक्त पूर्व परीक्षा",
    vacancies: "५२४+ पदे",
    qualification: "कोणत्याही शाखेची पदवी (Graduate)",
    qualificationMr: "कोणत्याही शाखेची पदवी (Graduate)",
    lastDate: "अधिसूचना प्रसिद्ध (Official)",
    status: "ACTIVE",
    statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300",
    officialUrl: "https://mpsc.gov.in",
    notificationPdf: "https://mpsc.gov.in/notifications/mpsc-civil-services-2026.pdf",
    description:
      "उपजिल्हाधिकारी, डीवायएसपी, तहसीलदार व वर्ग-१/वर्ग-२ पदांसाठी राज्यसेवा पूर्व परीक्षा. GS पेपर १ व CSAT चा सराव उपलब्ध.",
    descriptionMr:
      "उपजिल्हाधिकारी, डीवायएसपी, तहसीलदार व वर्ग-१/वर्ग-२ पदांसाठी राज्यसेवा पूर्व परीक्षा.",
    examSlug: "mpsc-foundation-mock-test",
    salaryRange: "₹५६,१०० - ₹१,७७,५०० (S-20 Level Class-1)",
    ageLimit: "१९ ते ३८ वर्षे (मागासवर्गीय उमेदवारांसाठी ४३ वर्षे)",
    selectionProcess: "१) पूर्व परीक्षा (४०० गुण)  २) मुख्य परीक्षा (८०० गुण)  ३) मुलाखत (१०० गुण)",
  },
  {
    id: "talathi-2026",
    slug: "talathi-tcs-cbt-exam-2026",
    department: "महसूल व वन विभाग (Revenue Department)",
    departmentMr: "महसूल व वन विभाग",
    title: "महाराष्ट्र तलाठी भरती TCS पॅटर्न CBT परीक्षा २०२६",
    titleMr: "महाराष्ट्र तलाठी भरती TCS पॅटर्न CBT परीक्षा",
    vacancies: "४,६४४+ पदे",
    qualification: "पदवीधर + MS-CIT",
    qualificationMr: "पदवीधर + MS-CIT संगणक ज्ञान",
    lastDate: "अपेक्षित लवकरच (Expected Soon)",
    status: "ACTIVE",
    statusColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300",
    officialUrl: "https://mahabhumi.gov.in",
    notificationPdf: "https://mahabhumi.gov.in/talathi-2026-advertisement.pdf",
    description:
      "TCS द्वारे घेतली जाणारी १०० प्रश्नांची २०० गुणांची ऑनलाइन CBT परीक्षा. मागील वर्षांच्या अधिकृत TCS शिफ्ट्सचे पेपर्स सोडवा.",
    descriptionMr: "TCS द्वारे घेतली जाणारी १०० प्रश्नांची २०० गुणांची ऑनलाइन CBT परीक्षा.",
    examSlug: "talathi-bharti-special-practice-test-series-2026",
    salaryRange: "₹२५,५०० - ₹८१,१०० (S-8 Level)",
    ageLimit: "१८ ते ३८ वर्षे (मागासवर्गीय ४३ वर्षे)",
    selectionProcess: "संगणकावर १०० प्रश्न (२०० गुण) संगणकीय चाचणी (CBT Test)",
  },
  {
    id: "zp-arogya-2026",
    slug: "zilla-parishad-arogya-sevak-2026",
    department: "ग्रामविकास विभाग, जिल्हा परिषद (Rural Dev & ZP)",
    departmentMr: "ग्रामविकास विभाग, जिल्हा परिषद",
    title: "जिल्हा परिषद आरोग्य सेवक व ग्रामसेवक भरती परीक्षा २०२६",
    titleMr: "जिल्हा परिषद आरोग्य सेवक व ग्रामसेवक भरती परीक्षा",
    vacancies: "१९,४६०+ पदे",
    qualification: "१० वी / १२ वी / पदवी (पदानुसार)",
    qualificationMr: "१० वी / १२ वी / पदवी (पदानुसार)",
    lastDate: "टप्प्याटप्प्याने परीक्षा (Ongoing)",
    status: "ACTIVE",
    statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300",
    officialUrl: "https://rdd.maharashtra.gov.in",
    notificationPdf: "https://rdd.maharashtra.gov.in/zp-recruitment-2026.pdf",
    description:
      "आरोग्य सेवक (पुरुष/महिला), ग्रामसेवक व औषध निर्माण अधिकारी पदांसाठी IBPS पॅटर्ननुसार होणाऱ्या परीक्षांचे सराव पेपर्स.",
    descriptionMr: "आरोग्य सेवक (पुरुष/महिला), ग्रामसेवक व औषध निर्माण अधिकारी परीक्षा.",
    examSlug: "zp-arogya-sevak-full-length-test",
    salaryRange: "₹२५,५०० - ₹८१,१०० (S-8 Level)",
    ageLimit: "१८ ते ४० वर्षे (मागासवर्गीय ४५ वर्षे)",
    selectionProcess: "IBPS ऑनलाइन CBT परीक्षा (२०० गुण)",
  },
  {
    id: "vanrakshak-2026",
    slug: "vanrakshak-forest-guard-2026",
    department: "महाराष्ट्र वन विभाग (Forest Department)",
    departmentMr: "महाराष्ट्र वन विभाग",
    title: "महाराष्ट्र वनरक्षक (Forest Guard) ऑनलाइन CBT भरती २०२६",
    titleMr: "महाराष्ट्र वनरक्षक ऑनलाइन CBT भरती",
    vacancies: "२,४१७+ पदे",
    qualification: "१२ वी (विज्ञान/गणित/भूगोल/अर्थशास्त्र)",
    qualificationMr: "१२ वी उत्तीर्ण (विज्ञान/गणित/भूगोल)",
    lastDate: "नवी जाहिरात लवकरच (Next Phase)",
    status: "UPCOMING",
    statusColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300",
    officialUrl: "https://mahaforest.gov.in",
    notificationPdf: "https://mahaforest.gov.in/vanrakshak-2026-pdf.pdf",
    description:
      "वनरक्षक CBT परीक्षेमध्ये मराठी, इंग्रजी, सामान्य ज्ञान व बौद्धिक चाचणीचे ६० प्रश्न १२० गुणांसाठी विचारले जातात.",
    descriptionMr: "वनरक्षक CBT परीक्षेमध्ये ६० प्रश्न १२० गुणांसाठी विचारले जातात.",
    examSlug: "vanrakshak-forest-guard-cbt-exam-simulator",
    salaryRange: "₹२१,७०० - ₹६९,१०० (S-6 Level)",
    ageLimit: "१८ ते २५ वर्षे (मागासवर्गीय ३० वर्षे)",
    selectionProcess: "१) CBT लेखी परीक्षा (१२० गुण)  २) धावणे/शारीरिक चाचणी (८० गुण)",
  },
];

async function fetchAllJobAlertsInternal() {
  try {
    const dbAlerts = await prisma.jobAlert.findMany({
      orderBy: { publishedAt: "desc" },
    });

    if (dbAlerts.length > 0) {
      return dbAlerts.map((j) => ({
        id: j.id,
        slug: j.slug || j.id,
        department: j.department,
        departmentMr: j.departmentMr || j.department,
        title: j.title,
        titleMr: j.titleMr || j.title,
        vacancies: j.vacancies,
        qualification: j.qualification,
        qualificationMr: j.qualificationMr || j.qualification,
        lastDate: j.lastDate,
        status: j.status,
        statusColor:
          j.statusColor ||
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300",
        officialUrl: j.officialUrl || "https://maharashtra.gov.in",
        notificationPdf: j.notificationPdf || null,
        description: j.description,
        descriptionMr: j.descriptionMr || j.description,
        examSlug: j.examSlug || "police-01",
        salaryRange: j.salaryRange || "७व्या वेतन आयोगानुसार",
        ageLimit: j.ageLimit || "१८ ते ३८ वर्षे",
        selectionProcess: j.selectionProcess || "CBT लेखी परीक्षा व कागदपत्र पडताळणी",
        imageUrl: j.imageUrl || null,
        publishedAt: j.publishedAt,
      }));
    }
  } catch (err) {
    console.error("getAllJobAlerts DB Error:", err?.message);
  }

  return INITIAL_JOB_ALERTS;
}

/**
 * High-performance cached query for job alerts
 */
export async function getAllJobAlerts() {
  return cache(fetchAllJobAlertsInternal, ["all-job-alerts-key"], {
    revalidate: 120,
    tags: ["job-alerts"],
  })();
}

/**
 * Get single job alert by ID or slug
 */
export async function getJobAlertById(idOrSlug) {
  const target = (idOrSlug || "").toString().toLowerCase();

  try {
    const dbJob = await prisma.jobAlert.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: target }],
      },
    });

    if (dbJob) {
      return {
        id: dbJob.id,
        slug: dbJob.slug || dbJob.id,
        department: dbJob.department,
        departmentMr: dbJob.departmentMr || dbJob.department,
        title: dbJob.title,
        titleMr: dbJob.titleMr || dbJob.title,
        vacancies: dbJob.vacancies,
        qualification: dbJob.qualification,
        qualificationMr: dbJob.qualificationMr || dbJob.qualification,
        lastDate: dbJob.lastDate,
        status: dbJob.status,
        statusColor: dbJob.statusColor || "bg-emerald-100 text-emerald-800",
        officialUrl: dbJob.officialUrl || "https://maharashtra.gov.in",
        notificationPdf: dbJob.notificationPdf || null,
        description: dbJob.description,
        descriptionMr: dbJob.descriptionMr || dbJob.description,
        examSlug: dbJob.examSlug || "police-01",
        salaryRange: dbJob.salaryRange || "७व्या वेतन आयोगानुसार",
        ageLimit: dbJob.ageLimit || "१८ ते ३८ वर्षे",
        selectionProcess: dbJob.selectionProcess || "CBT लेखी परीक्षा व कागदपत्र पडताळणी",
        imageUrl: dbJob.imageUrl || null,
        publishedAt: dbJob.publishedAt,
      };
    }
  } catch (err) {
    console.error("getJobAlertById DB Error:", err?.message);
  }

  const staticMatch = INITIAL_JOB_ALERTS.find(
    (j) => j.id.toLowerCase() === target || j.slug.toLowerCase() === target,
  );

  return staticMatch || INITIAL_JOB_ALERTS[0];
}

/**
 * Create a new job alert and send push/in-app notifications to all students
 */
export async function createJobAlert(data, notifyStudents = true) {
  const slug = (data.title || "job-alert")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const newJob = await prisma.jobAlert.create({
    data: {
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      department: data.department,
      departmentMr: data.departmentMr || data.department,
      title: data.title,
      titleMr: data.titleMr || data.title,
      vacancies: data.vacancies || "पदे उपलब्ध",
      qualification: data.qualification || "पदवीधर / १२ वी",
      qualificationMr: data.qualificationMr || data.qualification,
      lastDate: data.lastDate || "लवकरच",
      status: data.status || "ACTIVE",
      statusColor:
        data.statusColor ||
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300",
      officialUrl: data.officialUrl || "https://maharashtra.gov.in",
      notificationPdf: data.notificationPdf || null,
      description: data.description,
      descriptionMr: data.descriptionMr || data.description,
      examSlug: data.examSlug || "police-01",
      salaryRange: data.salaryRange || "७व्या वेतन आयोगानुसार",
      ageLimit: data.ageLimit || "१८ ते ३८ वर्षे",
      selectionProcess: data.selectionProcess || "CBT ऑनलाइन परीक्षा व कागदपत्र पडताळणी",
      imageUrl: data.imageUrl || null,
    },
  });

  try {
    revalidateTag("job-alerts");
  } catch {}

  if (notifyStudents) {
    // 1. Create In-App Notifications for all active users
    try {
      const users = await prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: { id: true },
      });

      if (users.length > 0) {
        await prisma.notification.createMany({
          data: users.map((u) => ({
            userId: u.id,
            title: `🔥 नवीन भरती जाहिरात: ${newJob.titleMr || newJob.title}`,
            message: `${newJob.departmentMr || newJob.department} - एकूण ${newJob.vacancies}. अर्ज करण्याची शेवटची तारीख: ${newJob.lastDate}`,
            type: "SYSTEM",
          })),
        });
      }
    } catch (e) {
      console.warn("In-app notification broadcast error:", e.message);
    }

    // 2. Send Web Push Notification to all subscribed browsers
    try {
      await sendWebPushNotification({
        title: `🔥 नवीन भरती जाहिरात २०२६`,
        body: `${newJob.titleMr || newJob.title} (${newJob.vacancies})`,
        url: `/jobs/${newJob.slug || newJob.id}`,
      });
    } catch (e) {
      console.warn("Web Push broadcast error:", e.message);
    }
  }

  return newJob;
}
