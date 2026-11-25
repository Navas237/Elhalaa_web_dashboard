'use client'

import React, { createContext, useContext, useEffect } from 'react'
import type { Tenant, TenantContextValue } from '../types/tenant.types'

const TenantContext = createContext<TenantContextValue | null>(null)

interface TenantProviderProps {
  tenant: Tenant
  children: React.ReactNode
}

export function TenantProvider({ tenant, children }: TenantProviderProps) {
  useEffect(() => {
    if (tenant?.branding?.primary_color) {
      document.documentElement.style.setProperty('--tenant-primary', tenant.branding.primary_color)
    }
  }, [tenant])

  return (
    <TenantContext.Provider value={{ tenant, isLoading: false, error: null }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useCurrentTenant(): Tenant {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useCurrentTenant must be used within a TenantProvider')
  }
  return context.tenant
}
