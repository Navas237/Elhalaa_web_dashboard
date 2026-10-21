'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { User, Phone, Loader2 } from 'lucide-react'
import { FormInput } from '@/shared/components/ui/form-input'
import { Button } from '@/shared/components/ui/button'
import { BookingWizardValues } from '../BookingWizard'
import { useClientByPhone } from '../../../hooks/useClientByPhone'

interface CustomerStepProps {
  onNext: () => void
}

export function CustomerStep({ onNext }: CustomerStepProps) {
  const { register, trigger, setValue, watch, formState: { errors } } = useFormContext<BookingWizardValues>()
  const clientPhone = watch('clientPhone')



console.log(clientPhone);
  
  const { data: clientName, isFetching } = useClientByPhone(clientPhone || '')
  
  useEffect(() => {
    if (clientName) {
      setValue('clientName', clientName, { shouldValidate: true })
    }
  }, [clientName, setValue])

  const handleNext = async () => {
    // Only validate clientName and clientPhone
    const isValid = await trigger(['clientName', 'clientPhone'])
    if (isValid) {
      onNext()
    }
  }



  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
       

        <FormInput
          label="رقم الهاتف"
          type="tel"
          dir="ltr"
          icon={<Phone className="h-5 w-5" />}
          className="text-right"
          autoComplete="off"
          maxLength={11}
          autoFocus
          {...register('clientPhone')}
          error={errors.clientPhone?.message}
          placeholder="01XXXXXXXXX"
        />

         <FormInput
          label="اسم العميل"
          icon={isFetching ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <User className="h-5 w-5" />}
          autoComplete="off"
          {...register('clientName')}
          error={errors.clientName?.message}
        />
      </div>

      <div className="pt-6 pb-[90px]">
        <Button
          onClick={handleNext}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          متابعة
        </Button>
      </div>
    </div>
  )
}
