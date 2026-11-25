'use client'

import { Form } from "@/domains/auth/components/form"
import { useCurrentTenant } from "@/domains/tenant/context/tenant-context"
import { Scissors } from "lucide-react"

export default function TenantLoginPage() {
  const tenant = useCurrentTenant()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 sm:px-6 relative overflow-hidden" dir="rtl">
      {/* Background Decorator */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent -z-10" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl -z-10" />

      {/* Main Content */}
      <div className="w-full max-w-sm mt-[10vh] sm:mt-[12vh]">
        {/* Logo & Welcome */}
        <div className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl flex items-center justify-center mb-5 ring-8 ring-slate-100 transition-transform hover:scale-105">
            {tenant.branding?.logo_url ? (
              <img
                src={tenant.branding.logo_url}
                alt={tenant.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <Scissors className="w-10 h-10 text-amber-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{tenant.name}</h1>
          <p className="text-xs font-medium text-slate-500">
            تسجيل دخول الأونر والحلاقين لإدارة الحجوزات
          </p>
        </div>

        {/* Card for Form */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 relative z-10">
          <Form />
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {tenant.name}. منصة الصالونات
        </div>
      </div>
    </div>
  )
}
