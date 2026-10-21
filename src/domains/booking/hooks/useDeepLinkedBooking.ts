'use client'

import { useQuery } from '@tanstack/react-query'
import { getShopBookings } from '../services/booking.service'
import { bookingKeys } from '../query-keys'
import type { BookingsTabValue } from '../components/shop-bookings/ShopBookingsToolbar'
import type { BookingStatus } from '@/shared/types/database'

/** التبويب الذي ينتمي إليه الحجز حسب حالته (نفس خريطة ShopBookingsTabs). */
export function tabForBookingStatus(status: BookingStatus): BookingsTabValue {
  if (status === 'waiting_time') return 'waiting'
  if (status === 'completed' || status === 'cancelled' || status === 'no_show') return 'past'
  return 'upcoming'
}

/**
 * Deep-link من الإشعار (?bookingId=): يجلب الحجز مباشرة عبر RPC الفرع
 * (كل الحالات، أول صفحتين) حتى لو لم يكن في التبويب المحمّل حاليًا،
 * ويرجع DTO جاهزًا لشيت الأكشن.
 */
export function useDeepLinkedShopBooking(shopId: string | null, bookingId: string | null) {
  return useQuery({
    queryKey: [...bookingKeys.shop(shopId ?? 'none'), 'deep-link', bookingId],
    queryFn: async () => {
      for (const page of [1, 2]) {
        const rows = await getShopBookings({ shop_id: shopId!, page, page_size: 100 })
        const found = rows.find((r) => r.id === bookingId)
        if (found) return found
        if (rows.length < 100) break
      }
      return null
    },
    enabled: !!shopId && !!bookingId,
    staleTime: 30_000,
  })
}
