# PROJECT_MASTER_REFERENCE.md
# Part 3 — Screen Inventory, Navigation Maps, User Flows & Wireframe Mapping

Status: Based On Confirmed Backend + Existing Wireframes

---

# 23. Screen Inventory

## Owner Application

### Authentication

```text
Login
```

---

### Dashboard

```text
Owner Home
```

Purpose:

System overview.

Data Sources:

```text
get_owner_dashboard_summary

get_owner_bookings_feed
```

---

### Bookings

```text
Bookings List
```

Purpose:

Manage all branch bookings.

Data Source:

```text
get_shop_bookings
```

---

```text
Booking Details
```

Purpose:

View booking information.

---

```text
Create Booking
```

Purpose:

Create booking using Smart Booking Engine.

Data Sources:

```text
services

get_shop_staff_with_profiles

smart-booking-slots

create_booking_by_staff
```

---

### Staff

```text
Staff List
```

Purpose:

View branch staff.

Data Source:

```text
get_shop_staff_with_profiles
```

---

```text
Add Staff
```

Purpose:

Create barber.

Data Source:

```text
create-staff
```

---

### Branches

```text
Branch List
```

---

```text
Create Branch
```

---

```text
Edit Branch
```

---

### Services

```text
Services List
```

---

```text
Create Service
```

---

```text
Edit Service
```

---

### Working Hours

```text
Working Hours
```

Contains:

```text
Branch Hours

Barber Hours
```

---

### Settings

```text
Profile

Shop Settings

Notifications

Subscription
```

---

# Barber Application

---

### Authentication

```text
Login
```

---

### Home

```text
Barber Home
```

Data Source:

```text
get_barber_timeline
```

---

### Upcoming

```text
Upcoming Bookings
```

Data Source:

```text
get_barber_upcoming_bookings
```

---

### Profile

```text
Profile
```

---

### Availability

```text
Availability
```

Built on:

```text
working_hours
```

---

# 24. Owner Navigation Map

```text
Login
  │
  ▼

Owner Home
  │
  ├─────────────► Bookings
  │                   │
  │                   ├────► Booking Details
  │                   │
  │                   └────► Create Booking
  │
  ├─────────────► Staff
  │                   │
  │                   └────► Add Staff
  │
  ├─────────────► Branches
  │                   │
  │                   ├────► Create Branch
  │                   │
  │                   └────► Edit Branch
  │
  ├─────────────► Services
  │                   │
  │                   ├────► Create Service
  │                   │
  │                   └────► Edit Service
  │
  ├─────────────► Working Hours
  │                   │
  │                   ├────► Branch Hours
  │                   │
  │                   └────► Barber Hours
  │
  └─────────────► Settings
```

---

# 25. Barber Navigation Map

```text
Login
  │
  ▼

Barber Home
  │
  ├─────────────► Timeline
  │
  ├─────────────► Upcoming Bookings
  │
  ├─────────────► Availability
  │
  └─────────────► Profile
```

---

# 26. Owner Flow — Login

```text
Login Screen
      │
      ▼

Supabase Auth
      │
      ▼

Profile Lookup
      │
      ▼

Role Detection
      │
      ▼

Owner Home
```

---

# 27. Owner Flow — Dashboard

```text
Owner Home
      │
      ▼

get_owner_dashboard_summary
      │
      ▼

Metrics

      +

get_owner_bookings_feed
      │
      ▼

Recent Bookings
```

---

# 28. Owner Flow — Create Booking

This is the most important flow in the system.

---

## Flow Diagram

```text
Owner

  │
  ▼

Select Branch

  │
  ▼

Select Service

  │
  ▼

Load Staff

(get_shop_staff_with_profiles)

  │
  ▼

Select Barber

  │
  ▼

Select Date

  │
  ▼

Select Time Preference

  │
  ▼

smart-booking-slots

  │
  ▼

Recommended Slots

  │
  ▼

Select Slot

  │
  ▼

create_booking_by_staff

  │
  ▼

Booking Created
```

---

## Engine Relationship

```text
Create Booking Screen

        │

        ▼

smart-booking-slots

        │

        ▼

Top 5 Suggestions

        │

        ▼

create_booking_by_staff
```

---

# 29. Owner Flow — Add Staff

Confirmed From Edge Function.

```text
Owner

   │

   ▼

Add Staff Form

   │

   ▼

create-staff

   │

   ├────► auth.users

   ├────► profiles

   └────► shop_staff

   │

   ▼

Success
```

---

# 30. Owner Flow — Working Hours

```text
Working Hours

      │

      ├────► Branch Hours

      │

      └────► Barber Hours
```

---

## Effective Schedule Calculation

```text
Barber Hours Exist?

        │

    ┌───┴───┐

   Yes     No

    │       │

    ▼       ▼

Barber    Branch
Hours     Hours
```

---

# 31. Owner Flow — Staff Transfer

Business Rule.

```text
Owner

  │

  ▼

Transfer Barber

  │

  ▼

Check Future Bookings

  │

  ├────► Future Bookings Exist
  │
  └────► Reject Transfer

  │

  └────► No Future Bookings

            │

            ▼

     Transfer Allowed
```

---

# 32. Barber Flow — Daily Work

```text
Barber Login

      │

      ▼

Barber Home

      │

      ▼

Timeline

(get_barber_timeline)

      │

      ▼

Today's Schedule
```

---

# 33. Barber Flow — Upcoming Bookings

```text
Barber Home

      │

      ▼

Upcoming Bookings

      │

      ▼

get_barber_upcoming_bookings

      │

      ▼

Future Bookings
```

---

# 34. Wireframe Mapping

Current Existing Wireframes.

---

## Owner Home

Status:

```text
Designed
```

Mapped To:

```text
get_owner_dashboard_summary

get_owner_bookings_feed
```

---

## Bookings List

Status:

```text
Designed
```

Mapped To:

```text
get_shop_bookings
```

---

Contains:

```text
Bottom Sheet Actions
```

---

## Create Booking

Status:

```text
Designed
```

Mapped To:

```text
services

get_shop_staff_with_profiles

smart-booking-slots

create_booking_by_staff
```

---

## Working Hours

Status:

```text
Designed
```

Mapped To:

```text
working_hours
```

---

Contains:

```text
Branch Hours

Barber Hours
```

---

# 35. Screen Dependency Diagram

```text
Owner Home
     │
     ├────────────► Bookings
     │                  │
     │                  ▼
     │          Booking Details
     │
     ▼

Create Booking

     │
     ▼

Smart Booking Engine

     │
     ▼

Booking Created
```

---

# 36. UI Architecture Relationship

```text
Dashboard
      │
      ▼

Bookings
      │
      ▼

Create Booking
      │
      ▼

Smart Booking Engine
```

Meaning:

The system center is NOT Dashboard.

The center is:

```text
Create Booking
```

Everything else supports it.

---

# 37. MVP Completion Status

Confirmed Existing Screens:

```text
Owner Home

Bookings List

Create Booking

Working Hours
```

Remaining Screens:

```text
Login

Staff

Add Staff

Services

Branches

Settings

Barber Home

Upcoming Bookings

Profile

Availability
```

---

# End Of Part 3

Next:

Part 4

- Frontend Architecture
- Folder Structure
- Domain Structure
- Service Layer Rules
- React Query Strategy
- Zustand Strategy
- Middleware & Auth Flow
- API Consumption Rules
- Coding Standards