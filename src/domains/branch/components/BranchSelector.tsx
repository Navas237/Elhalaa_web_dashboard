import { Loader2, Store, AlertCircle, ChevronDown, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface BranchSelectorProps {
  value: string
  onChange: (value: string) => void
  shops: { id: string; name: string }[]
  isLoading?: boolean
  disabled?: boolean
  error?: string
  placeholder?: string
  emptyMessage?: string
}

export function BranchSelector({
  value,
  onChange,
  shops,
  isLoading,
  disabled,
  error,
  placeholder = 'اختر الفرع',
  emptyMessage = 'لا توجد فروع متاحة',
}: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedShop = shops.find(s => s.id === value)

  return (
    <div className="flex flex-col gap-1.5 relative" ref={dropdownRef} dir="rtl">
      <label className="text-sm font-medium text-foreground text-right">الفرع</label>

      {isLoading ? (
        <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-border bg-muted/30">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">جاري تحميل الفروع...</span>
        </div>
      ) : shops.length === 0 ? (
        <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-destructive/40 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">{emptyMessage}</span>
        </div>
      ) : (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center justify-between h-11 px-3 rounded-xl border bg-background text-right transition-colors ${error ? 'border-destructive ring-destructive/20' : 'border-input hover:bg-muted/50 focus:ring-2 focus:ring-primary/20'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className={selectedShop ? 'text-foreground' : 'text-muted-foreground'}>
                {selectedShop ? selectedShop.name : placeholder}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && !disabled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute top-full left-0 right-0 z-[100] mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden"
              >
                <div className="max-h-60 overflow-y-auto p-1 no-scrollbar">
                  {shops.map((shop) => (
                    <button
                      key={shop.id}
                      type="button"
                      onClick={() => {
                        onChange(shop.id)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors text-right ${value === shop.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                        }`}
                    >
                      <span>{shop.name}</span>
                      {value === shop.id && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {error && <p className="text-xs text-destructive text-right">{error}</p>}
    </div>
  )
}
