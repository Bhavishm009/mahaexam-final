import { prisma } from "./db.js";
import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
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
      tag: `mahaexam-alert-${Date.now()}`,
      vibrate: [300, 100, 300, 100, 300],
      renotify: true,
      silent: false,
      requireInteraction: true,
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
            // If subscription has expired or unsubscribed on browser (410 Gone or 404 Not Found)
            if (err.statusCode === 404 || err.statusCode === 410) {
              await prisma.pushSubscription
                .delete({
                  where: { id: sub.id },
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

/**
 * Maintenance function: purge expired, inactive, or unlinked stale push subscriptions
 * - Permanently removes inactive subscriptions
 * - Removes guest subscriptions older than 60 days
 * - Ensures any registered user with > maxDevices has their oldest excess devices pruned
 */
export async function pruneStalePushSubscriptions(maxDevicesPerUser = 5) {
  try {
    // 1. Delete all deactivated/failed subscriptions
    const deletedInactive = await prisma.pushSubscription.deleteMany({
      where: { isActive: false },
    });

    // 2. Delete unlinked guest subscriptions older than 60 days
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const deletedGuest = await prisma.pushSubscription.deleteMany({
      where: {
        userId: null,
        updatedAt: { lt: sixtyDaysAgo },
      },
    });

    // 3. For any user with > maxDevicesPerUser, prune oldest active subscriptions
    const usersWithSubs = await prisma.pushSubscription.groupBy({
      by: ["userId"],
      where: {
        userId: { not: null },
        isActive: true,
      },
      _count: { id: true },
      having: {
        id: {
          _count: {
            gt: maxDevicesPerUser,
          },
        },
      },
    });

    let prunedPerUser = 0;
    for (const group of usersWithSubs) {
      if (!group.userId) continue;
      const subs = await prisma.pushSubscription.findMany({
        where: { userId: group.userId, isActive: true },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });
      if (subs.length > maxDevicesPerUser) {
        const toDelete = subs.slice(maxDevicesPerUser).map((s) => s.id);
        const res = await prisma.pushSubscription.deleteMany({
          where: { id: { in: toDelete } },
        });
        prunedPerUser += res.count;
      }
    }

    return {
      success: true,
      deletedInactive: deletedInactive.count,
      deletedGuest: deletedGuest.count,
      prunedPerUser,
    };
  } catch (error) {
    console.error("pruneStalePushSubscriptions error:", error);
    return { success: false, error: error.message };
  }
}
