'use client'

import { useState } from 'react'
import { useCurrentTenant } from '@/domains/tenant/context/tenant-context'
import { createClient } from '@/shared/lib/supabase/client'
import { Scissors, UserCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BarberJoinPage() {
  const tenant = useCurrentTenant()
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!tenant.allow_barber_self_signup) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">التسجيل غير متاح حالياً</h1>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          صالون {tenant.name} لا يقبل طلبات التسجيل الذاتي للحلاقين حالياً. يرجى التواصل مع إدارة الصالون مباشرة.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </Link>
      </div>
    )
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // 1. التسجيل عبر Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: 'barber',
            tenant_id: tenant.id,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('فشل إنشاء الحساب، يرجى المحاولة مرة أخرى')

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2500)
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء إرسال طلب الانضمام')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mb-3">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">انضم كحلاق في {tenant.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            أنشئ حسابك وسجل في طاقم عمل الصالون
          </p>
        </div>

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-bold text-base mb-1">تم إرسال طلبك بنجاح!</h3>
            <p className="text-xs text-emerald-700">
              {tenant.barber_signup_requires_approval
                ? 'حسابك بانتظار موافقة الإدارة. سيتم تحويلك لصفحة الدخول...'
                : 'تم إنشاء حسابك، سيتم تحويلك لصفحة الدخول...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                الاسم بالكامل
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: أحمد محمد"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="barber@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>{loading ? 'جاري التسجيل...' : 'تسجيل الحساب'}</span>
            </button>

            <div className="text-center mt-2">
              <Link href="/login" className="text-xs text-slate-500 hover:text-slate-900">
                لديك حساب بالفعل؟ <span className="font-semibold text-slate-900 underline">سجل دخولك</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
