'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { LogOut, User, Mail, ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { SalonBrandingSettings } from '@/domains/tenant/components/SalonBrandingSettings'

export default function SettingsPage() {
  const { user, isInitializing, logout } = useAuth()

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-[90px] font-sans" dir="rtl">
      {/* Header Gradient */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-primary-light0 via-primary to-orange-400 rounded-b-[40px] z-0" />
      
      {/* Content */}
      <div className="relative z-10 pt-16 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          {/* Avatar Profile */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.name || 'User'}
                  width={112}
                  height={112}
                  priority
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-slate-300" />
              )}
            </div>
            {/* Status Indicator */}
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {user.name || 'مستخدم جديد'}
          </h2>
          <p className="text-white/80 text-sm font-medium mb-8">
            {user.role === 'owner' ? 'مالك الصالون' : user.role === 'manager' ? 'مدير الصالون' : 'حلاق'}
          </p>
        </motion.div>

        {/* Profile Details Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6 border border-slate-100"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">المعلومات الشخصية</h3>
          
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 mb-0.5">الاسم الكامل</p>
                <p className="text-sm font-semibold text-slate-900">{user.name || '—'}</p>
              </div>
            </div>

            <div className="w-full h-px bg-slate-50" />

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 mb-0.5">البريد الإلكتروني</p>
                <p className="text-sm font-semibold text-slate-900" dir="ltr">{user.email || '—'}</p>
              </div>
            </div>

            <div className="w-full h-px bg-slate-50" />

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 mb-0.5">الصلاحية</p>
                <p className="text-sm font-semibold text-slate-900 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Salon Branding & Home Page Settings */}
        <SalonBrandingSettings ownerId={user.id} />

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            variant="destructive" 
            className="w-full h-14 rounded-2xl text-base font-bold bg-primary-light hover:bg-primary-light text-primary border-0 shadow-none"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 ml-2" />
            تسجيل الخروج
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
