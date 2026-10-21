'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarRange, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ShopBookingsTabs, type ShopBookingsTabsProps } from './ShopBookingsTabs'
import type { BookingsTabValue } from './ShopBookingsToolbar'
import { useShopStaff } from '@/domains/staff/hooks/useShopStaff'
import { NewBookingSheet } from '../wizard/NewBookingSheet'

interface ShopBookingsSectionProps {
  shopId: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function ShopBookingsSection({ shopId }: ShopBookingsSectionProps) {
  // الحالة المركزية للفلاتر — لا تكرّر داخل كل تبويب
  const [activeTab, setActiveTab] = useState<BookingsTabValue>('upcoming')
  const [barberId, setBarberId] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState<string | null>(null)
  const [dateTo, setDateTo] = useState<string | null>(null)
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false)

  const { staff, loading: staffLoading } = useShopStaff(shopId)

  function handleTabChange(tab: BookingsTabValue) {
    setActiveTab(tab)
    // عند مغادرة تبويب السابقة نمسح النطاق الزمني حتى لا تتسرب الفلاتر بين التبويبات
    if (tab !== 'past') {
      setDateFrom(null)
      setDateTo(null)
    }
  }

  return (
    <motion.section variants={itemVariants} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-bold text-foreground">الحجوزات</h2>
        </div>
        <Button 
          size="icon" 
          className="rounded-full w-9 h-9 shadow-sm shrink-0 bg-[#E8192C] hover:bg-[#C0102A]"
          onClick={() => setIsNewBookingOpen(true)}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <ShopBookingsTabs
        shopId={shopId}
        staff={staff}
        staffLoading={staffLoading}
        activeTab={activeTab}
        barberId={barberId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onTabChange={handleTabChange}
        onBarberChange={setBarberId}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      <NewBookingSheet 
        open={isNewBookingOpen}
        onOpenChange={setIsNewBookingOpen}
        preselectedShopId={shopId}
        preselectedStaffId={barberId || undefined}
      />
    </motion.section>
  )
}