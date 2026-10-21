"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, CalendarX2, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import type { DayOffConflict } from "../services/working-hours.service"

const DAYS_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

interface DayOffBlockedDialogProps {
  blockers: DayOffConflict[] | null
  onClose: () => void
  onViewBookings: () => void
}

export function DayOffBlockedDialog({
  blockers,
  onClose,
  onViewBookings,
}: DayOffBlockedDialogProps) {
  const total = (blockers ?? []).reduce((sum, b) => sum + b.bookingsCount, 0)

  return (
    <AnimatePresence>
      {blockers && blockers.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[70] flex justify-center items-end pointer-events-none sm:items-center sm:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full sm:max-w-md bg-background rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col max-h-[90dvh]"
              dir="rtl"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="day-off-blocked-title"
            >
              <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h2 id="day-off-blocked-title" className="text-lg font-bold">
                    لا يمكن قفل هذه الأيام
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  className="rounded-full bg-muted/50 hover:bg-muted h-8 w-8"
                  aria-label="إغلاق"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  يوجد <span className="font-bold text-foreground">{total}</span>{" "}
                  {total === 1 ? "حجز" : "حجوزات"} قادمة على الأيام اللي بتحاول
                  تقفلها. احذف أو ألغِ الحجوزات دي الأول، وبعدين ارجع احفظ الجدول.
                </p>

                <div className="space-y-2">
                  {blockers.map((b) => (
                    <div
                      key={b.dayOfWeek}
                      className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <CalendarX2 className="h-5 w-5 text-amber-600 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {DAYS_NAMES[b.dayOfWeek] ?? "يوم غير معروف"}
                          </p>
                          {b.nextBookingDate && (
                            <p className="text-xs text-slate-500">
                              أقرب حجز: {b.nextBookingDate}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white">
                        {b.bookingsCount} {b.bookingsCount === 1 ? "حجز" : "حجوزات"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-border flex gap-3">
                <Button
                  type="button"
                  onClick={onViewBookings}
                  className="flex-1 h-12 rounded-xl text-base font-semibold"
                >
                  عرض الحجوزات
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl text-base font-semibold"
                >
                  فهمت، هرجع
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
