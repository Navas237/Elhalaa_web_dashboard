import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBooking } from '../services/booking.service'
import { bookingKeys } from '../query-keys'
import { ownerKeys } from '../../owner/keys'

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: Parameters<typeof createBooking>[0]) => createBooking(params),
    onSuccess: (_, variables) => {
      // Invalidate relevant booking queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      
      // Invalidate owner dashboard summary and today's bookings
      queryClient.invalidateQueries({ queryKey: ownerKeys.all })

      // Invalidate smart booking slots for the selected date and staff
      queryClient.invalidateQueries({ 
        queryKey: [
          'smart-booking-slots',
          variables.p_shop_id,
          variables.p_staff_id,
          variables.p_service_id,
          variables.p_booking_date
        ]
      })
    },
  })
}
