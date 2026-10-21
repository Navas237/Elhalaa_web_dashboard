import type { ShopStaffQueryResponse } from '../types/staff.type'
import type { StaffRole } from '@/shared/types/database'

export interface StaffCardDto {
  id: string
  profileId: string
  name: string
  avatarUrl: string | null
  phone: string | null
  role: StaffRole
  isActive: boolean
  shopId: string
  shopName: string | null
  hiredAt: string
}

export function toStaffCardDto(data: ShopStaffQueryResponse): StaffCardDto {
  return {
    id: data.id,
    profileId: data.profiles.id,
    name: data.profiles.name,
    avatarUrl: data.profiles.avatar_url,
    phone: data.profiles.phone || null,
    role: data.role,
    isActive: data.is_active,
    shopId: data.shop_id,
    shopName: data.shops_v2?.name || null,
    hiredAt: data.hired_at,
  }
}

export interface CreateBarberDto {
  name: string
  email: string
  password: string
  phone: string
  shopId: string
  role?: StaffRole
}

export interface TransferBarberInput {
  staffId: string
  targetShopId: string
}

/**
 * شكل البيانات الراجعة من RPC get_shop_staff_with_profiles.
 * يُستخدم لتعبئة فلتر الحلاقين في شاشة تفاصيل الفرع فقط — خفيف.
 * barberId هنا هو user_id لأن الـ RPC يستخدمه مع ss.user_id = p_barber_id.
 */
export interface ShopStaffMemberDto {
  staffId: string
  userId: string
  name: string
  avatarUrl: string | null
  role: StaffRole
  isActive: boolean
}

export interface ShopStaffRpcRow {
  staff_id: string
  user_id: string
  name: string
  email: string
  phone: string
  avatar_url: string | null
  role: StaffRole
  is_active: boolean
  hired_at: string
  shop_id: string
}

export function toShopStaffMemberDto(row: ShopStaffRpcRow): ShopStaffMemberDto {
  return {
    staffId: row.staff_id,
    userId: row.user_id,
    name: row.name,
    avatarUrl: row.avatar_url,
    role: row.role,
    isActive: row.is_active,
  }
}
