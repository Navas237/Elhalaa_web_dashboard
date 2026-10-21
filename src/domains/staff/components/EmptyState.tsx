import { UsersRound } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" dir="rtl">
      <div className="bg-muted/50 p-4 rounded-full mb-4">
        <UsersRound className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold mb-1">لا يوجد موظفين</h3>
      <p className="text-sm text-muted-foreground max-w-[250px]">
        لم تقم بإضافة أي حلاقين أو موظفين إلى هذا الفرع حتى الآن.
      </p>
    </div>
  )
}
