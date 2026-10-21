# PROJECT_MASTER_REFERENCE.md
# Part 7 — Actual Contracts & DTO Mapping

Status: Generated From Real Supabase Schema

---

# 115. Source Types

Generated File:

```text
shared/types/database.types.ts
```

Rule:

```text
DO NOT EDIT
```

This file is always regenerated.

---

# 116. Frontend Type Layers

Layer 1

```text
Database Types
```

Generated from Supabase.

Example:

```ts
Tables<"bookings_v2">
```

---

Layer 2

```text
DTO Types
```

Used by frontend.

Example:

```ts
BookingCardDto
```

---

Layer 3

```text
UI Models
```

Optional.

Used only when UI requires transformation.

---

# 117. Official Database Types

---

## UserRole

```ts
type UserRole =
  | "client"
  | "barber"
  | "manager"
  | "owner"
```

Frontend MVP:

```text
owner
barber
```

---

## StaffRole

```ts
type StaffRole =
  | "barber"
  | "manager"
```

---

## BookingStatus

```ts
type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show"
  | "waiting_time"
```

---

## PaymentMethod

```ts
type PaymentMethod =
  | "wallet"
  | "cash"
  | "card"
```

---

## PaymentStatus

```ts
type PaymentStatus =
  | "pending"
  | "paid"
  | "refunded"
  | "failed"
```

---

# 118. Core DTOs

---

## DashboardSummaryDto

Mapped From:

```text
get_owner_dashboard_summary
```

Actual Return:

```ts
export interface DashboardSummaryDto {
  cancelledToday: number
  confirmedBookings: number
  pendingBookings: number
  revenueToday: number
  totalBarbers: number
  totalBookingsToday: number
  totalManagers: number
  totalShops: number
  upcomingBookings: number
  waitingTimeBookings: number
}
```

---

## BranchDto

Mapped From:

```text
get_owner_shops_lightweight
```

```ts
export interface BranchDto {
  id: string
  name: string
  address: string | null
  imageUrl: string | null
  status: "open" | "closed" | "maintenance"
  bookingsToday: number
  totalBookings: number
  upcomingBookings: number
}
```

---

## StaffDto

Mapped From:

```text
get_shop_staff_with_profiles
```

```ts
export interface StaffDto {
  staffId: string
  userId: string
  shopId: string

  name: string
  email: string
  phone: string | null
  avatarUrl: string | null

  role: "barber" | "manager"

  isActive: boolean

  hiredAt: string
}
```

---

## ServiceDto

Mapped From:

```text
services
```

```ts
export interface ServiceDto {
  id: string
  shopId: string

  name: string

  durationMinutes: number

  price: number

  isActive: boolean

  displayOrder: number
}
```

---

## BookingDto

Mapped From:

```text
get_shop_bookings
```

Actual RPC Return:

```ts
export interface BookingDto {
  id: string

  clientId: string | null
  clientName: string
  clientPhone: string | null

  barberId: string
  barberName: string

  staffId: string

  serviceId: string
  serviceName: string
  serviceDuration: number
  servicePrice: number

  shopId: string

  bookingDate: string

  displayStartTime: string
  startTime: string
  endTime: string

  notes: string | null

  paymentMethod: PaymentMethod

  status: BookingStatus

  createdAt: string
}
```

---

# 119. Smart Booking DTO

Mapped From:

```text
smart-booking-slots
```

```ts
export interface RecommendedSlotDto {
  displayStartTime: string

  actualStartTime: string

  actualEndTime: string

  gapType:
    | "internal"
    | "trailing"
    | "current_queue"

  inPreference: boolean

  score: number

  reason: string
}
```

---

## BarberAvailabilityDto

```ts
export interface BarberAvailabilityDto {
  staffId: string

  staffName: string

  isAvailable: boolean

  totalBookings: number

  recommendedSlots: RecommendedSlotDto[]

  message: string
}
```

---

# 120. Create Booking Request

Mapped To:

```text
create_booking_by_staff
```

```ts
export interface CreateBookingRequest {
  shopId: string

  staffId: string

  serviceId: string

  clientName: string

  clientPhone?: string

  bookingDate: string

  displayStartTime: string

  startTime: string

  endTime: string

  notes?: string

  paymentMethod:
    | "wallet"
    | "cash"
    | "card"
}
```

---

# 121. Create Staff Request

Mapped To:

```text
create-staff
```

```ts
export interface CreateStaffRequest {
  shopId: string

  name: string

  email: string

  password: string

  phone?: string

  avatarUrl?: string

  role?: "barber"
}
```

MVP Restriction:

```text
Only Barber Creation
```

Even though backend supports manager.

---

# 122. Auth DTO

```ts
export interface SessionUserDto {
  id: string

  email: string

  name: string

  role:
    | "owner"
    | "barber"

  avatarUrl?: string
}
```

---

# 123. API Folder Structure

```text
domains

├── auth
│
│   ├── services
│   │   └── auth.service.ts
│
│   └── types

├── booking
│
│   ├── services
│   │   └── booking.service.ts
│
│   └── types

├── staff
│
│   ├── services
│   │   └── staff.service.ts
│
│   └── types

├── services
│
│   ├── services
│   │   └── services.service.ts
│
│   └── types
```

---

# 124. Final Source Of Truth

Priority:

```text
1. Supabase Schema

2. Edge Functions

3. RPC Functions

4. DTO Layer

5. UI Components
```

Never:

```text
UI
Overrides
Backend Rules
```

---

# END OF PART 7

Project Status:

Architecture: COMPLETE
Backend Mapping: COMPLETE
DTO Contracts: COMPLETE
Ready For Development 