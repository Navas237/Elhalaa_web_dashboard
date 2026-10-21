'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CalendarClock, Package, Pencil, Check, X, Loader2, Settings2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { ReferencePackageSheet } from './ReferencePackageSheet'
import { useFormatDate } from '@/shared/hooks/use-format-date'
import type { Shop, ShopStatus, UpdateShopInput } from '../types'

const timeSchema = z
  .object({
    opening_time: z.string().min(1, 'وقت الفتح مطلوب'),
    closing_time: z.string().min(1, 'وقت الإغلاق مطلوب'),
  })
  .refine((data) => data.closing_time > data.opening_time, {
    message: 'وقت الإغلاق يجب أن يكون بعد وقت الفتح',
    path: ['closing_time'],
  })

type TimeFormValues = z.infer<typeof timeSchema>

interface ShopSettingsSheetProps {
  shop: Shop
  onUpdate: (input: UpdateShopInput) => void
  isUpdating: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusVisualConfig: Record<ShopStatus, { label: string; className: string }> = {
  open: {
    label: 'مفتوح',
    className: 'bg-success-light text-success border-transparent',
  },
  closed: {
    label: 'مغلق',
    className: 'bg-muted text-muted-foreground border-transparent',
  },
  maintenance: {
    label: 'صيانة',
    className: 'bg-warning-light text-warning border-transparent',
  },
}

const statusSegmented: { value: ShopStatus; label: string }[] = [
  { value: 'open', label: 'مفتوح' },
  { value: 'closed', label: 'مغلق' },
  { value: 'maintenance', label: 'صيانة' },
]

function BookingWindowLabel({ from, to }: { from: string | null; to: string | null }) {
  if (!from && !to) {
    return <span className="text-muted-foreground text-sm">غير محدد</span>
  }
  const fmt = (d: string) => {
    const date = new Date(d)
    return isNaN(date.getTime()) ? d : date.toLocaleDateString('en-GB')
  }
  return (
    <span className="text-sm font-medium" dir="ltr">
      {fmt(from ?? '')} — {fmt(to ?? '')}
    </span>
  )
}

export function ShopSettingsSheet({ shop, onUpdate, isUpdating, open, onOpenChange }: ShopSettingsSheetProps) {
  const [isEditingHours, setIsEditingHours] = useState(false)
  const [isPackageSheetOpen, setIsPackageSheetOpen] = useState(false)
  
  const todayIso = new Date().toISOString()
  const { timeString: openingTimeString } = useFormatDate(todayIso, shop.opening_time || '')
  const { timeString: closingTimeString } = useFormatDate(todayIso, shop.closing_time || '')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TimeFormValues>({
    resolver: zodResolver(timeSchema),
    defaultValues: {
      opening_time: shop.opening_time ?? '',
      closing_time: shop.closing_time ?? '',
    },
  })

  useEffect(() => {
    reset({
      opening_time: shop.opening_time ?? '',
      closing_time: shop.closing_time ?? '',
    })
    setIsEditingHours(false)
  }, [shop.opening_time, shop.closing_time, reset])

  function handleClose() {
    if (isUpdating) return
    onOpenChange(false)
    setIsEditingHours(false)
  }

  // Senior UI-UX: lock body scroll + close on Escape while sheet is open
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isUpdating])

  function onSubmitHours(values: TimeFormValues) {
    onUpdate({ opening_time: values.opening_time, closing_time: values.closing_time })
  }

  function cancelHoursEdit() {
    reset({ opening_time: shop.opening_time ?? '', closing_time: shop.closing_time ?? '' })
    setIsEditingHours(false)
  }

  function handleSelectPackage(serviceId: string) {
    onUpdate({ reference_package_id: serviceId })
    setIsPackageSheetOpen(false)
  }

  const statusVisual = statusVisualConfig[shop.status]
  const isSavingTime = isUpdating && isEditingHours

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          />

          {/* Senior UI-UX: sheet above BottomNavigation (z-50) + safe-area + dynamic height */}
          <div className="fixed inset-0 z-[70] flex justify-center items-end pointer-events-none sm:items-center sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              role="dialog"
              aria-modal="true"
              aria-label="إعدادات الفرع"
              className="w-full sm:max-w-md bg-background rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col min-h-[45dvh] max-h-[92dvh] sm:max-h-[85vh] overflow-hidden"
              dir="rtl"
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden cursor-grab active:cursor-grabbing shrink-0 touch-none select-none">
                <div className="h-1.5 w-12 rounded-full bg-muted-foreground/25" />
              </div>

              {/* Sticky header */}
              <div className="flex justify-between items-center px-5 sm:px-6 pt-2 pb-4 sm:pt-5 border-b border-border shrink-0 sticky top-0 bg-background z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold">إعدادات الفرع</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClose}
                  disabled={isUpdating}
                  className="rounded-full bg-muted/50 hover:bg-muted h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Scrollable body: grows with content, scrolls only when needed on small screens */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 flex flex-col gap-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [scrollbar-color:var(--muted-foreground)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/25 [&::-webkit-scrollbar-track]:bg-transparent">
                {/* Header: status (visual only, no mutation this phase) */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-muted-foreground">حالة الفرع</span>
                    <Badge variant="outline" className={statusVisual.className}>
                      {statusVisual.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="حالة الفرع">
                    {statusSegmented.map((seg) => {
                      const active = shop.status === seg.value
                      return (
                        <span
                          key={seg.value}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                            active
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          {seg.label}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Opening / Closing time */}
                <div className="flex flex-col gap-3 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-5 w-5" />
                      <span className="text-sm font-medium">ساعات العمل</span>
                    </div>
                    {!isEditingHours && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary gap-1"
                        onClick={() => setIsEditingHours(true)}
                        disabled={isUpdating}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        تعديل
                      </Button>
                    )}
                  </div>

                  {!isEditingHours ? (
                    <div className="flex items-center gap-3 text-base mt-1" dir="ltr">
                      <span className="font-semibold">
                        {shop.opening_time ? openingTimeString : '--:--'}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold">
                        {shop.closing_time ? closingTimeString : '--:--'}
                      </span>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmitHours)} className="flex flex-col gap-4 mt-2">
                      <div className="flex items-stretch gap-3 max-[360px]:flex-col max-[360px]:gap-3" dir="ltr">
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <label className="text-sm text-muted-foreground text-right" dir="rtl">
                            الفتح
                          </label>
                          <Input
                            type="time"
                            dir="ltr"
                            className="h-11 min-h-[44px] rounded-xl w-full"
                            disabled={isSavingTime}
                            {...register('opening_time')}
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <label className="text-sm text-muted-foreground text-right" dir="rtl">
                            الإغلاق
                          </label>
                          <Input
                            type="time"
                            dir="ltr"
                            className="h-11 min-h-[44px] rounded-xl w-full"
                            disabled={isSavingTime}
                            {...register('closing_time')}
                          />
                        </div>
                      </div>
                      {errors.closing_time && (
                        <p className="text-sm text-destructive" dir="rtl">
                          {errors.closing_time.message}
                        </p>
                      )}
                      {errors.opening_time && (
                        <p className="text-sm text-destructive" dir="rtl">
                          {errors.opening_time.message}
                        </p>
                      )}
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          className="flex-1 h-10 rounded-xl gap-2 font-medium"
                          disabled={!isDirty || isSavingTime}
                        >
                          {isSavingTime ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          حفظ
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-10 rounded-xl gap-2 font-medium"
                          onClick={cancelHoursEdit}
                          disabled={isSavingTime}
                        >
                          <X className="h-4 w-4" />
                          إلغاء
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Booking window */}
                <div className="flex flex-col gap-3 pb-4 border-b">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="h-5 w-5" />
                    <span className="text-sm font-medium">نافذة استقبال الحجوزات</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <BookingWindowLabel from={shop.booking_start_date} to={shop.booking_end_date} />
                  </div>
                </div>

                {/* Reference package */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-5 w-5" />
                    <span className="text-sm font-medium">الباقة المرجعية</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <span className="text-base font-semibold">
                      {shop.reference_package_id ? 'محددة' : 'غير محددة'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-xl"
                      onClick={() => setIsPackageSheetOpen(true)}
                      disabled={isUpdating}
                    >
                      <Pencil className="h-4 w-4" />
                      تغيير الباقة
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
      
      <ReferencePackageSheet
        open={isPackageSheetOpen}
        onOpenChange={setIsPackageSheetOpen}
        shopId={shop.id}
        currentReferenceId={shop.reference_package_id}
        onSelect={handleSelectPackage}
        isUpdating={isUpdating}
      />
    </AnimatePresence>
  )
}
