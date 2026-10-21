import { Skeleton } from '@/shared/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-300" dir="rtl">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Cards Skeletons */}
      <div className="flex flex-col gap-3 mt-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  )
}
