import { useQuery } from '@tanstack/react-query'
import { getClientNameByPhone } from '../services/booking.service'
import { bookingKeys } from '../query-keys'

export function useClientByPhone(phone: string) {
  return useQuery({
    queryKey: bookingKeys.clientByPhone(phone),
    queryFn: () => getClientNameByPhone(phone),
    enabled: phone.length === 11 && /^01[0125][0-9]{8}$/.test(phone),
    staleTime: Infinity, // Keep the data cached
  })
}
