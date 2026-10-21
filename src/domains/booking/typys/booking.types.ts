import type { BookingStatus } from "@/shared/types/database"

export interface OwnerBookingRpc {
  id: string
  client_name: string
  client_phone: string | null
  barber_name: string
  service_name: string
  shop_name: string
  display_start_time: string
  service_price: number
  service_duration: number
  date_of_booking: string
  notes: string | null
  status: BookingStatus
  total_count?: number
  // IDs returned by get_owner_bookings_feed (were dropped before)
  shop_id?: string | null
  staff_id?: string | null
  barber_id?: string | null
  service_id?: string | null
  client_id?: string | null
}

export type FilterOption = 'all' | 'pending' | 'confirmed' | 'waiting_time' | 'completed' | 'cancelled'

export interface AdvancedFilters {
  status: FilterOption
  shopName: string | null
  barberName: string | null
  date: string | null
}