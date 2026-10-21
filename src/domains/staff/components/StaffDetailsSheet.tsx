'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { Phone, MapPin, CalendarClock, ArrowLeftRight, Scissors, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { StaffCardDto } from '../dto/staff.dto'
import { WorkingScheduleSheet } from './WorkingScheduleSheet'
import { TransferBarberSheet } from './TransferBarberSheet'

interface StaffDetailsSheetProps {
  staff: StaffCardDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StaffDetailsSheet({ staff, open, onOpenChange }: StaffDetailsSheetProps) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  return (
    <>

      <AnimatePresence>
      {open && staff && (
        <>
          {/* الخلفية المظللة */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          
          {/* الكارد اللي هيطلع من تحت لفوق */}
          <div className="fixed inset-0 z-50 flex justify-center items-end pointer-events-none sm:items-center sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full sm:max-w-md bg-background rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col max-h-[90dvh] sm:max-h-[85dvh]"
              dir="rtl"
            >
              {/* شريط السحب للموبايل */}
              <div className="flex justify-center pt-4 pb-2 sm:hidden cursor-grab active:cursor-grabbing">
                <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
              </div>
              
              {/* الهيدر */}
              <div className="flex justify-between items-center px-6 pt-2 pb-4 sm:pt-6">
                <h2 className="text-xl font-bold">تفاصيل الموظف</h2>
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={() => onOpenChange(false)} 
                  className="rounded-full bg-muted/50 hover:bg-muted h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* المحتوى */}
              <div className="overflow-y-auto px-6 pb-[90px] no-scrollbar">
                <div className="flex flex-col items-center mt-2 mb-8">
                  <Avatar className="h-24 w-24 border-4 border-muted mb-4 shadow-sm">
                    <AvatarImage src={staff.avatarUrl || undefined} alt={staff.name} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                      {staff.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-foreground">{staff.name}</h2>
                  <Badge variant={staff.isActive ? 'default' : 'secondary'} className="mt-2 rounded-full px-3 shadow-none">
                    {staff.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="bg-background p-2 rounded-lg shadow-sm border border-border">
                        <Scissors className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">الدور (Role)</p>
                        <p className="text-sm font-medium">{staff.role === 'barber' ? 'حلاق' : staff.role}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-background p-2 rounded-lg shadow-sm border border-border">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                        <p className="text-sm font-medium" dir="ltr">{staff.phone || 'غير متوفر'}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                      <div className="bg-background p-2 rounded-lg shadow-sm border border-border">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">الفرع الحالي</p>
                        <p className="text-sm font-medium">{staff.shopName || 'فرع رئيسي'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground mb-3">الإجراءات</h3>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 h-12 rounded-xl"
                      onClick={() => setIsScheduleOpen(true)}
                    >
                      <CalendarClock className="h-5 w-5 text-muted-foreground" />
                      <span>جدول العمل (Working Schedule)</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 h-12 rounded-xl"
                      onClick={() => setIsTransferOpen(true)}
                    >
                      <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
                      <span>نقل الموظف لفرع آخر (Transfer)</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
      <WorkingScheduleSheet
        staffId={staff?.id || ''}
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
      />
      <TransferBarberSheet
        staffId={staff?.id || ''}
        currentShopId={staff?.shopId || ''}
        currentShopName={staff?.shopName || null}
        open={isTransferOpen}
        onOpenChange={setIsTransferOpen}
      />
    </>
  )
}
