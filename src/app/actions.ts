"use server";

import webpush from "web-push";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:contact@example.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

/**
 * Subscribe to push notifications
 * Called from client when user enables push notifications
 */
export async function subscribeToPushNotifications(
  subscription: PushSubscriptionJSON
): Promise<{ success: boolean; message?: string }> {
  try {
    if (!vapidPrivateKey) {
      return { success: false, message: "Push notifications not configured" };
    }

    // Store subscription in your database here
    // For now, we'll just acknowledge it
    console.log("Push subscription received:", subscription.endpoint);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message };
  }
}

/**
 * Send a test push notification
 * For demo purposes
 */
export async function sendTestPushNotification(
  subscription: PushSubscriptionJSON
): Promise<{ success: boolean; message?: string }> {
  try {
    if (!vapidPrivateKey) {
      return { success: false, message: "Push notifications not configured" };
    }

    const notificationPayload = {
      title: "Optix Scouting",
      body: "Test notification from Optix Scouting Toolkit",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      data: {
        url: "/",
      },
    };

    await webpush.sendNotification(subscription, JSON.stringify(notificationPayload));

    return { success: true, message: "Notification sent" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message };
  }
}

/**
 * Unsubscribe from push notifications
 * Called from client when user disables push notifications
 */
export async function unsubscribeFromPushNotifications(
  subscription: PushSubscriptionJSON
): Promise<{ success: boolean; message?: string }> {
  try {
    // Remove subscription from your database here
    console.log("Push subscription removed:", subscription.endpoint);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message };
  }
}

/**
 * Push subscription JSON type
 */
export type PushSubscriptionJSON = {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
};
