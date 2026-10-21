'use client'

import { useFormContext } from 'react-hook-form'
import { Store, Loader2 } from 'lucide-react'
import { BookingWizardValues } from '../BookingWizard'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { useOwnerShops } from '@/domains/owner/hooks/useOwnerShops'
import { cn } from '@/lib/utils'

interface BranchStepProps {
  onNext: () => void
}

export function BranchStep({ onNext }: BranchStepProps) {
  const { user } = useAuth()
  const { shops, loading } = useOwnerShops(user?.id || '')
  
  const { watch, setValue } = useFormContext<BookingWizardValues>()
  const selectedShopId = watch('shopId')

  const handleSelect = (id: string) => {
    setValue('shopId', id, { shouldValidate: true })
    // Automatically reset subsequent dependent fields
    setValue('serviceId', '')
    setValue('staffId', '')
    setValue('selectedSlot', null)
    
    // Auto progress to next step
    setTimeout(() => {
      onNext()
    }, 150)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">جاري تحميل الفروع...</p>
      </div>
    )
  }

  if (!shops || shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
        <Store className="w-8 h-8 text-slate-300" />
        <p className="text-sm font-medium">لا توجد فروع متاحة</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full pb-[90px]">
      <div className="grid gap-3">
        {shops.map((shop) => {
          const isSelected = selectedShopId === shop.id
          
          return (
            <button
              key={shop.id}
              type="button"
              onClick={() => handleSelect(shop.id)}
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
                <Store className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className={cn(
                  "font-bold text-base",
                  isSelected ? "text-primary" : "text-slate-900"
                )}>
                  {shop.name}
                </h4>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
