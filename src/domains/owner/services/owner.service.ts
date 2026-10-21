import { createClient } from '@/shared/lib/supabase/client'

// 1. جيب الـ Dashboard Summary
export async function getOwnerDashboardSummary(ownerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('get_owner_dashboard_summary', { p_owner_id: ownerId })
  if (error) throw new Error(error.message)
  return data
}

// 2. جيب كل الفروع
export async function getOwnerShops(ownerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shops_v2')
    .select('id, name, shop_code')
    .eq('owner_id', ownerId)
    
  if (error) throw new Error(error.message)
  return data
}