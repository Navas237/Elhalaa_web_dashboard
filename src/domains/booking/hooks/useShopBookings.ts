'use client'

import { useQuery } from '@tanstack/react-query'
import { getShopBookings } from '../services/booking.service'
import { bookingKeys } from '../query-keys'
import { useBookingsRealtime } from './useBookingsRealtime'
import type { ShopBookingCardDto } from '../dto/shop-booking.dto'

type UseShopBookingsFilters = {
  barberId?: string
  statusFilter?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

interface UseShopBookingsResult {
  bookings: ShopBookingCardDto[]
  totalCount: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useShopBookings(
  shopId: string,
  filters: UseShopBookingsFilters = {}
): UseShopBookingsResult {
  // Live updates: any INSERT/UPDATE/DELETE on this shop's bookings
  // refreshes the list instantly.
  useBookingsRealtime({ shopId, enabled: !!shopId })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: bookingKeys.shop(shopId, filters),
    queryFn: () =>
      getShopBookings({
        shop_id: shopId,
        barber_id: filters.barberId,
        status_filter: filters.statusFilter,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
        page: filters.page ?? 1,
        page_size: filters.pageSize ?? 20,
      }),
    enabled: !!shopId,
    // Fallback so bookings created on another device appear without a
    // manual refresh. Foreground FCM already invalidates bookingKeys.all
    // instantly; this covers blocked/failed push delivery.
    refetchInterval: 30000,
  })

  const bookings = data ?? []
  // total_count يظهر في كل صف من الـ RPC — نأخذه من الأول أو 0
  const totalCount = bookings.length > 0 ? bookings[0].totalCount : 0

  return {
    bookings,
    totalCount,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  }
}
