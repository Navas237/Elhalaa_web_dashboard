-- ═══════════════════════════════════════════════════════════════════════════════
-- MULTI-TENANT ARCHITECTURE & COMPREHENSIVE SECURITY FIX
-- ═══════════════════════════════════════════════════════════════════════════════
-- المشروع: Barber Shop & Salon Platform (Multi-Tenant Branch)
-- الوصف: ملف تصحيحي وتأسيسي شامل يُعالج:
--   1. إنشاء وضبط بنية الـ Multi-Tenant (جداول tenants و tenant_settings والأعمدة والفهارس).
--   2. ربط وترحيل البيانات الحالية (Data Backfill) بحيث لا يبقى أي سجل معلق بـ NULL.
--   3. تثبيت Triggers تلقائية لضمان تعيين tenant_id تلقائياً لأي سجل جديد.
--   4. إزالة السياسات المفتوحة الخطرة (P0 & P1) وضبط سياسات RLS لعزل كل مستأجر.
--   5. تأمين دوال الـ RPC ذات الصلاحيات العالية (SECURITY DEFINER) وضبط مسار البحث search_path.
--   6. إصلاح الـ View العامة public_profiles لتصبح SECURITY INVOKER.
-- ═══════════════════════════════════════════════════════════════════════════════

-- تفعيل الـ Extensions الأساسية
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. الهيكل الأساسي للـ Multi-Tenant (Tables & Columns)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1.1 جدول المستأجرين (الصالونات)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    custom_domain TEXT UNIQUE,
    timezone TEXT NOT NULL DEFAULT 'Africa/Cairo',
    is_active BOOLEAN NOT NULL DEFAULT true,
    allow_barber_self_signup BOOLEAN NOT NULL DEFAULT true,
    barber_signup_requires_approval BOOLEAN NOT NULL DEFAULT false,
    branding JSONB NOT NULL DEFAULT '{"logo_url": null, "primary_color": "#000000"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 جدول إعدادات الهوية والتخصيص للمستأجر
CREATE TABLE IF NOT EXISTS public.tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_name TEXT NOT NULL DEFAULT 'صالون الحلاقة',
    logo_url TEXT,
    cover_image_url TEXT,
    primary_color TEXT NOT NULL DEFAULT '#E8192C',
    badge_text TEXT DEFAULT 'صالون الحلاقة والعناية بالرجل',
    hero_title TEXT DEFAULT 'احجز موعدك في',
    tagline TEXT DEFAULT 'أرقى صالون بالمنطقة',
    description TEXT DEFAULT 'اختر حلاقك المفضل، وحدد الخدمة والوقت المناسب — كل ذلك في أقل من دقيقة.',
    phone_number TEXT,
    whatsapp_number TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.3 إضافة أعمدة الـ Multi-Tenant للجداول التشغيلية (إن لم تكن مضافة)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bound_tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.shops_v2 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.shop_staff ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.working_hours ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.bookings_v2 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 1.4 فهارس الأداء والعزل (Composite & Foreign Key Indexes)
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_shops_v2_tenant ON public.shops_v2(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shop_staff_tenant_user ON public.shop_staff(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_services_tenant_shop ON public.services(tenant_id, shop_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_tenant_shop ON public.working_hours(tenant_id, shop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_tenant_shop_time ON public.bookings_v2(tenant_id, shop_id, start_time);
CREATE INDEX IF NOT EXISTS idx_profiles_bound_tenant ON public.profiles(bound_tenant_id) WHERE bound_tenant_id IS NOT NULL;

-- فهارس المفاتيح الخارجية لتسريع الربط وعمليات Cascade Delete ومنع الـ Seq Scans
CREATE INDEX IF NOT EXISTS idx_barber_blocked_times_created_by ON public.barber_blocked_times(created_by);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_service_id ON public.bookings_v2(service_id);
CREATE INDEX IF NOT EXISTS idx_payments_v2_user_id ON public.payments_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_v2_wallet_tx_id ON public.payments_v2(wallet_tx_id);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_owner_id ON public.tenant_settings(owner_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. ربط وترحيل البيانات الحالية (Data Backfill)
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    -- 2.1 ربط الفروع بالـ Tenant المقابل بناءً على مالك الصالون
    UPDATE public.shops_v2 s
    SET tenant_id = t.id
    FROM public.tenants t
    WHERE s.owner_id = t.owner_id
      AND s.tenant_id IS NULL;

    -- 2.2 ملء tenant_id لطاقم العمل من الفرع التابعين له
    UPDATE public.shop_staff ss
    SET tenant_id = s.tenant_id
    FROM public.shops_v2 s
    WHERE ss.shop_id = s.id
      AND ss.tenant_id IS NULL
      AND s.tenant_id IS NOT NULL;

    -- 2.3 ملء tenant_id للخدمات من الفرع التابعة له
    UPDATE public.services srv
    SET tenant_id = s.tenant_id
    FROM public.shops_v2 s
    WHERE srv.shop_id = s.id
      AND srv.tenant_id IS NULL
      AND s.tenant_id IS NOT NULL;

    -- 2.4 ملء tenant_id لساعات العمل
    UPDATE public.working_hours wh
    SET tenant_id = s.tenant_id
    FROM public.shops_v2 s
    WHERE wh.shop_id = s.id
      AND wh.tenant_id IS NULL
      AND s.tenant_id IS NOT NULL;

    -- 2.5 ملء tenant_id للحجوزات
    UPDATE public.bookings_v2 b
    SET tenant_id = s.tenant_id
    FROM public.shops_v2 s
    WHERE b.shop_id = s.id
      AND b.tenant_id IS NULL
      AND s.tenant_id IS NOT NULL;

    -- 2.6 ربط أصحاب الصالونات بـ Tenant في ملفاتهم الشخصية
    UPDATE public.profiles p
    SET bound_tenant_id = t.id
    FROM public.tenants t
    WHERE p.id = t.owner_id
      AND p.bound_tenant_id IS NULL;

    -- 2.7 ربط الموظفين والحلاقين بالـ Tenant في ملفاتهم الشخصية
    UPDATE public.profiles p
    SET bound_tenant_id = ss.tenant_id
    FROM public.shop_staff ss
    WHERE p.id = ss.user_id
      AND p.bound_tenant_id IS NULL
      AND ss.tenant_id IS NOT NULL;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. تريجرز التعبئة التلقائية والعزل (Auto-Tenant Triggers)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 3.1 دالة عامة لتعيين وفرض tenant_id تلقائياً من الفرع shop_id ومنع التلاعب
CREATE OR REPLACE FUNCTION public.fn_auto_set_tenant_from_shop()
RETURNS TRIGGER AS $$
DECLARE
    v_shop_tenant_id UUID;
BEGIN
    IF NEW.shop_id IS NOT NULL THEN
        SELECT tenant_id INTO v_shop_tenant_id 
        FROM public.shops_v2 
        WHERE id = NEW.shop_id;

        -- التحقق الصارم: إذا تم تمرير tenant_id مختلف عن مستأجر الفرع، نرفض العملية لمنع خلط البيانات
        IF NEW.tenant_id IS NOT NULL AND v_shop_tenant_id IS NOT NULL AND NEW.tenant_id != v_shop_tenant_id THEN
            RAISE EXCEPTION 'تعارض في بيانات المستأجر: الفرع المحدد لا يتبع هذا المستأجر';
        END IF;

        -- فرض الـ tenant_id الصحيح التابع للفرع إجبارياً
        NEW.tenant_id := v_shop_tenant_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ربط التريجر بـ shop_staff
DROP TRIGGER IF EXISTS trg_set_staff_tenant ON public.shop_staff;
CREATE TRIGGER trg_set_staff_tenant
BEFORE INSERT OR UPDATE OF shop_id ON public.shop_staff
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_set_tenant_from_shop();

-- ربط التريجر بـ services
DROP TRIGGER IF EXISTS trg_set_services_tenant ON public.services;
CREATE TRIGGER trg_set_services_tenant
BEFORE INSERT OR UPDATE OF shop_id ON public.services
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_set_tenant_from_shop();

-- ربط التريجر بـ working_hours
DROP TRIGGER IF EXISTS trg_set_working_hours_tenant ON public.working_hours;
CREATE TRIGGER trg_set_working_hours_tenant
BEFORE INSERT OR UPDATE OF shop_id ON public.working_hours
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_set_tenant_from_shop();

-- 3.2 تحديث دالة وتريجر حماية حجز العميل وفرض عزل المستأجر الصارم
CREATE OR REPLACE FUNCTION public.enforce_client_tenant_binding()
RETURNS trigger AS $$
DECLARE
    v_bound_tenant_id UUID;
    v_shop_tenant_id UUID;
BEGIN
    -- استخراج الـ tenant_id الحقيقي من الفرع إجبارياً
    IF NEW.shop_id IS NOT NULL THEN
        SELECT tenant_id INTO v_shop_tenant_id FROM public.shops_v2 WHERE id = NEW.shop_id;
        
        -- التحقق من عدم التلاعب بمعرف المستأجر إذا تم تمريره صراحة
        IF NEW.tenant_id IS NOT NULL AND v_shop_tenant_id IS NOT NULL AND NEW.tenant_id != v_shop_tenant_id THEN
            RAISE EXCEPTION 'تعارض: معرف المستأجر لا يتطابق مع الفرع المختار';
        END IF;

        NEW.tenant_id := v_shop_tenant_id;
    END IF;

    -- التحقق من عزل العميل: منع العميل المربوط بصالون من الحجز في صالون آخر
    IF NEW.client_id IS NOT NULL THEN
        SELECT bound_tenant_id INTO v_bound_tenant_id FROM public.profiles WHERE id = NEW.client_id;
        IF v_bound_tenant_id IS NOT NULL AND NEW.tenant_id IS NOT NULL AND v_bound_tenant_id != NEW.tenant_id THEN
            RAISE EXCEPTION 'حسابك مربوط بصالون محدد ولا يمكن الحجز في صالون آخر';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_enforce_client_tenant_binding ON public.bookings_v2;
CREATE TRIGGER trg_enforce_client_tenant_binding
BEFORE INSERT OR UPDATE ON public.bookings_v2
FOR EACH ROW EXECUTE FUNCTION public.enforce_client_tenant_binding();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. إصلاح وتأمين وتوحيد سياسات RLS (Row Level Security) وتحسين الأداء
-- ═══════════════════════════════════════════════════════════════════════════════
-- ملاحظة أداء: استخدام (select auth.uid()) بدلاً من auth.uid() المباشر
-- يمنع إعادة تقييم الدالة لكل صف (InitPlan Subquery Optimization) ويسرّع الاستعلامات.

-- 4.1 تأمين جدول الحجوزات bookings_v2
DROP POLICY IF EXISTS "Allow authenticated full access to bookings_v2" ON public.bookings_v2;
DROP POLICY IF EXISTS "bookings_select" ON public.bookings_v2;
DROP POLICY IF EXISTS "bookings_insert" ON public.bookings_v2;
DROP POLICY IF EXISTS "bookings_staff_update" ON public.bookings_v2;
DROP POLICY IF EXISTS "bookings_client_cancel" ON public.bookings_v2;

CREATE POLICY "bookings_select" ON public.bookings_v2
FOR SELECT USING (
    -- 1. العميل صاحب الحجز
    client_id = (select auth.uid())
    -- 2. الحلاق المعين للحجز
    OR staff_id IN (SELECT id FROM public.shop_staff WHERE user_id = (select auth.uid()))
    -- 3. مالك الفرع
    OR shop_id IN (SELECT id FROM public.shops_v2 WHERE owner_id = (select auth.uid()))
    -- 4. مالك الـ Tenant
    OR tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (select auth.uid()))
    -- 5. المشرف العام
    OR is_super_admin()
);

CREATE POLICY "bookings_insert" ON public.bookings_v2
FOR INSERT WITH CHECK (
    (select auth.uid()) IS NOT NULL
    AND (
        -- العميل يحجز لنفسه
        client_id = (select auth.uid())
        -- أو موظف / مالك الفرع يسجل حجز
        OR shop_id IN (SELECT id FROM public.shops_v2 WHERE owner_id = (select auth.uid()))
        OR staff_id IN (SELECT id FROM public.shop_staff WHERE user_id = (select auth.uid()))
        OR is_super_admin()
    )
);

CREATE POLICY "bookings_staff_update" ON public.bookings_v2
FOR UPDATE USING (
    staff_id IN (SELECT id FROM public.shop_staff WHERE user_id = (select auth.uid()))
    OR shop_id IN (SELECT id FROM public.shops_v2 WHERE owner_id = (select auth.uid()))
    OR tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (select auth.uid()))
    OR is_super_admin()
);

CREATE POLICY "bookings_client_cancel" ON public.bookings_v2
FOR UPDATE USING (
    client_id = (select auth.uid())
    AND status IN ('pending', 'confirmed')
)
WITH CHECK (
    client_id = (select auth.uid())
    AND status = 'cancelled'
);

-- تريجر صارم يمنع العميل من تعديل أي بيانات أخرى (السعر، التاريخ، الحلاق، الفرع) أثناء إلغاء الحجز
CREATE OR REPLACE FUNCTION public.fn_prevent_booking_tampering_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.client_id = (select auth.uid()) AND NOT (
        EXISTS (SELECT 1 FROM public.shops_v2 WHERE id = OLD.shop_id AND owner_id = (select auth.uid())) OR
        EXISTS (SELECT 1 FROM public.shop_staff WHERE shop_id = OLD.shop_id AND user_id = (select auth.uid()) AND is_active = true) OR
        is_super_admin()
    )) THEN
        IF NEW.status = 'cancelled' THEN
            IF NEW.shop_id != OLD.shop_id OR
               NEW.staff_id != OLD.staff_id OR
               NEW.service_id IS DISTINCT FROM OLD.service_id OR
               NEW.booking_date != OLD.booking_date OR
               NEW.start_time != OLD.start_time OR
               NEW.end_time != OLD.end_time OR
               NEW.client_id != OLD.client_id OR
               NEW.client_name != OLD.client_name OR
               NEW.client_phone IS DISTINCT FROM OLD.client_phone OR
               NEW.tenant_id IS DISTINCT FROM OLD.tenant_id OR
               NEW.payment_method != OLD.payment_method THEN
                RAISE EXCEPTION 'غير مسموح بتعديل تفاصيل الموعد أثناء الإلغاء';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_booking_tampering ON public.bookings_v2;
CREATE TRIGGER trg_prevent_booking_tampering
BEFORE UPDATE ON public.bookings_v2
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_booking_tampering_on_cancel();

-- 4.2 تأمين جدول profiles وحماية بيانات التواصل (الهاتف والإيميل)
DROP POLICY IF EXISTS "Allow authenticated to read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_view_staff" ON public.profiles;
DROP POLICY IF EXISTS "profiles_view_active_staff" ON public.profiles;
DROP POLICY IF EXISTS "profiles_client_view_staff_booking" ON public.profiles;

-- المستخدم يقرأ ويحدث ملفه الشخصي فقط
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT USING ((select auth.uid()) = id OR is_super_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE USING ((select auth.uid()) = id OR is_super_admin());

-- مالك الصالون أو الفرع يرى ملفات موظفيه كاملة
CREATE POLICY "profiles_owner_view_staff" ON public.profiles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.shop_staff ss
        JOIN public.shops_v2 s ON s.id = ss.shop_id
        WHERE ss.user_id = profiles.id 
          AND (s.owner_id = (select auth.uid()) OR ss.tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (select auth.uid())))
    )
);

-- العميل يرى فقط الحلاق الذي لديه حجز نشط أو سابق معه (لعرض اسم الحلاق في سجل الحجوزات)
-- مع سحب الصلاحيات من anon حتى لا يمكن لأي زائر غير مسجل فحص الملفات
CREATE POLICY "profiles_client_view_staff_booking" ON public.profiles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.bookings_v2 b
        JOIN public.shop_staff ss ON ss.id = b.staff_id
        WHERE ss.user_id = profiles.id
          AND b.client_id = (select auth.uid())
    )
);

REVOKE ALL ON public.profiles FROM anon;

-- 4.3 تأمين جدول shop_staff وإزالة السياسات المكررة
DROP POLICY IF EXISTS "Allow authenticated to read shop_staff" ON public.shop_staff;
DROP POLICY IF EXISTS "staff_select" ON public.shop_staff;
DROP POLICY IF EXISTS "staff_insert" ON public.shop_staff;
DROP POLICY IF EXISTS "staff_update" ON public.shop_staff;
DROP POLICY IF EXISTS "staff_delete" ON public.shop_staff;
DROP POLICY IF EXISTS "staff_manage" ON public.shop_staff;

CREATE POLICY "staff_select" ON public.shop_staff
FOR SELECT USING (
    is_active = true
    OR user_id = (select auth.uid())
    OR shop_id IN (SELECT id FROM public.shops_v2 WHERE owner_id = (select auth.uid()))
    OR tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (select auth.uid()))
    OR is_super_admin()
);

CREATE POLICY "staff_manage" ON public.shop_staff
FOR ALL USING (
    shop_id IN (SELECT id FROM public.shops_v2 WHERE owner_id = (select auth.uid()))
    OR tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (select auth.uid()))
    OR is_super_admin()
);

-- 4.4 تأمين جدول services وتوحيد السياسات
DROP POLICY IF EXISTS "services_manage" ON public.services;
DROP POLICY IF EXISTS "services_public_read" ON public.services;
DROP POLICY IF EXISTS "services_read" ON public.services;
DROP POLICY IF EXISTS "services_select" ON public.services;

CREATE POLICY "services_select" ON public.services
FOR SELECT USING (
    is_active = true
    OR shop_id IN (SELECT id FROM public.shops_v2 WHERE owner_id = (select auth.uid()))
    OR tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (select auth.uid()))
    OR is_super_admin()
);

CREATE POLICY "services_manage" ON public.services
FOR ALL USING (
    shop_id IN (SELECT id FROM public.shops_v2 WHERE owner_id = (select auth.uid()))
    OR tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (select auth.uid()))
    OR is_super_admin()
);

-- 4.5 تأمين وتوحيد سياسات shops_v2 (منع قراءة الفروع غير المفتوحة للعامة)
DROP POLICY IF EXISTS "shops_public_read" ON public.shops_v2;
DROP POLICY IF EXISTS "shops_select" ON public.shops_v2;
DROP POLICY IF EXISTS "shops_insert" ON public.shops_v2;
DROP POLICY IF EXISTS "shops_update" ON public.shops_v2;
DROP POLICY IF EXISTS "shops_manage" ON public.shops_v2;

CREATE POLICY "shops_select" ON public.shops_v2
FOR SELECT USING (
    status = 'open'::shop_status_type
    OR owner_id = (select auth.uid())
    OR tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (select auth.uid()))
    OR is_super_admin()
);

CREATE POLICY "shops_manage" ON public.shops_v2
FOR ALL USING (
    owner_id = (select auth.uid())
    OR tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (select auth.uid()))
    OR is_super_admin()
);

-- 4.6 تأمين وتوحيد جدول working_hours
DROP POLICY IF EXISTS "hours_manage" ON public.working_hours;
DROP POLICY IF EXISTS "hours_select" ON public.working_hours;

CREATE POLICY "hours_select" ON public.working_hours
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.shops_v2 s 
        WHERE s.id = working_hours.shop_id 
          AND (s.status = 'open'::shop_status_type OR s.owner_id = (select auth.uid()))
    )
    OR (select auth.uid()) IS NOT NULL
);

CREATE POLICY "hours_manage" ON public.working_hours
FOR ALL USING (
    shop_id IN (SELECT id FROM public.shops_v2 WHERE owner_id = (select auth.uid()))
    OR tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (select auth.uid()))
    OR is_super_admin()
);

-- 4.7 تأمين وتوحيد جدول tenants
DROP POLICY IF EXISTS "tenants_owner_full" ON public.tenants;
DROP POLICY IF EXISTS "tenants_public_read" ON public.tenants;
DROP POLICY IF EXISTS "Owners can update their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "tenants_select" ON public.tenants;
DROP POLICY IF EXISTS "tenants_manage" ON public.tenants;

CREATE POLICY "tenants_select" ON public.tenants
FOR SELECT USING (
    is_active = true
    OR owner_id = (select auth.uid())
    OR is_super_admin()
);

CREATE POLICY "tenants_manage" ON public.tenants
FOR ALL USING (
    owner_id = (select auth.uid())
    OR is_super_admin()
);

-- 4.8 تأمين وتوحيد جدول tenant_settings (إعدادات الواجهة العامة)
DROP POLICY IF EXISTS "Public read for tenant settings" ON public.tenant_settings;
DROP POLICY IF EXISTS "Owners can insert their tenant settings" ON public.tenant_settings;
DROP POLICY IF EXISTS "Owners can update their tenant settings" ON public.tenant_settings;
DROP POLICY IF EXISTS "tenant_settings_select" ON public.tenant_settings;
DROP POLICY IF EXISTS "tenant_settings_manage" ON public.tenant_settings;

CREATE POLICY "tenant_settings_select" ON public.tenant_settings
FOR SELECT USING (true);

CREATE POLICY "tenant_settings_manage" ON public.tenant_settings
FOR ALL USING (
    owner_id = (select auth.uid())
    OR is_super_admin()
);

-- 4.9 تأمين وتوحيد جدول أوقات الحظر barber_blocked_times
DROP POLICY IF EXISTS "Allow read blocked times" ON public.barber_blocked_times;
DROP POLICY IF EXISTS "Allow staff and owners to manage blocked times" ON public.barber_blocked_times;
DROP POLICY IF EXISTS "blocked_times_select" ON public.barber_blocked_times;
DROP POLICY IF EXISTS "blocked_times_manage" ON public.barber_blocked_times;

CREATE POLICY "blocked_times_select" ON public.barber_blocked_times
FOR SELECT USING (true);

CREATE POLICY "blocked_times_manage" ON public.barber_blocked_times
FOR ALL USING (
    staff_id IN (SELECT id FROM public.shop_staff WHERE user_id = (select auth.uid()))
    OR shop_id IN (SELECT id FROM public.shops_v2 WHERE owner_id = (select auth.uid()))
    OR is_super_admin()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. إصلاح الـ View العامة وتأمين دوال الـ RPC و مسار البحث (search_path)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 5.1 إصلاح الـ View وتحويلها لـ SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, name, avatar_url, role
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 5.2 دوال المحفظة: منع anon والتحقق من ملكية الحساب والمبالغ الموجبة وتثبيت search_path
CREATE OR REPLACE FUNCTION public.rpc_wallet_deduct(
    p_user_id UUID,
    p_amount NUMERIC,
    p_tx_type wallet_tx_type,
    p_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    -- التحقق من صحة المبلغ
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'المبلغ يجب أن يكون أكبر من صفر');
    END IF;

    -- التحقق الأمني من هوية المستدعي (صاحب المحفظة فقط أو المشرف العام)
    IF auth.uid() IS NULL OR (auth.uid() != p_user_id AND NOT is_super_admin()) THEN
        RETURN jsonb_build_object('success', false, 'error', 'غير مصرح لك بالسحب من هذه المحفظة');
    END IF;

    SELECT wallet_balance INTO v_balance
    FROM public.profiles WHERE id = p_user_id FOR UPDATE;

    IF v_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'مستخدم غير موجود');
    END IF;

    IF v_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'رصيد غير كافي', 'balance', v_balance);
    END IF;

    v_new_balance := v_balance - p_amount;

    UPDATE public.profiles SET wallet_balance = v_new_balance WHERE id = p_user_id;

    INSERT INTO public.wallet_transactions (user_id, amount, tx_type, reference_id, description, balance_after)
    VALUES (p_user_id, -p_amount, p_tx_type, p_reference_id, p_description, v_new_balance);

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.rpc_wallet_deposit(
    p_user_id UUID,
    p_amount NUMERIC,
    p_tx_type wallet_tx_type,
    p_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_new_balance NUMERIC;
BEGIN
    -- التحقق من صحة المبلغ
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'المبلغ يجب أن يكون أكبر من صفر');
    END IF;

    -- التحقق الأمني الصارم: صاحب الحساب نفسه أو المشرف العام فقط
    IF auth.uid() IS NULL OR (auth.uid() != p_user_id AND NOT is_super_admin()) THEN
        RETURN jsonb_build_object('success', false, 'error', 'غير مصرح لك بإجراء إيداع في هذا الحساب');
    END IF;

    UPDATE public.profiles
    SET wallet_balance = wallet_balance + p_amount
    WHERE id = p_user_id
    RETURNING wallet_balance INTO v_new_balance;

    INSERT INTO public.wallet_transactions (user_id, amount, tx_type, reference_id, description, balance_after)
    VALUES (p_user_id, p_amount, p_tx_type, p_reference_id, p_description, v_new_balance);

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5.3 دالة تغذية حجوزات المالك: التحقق من أن المستدعي هو المالك الفعلي
CREATE OR REPLACE FUNCTION public.get_owner_bookings_feed(
    p_owner_id uuid,
    p_shop_id uuid DEFAULT NULL::uuid,
    p_barber_id uuid DEFAULT NULL::uuid,
    p_status_filter text DEFAULT NULL::text,
    p_date_from date DEFAULT NULL::date,
    p_date_to date DEFAULT NULL::date,
    p_search text DEFAULT NULL::text,
    p_page integer DEFAULT 1,
    p_page_size integer DEFAULT 20
)
RETURNS TABLE(
    id uuid, shop_id uuid, shop_name text, staff_id uuid, barber_id uuid, 
    barber_name text, user_id uuid, client_id uuid, client_name text, 
    client_phone text, service_id uuid, service_name text, service_price numeric, 
    service_duration integer, date_of_booking date, start_time text, end_time text, 
    display_start_time text, status text, payment_method text, notes text, 
    created_at timestamp with time zone, total_count bigint
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_offset integer := (GREATEST(p_page, 1) - 1) * GREATEST(p_page_size, 1);
BEGIN
  -- حماية أمنية: منع أي مستخدم من التلصص على بيانات صالون ليس ملكه
  IF auth.uid() IS NULL OR (auth.uid() != p_owner_id AND NOT is_super_admin()) THEN
    RAISE EXCEPTION 'غير مصرح لك بالاطلاع على حجوزات هذا المالك';
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT 
      b.id,
      b.shop_id,
      s.name AS shop_name,
      b.staff_id,
      ss.user_id AS barber_id,
      p.name AS barber_name,
      ss.user_id,
      b.client_id,
      b.client_name,
      b.client_phone,
      b.service_id,
      srv.name AS service_name,
      srv.price AS service_price,
      srv.duration_minutes AS service_duration,
      b.booking_date::date AS date_of_booking,
      b.start_time::text AS start_time,
      b.end_time::text AS end_time,
      COALESCE(b.display_start_time, b.start_time::text) AS display_start_time,
      b.status::text,
      b.payment_method::text,
      b.notes,
      b.created_at
    FROM public.bookings_v2 b
    JOIN public.shops_v2 s ON s.id = b.shop_id
    LEFT JOIN public.shop_staff ss ON ss.id = b.staff_id
    LEFT JOIN public.profiles p ON p.id = ss.user_id
    LEFT JOIN public.services srv ON srv.id = b.service_id
    WHERE s.owner_id = p_owner_id
      AND (p_shop_id IS NULL OR b.shop_id = p_shop_id)
      AND (p_barber_id IS NULL OR ss.user_id = p_barber_id)
      AND (p_status_filter IS NULL OR p_status_filter = 'all' OR b.status::text = p_status_filter)
      AND (p_date_from IS NULL OR b.booking_date::date >= p_date_from)
      AND (p_date_to IS NULL OR b.booking_date::date <= p_date_to)
      AND (p_search IS NULL OR b.client_name ILIKE '%' || p_search || '%' OR b.client_phone ILIKE '%' || p_search || '%')
  ),
  total AS (
    SELECT count(*)::bigint AS count FROM filtered
  )
  SELECT 
    f.*,
    t.count AS total_count
  FROM filtered f, total t
  ORDER BY f.date_of_booking DESC, f.start_time DESC
  LIMIT p_page_size OFFSET v_offset;
END;
$$;

-- 5.4 تأمين دالة إنشاء الحجز من الطاقم create_booking_by_staff
CREATE OR REPLACE FUNCTION public.create_booking_by_staff(
    p_shop_id uuid,
    p_staff_id uuid,
    p_client_id uuid DEFAULT NULL::uuid,
    p_client_name text DEFAULT 'عميل زائر'::text,
    p_client_phone text DEFAULT NULL::text,
    p_service_id uuid DEFAULT NULL::uuid,
    p_booking_date date DEFAULT CURRENT_DATE,
    p_start_time text DEFAULT NULL::text,
    p_end_time text DEFAULT NULL::text,
    p_display_start_time text DEFAULT NULL::text,
    p_status text DEFAULT 'pending'::text,
    p_payment_method text DEFAULT 'cash'::text,
    p_notes text DEFAULT NULL::text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_new_booking record;
  v_status public.booking_status;
  v_payment_method public.payment_method_type;
  v_start_time time;
  v_end_time time;
  v_tenant_id uuid;
BEGIN
  -- التحقق من صلاحية المستدعي (يجب أن يكون مالك المحل أو موظف فيه)
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'يجب تسجيل الدخول لإجراء هذا الحجز');
  END IF;

  IF NOT (
    EXISTS (SELECT 1 FROM public.shops_v2 WHERE id = p_shop_id AND owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.shop_staff WHERE shop_id = p_shop_id AND user_id = auth.uid() AND is_active = true) OR
    is_super_admin()
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'غير مصرح لك بإنشاء حجز نيابة عن طاقم العمل');
  END IF;

  SELECT tenant_id INTO v_tenant_id FROM public.shops_v2 WHERE id = p_shop_id;

  IF p_start_time IS NOT NULL AND p_start_time <> '' THEN
    v_start_time := p_start_time::time;
  END IF;

  IF p_end_time IS NOT NULL AND p_end_time <> '' THEN
    v_end_time := p_end_time::time;
  END IF;

  BEGIN
    v_status := p_status::public.booking_status;
  EXCEPTION WHEN OTHERS THEN
    v_status := 'pending'::public.booking_status;
  END;

  BEGIN
    v_payment_method := p_payment_method::public.payment_method_type;
  EXCEPTION WHEN OTHERS THEN
    v_payment_method := 'cash'::public.payment_method_type;
  END;

  INSERT INTO public.bookings_v2 (
    tenant_id, shop_id, staff_id, client_id, client_name, client_phone,
    service_id, booking_date, start_time, end_time, display_start_time,
    status, payment_method, notes, created_at, updated_at
  ) VALUES (
    v_tenant_id, p_shop_id, p_staff_id, p_client_id, COALESCE(p_client_name, 'عميل زائر'),
    p_client_phone, p_service_id, COALESCE(p_booking_date, CURRENT_DATE),
    v_start_time, v_end_time, COALESCE(p_display_start_time, p_start_time),
    v_status, v_payment_method, p_notes, now(), now()
  ) RETURNING * INTO v_new_booking;

  RETURN to_jsonb(v_new_booking);
END;
$$;

-- 5.5 دالة حجز العميل المستقلة (create_customer_booking) متوافقة مع الـ Multi-Tenant
CREATE OR REPLACE FUNCTION public.create_customer_booking(
  p_shop_id uuid,
  p_staff_id uuid,
  p_service_id uuid,
  p_booking_date date,
  p_start_time time without time zone,
  p_end_time time without time zone,
  p_display_start_time time without time zone DEFAULT NULL::time without time zone
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email_confirmed timestamptz;
  v_email text;
  v_name text;
  v_phone text;
  v_booking bookings_v2%ROWTYPE;
  v_tenant_id uuid;
  v_bound_tenant_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'AUTH_REQUIRED');
  END IF;

  SELECT u.email_confirmed_at, u.email INTO v_email_confirmed, v_email
  FROM auth.users u WHERE u.id = v_uid;
  IF v_email_confirmed IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'EMAIL_NOT_VERIFIED');
  END IF;

  -- استخراج tenant_id الخاص بالفرع
  SELECT tenant_id INTO v_tenant_id FROM public.shops_v2 WHERE id = p_shop_id;

  -- فحص ارتباط العميل بصالون آخر
  SELECT bound_tenant_id INTO v_bound_tenant_id FROM public.profiles WHERE id = v_uid;
  IF v_bound_tenant_id IS NOT NULL AND v_tenant_id IS NOT NULL AND v_bound_tenant_id != v_tenant_id THEN
    RETURN jsonb_build_object('success', false, 'code', 'TENANT_MISMATCH', 'message', 'حسابك مسجل في صالون آخر');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.bookings_v2
    WHERE client_id = v_uid AND status IN ('pending'::booking_status, 'waiting_time'::booking_status)
  ) THEN
    RETURN jsonb_build_object('success', false, 'code', 'PENDING_BOOKING_EXISTS');
  END IF;

  SELECT p.name, p.phone INTO v_name, v_phone FROM public.profiles p WHERE p.id = v_uid;
  IF v_name IS NULL THEN
    INSERT INTO public.profiles (id, email, name, role, bound_tenant_id)
    VALUES (v_uid, COALESCE(v_email, ''), 'عميل', 'client'::user_role, v_tenant_id)
    ON CONFLICT (id) DO UPDATE SET bound_tenant_id = COALESCE(profiles.bound_tenant_id, EXCLUDED.bound_tenant_id);
    SELECT p.name, p.phone INTO v_name, v_phone FROM public.profiles p WHERE p.id = v_uid;
  ELSIF v_bound_tenant_id IS NULL AND v_tenant_id IS NOT NULL THEN
    -- ربط العميل بالصالون عند أول حجز
    UPDATE public.profiles SET bound_tenant_id = v_tenant_id WHERE id = v_uid;
  END IF;

  BEGIN
    INSERT INTO public.bookings_v2 (
      tenant_id, shop_id, staff_id, service_id, client_id,
      client_name, client_phone, booking_date,
      start_time, end_time, display_start_time,
      status, payment_method
    )
    VALUES (
      v_tenant_id, p_shop_id, p_staff_id, p_service_id, v_uid,
      COALESCE(v_name, 'عميل'), v_phone, p_booking_date,
      p_start_time, p_end_time, COALESCE(p_display_start_time, p_start_time),
      'pending'::booking_status, 'cash'::payment_method_type
    )
    RETURNING * INTO v_booking;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM ILIKE '%pending_booking_exists%'
       OR SQLERRM ILIKE '%active unconfirmed booking%' THEN
      RETURN jsonb_build_object('success', false, 'code', 'PENDING_BOOKING_EXISTS');
    ELSIF SQLERRM ILIKE '%overlap%'
       OR SQLERRM ILIKE '%double booking%'
       OR SQLSTATE = '23P01' THEN
      RETURN jsonb_build_object('success', false, 'code', 'SLOT_TAKEN');
    ELSE
      RAISE;
    END IF;
  END;

  RETURN jsonb_build_object('success', true, 'booking', row_to_json(v_booking));
END;
$$;

-- 5.6 تأمين دوال الفروع ومنع تسريب بيانات العملاء والموظفين
CREATE OR REPLACE FUNCTION public.get_shop_bookings(
    p_shop_id uuid,
    p_page integer DEFAULT 1,
    p_page_size integer DEFAULT 20,
    p_status_filter text DEFAULT NULL::text,
    p_barber_id uuid DEFAULT NULL::uuid,
    p_date_from date DEFAULT NULL::date,
    p_date_to date DEFAULT NULL::date
)
RETURNS TABLE(
    barber_id uuid, barber_name text, client_id uuid, client_name text, 
    client_phone text, created_at timestamp with time zone, date_of_booking date, 
    display_start_time text, end_time text, id uuid, notes text, payment_method text, 
    service_duration integer, service_id uuid, service_name text, service_price numeric, 
    shop_id uuid, staff_id uuid, start_time text, status text, total_count bigint, user_id uuid
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_offset integer := (GREATEST(p_page, 1) - 1) * GREATEST(p_page_size, 1);
BEGIN
  -- التحقق الأمني: يجب أن يكون المستدعي مالك المحل أو أحد موظفيه النشطين أو المشرف العام
  IF auth.uid() IS NULL OR NOT (
      EXISTS (SELECT 1 FROM public.shops_v2 WHERE id = p_shop_id AND owner_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.shop_staff WHERE shop_id = p_shop_id AND user_id = auth.uid() AND is_active = true) OR
      EXISTS (SELECT 1 FROM public.shops_v2 s JOIN public.tenants t ON t.id = s.tenant_id WHERE s.id = p_shop_id AND t.owner_id = auth.uid()) OR
      is_super_admin()
  ) THEN
      RAISE EXCEPTION 'غير مصرح لك بالاطلاع على حجوزات هذا الفرع';
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT 
      ss.user_id AS barber_id,
      p.name AS barber_name,
      b.client_id,
      b.client_name,
      b.client_phone,
      b.created_at,
      b.booking_date::date AS date_of_booking,
      COALESCE(b.display_start_time, b.start_time::text) AS display_start_time,
      b.end_time::text AS end_time,
      b.id,
      b.notes,
      b.payment_method::text,
      srv.duration_minutes AS service_duration,
      b.service_id,
      srv.name AS service_name,
      srv.price AS service_price,
      b.shop_id,
      b.staff_id,
      b.start_time::text AS start_time,
      b.status::text,
      ss.user_id
    FROM public.bookings_v2 b
    LEFT JOIN public.shop_staff ss ON ss.id = b.staff_id
    LEFT JOIN public.profiles p ON p.id = ss.user_id
    LEFT JOIN public.services srv ON srv.id = b.service_id
    WHERE b.shop_id = p_shop_id
      AND (p_barber_id IS NULL OR ss.user_id = p_barber_id)
      AND (p_status_filter IS NULL OR p_status_filter = 'all' OR b.status::text = p_status_filter)
      AND (p_date_from IS NULL OR b.booking_date::date >= p_date_from)
      AND (p_date_to IS NULL OR b.booking_date::date <= p_date_to)
  ),
  total AS (
    SELECT count(*)::bigint AS count FROM filtered
  )
  SELECT 
    f.barber_id,
    f.barber_name,
    f.client_id,
    f.client_name,
    f.client_phone,
    f.created_at,
    f.date_of_booking,
    f.display_start_time,
    f.end_time,
    f.id,
    f.notes,
    f.payment_method,
    f.service_duration,
    f.service_id,
    f.service_name,
    f.service_price,
    f.shop_id,
    f.staff_id,
    f.start_time,
    f.status,
    t.count AS total_count,
    f.user_id
  FROM filtered f, total t
  ORDER BY f.date_of_booking DESC, f.start_time DESC
  LIMIT p_page_size OFFSET v_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_shop_today_bookings(p_shop_id uuid)
RETURNS TABLE(
    barber_id uuid, barber_name text, client_id uuid, client_name text, 
    client_phone text, created_at timestamp with time zone, date_of_booking date, 
    display_start_time text, end_time text, id uuid, notes text, payment_method text, 
    service_duration integer, service_id uuid, service_name text, service_price numeric, 
    shop_id uuid, staff_id uuid, start_time text, status text, user_id uuid
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- التحقق الأمني: مالك المحل أو طاقم العمل المصرح به فقط
  IF auth.uid() IS NULL OR NOT (
      EXISTS (SELECT 1 FROM public.shops_v2 WHERE id = p_shop_id AND owner_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.shop_staff WHERE shop_id = p_shop_id AND user_id = auth.uid() AND is_active = true) OR
      EXISTS (SELECT 1 FROM public.shops_v2 s JOIN public.tenants t ON t.id = s.tenant_id WHERE s.id = p_shop_id AND t.owner_id = auth.uid()) OR
      is_super_admin()
  ) THEN
      RAISE EXCEPTION 'غير مصرح لك بالاطلاع على حجوزات هذا الفرع';
  END IF;

  RETURN QUERY
  SELECT 
    ss.user_id AS barber_id,
    p.name AS barber_name,
    b.client_id,
    b.client_name,
    b.client_phone,
    b.created_at,
    b.booking_date::date AS date_of_booking,
    COALESCE(b.display_start_time, b.start_time::text) AS display_start_time,
    b.end_time::text AS end_time,
    b.id,
    b.notes,
    b.payment_method::text,
    srv.duration_minutes AS service_duration,
    b.service_id,
    srv.name AS service_name,
    srv.price AS service_price,
    b.shop_id,
    b.staff_id,
    b.start_time::text AS start_time,
    b.status::text,
    ss.user_id
  FROM public.bookings_v2 b
  LEFT JOIN public.shop_staff ss ON ss.id = b.staff_id
  LEFT JOIN public.profiles p ON p.id = ss.user_id
  LEFT JOIN public.services srv ON srv.id = b.service_id
  WHERE b.shop_id = p_shop_id
    AND b.booking_date::text = CURRENT_DATE::text
  ORDER BY b.start_time ASC;
END;
$$;

-- تأمين بيانات الطاقم: إخفاء الإيميل والتليفون عن العامة وإظهارها فقط للمالك والموظفين المصرح لهم
CREATE OR REPLACE FUNCTION public.get_shop_staff_with_profiles(p_shop_id uuid)
RETURNS TABLE(
    avatar_url text, email text, hired_at timestamp with time zone, 
    is_active boolean, name text, phone text, role text, 
    shop_id uuid, staff_id uuid, user_id uuid
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_is_authorized boolean;
BEGIN
    SELECT (
        auth.uid() IS NOT NULL AND (
            EXISTS (SELECT 1 FROM public.shops_v2 WHERE id = p_shop_id AND owner_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.shop_staff WHERE shop_id = p_shop_id AND user_id = auth.uid() AND is_active = true) OR
            EXISTS (SELECT 1 FROM public.shops_v2 s JOIN public.tenants t ON t.id = s.tenant_id WHERE s.id = p_shop_id AND t.owner_id = auth.uid()) OR
            is_super_admin()
        )
    ) INTO v_is_authorized;

    RETURN QUERY
    SELECT 
        p.avatar_url,
        CASE WHEN v_is_authorized THEN p.email ELSE NULL END AS email,
        ss.hired_at,
        ss.is_active,
        p.name,
        CASE WHEN v_is_authorized THEN p.phone ELSE NULL END AS phone,
        ss.role::text,
        ss.shop_id,
        ss.id AS staff_id,
        ss.user_id
    FROM public.shop_staff ss
    JOIN public.profiles p ON p.id = ss.user_id
    WHERE ss.shop_id = p_shop_id
      AND (v_is_authorized OR ss.is_active = true)
    ORDER BY ss.hired_at DESC;
END;
$$;

-- 5.7 تثبيت مسار البحث search_path لجميع الدوال المتبقية
ALTER FUNCTION public.make_time_range(time, time) SET search_path = public;
ALTER FUNCTION public.fn_protect_profile_fields() SET search_path = public;
ALTER FUNCTION public.bind_client_to_tenant(text) SET search_path = public;
ALTER FUNCTION public.block_barber_time_slot(uuid, uuid, date, time, time, varchar, text) SET search_path = public;
ALTER FUNCTION public.get_owner_dashboard_summary(uuid) SET search_path = public;
ALTER FUNCTION public.get_owner_due_pending_count(uuid) SET search_path = public;
ALTER FUNCTION public.get_owner_due_waiting_count(uuid) SET search_path = public;
ALTER FUNCTION public.move_barber_to_branch(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.update_working_hours(uuid, jsonb) SET search_path = public;
ALTER FUNCTION public.get_server_time(text) SET search_path = public;
ALTER FUNCTION public.is_tenant_owner(uuid) SET search_path = public;
ALTER FUNCTION public.is_tenant_staff(uuid) SET search_path = public;

-- 5.8 سحب صلاحيات التنفيذ من anon و PUBLIC وإعطاؤها فقط لـ authenticated
REVOKE EXECUTE ON FUNCTION public.rpc_wallet_deduct FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.rpc_wallet_deposit FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_owner_bookings_feed FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.create_booking_by_staff FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_owner_dashboard_summary FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_owner_due_pending_count FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_owner_due_waiting_count FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.move_barber_to_branch FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.update_working_hours FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.block_barber_time_slot FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.bind_client_to_tenant FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_shop_bookings FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_shop_today_bookings FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_tenant_owner FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_tenant_staff FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.create_customer_booking FROM anon, public;

-- سحب الصلاحيات من trigger functions نهائياً
REVOKE EXECUTE ON FUNCTION public.fn_protect_profile_fields FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_client_tenant_binding FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fn_auto_set_tenant_from_shop FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fn_prevent_booking_tampering_on_cancel FROM anon, authenticated, public;

-- منح الصلاحيات للمستخدمين المسجلين فقط
GRANT EXECUTE ON FUNCTION public.rpc_wallet_deduct TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_wallet_deposit TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_owner_bookings_feed TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_by_staff TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_owner_dashboard_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_owner_due_pending_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_owner_due_waiting_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.move_barber_to_branch TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_working_hours TO authenticated;
GRANT EXECUTE ON FUNCTION public.block_barber_time_slot TO authenticated;
GRANT EXECUTE ON FUNCTION public.bind_client_to_tenant TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shop_bookings TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shop_staff_with_profiles TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_shop_today_bookings TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_server_time TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_tenant_owner TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_staff TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_customer_booking TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- نهاية ملف التصحيح الشامل
-- ═══════════════════════════════════════════════════════════════════════════════
