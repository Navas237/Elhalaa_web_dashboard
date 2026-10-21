import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateWorkingHours } from '../services/working-hours.service'
import { staffKeys } from '../query-keys'
import { WorkingDayDto } from '../dto/working-hours.dto'
import { toast } from 'sonner'

export function useUpdateWorkingHours() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ staffId, schedule }: { staffId: string, schedule: WorkingDayDto[] }) => 
      updateWorkingHours(staffId, schedule),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: staffKeys.workingHours(variables.staffId),
      })
      toast.success('تم حفظ مواعيد العمل بنجاح')
    },
    onError: () => {
      toast.error('حدث خطأ أثناء حفظ مواعيد العمل')
    }
  })
}
