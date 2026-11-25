import { createClient } from '@/shared/lib/supabase/client'
import type { Tenant } from '../types/tenant.types'

/**
 * جلب بيانات الـ Tenant عن طريق الـ Subdomain (Client-side)
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('subdomain', subdomain.toLowerCase())
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('Error fetching tenant by subdomain:', error.message)
    throw new Error(error.message)
  }

  return (data as unknown as Tenant) || null
}

/**
 * جلب بيانات الـ Tenant عن طريق الـ ID (Client-side)
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single()

  if (error) {
    console.error('Error fetching tenant by id:', error.message)
    throw new Error(error.message)
  }

  return (data as unknown as Tenant) || null
}

/**
 * جلب بيانات صالون الأونر الحالي
 */
export async function getTenantByOwnerId(ownerId: string): Promise<Tenant | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching tenant by owner_id:', error.message)
    throw new Error(error.message)
  }

  return (data as unknown as Tenant) || null
}

/**
 * تحديث إعدادات وهوية الصالون والموقع
 */
export async function updateTenantBranding(
  tenantId: string,
  updates: {
    name: string
    subdomain?: string
    branding: Partial<Tenant['branding']>
  }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tenants')
    .update({
      name: updates.name,
      ...(updates.subdomain ? { subdomain: updates.subdomain.toLowerCase().trim() } : {}),
      branding: updates.branding,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenantId)
    .select()
    .single()

  if (error) {
    console.error('Error updating tenant branding:', error.message)
    throw new Error(error.message)
  }

  return data as unknown as Tenant
}
