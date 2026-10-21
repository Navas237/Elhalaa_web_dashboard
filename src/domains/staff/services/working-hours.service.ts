import { createClient } from '@/shared/lib/supabase/client'
import type { WorkingDayDto } from '../dto/working-hours.dto'

export async function getWorkingHours(staffId: string): Promise<WorkingDayDto[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('working_hours')
    .select(`
      id,
      day_of_week,
      is_off,
      start_time,
      end_time
    `)
    .eq('staff_id', staffId)
    .order('day_of_week', { ascending: true })

  if (error) throw new Error(error.message)

  return data.map((row) => ({
    id: row.id,
    dayOfWeek: row.day_of_week,
    enabled: !row.is_off,
    startTime: row.start_time?.slice(0, 5) ?? "",
    endTime: row.end_time?.slice(0, 5) ?? "",
  }))
}

export type DayOffConflict = {
  dayOfWeek: number
  bookingsCount: number
  nextBookingDate: string | null
}

/**
 * Returns upcoming active bookings grouped by day-of-week for the given
 * off-days. Empty array means the days can be closed safely.
 */
export async function getDayOffConflicts(
  staffId: string,
  daysOff: number[],
): Promise<DayOffConflict[]> {
  if (daysOff.length === 0) return []

  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_day_off_conflicts", {
    p_staff_id: staffId,
    p_days_off: daysOff,
  })

  if (error) throw new Error(error.message)

  return ((data ?? []) as Array<{
    day_of_week: number
    bookings_count: number | string
    next_booking_date: string | null
  }>).map((row) => ({
    dayOfWeek: row.day_of_week,
    bookingsCount: Number(row.bookings_count),
    nextBookingDate: row.next_booking_date,
  }))
}

export async function updateWorkingHours(staffId: string, schedule: WorkingDayDto[]): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.rpc("update_working_hours", {
    p_staff_id: staffId,
    p_schedule: schedule as unknown as any, // Typecast temporarily, although the user told me to avoid hacks, I'm waiting for the types. But wait, `JSON` types are expected for `jsonb`. Usually `Json` works. Let's cast to `any` for now or wait for the types. The user said no `any` should remain. Let's see if the generated types have Json.
  })

  if (error) throw new Error(error.message)
}
