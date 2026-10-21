import { useQuery } from '@tanstack/react-query'
import { getWorkingHours } from '@/domains/staff/services/working-hours.service'
import { bookingKeys } from '../query-keys'
import { WorkingDayDto } from '@/domains/staff/dto/working-hours.dto'

export interface AvailableBookingDay {
  date: Date
  isoDate: string
  label: string
  dayName: string
  dayNumber: number
}

export function buildAvailableBookingDays(
  patternData: WorkingDayDto[],
  daysAhead = 14
): AvailableBookingDay[] {
  // Step 2 – Resolve effective schedule per weekday
  const pattern = new Map<number, { isOff: boolean; startTime: string; endTime: string }>()

  // Initialize with empty defaults just in case
  for (let i = 0; i < 7; i++) {
    pattern.set(i, { isOff: true, startTime: '', endTime: '' })
  }

  // Apply staff-specific schedule
  for (const row of patternData) {
    pattern.set(row.dayOfWeek, { isOff: !row.enabled, startTime: row.startTime, endTime: row.endTime })
  }

  // Step 3 – Generate the visible day list
  const result: AvailableBookingDay[] = []
  const today = new Date()

  for (let i = 0; i <= daysAhead; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const weekday = date.getDay() // 0 = Sunday, 6 = Saturday (Matches DB)

    const dayConfig = pattern.get(weekday)
    if (!dayConfig || dayConfig.isOff) {
      continue
    }

    const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    let label = ''
    if (i === 0) {
      label = 'اليوم'
    } else if (i === 1) {
      label = 'غداً'
    } else {
      label = date.toLocaleDateString('ar-EG', { weekday: 'long' })
    }

    result.push({
      date,
      isoDate,
      label,
      dayName: date.toLocaleDateString('ar-EG', { weekday: 'short' }),
      dayNumber: date.getDate(),
    })
  }

  return result
}

export function useAvailableBookingDays(shopId: string, staffId: string) {
  return useQuery({
    queryKey: bookingKeys.availableDays(shopId, staffId),
    queryFn: async () => {
      const data = await getWorkingHours(staffId)
      return buildAvailableBookingDays(data)
    },
    enabled: !!shopId && !!staffId,
  })
}
