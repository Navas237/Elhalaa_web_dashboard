'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { ShopsListScreen } from '@/domains/branch/components/ShopsListScreen'
import { AddShopSheet } from '@/domains/branch/components/AddShopSheet'

export default function OwnerShopsPage() {
  const router = useRouter()
  const { user, isInitializing } = useAuth()
  const ownerId = user?.id || ''

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)

  if (isInitializing) return null

  return (
    <>
      <ShopsListScreen
        ownerId={ownerId}
        onShopPress={(shopId) => router.push(`/owner/shops/${shopId}`)}
        onAddShop={() => setIsAddSheetOpen(true)}
      />

      <AddShopSheet 
        isOpen={isAddSheetOpen} 
        onClose={() => setIsAddSheetOpen(false)} 
        ownerId={ownerId}
      />
    </>
  )
}
