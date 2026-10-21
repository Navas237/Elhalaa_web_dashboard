import type { BookingStatus } from "@/shared/types/database"
import type { OwnerBookingRpc } from "../typys/booking.types" 

export interface BookingCardDto {
  id: string
  customerName: string
  customerPhone: string | null
  barberName: string
  serviceName: string
  shopName: string
  displayStartTime: string
  bookingDate: string
  servicePrice: number
  serviceDuration: number
  notes: string | null
  status: BookingStatus
  totalCount?: number
  // IDs needed for actions (confirm/cancel/assign-time)
  shopId: string | null
  barberId: string | null
  staffId: string | null
  serviceId: string | null
}

export function toBookingCardDto(
  booking: OwnerBookingRpc
): BookingCardDto {
  return {
    id: booking.id,
    customerName: booking.client_name,
    customerPhone: booking.client_phone,
    barberName: booking.barber_name,
    serviceName: booking.service_name,
    shopName: booking.shop_name,
    displayStartTime: booking.display_start_time,
    bookingDate: booking.date_of_booking,
    servicePrice: booking.service_price,
    serviceDuration: booking.service_duration,
    notes: booking.notes,
    status: booking.status,
    totalCount: booking.total_count,
    shopId: booking.shop_id ?? null,
    barberId: booking.barber_id ?? booking.staff_id ?? null,
    staffId: booking.staff_id ?? null,
    serviceId: booking.service_id ?? null,
  }
}

/** Adapter: owner DTO -> actions-sheet DTO (assign-time needs ids) */
export function toShopBookingCardDtoFromOwner(booking: BookingCardDto): import('./shop-booking.dto').ShopBookingCardDto {
  return {
    id: booking.id,
    shopId: booking.shopId ?? '',
    customerName: booking.customerName,
    customerPhone: booking.customerPhone ?? '',
    barberId: booking.barberId ?? booking.staffId ?? '',
    barberName: booking.barberName,
    serviceId: booking.serviceId ?? '',
    serviceName: booking.serviceName,
    servicePrice: booking.servicePrice,
    serviceDuration: booking.serviceDuration,
    displayStartTime: booking.displayStartTime,
    startTime: null,
    endTime: null,
    bookingDate: booking.bookingDate,
    status: booking.status,
    notes: booking.notes,
    totalCount: booking.totalCount ?? 0,
  }
}