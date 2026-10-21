"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, BellRing, Loader2 } from "lucide-react"
import { useAuth } from "@/domains/auth/hooks/useAuth"
import { useCurrentStaffMember } from "@/domains/staff/hooks/useCurrentStaffMember"
import { registerWebPushDevice } from "../services/web-push.service"
import { cn } from "@/lib/utils"

type ActivationState = "idle" | "loading" | "success" | "denied" | "unsupported" | "config" | "error"

const DASHBOARD_NOTIFICATION_ROLES = new Set(["owner", "manager", "barber"])

const TITLES: Record<string, string> = {
  active: "إشعارات الحجز مفعّلة على هذا الجهاز",
  idle: "تفعيل إشعارات الحجز — اضغط للتفعيل",
  loading: "جاري تفعيل الإشعارات...",
  blocked: "الإشعارات محظورة من إعدادات المتصفح",
  unsupported: "الإشعارات غير مدعومة على هذا المتصفح",
  config: "إعدادات الإشعارات ناقصة",
  error: "تعذّر التفعيل، حاول مرة أخرى",
}

function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported"
  }
  return Notification.permission
}

/**
 * Icon-button version of BarberNotificationActivator.
 * Meant to live in the navbar/header — same activation logic, no card UI.
 */
export function NotificationBellButton({ className }: { className?: string }) {
  const { user } = useAuth()
  const shouldLoadStaff = user?.role === "manager" || user?.role === "barber"
  const { data: staffMember, isLoading: isStaffLoading } = useCurrentStaffMember(
    shouldLoadStaff ? user?.id : undefined,
  )
  const [state, setState] = useState<ActivationState>("idle")
  const [permission, setPermission] = useState<string>("default")

  useEffect(() => {
    const currentPermission = getNotificationPermission()
    setPermission(currentPermission)

    if (currentPermission === "granted") {
      setState("success")
    } else if (currentPermission === "denied") {
      setState("denied")
    } else if (currentPermission === "unsupported") {
      setState("unsupported")
    }
  }, [])

  const canActivate = useMemo(() => {
    return Boolean(
      user?.id &&
        DASHBOARD_NOTIFICATION_ROLES.has(user.role) &&
        staffMember?.is_active !== false &&
        !isStaffLoading,
    )
  }, [isStaffLoading, staffMember?.is_active, user?.id, user?.role])

  async function handleActivate() {
    if (!user?.id) return
    // Don't re-request when already active; blocked/unsupported are dead-ends.
    if (state === "success" || permission === "granted") return

    setState("loading")

    try {
      const result = await registerWebPushDevice({
        userId: user.id,
        staffId: staffMember?.id ?? null,
      })

      const nextPermission = getNotificationPermission()
      setPermission(nextPermission)

      if (result.success) {
        setState("success")
        return
      }

      if (result.reason === "permission_denied") {
        setState("denied")
        return
      }

      if (result.reason === "messaging_unsupported" || result.reason === "service_worker_unsupported") {
        setState("unsupported")
        return
      }

      if (result.reason === "missing_vapid_key") {
        setState("config")
        return
      }

      setState("error")
    } catch {
      setState("error")
    }
  }

  if (!user?.role || !DASHBOARD_NOTIFICATION_ROLES.has(user.role)) {
    return null
  }

  const isLoading = state === "loading"
  const isActive = state === "success" || permission === "granted"
  const isBlocked = state === "denied" || permission === "denied"
  const isUnsupported = state === "unsupported" || permission === "unsupported"

  const title = isActive
    ? TITLES.active
    : isBlocked
      ? TITLES.blocked
      : isUnsupported
        ? TITLES.unsupported
        : isLoading
          ? TITLES.loading
          : state === "config"
            ? TITLES.config
            : state === "error"
              ? TITLES.error
              : TITLES.idle

  // Inactive (needs activation) or error -> red dot; active -> clean bell.
  const showDot = !isActive && !isBlocked && !isUnsupported

  return (
    <button
      type="button"
      onClick={handleActivate}
      disabled={!canActivate || isLoading || isBlocked || isUnsupported}
      title={title}
      aria-label={title}
      className={cn(
        "relative p-2 rounded-full transition-colors",
        isActive
          ? "text-slate-600 hover:bg-slate-100"
          : "text-slate-500 hover:bg-slate-50",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="w-[22px] h-[22px] animate-spin" />
      ) : isActive ? (
        <BellRing className="w-[22px] h-[22px]" />
      ) : (
        <Bell className="w-[22px] h-[22px]" />
      )}
      {showDot && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
      )}
    </button>
  )
}
