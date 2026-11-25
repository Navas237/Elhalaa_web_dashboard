import { createClient } from '@/shared/lib/supabase/client'
import type { CreateBlockedTimeInput, BookingConflictResult, BlockedTimeRecord } from '../typys/blocked-time.types'
import { toBlockedTimeDto, type BlockedTimeDto } from '../dto/blocked-time.dto'

/**
 * جلب الفترات المقفولة لحلاق معين (مع خيار تحديد تاريخ معين)
 */
export async function getBlockedTimes(staffId: string, date?: string): Promise<BlockedTimeDto[]> {
  const supabase = createClient()
  let query = supabase
    .from('barber_blocked_times')
    .select('*')
    .eq('staff_id', staffId)

  if (date) {
    query = query.eq('block_date', date)
  }

  const { data, error } = await query
    .order('block_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching blocked times:', error)
    return []
  }

  return ((data as unknown as BlockedTimeRecord[]) || []).map(toBlockedTimeDto)
}

/**
 * فحص صارم استباقي لمنع قفل ميعاد إذا كان هناك حجز نشط متقاطع
 */
export async function checkBookingConflict(
  staffId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<BookingConflictResult> {
  const supabase = createClient()

  // نحرص على جلب الحجوزات النشطة فقط (pending, confirmed, waiting_time)
  const { data, error } = await supabase
    .from('bookings_v2')
    .select('id, client_name, start_time, end_time, status')
    .eq('staff_id', staffId)
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed', 'waiting_time'])

  if (error || !data) {
    return { hasConflict: false }
  }

  // فحص التقاطع الزمني: (StartA < EndB) && (EndA > StartB)
  const conflictingBooking = data.find((booking) => {
    if (!booking.start_time || !booking.end_time) return false
    return booking.start_time < endTime && booking.end_time > startTime
  })

  if (conflictingBooking) {
    return {
      hasConflict: true,
      conflict: {
        bookingId: conflictingBooking.id,
        clientName: conflictingBooking.client_name,
        startTime: conflictingBooking.start_time.substring(0, 5),
        endTime: conflictingBooking.end_time.substring(0, 5),
        status: conflictingBooking.status,
      },
    }
  }

  return { hasConflict: false, conflict: null }
}

/**
 * قفل ميعاد مع التحقق من عدم وجود أي تعارض
 */
export async function createBlockedTime(input: CreateBlockedTimeInput): Promise<BlockedTimeDto> {
  const supabase = createClient()

  // 1. فحص استباقي لمنع التعارض مع أي حجز قائم
  const conflictCheck = await checkBookingConflict(
    input.staff_id,
    input.block_date,
    input.start_time,
    input.end_time
  )

  if (conflictCheck.hasConflict && conflictCheck.conflict) {
    const { clientName, startTime, endTime } = conflictCheck.conflict
    throw new Error(
      `لا يمكن قفل هذا الوقت لوجود حجز نشط للعميل (${clientName}) من ${startTime} إلى ${endTime}. يجب تعديل أو إلغاء الحجز أولاً.`
    )
  }

  // 2. محاولة الاستدعاء عبر الـ RPC الذري (إن كان منشوراً في قاعدة البيانات)
  const { data: rpcData, error: rpcError } = await supabase.rpc('block_barber_time_slot', {
    p_shop_id: input.shop_id,
    p_staff_id: input.staff_id,
    p_block_date: input.block_date,
    p_start_time: input.start_time,
    p_end_time: input.end_time,
    p_reason: input.reason,
    p_notes: input.notes ?? null,
  })

  // إذا نجح الـ RPC
  if (!rpcError && rpcData) {
    if (rpcData.success === false) {
      throw new Error(rpcData.message || 'فشل في قفل الميعاد')
    }

    // جلب السجل المنشأ
    const { data: createdRecord } = await supabase
      .from('barber_blocked_times')
      .select('*')
      .eq('id', rpcData.id)
      .single()

    if (createdRecord) {
      return toBlockedTimeDto(createdRecord as unknown as BlockedTimeRecord)
    }
  }

  // Fallback: إدخال مباشر في جدول barber_blocked_times
  const { data, error } = await supabase
    .from('barber_blocked_times')
    .insert({
      shop_id: input.shop_id,
      staff_id: input.staff_id,
      block_date: input.block_date,
      start_time: input.start_time,
      end_time: input.end_time,
      reason: input.reason,
      notes: input.notes,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'فشل في حفظ الوقت المقفول')
  }

  return toBlockedTimeDto(data as unknown as BlockedTimeRecord)
}

/**
 * فك القفل / حذف وقت مقفول
 */
export async function deleteBlockedTime(blockId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('barber_blocked_times')
    .delete()
    .eq('id', blockId)

  if (error) {
    throw new Error(error.message || 'فشل في فك قفل الميعاد')
  }
}
