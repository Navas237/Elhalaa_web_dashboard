import type { BlockedTimeRecord } from "../typys/blocked-time.types"

export interface BlockedTimeDto {
  id: string
  shopId: string
  staffId: string
  blockDate: string
  startTime: string
  endTime: string
  reason: string
  reasonLabel: string
  reasonIcon: string
  notes: string | null
  createdAt?: string
}

export const REASON_CONFIG: Record<string, { label: string; icon: string }> = {
  break: { label: 'استراحة قصيرة', icon: '☕' },
  lunch: { label: 'وجبة غداء', icon: '🍽️' },
  prayer: { label: 'صلاة', icon: '🕌' },
  personal: { label: 'ظرف شخصي', icon: '👤' },
  emergency: { label: 'ظرف طارئ', icon: '🚨' },
  other: { label: 'وقت مقفول', icon: '🔒' },
}

export function toBlockedTimeDto(record: BlockedTimeRecord): BlockedTimeDto {
  const config = REASON_CONFIG[record.reason] || REASON_CONFIG.other

  return {
    id: record.id,
    shopId: record.shop_id,
    staffId: record.staff_id,
    blockDate: record.block_date,
    startTime: (record.start_time || '').substring(0, 5),
    endTime: (record.end_time || '').substring(0, 5),
    reason: record.reason || 'break',
    reasonLabel: config.label,
    reasonIcon: config.icon,
    notes: record.notes ?? null,
    createdAt: record.created_at,
  }
}
