"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/shared/lib/supabase/client"
import { bookingKeys } from "../query-keys"
import { ownerKeys } from "@/domains/owner/keys"

type UseBookingsRealtimeParams = {
  /** When set, only changes for this shop are received (server-side filter). */
  shopId?: string
  enabled?: boolean
}

/**
 * Subscribes to live `bookings_v2` changes (INSERT / UPDATE / DELETE) and
 * invalidates booking + owner caches so lists update instantly without a
 * manual refresh.
 *
 * Delivery respects the table RLS SELECT policies: barbers receive their own
 * bookings, owners/managers receive their shops' bookings.
 */
export function useBookingsRealtime({
  shopId,
  enabled = true,
}: UseBookingsRealtimeParams = {}) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()
    const channelName = shopId ? `bookings-changes-${shopId}` : "bookings-changes"

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings_v2",
          ...(shopId ? { filter: `shop_id=eq.${shopId}` } : {}),
        },
        () => {
          queryClient.invalidateQueries({ queryKey: bookingKeys.all })
          queryClient.invalidateQueries({ queryKey: ownerKeys.all })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, queryClient, shopId])
}
