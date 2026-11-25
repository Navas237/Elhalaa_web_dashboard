-- ==============================================================================
-- Migration: Create barber_blocked_times table & conflict-prevention RPC
-- Description: Allows barbers to block time slots while strictly preventing collisions with active bookings.
-- ==============================================================================

-- 1. Create the barber_blocked_times table
CREATE TABLE IF NOT EXISTS public.barber_blocked_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops_v2(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.shop_staff(id) ON DELETE CASCADE,
    block_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(100) NOT NULL DEFAULT 'break',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Check constraint: Start time must precede end time
    CONSTRAINT chk_blocked_time_range CHECK (start_time < end_time)
);

-- 2. Indexes for fast availability querying
CREATE INDEX IF NOT EXISTS idx_barber_blocked_times_lookup 
ON public.barber_blocked_times (staff_id, block_date, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_barber_blocked_times_shop 
ON public.barber_blocked_times (shop_id, block_date);

-- 3. Row Level Security (RLS)
ALTER TABLE public.barber_blocked_times ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users (or anyone checking shop availability)
CREATE POLICY "Allow read blocked times"
ON public.barber_blocked_times
FOR SELECT
TO authenticated
USING (true);

-- Allow staff and owners to manage blocked times
CREATE POLICY "Allow staff and owners to manage blocked times"
ON public.barber_blocked_times
FOR ALL
TO authenticated
USING (
    auth.uid() = created_by
    OR EXISTS (
        SELECT 1 FROM public.shop_staff
        WHERE shop_staff.id = barber_blocked_times.staff_id
          AND shop_staff.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.shops_v2
        WHERE shops_v2.id = barber_blocked_times.shop_id
          AND shops_v2.owner_id = auth.uid()
    )
);

-- 4. Atomic RPC to block time slot with STRICT booking collision prevention
CREATE OR REPLACE FUNCTION public.block_barber_time_slot(
    p_shop_id UUID,
    p_staff_id UUID,
    p_block_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_reason VARCHAR(100) DEFAULT 'break',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conflict RECORD;
    v_new_id UUID;
BEGIN
    -- 1. Validate time range
    IF p_start_time >= p_end_time THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_TIME_RANGE',
            'message', 'وقت البداية يجب أن يكون قبل وقت النهاية'
        );
    END IF;

    -- 2. Strict Invariant: Check for conflicting active bookings (pending, confirmed, waiting_time)
    SELECT id, client_name, start_time, end_time, status
    INTO v_conflict
    FROM public.bookings_v2
    WHERE staff_id = p_staff_id
      AND booking_date = p_block_date
      AND status IN ('pending', 'confirmed', 'waiting_time')
      AND (start_time < p_end_time AND end_time > p_start_time)
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'SLOT_HAS_ACTIVE_BOOKING',
            'message', format('لا يمكن قفل هذا الوقت لوجود حجز نشط للعميل (%s) من %s إلى %s', 
                              v_conflict.client_name, 
                              to_char(v_conflict.start_time, 'HH12:MI AM'), 
                              to_char(v_conflict.end_time, 'HH12:MI AM')),
            'conflict', jsonb_build_object(
                'booking_id', v_conflict.id,
                'client_name', v_conflict.client_name,
                'start_time', v_conflict.start_time,
                'end_time', v_conflict.end_time,
                'status', v_conflict.status
            )
        );
    END IF;

    -- 3. Check for overlapping existing blocked times
    IF EXISTS (
        SELECT 1 FROM public.barber_blocked_times
        WHERE staff_id = p_staff_id
          AND block_date = p_block_date
          AND (start_time < p_end_time AND end_time > p_start_time)
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'SLOT_ALREADY_BLOCKED',
            'message', 'هذا التوقيت يحتوي بالفعل على فترة مقفولة مسبقاً'
        );
    END IF;

    -- 4. Insert the blocked slot
    INSERT INTO public.barber_blocked_times (
        shop_id,
        staff_id,
        block_date,
        start_time,
        end_time,
        reason,
        notes,
        created_by
    ) VALUES (
        p_shop_id,
        p_staff_id,
        p_block_date,
        p_start_time,
        p_end_time,
        p_reason,
        p_notes,
        auth.uid()
    )
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
        'success', true,
        'id', v_new_id,
        'message', 'تم قفل الميعاد بنجاح'
    );
END;
$$;
