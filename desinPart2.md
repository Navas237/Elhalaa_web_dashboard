# PROJECT_MASTER_REFERENCE.md
# Part 2 — Database Architecture, Relationships, RPC Catalog & Edge Functions

Status: Confirmed From Database + Edge Function Source Code

---

# 13. Database Architecture

## Architecture Philosophy

The database is the primary source of truth.

Business logic is distributed between:

```text
PostgreSQL Tables
        │
        ▼
RPC Functions
        │
        ▼
Edge Functions
```

Frontend should never reimplement backend logic.

---

# 14. Core Domain Diagram

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

# 15. Table Documentation

---

## profiles

Purpose:

Stores system users.

Acts as extension layer for:

```text
auth.users
```

Contains:

```text
id
email
name
phone
avatar_url
role
```

Role values:

```text
owner
barber
manager
client
```

Relationship:

```text
auth.users
     │
     ▼
 profiles
```

---

## shops_v2

Purpose:

Represents a branch.

Each owner can own multiple branches.

Relationship:

```text
Owner
  │
  ▼
shops_v2
```

---

## shop_staff

Purpose:

Links users to branches.

Acts as assignment table.

Contains:

```text
shop_id
user_id
role
is_active
```

Relationship:

```text
profiles
     │
     ▼
 shop_staff
     │
     ▼
 shops_v2
```

---

### Important Rule

Current Product Rule:

```text
One Barber
One Active Branch
```

Transfer allowed only if:

```text
No Future Bookings Exist
```

---

## services

Purpose:

Services offered by a branch.

Relationship:

```text
Branch
   ▼
Services
```

Services are branch specific.

Not global.

---

## working_hours

Purpose:

Stores working schedules.

Supports:

```text
Branch Hours
Barber Hours
```

---

### Branch Schedule

```text
staff_id = null
```

---

### Barber Schedule

```text
staff_id != null
```

---

### Priority

```text
Barber Hours
      ↓
Branch Hours
```

---

## bookings_v2

Purpose:

Main booking table.

Represents customer reservations.

Contains:

```text
booking_date

display_start_time

start_time

end_time

status
```

---

### Booking Status

```text
pending
confirmed
completed
cancelled
no_show
waiting_time
```

---

### Time Model

```text
display_start_time
```

Customer arrival time.

---

```text
start_time
```

Actual service start.

---

```text
end_time
```

Actual service end.

---

## notifications

Purpose:

Stores notification records.

Relationship:

```text
notifications
      │
      ▼
notification_jobs
      │
      ▼
notification_delivery_attempts
```

---

## payments_v2

Purpose:

Stores payment records.

Related to:

```text
wallet_transactions
```

---

# 16. Entity Relationship Diagram

```text
┌────────────┐
│ profiles   │
└─────┬──────┘
      │
      ▼

┌────────────┐
│ shop_staff │
└─────┬──────┘
      │
      ▼

┌────────────┐
│ shops_v2   │
└─────┬──────┘
      │
      ├──────────────► services
      │
      ├──────────────► working_hours
      │
      ├──────────────► bookings_v2
      │
      ├──────────────► notifications
      │
      └──────────────► payments_v2
```

---

# 17. Booking System Relationships

```text
services
    │
    ▼

bookings_v2

    ▲
    │

shop_staff

    ▲
    │

profiles
```

---

# 18. Working Hours Relationships

```text
shops_v2
     │
     ▼
working_hours
(staff_id = null)
```

Branch hours.

---

```text
shop_staff
      │
      ▼
working_hours
(staff_id != null)
```

Barber hours.

---

# 19. Booking Engine Deep Dive

Source:

```text
smart-booking-slots
```

Edge Function.

Confirmed from source code.

---

## Inputs

```text
shop_id

staff_id

target_date

service_id

service_duration

time_preference
```

---

## Reads From

```text
services

shop_staff

profiles

working_hours

bookings_v2
```

---

## Produces

```text
recommended_slots
```

For each barber.

---

## Processing Pipeline

```text
Request
   │
   ▼

Load Staff

   │
   ▼

Load Working Hours

   │
   ▼

Load Existing Bookings

   │
   ▼

Calculate Free Gaps

   │
   ▼

Generate Smart Slots

   │
   ▼

Validate Slots

   │
   ▼

Return Top 5
```

---

## Smart Slot Priorities

Priority Order:

```text
Internal Gap
       ↓
Trailing Gap
       ↓
Distance To Preference
```

---

## Current Queue Logic

Special slot type:

```text
current_queue
```

Generated when:

```text
Now + Arrival Buffer
```

is possible.

---

## Arrival Buffer

Confirmed:

```text
10 Minutes
```

---

# 20. RPC Catalog

---

## Dashboard

### get_owner_dashboard_summary

Purpose:

Dashboard metrics.

Used By:

```text
Owner Home
```

---

### get_owner_bookings_feed

Purpose:

Recent bookings feed.

Used By:

```text
Owner Home
```

---

### get_owner_shops_lightweight

Purpose:

Branch selector.

Used By:

```text
Branch Switcher
```

---

## Bookings

### get_shop_bookings

Purpose:

Bookings list.

Used By:

```text
Bookings Screen
```

---

### get_shop_today_bookings

Purpose:

Today's bookings.

Used By:

```text
Dashboard
```

---

### create_booking_by_staff

Purpose:

Create booking using backend business logic.

Used By:

```text
Create Booking Flow
```

Important:

Frontend must NOT insert directly into:

```text
bookings_v2
```

---

## Staff

### get_shop_staff_with_profiles

Purpose:

Returns:

```text
shop_staff
+
profiles
```

Combined.

Used By:

```text
Staff List
Create Booking
```

---

## Barber

### get_barber_timeline

Purpose:

Timeline screen.

Used By:

```text
Barber Home
```

---

### get_barber_upcoming_bookings

Purpose:

Upcoming bookings.

Used By:

```text
Barber App
```

---

## Validation

### check_booking_overlap

Purpose:

Prevent time conflicts.

---

### check_client_pending_booking

Purpose:

Prevent duplicate pending bookings.

---

### guard_booking_status_transition

Purpose:

Protect invalid status transitions.

---

### log_booking_status_change

Purpose:

Audit trail.

Writes into:

```text
booking_status_history
```

---

## Wallet

### rpc_wallet_deposit

Purpose:

Add wallet balance.

---

### rpc_wallet_deduct

Purpose:

Subtract wallet balance.

---

# 21. Edge Function Catalog

---

## create-staff

Purpose:

Create staff member safely.

---

### Authentication

Caller must be:

```text
owner
or
manager
```

---

### Flow

```text
Owner
  │
  ▼

create-staff

  │
  ├── Create Auth User
  ├── Create Profile
  └── Create shop_staff
```

---

### Creates

```text
auth.users

profiles

shop_staff
```

---

### Cleanup Logic

If profile creation fails:

```text
Delete Auth User
```

Rollback protection.

---

## smart-booking-slots

Purpose:

Smart booking recommendation engine.

Primary business engine.

---

## rate-limit-booking

Purpose:

Protect booking system.

---

### Storage

```text
Upstash Redis
```

---

### Limits

```text
5 booking attempts
per user
per minute
```

---

```text
20 requests
per IP
per minute
```

---

### Strategy

```text
Sliding Window
```

---

### Failure Mode

```text
Fail Open
```

Allow requests if Redis is unavailable.

---

## send-test-fcm

Purpose:

Push notification testing.

Used during notification setup and debugging.

---

# 22. Backend Engines

The backend consists of three major engines.

---

## Engine 1

Booking Engine

```text
smart-booking-slots
```

Responsibilities:

- Slot Discovery
- Gap Filling
- Schedule Optimization

---

## Engine 2

Identity Engine

```text
Auth
+
Profiles
+
create-staff
```

Responsibilities:

- User Creation
- Staff Assignment
- Access Identity

---

## Engine 3

Protection Engine

```text
rate-limit-booking

check_booking_overlap

guard_booking_status_transition
```

Responsibilities:

- Abuse Prevention
- Booking Protection
- State Validation

---

# End Of Part 2

Next:

Part 3

- Screen Inventory
- Navigation Maps
- Owner Flows
- Barber Flows
- Wireframe Mapping
- UI Relationships