import { useState, useMemo } from 'react'
import type { BookingCardDto } from '../dto/booking.dto'
import type { AdvancedFilters, FilterOption } from '../typys/booking.types'

export function useBookingsFilter(
  bookings: BookingCardDto[] | undefined, 
  serverCounts?: Record<FilterOption, number>,
  filters?: AdvancedFilters,
  searchQuery?: string
) {

  // Extract unique filters
  const { uniqueShops, uniqueBarbers } = useMemo(() => {
    if (!bookings) return { uniqueShops: [], uniqueBarbers: [] }
    const shops = new Set<string>()
    const barbers = new Set<string>()
    bookings.forEach(b => {
      if (b.shopName) shops.add(b.shopName)
      if (b.barberName) barbers.add(b.barberName)
    })
    return { 
      uniqueShops: Array.from(shops), 
      uniqueBarbers: Array.from(barbers) 
    }
  }, [bookings])

  const filteredBookings = useMemo(() => {
    if (!bookings) return []
    let result = bookings

    if (filters?.status && filters.status !== 'all') {
      result = result.filter(b => b.status === filters.status)
    }
    if (filters?.shopName) {
      result = result.filter(b => b.shopName === filters.shopName)
    }
    if (filters?.barberName) {
      result = result.filter(b => b.barberName === filters.barberName)
    }
    if (filters?.date) {
      result = result.filter(b => b.bookingDate === filters.date)
    }

    if (searchQuery?.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(b => 
        b.customerName.toLowerCase().includes(q) || 
        b.barberName.toLowerCase().includes(q) ||
        (b.customerPhone && b.customerPhone.includes(q))
      )
    }

    // Sort by displayStartTime descending
    return result.sort((a, b) => new Date(b.displayStartTime).getTime() - new Date(a.displayStartTime).getTime())
  }, [bookings, filters, searchQuery])

  const counts = useMemo(() => {
    if (serverCounts) return serverCounts
    if (!bookings) return undefined
    return {
      all: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      waiting_time: bookings.filter(b => b.status === 'waiting_time').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    } as Record<FilterOption, number>
  }, [bookings, serverCounts])

  return {
    uniqueShops,
    uniqueBarbers,
    filteredBookings,
    counts
  }
}
