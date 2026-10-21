'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CalendarClock, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { useWorkingHours } from '../hooks/use-working-hours'
import { useUpdateWorkingHours } from '../hooks/use-update-working-hours'
import { getDayOffConflicts, type DayOffConflict } from '../services/working-hours.service'
import { DayOffBlockedDialog } from './DayOffBlockedDialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { workingScheduleSchema, type WorkingScheduleFormValues } from '@/lib/validation/form'
import { WorkingDayCard } from './WorkingDayCard'
import { toast } from 'sonner'

const DAYS_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

interface WorkingScheduleSheetProps {
  staffId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkingScheduleSheet({ staffId, open, onOpenChange }: WorkingScheduleSheetProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { data: schedule, isLoading, isError, refetch } = useWorkingHours(staffId)
  const { mutate: updateSchedule, isPending } = useUpdateWorkingHours()
  const [blockers, setBlockers] = useState<DayOffConflict[] | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkingScheduleFormValues>({
    resolver: zodResolver(workingScheduleSchema),
    defaultValues: { schedule: [] }
  })

  // Reset form when data arrives or changes
  useEffect(() => {
    if (schedule && schedule.length > 0) {
      reset({ schedule })
    }
  }, [schedule, reset])

  const onSubmit = async (data: WorkingScheduleFormValues) => {
    const daysOff = data.schedule
      .filter((day) => !day.enabled)
      .map((day) => day.dayOfWeek)

    // Block closing days that still have upcoming bookings until the
    // user cancels them first.
    setIsChecking(true)
    try {
      const conflicts = await getDayOffConflicts(staffId, daysOff)
      if (conflicts.length > 0) {
        setBlockers(conflicts)
        return
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر فحص حجوزات الأيام المغلقة')
      return
    } finally {
      setIsChecking(false)
    }

    updateSchedule({ staffId, schedule: data.schedule }, {
      onSuccess: () => {
        toast.success('تم حفظ جدول العمل بنجاح')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(error.message || 'حدث خطأ أثناء حفظ الجدول')
      }
    })
  }

  function handleViewBookings() {
    setBlockers(null)
    onOpenChange(false)
    router.push(user?.role === 'barber' ? '/barber/timeline' : '/owner/bookings')
  }

  // Handle empty state gracefully
  const isEmpty = schedule && schedule.length === 0

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isPending && onOpenChange(false)}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />
          
          <div className="fixed inset-0 z-[60] flex justify-center items-end pointer-events-none sm:items-center sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full sm:max-w-md bg-background rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col max-h-[90dvh] sm:max-h-[85dvh]"
              dir="rtl"
            >
              <div className="flex justify-center pt-4 pb-2 sm:hidden cursor-grab active:cursor-grabbing">
                <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
              </div>
              
              <div className="flex justify-between items-center px-6 pt-2 pb-4 sm:pt-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold">جدول العمل</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={() => onOpenChange(false)} 
                  disabled={isPending}
                  className="rounded-full bg-muted/50 hover:bg-muted h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-12 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">جاري تحميل جدول العمل...</p>
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center p-12 gap-4 text-center">
                    <p className="text-sm text-destructive">حدث خطأ أثناء تحميل جدول العمل.</p>
                    <Button variant="outline" onClick={() => refetch()} className="gap-2">
                      <RotateCcw className="w-4 h-4" /> إعادة المحاولة
                    </Button>
                  </div>
                ) : isEmpty ? (
                  <div className="flex flex-col items-center justify-center p-12 gap-4 text-center">
                    <CalendarClock className="w-12 h-12 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-foreground">لا يوجد جدول عمل مضاف</p>
                    <p className="text-xs text-muted-foreground">قم بإضافة جدول عمل للموظف من النظام.</p>
                  </div>
                ) : (
                  <form id="schedule-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {schedule?.map((day, index) => (
                      <Controller
                        key={day.id}
                        control={control}
                        name={`schedule.${index}`}
                        render={({ field: { value, onChange } }) => (
                          <WorkingDayCard
                            dayName={DAYS_NAMES[day.dayOfWeek] || 'يوم غير معروف'}
                            enabled={value?.enabled ?? false}
                            startTime={value?.startTime ?? ''}
                            endTime={value?.endTime ?? ''}
                            onEnabledChange={(enabled) => onChange({ ...value, enabled })}
                            onStartTimeChange={(startTime) => onChange({ ...value, startTime })}
                            onEndTimeChange={(endTime) => onChange({ ...value, endTime })}
                            error={errors.schedule?.[index]?.startTime?.message}
                          />
                        )}
                      />
                    ))}
                  </form>
                )}
              </div>

              {/* Footer Actions */}
              {!isLoading && !isError && !isEmpty && (
                <div className="p-6 pt-4 border-t border-border bg-muted/10 sm:rounded-b-[2rem] pb-[90px] flex gap-3">
                  <Button type="submit" form="schedule-form" disabled={isPending || isChecking} className="flex-1 h-12 rounded-xl text-base font-semibold">
                    {isPending || isChecking ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {isChecking ? 'جاري فحص الحجوزات...' : 'جاري الحفظ...'}
                      </>
                    ) : (
                      'حفظ التغييرات'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending || isChecking}
                    onClick={() => onOpenChange(false)}
                    className="flex-1 h-12 rounded-xl text-base font-semibold sm:hidden"
                  >
                    إلغاء
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          <DayOffBlockedDialog
            blockers={blockers}
            onClose={() => setBlockers(null)}
            onViewBookings={handleViewBookings}
          />
        </>
      )}
    </AnimatePresence>
  )
}
