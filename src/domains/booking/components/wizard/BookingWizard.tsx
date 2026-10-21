'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

import { CustomerStep } from './steps/CustomerStep'
import { BranchStep } from './steps/BranchStep'
import { ServiceStep } from './steps/ServiceStep'
import { BarberStep } from './steps/BarberStep'
import { DateStep } from './steps/DateStep'
import { PeriodStep } from './steps/PeriodStep'
import { TimeStep } from './steps/TimeStep'
import { ReviewStep } from './steps/ReviewStep'

import { bookingWizardSchema, type BookingWizardValues } from '../../schemas/wizard.schema'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { useCurrentStaffMember } from '@/domains/staff/hooks/useCurrentStaffMember'

export type { BookingWizardValues }

const allSteps = [
  { id: 'customer', title: 'بيانات العميل' },
  { id: 'branch', title: 'اختيار الفرع' },
  { id: 'service', title: 'الخدمة' },
  { id: 'barber', title: 'الحلاق' },
  { id: 'date', title: 'اليوم' },
  { id: 'period', title: 'الفترة' },
  { id: 'time', title: 'الوقت' },
  { id: 'review', title: 'المراجعة' },
]

interface BookingWizardProps {
  onClose: () => void
  preselectedShopId?: string
  preselectedStaffId?: string
}

export function BookingWizard({ onClose, preselectedShopId, preselectedStaffId }: BookingWizardProps) {
  const { user } = useAuth()
  const { data: staffMember } = useCurrentStaffMember(user?.id)
  
  const isBarber = user?.role === 'barber'

  const activeSteps = useMemo(() => {
    let steps = allSteps
    if (isBarber || preselectedShopId) {
      steps = steps.filter(s => s.id !== 'branch')
    }
    if (isBarber || preselectedStaffId) {
      steps = steps.filter(s => s.id !== 'barber')
    }
    return steps
  }, [isBarber, preselectedShopId, preselectedStaffId])

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const methods = useForm<BookingWizardValues>({
    resolver: zodResolver(bookingWizardSchema),
    defaultValues: {
      clientName: '',
      clientPhone: '',
      shopId: '',
      serviceId: '',
      staffId: '',
      targetDate: '',
      period: 'morning',
      selectedSlot: null,
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (isBarber && staffMember) {
      methods.setValue('shopId', staffMember.shop_id)
      methods.setValue('staffId', staffMember.id)
    } else {
      if (preselectedShopId) methods.setValue('shopId', preselectedShopId)
      if (preselectedStaffId) methods.setValue('staffId', preselectedStaffId)
    }
  }, [isBarber, staffMember, methods, preselectedShopId, preselectedStaffId])

  const goToNextStep = () => {
    if (currentStep < activeSteps.length - 1) {
      setDirection(1)
      setCurrentStep(s => s + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(s => s - 1)
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  }

  const renderStep = () => {
    const stepId = activeSteps[currentStep].id
    switch (stepId) {
      case 'customer': return <CustomerStep onNext={goToNextStep} />
      case 'branch': return <BranchStep onNext={goToNextStep} />
      case 'service': return <ServiceStep onNext={goToNextStep} />
      case 'barber': return <BarberStep onNext={goToNextStep} />
      case 'date': return <DateStep onNext={goToNextStep} />
      case 'period': return <PeriodStep onNext={goToNextStep} />
      case 'time': return <TimeStep onNext={goToNextStep} onBack={goToPrevStep} />
      case 'review': return <ReviewStep onClose={onClose} />
      default: return null
    }
  }

  const progress = ((currentStep + 1) / activeSteps.length) * 100

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Progress & Header */}
      <div className="px-6 pb-2">
        <div className="flex items-center gap-3 mb-4">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={goToPrevStep}
              className="rounded-full shrink-0"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-700">{activeSteps[currentStep].title}</h3>
            <p className="text-xs text-slate-500 font-medium">الخطوة {currentStep + 1} من {activeSteps.length}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step Content with Framer Motion */}
      <FormProvider {...methods}>
        <div className="flex-1 overflow-x-hidden overflow-y-auto no-scrollbar relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 px-6 py-4"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </FormProvider>
    </div>
  )
}
