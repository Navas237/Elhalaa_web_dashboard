'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { FormInput } from '@/shared/components/ui/form-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Loader2, X, UserPlus, User, Mail, Phone, Lock, Store, AlertCircle } from 'lucide-react'
import { useCreateBarber } from '../hooks/use-create-barber'
import { useOwnerShops } from '@/domains/owner/hooks/useOwnerShops'
import { BranchSelector } from '@/domains/branch/components/BranchSelector'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { addBarberSchema, AddBarberFormValues } from '@/lib/validation/form'
import { useQueryClient } from '@tanstack/react-query'
import { staffKeys } from '../query-keys'
import { useAuth } from '@/domains/auth/hooks/useAuth'

interface AddBarberSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBarberSheet({ open, onOpenChange }: AddBarberSheetProps) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const ownerId = user?.id || ''

  const { shops, loading: shopsLoading } = useOwnerShops(ownerId)
  const { mutate: createBarber, isPending } = useCreateBarber()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddBarberFormValues>({
    resolver: zodResolver(addBarberSchema),
  })

  useEffect(() => {
    if (open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = (data: AddBarberFormValues) => {
    createBarber(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        shopId: data.shop_id,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          if (ownerId) {
            queryClient.invalidateQueries({
              queryKey: staffKeys.list(ownerId),
            })
          }
        },
        onError: (error) => {
          alert(error.message || 'حدث خطأ أثناء إضافة الموظف')
        },
      }
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isPending && onOpenChange(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Animated Card from Bottom */}
          <div className="fixed inset-0 z-50 flex justify-center items-end pointer-events-none sm:items-center sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full sm:max-w-md bg-background rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col max-h-[90dvh] sm:max-h-[85dvh]"
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
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold">إضافة موظف جديد</h2>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="rounded-full bg-muted/50 hover:bg-muted h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 space-y-5 no-scrollbar">

                  {/* Branch selector */}
                  <Controller
                    name="shop_id"
                    control={control}
                    render={({ field }) => (
                      <BranchSelector
                        value={field.value}
                        onChange={field.onChange}
                        shops={shops}
                        isLoading={shopsLoading}
                        disabled={isPending}
                        error={errors.shop_id?.message}
                        emptyMessage="لا توجد فروع مسجلة لهذا الحساب"
                      />
                    )}
                  />

                  <FormInput
                    label="الاسم الكامل"
                    icon={<User className="h-5 w-5" />}
                    autoComplete="off"
                    {...register('name')}
                    error={errors.name?.message}
                    disabled={isPending}
                    autoFocus
                  />

                  <FormInput
                    label="البريد الإلكتروني"
                    type="email"
                    dir="ltr"
                    icon={<Mail className="h-5 w-5" />}
                    className="text-right"
                    autoComplete="off"
                    {...register('email')}
                    error={errors.email?.message}
                    disabled={isPending}
                  />

                  <FormInput
                    label="رقم الهاتف"
                    type="tel"
                    dir="ltr"
                    icon={<Phone className="h-5 w-5" />}
                    className="text-right"
                    autoComplete="off"
                    {...register('phone')}
                    error={errors.phone?.message}
                    disabled={isPending}
                  />

                  <FormInput
                    label="كلمة المرور"
                    type="password"
                    dir="ltr"
                    icon={<Lock className="h-5 w-5" />}
                    className="text-right"
                    autoComplete="new-password"
                    {...register('password')}
                    error={errors.password?.message}
                    disabled={isPending}
                  />
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-border bg-muted/10 sm:rounded-b-[2rem] pb-[90px] flex gap-3">
                  <Button
                    type="submit"
                    disabled={isPending || shopsLoading || shops.length === 0}
                    className="flex-1 h-12 rounded-xl text-base font-semibold"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        جاري الإضافة...
                      </>
                    ) : (
                      'إضافة الموظف'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => onOpenChange(false)}
                    className="flex-1 h-12 rounded-xl text-base font-semibold sm:hidden"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
