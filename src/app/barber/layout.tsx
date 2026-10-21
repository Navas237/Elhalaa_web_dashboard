import React from 'react'
import { BottomNavigation } from '@/shared/components/bottom-navigation'
import { BarberWebPushRegistrar } from '@/domains/notifications/components/BarberWebPushRegistrar'
import { ForegroundNotificationListener } from '@/domains/notifications/components/ForegroundNotificationListener'

export default function BarberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen pb-16 bg-slate-50" dir='rtl'>
      <main>
        {children}
      </main>
      <BarberWebPushRegistrar />
      <ForegroundNotificationListener />
      <BottomNavigation />
    </div>
  )
}

