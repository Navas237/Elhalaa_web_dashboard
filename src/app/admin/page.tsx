import { createClient } from '@/shared/lib/supabase/server'
import { Store, Users, Calendar, CheckCircle2, XCircle, ExternalLink, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. جلب المستأجرين مع عدد فروعهم
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select(`
      id,
      name,
      subdomain,
      timezone,
      is_active,
      allow_barber_self_signup,
      created_at,
      owner:profiles!tenants_owner_id_fkey(id, name, phone)
    `)
    .order('created_at', { ascending: false })

  // Shop URL from the configured root domain (never a hard-coded localhost).
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const scheme = rootDomain.startsWith('localhost') ? 'http' : 'https'

  const totalTenants = tenants?.length || 0
  const activeTenants = tenants?.filter(t => t.is_active).length || 0

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">إدارة الصالونات والمستأجرين</h2>
          <p className="text-sm text-slate-400 mt-1">
            متابعة الاشتراكات والبراندات المسجلة على المنصة
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">إجمالي الصالونات</p>
            <p className="text-2xl font-bold text-white mt-1">{totalTenants}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">الصالونات النشطة</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{activeTenants}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">الصالونات الموقوفة</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{totalTenants - activeTenants}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-100">قائمة الصالونات المسجلة</h3>
          <span className="text-xs text-slate-400 font-mono">
            {totalTenants} Tenants
          </span>
        </div>

        {totalTenants === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">لا يوجد أي صالون مسجل بعد</p>
            <p className="text-xs text-slate-600 mt-1">عند تسجيل أول أونر سيظهر هنا تلقائياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">الصالون</th>
                  <th className="px-5 py-3.5">الـ Subdomain</th>
                  <th className="px-5 py-3.5">مالك الصالون</th>
                  <th className="px-5 py-3.5">التوقيت</th>
                  <th className="px-5 py-3.5">الحالة</th>
                  <th className="px-5 py-3.5">تاريخ الإنشاء</th>
                  <th className="px-5 py-3.5 text-center">معاينة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tenants?.map((tenant: any) => (
                  <tr key={tenant.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-white">
                      {tenant.name}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-amber-400">
                      {tenant.subdomain}.{rootDomain}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {tenant.owner?.name || 'غير محدد'}
                      {tenant.owner?.phone && (
                        <span className="block text-[11px] text-slate-500 font-mono">
                          {tenant.owner.phone}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {tenant.timezone}
                    </td>
                    <td className="px-5 py-4">
                      {tenant.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          موقوف
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                      {new Date(tenant.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <a
                        href={`http://${tenant.subdomain}.{rootDomain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="فتح الصالون"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
