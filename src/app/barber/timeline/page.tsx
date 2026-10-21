"use client"

import { Suspense, useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { useCurrentStaffMember } from '@/domains/staff/hooks/useCurrentStaffMember'
import { ShopBookingsTabs } from '@/domains/booking/components/shop-bookings/ShopBookingsTabs'
import type { BookingsTabValue } from '@/domains/booking/components/shop-bookings/ShopBookingsToolbar'
import { NewBookingSheet } from '@/domains/booking/components/wizard/NewBookingSheet'
import { NotificationBellButton } from '@/domains/notifications/components/NotificationBellButton'
import { useDeepLinkedShopBooking, tabForBookingStatus } from '@/domains/booking/hooks/useDeepLinkedBooking'
import type { ShopBookingCardDto } from '@/domains/booking/dto/shop-booking.dto'

// Deep-link من الإشعار: ?bookingId= يفتح شيت الحجز مباشرة في تبويبه الصحيح.
// useSearchParams يتطلب Suspense — لذلك المكوّن منفصل داخل <Suspense>.
function TimelineDeepLinkOpener({
  shopId,
  onResolve,
}: {
  shopId: string | null
  onResolve: (booking: ShopBookingCardDto) => void
}) {
  const bookingId = useSearchParams().get('bookingId')
  const { data: booking } = useDeepLinkedShopBooking(shopId, bookingId)

  useEffect(() => {
    if (booking) onResolve(booking)
  }, [booking, onResolve])

  return null
}

export default function BarberTimelinePage() {
  const { user } = useAuth()
  const { data: staffMember, isLoading: isStaffLoading } = useCurrentStaffMember(user?.id)

  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<BookingsTabValue>('upcoming')
  const [dateFrom, setDateFrom] = useState<string | null>(null)
  const [dateTo, setDateTo] = useState<string | null>(null)
  const [deepLinkBooking, setDeepLinkBooking] = useState<ShopBookingCardDto | null>(null)

  function handleTabChange(tab: BookingsTabValue) {
    setActiveTab(tab)
    if (tab !== 'past') {
      setDateFrom(null)
      setDateTo(null)
    }
  }

  // عند حل deep-link الإشعار: ننتقل لتبويب الحجز ونمرّره ليُفتح شيت الأكشن
  const handleDeepLinkResolve = useCallback((booking: ShopBookingCardDto) => {
    setDeepLinkBooking(booking)
    setActiveTab(tabForBookingStatus(booking.status))
  }, [])

  return (
    <div className="flex flex-col gap-4 py-4 px-4 pb-24" dir="rtl">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مواعيدي</h1>
          <p className="text-sm text-slate-500">
            {isStaffLoading
              ? 'جاري التحميل...'
              : staffMember
                ? `مرحباً بك، ${user?.name || ''}`
                : 'لم يتم العثور على بيانات الموظف'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBellButton className="bg-white border border-slate-200 shadow-sm" />
          <Button
          size="icon"
          className="rounded-full w-12 h-12 shadow-sm shrink-0 bg-[#E8192C] hover:bg-[#C0102A]"
          onClick={() => setIsNewBookingOpen(true)}
          disabled={!staffMember}
        >
          <Plus className="w-6 h-6" />
        </Button>
        </div>
      </div>

      <div className="mt-4">
        {staffMember && (
          <>
            <Suspense fallback={null}>
              <TimelineDeepLinkOpener
                shopId={staffMember.shop_id}
                onResolve={handleDeepLinkResolve}
              />
            </Suspense>
            <ShopBookingsTabs
              shopId={staffMember.shop_id}
              staff={[]}
              staffLoading={isStaffLoading}
              activeTab={activeTab}
              barberId={user?.id ?? null}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onTabChange={handleTabChange}
              onBarberChange={() => {}}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              hideBarberFilter={true}
              deepLinkBooking={deepLinkBooking}
            />
          </>
        )}
      </div>

      <NewBookingSheet
        open={isNewBookingOpen}
        onOpenChange={setIsNewBookingOpen}
      />
    </div>
  )
}