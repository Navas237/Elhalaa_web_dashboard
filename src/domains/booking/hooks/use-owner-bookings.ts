import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOwnerBookings, updateBookingStatus, getOwnerBookingCounts, type OwnerBookingsQuery } from '../services/booking.service'
import { bookingKeys } from '../query-keys'
import { useBookingsRealtime } from './useBookingsRealtime'
import type { BookingStatus } from '@/shared/types/database'

export function useOwnerBookings(ownerId: string | undefined, query: OwnerBookingsQuery = {}) {
  // Live updates: RLS limits events to this owner's shops, so no shop
  // filter is needed here.
  useBookingsRealtime({ enabled: !!ownerId })

  return useQuery({
    queryKey: [...bookingKeys.list(ownerId!), query],
    queryFn: () => getOwnerBookings(ownerId!, query),
    enabled: !!ownerId,
    // Same fallback as the barber timeline: bookings created on another
    // device appear within 30s without a manual refresh.
    refetchInterval: 30000,
  })
}

export function useOwnerBookingCounts(ownerId: string | undefined) {
  return useQuery({
    queryKey: [...bookingKeys.all, 'counts', ownerId],
    queryFn: () => getOwnerBookingCounts(ownerId!),
    enabled: !!ownerId,
    refetchInterval: 30000 // Refetch counts every 30s as a fallback, though mutations invalidate bookingKeys.all
  })
}

export function useUpdateBookingStatus(ownerId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, newStatus }: { bookingId: string; newStatus: BookingStatus }) =>
      updateBookingStatus(bookingId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: ['owner'] })
    },
  })    
}
