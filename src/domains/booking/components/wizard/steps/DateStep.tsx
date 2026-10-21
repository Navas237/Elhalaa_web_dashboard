'use client'

import { useFormContext } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { BookingWizardValues } from '../BookingWizard'
import { cn } from '@/lib/utils'
import { useAvailableBookingDays } from '../../../hooks/useAvailableBookingDays'

interface DateStepProps {
  onNext: () => void
}

export function DateStep({ onNext }: DateStepProps) {
  const { watch, setValue } = useFormContext<BookingWizardValues>()
  const selectedDate = watch('targetDate')
  const shopId = watch('shopId')
  const staffId = watch('staffId')

  const { data: availableDays, isLoading } = useAvailableBookingDays(shopId, staffId)

  const handleSelect = (dateStr: string) => {
    setValue('targetDate', dateStr, { shouldValidate: true })
    setValue('selectedSlot', null)

    setTimeout(() => {
      onNext()
    }, 150)
  }

  return (
    <div className="flex flex-col h-full pb-[90px]">
      <div className="w-full">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : availableDays && availableDays.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {availableDays.map((day) => (
              <button
                key={day.isoDate}
                type="button"
                onClick={() => handleSelect(day.isoDate)}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-1 rounded-2xl border transition-all",
                  "w-[calc(25%-9px)]",
                  selectedDate === day.isoDate
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50"
                )}
              >
                <span className={cn(
                  "text-[11px] font-medium mb-1",
                  selectedDate === day.isoDate ? "text-primary" : "text-slate-500"
                )}>
                  {day.label === 'اليوم' || day.label === 'غداً' ? day.label : day.dayName}
                </span>
                <span className={cn(
                  "text-xl font-bold",
                  selectedDate === day.isoDate ? "text-primary" : "text-slate-900"
                )}>
                  {day.dayNumber}
                </span>
                <span className={cn(
                  "text-[10px] mt-0.5",
                  selectedDate === day.isoDate ? "text-primary/70" : "text-slate-400"
                )}>
                  {day.date.toLocaleDateString('ar-EG', { month: 'short' })}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-8">
            لا توجد أيام عمل متاحة لهذا الحلاق
          </div>
        )}
      </div>
    </div>
  )
}
