'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Clock, Loader2 } from 'lucide-react'
import { BookingWizardValues } from '../BookingWizard'
import { useShop } from '@/domains/branch/hooks/useShops'
import { getFilteredPeriods, type PeriodId } from '@/domains/booking/utils/period-filter'
import { cn } from '@/lib/utils'

interface PeriodStepProps {
  onNext: () => void
}

export function PeriodStep({ onNext }: PeriodStepProps) {
  const { watch, setValue } = useFormContext<BookingWizardValues>()
  const shopId = watch('shopId')
  const targetDate = watch('targetDate')
  const selectedPeriod = watch('period')

  const { shop, loading } = useShop(shopId)

  const filteredPeriods = getFilteredPeriods({
    openingTime: shop?.opening_time,
    closingTime: shop?.closing_time,
    targetDate,
  })

  // التأكد من اختيار فترة متاحة تلقائياً في حال كانت الفترة الحالية غير متاحة
  useEffect(() => {
    if (filteredPeriods.length > 0) {
      const isValid = filteredPeriods.some((p) => p.id === selectedPeriod)
      if (!isValid) {
        setValue('period', filteredPeriods[0].id, { shouldValidate: true })
      }
    }
  }, [filteredPeriods, selectedPeriod, setValue])

  const handleSelect = (id: PeriodId) => {
    setValue('period', id, { shouldValidate: true })
    setValue('selectedSlot', null)

    setTimeout(() => {
      onNext()
    }, 150)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-slate-500">جاري تحميل مواعيد الفرع...</p>
      </div>
    )
  }

  if (filteredPeriods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 p-6 text-center">
        <Clock className="w-8 h-8 text-slate-300" />
        <p className="text-sm font-bold text-slate-700">لا توجد فترات متاحة لهذا اليوم</p>
        <p className="text-xs text-slate-500">مواعيد عمل الفرع أو الوقت الحالي لا يسمحان بالحجز اليوم. يرجى اختيار يوم آخر.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full pb-[90px]">
      <div className="grid grid-cols-2 gap-3">
        {filteredPeriods.map((period) => {
          const isSelected = selectedPeriod === period.id
          const Icon = period.icon

          return (
            <button
              key={period.id}
              type="button"
              onClick={() => handleSelect(period.id)}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-2",
                isSelected ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <h4 className={cn(
                "font-bold text-base",
                isSelected ? "text-primary" : "text-slate-900"
              )}>
                {period.label}
              </h4>
              <p className="text-xs text-slate-500">{period.time}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
