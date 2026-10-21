'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2, AlertCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { createServiceSchema, type CreateServiceFormValues } from '../schemas/createService.schema'
import { useCreateService } from '../hooks/useCreateService'

interface AddPackageSheetProps {
  shopId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
}

export function AddPackageSheet({ shopId, open, onOpenChange }: AddPackageSheetProps) {
  const { mutate, isPending, error } = useCreateService(shopId)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration_minutes: 0,
    }
  })

  const onSubmit = (data: CreateServiceFormValues) => {
    mutate(data, {
      onSuccess: () => {
        reset()
        onOpenChange(false)
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) reset()
    onOpenChange(newOpen)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[90dvh] overflow-y-auto" dir="rtl">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-right text-xl font-bold">إضافة باقة جديدة</SheetTitle>
          </SheetHeader>

          <motion.form 
            onSubmit={handleSubmit(onSubmit)}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
          >
            {error && (
              <motion.div variants={itemVariants}>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>اسم الباقة</Label>
              <Input 
                id="name" 
                placeholder="مثال: حلاقة شعر ودقن" 
                className={`h-12 rounded-xl bg-muted/50 ${errors.name ? 'border-destructive' : 'border-transparent'}`}
                {...register('name')} 
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="description" className={errors.description ? "text-destructive" : ""}>الوصف (اختياري)</Label>
              <Textarea 
                id="description" 
                rows={3} 
                placeholder="أدخل وصف الباقة..." 
                className={`rounded-xl bg-muted/50 resize-none ${errors.description ? 'border-destructive' : 'border-transparent'}`}
                {...register('description')} 
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2.5">
              <div className="space-y-2">
                <Label htmlFor="price" className={errors.price ? "text-destructive" : ""}>السعر</Label>
                <div className="relative">
                  <Input 
                    id="price" 
                    type="number" 
                    className={`h-12 rounded-xl bg-muted/50 pl-12 pr-4 ${errors.price ? 'border-destructive' : 'border-transparent'}`}
                    {...register('price')} 
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">جنيه</span>
                </div>
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className={errors.duration_minutes ? "text-destructive" : ""}>المدة</Label>
                <div className="relative">
                  <Input 
                    id="duration" 
                    type="number" 
                    className={`h-12 rounded-xl bg-muted/50 pl-14 pr-4 ${errors.duration_minutes ? 'border-destructive' : 'border-transparent'}`}
                    {...register('duration_minutes')} 
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">دقيقة</span>
                </div>
                {errors.duration_minutes && <p className="text-sm text-destructive">{errors.duration_minutes.message}</p>}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2 pb-[90px]">
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-14 bg-[#E8192C] hover:bg-[#C0102A] text-white rounded-xl text-lg font-bold transition-colors"
              >
                {isPending && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
                حفظ الباقة
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}
