export const tenantKeys = {
  all: (tenantId: string) => ['tenant', tenantId] as const,
  detail: (tenantId: string) => [...tenantKeys.all(tenantId), 'detail'] as const,
  bySubdomain: (subdomain: string) => ['tenant', 'by-subdomain', subdomain] as const,
  branches: (tenantId: string) => [...tenantKeys.all(tenantId), 'branches'] as const,
  barbers: (tenantId: string, branchId?: string) =>
    [...tenantKeys.all(tenantId), 'barbers', branchId ?? 'all'] as const,
  services: (tenantId: string, branchId?: string) =>
    [...tenantKeys.all(tenantId), 'services', branchId ?? 'all'] as const,
  bookings: (tenantId: string, branchId?: string, date?: string) =>
    [...tenantKeys.all(tenantId), 'bookings', branchId ?? 'all', date ?? 'today'] as const,
}
