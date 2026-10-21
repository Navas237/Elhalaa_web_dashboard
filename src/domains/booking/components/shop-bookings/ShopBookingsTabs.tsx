'use client'

import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { ShopBookingsToolbar, type BookingsTabValue } from './ShopBookingsToolbar'
import { ShopBookingsList } from './ShopBookingsList'
import { useShopBookings } from '../../hooks/useShopBookings'
import { useBookingQueue } from '../../hooks/useBookingQueue'
import type { ShopStaffMemberDto } from '@/domains/staff/dto/staff.dto'
import type { ShopBookingCardDto } from '../../dto/shop-booking.dto'

export interface ShopBookingsTabsProps {
  shopId: string
  staff: ShopStaffMemberDto[]
  staffLoading: boolean
  activeTab: BookingsTabValue
  barberId: string | null
  dateFrom: string | null
  dateTo: string | null
  onTabChange: (tab: BookingsTabValue) => void
  onBarberChange: (barberId: string | null) => void
  onDateFromChange: (date: string | null) => void
  onDateToChange: (date: string | null) => void
  hideBarberFilter?: boolean
  /** حجز قادم من deep-link الإشعار (?bookingId=) — يُفتح شيت الأكشن له */
  deepLinkBooking?: ShopBookingCardDto | null
}

const tabLabels: Record<BookingsTabValue, string> = {
  upcoming: 'القادمة',
  waiting: 'في الانتظار',
  past: 'السابقة',
}

// خريطة كل تبويب إلى قائمة الحالات المفصولة بفاصلة (يدعمها الـRPC بعد B2)
const tabStatusFilter: Record<BookingsTabValue, string> = {
  upcoming: 'pending,confirmed',
  waiting: 'waiting_time',
  past: 'completed,cancelled,no_show',
}

function ShopBookingsTabsImpl({
  shopId,
  staff,
  staffLoading,
  activeTab,
  barberId,
  dateFrom,
  dateTo,
  onTabChange,
  onBarberChange,
  onDateFromChange,
  onDateToChange,
  hideBarberFilter,
  deepLinkBooking,
}: ShopBookingsTabsProps) {
  const statusFilter = tabStatusFilter[activeTab]
  const { bookings, loading, error, refetch } = useShopBookings(shopId, {
    statusFilter,
    barberId: barberId ?? undefined,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined,
    pageSize: activeTab === 'upcoming' ? 50 : 20,
  })

  // معالجة طابور الحجوزات: ترتيب بالدور، تصدر الحلاقة الجارية، والتحويل التلقائي للمكتملة
  const { displayBookings, activeBookingId } = useBookingQueue(
    shopId,
    bookings,
    activeTab
  )

  return (
    <div className="flex flex-col gap-3" dir="rtl">
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as BookingsTabValue)}
      >
        <TabsList className="w-full">
          {(Object.keys(tabLabels) as BookingsTabValue[]).map((tab) => (
            <TabsTrigger key={tab} value={tab} className="flex-1">
              {tabLabels[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ShopBookingsToolbar
        staff={staff}
        staffLoading={staffLoading}
        activeTab={activeTab}
        barberId={barberId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onBarberChange={onBarberChange}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
        hideBarberFilter={hideBarberFilter}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <ShopBookingsList
            bookings={displayBookings}
            loading={loading}
            error={error}
            onRetry={() => refetch()}
            deepLinkBooking={deepLinkBooking}
            activeBookingId={activeBookingId}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export const ShopBookingsTabs = memo(ShopBookingsTabsImpl)