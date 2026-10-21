'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { ShopDetailsScreen } from '@/domains/branch/components/ShopDetailsScreen'
import { Skeleton } from '@/shared/components/ui/skeleton'

export default function ShopDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isInitializing } = useAuth()
  
  const shopId = params.shopId as string

  if (isInitializing || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4 bg-background">
        <Skeleton className="h-full w-full rounded-[2rem]" />
      </div>
    )
  }

  return (
    <ShopDetailsScreen
      shopId={shopId}
      ownerId={user.id}
      onBack={() => router.back()}
    />
  )
}
