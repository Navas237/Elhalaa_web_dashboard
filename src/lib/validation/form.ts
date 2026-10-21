import { z } from "zod";

export const FormSchema = z.object({
    email: z.string()
      .min(1, { message: "البريد الإلكتروني مطلوب" })
      .email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
    password: z.string()
      .min(1, { message: "كلمة المرور مطلوبة" })
      .min(6, { message: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل" }),
})

export type FormSchemaType = z.infer<typeof FormSchema>;

export const addBarberSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يحتوي على حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().min(8, 'رقم الهاتف يجب أن يحتوي على 8 أرقام على الأقل'),
  password: z.string().min(6, 'كلمة المرور يجب أن تتكون من 6 رموز على الأقل'),
  shop_id: z.string().min(1, 'يرجى اختيار الفرع'),
})

export type AddBarberFormValues = z.infer<typeof addBarberSchema>;

export const workingDaySchema = z.object({
  id: z.string(),
  dayOfWeek: z.number(),
  enabled: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
}).refine((data) => {
  if (!data.enabled) return true;
  return data.startTime < data.endTime;
}, {
  message: "وقت البدء يجب أن يكون قبل وقت الانتهاء",
  path: ["startTime"],
});

export const workingScheduleSchema = z.object({
  schedule: z.array(workingDaySchema)
});

export type WorkingScheduleFormValues = z.infer<typeof workingScheduleSchema>;