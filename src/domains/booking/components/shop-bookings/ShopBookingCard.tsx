'use client'

import { motion } from 'framer-motion'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Clock, Scissors, User } from 'lucide-react'
import type { BookingStatus } from '@/shared/types/database'
import type { ShopBookingCardDto } from '../../dto/shop-booking.dto'
import { useFormatDate } from '@/shared/hooks/use-format-date'

import { cn } from '@/lib/utils'

export interface ShopBookingCardProps {
  booking: ShopBookingCardDto
  isServingNow?: boolean
}

// لوحة ألوان حالة الحجز (وفق نظام التصميم)
const statusConfig: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'معلق',
    className: 'bg-primary-light text-primary border-transparent',
  },
  confirmed: {
    label: 'مؤكد',
    className: 'bg-success-light text-success border-transparent',
  },
  waiting_time: {
    label: 'في الانتظار',
    className: 'bg-warning-light text-warning border-transparent',
  },
  completed: {
    label: 'مكتمل',
    className: 'bg-teal-light text-teal-dark border-transparent',
  },
  cancelled: {
    label: 'ملغي',
    className: 'bg-muted text-muted-foreground border-transparent',
  },
  no_show: {
    label: 'لم يحضر',
    className: 'bg-muted text-muted-foreground/70 border-transparent',
  },
}

export function ShopBookingCard({ booking, isServingNow }: ShopBookingCardProps) {
  const status = statusConfig[booking.status]
  const { timeString, dateString } = useFormatDate(booking.bookingDate, booking.displayStartTime)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileTap={{ scale: 0.99 }}
    >
      <Card
        dir="rtl"
        className={cn(
          "p-4 flex flex-col gap-3 shadow-sm bg-card border-border transition-all duration-200",
          isServingNow && "border-emerald-500/50 bg-emerald-500/[0.03] ring-1 ring-emerald-500/20 shadow-md"
        )}
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-primary/5 text-primary text-xs">
                {booking.customerName ? booking.customerName.substring(0, 2) : 'ع'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="font-semibold text-sm text-foreground">
                {booking.customerName || 'عميل'}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                <Scissors className="h-3 w-3" />
                <span className="truncate max-w-[160px]">{booking.serviceName || 'خدمة غير محددة'}</span>
              </div>
            </div>
          </div>
          {isServingNow ? (
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 flex items-center gap-1.5 font-bold px-2.5 py-0.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              يحلق الآن
            </Badge>
          ) : (
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
          <div className="flex items-center gap-1" dir="ltr">
            <Clock className="h-3 w-3" />
            <span>{timeString}</span>
          </div>
          <span className="text-muted-foreground/40">·</span>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[90px]">{booking.barberName || '—'}</span>
          </div>
          <span className="text-muted-foreground/40">·</span>
          <span dir="ltr">{dateString}</span>
        </div>
      </Card>
    </motion.div>
  )
}