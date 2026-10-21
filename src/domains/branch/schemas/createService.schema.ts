import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z.string().min(2, 'اسم الباقة لازم يكون أكتر من حرفين').max(60),
  description: z.string().max(200, 'الوصف طويل جداً').optional().or(z.literal('')),
  price: z.coerce.number().positive('السعر لازم يكون أكبر من صفر'),
  duration_minutes: z.coerce.number().int().positive('المدة لازم تكون بالدقايق وأكبر من صفر'),
})

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>
