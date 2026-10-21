'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, MapPin, Clock, Loader2, Store } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useCreateShop } from '@/domains/branch/hooks/useShops'
import { MapPickerModal } from './MapPickerModal'

export const addShopSchema = z.object({
  name: z.string().min(2, 'اسم الفرع مطلوب'),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
})

export type AddShopFormValues = z.infer<typeof addShopSchema>

interface AddShopSheetProps {
  isOpen: boolean
  onClose: () => void
  ownerId: string
  onSuccess?: () => void
}

export function AddShopSheet({ isOpen, onClose, ownerId, onSuccess }: AddShopSheetProps) {
  const [isMapOpen, setIsMapOpen] = useState(false)
  const { mutate: createShop, isPending } = useCreateShop(ownerId)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<AddShopFormValues>({
    resolver: zodResolver(addShopSchema),
    defaultValues: {
      name: '',
      address: '',
      opening_time: '10:00',
      closing_time: '22:00',
    }
  })

  const watchAddress = watch('address')
  const watchLat = watch('latitude')
  const watchLng = watch('longitude')

  const onSubmit = (data: AddShopFormValues) => {
    createShop(data, {
      onSuccess: () => {
        reset()
        onSuccess?.()
        onClose()
      },
    })
  }

  const handleLocationConfirm = (location: { address: string; latitude: number; longitude: number }) => {
    setValue('address', location.address)
    setValue('latitude', location.latitude)
    setValue('longitude', location.longitude)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50  bg-white rounded-t-[32px] max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl font-sans"
              dir="rtl"
            >
              {/* Handle */}
              <div className="w-full flex justify-center pt-3 pb-2 bg-white z-10 shrink-0">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FDECEA] flex items-center justify-center">
                    <Store className="w-5 h-5 text-[#E8192C]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">إضافة فرع جديد</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto">
                <form id="add-shop-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                  {/* Shop Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-800">
                      اسم الفرع <span className="text-[#E8192C]">*</span>
                    </label>
                    <input
                      {...register('name')}
                      placeholder="مثال: فرع المهندسين"
                      className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F5A3AA] focus:ring-4 focus:ring-[#FDECEA] transition-all"
                    />
                    {errors.name && (
                      <p className="text-[#E8192C] text-xs font-semibold">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Location Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-800">الموقع</label>
                    
                    {!watchAddress ? (
                      <button
                        type="button"
                        onClick={() => setIsMapOpen(true)}
                        className="w-full h-14 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:text-[#E8192C] hover:border-[#F5A3AA] hover:bg-[#FDECEA] transition-all"
                      >
                        <MapPin className="w-5 h-5" />
                        <span className="font-semibold">تحديد الموقع على الخريطة</span>
                      </button>
                    ) : (
                      <div 
                        onClick={() => setIsMapOpen(true)}
                        className="w-full border border-[#EAF3DE] bg-[#F7FBF4] rounded-xl p-4 cursor-pointer hover:bg-[#EAF3DE] transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1A7A35]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4 text-[#1A7A35]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1A7A35] line-clamp-2 leading-relaxed">
                              {watchAddress}
                            </p>
                            {(watchLat && watchLng) && (
                              <p className="text-xs text-[#1A7A35]/70 mt-1 font-mono" dir="ltr">
                                {watchLat.toFixed(5)}, {watchLng.toFixed(5)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-800">وقت الفتح</label>
                      <div className="relative w-full">
                        <input
                          type="time"
                          {...register('opening_time')}
                          className="w-full h-14 pl-4 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#F5A3AA] focus:ring-4 focus:ring-[#FDECEA] transition-all"
                        />
                        <Clock className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-800">وقت الإغلاق</label>
                      <div className="relative w-full">
                        <input
                          type="time"
                          {...register('closing_time')}
                          className="w-full h-14 pl-4 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#F5A3AA] focus:ring-4 focus:ring-[#FDECEA] transition-all"
                        />
                        <Clock className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-6 pt-6 pb-[90px] border-t border-gray-100 shrink-0 bg-white">
                <Button
                  type="submit"
                  form="add-shop-form"
                  disabled={isPending}
                  className="w-full h-14 bg-[#E8192C] hover:bg-[#C0102A] text-white rounded-xl text-lg font-bold shadow-lg shadow-red-500/25 transition-all"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ الفرع'
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MapPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleLocationConfirm}
        initialLat={watchLat}
        initialLng={watchLng}
      />
    </>
  )
}
