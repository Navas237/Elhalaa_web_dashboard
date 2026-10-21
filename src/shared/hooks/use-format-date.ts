import { useMemo } from 'react'

export function useFormatDate(dateStr?: string | null, timeStr?: string | null) {
  return useMemo(() => {
    // Determine the base string to parse
    let parseableString = ''
    if (dateStr && timeStr) {
      // If timeStr doesn't contain date part, combine them
      if (timeStr.includes('T') || timeStr.includes(' ')) {
        parseableString = timeStr
      } else {
        parseableString = `${dateStr}T${timeStr}`
      }
    } else if (dateStr) {
      parseableString = dateStr
    } else if (timeStr) {
      parseableString = timeStr
    }

    if (!parseableString) {
      return {
        timeString: 'غير محدد',
        dateString: 'تاريخ غير محدد',
        isValidDate: false,
      }
    }

    const date = new Date(parseableString)
    const isValidDate = !isNaN(date.getTime())

    // If parsing fails but we have some strings, fallback to raw strings
    let formattedTime = timeStr || 'غير محدد'
    let formattedDate = dateStr || 'تاريخ غير صالح'

    if (isValidDate) {
      formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      formattedDate = date.toLocaleDateString('en-GB')
    }

    return {
      timeString: formattedTime,
      dateString: formattedDate,
      isValidDate,
      date // original parsed Date object if needed
    }
  }, [dateStr, timeStr])
}
