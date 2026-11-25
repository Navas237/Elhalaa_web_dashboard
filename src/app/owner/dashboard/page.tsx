'use client'

import { useAuth } from '@/domains/auth/hooks/useAuth'
import { useOwnerDashboard } from '@/domains/owner/hooks/useOwnerDashboardSummary'
import { DashboardStats } from '@/domains/owner/components/DashboardStats'
import { LatestBookings } from '@/domains/owner/components/LatestBookings'
import { ActiveBarbers } from '@/domains/owner/components/ActiveBarbers'
import { Loader2 } from 'lucide-react'
import { NotificationBellButton } from '@/domains/notifications/components/NotificationBellButton'

export default function OwnerDashboardPage() {
  const { user, isInitializing } = useAuth()
  const { summary, loading: summaryLoading, error } = useOwnerDashboard(user?.id || '')

  if (isInitializing || summaryLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">جاري تحميل البيانات...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-sm font-medium text-rose-500">حدث خطأ أثناء تحميل البيانات</p>
        <p className="text-xs text-slate-500">{error}</p>
      </div>
    )
  }

  // Supabase RPC might return an array of 1 item, so extract it if needed
  const actualSummary = Array.isArray(summary) ? summary[0] : summary

  // Fallback to empty summary if data is missing
  const safeSummary = actualSummary || {
    total_shops: 0,
    total_barbers: 0,
    total_managers: 0,
    total_bookings_today: 0,
    upcoming_bookings: 0,
    pending_bookings: 0,
    confirmed_bookings: 0,
    waiting_time_bookings: 0,
    cancelled_today: 0,
    revenue_today: 0,
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white px-5 py-4 flex justify-between items-center border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div>
          {/* <p className="text-[13px] text-slate-500 mb-0.5">صباح الخير 🌟</p> */}
          <p className="text-base font-semibold text-slate-900">
            {user?.name || 'صاحب المحل'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBellButton />
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-[13px] font-semibold text-primary border border-primary-light">
            {user?.name ? user.name.substring(0, 2) : 'أح'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 overflow-y-auto pb-24">
        {/* Animated Stats Grid */}
        <DashboardStats summary={safeSummary} />

        {/* Latest Bookings List (Mocked) */}
        <LatestBookings />

        {/* Active Barbers Carousel */}
        <ActiveBarbers ownerId={user?.id || ''} />
      </main>
    </div>
  )
}