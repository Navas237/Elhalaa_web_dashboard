# PROJECT_MASTER_REFERENCE.md
# Part 6 — Engineering Handbook

Status: Required For Implementation

Purpose:

This section defines the engineering standards that every developer must follow.

Failure to follow these standards will create:

```text
Inconsistent Code

Architecture Drift

Technical Debt
```

---

# 90. Engineering Philosophy

The codebase should be:

```text
Predictable

Typed

Modular

Domain Driven
```

---

Goal:

A new developer should be able to locate any feature within:

```text
30 Seconds
```

---

# 91. Folder Structure (Final)

```text
src

├── app

├── domains

│   ├── auth

│   ├── booking

│   ├── staff

│   ├── services

│   ├── branch

│   ├── owner

│   ├── barber

│   └── notifications

├── shared

│   ├── components

│   ├── hooks

│   ├── lib

│   ├── constants

│   ├── types

│   └── utils

└── providers
```

---

# 92. Domain Structure Standard

Every domain follows:

```text
domain

├── components

├── hooks

├── services

├── types

├── schemas

└── constants
```

---

Example:

```text
booking

├── components

│   ├── booking-card.tsx

│   ├── booking-status.tsx

│   └── booking-actions-sheet.tsx

├── hooks

│   ├── use-bookings.ts

│   └── use-create-booking.ts

├── services

│   └── booking.service.ts

├── types

│   └── booking.types.ts

├── schemas

│   └── booking.schema.ts

└── constants

    └── booking.constants.ts
```

---

# 93. Naming Conventions

## Components

```text
PascalCase
```

Example:

```text
BookingCard

BookingActionsSheet

CreateBookingForm
```

---

## Hooks

Always:

```text
use*
```

Example:

```text
useBookings

useCreateBooking

useStaff
```

---

## Services

Format:

```text
feature.service.ts
```

Example:

```text
booking.service.ts

staff.service.ts

auth.service.ts
```

---

## Types

Format:

```text
feature.types.ts
```

---

## Schemas

Format:

```text
feature.schema.ts
```

---

# 94. DTO Strategy

Frontend must consume DTOs.

Never expose database rows directly to UI.

---

Correct:

```ts
export interface BookingCardDto {
  id: string
  customerName: string
  barberName: string
  startTime: string
  status: BookingStatus
}
```

---

Wrong:

```ts
BookingsV2Row
```

Inside UI components.

---

# 95. Core DTO Catalog

---

## DashboardSummaryDto

```ts
interface DashboardSummaryDto {
  todayBookings: number
  activeBarbers: number
  pendingBookings: number
  completedBookings: number
}
```

---

## BookingCardDto

```ts
interface BookingCardDto {
  id: string
  customerName: string
  barberName: string
  serviceName: string
  displayStartTime: string
  status: string
}
```

---

## StaffCardDto

```ts
interface StaffCardDto {
  id: string
  name: string
  role: string
  branchName: string
  isActive: boolean
}
```

---

## ServiceCardDto

```ts
interface ServiceCardDto {
  id: string
  name: string
  durationMinutes: number
  price: number
}
```

---

# 96. API Contract Strategy

Every Service exports:

```ts
get

create

update

delete
```

Operations.

---

Example:

```ts
bookingService.getBookings()

bookingService.createBooking()

bookingService.cancelBooking()
```

---

# 97. React Query Key Catalog

Official Query Keys:

```ts
["dashboard"]

["bookings"]

["bookings", shopId]

["booking", bookingId]

["staff"]

["staff", shopId]

["services"]

["services", shopId]

["working-hours"]

["working-hours", shopId]

["timeline"]

["upcoming-bookings"]

["notifications"]
```

---

Never create:

```text
Random Keys
```

---

# 98. Mutation Invalidation Matrix

## Create Booking

Invalidate:

```ts
["bookings"]

["dashboard"]

["timeline"]
```

---

## Cancel Booking

Invalidate:

```ts
["bookings"]

["dashboard"]

["timeline"]

["upcoming-bookings"]
```

---

## Create Staff

Invalidate:

```ts
["staff"]
```

---

## Update Working Hours

Invalidate:

```ts
["working-hours"]
```

---

## Create Service

Invalidate:

```ts
["services"]
```

---

# 99. Error Handling Standard

Every service returns:

```ts
{
 success: boolean
 data?: T
 error?: string
}
```

Pattern.

---

Never:

```ts
throw raw backend errors
```

To UI.

---

# 100. Form Validation Standard

Validation Library:

```text
Zod
```

---

Every form must have:

```text
Schema

Types

Validation Messages
```

---

Example:

```text
create-booking.schema.ts
```

---

# 101. Loading State Standard

Every screen must support:

```text
Skeleton
```

Before data arrives.

---

Never:

```text
Blank Screen
```

---

# 102. Empty State Standard

Every list screen requires:

```text
Icon

Message

Action
```

---

Example:

```text
No Staff Members

[Create Staff]
```

---

# 103. Service Layer Standard

Every service file follows:

```ts
export const bookingService = {
  getBookings,
  createBooking,
  cancelBooking,
}
```

---

Avoid:

```ts
100 standalone functions
```

Inside one file.

---

# 104. Supabase Access Standard

Allowed:

```ts
services/*
```

Only.

---

Forbidden:

```ts
components/*
hooks/*
screens/*
```

---

# 105. Type Generation Strategy

Types generated from Supabase.

Command source:

```text
Supabase Generated Types
```

---

Generated file:

```text
shared/types/database.types.ts
```

---

Rule:

Never manually edit:

```text
database.types.ts
```

---

# 106. Environment Variables

Required:

```env
NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

Never expose:

```env
SERVICE_ROLE_KEY
```

To frontend.

---

# 107. Authentication Rules

Frontend trusts:

```text
Session
```

---

Backend validates:

```text
Permissions
```

---

Rule:

```text
UI Access

!=

Backend Authorization
```

---

# 108. Logging Strategy

Development:

```ts
console.log()
```

Allowed.

---

Production:

Use:

```ts
logger.info()

logger.error()
```

Future implementation.

---

# 109. Component Classification

Three component types:

---

## UI Components

```text
Button

Card

Input

Badge
```

Location:

```text
shared/components
```

---

## Domain Components

```text
BookingCard

StaffCard

BookingActionsSheet
```

Location:

```text
domains/*
```

---

## Screen Components

```text
DashboardPage

BookingsPage
```

Location:

```text
app/*
```

---

# 110. Smart Booking Integration Standard

Never:

```ts
Calculate Slots In React
```

---

Always:

```ts
invoke("smart-booking-slots")
```

---

Frontend responsibility:

```text
Display Suggestions
```

Only.

---

# 111. Create Staff Integration Standard

Never:

```ts
Create Auth User Directly
```

---

Always:

```ts
invoke("create-staff")
```

---

Because:

```text
Auth

Profile

shop_staff
```

Must stay synchronized.

---

# 112. Performance Budget

Initial Targets:

```text
Dashboard < 2 seconds

Bookings < 2 seconds

Create Booking < 1 second

Slot Generation < 2 seconds
```

---

# 113. Code Review Checklist

Before merge:

```text
✓ Types Exist

✓ Zod Schema Exists

✓ React Query Used

✓ No Direct Supabase Calls

✓ No Any Types

✓ DTO Used

✓ Loading State Exists

✓ Error State Exists

✓ Empty State Exists
```

---

# 114. Engineering Commandments

1.

```text
Backend Is Source Of Truth
```

2.

```text
Never Rebuild Business Logic In React
```

3.

```text
Every Feature Has Service Layer
```

4.

```text
Server State Belongs To React Query
```

5.

```text
Client State Belongs To Zustand
```

6.

```text
Use DTOs
Not Raw Rows
```

7.

```text
Smart Booking Engine
Must Stay Centralized
```

8.

```text
Branch Context
Comes First
```

9.

```text
Types Before Components
```

10.

```text
Architecture Over Speed
```

---

# END OF PART 6

Project Status:

```text
Architecture Complete

Engineering Standards Complete

Ready For Implementation Phase
```