import { createClient } from '@/shared/lib/supabase/client'
import {
  toStaffCardDto,
  type StaffCardDto,
  type CreateBarberDto,
  toShopStaffMemberDto,
  type ShopStaffMemberDto,
  type ShopStaffRpcRow,
} from '../dto/staff.dto'
import type { ShopStaffQueryResponse } from '../types/staff.type'

export async function getOwnerStaff(ownerId: string): Promise<StaffCardDto[]> {
  const supabase = createClient()

  // 1. Get all shop IDs for this owner
  const { data: shops, error: shopsError } = await supabase
    .from('shops_v2')
    .select('id')
    .eq('owner_id', ownerId)
    
  if (shopsError) throw new Error(shopsError.message)
  
  if (!shops || shops.length === 0) {
    return []
  }
  
  const shopIds = shops.map(s => s.id)

  // 2. Fetch staff for all these shops
  const { data, error } = await supabase
    .from('shop_staff')
    .select(`
      id,
      role,
      shop_id,
      is_active,
      hired_at,
      profiles!inner (
        id,
        name,
        avatar_url,
        phone
      ),
      shops_v2 (
        name,
        owner_id
      )
    `)
    .in('shop_id', shopIds)
    .eq('is_active', true)
    .returns<ShopStaffQueryResponse[]>()

  if (error) throw new Error(error.message)
  return data.map(toStaffCardDto)
}

export async function createBarber(dto: CreateBarberDto): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.functions.invoke('create-staff', {
    body: {
      email: dto.email,
      password: dto.password,
      name: dto.name,
      phone: dto.phone,
      role: dto.role ?? 'barber',
      shop_id: dto.shopId,
    }
  })

  if (error) {
    // Attempt to parse Supabase Edge Function error if it's a JSON response
    let errorMessage = error.message
    try {
      const context = await error.context?.json?.()
      if (context && context.error) errorMessage = context.error
    } catch {}
    throw new Error(errorMessage || 'حدث خطأ أثناء إضافة الموظف')
  }
}

/**
 * جلب موظفي فرع واحد عبر RPC get_shop_staff_with_profiles.
 * يُستخدم لتعبئة فلتر الحلاقين في شاشة تفاصيل الفرع.
 */
export async function getShopStaffWithProfiles(shopId: string): Promise<ShopStaffMemberDto[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('get_shop_staff_with_profiles', { p_shop_id: shopId })
    .returns<ShopStaffRpcRow[]>()

  if (error) throw new Error(error.message)
  return (((data as unknown) as ShopStaffRpcRow[]) ?? []).map(toShopStaffMemberDto)
}

export async function getCurrentStaffMember(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shop_staff')
    .select('id, shop_id, role, is_active, hired_at, shops_v2(name)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('hired_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}
