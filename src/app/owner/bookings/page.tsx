import { BookingsList } from '@/domains/booking/components/owner-bookings/BookingsList'
import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OwnerBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ bookingId?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = searchParams ? await searchParams : undefined

  return <BookingsList ownerId={user.id} initialBookingId={params?.bookingId ?? null} />
}
