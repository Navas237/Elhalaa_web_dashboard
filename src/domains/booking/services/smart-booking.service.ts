import { createClient } from '@/shared/lib/supabase/client'

export interface SmartBookingRequest {
  shop_id: string
  staff_id: string
  service_id: string
  target_date: string // YYYY-MM-DD
  time_preference: {
    period: 'morning' | 'afternoon' | 'evening' | 'night'
    from?: string
    to?: string
    start_time?: string
    end_time?: string
  }
  p_period_start_time?: string
  p_period_end_time?: string
}

export interface SmartBookingSlot {
  display_start_time: string
  actual_start_time: string
  actual_end_time: string
  gap_type: string
  in_preference: boolean
  score: number
  reason: string
}

export interface SmartBookingResponse {
  success: boolean
  error?: string
  message?: string
  staff_results: {
    staff_id: string
    staff_name: string
    is_available: boolean
    total_bookings: number
    recommended_slots: SmartBookingSlot[]
    message: string
  }[]
}

export async function getSmartBookingSlots(params: SmartBookingRequest) {
  const supabase = createClient()
  
  const { data, error } = await supabase.functions.invoke<SmartBookingResponse>(
    'smart-booking-slots',
    {
      body: params,
    }
  )

  if (error) {
    throw new Error(error.message || 'فشل في جلب المواعيد المتاحة')
  }

  if (!data?.success) {
    throw new Error(data?.error || data?.message || 'فشل في جلب المواعيد المتاحة')
  }

  return data
}
