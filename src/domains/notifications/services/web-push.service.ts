"use client"

import { getToken, onMessage } from "firebase/messaging"
import { createClient } from "@/shared/lib/supabase/client"
import { getBrowserMessaging } from "@/shared/lib/firebase/client"

type RegisterWebPushParams = {
  userId: string
  staffId?: string | null
}

async function ensureServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null
  }

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
  await navigator.serviceWorker.ready
  return registration
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported"
  }

  if (Notification.permission === "granted") {
    return "granted"
  }

  if (Notification.permission === "denied") {
    return "denied"
  }

  return Notification.requestPermission()
}

export async function registerWebPushDevice({ userId, staffId = null }: RegisterWebPushParams) {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  if (!vapidKey) {
    return { success: false, reason: "missing_vapid_key" }
  }

  const permission = await requestNotificationPermission()
  if (permission !== "granted") {
    return { success: false, reason: "permission_denied" }
  }

  const messaging = await getBrowserMessaging()
  if (!messaging) {
    return { success: false, reason: "messaging_unsupported" }
  }

  const serviceWorkerRegistration = await ensureServiceWorker()
  if (!serviceWorkerRegistration) {
    return { success: false, reason: "service_worker_unsupported" }
  }

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration,
  })

  if (!token) {
    return { success: false, reason: "token_unavailable" }
  }

  const now = new Date().toISOString()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("push_devices")
    .upsert(
      {
        user_id: userId,
        staff_id: staffId ?? null,
        provider: "fcm",
        platform: "web",
        token,
        device_name: navigator.userAgent,
        is_active: true,
        last_seen_at: now,
        updated_at: now,
      },
      { onConflict: "provider,token" },
    )
    .select("id, provider, platform, last_seen_at")
    .single()

  if (error) {
    return { success: false, reason: "save_failed", error }
  }

  return { success: true, data }
}

export async function listenForForegroundMessages(
  handler: (payload: unknown) => void,
) {
  const messaging = await getBrowserMessaging()
  if (!messaging) {
    return () => {}
  }

  return onMessage(messaging, handler)
}