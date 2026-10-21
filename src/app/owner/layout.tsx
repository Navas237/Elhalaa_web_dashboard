import React from 'react'
import { BottomNavigation } from '@/shared/components/bottom-navigation'
import { DashboardWebPushRegistrar } from '@/domains/notifications/components/DashboardWebPushRegistrar'
import { ForegroundNotificationListener } from '@/domains/notifications/components/ForegroundNotificationListener'

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen pb-16 bg-slate-50" dir='rtl'>
      <main>
        {children}
      </main>
      <DashboardWebPushRegistrar />
      <ForegroundNotificationListener />
      <BottomNavigation />
    </div>
  )
}