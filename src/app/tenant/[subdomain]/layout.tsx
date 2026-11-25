import { notFound } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { TenantProvider } from '@/domains/tenant/context/tenant-context'
import type { Tenant } from '@/domains/tenant/types/tenant.types'
import type { Metadata } from 'next'

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ subdomain: string }>
}

export async function generateMetadata({ params }: TenantLayoutProps): Promise<Metadata> {
  const { subdomain } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, branding')
    .eq('subdomain', subdomain.toLowerCase())
    .eq('is_active', true)
    .maybeSingle()

  if (!tenant) {
    return {
      title: 'الصالون غير موجود',
    }
  }

  return {
    title: `${tenant.name} | منصة الصالونات`,
    description: `لوحة التحكم وحجز المواعيد الخاصة بـ ${tenant.name}`,
  }
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { subdomain } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('subdomain', subdomain.toLowerCase())
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) {
    notFound()
  }

  const tenant = data as unknown as Tenant

  return (
    <TenantProvider tenant={tenant}>
      <div
        className="min-h-screen bg-slate-50 text-slate-900"
        style={
          {
            '--tenant-primary': tenant.branding?.primary_color || '#000000',
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </TenantProvider>
  )
}
