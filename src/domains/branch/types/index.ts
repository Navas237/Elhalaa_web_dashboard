export type ShopStatus = 'open' | 'closed' | 'maintenance'

export interface Shop {
  id: string
  shop_code: string
  name: string
  owner_id: string
  address: string | null
  latitude: number | null
  longitude: number | null
  image_url: string | null
  status: ShopStatus
  rating: number | null
  total_reviews: number | null
  opening_time: string | null
  closing_time: string | null
  booking_start_date: string | null
  booking_end_date: string | null
  timezone: string | null
  reference_package_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateShopInput {
  name: string
  address?: string
  latitude?: number
  longitude?: number
  image_url?: string
  opening_time?: string
  closing_time?: string
  timezone?: string
}

export interface UpdateShopInput extends Partial<CreateShopInput> {
  status?: ShopStatus
  reference_package_id?: string
}

export interface ServiceCardDto {
  id: string
  shopId: string
  name: string
  description: string | null
  price: number
  durationMinutes: number
  isActive: boolean
}

export interface CreateServiceInput {
  name: string
  description?: string
  price: number
  duration_minutes: number
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  is_active?: boolean
}