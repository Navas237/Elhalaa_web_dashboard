'use client'

import { useQuery } from '@tanstack/react-query'
import { getOwnerStaff } from '../services/staff.service'
import { staffKeys } from '../query-keys'

export function useActiveStaff(ownerId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: staffKeys.list(ownerId),
    queryFn: () => getOwnerStaff(ownerId),
    enabled: !!ownerId,
  })

  return {
    staff: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  }
}