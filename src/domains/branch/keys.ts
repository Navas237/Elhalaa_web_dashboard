export const shopKeys = {
  all: ['shop'] as const,

  list: (ownerId: string) =>
    [...shopKeys.all, 'list', ownerId] as const,

  detail: (shopId: string) =>
    [...shopKeys.all, 'detail', shopId] as const,

  services: (shopId: string) =>
    [...shopKeys.all, 'services', shopId] as const,
}