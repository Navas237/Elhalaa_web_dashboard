'use client'

import { useFormContext } from 'react-hook-form'
import { CalendarCheck, Loader2, User, Phone, Store, Scissors, Clock } from 'lucide-react'
import { BookingWizardValues } from '../BookingWizard'
import { useCreateBooking } from '@/domains/booking/hooks/useCreateBooking'
import { Button } from '@/shared/components/ui/button'
import { useShopServices } from '@/domains/branch/hooks/useShopServices'
import { useShopStaff } from '@/domains/staff/hooks/useShopStaff'
import { useShop } from '@/domains/branch/hooks/useShops'
import { toast } from 'sonner'

interface ReviewStepProps {
  onClose: () => void
}

export function ReviewStep({ onClose }: ReviewStepProps) {
  const { watch } = useFormContext<BookingWizardValues>()
  const data = watch()

  // Fetch names for display
  const { shop } = useShop(data.shopId)
  const { services } = useShopServices(data.shopId)
  const { staff } = useShopStaff(data.shopId)

  const shopName = shop?.name || '...'
  const serviceName = services?.find(s => s.id === data.serviceId)?.name || '...'
  const staffName = staff?.find(s => s.staffId === data.staffId)?.name || '...'

  const { mutate: createBooking, isPending } = useCreateBooking()

  // Format time (e.g., "14:30" to "02:30 م")
  const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
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

  const handleConfirm = () => {
    if (!data.selectedSlot) return

    createBooking(
      {
        p_shop_id: data.shopId,
        p_staff_id: data.staffId,
        p_client_id: null,
        p_service_id: data.serviceId,
        p_client_name: data.clientName,
        p_client_phone: data.clientPhone,
        p_booking_date: data.targetDate,
        p_start_time: data.selectedSlot.actual_start_time,
        p_end_time: data.selectedSlot.actual_end_time,
        p_display_start_time: data.selectedSlot.display_start_time,
        p_status: 'pending',
        p_payment_method: 'cash',
        p_notes: null,
      },
      {
        onSuccess: () => {
          toast.success('تم إنشاء الحجز بنجاح')
          onClose()
        },
        onError: (error) => {
          toast.error(error.message || 'حدث خطأ أثناء إنشاء الحجز')
        }
      }
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">ملخص الحجز</h3>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold mb-0.5">العميل</p>
                <p className="text-sm font-semibold text-slate-900">{data.clientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold mb-0.5">رقم الهاتف</p>
                <p className="text-sm font-semibold text-slate-900" dir="ltr">{data.clientPhone}</p>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100" />

            <div className="flex items-center gap-3">
              <Store className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold mb-0.5">الفرع</p>
                <p className="text-sm font-semibold text-slate-900">{shopName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Scissors className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold mb-0.5">الخدمة</p>
                <p className="text-sm font-semibold text-slate-900">{serviceName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold mb-0.5">الحلاق</p>
                <p className="text-sm font-semibold text-slate-900">{staffName}</p>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100" />

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold mb-0.5">الموعد</p>
                <p className="text-sm font-semibold text-primary">
                  {new Date(data.targetDate).toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {data.selectedSlot && formatTime(data.selectedSlot.display_start_time)}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="pt-6 pb-[90px]">
        <Button 
          onClick={handleConfirm}
          disabled={isPending || !data.selectedSlot}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              جاري تأكيد الحجز...
            </>
          ) : (
            'تأكيد الحجز'
          )}
        </Button>
      </div>
    </div>
  )
}
