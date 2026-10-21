import { motion } from 'framer-motion'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Clock, User, Scissors, MapPin } from 'lucide-react'
import type { BookingCardDto } from '../../dto/booking.dto'
import type { BookingStatus } from '@/shared/types/database'

import { useFormatDate } from '@/shared/hooks/use-format-date'

interface BookingCardProps {
  booking: BookingCardDto
  onClick: (booking: BookingCardDto) => void
}

const statusColors: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  waiting_time: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  no_show: "bg-red-50 text-red-700 border-red-200"
}

const statusLabels: Record<BookingStatus, string> = {
  pending: "معلق",
  confirmed: "مؤكد",
  waiting_time: "في الانتظار",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر"
}

export function BookingCard({ booking, onClick }: BookingCardProps) {
  const { timeString } = useFormatDate(booking.bookingDate, booking.displayStartTime)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(booking)}
      className="cursor-pointer"
    >
      <Card className="p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow" dir="rtl">
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-primary/5 text-primary text-xs">
                {booking.customerName ? booking.customerName.substring(0, 2) : 'ع'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{booking.customerName || 'عميل'}</h3>
              <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                <Scissors className="h-3 w-3" />
                <span>{booking.serviceName || 'خدمة غير محددة'}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={statusColors[booking.status]}>
            {statusLabels[booking.status]}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md mt-1">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeString}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{booking.barberName}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[80px]">{booking.shopName}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
