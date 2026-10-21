import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { Clock, Phone, User, Scissors, Calendar, MapPin, FileText } from 'lucide-react'
import type { BookingCardDto } from '../../dto/booking.dto'
import type { BookingStatus } from '@/shared/types/database'
import { Badge } from '@/shared/components/ui/badge'
import { useFormatDate } from '@/shared/hooks/use-format-date'

interface BookingDetailsModalProps {
  booking: BookingCardDto | null
  isOpen: boolean
  onClose: () => void
  onManage?: (booking: BookingCardDto) => void
  canManage?: boolean
}

const statusLabels: Record<BookingStatus, string> = {
  pending: "معلق",
  confirmed: "مؤكد",
  waiting_time: "في الانتظار",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر"
}

export function BookingDetailsModal({ booking, isOpen, onClose, onManage, canManage = true }: BookingDetailsModalProps) {
  const { timeString, dateString } = useFormatDate(booking?.bookingDate, booking?.displayStartTime)

  if (!booking) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90dvh] overflow-y-auto px-4 pb-8">
        <SheetHeader className="text-right space-y-0 pb-4 pt-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline">{statusLabels[booking.status]}</Badge>
            <SheetTitle className="text-xl font-bold">{booking.customerName || 'عميل'}</SheetTitle>
          </div>
          <SheetDescription className="text-sm mt-1">
            تفاصيل الحجز
          </SheetDescription>
        </SheetHeader>
        
        <Separator className="my-4" />
        
        <div className="space-y-4 text-right" dir="rtl">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">التاريخ</p>
                <p className="text-sm font-medium">{dateString}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">الوقت و المدة</p>
                <p className="text-sm font-medium">{timeString} ({booking.serviceDuration} دقيقة)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Scissors className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">الخدمة</p>
                <p className="text-sm font-medium">{booking.serviceName || 'غير محدد'}</p>
                <p className="text-xs text-muted-foreground">{booking.servicePrice} ج.م</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">الحلاق</p>
                <p className="text-sm font-medium">{booking.barberName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">رقم الهاتف</p>
              <p className="text-sm font-medium text-left" dir="ltr">{booking.customerPhone || 'لا يوجد'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">الفرع</p>
              <p className="text-sm font-medium">{booking.shopName}</p>
            </div>
          </div>

          {booking.notes && (
            <div className="flex items-start gap-2 bg-muted/30 p-3 rounded-lg mt-2">
              <FileText className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
                <p className="text-sm">{booking.notes}</p>
              </div>
            </div>
          )}

          {onManage && canManage && ['waiting_time', 'pending', 'confirmed'].includes(booking.status) && (
            <Button
              className="w-full h-12 rounded-xl font-semibold mt-2"
              onClick={() => onManage(booking)}
            >
              اتخاذ إجراء (تأكيد / إلغاء)
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
