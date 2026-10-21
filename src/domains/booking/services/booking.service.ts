import { createClient } from '@/shared/lib/supabase/client'
import type { BookingStatus } from '@/shared/types/database'

import { toBookingCardDto } from "../dto/booking.dto"
import { toShopBookingCardDto } from "../dto/shop-booking.dto"


// . جيب الحجوزات — كل الفلاتر تطبَّق على السيرفر حتى يكون
// الـ pagination والـ total_count متوافقين مع النتيجة المعروضة،
// وإلا تظهر صفحات فارغة عندما تُفلتر صفحة واحدة محمّلة فقط.
export type OwnerBookingsQuery = {
  page?: number
  pageSize?: number
  status?: string
  shopId?: string
  barberId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export async function getOwnerBookings(ownerId: string, query: OwnerBookingsQuery = {}): Promise<import("../dto/booking.dto").BookingCardDto[]> {
  const supabase = createClient()
  const params: any = { p_owner_id: ownerId }
  if (query.page !== undefined) params.p_page = query.page
  if (query.pageSize !== undefined) params.p_page_size = query.pageSize
  if (query.status && query.status !== 'all') params.p_status_filter = query.status
  if (query.shopId) params.p_shop_id = query.shopId
  if (query.barberId) params.p_barber_id = query.barberId
  if (query.dateFrom) params.p_date_from = query.dateFrom
  if (query.dateTo) params.p_date_to = query.dateTo
  if (query.search) params.p_search = query.search

  const { data, error } = await supabase
    .rpc('get_owner_bookings_feed', params)
  if (error) throw new Error(error.message)
  return (data ?? []).map(toBookingCardDto)
}

// . إحصائيات الحجوزات لكل الحالات
export async function getOwnerBookingCounts(ownerId: string) {
  const supabase = createClient()
  
  // 1. Get shops for this owner
  const { data: shops } = await supabase.from('shops_v2').select('id').eq('owner_id', ownerId)
  if (!shops || shops.length === 0) {
    return { all: 0, pending: 0, confirmed: 0, completed: 0, waiting_time: 0, cancelled: 0, due_pending: 0, due_waiting: 0 }
  }
  
  const shopIds = shops.map(s => s.id)
  
  // 2. Execute parallel count queries for each status
  const statuses = ['pending', 'confirmed', 'completed', 'waiting_time', 'cancelled']
  
  const queries = [
    supabase.from('bookings_v2').select('id', { count: 'exact', head: true }).in('shop_id', shopIds),
    ...statuses.map(status => 
      supabase.from('bookings_v2').select('id', { count: 'exact', head: true }).in('shop_id', shopIds).eq('status', status)
    )
  ]
  
  const [results, dueRes, dueWaitingRes] = await Promise.all([
    Promise.all(queries),
    supabase.rpc('get_owner_due_pending_count', { p_owner_id: ownerId }),
    supabase.rpc('get_owner_due_waiting_count', { p_owner_id: ownerId }),
  ])
  
  return {
    all: results[0].count || 0,
    pending: results[1].count || 0,
    confirmed: results[2].count || 0,
    completed: results[3].count || 0,
    waiting_time: results[4].count || 0,
    cancelled: results[5].count || 0,
    // pending whose start time has arrived/passed (accurate across pagination)
    due_pending: typeof dueRes.data === 'number' ? dueRes.data : 0,
    // waiting whose DISPLAY start time has arrived/passed -> in-app reminder scope
    due_waiting: typeof dueWaitingRes.data === 'number' ? dueWaitingRes.data : 0,
  }
}

// . جيب حجوزات النهارده
export async function getShopTodayBookings(shopId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('get_shop_today_bookings', { p_shop_id: shopId })
  if (error) throw new Error(error.message)
  return data
}

// جلب حجوزات فرع معين مع فلترة و pagination
// ملاحظة: p_status_filter يُمرَّر كقيمة مفردة أو قائمة مفصولة بفاصلة حسب تعريف الـ RPC
export async function getShopBookings(params: {
  shop_id: string
  barber_id?: string
  date_from?: string
  date_to?: string
  status_filter?: string
  page?: number
  page_size?: number
}): Promise<import("../dto/shop-booking.dto").ShopBookingCardDto[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_shop_bookings', {
    p_shop_id: params.shop_id,
    p_barber_id: params.barber_id,
    p_date_from: params.date_from,
    p_date_to: params.date_to,
    p_status_filter: params.status_filter,
    p_page: params.page,
    p_page_size: params.page_size,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map(toShopBookingCardDto)
}

// . إنشاء حجز
export async function createBooking(params: {
  p_shop_id: string
  p_staff_id: string
  p_client_id: string | null
  p_client_name: string
  p_client_phone: string
  p_service_id: string
  p_booking_date: string
  p_start_time: string
  p_end_time: string
  p_display_start_time: string
  p_status: string
  p_payment_method: string
  p_notes: string | null
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('create_booking_by_staff', params)
  if (error) throw new Error(error.message)
  return data
}

// . تحديث حالة الحجز






// . تحديث حالة الحجز
export async function updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings_v2')
    .update({ status: newStatus })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function assignBookingTime(bookingId: string, params: {
  booking_date: string
  start_time: string
  end_time: string
  display_start_time: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings_v2')
    .update({ ...params, status: 'pending' })
    .eq('id', bookingId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function getClientNameByPhone(phone: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings_v2')
    .select('client_name')
    .eq('client_phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    
  if (error) {
    throw new Error(error.message)
  }
  
  if (data && data.length > 0) {
    return data[0].client_name
  }
  
  return null
}