import { useQuery } from '@tanstack/react-query'
import { getWorkingHours } from '../services/working-hours.service'
import { staffKeys } from '../query-keys'

export function useWorkingHours(staffId: string) {
  return useQuery({
    queryKey: staffKeys.workingHours(staffId),
    queryFn: () => getWorkingHours(staffId),
    enabled: !!staffId,
  })
}
