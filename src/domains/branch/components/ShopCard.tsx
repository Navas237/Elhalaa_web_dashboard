'use client'

import { motion } from 'framer-motion'
import { Star, Clock, MapPin, ChevronLeft } from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useFormatDate } from '@/shared/hooks/use-format-date'
import type { Shop, ShopStatus } from '../types'

interface ShopCardProps {
  shop: Shop
  onPress: (shopId: string) => void
}

// تنسيق حالة الفرع — لون الشارة + النص العربي
const statusConfig: Record<ShopStatus, { label: string; className: string }> = {
  open: {
    label: 'مفتوح',
    className: 'bg-success-light text-success border-transparent',
  },
  closed: {
    label: 'مغلق',
    className: 'bg-muted text-secondary-foreground border-transparent',
  },
  maintenance: {
    label: 'صيانة',
    className: 'bg-warning-light text-warning border-transparent',
  },
}

export function ShopCard({ shop, onPress }: ShopCardProps) {
  const status = statusConfig[shop.status]
  const hasRating = shop.rating != null && shop.rating > 0
  const hasHours = !!shop.opening_time || !!shop.closing_time
  
  const todayIso = new Date().toISOString()
  const { timeString: openingTimeString } = useFormatDate(todayIso, shop.opening_time || '')
  const { timeString: closingTimeString } = useFormatDate(todayIso, shop.closing_time || '')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onPress(shop.id)}
      className="cursor-pointer"
    >
      <Card
        dir="rtl"
        className="p-4 gap-2 shadow-sm hover:shadow-md transition-shadow bg-card border-border"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-foreground truncate">
              {shop.name}
            </h3>

            {shop.address && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{shop.address}</span>
              </div>
            )}
          </div>

          {/* RTL: السهم يشير لليسار */}
          <ChevronLeft className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>

          {hasRating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span className="font-medium text-foreground">
                {shop.rating!.toFixed(1)}
              </span>
              {shop.total_reviews != null && shop.total_reviews > 0 && (
                <span className="text-muted-foreground text-xs">
                  ({shop.total_reviews})
                </span>
              )}
            </div>
          )}

          {hasHours && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground" dir="ltr">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {shop.opening_time ? openingTimeString : '--:--'} - {shop.closing_time ? closingTimeString : '--:--'}
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
