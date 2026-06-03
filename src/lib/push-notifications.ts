import { prisma } from "@/lib/prisma"

export async function sendPushNotification(userId: string, payload: { title: string; body: string; icon?: string; url?: string }) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
    })

    if (!subscriptions.length) return

    const promises = subscriptions.map(async (sub) => {
      try {
        await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.VAPID_PRIVATE_KEY || ""}`,
          },
          body: JSON.stringify({
            notification: {
              title: payload.title,
              body: payload.body,
              icon: payload.icon || "/icon.png",
              data: { url: payload.url || "/" },
            },
          }),
        })
      } catch {
        // Deactivate on failure
        await prisma.pushSubscription.updateMany({
          where: { endpoint: sub.endpoint },
          data: { isActive: false },
        })
      }
    })

    await Promise.all(promises)
  } catch {
    // silently fail push notifications
  }
}
