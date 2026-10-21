import type { ShopBookingCardDto } from '../dto/shop-booking.dto'

/**
 * تحويل تاريخ ووقت الحجز إلى ميلي ثانية (timestamp) محلي بدقة وأمان.
 */
export function parseBookingTimestamp(dateStr?: string | null, timeStr?: string | null): number | null {
  if (!timeStr && !dateStr) return null

  // إذا كان النص يحتوي على تاريخ كامل مدمج (ISO)
  if (timeStr && (timeStr.includes('T') || timeStr.includes(' '))) {
    const t = new Date(timeStr.replace(' ', 'T')).getTime()
    return isNaN(t) ? null : t
  }

  if (!dateStr) return null

  // تنظيف التاريخ إلى YYYY-MM-DD
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr

  // إذا لم يكن هناك وقت، نعتبره بداية اليوم
  if (!timeStr) {
    const t = new Date(`${cleanDate}T00:00:00`).getTime()
    return isNaN(t) ? null : t
  }

  // تنظيف الوقت إلى HH:mm:ss
  const rawParts = timeStr.trim().split(':')
  const h = (rawParts[0] || '0').padStart(2, '0')
  const m = (rawParts[1] || '0').padStart(2, '0')
  const s = rawParts[2] ? rawParts[2].split('.')[0].padStart(2, '0') : '00'
  const cleanTime = `${h}:${m}:${s}`

  const t = new Date(`${cleanDate}T${cleanTime}`).getTime()
  return isNaN(t) ? null : t
}

/**
 * حساب النطاق الزمني لبداية ونهاية الحجز (startMs و endMs).
 */
export function getBookingTimeBounds(booking: {
  bookingDate?: string | null
  startTime?: string | null
  displayStartTime?: string | null
  endTime?: string | null
  serviceDuration?: number | null
}): { startMs: number; endMs: number; isValid: boolean } {
  const startRaw = booking.startTime || booking.displayStartTime
  const startMs = parseBookingTimestamp(booking.bookingDate, startRaw)

  if (startMs === null) {
    return { startMs: 0, endMs: 0, isValid: false }
  }

  let endMs: number | null = null
  if (booking.endTime) {
    endMs = parseBookingTimestamp(booking.bookingDate, booking.endTime)
  }

  // إذا لم يتوفر endTime أو كان غير منطقي، نعتمد على مدة الخدمة (الافتراضي 30 دقيقة)
  if (endMs === null || isNaN(endMs) || endMs <= startMs) {
    const durationMinutes =
      booking.serviceDuration && booking.serviceDuration > 0
        ? booking.serviceDuration
        : 30
    endMs = startMs + durationMinutes * 60 * 1000
  }

  return { startMs, endMs, isValid: true }
}

export type BookingQueueState = 'in_progress' | 'upcoming' | 'finished'

export function getBookingQueueState(
  booking: ShopBookingCardDto,
  nowMs: number = Date.now()
): BookingQueueState {
  const { startMs, endMs, isValid } = getBookingTimeBounds(booking)
  if (!isValid) return 'upcoming'

  if (nowMs >= endMs) {
    return 'finished'
  }
  if (nowMs >= startMs && nowMs < endMs) {
    return 'in_progress'
  }
  return 'upcoming'
}

export interface ProcessedQueueResult {
  /** قائمة الحجوزات المرتبة حسب الدور: الحجز الجاري أولاً ثم القادمة بالتسلسل */
  orderedBookings: ShopBookingCardDto[]
  /** الحجز الذي يحلق الآن (إن وجد) */
  activeBookingId: string | null
  /** الحجوزات التي انتهت مدتها ويجب تحويلها إلى مكتملة */
  expiredBookings: ShopBookingCardDto[]
}

/**
 * تنظيم قائمة الحجوزات القادمة:
 * 1. عزل الحجوزات المنتهية تلقائياً (التي حان وقت اكتمالها).
 * 2. وضع الحجز/الحجوزات التي في الكرسي حالياً (يحلق دلوقتي) في مقدمة القائمة.
 * 3. ترتيب باقي الحجوزات تصاعدياً بحسب وقت الدور القادم (الأقرب فالأقرب).
 */
export function organizeUpcomingQueue(
  bookings: ShopBookingCardDto[],
  nowMs: number = Date.now()
): ProcessedQueueResult {
  const inProgress: Array<{ booking: ShopBookingCardDto; startMs: number }> = []
  const future: Array<{ booking: ShopBookingCardDto; startMs: number }> = []
  const expired: ShopBookingCardDto[] = []

  for (const b of bookings) {
    // التحقق فقط من الحجوزات المعلقة أو المؤكدة في تبويب القادمة
    if (b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show') {
      continue
    }

    const { startMs, endMs, isValid } = getBookingTimeBounds(b)
    if (!isValid) {
      future.push({ booking: b, startMs: Infinity })
      continue
    }

    if (nowMs >= endMs) {
      expired.push(b)
    } else if (nowMs >= startMs && nowMs < endMs) {
      inProgress.push({ booking: b, startMs })
    } else {
      future.push({ booking: b, startMs })
    }
  }

  // ترتيب الحجوزات الجارية حالياً بحسب وقت البدء
  inProgress.sort((a, b) => a.startMs - b.startMs)

  // ترتيب الحجوزات المستقبلية بحسب موعد الدور القادم (الأقرب أولاً)
  future.sort((a, b) => a.startMs - b.startMs)

  const orderedBookings = [
    ...inProgress.map((item) => item.booking),
    ...future.map((item) => item.booking),
  ]

  const activeBookingId = inProgress.length > 0 ? inProgress[0].booking.id : null

  return {
    orderedBookings,
    activeBookingId,
    expiredBookings: expired,
  }
}
