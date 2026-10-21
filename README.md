# مشمش (Mishmish) — نظام إدارة الصالونات والحجوزات

## الإصدار: 1.0.0
## الحالة: قيد التطوير
## التاريخ: 2026

---

## 1. نظرة عامة

منصة SaaS لإدارة محلات الحلاقة — Web Dashboard يعمل كـ PWA على الموبايل والديسكتوب.

المنصة تخدم دورين رئيسيين:
- **Owner** — صاحب المحل
- **Barber** — الحلاق

---

## 2. التقنيات المستخدمة

| التقنية | الغرض |
|---|---|
| Next.js 15 (App Router) | الـ Framework الأساسي |
| TypeScript | Type Safety |
| Tailwind CSS | التصميم |
| shadcn/ui | UI Components |
| Supabase | Backend, Auth, Database |
| React Query (TanStack) | Server State Management |
| Zustand | Client State Management |
| PWA | تشغيل على الموبايل كـ App |

---

## 3. الـ Backend — Supabase

### Project
- **Name:** barber-shop
- **Region:** eu-west-1
- **Status:** ACTIVE_HEALTHY

---

### جداول قاعدة البيانات

#### Identity Domain
```
profiles
  - id (uuid) → auth.users
  - email (text)
  - name (text)
  - phone (text)
  - avatar_url (text)
  - role (enum: client | barber | manager | owner)
  - wallet_balance (numeric)
  - created_at
  - updated_at
```

#### Shop Domain
```
shops_v2
  - id (uuid)
  - shop_code (text, unique)
  - name (text)
  - owner_id → profiles.id
  - address (text)
  - latitude / longitude (numeric)
  - image_url (text)
  - status (enum: open | closed | maintenance)
  - opening_time / closing_time (time)
  - booking_start_date / booking_end_date (date)
  - timezone (default: Africa/Cairo)
  - reference_package_id → services.id
  - rating / total_reviews
```

#### Staff Domain
```
shop_staff
  - id (uuid)
  - user_id → profiles.id
  - shop_id → shops_v2.id
  - role (enum: barber | manager)
  - is_active (boolean)
  - hired_at

working_hours
  - id (uuid)
  - shop_id → shops_v2.id
  - staff_id → shop_staff.id (nullable = ساعات المحل)
  - day_of_week (0-6)
  - start_time / end_time (time)
  - is_off (boolean)
```

#### Services Domain
```
services
  - id (uuid)
  - shop_id → shops_v2.id
  - name (text)
  - duration_minutes (int, default: 30)
  - price (numeric)
  - is_active (boolean)
  - display_order (int)
  - created_at
```

#### Booking Domain
```
bookings_v2
  - id (uuid)
  - shop_id → shops_v2.id
  - staff_id → shop_staff.id
  - client_id → profiles.id (nullable)
  - service_id → services.id (nullable)
  - client_name (text)
  - client_phone (text)
  - booking_date (date)
  - start_time (time) ← الوقت الفعلي للخدمة
  - end_time (time)
  - display_start_time (time) ← الوقت اللي بيشوفه العميل
  - status (enum: pending | confirmed | completed | cancelled | no_show | waiting_time)
  - payment_method (enum: wallet | cash | card)
  - notes (text)
  - created_at / updated_at

booking_status_history
  - id (uuid)
  - booking_id → bookings_v2.id
  - old_status (text)
  - new_status (text)
  - changed_by → profiles.id
  - changed_at
```

#### Payment Domain
```
payments_v2
  - id (uuid)
  - booking_id → bookings_v2.id
  - user_id → profiles.id
  - amount (numeric)
  - currency (default: EGP)
  - status (enum: pending | paid | refunded | failed)
  - transaction_id (text)
  - wallet_tx_id → wallet_transactions.id
  - created_at

wallet_transactions
  - id (uuid)
  - user_id → profiles.id
  - amount (numeric)
  - tx_type (enum: deposit | withdrawal | booking_payment | refund)
  - reference_id (uuid)
  - description (text)
  - balance_after (numeric)
  - created_at
```

#### Notification Domain
```
push_devices
  - id (uuid)
  - user_id → profiles.id
  - staff_id → shop_staff.id (nullable)
  - provider (enum: fcm | apns | expo)
  - platform (enum: android | ios)
  - token (text)
  - device_name (text)
  - is_active (boolean)
  - last_seen_at

notifications
  - id (uuid)
  - user_id → profiles.id
  - booking_id → bookings_v2.id (nullable)
  - type (text)
  - title / body (text)
  - data (jsonb)
  - read_at (timestamp)
  - created_at

notification_jobs
  - id (uuid)
  - recipient_user_id → profiles.id
  - booking_id → bookings_v2.id (nullable)
  - type (enum: booking_arrival_check | booking_arrival_followup)
  - status (enum: pending | processing | sent | failed | skipped)
  - scheduled_at
  - attempts / max_attempts
  - idempotency_key (unique)

notification_delivery_attempts
  - id (uuid)
  - job_id → notification_jobs.id
  - push_device_id → push_devices.id
  - provider (text)
  - status (enum: sent | failed | invalid_token)
  - provider_message_id
  - error_code / error_message
  - attempted_at
```

---

### Edge Functions

| Function | JWT | الغرض |
|---|---|---|
| create-staff | ✅ مطلوب | إنشاء Auth User + Profile + Staff Record |
| smart-booking-slots | ❌ | توليد المواعيد المقترحة |
| rate-limit-booking | ❌ | الحد من الحجوزات المتكررة |
| send-test-fcm | ❌ | إرسال Push Notifications |

---

### RPC Functions

```
get_owner_shops_lightweight
get_shop_staff_with_profiles
get_owner_bookings_feed
get_shop_bookings
get_barber_upcoming_bookings
get_shop_today_bookings
get_owner_dashboard_summary
get_barber_timeline
get_barber_available_slots
create_booking_by_staff
```

---

## 4. الـ Roles والصلاحيات

### Owner
- إدارة الفروع (إنشاء / تعديل)
- إدارة الحلاقين (إضافة / نقل / تعطيل)
- إدارة الخدمات والباكدجات
- إعداد ساعات عمل الفرع
- إنشاء حجز
- عرض كل الحجوزات
- Dashboard الإحصائيات

### Barber
- عرض جدوله اليومي
- عرض الحجوزات القادمة
- تأكيد حجز
- تعديل وقت حجز
- إلغاء حجز

---

## 5. الـ Screens

### Owner Screens
```
/owner/dashboard          → إحصائيات سريعة
/owner/shops              → قائمة الفروع
/owner/shops/new          → إضافة فرع
/owner/shops/[id]         → تفاصيل فرع
/owner/staff              → قائمة الحلاقين
/owner/staff/new          → إضافة حلاق
/owner/services           → الخدمات والباكدجات
/owner/working-hours      → ساعات العمل
/owner/bookings           → كل الحجوزات
/owner/bookings/new       → إنشاء حجز جديد
```

### Barber Screens
```
/barber/timeline          → الجدول اليومي
/barber/bookings          → الحجوزات القادمة
/barber/bookings/[id]     → تفاصيل حجز
```

### Shared Screens
```
/login                    → تسجيل الدخول
/unauthorized             → صفحة رفض الصلاحية
```

---

## 6. الـ Architecture

### Folder Structure
```
src/
  app/
    (auth)/
      login/
    owner/
      dashboard/
      shops/
      staff/
      services/
      working-hours/
      bookings/
    barber/
      timeline/
      bookings/
  domains/
    auth/
      hooks/
      services/
      types/
    owner/
      hooks/
      services/
      types/
    barber/
      hooks/
      services/
      types/
    booking/
      hooks/
      services/
      types/
    staff/
      hooks/
      services/
      types/
    shop/
      hooks/
      services/
      types/
  shared/
    components/
    hooks/
    lib/
      supabase/
      react-query/
  middleware.ts
```

---

### Layers
```
Screen (UI فقط)
  ↓
Hook (Logic + React Query)
  ↓
Service (Business Rules)
  ↓
Supabase Client (API Calls)
```

**قواعد صارمة:**
- الـ Screen لا يعرف Supabase
- الـ Hook لا يعرف SQL
- كل Supabase calls في `/domains/*/services` فقط

---

## 7. قواعد الـ System

### Rule 1 — Soft Delete فقط
```typescript
// ❌ ممنوع
await supabase.from('shop_staff').delete()

// ✅ صح
await supabase.from('shop_staff').update({ is_active: false })
```

### Rule 2 — Staff Creation عبر Edge Function فقط
```typescript
// ❌ ممنوع
await supabase.from('profiles').insert()

// ✅ صح
await supabase.functions.invoke('create-staff', { body: data })
```

### Rule 3 — Smart Booking عبر Edge Function فقط
```typescript
// الـ UI يبعت parameters فقط
await supabase.functions.invoke('smart-booking-slots', { body: params })
// الـ UI يعرض النتيجة فقط — مش بيحسب أي حاجة
```

### Rule 4 — Role-Based Routing
```typescript
// middleware.ts
// /owner/* → role === 'owner' فقط
// /barber/* → role === 'barber' أو 'manager' فقط
```

### Rule 5 — State Management
```
Server State  → React Query فقط
Client State  → Zustand فقط
لا تخليط بينهم
```

---

## 8. Booking Lifecycle

```
pending
  ↓
confirmed  ←→  waiting_time
  ↓
completed | cancelled | no_show
```

---

## 9. Staff Lifecycle

```
Created (Edge Function)
  ↓
Active (is_active: true)
  ↓
Promoted (role: barber → manager)
  ↓
Transferred (shop_id يتغير)
  ↓
Deactivated (is_active: false)
```

---

## 10. ملاحظات مهمة

- **Timezone:** كل العمليات على Africa/Cairo
- **Currency:** EGP
- **No Hard Delete:** في أي جدول
- **display_start_time vs start_time:** الأول للعميل، الثاني الفعلي — فرق يصل لـ 10 دقائق
- **reference_package_id في shops_v2:** الباكدج الافتراضي للـ Smart Booking
- **Legacy Tables موجودة:** `_legacy_shops`, `bookings`, `users` — لا تُستخدم في الـ Dashboard الجديد