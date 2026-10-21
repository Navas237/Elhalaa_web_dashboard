"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Bell, BellRing, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useAuth } from "@/domains/auth/hooks/useAuth"
import { useCurrentStaffMember } from "@/domains/staff/hooks/useCurrentStaffMember"
import { registerWebPushDevice } from "../services/web-push.service"

type ActivationState = "idle" | "loading" | "success" | "denied" | "unsupported" | "config" | "error"

const DASHBOARD_NOTIFICATION_ROLES = new Set(["owner", "manager", "barber"])

const TEXT = {
  title: "\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0627\u0644\u062D\u062C\u0632",
  active: "\u0645\u0641\u0639\u0644\u0629 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062C\u0647\u0627\u0632",
  blocked: "\u0645\u062D\u0638\u0648\u0631\u0629 \u0645\u0646 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u0635\u0641\u062D",
  unsupported: "\u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645\u0629 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0645\u062A\u0635\u0641\u062D",
  config: "\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0646\u0627\u0642\u0635\u0629",
  error: "\u062A\u0639\u0630\u0631 \u0627\u0644\u062A\u0641\u0639\u064A\u0644\u060C \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649",
  idle: "\u0627\u0633\u062A\u0642\u0628\u0644 \u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0645\u0648\u0627\u0639\u064A\u062F\u0643",
  enabledButton: "\u0645\u0641\u0639\u0644",
  enableButton: "\u062A\u0641\u0639\u064A\u0644",
}

function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported"
  }

  return Notification.permission
}

export function BarberNotificationActivator() {
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
    }

    if (currentPermission === "denied") {
      setState("denied")
    }

    if (currentPermission === "unsupported") {
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

      if (result.reason === "missing_vapid_key") {
        setState("config")
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-[#E8192C]">
            {isActive ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">{TEXT.title}</p>
            <p className="truncate text-xs text-slate-500">
              {isActive && TEXT.active}
              {isBlocked && TEXT.blocked}
              {state === "unsupported" && TEXT.unsupported}
              {state === "config" && TEXT.config}
              {state === "error" && TEXT.error}
              {!isActive && !isBlocked && state !== "unsupported" && state !== "config" && state !== "error" && TEXT.idle}
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="h-11 shrink-0 rounded-xl bg-[#E8192C] px-4 text-sm font-bold hover:bg-[#C0102A]"
          disabled={!canActivate || isLoading || isBlocked}
          onClick={handleActivate}
        >
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          {isActive && <CheckCircle2 className="ml-2 h-4 w-4" />}
          {isBlocked && <AlertCircle className="ml-2 h-4 w-4" />}
          {isActive ? TEXT.enabledButton : TEXT.enableButton}
        </Button>
      </div>
    </div>
  )
}