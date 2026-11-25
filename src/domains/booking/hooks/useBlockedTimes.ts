import { useQuery } from '@tanstack/react-query'
import { getBlockedTimes } from '../services/blocked-time.service'
import { bookingKeys } from '../query-keys'
import type { BlockedTimeDto } from '../dto/blocked-time.dto'

export function useBlockedTimes(staffId: string | null | undefined, date?: string) {
  return useQuery<BlockedTimeDto[]>({
    queryKey: bookingKeys.blockedTimes(staffId || '', date),
    queryFn: () => getBlockedTimes(staffId!, date),
    enabled: Boolean(staffId),
    staleTime: 1000 * 60, // 1 دقيقة
  })
}
