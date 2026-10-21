'use client'

import { useQuery } from '@tanstack/react-query'
import { getOwnerShops } from '../services/owner.service'
import { ownerKeys } from '../keys'

export function useOwnerShops(ownerId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ownerKeys.shops(ownerId),
    queryFn: () => getOwnerShops(ownerId),
    enabled: !!ownerId,
  })

  return {
    shops: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}
