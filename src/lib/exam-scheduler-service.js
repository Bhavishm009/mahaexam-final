import { prisma } from "./db.js";
import { sendWebPushNotification } from "./push-notification-service.js";

/**
 * Format a Date object nicely in Indian standard context (Marathi / English)
 */
function formatExamDateTime(date) {
  if (!date) {
    return "";
  }
  const d = new Date(date);
  return d.toLocaleString("mr-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Schedule or Reschedule an Exam and its multi-stage notification lifecycle:
 * 1. Immediate Notification (Scheduled or Rescheduled)
 * 2. 1 Hour Before Start (Reminder)
 * 3. 10 Minutes Before Start (Final Call)
 * 4. At Start Time (Go Live & Access Open)
 *
 * @param {Object} exam - Exam record from database
 * @param {Object} options
 * @param {boolean} [options.isReschedule=false] - True if changing start date/time
 * @param {string[]} [options.batchIds] - Specific batch IDs if private coaching exam
 */
export async function scheduleExamNotifications(exam, { isReschedule = false, batchIds = [] } = {}) {
  try {
    const isGlobal =
      exam.visibilityMode === "FREE_GLOBAL" ||
      exam.visibilityMode === "GLOBAL" ||
      !exam.organizationId;

    // 1. Identify target students
    let targetUserIds = [];

    if (isGlobal) {
      // Broadcast to all active students on the platform
      const students = await prisma.user.findMany({
        where: { role: "STUDENT", status: "ACTIVE" },
        select: { id: true },
      });
      targetUserIds = students.map((s) => s.id);
    } else if (batchIds && batchIds.length > 0) {
      // Target students in assigned batches
      const batchStudents = await prisma.batchStudent.findMany({
        where: { batchId: { in: batchIds } },
        select: { studentId: true },
      });
      targetUserIds = [...new Set(batchStudents.map((bs) => bs.studentId))];
    } else if (exam.organizationId) {
      // Target all students in the academy
      const orgStudents = await prisma.user.findMany({
        where: {
          organizationId: exam.organizationId,
          role: "STUDENT",
          status: "ACTIVE",
        },
        select: { id: true },
      });
      targetUserIds = orgStudents.map((s) => s.id);
    }

    const formattedTime = exam.startAt ? formatExamDateTime(exam.startAt) : "लवकरच (Coming Soon)";
    const examUrl = `/exam/${exam.slug || exam.id}`;

    // 2. Immediate Notification dispatch (Scheduled or Rescheduled)
    const immediateTitle = isReschedule
      ? `⚠️ परीक्षेची वेळ बदलली: ${exam.title}`
      : `📅 नवीन परीक्षा शेड्यूल: ${exam.title}`;

    const immediateMessage = isReschedule
      ? `परीक्षेची नवीन वेळ: ${formattedTime} वाजता निश्चित करण्यात आली आहे. कृपया वेळेची नोंद घ्या.`
      : `सदर परीक्षा ${formattedTime} वाजता लाइव्ह होईल. सराव करण्यासाठी आताच सज्ज राहा!`;

    // In-app notifications
    if (targetUserIds.length > 0) {
      await prisma.studentNotification.createMany({
        data: targetUserIds.map((uid) => ({
          userId: uid,
          type: isReschedule ? "EXAM_RESCHEDULED" : "EXAM_SCHEDULED",
          title: immediateTitle,
          message: immediateMessage,
        })),
      }).catch((e) => console.warn("In-app notification error:", e.message));
    }

    // Global Exam notification record
    if (isGlobal) {
      await prisma.globalExamNotification.create({
        data: {
          examId: exam.id,
          title: immediateTitle,
          message: immediateMessage,
        },
      }).catch(() => {});
    }

    // Web Push Notification to active browsers
    await sendWebPushNotification({
      title: immediateTitle,
      body: immediateMessage,
      url: examUrl,
    });

    // 3. Handle Timed Reminder Jobs (1hr before, 10min before, Go Live)
    if (!exam.startAt) {
      return { success: true, targetCount: targetUserIds.length, jobsScheduled: 0 };
    }

    const startAtTime = new Date(exam.startAt).getTime();
    const nowTime = Date.now();

    // If rescheduling, cancel previous pending jobs for this exam
    if (isReschedule) {
      await prisma.job.deleteMany({
        where: {
          status: "PENDING",
          type: { in: ["EXAM_REMINDER_1HR", "EXAM_REMINDER_10MIN", "EXAM_GO_LIVE"] },
        },
      }).catch(() => {});
    }

    let jobsCount = 0;
    const baseJobPayload = {
      examId: exam.id,
      title: exam.title,
      slug: exam.slug,
      visibilityMode: exam.visibilityMode,
      organizationId: exam.organizationId,
      batchIds,
    };

    // A. 1 Hour Before Reminder
    const oneHourBefore = new Date(startAtTime - 60 * 60 * 1000);
    if (oneHourBefore.getTime() > nowTime) {
      await prisma.job.create({
        data: {
          type: "EXAM_REMINDER_1HR",
          payload: { ...baseJobPayload, reminderType: "1HR" },
          runAt: oneHourBefore,
        },
      });
      jobsCount++;
    }

    // B. 10 Minutes Before Reminder
    const tenMinBefore = new Date(startAtTime - 10 * 60 * 1000);
    if (tenMinBefore.getTime() > nowTime) {
      await prisma.job.create({
        data: {
          type: "EXAM_REMINDER_10MIN",
          payload: { ...baseJobPayload, reminderType: "10MIN" },
          runAt: tenMinBefore,
        },
      });
      jobsCount++;
    }

    // C. Go-Live at Start Time
    const atStart = new Date(startAtTime);
    if (atStart.getTime() > nowTime) {
      await prisma.job.create({
        data: {
          type: "EXAM_GO_LIVE",
          payload: { ...baseJobPayload, reminderType: "GO_LIVE" },
          runAt: atStart,
        },
      });
      jobsCount++;
    }

    return {
      success: true,
      targetCount: targetUserIds.length,
      jobsScheduled: jobsCount,
    };
  } catch (error) {
    console.error("scheduleExamNotifications error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute a specific scheduled exam job (called by the worker / cron processor)
 */
export async function executeExamJob(job) {
  const { examId, title, slug, visibilityMode, organizationId, reminderType, batchIds } = job.payload;
  const examUrl = `/exam/${slug || examId}`;

  // Find target users
  const isGlobal =
    visibilityMode === "FREE_GLOBAL" || visibilityMode === "GLOBAL" || !organizationId;

  let targetUserIds = [];
  if (isGlobal) {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT", status: "ACTIVE" },
      select: { id: true },
    });
    targetUserIds = students.map((s) => s.id);
  } else if (batchIds && batchIds.length > 0) {
    const batchStudents = await prisma.batchStudent.findMany({
      where: { batchId: { in: batchIds } },
      select: { studentId: true },
    });
    targetUserIds = [...new Set(batchStudents.map((bs) => bs.studentId))];
  } else if (organizationId) {
    const orgStudents = await prisma.user.findMany({
      where: { organizationId, role: "STUDENT", status: "ACTIVE" },
      select: { id: true },
    });
    targetUserIds = orgStudents.map((s) => s.id);
  }

  if (reminderType === "1HR") {
    const notifTitle = `⏰ परीक्षा १ तासात सुरू होत आहे: ${title}`;
    const notifBody = `${title} ची परीक्षा बरोबर १ तासात सुरू होईल. आताच लॉगिन करून तयारी ठेवा!`;

    if (targetUserIds.length > 0) {
      await prisma.studentNotification.createMany({
        data: targetUserIds.map((uid) => ({
          userId: uid,
          type: "EXAM_REMINDER",
          title: notifTitle,
          message: notifBody,
        })),
      }).catch(() => {});
    }

    await sendWebPushNotification({
      title: notifTitle,
      body: notifBody,
      url: examUrl,
    });
  } else if (reminderType === "10MIN") {
    const notifTitle = `🚨 परीक्षा १० मिनिटांत सुरू होत आहे: ${title}`;
    const notifBody = `${title} सुरू होण्यास अवघे १० मिनिटे बाकी आहेत. त्वरित परीक्षा हॉलमध्ये प्रवेश करा!`;

    if (targetUserIds.length > 0) {
      await prisma.studentNotification.createMany({
        data: targetUserIds.map((uid) => ({
          userId: uid,
          type: "EXAM_REMINDER",
          title: notifTitle,
          message: notifBody,
        })),
      }).catch(() => {});
    }

    await sendWebPushNotification({
      title: notifTitle,
      body: notifBody,
      url: examUrl,
    });
  } else if (reminderType === "GO_LIVE") {
    // 1. Promote exam status to LIVE
    await prisma.exam.update({
      where: { id: examId },
      data: { status: "LIVE" },
    }).catch(() => {});

    // 2. Broadcast Go Live notification
    const notifTitle = `🚀 परीक्षा आता लाइव्ह झाली आहे: ${title}`;
    const notifBody = `${title} आता सुरू झाली आहे. आताच परीक्षा द्या आणि तुमचा महाराष्ट्र रँक पहा!`;

    if (targetUserIds.length > 0) {
      await prisma.studentNotification.createMany({
        data: targetUserIds.map((uid) => ({
          userId: uid,
          type: "EXAM_LIVE",
          title: notifTitle,
          message: notifBody,
        })),
      }).catch(() => {});
    }

    await sendWebPushNotification({
      title: notifTitle,
      body: notifBody,
      url: `${examUrl}/attempt`,
    });
  }

  return { success: true, processed: reminderType };
}

/**
 * Promote any past-due SCHEDULED exams to LIVE in real-time
 */
export async function autoPromoteDueScheduledExams() {
  try {
    const dueExams = await prisma.exam.findMany({
      where: {
        status: "SCHEDULED",
        startAt: { lte: new Date() },
      },
      select: { id: true, title: true, slug: true, visibilityMode: true, organizationId: true },
    });

    for (const ex of dueExams) {
      await prisma.exam.update({
        where: { id: ex.id },
        data: { status: "LIVE" },
      });
    }

    return dueExams.length;
  } catch (e) {
    console.warn("autoPromoteDueScheduledExams error:", e.message);
    return 0;
  }
}
