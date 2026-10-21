export const bookingKeys = {
  all: ["booking"] as const,

  list: (id: string) =>
    [...bookingKeys.all, "list", id] as const,

  shop: (shopId: string, filters?: Record<string, unknown>) =>
    [...bookingKeys.all, "shop", shopId, filters] as const,

  clientByPhone: (phone: string) => 
    [...bookingKeys.all, 'clientByPhone', phone] as const,

  availableDays: (shopId: string, staffId: string) => 
    [...bookingKeys.all, 'availableDays', shopId, staffId] as const,
}