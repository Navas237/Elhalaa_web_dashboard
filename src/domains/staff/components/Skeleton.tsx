import { Skeleton as BaseSkeleton } from '@/shared/components/ui/skeleton'

export function Skeleton() {
  return (
    <div className="flex flex-col gap-3" dir="rtl">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center gap-4">
          <BaseSkeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <BaseSkeleton className="h-5 w-[150px]" />
            <BaseSkeleton className="h-4 w-[100px]" />
          </div>
        </div>
      ))}
    </div>
  )
}
