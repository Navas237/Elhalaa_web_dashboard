import type { BookingStatus } from "@/shared/types/database"

/**
 * شكل البيانات الراجعة من RPC get_shop_bookings.
 * يختلف عن OwnerBookingRpc: فيه total_count وبدون shop_name.
 */
export interface ShopBookingRpc {
  id: string
  client_id: string
  client_name: string
  client_phone: string
  barber_id: string
  barber_name: string
  staff_id: string
  service_id: string
  service_name: string
  service_price: number
  service_duration: number
  display_start_time: string
  start_time: string
  end_time: string
  date_of_booking: string
  created_at: string
  notes: string
  status: BookingStatus
  shop_id: string
  user_id: string
  payment_method: string
  total_count: number
}

export interface ShopBookingCardDto {
  id: string
  shopId: string
  customerName: string
  customerPhone: string
  barberId: string
  barberName: string
  serviceId: string
  serviceName: string
  servicePrice: number
  serviceDuration: number
  displayStartTime: string
  startTime?: string | null
  endTime?: string | null
  bookingDate: string
  status: BookingStatus
  notes: string | null
  /** العدد الكلي الناتج من الـ pagination (يظهر في آخر صف) */
  totalCount: number
}

export function toShopBookingCardDto(booking: ShopBookingRpc): ShopBookingCardDto {
  return {
    id: booking.id,
    shopId: booking.shop_id,
    customerName: booking.client_name,
    customerPhone: booking.client_phone,
    barberId: booking.barber_id,
    barberName: booking.barber_name,
    serviceId: booking.service_id,
    serviceName: booking.service_name,
    servicePrice: booking.service_price,
    serviceDuration: booking.service_duration,
    displayStartTime: booking.display_start_time,
    startTime: booking.start_time ?? null,
    endTime: booking.end_time ?? null,
    bookingDate: booking.date_of_booking,
    status: booking.status,
    notes: booking.notes,
    totalCount: booking.total_count,
  }
}
