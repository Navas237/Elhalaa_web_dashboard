import { Sunrise, Sun, Sunset, Moon } from 'lucide-react'

export type PeriodId = 'morning' | 'afternoon' | 'evening' | 'night'

export interface PeriodItem {
  id: PeriodId
  label: string
  time: string
  icon: any
  startHour: number
  endHour: number
  startTime: string
  endTime: string
}

export const ALL_PERIODS: readonly PeriodItem[] = [
  { id: 'morning', label: 'الصباح', time: '6 ص - 12 م', icon: Sunrise, startHour: 6, endHour: 12, startTime: '06:00:00', endTime: '12:00:00' },
  { id: 'afternoon', label: 'الظهر', time: '12 م - 3 م', icon: Sun, startHour: 12, endHour: 15, startTime: '12:00:00', endTime: '15:00:00' },
  { id: 'evening', label: 'العصر', time: '3 م - 6 م', icon: Sunset, startHour: 15, endHour: 18, startTime: '15:00:00', endTime: '18:00:00' },
  { id: 'night', label: 'المساء', time: '6 م - 12 ص', icon: Moon, startHour: 18, endHour: 24, startTime: '18:00:00', endTime: '23:59:59' },
] as const

/**
 * تحويل نص الوقت (مثال "10:00" أو "10:00:00") إلى ساعات عشرية (0 إلى 24)
 */
export function parseTimeToHours(timeStr?: string | null): number | null {
  if (!timeStr) return null
  const parts = timeStr.split(':')
  if (parts.length < 2) return null
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  if (isNaN(hours) || isNaN(minutes)) return null
  return hours + minutes / 60
}

interface FilterPeriodsParams {
  openingTime?: string | null
  closingTime?: string | null
  targetDate?: string | null
}

/**
 * فلترة الفترات حسب مواعيد عمل الفرع والوقت الحالي (إذا كان اليوم هو النهاردة)
 */
export function getFilteredPeriods({
  openingTime,
  closingTime,
  targetDate,
}: FilterPeriodsParams): PeriodItem[] {
  let periods = [...ALL_PERIODS]

  // 1. الفلترة حسب مواعيد الفرع (ساعات العمل والفتح والإغلاق)
  const shopOpen = parseTimeToHours(openingTime)
  let shopClose = parseTimeToHours(closingTime)

  if (shopOpen !== null && shopClose !== null) {
    const finalShopClose = shopClose <= shopOpen ? (shopClose === 0 ? 24 : shopClose + 24) : shopClose

    periods = periods.filter((period) => {
      // هل الفترة تتقاطع مع مواعيد عمل المحل؟
      return period.endHour > shopOpen && period.startHour < finalShopClose
    })
  }

  // 2. الفلترة حسب الوقت الحالي إذا كان التاريخ المحدد هو اليوم الحالي
  if (targetDate) {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    if (targetDate === todayStr) {
      const currentHour = now.getHours() + now.getMinutes() / 60

      periods = periods.filter((period) => {
        // إخفاء الفترات المنتهية بالنسبة للوقت الحالي
        return period.endHour > currentHour
      })
    }
  }

  return periods
}
