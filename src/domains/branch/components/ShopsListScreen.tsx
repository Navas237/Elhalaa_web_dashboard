'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Plus, Store, AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { useOwnerShops } from '../hooks/useShops'
import { ShopCard } from './ShopCard'
import { ShopCardSkeleton } from './ShopCardSkeleton'
import type { Shop, ShopStatus } from '../types'

interface ShopsListScreenProps {
  ownerId: string
  onShopPress: (shopId: string) => void
  onAddShop: () => void
}

type TabValue = 'all' | ShopStatus

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function ShopsListScreen({
  ownerId,
  onShopPress,
  onAddShop,
}: ShopsListScreenProps) {
  const { shops, loading, error, refetch } = useOwnerShops(ownerId)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabValue>('all')

  // فلترة محلية على البيانات المخزّنة فقط — بدون أي طلبات جديدة
  const filteredShops = useMemo(() => {
    let result = shops

    if (activeTab !== 'all') {
      result = result.filter((shop: Shop) => shop.status === activeTab)
    }

    const query = searchQuery.trim().toLowerCase()
    if (query) {
      result = result.filter((shop: Shop) => {
        const nameMatch = shop.name.toLowerCase().includes(query)
        const addressMatch = shop.address?.toLowerCase().includes(query) ?? false
        return nameMatch || addressMatch
      })
    }

    return result
  }, [shops, activeTab, searchQuery])

  const renderContent = () => {
    if (error) {
      return (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          dir="rtl"
        >
          <div className="bg-error-light p-3 rounded-full mb-4">
            <AlertCircle className="h-7 w-7 text-error" />
          </div>
          <p className="font-medium text-error mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => refetch?.()}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>إعادة المحاولة</span>
          </Button>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ShopCardSkeleton key={i} />
          ))}
        </div>
      )
    }

    if (shops.length === 0) {
      return (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          dir="rtl"
        >
          <div className="bg-muted p-4 rounded-full mb-4">
            <Store className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-1">لا توجد فروع</h3>
          <p className="text-sm text-muted-foreground max-w-[250px]">
            لم تقم بإضافة أي فرع بعد. ابدأ بإضافة أول فرع لك.
          </p>
        </div>
      )
    }

    if (filteredShops.length === 0) {
      return (
        <div
          className="text-center py-12 text-muted-foreground"
          dir="rtl"
        >
          لا توجد فروع تطابق بحثك أو الفلتر الحالي
        </div>
      )
    }

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredShops.map((shop: Shop) => (
            <motion.div key={shop.id} variants={itemVariants} layout>
              <ShopCard shop={shop} onPress={onShopPress} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الفروع</h1>
          <p className="text-sm text-muted-foreground">
            إدارة فروعك ومتابعة حالتها
          </p>
        </div>
        <Button onClick={onAddShop} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span>إضافة فرع</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="ابحث عن فرع..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 pr-11 rounded-2xl bg-card border-border focus-visible:ring-ring/30"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/70 pointer-events-none" />
      </div>

      {/* Filter Tabs */}
      {/* <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">الكل</TabsTrigger>
          <TabsTrigger value="open" className="flex-1">مفتوح</TabsTrigger>
          <TabsTrigger value="closed" className="flex-1">مغلق</TabsTrigger>
          <TabsTrigger value="maintenance" className="flex-1">صيانة</TabsTrigger>
        </TabsList>
      </Tabs> */}

      {/* Content */}
      {renderContent()}
    </div>
  )
}
