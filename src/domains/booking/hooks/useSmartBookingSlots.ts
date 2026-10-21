import { useQuery } from '@tanstack/react-query'
import { getSmartBookingSlots, SmartBookingRequest } from '../services/smart-booking.service'

export function useSmartBookingSlots(params: Partial<SmartBookingRequest>) {
  const isEnabled = Boolean(
    params.shop_id &&
    params.staff_id &&
    params.service_id &&
    params.target_date &&
    params.time_preference?.period
  )

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'smart-booking-slots',
      params.shop_id,
      params.staff_id,
      params.service_id,
      params.target_date,
      params.time_preference?.period,
    ],
    queryFn: () => getSmartBookingSlots(params as SmartBookingRequest),
    enabled: isEnabled,
    staleTime: 0, // Always fetch fresh slots
  })

  // The staff_results will contain the slots for the specific requested staff_id
  const staffResult = data?.staff_results?.[0]
  const slots = staffResult?.recommended_slots || []
  const message = staffResult?.message

  return {
    slots,
    message,
    isAvailable: staffResult?.is_available ?? false,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  }
}
