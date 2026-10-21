'use client'

import { useState } from 'react'
import { StaffHeader } from '@/domains/staff/components/StaffHeader'
import { StaffList } from '@/domains/staff/components/StaffList'
import { AddBarberSheet } from '@/domains/staff/components/AddBarberSheet'
import { useAuth } from '@/domains/auth/hooks/useAuth'

export default function StaffPage() {
  const { user, isInitializing } = useAuth()
  const ownerId = user?.id || ''

  const [searchQuery, setSearchQuery] = useState('')
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)

  if (isInitializing) return null

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <StaffHeader
        ownerId={ownerId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddBarberClick={() => setIsAddSheetOpen(true)}
      />
      <StaffList
        ownerId={ownerId}
        searchQuery={searchQuery}
      />
      <AddBarberSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
      />
    </div>
  )
}
