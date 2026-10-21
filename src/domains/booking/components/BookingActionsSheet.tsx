import React, { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { TimeStep } from './wizard/steps/TimeStep'
import { useUpdateBookingStatus } from '../hooks/useUpdateBookingStatus'
import { useAssignBookingTime } from '../hooks/useAssignBookingTime'
import { ShopBookingCardDto } from '../dto/shop-booking.dto'
import type { BookingStatus } from '@/shared/types/database'
import { Check, X, Clock, Play } from 'lucide-react'

interface BookingActionsSheetProps {
  isOpen: boolean
  onClose: () => void
  booking: ShopBookingCardDto | null
  canManage?: boolean
}

export function BookingActionsSheet({ isOpen, onClose, booking, canManage }: BookingActionsSheetProps) {
  const [view, setView] = useState<'actions' | 'assign-time'>('actions')
  const updateStatus = useUpdateBookingStatus(booking?.shopId || '')
  const assignTime = useAssignBookingTime(booking?.shopId || '')
  
  // Set up mock form for TimeStep
  const methods = useForm({
    defaultValues: {
      shopId: booking?.shopId || '',
      staffId: booking?.barberId || '',
      serviceId: booking?.serviceId || '',
      targetDate: booking?.bookingDate || '',
      period: 'morning', // Fallback
      selectedSlot: null as any
    }
  })

  React.useEffect(() => {
    if (booking && isOpen) {
      methods.reset({
        shopId: booking.shopId,
        staffId: booking.barberId,
        serviceId: booking.serviceId,
        targetDate: booking.bookingDate,
        period: 'morning',
        selectedSlot: null
      })
      setView('actions')
    }
  }, [booking, isOpen, methods])

  if (!booking) return null

  const handleUpdateStatus = (status: BookingStatus) => {
    updateStatus.mutate(
      { bookingId: booking.id, status, shopId: booking.shopId },
      {
        onSuccess: () => {
          onClose()
        }
      }
    )
  }

  const handleAssignTime = (slot: any) => {
    assignTime.mutate(
      {
        bookingId: booking.id,
        shopId: booking.shopId,
        params: {
          booking_date: booking.bookingDate,
          start_time: slot.actual_start_time,
          end_time: slot.actual_end_time,
          display_start_time: slot.display_start_time
        }
      },
      {
        onSuccess: () => {
          onClose()
        }
      }
    )
  }

  const hasAssignPrereqs = Boolean(booking.shopId && booking.barberId && booking.serviceId && booking.bookingDate)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[92dvh] flex flex-col overflow-hidden" dir="rtl">
        <SheetHeader className="mb-4 text-right shrink-0">
          <SheetTitle>إدارة الحجز</SheetTitle>
          <SheetDescription>
            {booking.customerName} - {booking.serviceName}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-[calc(1.25rem+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">

        {view === 'actions' && (
          <div className="grid grid-cols-2 gap-3" dir="rtl">
            {canManage ? (
              <>
                {booking.status === 'waiting_time' && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 items-center text-orange-600 border-orange-200 hover:bg-orange-50 transition-all duration-100 active:scale-[0.97]"
                    onClick={() => setView('assign-time')}
                    disabled={!hasAssignPrereqs}
                    title={!hasAssignPrereqs ? 'بيانات الفرع غير مكتملة' : undefined}
                  >
                    <Clock className="w-6 h-6" />
                    <span>تحديد وقت</span>
                  </Button>
                )}

                {booking.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 items-center text-green-600 border-green-200 hover:bg-green-50 transition-all duration-100 active:scale-[0.97]"
                    onClick={() => handleUpdateStatus('confirmed')}
                    disabled={updateStatus.isPending}
                  >
                    <Check className="w-6 h-6" />
                    <span>تأكيد الحجز</span>
                  </Button>
                )}
                
                {booking.status === 'confirmed' && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 items-center text-emerald-600 border-emerald-200 hover:bg-emerald-50 transition-all duration-100 active:scale-[0.97]"
                    onClick={() => handleUpdateStatus('completed')}
                    disabled={updateStatus.isPending}
                  >
                    <Check className="w-6 h-6" />
                    <span>إنهاء الحجز</span>
                  </Button>
                )}

                {['waiting_time', 'pending', 'confirmed'].includes(booking.status) && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 items-center text-red-600 border-red-200 hover:bg-red-50 transition-all duration-100 active:scale-[0.97]"
                    onClick={() => handleUpdateStatus('cancelled')}
                    disabled={updateStatus.isPending}
                  >
                    <X className="w-6 h-6" />
                    <span>إلغاء الحجز</span>
                  </Button>
                )}
                
                {booking.status === 'completed' && (
                  <div className="col-span-2 text-center text-sm text-slate-500 py-4">
                    هذا الحجز مكتمل ولا يمكن تعديله.
                  </div>
                )}
                {booking.status === 'cancelled' && (
                  <div className="col-span-2 text-center text-sm text-slate-500 py-4">
                    هذا الحجز ملغي.
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-2 text-center text-sm text-slate-500 py-4">
                لا تملك صلاحية تعديل هذا الحجز.
              </div>
            )}
          </div>
        )}

        {view === 'assign-time' && (
          <div dir="rtl">
            {!hasAssignPrereqs ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                تعذّر تحديد وقت لهذا الحجز (بيانات الفرع ناقصة). حدّث القائمة وحاول مجدداً.
              </p>
            ) : (
            <FormProvider {...methods}>
              <TimeStep
                onNext={() => {
                  const slot = methods.getValues('selectedSlot')
                  if (slot) {
                    handleAssignTime(slot)
                  }
                }}
                onBack={() => setView('actions')}
              />
            </FormProvider>
            )}
          </div>
        )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
