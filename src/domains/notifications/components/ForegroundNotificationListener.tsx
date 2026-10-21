"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { listenForForegroundMessages } from "../services/web-push.service"
import { bookingKeys } from "@/domains/booking/query-keys"
import { ownerKeys } from "@/domains/owner/keys"

type FcmForegroundPayload = {
  notification?: { title?: string; body?: string }
  data?: Record<string, string>
}

// Session-level dedupe: FCM is at-least-once, and retries/worker races can
// deliver the same job twice. Showing it twice looks like a bug to the user.
const seenJobIds = new Set<string>()
function isDuplicate(jobId?: string) {
  if (!jobId) return false
  if (seenJobIds.has(jobId)) return true
  seenJobIds.add(jobId)
  if (seenJobIds.size > 200) {
    const oldest = seenJobIds.values().next().value
    if (oldest) seenJobIds.delete(oldest)
  }
  return false
}

function getTargetUrl(pathname: string, bookingId?: string) {
  if (pathname.startsWith("/owner")) {
    return bookingId
      ? `/owner/bookings?bookingId=${encodeURIComponent(bookingId)}`
      : "/owner/bookings"
  }

  return bookingId
    ? `/barber/timeline?bookingId=${encodeURIComponent(bookingId)}`
    : "/barber/timeline"
}

export function ForegroundNotificationListener() {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let isMounted = true

    listenForForegroundMessages((raw) => {
      if (!isMounted) return

      const payload = raw as FcmForegroundPayload
      const title =
        payload.notification?.title || payload.data?.title || "حجز جديد 📅"
      const body =
        payload.notification?.body || payload.data?.body || "اضغط لعرض التفاصيل."
      const bookingId = payload.data?.booking_id
      const targetUrl = getTargetUrl(pathname, bookingId)

      // Refresh booking lists immediately so the new booking appears
      // without a manual refresh, even on the device that created it.
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: ownerKeys.all })

      // Same job delivered twice (FCM retries) -> show once.
      if (isDuplicate(payload.data?.notification_job_id)) return

      // One surface only: toast while the tab is visible, system notification
      // when it's hidden. Showing both at once looks like a duplicate.
      if (typeof document !== "undefined" && document.hidden) {
        try {
          if ("Notification" in window && Notification.permission === "granted") {
            const systemNotification = new Notification(title, { body })
            systemNotification.onclick = () => {
              window.focus()
              router.push(targetUrl)
              systemNotification.close()
            }
          }
        } catch {
          // System notification is best-effort.
        }
        return
      }

      toast.success(title, {
        description: body,
        duration: 8000,
        action: {
          label: "عرض",
          onClick: () => router.push(targetUrl),
        },
      })
    }).then((unsub) => {
      if (isMounted) {
        unsubscribe = unsub
      } else {
        unsub?.()
      }
    })

    return () => {
      isMounted = false
      unsubscribe?.()
    }
  }, [pathname, queryClient, router])

  return null
}
