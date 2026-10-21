import type { Database } from '@/shared/lib/supabase/database.types'
import type { ServiceCardDto } from '../types'

type ServiceRow = Database['public']['Tables']['services']['Row']

export function toServiceCardDto(row: ServiceRow): ServiceCardDto {
  return {
    id: row.id,
    shopId: row.shop_id,
    name: row.name,
    description: row.description,
    price: row.price,
    durationMinutes: row.duration_minutes,
    isActive: row.is_active,
  }
}
