'use client'

import { useCurrentTenant } from '@/domains/tenant/context/tenant-context'
import Link from 'next/link'
import { Scissors, Calendar, UserCheck, LogIn, Sparkles, MapPin } from 'lucide-react'

export default function TenantHomePage() {
  const tenant = useCurrentTenant()

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white font-sans" dir="rtl">
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
            {tenant.branding?.logo_url ? (
              <img
                src={tenant.branding.logo_url}
                alt={tenant.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <Scissors className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{tenant.name}</h1>
            <p className="text-xs text-slate-400">صالون حلاقة رجالي معتمد</p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 transition-colors border border-white/15"
        >
          <LogIn className="w-4 h-4" />
          <span>دخول الفريق</span>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>مرحباً بك في البوابة الإلكترونية لـ {tenant.name}</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
          تجربة حلاقة راقية تليق بك
        </h2>
        <p className="text-slate-300 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
          اختر حلاقك المفضل، حدد الموعد المناسب، واستمتع بأفضل خدمات العناية والمظهر العصري.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-8">
          {/* Card 1: Client Booking */}
          <a
            href={`/client?tenant=${tenant.subdomain}`}
            className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold hover:scale-[1.02] transition-transform shadow-xl shadow-amber-500/25 group cursor-pointer"
          >
            <Calendar className="w-8 h-8 mb-2 group-hover:rotate-6 transition-transform" />
            <span className="text-lg">حجز موعد الآن</span>
            <span className="text-xs font-normal text-slate-900/80 mt-1">
              اختر الفرع والخدمة والموعد
            </span>
          </a>

          {/* Card 2: Barber Join or Staff Login */}
          {tenant.allow_barber_self_signup ? (
            <Link
              href="/join"
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer"
            >
              <UserCheck className="w-8 h-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-bold text-white">انضم كحلاق</span>
              <span className="text-xs text-slate-400 mt-1">
                سجل بياناتك للعمل مع الصالون
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer"
            >
              <LogIn className="w-8 h-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-bold text-white">لوحة الإدارة</span>
              <span className="text-xs text-slate-400 mt-1">
                دخول الأونر والمانجر والحلاقين
              </span>
            </Link>
          )}
        </div>

        {/* Timezone & Info */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>المنطقة الزمنية المعتمدة: {tenant.timezone}</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-white/10">
        © {new Date().getFullYear()} {tenant.name}. جميع الحقوق محفوظة عبر منصة الصالونات الذكية.
      </footer>
    </div>
  )
}
