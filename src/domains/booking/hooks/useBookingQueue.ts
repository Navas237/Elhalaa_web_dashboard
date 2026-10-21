'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { ShopBookingCardDto } from '../dto/shop-booking.dto'
import type { BookingsTabValue } from '../components/shop-bookings/ShopBookingsToolbar'
import { organizeUpcomingQueue, getBookingTimeBounds } from '../utils/booking-queue'
import { updateBookingStatus } from '../services/booking.service'
import { bookingKeys } from '../query-keys'

interface UseBookingQueueResult {
  displayBookings: ShopBookingCardDto[]
  activeBookingId: string | null
}

export function useBookingQueue(
  shopId: string,
  rawBookings: ShopBookingCardDto[],
  activeTab: BookingsTabValue
): UseBookingQueueResult {
  const queryClient = useQueryClient()
  const [nowMs, setNowMs] = useState(() => Date.now())
  const processingIdsRef = useRef<Set<string>>(new Set())

  // تحديث التوقيت دورياً كل 10 ثوانٍ لضمان التفاعل اللحظي مع انتهاء وقت الحلاقة
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now())
    }, 10000)

    return () => clearInterval(timer)
  }, [])

  // تنظيم وفرز الحجوزات حسب التبويب النشط
  const { displayBookings, activeBookingId, expiredBookings } = useMemo(() => {
    if (activeTab === 'upcoming') {
      const queue = organizeUpcomingQueue(rawBookings, nowMs)
      return {
        displayBookings: queue.orderedBookings,
        activeBookingId: queue.activeBookingId,
        expiredBookings: queue.expiredBookings,
      }
    }

    if (activeTab === 'past') {
      // الحجوزات السابقة: ترتيب تنازلي (الأحدث أولاً)
      const sorted = [...rawBookings].sort((a, b) => {
        const boundsA = getBookingTimeBounds(a)
        const boundsB = getBookingTimeBounds(b)
        return boundsB.startMs - boundsA.startMs
      })
      return {
        displayBookings: sorted,
        activeBookingId: null,
        expiredBookings: [],
      }
    }

    // تبويب الانتظار
    return {
      displayBookings: rawBookings,
      activeBookingId: null,
      expiredBookings: [],
    }
  }, [rawBookings, activeTab, nowMs])

  // التحويل التلقائي للحجوزات المنتهية إلى "مكتمل" في قاعدة البيانات
  useEffect(() => {
    if (activeTab !== 'upcoming' || expiredBookings.length === 0) return

    const toProcess = expiredBookings.filter(
      (b) => !processingIdsRef.current.has(b.id)
    )

    if (toProcess.length === 0) return

    // تسجيل المعرفات لمنع تكرار النداء أثناء معالجة الطلب
    toProcess.forEach((b) => processingIdsRef.current.add(b.id))

    Promise.allSettled(
      toProcess.map((b) => updateBookingStatus(b.id, 'completed'))
    ).then((results) => {
      let anySuccess = false
      results.forEach((res, index) => {
        const booking = toProcess[index]
        if (res.status === 'fulfilled') {
          anySuccess = true
        } else {
          // إذا فشل الطلب نمسحه من الـ set ليتاح إعادة المحاولة
          processingIdsRef.current.delete(booking.id)
        }
      })

      if (anySuccess) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.all })
        if (shopId) {
          queryClient.invalidateQueries({
            queryKey: bookingKeys.shop(shopId),
            exact: false,
          })
        }
      }
    })
  }, [expiredBookings, activeTab, shopId, queryClient])

  return {
    displayBookings,
    activeBookingId,
  }
}
