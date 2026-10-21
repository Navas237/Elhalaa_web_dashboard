"use client"

import { useEffect, useRef, useState } from "react"
import { registerWebPushDevice } from "../services/web-push.service"

type UseWebPushRegistrationParams = {
  userId?: string
  staffId?: string | null
  enabled?: boolean
  requestPermission?: boolean
}

function canRegisterWithoutPrompt(requestPermission: boolean) {
  if (requestPermission) return true
  if (typeof window === "undefined" || !("Notification" in window)) return false
  return Notification.permission === "granted"
}

export function useWebPushRegistration({
  userId,
  staffId,
  enabled = true,
  requestPermission = false,
}: UseWebPushRegistrationParams) {
  const registrationKeyRef = useRef<string | null>(null)
  const [state, setState] = useState<{
    isRegistering: boolean
    result: unknown
  }>({
    isRegistering: false,
    result: null,
  })

  useEffect(() => {
    let isMounted = true

    async function register() {
      if (!enabled || !userId || !canRegisterWithoutPrompt(requestPermission)) return

      const registrationKey = `${userId}:${staffId ?? "no-staff"}`
      if (registrationKeyRef.current === registrationKey) return
      registrationKeyRef.current = registrationKey

      setState({ isRegistering: true, result: null })

      try {
        const result = await registerWebPushDevice({ userId, staffId })
        if (isMounted) {
          setState({ isRegistering: false, result })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            isRegistering: false,
            result: { success: false, reason: "unexpected_error", error },
          })
        }
      }
    }

    register()

    return () => {
      isMounted = false
    }
  }, [enabled, requestPermission, userId, staffId])

  return state
}
