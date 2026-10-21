'use client'

import Image from 'next/image'
import { Card } from '@/shared/components/ui/card'
import { useActiveStaff } from '@/domains/staff/hooks/useStaff'
import { Loader2 } from 'lucide-react'

interface ActiveBarbersProps {
  ownerId: string
}

export function ActiveBarbers({ ownerId }: ActiveBarbersProps) {
  const { staff, loading, error } = useActiveStaff(ownerId)

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3 px-1">
        <h2 className="text-sm font-semibold text-slate-800">الحلاقين دلوقتي</h2>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden p-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-xs text-rose-500 text-center py-4">حدث خطأ في جلب البيانات</p>
        ) : staff.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">لا يوجد حلاقين نشطين حالياً</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {staff.map((barber) => {
              const name = barber.name || 'غير معروف'
              const initial = name.substring(0, 2)
              // Assuming all active staff are available for now since we don't track hourly availability yet
              const isAvailable = true 

              return (
                <div key={barber.id} className="flex flex-col items-center min-w-[60px]">
                  {barber.avatarUrl ? (
                    <Image
                      src={barber.avatarUrl}
                      alt={name}
                      width={48}
                      height={48}
                      loading="lazy"
                      className="w-12 h-12 rounded-full border-2 border-emerald-600 mb-1.5 object-cover transition-transform hover:scale-105 cursor-pointer"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-medium mb-1.5 transition-transform hover:scale-105 cursor-pointer bg-emerald-50 border-emerald-600 text-emerald-700`}>
                      {initial}
                    </div>
                  )}
                  <p className="text-xs font-medium text-slate-800 mb-0.5">{name.split(' ')[0]}</p>
                  <p className="text-[10px] font-medium text-emerald-600">
                    متاح
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

