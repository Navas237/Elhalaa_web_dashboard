'use client'

import { useFormContext } from 'react-hook-form'
import { Scissors, Loader2 } from 'lucide-react'
import { BookingWizardValues } from '../BookingWizard'
import { useShopServices } from '@/domains/branch/hooks/useShopServices'
import { cn } from '@/lib/utils'

interface ServiceStepProps {
  onNext: () => void
}

export function ServiceStep({ onNext }: ServiceStepProps) {
  const { watch, setValue } = useFormContext<BookingWizardValues>()
  const shopId = watch('shopId')
  const selectedServiceId = watch('serviceId')

  const { services, loading } = useShopServices(shopId)

  const handleSelect = (id: string) => {
    setValue('serviceId', id, { shouldValidate: true })
    setValue('selectedSlot', null) // invalidate slot
    
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
        <p className="text-sm font-medium">جاري تحميل الخدمات...</p>
      </div>
    )
  }

  // Filter active and sort
  const activeServices = services
    ?.filter(s => s.is_active)
    .sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return (a.display_order || 0) - (b.display_order || 0)
      }
      return a.name.localeCompare(b.name)
    }) || []

  if (activeServices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
        <Scissors className="w-8 h-8 text-slate-300" />
        <p className="text-sm font-medium">لا توجد خدمات متاحة في هذا الفرع</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full pb-[90px]">
      <div className="grid gap-3">
        {activeServices.map((service) => {
          const isSelected = selectedServiceId === service.id
          
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleSelect(service.id)}
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
                <Scissors className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className={cn(
                  "font-bold text-base",
                  isSelected ? "text-primary" : "text-slate-900"
                )}>
                  {service.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-primary">{service.price} جنيه</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-xs text-slate-500">{service.duration_minutes} دقيقة</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
