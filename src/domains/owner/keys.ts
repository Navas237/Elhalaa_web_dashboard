export const ownerKeys = {
  all: ['owner'] as const,

  dashboard: (ownerId: string) =>
    [...ownerKeys.all, 'dashboard', ownerId] as const,

  bookings: (ownerId: string, filters?: Record<string, unknown>) =>
    [...ownerKeys.all, 'bookings', ownerId, filters] as const,

  shops: (ownerId: string) =>
    [...ownerKeys.all, 'shops', ownerId] as const,

  staff: (shopId: string) =>
    [...ownerKeys.all, 'staff', shopId] as const,

  services: (shopId: string) =>
    [...ownerKeys.all, 'services', shopId] as const,

  todayBookings: (shopId: string) =>
    [...ownerKeys.all, 'today-bookings', shopId] as const,
}