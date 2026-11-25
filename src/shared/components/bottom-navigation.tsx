'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, Users, Scissors, Settings, Clock } from 'lucide-react'
import { useAuth } from '@/domains/auth/hooks/useAuth'

export function BottomNavigation() {
  const pathname = usePathname()
  
  // نجلب بيانات المستخدم من الهوك كما طلبت
  const { user, isInitializing } = useAuth()
  
  // نحدد ما إذا كان المستخدم الحالي مالكاً (owner)
  const isOwner = user?.role === 'owner' || user?.role === 'manager'
  const isBarber = user?.role === 'barber'

  if (isInitializing) {
    // Stable placeholder with the exact same height so the layout
    // doesn't jump while the user role is being resolved.
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.05)]"
        dir="rtl"
      >
        <nav className="flex justify-around items-center h-16 max-w-md mx-auto px-2" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center w-full h-full space-y-1">
              <div className="w-[22px] h-[22px] rounded-full bg-slate-200 animate-pulse" />
              <div className="w-10 h-2 rounded-full bg-slate-200 animate-pulse" />
            </div>
          ))}
        </nav>
      </div>
    )
  }

  const ownerNavItems = [
    {
      label: 'الرئيسية',
      icon: Home,
      href: '/owner/dashboard',
      show: true // متاح للجميع
    },
    {
      label: 'الحجوزات',
      icon: CalendarDays,
      href: '/owner/bookings',
      show: true // متاح للجميع
    },
    {
      label: 'الحلاقين',
      icon: Users,
      href: '/owner/staff',
      show: isOwner // متاح فقط للمالك
    },
    {
      label: 'إدارة',
      icon: Scissors,
      href: '/owner/shops',
      show: isOwner // متاح فقط للمالك
    },
    {
      label: 'الإعدادات',
      icon: Settings,
      href: '/owner/settings',
      show: true // متاح للجميع
    }
  ]

  const barberNavItems = [
    {
      label: 'مواعيدي',
      icon: CalendarDays,
      href: '/barber/timeline',
      show: true
    },
    {
      label: 'أوقات العمل',
      icon: Clock,
      href: '/barber/working-hours',
      show: true
    },
    {
      label: 'الإعدادات',
      icon: Settings,
      href: '/barber/settings',
      show: true
    }
  ]

  const navItems = isBarber ? barberNavItems : ownerNavItems

  const visibleItems = navItems.filter(item => item.show)

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.05)]" 
      dir="rtl"
    >
      <nav className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {visibleItems.map((item) => {
          const Icon = item.icon
          // نتحقق مما إذا كان المسار الحالي يطابق رابط العنصر
          const isActive = pathname?.startsWith(item.href)

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-100 active:scale-[0.97] ${
                isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon 
                className={`w-[22px] h-[22px] transition-all ${isActive ? 'fill-red-50 stroke-red-500' : 'stroke-slate-500'}`} 
                strokeWidth={isActive ? 2.2 : 2} 
              />
              <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
