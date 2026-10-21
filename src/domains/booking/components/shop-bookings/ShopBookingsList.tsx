'use client'

import { memo, useEffect, useRef, useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarX2, AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ShopBookingCard } from './ShopBookingCard'
import { ShopBookingCardSkeleton } from './ShopBookingCardSkeleton'
import type { ShopBookingCardDto } from '../../dto/shop-booking.dto'
import { BookingActionsSheet } from '../BookingActionsSheet'
import { useAuth } from '../../../auth/hooks/useAuth'
import { useCurrentStaffMember } from '../../../staff/hooks/useCurrentStaffMember'

interface ShopBookingsListProps {
  bookings: ShopBookingCardDto[]
  loading: boolean
  error: string | null
  onRetry: () => void
  /** حجز قادم من deep-link الإشعار (?bookingId=) — يُفتح شيت الأكشن له مرة واحدة */
  deepLinkBooking?: ShopBookingCardDto | null
  /** معرف الحجز الذي يحلق الآن لوضع شارة التمييز عليه */
  activeBookingId?: string | null
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

function ShopBookingsListImpl({
  bookings,
  loading,
  error,
  onRetry,
  deepLinkBooking,
  activeBookingId,
}: ShopBookingsListProps) {
  const [selectedBooking, setSelectedBooking] = useState<ShopBookingCardDto | null>(null)
  const deepLinkOpenedRef = useRef<string | null>(null)

  // Deep-link من الإشعار: افتح شيت الأكشن للحجز مرة واحدة عند وصوله
  useEffect(() => {
    if (deepLinkBooking && deepLinkOpenedRef.current !== deepLinkBooking.id) {
      deepLinkOpenedRef.current = deepLinkBooking.id
      setSelectedBooking(deepLinkBooking)
    }
  }, [deepLinkBooking])
  
  const { user } = useAuth()
  const { data: staffMember } = useCurrentStaffMember(user?.id)

  const canManage = useMemo(() => {
    if (!selectedBooking || !user) return false
    if (user.role === 'owner') return true
    if (staffMember?.shop_id === selectedBooking.shopId && staffMember?.role === 'manager') return true
    if (staffMember?.id === selectedBooking.barberId) return true
    return false
  }, [user, staffMember, selectedBooking])

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        dir="rtl"
      >
        <div className="bg-destructive/10 p-3 rounded-full mb-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <p className="font-medium text-destructive text-sm mb-3">{error}</p>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onRetry}>
          <RefreshCcw className="h-4 w-4" />
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ShopBookingCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        dir="rtl"
      >
        <div className="bg-muted p-4 rounded-full mb-3">
          <CalendarX2 className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">لا توجد حجوزات</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="flex flex-col gap-3"
      >
        <AnimatePresence mode="popLayout">
          {bookings.map((booking) => (
            <motion.div key={booking.id} variants={itemVariants} layout onClick={() => setSelectedBooking(booking)} className="cursor-pointer">
              <ShopBookingCard
                booking={booking}
                isServingNow={activeBookingId === booking.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <BookingActionsSheet
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        canManage={canManage}
      />
    </>
  )
}

export const ShopBookingsList = memo(ShopBookingsListImpl)