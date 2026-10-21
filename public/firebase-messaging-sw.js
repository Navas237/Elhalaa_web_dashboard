/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

async function loadFirebaseConfig() {
  const response = await fetch("/api/firebase-messaging-config", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load Firebase messaging config");
  }

  return response.json();
}

loadFirebaseConfig()
  .then((config) => {
    firebase.initializeApp(config);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const notification = payload.notification || {};
      const data = payload.data || {};
      // Title/body may arrive in `notification` (FCM) or `data` (fallback).
      const title = notification.title || data.title || "Booking notification";
      const body = notification.body || data.body || "";
      // Route is recipient-aware: /owner/bookings for owners,
      // /barber/timeline for barbers. Fall back to timeline.
      const route =
        (data.route && data.route.startsWith("/")) ? data.route : "/barber/timeline";

      // Tag = notification_job_id: if the same job is ever delivered twice
      // (FCM at-least-once), the second notification replaces the first
      // instead of stacking a duplicate.
      const tag = data.notification_job_id || undefined;

      return self.registration.showNotification(title, {
        body,
        data: { ...data, route },
        icon: "/favicon.ico",
        tag,
      });
    });
  })
  .catch(() => {
    // Background notifications are best-effort if config is unavailable.
  });

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = "/barber/timeline";
  if (data.route && data.route.startsWith("/")) {
    url = data.route;
  } else if (data.booking_id) {
    url = `/barber/timeline?bookingId=${encodeURIComponent(data.booking_id)}`;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }),
  );
});
