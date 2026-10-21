import { createClient } from '@/shared/lib/supabase/client'
import type { TransferBarberInput } from '../dto/staff.dto'

export async function transferBarber(dto: TransferBarberInput): Promise<void> {
  const supabase = createClient()
  
  // @ts-ignore - The database types haven't been regenerated yet to include move_barber_to_branch
  const { error } = await supabase.rpc('move_barber_to_branch', {
    p_shop_staff_id: dto.staffId,
    p_new_shop_id: dto.targetShopId,
  })

  if (error) throw new Error(error.message)
}
