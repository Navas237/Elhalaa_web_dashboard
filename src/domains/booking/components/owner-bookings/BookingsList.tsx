'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { useOwnerBookings, useOwnerBookingCounts } from '../../hooks/use-owner-bookings'
import { getOwnerBookings } from '../../services/booking.service'
import { useOwnerShops } from '@/domains/owner/hooks/useOwnerShops'
import { getOwnerStaff } from '@/domains/staff/services/staff.service'
import { ownerKeys } from '@/domains/owner/keys'
import { BookingCard } from './BookingCard'
import { BookingsFilter } from './BookingsFilter'
import { BookingDetailsModal } from './BookingDetailsModal'
import { PendingActionReminder } from './PendingActionReminder'
import { BookingActionsSheet } from '../BookingActionsSheet'
import { NewBookingSheet } from '../wizard/NewBookingSheet'
import type { BookingCardDto } from '../../dto/booking.dto'
import { toShopBookingCardDtoFromOwner as toShopDto } from '../../dto/booking.dto'

export function BookingsList({ ownerId, initialBookingId }: { ownerId: string; initialBookingId?: string | null }) {
  const [page, setPage] = useState(1)
  const pageSize = 50
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<any>({
    status: 'all',
    shopName: null,
    barberName: null,
    date: null
  })

  // البحث يُرسَل للسيرفر بعد توقف الكتابة حتى لا نضرب الـ RPC مع كل حرف
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  // خيارات الفلاتر من مصادر موثوقة (كل الفروع وكل الحلاقين)،
  // وليس من الصفحة المحمّلة فقط — وإلا تختفي خيارات موجودة في صفحات أخرى.
  const { shops } = useOwnerShops(ownerId)
  const { data: staffList } = useQuery({
    queryKey: [...ownerKeys.all, 'staff-all', ownerId],
    queryFn: () => getOwnerStaff(ownerId),
    enabled: !!ownerId,
    staleTime: 60_000,
  })
  const uniqueShops = useMemo(() => shops.map(s => s.name), [shops])
  const uniqueBarbers = useMemo(
    () => Array.from(new Set((staffList ?? []).map(s => s.name))).sort((a, b) => a.localeCompare(b, 'ar')),
    [staffList],
  )

  // تحويل أسماء الفلاتر إلى IDs يفهمها الـ RPC — كل الفلترة على السيرفر
  // حتى يتطابق الـ total_count/الـ pagination مع المعروض (لا صفحات فارغة).
  const selectedShopId = filters.shopName
    ? shops.find(s => s.name === filters.shopName)?.id
    : undefined
  const selectedBarberUserId = filters.barberName
    ? staffList?.find(s => s.name === filters.barberName)?.profileId
    : undefined

  const { data: bookings, isLoading, isFetching } = useOwnerBookings(ownerId, {
    page,
    pageSize,
    status: filters.status,
    shopId: selectedShopId,
    barberId: selectedBarberUserId,
    dateFrom: filters.date ?? undefined,
    dateTo: filters.date ?? undefined,
    search: debouncedSearch || undefined,
  })
  const { data: countsData } = useOwnerBookingCounts(ownerId)

  // القائمة معروضة كما رجعت من السيرفر (مفلترة + مرتّبة) — لا فلترة عميل إضافية
  // حتى لا يختلف المعروض عن الـ pagination.
  const filteredBookings = bookings ?? []
  const counts = countsData

  const [selectedBooking, setSelectedBooking] = useState<BookingCardDto | null>(null)
  const [actionBooking, setActionBooking] = useState<BookingCardDto | null>(null)
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false)
  const [reminderToastShown, setReminderToastShown] = useState(false)

  // Reset page when filters change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setPage(1)
  }

  // Deep-link من الإشعار: ?bookingId= يفتح شيت الأكشن مباشرة.
  // المسار السريع: الحجز في الصفحة المحمّلة. الاحتياطي: جلبه مباشرة
  // (قد يكون في صفحة أخرى أو مخفيًا خلف فلتر المستخدم).
  const deepLinkFallbackTriedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!initialBookingId || actionBooking || isLoading) return
    const found = bookings?.find((b: BookingCardDto) => b.id === initialBookingId)
    if (found) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deep-link open on data arrival
      setActionBooking(found)
      return
    }
    if (deepLinkFallbackTriedRef.current === initialBookingId) return
    deepLinkFallbackTriedRef.current = initialBookingId
    getOwnerBookings(ownerId, { page: 1, pageSize: 100 })
      .then((rows) => {
        const hit = rows.find((b) => b.id === initialBookingId)
        if (hit) setActionBooking(hit)
      })
      .catch(() => {
        // Deep-link best-effort: تبقى القائمة كما هي عند الفشل.
      })
  }, [initialBookingId, bookings, isLoading, actionBooking, ownerId])

  // التنبيه (توست + بانر): فقط لحجوزات "الانتظار" اللي وقت الـ display بتاعها جه أو عدى.
  // لا يظهر للحجوزات المعلقة ولا للانتظار بدون معاد مستحق.
  // المصدر الأساسي: عدّاد السيرفر (دقيق عبر كل الصفحات)، والاحتياطي: المحمّل محلياً
  const [nowMs] = useState(() => Date.now())
  const clientDueWaitingCount = useMemo(() => {
    if (!bookings) return 0
    return bookings.filter((b: BookingCardDto) => {
      if (b.status !== 'waiting_time') return false
      if (!b.bookingDate || !b.displayStartTime) return false
      const start = new Date(`${b.bookingDate}T${b.displayStartTime}`).getTime()
      return !Number.isNaN(start) && start <= nowMs
    }).length
  }, [bookings, nowMs])
  const serverDueWaiting = (counts as unknown as { due_waiting?: number } | undefined)?.due_waiting
  const dueWaitingCount = serverDueWaiting ?? clientDueWaitingCount
  useEffect(() => {
    if (reminderToastShown || isLoading) return
    if (dueWaitingCount > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time reminder guard
      setReminderToastShown(true)
      toast.warning(
        `عندك ${dueWaitingCount} طلبات انتظار معادها جه تحتاج تحديد وقت`,
        {
          description: 'اضغط على التنبيه أعلى القائمة لاتخاذ إجراء',
          duration: 6000,
        },
      )
    }
  }, [dueWaitingCount, isLoading, reminderToastShown])

  const totalCount = bookings?.[0]?.totalCount || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="flex flex-col gap-4 py-4 px-4 pb-24" dir="rtl">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">الحجوزات</h1>
            <p className="text-sm text-muted-foreground">إدارة جميع حجوزات الفروع</p>
          </div>
          <Button 
            size="icon" 
            className="rounded-full w-12 h-12 shadow-sm"
            onClick={() => setIsNewBookingOpen(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
        
        <div className="relative shadow-sm rounded-full">
          <Input 
            placeholder="بحث برقم الهاتف، أو اسم العميل..." 
            className="pr-11 h-12 rounded-full bg-white dark:bg-zinc-900 border-muted focus-visible:ring-primary/20 text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              // البحث فلتر مثل غيره: نرجع لأول صفحة وإلا تظهر صفحات فارغة
              setPage(1)
            }}
          />
          <Search className="absolute right-4 top-3.5 h-5 w-5 text-muted-foreground/70" />
        </div>

        <BookingsFilter 
          filters={filters} 
          onFiltersChange={handleFilterChange} 
          counts={counts}
          uniqueShops={uniqueShops}
          uniqueBarbers={uniqueBarbers}
        />

        <PendingActionReminder
          dueWaitingCount={dueWaitingCount}
          onShowWaiting={() => {
            handleFilterChange({ ...filters, status: 'waiting_time', shopName: null, barberName: null, date: null })
          }}
        />
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-xl bg-muted/50" />
          ))
        ) : filteredBookings.length > 0 ? (
          <>
            {isFetching && (
              <p className="text-center text-xs text-muted-foreground" role="status">
                جاري تحديث القائمة...
              </p>
            )}
            <AnimatePresence mode="popLayout">
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={setSelectedBooking}
                />
              ))}
            </AnimatePresence>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>لا توجد حجوزات تطابق بحثك أو فلاترك الحالية</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
          >
            السابق
          </Button>
          <span className="text-sm text-muted-foreground">
            صفحة {page} من {totalPages}
          </span>
          <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isFetching}
          >
            التالي
          </Button>
        </div>
      )}

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={!!selectedBooking && !actionBooking}
        onClose={() => setSelectedBooking(null)}
        canManage
        onManage={(b) => {
          setSelectedBooking(null)
          setActionBooking(b)
        }}
      />

      <BookingActionsSheet
        isOpen={!!actionBooking}
        onClose={() => setActionBooking(null)}
        booking={actionBooking ? toShopDto(actionBooking) : null}
        canManage
      />

      <NewBookingSheet 
        open={isNewBookingOpen}
        onOpenChange={setIsNewBookingOpen}
      />
    </div>
  )
}
