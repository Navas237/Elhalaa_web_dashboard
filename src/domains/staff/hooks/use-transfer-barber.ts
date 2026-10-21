import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transferBarber } from '../services/transfer-barber.service'
import { staffKeys } from '../query-keys'
import type { TransferBarberInput } from '../dto/staff.dto'
import { toast } from 'sonner'

export function useTransferBarber(ownerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TransferBarberInput) => transferBarber(data),
    onSuccess: (_, variables) => {
      // Invalidate the staff list for the owner
      if (ownerId) {
        queryClient.invalidateQueries({
          queryKey: staffKeys.list(ownerId),
        })
      }
      
      // Invalidate the specific staff details
      queryClient.invalidateQueries({
        queryKey: staffKeys.details(variables.staffId),
      })
      
      toast.success('تم نقل الموظف بنجاح')
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء نقل الموظف')
    }
  })
}
