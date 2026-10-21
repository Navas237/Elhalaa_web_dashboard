'use client'

import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Clock, Loader2, AlertCircle } from 'lucide-react'
import { BookingWizardValues } from '../BookingWizard'
import { useSmartBookingSlots } from '@/domains/booking/hooks/useSmartBookingSlots'
import { ALL_PERIODS } from '@/domains/booking/utils/period-filter'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'

interface TimeStepProps {
  onNext: () => void
  onBack: () => void
}

export function TimeStep({ onNext, onBack }: TimeStepProps) {
  const { watch, setValue } = useFormContext<BookingWizardValues>()
  
  const shopId = watch('shopId')
  const staffId = watch('staffId')
  const serviceId = watch('serviceId')
  const targetDate = watch('targetDate')
  const period = watch('period')
  const selectedSlot = watch('selectedSlot')

  const periodObj = ALL_PERIODS.find((p) => p.id === period)

  const { slots, message, loading, error } = useSmartBookingSlots({
    shop_id: shopId,
    staff_id: staffId,
    service_id: serviceId,
    target_date: targetDate,
    time_preference: {
      period,
      from: periodObj?.startTime,
      to: periodObj?.endTime,
      start_time: periodObj?.startTime,
      end_time: periodObj?.endTime,
    },
    p_period_start_time: periodObj?.startTime,
    p_period_end_time: periodObj?.endTime,
  })

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + (m || 0)
  }

  const filteredSlots = useMemo(() => {
    let result = slots
    if (periodObj) {
      const startMinutes = periodObj.startHour * 60
      const endMinutes = periodObj.endHour * 60
      result = slots.filter((slot) => {
        const slotStartMinutes = timeToMinutes(slot.display_start_time)
        return slotStartMinutes >= startMinutes && slotStartMinutes < endMinutes
      })
    }
    return [...result].sort((a, b) => timeToMinutes(a.display_start_time) - timeToMinutes(b.display_start_time))
  }, [slots, periodObj])

  const handleSelect = (slot: any) => {
    setValue('selectedSlot', {
      actual_start_time: slot.actual_start_time,
      actual_end_time: slot.actual_end_time,
      display_start_time: slot.display_start_time,
    }, { shouldValidate: true })
    
    setTimeout(() => {
      onNext()
    }, 150)
  }

  // Format time (e.g., "14:30" to "02:30 م")
  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':')
      const d = new Date()
      d.setHours(parseInt(hours, 10))
      d.setMinutes(parseInt(minutes, 10))
      return d.toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit', hour12: true })
    } catch {
      return timeStr
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full pb-[90px]">
        <div className="flex flex-col items-center justify-center mb-6 mt-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium text-slate-500">جاري البحث عن مواعيد متاحة...</p>
        </div>
        <div className="grid gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-rose-500 bg-rose-50 rounded-2xl border border-rose-100 p-6 text-center">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-bold">حدث خطأ أثناء البحث</p>
        <p className="text-xs">{error.message}</p>
        <Button variant="outline" size="sm" onClick={onBack} className="mt-2">
          العودة والمحاولة مجدداً
        </Button>
      </div>
    )
  }

  if (filteredSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 p-6 text-center">
        <Clock className="w-8 h-8 text-slate-300" />
        <p className="text-sm font-bold text-slate-700">لا توجد مواعيد متاحة في هذه الفترة</p>
        <p className="text-xs text-slate-500">{message || 'يرجى اختيار فترة أخرى او يوم آخر.'}</p>
        <Button variant="outline" size="sm" onClick={onBack} className="mt-4">
          اختيار فترة أخرى
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full pb-[90px]">
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-600 bg-slate-100 inline-block px-3 py-1 rounded-full">
          {message || 'المواعيد المقترحة'}
        </p>
      </div>
      <div className="grid gap-3">
        {filteredSlots.map((slot, index) => {
          const isSelected = selectedSlot?.actual_start_time === slot.actual_start_time
          
          return (
            <button
              key={`${slot.actual_start_time}-${index}`}
              type="button"
              onClick={() => handleSelect(slot)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border text-right transition-all",
                isSelected 
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                  : "border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50"
              )}
            >
              <div className={cn(
                "w-12 h-12 shrink-0 rounded-xl flex items-center justify-center",
                isSelected ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
              )}>
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className={cn(
                  "font-bold text-base",
                  isSelected ? "text-primary" : "text-slate-900"
                )}>
                  {formatTime(slot.display_start_time)}
                </h4>
                {slot.reason && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{slot.reason}</p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
