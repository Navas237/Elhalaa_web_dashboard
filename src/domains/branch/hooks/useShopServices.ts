'use client'

import { useQuery } from '@tanstack/react-query'
import { getShopServices, type ShopServiceItem } from '../services/shop.service'
import { shopKeys } from '../keys'

interface UseShopServicesResult {
  services: ShopServiceItem[]
  loading: boolean
  error: string | null
}

/**
 * جلب الخدمات النشطة لفرع — لتعبئة منتقي الباقة المرجعية.
 */
export function useShopServices(shopId: string): UseShopServicesResult {
  const { data, isLoading, error } = useQuery({
    queryKey: shopKeys.services(shopId),
    queryFn: () => getShopServices(shopId),
    enabled: !!shopId,
  })

  return {
    services: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}