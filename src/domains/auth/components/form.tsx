'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from "@/shared/components/ui/button"
import { useAuth } from "@/domains/auth/hooks/useAuth"
import { FormSchema, FormSchemaType } from "@/lib/validation/form"
import { FormInput } from "@/shared/components/ui/form-input"

export function Form() {
  const { login, loading, error: authError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: FormSchemaType) {
    await login(data)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        
        <FormInput
          label="البريد الإلكتروني"
          type="email"
          dir="ltr"
          placeholder="name@example.com"
          icon={<Mail className="h-5 w-5" />}
          className="text-left"
          disabled={loading}
          error={errors.email?.message}
          {...register('email')}
        />

        <FormInput
          label="كلمة المرور"
          type="password"
          dir="ltr"
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          className="text-left"
          disabled={loading}
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Auth Error Message */}
        {authError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">{authError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-base font-medium transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>جاري الدخول...</span>
            </>
          ) : (
            <span>تسجيل الدخول</span>
          )}
        </Button>

      </form>
    </div>
  )
}