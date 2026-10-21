import type { StaffRole } from '@/shared/types/database'

export interface ShopStaffQueryResponse {
  id: string
  role: StaffRole
  shop_id: string
  is_active: boolean
  hired_at: string
  profiles: {
    id: string
    name: string
    avatar_url: string | null
    phone?: string | null
  }
  shops_v2?: {
    name: string
  }
}

export type StaffMember = ShopStaffQueryResponse