import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Calendar, CircleDollarSign, Users, Clock } from 'lucide-react'
import type { DashboardSummary } from '../types/Dashboardsummary.typy'
import { AnimatedCounter } from './AnimatedCounter'

interface DashboardStatsProps {
  summary: DashboardSummary
}

export function DashboardStats({ summary }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 mb-6">
      {/* حجوزات اليوم */}
      <Card className="border-slate-200 py-0  h-[100px] shadow-sm rounded-xl overflow-hidden ">
        <CardContent className="p-3 flex flex-col justify-start  h-full ">
          <div className="flex justify-between items-start mb-1.5">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <Calendar className="w-[18px] h-[18px] text-indigo-600" />
            </div>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              اليوم
            </span>
          </div>
          <div>
            <h3 className="text-slate-500 text-[11px] font-medium mb-0.5">حجوزات اليوم</h3>
            <p className="text-xl font-bold text-slate-900">
              <AnimatedCounter value={summary.total_bookings_today} />
            </p>
          </div>
        </CardContent>
      </Card>

      {/* إيراد اليوم */}
      <Card className="border-slate-200 py-0  h-[100px] shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-3 flex flex-col justify-start h-full">
          <div className="flex justify-between items-start mb-1.5">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <CircleDollarSign className="w-[18px] h-[18px] text-emerald-600" />
            </div>
          </div>
          <div>
            <h3 className="text-slate-500 text-[11px] font-medium mb-0.5">إيراد اليوم</h3>
            <p className="text-xl font-bold text-slate-900 flex items-baseline gap-1">
              <AnimatedCounter value={summary.revenue_today} />
              <span className="text-[10px] font-normal text-slate-500">ج.م</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* الحلاقين النشطين */}
      <Card className="border-slate-200  py-0  h-[100px]  shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-3 flex flex-col justify-start h-full">
          <div className="flex justify-between items-start mb-1.5">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Users className="w-[18px] h-[18px] text-blue-600" />
            </div>
            <span className="text-[10px] font-medium text-slate-500">
              إجمالي {summary.total_barbers}
            </span>
          </div>
          <div>
            <h3 className="text-slate-500 text-[11px] font-medium mb-0.5">الحلاقين النشطين</h3>
            <p className="text-xl font-bold text-slate-900">
              <AnimatedCounter value={summary.total_barbers} />
            </p>
          </div>
        </CardContent>
      </Card>

      {/* في الانتظار */}
      <Card className="border-slate-200  py-0  h-[100px]  shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-3 flex flex-col justify-start h-full">
          <div className="flex justify-between items-start mb-1.5">
            <div className="p-1.5 bg-orange-50 rounded-lg">
              <Clock className="w-[18px] h-[18px] text-orange-600" />
            </div>
          </div>
          <div>
            <h3 className="text-slate-500 text-[11px] font-medium mb-0.5">في الانتظار</h3>
            <p className="text-xl font-bold text-slate-900">
              <AnimatedCounter value={summary.pending_bookings} />
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
