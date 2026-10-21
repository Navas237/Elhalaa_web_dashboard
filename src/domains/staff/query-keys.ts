export const staffKeys = {
  all: ['staff'] as const,
  list: (ownerId: string) => [...staffKeys.all, 'list', ownerId] as const,
  details: (staffId: string) => [...staffKeys.all, 'details', staffId] as const,
  workingHours: (staffId: string) => [...staffKeys.details(staffId), 'working-hours'] as const,
  byShop: (shopId: string) => [...staffKeys.all, 'byShop', shopId] as const,
}
