import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBlockedTime } from '../services/blocked-time.service'
import { bookingKeys } from '../query-keys'
import type { CreateBlockedTimeInput } from '../typys/blocked-time.types'
import { toast } from 'sonner'

export function useCreateBlockedTime(staffId?: string, shopId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateBlockedTimeInput) => createBlockedTime(input),
    onSuccess: (_, variables) => {
      const targetStaffId = variables.staff_id || staffId
      if (targetStaffId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.blockedTimes(targetStaffId),
        })
      }
      const targetShopId = variables.shop_id || shopId
      if (targetShopId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.shop(targetShopId),
          exact: false,
        })
      }
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      toast.success('تم قفل الميعاد بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء قفل الميعاد')
    },
  })
}
