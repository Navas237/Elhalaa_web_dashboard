'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarClock, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { useCurrentStaffMember } from '@/domains/staff/hooks/useCurrentStaffMember'
import { useWorkingHours } from '@/domains/staff/hooks/use-working-hours'
import { useUpdateWorkingHours } from '@/domains/staff/hooks/use-update-working-hours'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { workingScheduleSchema, type WorkingScheduleFormValues } from '@/lib/validation/form'
import { WorkingDayCard } from '@/domains/staff/components/WorkingDayCard'
import { toast } from 'sonner'

const DAYS_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export default function BarberWorkingHoursPage() {
  const { user } = useAuth()
  const { data: staffMember, isLoading: isStaffLoading } = useCurrentStaffMember(user?.id)
  
  const staffId = staffMember?.id || ''
  
  const { data: schedule, isLoading: isScheduleLoading, isError, refetch } = useWorkingHours(staffId)
  const { mutate: updateSchedule, isPending } = useUpdateWorkingHours()

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

  const onSubmit = (data: WorkingScheduleFormValues) => {
    if (!staffId) return
    updateSchedule({ staffId, schedule: data.schedule }, {
      onSuccess: () => {
        toast.success('تم حفظ أوقات العمل بنجاح')
      },
      onError: (error) => {
        toast.error(error.message || 'حدث خطأ أثناء حفظ أوقات العمل')
      }
    })
  }

  const isLoading = isStaffLoading || isScheduleLoading
  const isEmpty = schedule && schedule.length === 0

  return (
    <div className="min-h-screen bg-slate-50 pb-[90px] font-sans" dir="rtl">
      {/* Header Gradient */}
      <div className="fixed top-0 left-0 right-0 h-48 bg-gradient-to-br from-rose-500 via-primary to-orange-400 rounded-b-[40px] z-0" />
      
      {/* Content */}
      <div className="relative z-10 pt-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <CalendarClock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            أوقات العمل
          </h2>
          <p className="text-white/80 text-sm font-medium text-center px-4">
            قم بإدارة أوقات عملك في الصالون لكي يتمكن العملاء من الحجز.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500">جاري تحميل أوقات العمل...</p>
          </div>
        ) : !staffId ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-destructive">لم يتم العثور على بيانات الموظف الخاصة بك.</p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-destructive">حدث خطأ أثناء تحميل أوقات العمل.</p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RotateCcw className="w-4 h-4" /> إعادة المحاولة
            </Button>
          </div>
        ) : isEmpty ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4 text-center">
            <CalendarClock className="w-12 h-12 text-slate-300" />
            <p className="text-sm font-medium text-slate-900">لا يوجد أوقات عمل</p>
            <p className="text-xs text-slate-500">يبدو أنه لم يتم إعداد أوقات العمل الخاصة بك بعد.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden"
          >
            <form id="schedule-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="p-4 space-y-4">
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
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <Button 
                  type="submit" 
                  disabled={isPending} 
                  className="w-full h-14 rounded-2xl text-base font-bold shadow-md shadow-primary/20"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ التغييرات'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}
