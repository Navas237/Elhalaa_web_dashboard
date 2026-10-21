'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Scissors } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import type { ShopStaffMemberDto } from '@/domains/staff/dto/staff.dto'

export type BookingsTabValue = 'upcoming' | 'waiting' | 'past'

interface BookingsToolbarProps {
  staff: ShopStaffMemberDto[]
  staffLoading: boolean
  activeTab: BookingsTabValue
  barberId: string | null
  dateFrom: string | null
  dateTo: string | null
  onBarberChange: (barberId: string | null) => void
  onDateFromChange: (date: string | null) => void
  onDateToChange: (date: string | null) => void
  hideBarberFilter?: boolean
}

function ShopBookingsToolbarImpl({
  staff,
  staffLoading,
  activeTab,
  barberId,
  dateFrom,
  dateTo,
  onBarberChange,
  onDateFromChange,
  onDateToChange,
  hideBarberFilter,
}: BookingsToolbarProps) {
  return (
    <div className="flex flex-col gap-3" dir="rtl">
      {/* Barber chips — horizontal scrollable */}
      {!hideBarberFilter && (
        <div className="flex flex-nowrap overflow-x-auto gap-2 scrollbar-hide px-0.5 items-center">
          <ChipButton
            active={barberId === null}
            onClick={() => onBarberChange(null)}
            disabled={staffLoading && staff.length === 0}
          >
            <Scissors className="h-3.5 w-3.5" />
            <span>الكل</span>
          </ChipButton>

        {staffLoading && staff.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-20 rounded-xl bg-muted animate-pulse flex-shrink-0"
              />
            ))
          : staff.map((member) => (
              <ChipButton
                key={member.userId}
                active={barberId === member.userId}
                onClick={() =>
                  onBarberChange(barberId === member.userId ? null : member.userId)
                }
              >
                <span className="truncate max-w-[90px]">{member.name}</span>
              </ChipButton>
            ))}
        </div>
      )}

      {/* Date range — Past tab only */}
      {activeTab === 'past' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 bg-muted/30 rounded-xl p-2.5">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 flex-1" dir="ltr">
              <div className="flex-1 flex flex-col gap-0.5">
                <label className="text-[10px] text-muted-foreground" dir="rtl">من</label>
                <Input
                  type="date"
                  value={dateFrom ?? ''}
                  onChange={(e) => onDateFromChange(e.target.value || null)}
                  className="h-9 rounded-lg text-sm"
                  dir="ltr"
                />
              </div>
              <span className="text-muted-foreground mt-4">—</span>
              <div className="flex-1 flex flex-col gap-0.5">
                <label className="text-[10px] text-muted-foreground" dir="rtl">إلى</label>
                <Input
                  type="date"
                  value={dateTo ?? ''}
                  onChange={(e) => onDateToChange(e.target.value || null)}
                  className="h-9 rounded-lg text-sm"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function ChipButton({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
        active
          ? 'border-primary bg-primary/5 text-primary shadow-sm'
          : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/70'
      } disabled:opacity-50`}
    >
      {children}
    </motion.button>
  )
}

export const ShopBookingsToolbar = memo(ShopBookingsToolbarImpl)