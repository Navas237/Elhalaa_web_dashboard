import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { BottomNavigation } from '@/shared/components/bottom-navigation'
import { BarberWebPushRegistrar } from '@/domains/notifications/components/BarberWebPushRegistrar'
import { ForegroundNotificationListener } from '@/domains/notifications/components/ForegroundNotificationListener'

export default async function BarberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side role gate. The proxy redirect is a convenience, this is the check.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile?.role || !['barber', 'owner', 'manager'].includes(profile.role)) redirect('/login')

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

