'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, MapPin, AlertCircle, RefreshCcw, Settings2, ChevronDown, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { useShop, useUpdateShop } from '../hooks/useShops'
import { useShopServices } from '../hooks/useShopServices'
import { useDeleteService } from '../hooks/useDeleteService'
import type { ShopStatus, UpdateShopInput } from '../types'
import type { ShopServiceItem } from '../services/shop.service'
import { ShopSettingsSheet } from './ShopSettingsSheet'
import { AddPackageSheet } from './AddPackageSheet'
import { EditPackageSheet } from './EditPackageSheet'
import { ShopBookingsSection } from '@/domains/booking/components/shop-bookings/ShopBookingsSection'

interface ShopDetailsScreenProps {
  shopId: string
  ownerId: string
  onBack: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const statusVisualConfig: Record<ShopStatus, { label: string; className: string }> = {
  open: {
    label: 'مفتوح',
    className: 'bg-success-light text-success border-transparent',
  },
  closed: {
    label: 'مغلق',
    className: 'bg-muted text-muted-foreground border-transparent',
  },
  maintenance: {
    label: 'صيانة',
    className: 'bg-warning-light text-warning border-transparent',
  },
}

function ShopDetailsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      dir="rtl"
    >
      <div className="bg-destructive/10 p-3 rounded-full mb-4">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <p className="font-medium text-destructive mb-4">{message}</p>
      <Button variant="outline" className="gap-2" onClick={onRetry}>
        <RefreshCcw className="h-4 w-4" />
        <span>إعادة المحاولة</span>
      </Button>
    </div>
  )
}

export function ShopDetailsHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 mb-4">
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  )
}

export function ShopDetailsScreen({ shopId, ownerId, onBack }: ShopDetailsScreenProps) {
  const { shop, loading, error, refetch } = useShop(shopId)
  const updateMutation = useUpdateShop(ownerId, shopId)
  const { services, loading: servicesLoading } = useShopServices(shopId)
  const deleteServiceMutation = useDeleteService(shopId)
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false)
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false)
  const [selectedPackageToEdit, setSelectedPackageToEdit] = useState<ShopServiceItem | null>(null)
  const [packageToDelete, setPackageToDelete] = useState<ShopServiceItem | null>(null)
  const [isPackagesExpanded, setIsPackagesExpanded] = useState(false)

  // الـ hook يتولى invalidateQueries لـ list + detail بعد النجاح — لا reload للصفحة.
  function handleUpdate(input: UpdateShopInput) {
    updateMutation.mutate(input)
  }

  function handleOpenEditPackage(svc: ShopServiceItem) {
    setSelectedPackageToEdit(svc)
    setIsEditPackageOpen(true)
  }

  function handleConfirmDeletePackage() {
    if (!packageToDelete) return
    deleteServiceMutation.mutate(packageToDelete.id, {
      onSuccess: () => {
        setPackageToDelete(null)
      }
    })
  }

  return (
    <div className="flex flex-col p-4 pb-28" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="rounded-full bg-muted/50 hover:bg-muted shrink-0"
          aria-label="رجوع"
        >
          {/* RTL: السهم لليمين يشير للخلف */}
          <ChevronRight className="h-5 w-5" />
        </Button>

        {loading ? (
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3 w-44 rounded-md" />
          </div>
        ) : shop ? (
          <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">{shop.name}</h1>
              {shop.address && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{shop.address}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusVisualConfig[shop.status as ShopStatus]?.className + ' shrink-0'}>
                {statusVisualConfig[shop.status as ShopStatus]?.label}
              </Badge>
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={() => setIsSettingsOpen(true)}
                className="rounded-full bg-muted/50 hover:bg-muted"
              >
                <Settings2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Body */}
      {error ? (
        <ShopDetailsError message={error} onRetry={() => refetch()} />
      ) : loading ? (
        <ShopDetailsHeaderSkeleton />
      ) : !shop ? (
        <ShopDetailsError message="الفرع غير موجود" onRetry={() => refetch()} />
      ) : (
        <>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-5 mt-2">
            
            {/* الباقات Section */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsPackagesExpanded(!isPackagesExpanded)}
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">الباقات</h2>
                  <motion.div
                    animate={{ rotate: isPackagesExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </motion.div>
                </div>
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAddPackageOpen(true)
                  }}
                  className="bg-[#E8192C] hover:bg-[#C0102A] text-white rounded-lg h-9 px-3 font-semibold"
                >
                  + إضافة باقة
                </Button>
              </div>

              <AnimatePresence initial={false}>
                {isPackagesExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2.5 pt-4">
                      {servicesLoading ? (
                        <>
                          <Skeleton className="h-16 w-full rounded-xl" />
                          <Skeleton className="h-16 w-full rounded-xl" />
                        </>
                      ) : services.length > 0 ? (
                        services.map((svc) => (
                          <div key={svc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="flex-1 min-w-0 pr-1">
                              <p className="font-semibold text-gray-900 text-sm truncate">{svc.name}</p>
                              {svc.description && (
                                <p className="text-xs text-gray-500 truncate mt-0.5">{svc.description}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-0.5">{svc.duration_minutes} دقيقة</p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="font-bold text-[#E8192C] text-left">
                                {svc.price} <span className="text-xs font-medium">ج.م</span>
                              </div>

                              <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenEditPackage(svc)
                                  }}
                                  className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="تعديل الباقة"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPackageToDelete(svc)
                                  }}
                                  className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                  title="حذف الباقة"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-sm text-[#9EA3AE]">
                          لا توجد باقات بعد
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <ShopBookingsSection shopId={shop.id} />
          </motion.div>

          <ShopSettingsSheet
            shop={shop}
            onUpdate={handleUpdate}
            isUpdating={updateMutation.isPending}
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
          />

          <AddPackageSheet
            shopId={shop.id}
            open={isAddPackageOpen}
            onOpenChange={setIsAddPackageOpen}
          />

          <EditPackageSheet
            shopId={shop.id}
            service={selectedPackageToEdit}
            open={isEditPackageOpen}
            onOpenChange={setIsEditPackageOpen}
          />

          {/* Delete Package Confirmation Sheet */}
          <Sheet open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
            <SheetContent side="bottom" className="rounded-t-3xl p-6" dir="rtl">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-right text-xl font-bold text-destructive">حذف الباقة</SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  هل أنت تأكد من رغبتك في حذف باقة <span className="font-bold text-gray-900">"{packageToDelete?.name}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setPackageToDelete(null)}
                    disabled={deleteServiceMutation.isPending}
                    className="rounded-xl h-11 px-5 font-semibold"
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmDeletePackage}
                    disabled={deleteServiceMutation.isPending}
                    className="rounded-xl h-11 px-5 font-semibold bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteServiceMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                    نعم، احذف الباقة
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  )
}