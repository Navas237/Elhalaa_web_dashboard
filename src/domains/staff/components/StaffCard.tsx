import { motion } from 'framer-motion'
import { Card } from '@/shared/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Scissors, Phone, MapPin } from 'lucide-react'
import type { StaffCardDto } from '../dto/staff.dto'

interface StaffCardProps {
  staff: StaffCardDto
  onClick: (staff: StaffCardDto) => void
}

export function StaffCard({ staff, onClick }: StaffCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(staff)}
      className="cursor-pointer"
    >
      <Card className="p-4 overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-shadow relative" dir="rtl">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-muted">
            <AvatarImage src={staff.avatarUrl || undefined} alt={staff.name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {staff.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-lg truncate text-foreground">{staff.name}</h3>
              <Badge variant={staff.isActive ? 'default' : 'secondary'} className="rounded-full text-xs px-2.5 shadow-none shrink-0">
                {staff.isActive ? 'نشط' : 'غير نشط'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <Scissors className="h-3.5 w-3.5" />
                <span>{staff.role === 'barber' ? 'حلاق' : staff.role}</span>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{staff.shopName || 'الفرع'}</span>
              </div>

              {staff.phone && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Phone className="h-3.5 w-3.5" />
                  <span dir="ltr">{staff.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
