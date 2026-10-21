import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateWorkingHours } from '../services/working-hours.service'
import { staffKeys } from '../query-keys'
import type { WorkingDayDto } from '../dto/working-hours.dto'

export function useUpdateWorkingHours(staffId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (schedule: WorkingDayDto[]) => updateWorkingHours(staffId, schedule),
    onSuccess: () => {
      // Invalidate both working hours and details queries
      queryClient.invalidateQueries({
        queryKey: staffKeys.workingHours(staffId),
      })
      queryClient.invalidateQueries({
        queryKey: staffKeys.details(staffId),
      })
      // If we had a global shop bookings widget dependent on this, we'd invalidate it too.
    },
  })
}
