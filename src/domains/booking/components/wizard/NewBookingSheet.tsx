'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CalendarPlus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { BookingWizard } from './BookingWizard'
import { useState, useEffect } from 'react'

interface NewBookingSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedShopId?: string
  preselectedStaffId?: string
}

export function NewBookingSheet({ open, onOpenChange, preselectedShopId, preselectedStaffId }: NewBookingSheetProps) {
  // Key to reset wizard when sheet closes
  const [wizardKey, setWizardKey] = useState(0)

  useEffect(() => {
    if (!open) {
      // Reset wizard state a bit after closing so the animation finishes first
      const timeout = setTimeout(() => setWizardKey(k => k + 1), 300)
      return () => clearTimeout(timeout)
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Animated Card from Bottom */}
          <div className="fixed inset-0 z-50 flex justify-center items-end pointer-events-none sm:items-center sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full sm:max-w-md bg-background rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col h-[90dvh] sm:max-h-[85dvh]"
              dir="rtl"
            >
              {/* Mobile drag handle */}
              <div className="flex justify-center pt-4 pb-2 sm:hidden cursor-grab active:cursor-grabbing">
                <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
              </div>

              {/* Header */}
              <div className="flex justify-between items-center px-6 pt-2 pb-4 sm:pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <CalendarPlus className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold">حجز جديد</h2>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full bg-muted/50 hover:bg-muted h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Wizard Content */}
              <div className="flex-1 overflow-hidden relative">
                <BookingWizard key={wizardKey} onClose={() => onOpenChange(false)} preselectedShopId={preselectedShopId} preselectedStaffId={preselectedStaffId} />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
