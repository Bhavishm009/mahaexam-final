import { prisma } from "./db.js";
import webpush from "web-push";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BBXdoA9ueuPsQgjRjbAyEPBGxd47dSZ8cV02rSadvYAuNcjQ2Ev3L_1qZbXJvQ22u5U5fgS0H1mUzE6Ym8LOMiM";
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || "2dlok6PztFXdAYkkc1PNJY1CYqdmqimJHNniW8M0_uQ";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:support@mahaexam.com";

let vapidConfigured = false;
try {
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    vapidConfigured = true;
  }
} catch (e) {
  console.warn("VAPID Configuration Warning:", e.message);
}

/**
 * Send Web Push notification to registered browser push subscriptions
 * @param {Object} options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {string} [options.url] - Deep link URL on click (e.g., /student/exams or /exam/slug)
 * @param {string} [options.userId] - Specific user ID (optional, sends to all active students if null)
 * @param {string} [options.icon] - Icon URL
 */
export async function sendWebPushNotification({
  title,
  body,
  url = "/student/exams",
  userId = null,
  icon = "/icon-192.svg",
}) {
  try {
    const whereClause = { isActive: true };
    if (userId) {
      whereClause.userId = userId;
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: whereClause,
      select: {
        id: true,
        endpoint: true,
        p256dh: true,
        auth: true,
        userId: true,
      },
    });

    if (subscriptions.length === 0) {
      return {
        success: true,
        sentCount: 0,
        message: "No active push subscriptions found",
      };
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
      icon,
      badge: "/icon-192.svg",
      tag: "mahaexam-broadcast",
      data: {
        url,
        timestamp: Date.now(),
      },
    });

    let sentCount = 0;
    let failCount = 0;

    if (vapidConfigured) {
      await Promise.all(
        subscriptions.map(async (sub) => {
          try {
            const pushConfig = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            };
            await webpush.sendNotification(pushConfig, payload);
            sentCount++;
          } catch (err) {
            failCount++;
            // If subscription has expired or unsubscribed on browser (410 or 404)
            if (err.statusCode === 404 || err.statusCode === 410) {
              await prisma.pushSubscription
                .update({
                  where: { id: sub.id },
                  data: { isActive: false },
                })
                .catch(() => {});
            }
          }
        }),
      );
    }

    return {
      success: true,
      totalTargeted: subscriptions.length,
      sentCount,
      failCount,
      payload: { title, body, url },
    };
  } catch (error) {
    console.error("sendWebPushNotification error:", error);
    return { success: false, error: error.message };
  }
}
