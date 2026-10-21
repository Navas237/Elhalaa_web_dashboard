'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useActiveStaff } from '../hooks/useStaff'
import { StaffCard } from './StaffCard'
import { EmptyState } from './EmptyState'
import { Skeleton } from './Skeleton'
import { StaffDetailsSheet } from './StaffDetailsSheet'
import { Button } from '@/shared/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import type { StaffCardDto } from '../dto/staff.dto'

interface StaffListProps {
  ownerId: string
  searchQuery: string
}

export function StaffList({ ownerId, searchQuery }: StaffListProps) {
  const { staff, loading: isLoading, error, refetch } = useActiveStaff(ownerId)
  
  const [selectedStaff, setSelectedStaff] = useState<StaffCardDto | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleCardClick = (member: StaffCardDto) => {
    setSelectedStaff(member)
    setIsSheetOpen(true)
  }

  // Keep selected staff in sync with the latest fetched data (e.g. after a transfer mutation)
  const activeSelectedStaff = useMemo(() => {
    if (!selectedStaff || !staff) return selectedStaff
    return staff.find(s => s.id === selectedStaff.id) || selectedStaff
  }, [selectedStaff, staff])

  // Local Search Filter
  const filteredStaff = useMemo(() => {
    if (!staff) return []
    if (!searchQuery.trim()) return staff

    const query = searchQuery.toLowerCase().trim()
    return staff.filter((member) => {
      const nameMatch = member.name.toLowerCase().includes(query)
      const phoneMatch = member.phone?.includes(query)
      return nameMatch || phoneMatch
    })
  }, [staff, searchQuery])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" dir="rtl">
        <p className="text-destructive font-medium mb-4">حدث خطأ أثناء تحميل بيانات فريق العمل.</p>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          <span>إعادة المحاولة</span>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return <Skeleton />
  }

  if (!staff || staff.length === 0) {
    return <EmptyState />
  }

  if (filteredStaff.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground" dir="rtl">
        لا توجد نتائج مطابقة للبحث عن "{searchQuery}"
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3" dir="rtl">
        <AnimatePresence mode="popLayout">
          {filteredStaff.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              layout
            >
              <StaffCard staff={member} onClick={handleCardClick} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <StaffDetailsSheet 
        staff={activeSelectedStaff} 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </>
  )
}
