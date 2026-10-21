import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateBookingStatus } from '../services/booking.service'
import { bookingKeys } from '../query-keys'
import { ownerKeys } from '../../owner/keys'
import type { BookingStatus } from '@/shared/types/database'

export function useUpdateBookingStatus(shopId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: BookingStatus; shopId?: string }) =>
      updateBookingStatus(bookingId, status),
    onSuccess: (_, variables) => {
      // Invalidate all booking queries so UI updates immediately
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: ownerKeys.all })

      const resolvedShopId = variables.shopId || shopId
      if (resolvedShopId) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.shop(resolvedShopId), exact: false })
      }
    },
  })
}
