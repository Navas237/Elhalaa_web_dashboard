'use client'

import { motion } from 'framer-motion'
import { Check, Loader2, Package, AlertCircle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'
import { useShopServices } from '../hooks/useShopServices'
import type { ShopServiceItem } from '../services/shop.service'

interface ReferencePackageSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  currentReferenceId: string | null
  onSelect: (serviceId: string) => void
  isUpdating: boolean
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(price)
}

export function ReferencePackageSheet({
  open,
  onOpenChange,
  shopId,
  currentReferenceId,
  onSelect,
  isUpdating,
}: ReferencePackageSheetProps) {
  const { services, loading, error } = useShopServices(shopId)

  function handleSelect(serviceId: string) {
    if (isUpdating || serviceId === currentReferenceId) return
    onSelect(serviceId)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[1.75rem] max-h-[85dvh] flex flex-col"
        dir="rtl"
        showCloseButton={!isUpdating}
      >
        <SheetHeader className="text-right border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold">الباقة المرجعية</SheetTitle>
              <SheetDescription className="text-xs">
                اختر الخدمة المرجعية لهذا الفرع
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5 no-scrollbar">
          {error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center" dir="rtl">
              <div className="bg-destructive/10 p-3 rounded-full mb-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm text-destructive font-medium mb-3">{error}</p>
            </div>
          ) : loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
            ))
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center" dir="rtl">
              <div className="bg-muted p-3 rounded-full mb-3">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">لا توجد خدمات نشطة لهذا الفرع</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              className="flex flex-col gap-2"
            >
              {services.map((service: ShopServiceItem) => {
                const isSelected = service.id === currentReferenceId
                const isDisabled = isUpdating || isSelected
                return (
                  <motion.button
                    key={service.id}
                    type="button"
                    variants={itemVariants}
                    whileTap={isDisabled ? undefined : { scale: 0.98 }}
                    onClick={() => handleSelect(service.id)}
                    disabled={isDisabled}
                    dir="rtl"
                    className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 text-right transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:bg-muted/40'
                    } disabled:opacity-60`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-sm truncate">{service.name}</span>
                      <span className="text-xs text-muted-foreground" dir="ltr">
                        {service.duration_minutes} د · {formatPrice(service.price)} ج.م
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground shrink-0">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                    ) : (
                      <span className="text-xs font-semibold text-primary shrink-0">تحديد</span>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </div>

        <div className="border-t pt-3 px-5 pb-[90px]">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            إغلاق
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}