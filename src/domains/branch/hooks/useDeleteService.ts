'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteService } from '../services/shop.service'
import { shopKeys } from '../keys'

export function useDeleteService(shopId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (serviceId: string) => deleteService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.services(shopId) })
    },
  })
}
