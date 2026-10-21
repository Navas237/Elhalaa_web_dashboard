'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeftRight, Loader2, Store, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useOwnerShops } from '@/domains/owner/hooks/useOwnerShops'
import { useTransferBarber } from '../hooks/use-transfer-barber'
import { BranchSelector } from '@/domains/branch/components/BranchSelector'
import { useAuth } from '@/domains/auth/hooks/useAuth'

interface TransferBarberSheetProps {
  staffId: string
  currentShopId: string
  currentShopName: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransferBarberSheet({
  staffId,
  currentShopId,
  currentShopName,
  open,
  onOpenChange,
}: TransferBarberSheetProps) {
  const { user } = useAuth()
  const ownerId = user?.id || ''
  
  const { shops, loading: shopsLoading } = useOwnerShops(ownerId)
  const { mutate: transferBarber, isPending } = useTransferBarber(ownerId)
  
  const [selectedShopId, setSelectedShopId] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleTransfer = () => {
    setError('')
    if (!selectedShopId) {
      setError('يرجى اختيار الفرع الجديد')
      return
    }
    
    if (selectedShopId === currentShopId) {
      setError('لا يمكن النقل لنفس الفرع الحالي')
      return
    }

    transferBarber(
      { staffId, targetShopId: selectedShopId },
      {
        onSuccess: () => {
          setSelectedShopId('')
          onOpenChange(false)
        },
      }
    )
  }

  // Handle sheet close correctly and reset states
  const handleClose = () => {
    if (isPending) return
    setError('')
    setSelectedShopId('')
    onOpenChange(false)
  }

  const availableShops = shops?.filter(shop => shop.id !== currentShopId) || []

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
          />
          
          <div className="fixed inset-0 z-[70] flex justify-center items-end pointer-events-none sm:items-center sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full sm:max-w-md bg-background rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col max-h-[90dvh] overflow-y-auto"
              dir="rtl"
            >
              <div className="flex justify-center pt-4 pb-2 sm:hidden cursor-grab active:cursor-grabbing">
                <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
              </div>
              
              <div className="flex justify-between items-center px-6 pt-2 pb-4 sm:pt-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <ArrowLeftRight className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold">نقل الموظف لفرع آخر</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={handleClose} 
                  disabled={isPending}
                  className="rounded-full bg-muted/50 hover:bg-muted h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* الفرع الحالي */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">الفرع الحالي</label>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                    <Store className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{currentShopName || 'غير محدد'}</span>
                  </div>
                </div>

                {/* الفرع الجديد */}
                <div className="space-y-2 text-right" dir="rtl">
                  <BranchSelector
                    value={selectedShopId}
                    onChange={setSelectedShopId}
                    shops={availableShops}
                    isLoading={shopsLoading}
                    disabled={isPending}
                    placeholder="اختر الفرع الجديد..."
                    emptyMessage="لا توجد فروع أخرى متاحة"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border bg-muted/10 sm:rounded-b-[2rem] pb-[90px]">
                <Button 
                  className="w-full h-12 rounded-xl text-base font-bold" 
                  onClick={handleTransfer}
                  disabled={isPending || !selectedShopId}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      جاري النقل...
                    </>
                  ) : (
                    'تأكيد النقل'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
