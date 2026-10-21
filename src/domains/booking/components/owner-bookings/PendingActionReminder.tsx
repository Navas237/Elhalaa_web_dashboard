'use client'

import { motion } from 'framer-motion'
import { BellRing, ChevronLeft } from 'lucide-react'

interface PendingActionReminderProps {
  /** حجوزات الانتظار اللي وقت الـ display بتاعها جه أو عدى — النطاق الوحيد للتنبيه */
  dueWaitingCount: number
  onShowWaiting: () => void
}

/**
 * تنبيه داخل الصفحة: يظهر فقط عندما توجد حجوزات "انتظار"
 * وقت الـ display بتاعها جه أو عدى (تحتاج تحديد وقت فوراً).
 * لا يظهر للحجوزات المعلقة ولا للانتظار بدون معاد مستحق.
 */
export function PendingActionReminder({ dueWaitingCount, onShowWaiting }: PendingActionReminderProps) {
  if (dueWaitingCount <= 0) return null

  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onShowWaiting}
      dir="rtl"
      className="w-full flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-right shadow-sm transition active:scale-[0.99]"
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
        <BellRing className="h-5 w-5 text-amber-600" />
        <span className="absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-white">
          {dueWaitingCount}
        </span>
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold text-amber-900">
          {`عندك ${dueWaitingCount} طلبات انتظار معادها جه تحتاج تحديد وقت`}
        </span>
        <span className="block text-xs text-amber-700">اضغط لعرضها واتخاذ إجراء</span>
      </span>
      <ChevronLeft className="h-5 w-5 shrink-0 text-amber-500" />
    </motion.button>
  )
}
