import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { Shield, LogOut } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'لوحة إدارة المنصة (Super Admin)',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin, name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) {
    // ليس Super Admin — غير مصرح له
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans" dir="rtl">
      {/* Admin Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Super Admin Portal</h1>
            <p className="text-xs text-slate-400">إدارة المستأجرين والمنصة بالكامل</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-200">{profile.name || 'مدير المنصة'}</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              SUPER_ADMIN
            </span>
          </div>

          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  )
}
