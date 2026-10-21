'use client'

import { Card } from '@/shared/components/ui/card'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { useOwnerBookings } from '@/domains/booking/hooks/use-owner-bookings'
import { ShopBookingCard } from '@/domains/booking/components/shop-bookings/ShopBookingCard'
import { toShopBookingCardDtoFromOwner } from '@/domains/booking/dto/booking.dto'

export function LatestBookings() {
  const { user } = useAuth()
  const { data: bookings = [], isLoading } = useOwnerBookings(user?.id)

  const latestBookings = bookings.slice(0, 3)

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3 px-1">
        <h2 className="text-sm font-semibold text-slate-800">آخر الحجوزات</h2>
        <Link href="/owner/bookings" className="text-xs font-medium text-primary flex items-center hover:underline">
          عرض الكل
          <ChevronLeft className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : latestBookings.length > 0 ? (
          latestBookings.map((booking) => (
            <ShopBookingCard key={booking.id} booking={toShopBookingCardDtoFromOwner(booking)} />
          ))
        ) : (
          <div className="text-center py-8 text-sm text-slate-500 bg-white rounded-xl border border-slate-100 shadow-sm">
            لا توجد حجوزات حالياً
          </div>
        )}
      </div>
    </div>
  )
}
