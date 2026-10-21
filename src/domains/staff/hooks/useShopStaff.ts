'use client'

import { useQuery } from '@tanstack/react-query'
import { getShopStaffWithProfiles } from '../services/staff.service'
import { staffKeys } from '../query-keys'
import type { ShopStaffMemberDto } from '../dto/staff.dto'

interface UseShopStaffResult {
  staff: ShopStaffMemberDto[]
  loading: boolean
  error: string | null
}

/**
 * جلب موظفي فرع واحد. خفيف — يُستخدم لتعبئة فلتر الحلاقين فقط.
 */
export function useShopStaff(shopId: string): UseShopStaffResult {
  const { data, isLoading, error } = useQuery({
    queryKey: staffKeys.byShop(shopId),
    queryFn: () => getShopStaffWithProfiles(shopId),
    enabled: !!shopId,
  })

  return {
    staff: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}