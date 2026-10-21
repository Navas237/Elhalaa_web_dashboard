'use client'

import { useFormContext } from 'react-hook-form'
import { Users, Loader2 } from 'lucide-react'
import { BookingWizardValues } from '../BookingWizard'
import { useShopStaff } from '@/domains/staff/hooks/useShopStaff'
import { cn } from '@/lib/utils'

interface BarberStepProps {
  onNext: () => void
}

export function BarberStep({ onNext }: BarberStepProps) {
  const { watch, setValue } = useFormContext<BookingWizardValues>()
  const shopId = watch('shopId')
  const selectedStaffId = watch('staffId')

  const { staff, loading } = useShopStaff(shopId)

  const handleSelect = (id: string) => {
    setValue('staffId', id, { shouldValidate: true })
    setValue('selectedSlot', null)
    
    setTimeout(() => {
      onNext()
    }, 150)
  }

  if (!shopId) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
        <p className="text-sm font-medium">الرجاء اختيار الفرع أولاً</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">جاري تحميل الحلاقين...</p>
      </div>
    )
  }

  // Filter active barbers
  const activeBarbers = staff
    ?.filter(s => s.isActive && s.role === 'barber') || []

  if (activeBarbers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
        <Users className="w-8 h-8 text-slate-300" />
        <p className="text-sm font-medium">لا يوجد حلاقين متاحين في هذا الفرع</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full pb-[90px]">
      <div className="grid gap-3">
        {activeBarbers.map((barber) => {
          const isSelected = selectedStaffId === barber.staffId
          
          return (
            <button
              key={barber.staffId}
              type="button"
              onClick={() => handleSelect(barber.staffId)}
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
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className={cn(
                  "font-bold text-base",
                  isSelected ? "text-primary" : "text-slate-900"
                )}>
                  {barber.name}
                </h4>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
