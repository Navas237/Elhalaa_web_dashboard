import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { BottomNavigation } from '@/shared/components/bottom-navigation'
import { DashboardWebPushRegistrar } from '@/domains/notifications/components/DashboardWebPushRegistrar'
import { ForegroundNotificationListener } from '@/domains/notifications/components/ForegroundNotificationListener'

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side role gate. The proxy redirect is a convenience, this is the check.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile?.role || !['owner', 'manager'].includes(profile.role)) redirect('/login')

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