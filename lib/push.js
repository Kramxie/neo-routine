import webpush from 'web-push';

/**
 * Web Push Utility
 * Configures VAPID and sends push notifications to user subscriptions
 */

// Configure VAPID once (guarded for CI builds without push credentials)
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:noreply@nmoroutine.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Send a push notification to a single subscription
 * @param {Object} subscription - { endpoint, keys: { auth, p256dh } }
 * @param {Object} payload - { title, body, url, tag }
 * @returns {boolean} true if sent successfully
 */
export async function sendPushNotification(subscription, payload) {
  if (!subscription?.endpoint) return false;

  const message = JSON.stringify({
    title: payload.title || 'Neo Routine',
    body: payload.body || 'Time to check in!',
    url: payload.url || '/dashboard',
    tag: payload.tag || 'neo-routine',
  });

  try {
    await webpush.sendNotification(subscription, message);
    return true;
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or invalid — caller should remove it
      return 'expired';
    }
    console.error('[Push] Failed to send notification:', error.message);
    return false;
  }
}

/**
 * Send push notifications to all of a user's subscriptions
 * Automatically removes expired subscriptions
 * @param {Object} user - Mongoose user document (must have pushSubscriptions)
 * @param {Object} payload - { title, body, url, tag }
 */
export async function sendPushToUser(user, payload) {
  if (!user?.pushSubscriptions?.length) return;

  const expiredEndpoints = [];

  await Promise.allSettled(
    user.pushSubscriptions.map(async (sub) => {
      const result = await sendPushNotification(sub, payload);
      if (result === 'expired') {
        expiredEndpoints.push(sub.endpoint);
      }
    })
  );

  // Clean up expired subscriptions
  if (expiredEndpoints.length > 0) {
    user.pushSubscriptions = user.pushSubscriptions.filter(
      (sub) => !expiredEndpoints.includes(sub.endpoint)
    );
    await user.save();
    console.log('[Push] Removed', expiredEndpoints.length, 'expired subscriptions for user:', user._id);
  }
}
