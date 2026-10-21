import { Skeleton } from '@/shared/components/ui/skeleton'
import { Card } from '@/shared/components/ui/card'

/**
 * هيكل تحميل مطابق تماماً لـ ShopCard.
 * يُعرض بمفرده — ويقوم المُستدعي بعرض 3 نسخ منه.
 */
export function ShopCardSkeleton() {
  return (
    <Card dir="rtl" className="p-4 gap-2 shadow-sm bg-card border-border">
      {/* الصف العلوي: الاسم + العنوان (يمين) والسهم (يسار) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-[55%]" />
          <Skeleton className="h-3.5 w-[75%]" />
        </div>
        <Skeleton className="h-5 w-5 shrink-0 mt-0.5" />
      </div>

      {/* صف الشارة + التقييم + المواعيد */}
      <div className="flex items-center gap-2 mt-1">
        <Skeleton className="h-5 w-16 rounded-2xl" />
        <Skeleton className="h-3.5 w-12" />
        <Skeleton className="h-3.5 w-24" />
      </div>
    </Card>
  )
}
