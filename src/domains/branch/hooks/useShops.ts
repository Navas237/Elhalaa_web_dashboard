'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOwnerShops, getShopById, createShop, updateShop } from '../services/shop.service'
import { shopKeys } from '../keys'
import type { CreateShopInput, UpdateShopInput } from '../types'

// جيب كل الفروع
export function useOwnerShops(ownerId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: shopKeys.list(ownerId),
    queryFn: () => getOwnerShops(ownerId),
    enabled: !!ownerId,
  })

  return {
    shops: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  }
}

// جيب فرع واحد
export function useShop(shopId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: shopKeys.detail(shopId),
    queryFn: () => getShopById(shopId),
    enabled: !!shopId,
  })

  return {
    shop: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  }
}

// إضافة فرع
export function useCreateShop(ownerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateShopInput) => createShop(ownerId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.list(ownerId) })
    },
  })
}

// تعديل فرع
export function useUpdateShop(ownerId: string, shopId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateShopInput) => updateShop(shopId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.list(ownerId) })
      queryClient.invalidateQueries({ queryKey: shopKeys.detail(shopId) })
    },
  })
}