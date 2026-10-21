import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useActiveStaff } from '../hooks/useStaff'

interface StaffHeaderProps {
  ownerId: string
  searchQuery: string
  onSearchChange: (value: string) => void
  onAddBarberClick: () => void
}

export function StaffHeader({ ownerId, searchQuery, onSearchChange, onAddBarberClick }: StaffHeaderProps) {
  const { staff } = useActiveStaff(ownerId)
  const totalCount = staff?.length || 0

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">فريق العمل</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة الحلاقين والموظفين في الفرع
            {totalCount > 0 && <span className="mr-1 text-primary font-medium">({totalCount})</span>}
          </p>
        </div>
        <Button onClick={onAddBarberClick} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">إضافة موظف</span>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="ابحث بالاسم أو رقم الهاتف..." 
          className="pl-3 pr-9 h-11 bg-card shadow-sm border-border"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}
