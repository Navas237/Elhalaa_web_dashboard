'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createService } from '../services/shop.service'
import type { CreateServiceInput } from '../types'
import { shopKeys } from '../keys'

export function useCreateService(shopId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateServiceInput) => createService(shopId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.services(shopId) })
    },
  })
}
