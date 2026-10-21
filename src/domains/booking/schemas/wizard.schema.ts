import { z } from 'zod'

const egyptianPhoneSchema = z
  .string()
  .transform((val) => val.replace(/\s+/g, ''))
  .refine((val) => /^01[0125][0-9]{8}$/.test(val), {
    message: 'رقم الموبايل غير صحيح (يجب أن يكون 11 رقم ويبدأ بـ 01)'
  })

export const bookingWizardSchema = z.object({
  clientName: z.string().min(2, 'الاسم مطلوب'),
  clientPhone: egyptianPhoneSchema,
  shopId: z.string().min(1, 'الفرع مطلوب'),
  serviceId: z.string().min(1, 'الخدمة مطلوبة'),
  staffId: z.string().min(1, 'الحلاق مطلوب'),
  targetDate: z.string().min(1, 'التاريخ مطلوب'),
  period: z.enum(['morning', 'afternoon', 'evening', 'night']),
  selectedSlot: z.object({
    actual_start_time: z.string(),
    actual_end_time: z.string(),
    display_start_time: z.string(),
  }).nullable(),
})

export type BookingWizardValues = z.infer<typeof bookingWizardSchema>
