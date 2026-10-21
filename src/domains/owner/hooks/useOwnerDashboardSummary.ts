'use client'

import { useQuery } from '@tanstack/react-query'
import { getOwnerDashboardSummary } from '../services/owner.service'
import { ownerKeys } from '../keys'

export function useOwnerDashboard(ownerId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ownerKeys.dashboard(ownerId),
    queryFn: () => getOwnerDashboardSummary(ownerId),
    enabled: !!ownerId,
  })

  return {
    summary: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  }
}