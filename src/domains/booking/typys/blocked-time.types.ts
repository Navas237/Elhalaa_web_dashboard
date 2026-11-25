export type BlockReason =
  | 'break'
  | 'lunch'
  | 'prayer'
  | 'personal'
  | 'emergency'
  | 'other'

export interface BlockedTimeRecord {
  id: string
  shop_id: string
  staff_id: string
  block_date: string
  start_time: string
  end_time: string
  reason: string
  notes?: string | null
  created_at?: string
  created_by?: string | null
}

export interface CreateBlockedTimeInput {
  shop_id: string
  staff_id: string
  block_date: string
  start_time: string
  end_time: string
  reason: string
  notes?: string | null
}

export interface BookingConflictResult {
  hasConflict: boolean
  conflict?: {
    bookingId: string
    clientName: string
    startTime: string
    endTime: string
    status: string
  } | null
}
