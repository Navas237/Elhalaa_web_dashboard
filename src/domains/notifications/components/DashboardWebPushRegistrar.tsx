"use client"

import { useAuth } from "@/domains/auth/hooks/useAuth"
import { useCurrentStaffMember } from "@/domains/staff/hooks/useCurrentStaffMember"
import { useWebPushRegistration } from "../hooks/useWebPushRegistration"

const DASHBOARD_NOTIFICATION_ROLES = new Set(["owner", "manager", "barber"])

export function DashboardWebPushRegistrar() {
  const { user } = useAuth()
  const shouldLoadStaff = user?.role === "manager" || user?.role === "barber"
  const { data: staffMember } = useCurrentStaffMember(shouldLoadStaff ? user?.id : undefined)

  useWebPushRegistration({
    userId: user?.id,
    staffId: staffMember?.id ?? null,
    enabled: Boolean(
      user?.id &&
        DASHBOARD_NOTIFICATION_ROLES.has(user.role) &&
        staffMember?.is_active !== false,
    ),
  })

  return null
}