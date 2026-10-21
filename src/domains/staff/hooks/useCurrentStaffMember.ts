import { useQuery } from '@tanstack/react-query'
import { getCurrentStaffMember } from '../services/staff.service'

export function useCurrentStaffMember(userId: string | undefined) {
  return useQuery({
    queryKey: ['currentStaffMember', userId],
    queryFn: () => getCurrentStaffMember(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
