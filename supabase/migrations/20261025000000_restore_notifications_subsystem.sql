-- ==============================================================================
-- Migration: 20261025000000_restore_notifications_subsystem.sql
-- Description: Restores the production notification subsystem:
--   1. Tables: push_devices, notifications, notification_jobs, notification_delivery_attempts
--   2. Worker RPCs: claim_due_booking_notification_jobs, mark_notification_job_sent, mark_notification_job_failed
--   3. Helper function: booking_notification_scheduled_for
--   4. Triggers on bookings_v2: notify_new_booking, schedule_booking_notification_jobs, cancel reminders
--   5. Full RLS policies and grants matching the deployed process-booking-notifications Edge Function
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Table: push_devices
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.shop_staff(id) ON DELETE SET NULL,
    provider TEXT NOT NULL CHECK (provider = ANY (ARRAY['fcm'::text, 'apns'::text, 'expo'::text])),
    platform TEXT NOT NULL CHECK (platform = ANY (ARRAY['android'::text, 'ios'::text, 'web'::text])),
    token TEXT NOT NULL,
    device_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_push_devices_provider_token UNIQUE (provider, token)
);

CREATE INDEX IF NOT EXISTS idx_push_devices_user_active 
    ON public.push_devices USING btree (user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_push_devices_staff_active 
    ON public.push_devices USING btree (staff_id, is_active) 
    WHERE (staff_id IS NOT NULL);

-- ------------------------------------------------------------------------------
-- 2. Table: notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings_v2(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
    ON public.notifications USING btree (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON public.notifications USING btree (user_id, created_at DESC) 
    WHERE (read_at IS NULL);

-- ------------------------------------------------------------------------------
-- 3. Table: notification_jobs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings_v2(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.shop_staff(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type = ANY (ARRAY[
        'booking_arrival_check'::text,
        'booking_arrival_followup'::text,
        'booking_new'::text,
        'waiting_confirm_reminder'::text,
        'arrival_confirm_reminder'::text
    ])),
    status TEXT NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY[
        'pending'::text,
        'processing'::text,
        'sent'::text,
        'failed'::text,
        'cancelled'::text
    ])),
    scheduled_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    attempts INTEGER NOT NULL DEFAULT 0,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    locked_at TIMESTAMPTZ,
    locked_by TEXT,
    sent_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    next_attempt_at TIMESTAMPTZ,
    last_error TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    idempotency_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_notification_jobs_idempotency_key UNIQUE (idempotency_key)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_jobs_booking_type_recipient 
    ON public.notification_jobs USING btree (booking_id, type, recipient_user_id) 
    WHERE (booking_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_due 
    ON public.notification_jobs USING btree (status, scheduled_for) 
    WHERE (status = 'pending'::text);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_booking 
    ON public.notification_jobs USING btree (booking_id, type);

-- ------------------------------------------------------------------------------
-- 4. Table: notification_delivery_attempts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.notification_jobs(id) ON DELETE CASCADE,
    push_device_id UUID REFERENCES public.push_devices(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    platform TEXT,
    status TEXT NOT NULL CHECK (status = ANY (ARRAY['sent'::text, 'failed'::text, 'invalid_token'::text])),
    provider_message_id TEXT,
    error_code TEXT,
    error_message TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_attempts_job 
    ON public.notification_delivery_attempts USING btree (job_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_attempts_device 
    ON public.notification_delivery_attempts USING btree (push_device_id, attempted_at DESC) 
    WHERE (push_device_id IS NOT NULL);

-- ------------------------------------------------------------------------------
-- 5. Row Level Security (RLS) Configuration
-- ------------------------------------------------------------------------------
ALTER TABLE public.push_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_attempts ENABLE ROW LEVEL SECURITY;

-- push_devices Policies
DROP POLICY IF EXISTS "Users can view their own push devices" ON public.push_devices;
CREATE POLICY "Users can view their own push devices" 
    ON public.push_devices 
    FOR SELECT 
    TO authenticated 
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own push devices" ON public.push_devices;
CREATE POLICY "Users can insert their own push devices" 
    ON public.push_devices 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        (user_id = (SELECT auth.uid())) 
        AND (
            (staff_id IS NULL) 
            OR (EXISTS (
                SELECT 1 FROM public.shop_staff ss 
                WHERE ss.id = push_devices.staff_id 
                  AND ss.user_id = (SELECT auth.uid()) 
                  AND ss.is_active = true
            ))
        )
    );

DROP POLICY IF EXISTS "Users can update their own push devices" ON public.push_devices;
CREATE POLICY "Users can update their own push devices" 
    ON public.push_devices 
    FOR UPDATE 
    TO authenticated 
    USING (user_id = (SELECT auth.uid())) 
    WITH CHECK (
        (user_id = (SELECT auth.uid())) 
        AND (
            (staff_id IS NULL) 
            OR (EXISTS (
                SELECT 1 FROM public.shop_staff ss 
                WHERE ss.id = push_devices.staff_id 
                  AND ss.user_id = (SELECT auth.uid()) 
                  AND ss.is_active = true
            ))
        )
    );

DROP POLICY IF EXISTS "Users can delete their own push devices" ON public.push_devices;
CREATE POLICY "Users can delete their own push devices" 
    ON public.push_devices 
    FOR DELETE 
    TO authenticated 
    USING (user_id = (SELECT auth.uid()));

-- notifications Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications 
    FOR SELECT 
    TO authenticated 
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can mark their own notifications read" ON public.notifications;
CREATE POLICY "Users can mark their own notifications read" 
    ON public.notifications 
    FOR UPDATE 
    TO authenticated 
    USING (user_id = (SELECT auth.uid())) 
    WITH CHECK (user_id = (SELECT auth.uid()));

-- ------------------------------------------------------------------------------
-- 6. Helper Function: booking_notification_scheduled_for
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.booking_notification_scheduled_for(
    p_booking_date DATE,
    p_booking_time TIME WITHOUT TIME ZONE
)
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
AS $$
    SELECT (p_booking_date::timestamp + p_booking_time) AT TIME ZONE 'Africa/Cairo';
$$;

-- ------------------------------------------------------------------------------
-- 7. Worker RPCs for Edge Function process-booking-notifications
-- ------------------------------------------------------------------------------

-- Claim Due Jobs
CREATE OR REPLACE FUNCTION public.claim_due_booking_notification_jobs(
    p_limit INTEGER DEFAULT 25,
    p_worker_id TEXT DEFAULT NULL::TEXT
)
RETURNS TABLE(
    job_id UUID,
    booking_id UUID,
    recipient_user_id UUID,
    staff_id UUID,
    type TEXT,
    scheduled_for TIMESTAMPTZ,
    title TEXT,
    body TEXT,
    payload JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Unlock stale processing jobs (older than 5 minutes)
  UPDATE public.notification_jobs
  SET status = 'pending',
      locked_at = NULL,
      locked_by = NULL,
      updated_at = NOW(),
      last_error = COALESCE(last_error, 'stale_processing_lock_released')
  WHERE status = 'processing'
    AND locked_at < NOW() - INTERVAL '5 minutes';

  -- Select and lock due pending jobs
  RETURN QUERY
  WITH due_jobs AS (
    SELECT nj.id
    FROM public.notification_jobs nj
    JOIN public.bookings_v2 b ON b.id = nj.booking_id
    WHERE nj.status = 'pending'
      AND nj.scheduled_for <= NOW()
      AND b.status NOT IN ('cancelled', 'completed', 'no_show')
      AND (
        nj.type IN ('booking_arrival_check', 'booking_new', 'arrival_confirm_reminder', 'waiting_confirm_reminder')
        OR EXISTS (
          SELECT 1
          FROM public.notification_jobs first_job
          WHERE first_job.booking_id = nj.booking_id
            AND first_job.type = 'booking_arrival_check'
            AND first_job.status = 'sent'
        )
      )
    ORDER BY nj.scheduled_for ASC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 25), 100))
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.notification_jobs nj
  SET status = 'processing',
      attempt_count = nj.attempt_count + 1,
      locked_at = NOW(),
      locked_by = COALESCE(p_worker_id, 'process-booking-notifications'),
      updated_at = NOW()
  FROM due_jobs
  WHERE nj.id = due_jobs.id
  RETURNING
    nj.id AS job_id,
    nj.booking_id,
    nj.recipient_user_id,
    nj.staff_id,
    nj.type,
    nj.scheduled_for,
    CASE
      WHEN nj.type = 'arrival_confirm_reminder' THEN 'يجب تأكيد وصول العميل'
      WHEN nj.type = 'waiting_confirm_reminder' THEN 'حجز في الانتظار ⏳'
      WHEN nj.type = 'booking_arrival_followup' THEN 'Booking arrival reminder'
      WHEN nj.type = 'booking_new' THEN 'New booking'
      ELSE 'Has the client arrived?'
    END AS title,
    CASE
      WHEN nj.type = 'arrival_confirm_reminder'
        THEN 'حان موعد الحجز ولم يتم تأكيد وصول العميل بعد. افتح الحجز وأكّد أو ألغِ.'
      WHEN nj.type = 'waiting_confirm_reminder'
        THEN 'يوجد حجز في الانتظار ومعاده قرب يخلص. حدد وقته أو أكّده.'
      WHEN nj.type = 'booking_arrival_followup'
        THEN 'The client arrival has not been confirmed yet. Open the booking and update the status.'
      WHEN nj.type = 'booking_new'
        THEN 'A new booking has been added. Tap to view details.'
      ELSE 'The booking time has started. Has the client arrived?'
    END AS body,
    nj.payload || jsonb_build_object(
      'type', nj.type,
      'notification_job_id', nj.id,
      'route', COALESCE(nj.payload->>'route', '/barber/timeline'),
      'booking_id', nj.booking_id
    ) AS payload;
END;
$$;

-- Mark Job Sent
CREATE OR REPLACE FUNCTION public.mark_notification_job_sent(
    p_job_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.notification_jobs
  SET status = 'sent',
      sent_at = NOW(),
      locked_at = NULL,
      locked_by = NULL,
      last_error = NULL,
      updated_at = NOW()
  WHERE id = p_job_id;
END;
$$;

-- Mark Job Failed
CREATE OR REPLACE FUNCTION public.mark_notification_job_failed(
    p_job_id UUID,
    p_error TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.notification_jobs
  SET status = CASE WHEN attempt_count >= 3 THEN 'failed' ELSE 'pending' END,
      locked_at = NULL,
      locked_by = NULL,
      last_error = LEFT(COALESCE(p_error, 'unknown_error'), 2000),
      updated_at = NOW()
  WHERE id = p_job_id;
END;
$$;

-- ------------------------------------------------------------------------------
-- 8. Trigger Functions on bookings_v2
-- ------------------------------------------------------------------------------

-- Notify New Booking
CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_barber_user_id UUID;
  v_owner_user_id  UUID;
  v_barber_payload JSONB;
  v_owner_payload  JSONB;
BEGIN
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  IF NEW.staff_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT ss.user_id INTO v_barber_user_id
  FROM public.shop_staff ss
  WHERE ss.id = NEW.staff_id AND ss.is_active = true;

  SELECT s.owner_id INTO v_owner_user_id
  FROM public.shops_v2 s
  WHERE s.id = NEW.shop_id;

  v_barber_payload := jsonb_build_object(
    'booking_id',   NEW.id,
    'shop_id',      NEW.shop_id,
    'staff_id',     NEW.staff_id,
    'client_name',  NEW.client_name,
    'client_phone', NEW.client_phone,
    'booking_date', NEW.booking_date,
    'booking_time', COALESCE(NEW.display_start_time, NEW.start_time),
    'route',        '/barber/timeline'
  );

  v_owner_payload := jsonb_build_object(
    'booking_id',   NEW.id,
    'shop_id',      NEW.shop_id,
    'staff_id',     NEW.staff_id,
    'client_name',  NEW.client_name,
    'client_phone', NEW.client_phone,
    'booking_date', NEW.booking_date,
    'booking_time', COALESCE(NEW.display_start_time, NEW.start_time),
    'route',        '/owner/bookings'
  );

  IF v_barber_user_id IS NOT NULL THEN
    INSERT INTO public.notification_jobs (
      booking_id, recipient_user_id, staff_id, type,
      scheduled_for, idempotency_key,
      status, payload, updated_at
    ) VALUES (
      NEW.id, v_barber_user_id, NEW.staff_id,
      'booking_new',
      NOW(),
      NEW.id::text || ':booking_new:barber',
      'pending', v_barber_payload, NOW()
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  IF v_owner_user_id IS NOT NULL AND v_owner_user_id != v_barber_user_id THEN
    INSERT INTO public.notification_jobs (
      booking_id, recipient_user_id, staff_id, type,
      scheduled_for, idempotency_key,
      status, payload, updated_at
    ) VALUES (
      NEW.id, v_owner_user_id, NEW.staff_id,
      'booking_new',
      NOW(),
      NEW.id::text || ':booking_new:owner',
      'pending', v_owner_payload, NOW()
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Schedule Arrival Reminders
CREATE OR REPLACE FUNCTION public.schedule_booking_notification_jobs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_recipient_user_id UUID;
  v_booking_time TIME;
  v_scheduled_for TIMESTAMPTZ;
  v_payload JSONB;
BEGIN
  IF NEW.staff_id IS NULL OR NEW.booking_date IS NULL THEN
    RETURN NEW;
  END IF;

  v_booking_time := COALESCE(NEW.display_start_time, NEW.start_time);
  IF v_booking_time IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT ss.user_id
  INTO v_recipient_user_id
  FROM public.shop_staff ss
  WHERE ss.id = NEW.staff_id
    AND ss.is_active = true;

  IF v_recipient_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status IN ('cancelled', 'completed', 'no_show') THEN
    UPDATE public.notification_jobs
    SET status = 'cancelled',
        cancelled_at = NOW(),
        updated_at = NOW(),
        last_error = 'booking_status_' || NEW.status
    WHERE booking_id = NEW.id
      AND status IN ('pending', 'processing');

    RETURN NEW;
  END IF;

  v_scheduled_for := public.booking_notification_scheduled_for(NEW.booking_date, v_booking_time);
  v_payload := jsonb_build_object(
    'booking_id', NEW.id,
    'shop_id', NEW.shop_id,
    'staff_id', NEW.staff_id,
    'client_name', NEW.client_name,
    'client_phone', NEW.client_phone,
    'booking_date', NEW.booking_date,
    'booking_time', v_booking_time
  );

  INSERT INTO public.notification_jobs (
    booking_id,
    recipient_user_id,
    staff_id,
    type,
    scheduled_for,
    idempotency_key,
    status,
    payload,
    updated_at
  ) VALUES (
    NEW.id,
    v_recipient_user_id,
    NEW.staff_id,
    'booking_arrival_check',
    v_scheduled_for,
    NEW.id::text || ':booking_arrival_check',
    'pending',
    v_payload,
    NOW()
  )
  ON CONFLICT (idempotency_key)
  DO UPDATE SET
    recipient_user_id = EXCLUDED.recipient_user_id,
    staff_id = EXCLUDED.staff_id,
    scheduled_for = EXCLUDED.scheduled_for,
    status = 'pending',
    cancelled_at = NULL,
    locked_at = NULL,
    locked_by = NULL,
    sent_at = NULL,
    last_error = NULL,
    payload = EXCLUDED.payload,
    updated_at = NOW()
  WHERE NOT (
    notification_jobs.status = 'sent'
    AND notification_jobs.scheduled_for = EXCLUDED.scheduled_for
  );

  INSERT INTO public.notification_jobs (
    booking_id,
    recipient_user_id,
    staff_id,
    type,
    scheduled_for,
    idempotency_key,
    status,
    payload,
    updated_at
  ) VALUES (
    NEW.id,
    v_recipient_user_id,
    NEW.staff_id,
    'booking_arrival_followup',
    v_scheduled_for + INTERVAL '5 minutes',
    NEW.id::text || ':booking_arrival_followup',
    'pending',
    v_payload,
    NOW()
  )
  ON CONFLICT (idempotency_key)
  DO UPDATE SET
    recipient_user_id = EXCLUDED.recipient_user_id,
    staff_id = EXCLUDED.staff_id,
    scheduled_for = EXCLUDED.scheduled_for,
    status = 'pending',
    cancelled_at = NULL,
    locked_at = NULL,
    locked_by = NULL,
    sent_at = NULL,
    last_error = NULL,
    payload = EXCLUDED.payload,
    updated_at = NOW()
  WHERE NOT (
    notification_jobs.status = 'sent'
    AND notification_jobs.scheduled_for = EXCLUDED.scheduled_for
  );

  RETURN NEW;
END;
$$;

-- Cancel Arrival Reminders
CREATE OR REPLACE FUNCTION public.cancel_arrival_confirm_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status IS DISTINCT FROM 'pending' THEN
    UPDATE public.notification_jobs
    SET status = 'cancelled',
        cancelled_at = NOW(),
        updated_at = NOW(),
        last_error = 'booking_left_pending'
    WHERE booking_id = NEW.id
      AND type = 'arrival_confirm_reminder'
      AND status IN ('pending', 'processing');
  END IF;
  RETURN NEW;
END;
$$;

-- Cancel Waiting Reminders
CREATE OR REPLACE FUNCTION public.cancel_waiting_confirm_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.status = 'waiting_time' AND NEW.status IS DISTINCT FROM 'waiting_time' THEN
    UPDATE public.notification_jobs
    SET status = 'cancelled',
        cancelled_at = NOW(),
        updated_at = NOW(),
        last_error = 'booking_left_waiting'
    WHERE booking_id = NEW.id
      AND type = 'waiting_confirm_reminder'
      AND status IN ('pending', 'processing');
  END IF;
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. Attach Triggers to bookings_v2
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_notify_new_booking ON public.bookings_v2;
CREATE TRIGGER trg_notify_new_booking
    AFTER INSERT ON public.bookings_v2
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_booking();

DROP TRIGGER IF EXISTS trg_schedule_booking_notification_jobs ON public.bookings_v2;
CREATE TRIGGER trg_schedule_booking_notification_jobs
    AFTER INSERT OR UPDATE ON public.bookings_v2
    FOR EACH ROW
    EXECUTE FUNCTION public.schedule_booking_notification_jobs();

DROP TRIGGER IF EXISTS trg_cancel_arrival_reminders ON public.bookings_v2;
CREATE TRIGGER trg_cancel_arrival_reminders
    AFTER UPDATE ON public.bookings_v2
    FOR EACH ROW
    EXECUTE FUNCTION public.cancel_arrival_confirm_reminders();

DROP TRIGGER IF EXISTS trg_cancel_waiting_reminders ON public.bookings_v2;
CREATE TRIGGER trg_cancel_waiting_reminders
    AFTER UPDATE ON public.bookings_v2
    FOR EACH ROW
    EXECUTE FUNCTION public.cancel_waiting_confirm_reminders();

-- ------------------------------------------------------------------------------
-- 10. Grants
-- ------------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_devices TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;

GRANT ALL ON public.push_devices TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.notification_jobs TO service_role;
GRANT ALL ON public.notification_delivery_attempts TO service_role;

GRANT EXECUTE ON FUNCTION public.booking_notification_scheduled_for TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_due_booking_notification_jobs TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_notification_job_sent TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_notification_job_failed TO service_role;
