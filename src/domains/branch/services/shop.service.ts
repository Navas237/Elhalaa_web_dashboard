import { createClient } from '@/shared/lib/supabase/client'
import type { CreateShopInput, UpdateShopInput, CreateServiceInput, UpdateServiceInput } from '../types'

// جيب كل فروع الـ Owner
export async function getOwnerShops(ownerId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('shops_v2')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// جيب فرع واحد
export async function getShopById(shopId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('shops_v2')
    .select('*')
    .eq('id', shopId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// إضافة فرع جديد
export async function createShop(ownerId: string, input: CreateShopInput) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('shops_v2')
    .insert({
      ...input,
      owner_id: ownerId,
      shop_code: crypto.randomUUID().slice(0, 8).toUpperCase(),
      status: 'open',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// تعديل فرع
export async function updateShop(shopId: string, input: UpdateShopInput) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('shops_v2')
    .update(input)
    .eq('id', shopId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * باقة مرجعية محتملة — صف من جدول services التابع للفرع.
 */
export interface ShopServiceItem {
  id: string
  name: string
  description?: string | null
  price: number
  duration_minutes: number
  is_active: boolean
  display_order: number
}

/**
 * جلب الخدمات النشطة لفرع لتعبئة منتقي الباقة المرجعية.
 * النشطة فقط، مرتبة حسب display_order ثم name.
 */
export async function getShopServices(shopId: string): Promise<ShopServiceItem[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('services')
    .select('id, name, description, price, duration_minutes, is_active, display_order')
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

// إضافة باقة / خدمة جديدة
export async function createService(shopId: string, input: CreateServiceInput) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('services')
    .insert({
      shop_id: shopId,
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      duration_minutes: input.duration_minutes,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// تعديل باقة / خدمة موجودة
export async function updateService(serviceId: string, input: UpdateServiceInput) {
  const supabase = createClient()
  const updateData: Record<string, any> = {}
  
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.price !== undefined) updateData.price = input.price
  if (input.duration_minutes !== undefined) updateData.duration_minutes = input.duration_minutes
  if (input.is_active !== undefined) updateData.is_active = input.is_active

  const { data, error } = await supabase
    .from('services')
    .update(updateData)
    .eq('id', serviceId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// حذف باقة / خدمة
export async function deleteService(serviceId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)

  if (error) throw new Error(error.message)
  return true
}