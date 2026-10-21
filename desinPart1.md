# PROJECT_MASTER_REFERENCE.md
# Part 1 — Product Foundation & System Architecture

Version: 1.0
Status: Draft
Source Of Truth Priority:

1. Database Schema
2. Edge Functions
3. RPC Functions
4. Architecture Decisions
5. Frontend Implementation

If Frontend Behavior Conflicts With Backend Logic,
Backend Wins.

---

# 1. Product Vision

## What is this product?

Barber Shop SaaS is a multi-branch salon/barbershop management system.

The system helps shop owners manage:

- Branches
- Staff
- Services
- Working Hours
- Bookings
- Notifications
- Payments

The primary value proposition of the system is:

```text
Smart Booking Engine
```

The project is NOT a simple booking CRUD application.

The entire platform exists to support and optimize booking allocation.

---

# 2. Product Scope

## Included In MVP

### Owner

- Authentication
- Dashboard
- Branch Management
- Staff Management
- Services Management
- Working Hours
- Booking Management
- Create Booking
- Notifications
- Settings

### Barber

- Authentication
- Home Screen
- Timeline
- Upcoming Bookings
- Profile

---

## Excluded From MVP

### Manager

Supported by backend.

Not implemented in frontend.

Status:

```text
Backend: Supported
Frontend: Not Implemented
```

---

### Client Application

Supported in database structure.

Not part of current project scope.

Status:

```text
Backend: Exists
Frontend: Not Implemented
```

---

# 3. Product Philosophy

The system follows:

```text
Backend Driven Business Logic
```

Meaning:

Business rules must live inside:

- Database
- RPC Functions
- Edge Functions

NOT inside React Components.

---

Correct Flow:

```text
Screen
  ↓
Hook
  ↓
Service
  ↓
RPC / Edge Function
```

Wrong Flow:

```text
Screen
  ↓
Large Business Logic
  ↓
Supabase
```

---

# 4. Roles

## Active Roles

### Owner

Can:

- Manage Branches
- Manage Staff
- Manage Services
- Manage Working Hours
- Create Bookings
- View Dashboard
- View Reports

---

### Barber

Can:

- View Timeline
- View Upcoming Bookings
- Manage Availability
- View Assigned Bookings

---

## Non-MVP Roles

### Manager

Exists in backend.

Ignored in current frontend.

---

### Client

Exists in backend.

Ignored in current frontend.

---

# 5. Core Business Rules

## Branch Rules

### Multi Branch Ownership

An Owner may own:

```text
One Or More Branches
```

Relationship:

```text
Owner
   │
   ├── Branch A
   ├── Branch B
   ├── Branch C
   └── ...
```

---

### Services

Every service belongs to a branch.

Relationship:

```text
Branch
   └── Services
```

Services are NOT global.

Example:

```text
Branch A
Hair Cut = 80

Branch B
Hair Cut = 100
```

Possible and valid.

---

# 6. Staff Rules

## Staff Assignment

Staff members are assigned through:

```text
shop_staff
```

table.

---

## Barber Transfer Rule

A barber may be transferred between branches.

Condition:

```text
No Future Bookings
In Current Branch
```

If future bookings exist:

```text
Transfer Rejected
```

Until bookings are handled.

---

## Active Staff

Only active staff members appear in:

- Booking Engine
- Staff Lists
- Availability Calculations

---

# 7. Working Hours Rules

The system supports two levels:

---

## Branch Working Hours

Stored in:

```text
working_hours
staff_id = null
```

Represents:

```text
Branch Schedule
```

---

## Barber Working Hours

Stored in:

```text
working_hours
staff_id != null
```

Represents:

```text
Personal Barber Schedule
```

---

## Override Logic

Priority:

```text
Barber Hours
      ↓
Branch Hours
```

Meaning:

If barber schedule exists:

Use barber schedule.

Otherwise:

Use branch schedule.

---

## Day Off

When:

```text
is_off = true
```

The barber becomes unavailable.

---

# 8. Booking Rules

Booking status values:

```text
pending
confirmed
completed
cancelled
no_show
waiting_time
```

---

Cancelled bookings:

```text
DO NOT
occupy schedule space
```

Inside booking calculations.

---

# 9. Smart Booking Engine

Project Core Component.

Source:

```text
Edge Function

smart-booking-slots
```

---

## Responsibilities

The engine calculates:

- Available Slots
- Working Hour Constraints
- Existing Booking Constraints
- Arrival Buffer
- User Time Preference
- Ranking Suggestions
- Current Queue Suggestions
- Validation

---

## Arrival Buffer

Confirmed Value:

```text
10 Minutes
```

---

## Customer Time Model

The engine uses:

```text
display_start_time
```

and

```text
actual_start_time
```

---

Example:

```text
display_start_time = 10:20

actual_start_time = 10:30
```

Meaning:

Customer should arrive:

```text
10 Minutes Earlier
```

---

## Scheduling Model

The engine DOES NOT use:

```text
15 Minute Grid
30 Minute Grid
```

Instead:

```text
Free Gap Based Scheduling
```

Generated from actual booking gaps.

---

## Gap Prioritization

Priority Order:

```text
Internal Gaps
       ↓
Trailing Gaps
```

Meaning:

The system prefers filling existing holes.

---

## Maximum Suggestions

Maximum recommendations:

```text
5 Slots
```

per request.

---

## Current Queue Mode

Special Slot Type:

```text
current_queue
```

Allows immediate booking.

If possible:

```text
Now + 10 Minutes
```

---

# 10. Rate Limiting Rules

Source:

```text
rate-limit-booking
```

Edge Function.

---

## User Limit

```text
5 Booking Attempts
Per Minute
```

---

## IP Limit

```text
20 Requests
Per Minute
```

---

## Storage

Uses:

```text
Upstash Redis
```

Sliding Window Strategy.

---

## Failure Strategy

If Redis fails:

```text
Allow Request
```

The system fails open.

---

# 11. System Overview Diagram

```text
                    ┌─────────────────┐
                    │     Owner       │
                    └────────┬────────┘
                             │
                             ▼

┌────────────────────────────────────────────────────┐
│                  Barber Shop SaaS                  │
└────────────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼

   Branches           Staff Management      Bookings

         │                   │                   │
         ▼                   ▼                   ▼

   Services            Working Hours      Smart Engine

         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             ▼

                 smart-booking-slots

                             │
                             ▼

                    Booking Suggestions
```

---

# 12. Domain Model

```text
profiles
│
├── owner
├── barber
├── manager (backend only)
└── client  (backend only)

           │
           ▼

shops_v2
│
├── services
├── shop_staff
├── working_hours
├── bookings_v2
├── notifications
└── payments_v2
```

---

# End Of Part 1

Next:

Part 2

- Database Architecture
- Tables Documentation
- Relationships
- Entity Diagrams
- RPC Catalog
- Edge Functions Catalog
- Booking Engine Deep Dive