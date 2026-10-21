'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateService } from '../services/shop.service'
import type { UpdateServiceInput } from '../types'
import { shopKeys } from '../keys'

export function useUpdateService(shopId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ serviceId, input }: { serviceId: string; input: UpdateServiceInput }) =>
      updateService(serviceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.services(shopId) })
    },
  })
}
