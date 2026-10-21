'use client'

import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

/**
 * هيكل مطابق لبطاقة الحجز في شاشة تفاصيل الفرع.
 * يُعرض N منها أثناء التحميل.
 */
export function ShopBookingCardSkeleton() {
  return (
    <Card dir="rtl" className="p-4 flex flex-col gap-3 shadow-sm bg-card border-border">
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-5 w-14 rounded-2xl" />
      </div>
      <Skeleton className="h-8 w-full rounded-md" />
    </Card>
  )
}