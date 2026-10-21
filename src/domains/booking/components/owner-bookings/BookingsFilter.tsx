import { useState } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, MapPin, Scissors, Calendar, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import type { AdvancedFilters, FilterOption } from '../../typys/booking.types'

interface BookingsFilterProps {
  filters: AdvancedFilters
  onFiltersChange: (filters: AdvancedFilters) => void
  counts?: Record<FilterOption, number>
  uniqueShops: string[]
  uniqueBarbers: string[]
}

const filterOptions: { id: FilterOption, label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'pending', label: 'معلق' },
  { id: 'confirmed', label: 'مؤكد' },
  { id: 'waiting_time', label: 'في الانتظار' },
  { id: 'completed', label: 'مكتمل' },
  { id: 'cancelled', label: 'ملغي' },
]

export function BookingsFilter({ filters, onFiltersChange, counts, uniqueShops, uniqueBarbers }: BookingsFilterProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const hasAdvancedFilters = !!filters.shopName || !!filters.barberName || !!filters.date

  const handleStatusChange = (status: FilterOption) => {
    onFiltersChange({ ...filters, status })
  }

  const clearAdvancedFilters = () => {
    onFiltersChange({ ...filters, shopName: null, barberName: null, date: null })
    setIsSheetOpen(false)
  }

  return (
    <div className="flex items-center gap-2 pb-4" dir='rtl'>
      {/* Advanced Filters Button */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="flex-shrink-0 h-10 w-10 rounded-xl relative shadow-sm border-muted"
          >
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            {hasAdvancedFilters && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90dvh] overflow-y-auto px-4 pb-8" dir="rtl">
          <SheetHeader className="text-right pb-4 border-b">
            <div className="flex justify-between items-center">
              <SheetTitle className="text-lg font-bold">تصفية متقدمة</SheetTitle>
              {hasAdvancedFilters && (
                <Button variant="ghost" size="sm" onClick={clearAdvancedFilters} className="text-red-500 h-8 px-2">
                  مسح الكل
                </Button>
              )}
            </div>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {/* Shop Filter */}
            {uniqueShops.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <MapPin className="h-4 w-4" />
                  <span>الفرع</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueShops.map(shop => (
                    <button
                      key={shop}
                      onClick={() => onFiltersChange({ ...filters, shopName: filters.shopName === shop ? null : shop })}
                      className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                        filters.shopName === shop 
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                          : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted/80'
                      }`}
                    >
                      {shop}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Barber Filter */}
            {uniqueBarbers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Scissors className="h-4 w-4" />
                  <span>الحلاق</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueBarbers.map(barber => (
                    <button
                      key={barber}
                      onClick={() => onFiltersChange({ ...filters, barberName: filters.barberName === barber ? null : barber })}
                      className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                        filters.barberName === barber 
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                          : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted/80'
                      }`}
                    >
                      {barber}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Calendar className="h-4 w-4" />
                <span>التاريخ</span>
              </div>
              <input 
                type="date" 
                value={filters.date || ''}
                onChange={(e) => onFiltersChange({ ...filters, date: e.target.value || null })}
                className="w-full h-12 px-4 rounded-xl border bg-muted/20 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Horizontal Status Filter */}
      <div className="flex flex-nowrap overflow-x-auto gap-3 scrollbar-hide px-1 items-center">
        {filterOptions.map((opt) => {
          const isSelected = filters.status === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => handleStatusChange(opt.id)}
              className={`flex-shrink-0 relative px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
                isSelected 
                  ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                  : 'border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>{opt.label}</span>
                {counts && counts[opt.id] !== undefined && (
                  <span className={`flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md text-[11px] font-bold ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-background border text-muted-foreground shadow-sm'
                  }`}>
                    {counts[opt.id]}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
