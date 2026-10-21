'use client'

import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'

interface WorkingDayCardProps {
  dayName: string
  enabled: boolean
  startTime: string
  endTime: string
  onEnabledChange: (enabled: boolean) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  error?: string
}

export function WorkingDayCard({
  dayName,
  enabled,
  startTime,
  endTime,
  onEnabledChange,
  onStartTimeChange,
  onEndTimeChange,
  error
}: WorkingDayCardProps) {
  return (
    <div className={`flex flex-col gap-3 p-4 border rounded-xl transition-all duration-200 ${enabled ? 'bg-background shadow-sm border-border' : 'bg-muted/30 border-dashed border-muted-foreground/20'}`}>
      <div className="flex items-center justify-between">
        <Label className={`text-base font-semibold ${enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{dayName}</Label>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">من</Label>
          <input
            type="time"
            disabled={!enabled}
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">إلى</Label>
          <input
            type="time"
            disabled={!enabled}
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive font-medium mt-1">{error}</p>}
    </div>
  )
}
