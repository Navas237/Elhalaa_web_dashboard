import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignBookingTime } from '../services/booking.service'
import { bookingKeys } from '../query-keys'
import { ownerKeys } from '../../owner/keys'

interface AssignBookingTimeParams {
  bookingId: string
  params: {
    booking_date: string
    start_time: string
    end_time: string
    display_start_time: string
  }
  shopId?: string
}

export function useAssignBookingTime(shopId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, params }: AssignBookingTimeParams) =>
      assignBookingTime(bookingId, params),
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
