# PROJECT_MASTER_REFERENCE.md
# Part 4 — Frontend Architecture, Folder Structure, State Management & Authentication

Status: Architecture Decisions

---

# 38. Frontend Technology Stack

## Core Stack

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Supabase
React Query
Zustand
```

---

## Application Type

```text
PWA
```

Not React Native.

Reason:

Primary users:

```text
Owner
Barber
```

Work from:

```text
Shop
Branch
Desktop
Tablet
Phone
```

PWA provides enough functionality.

---

# 39. Frontend Architecture Philosophy

The frontend is:

```text
UI Layer
```

Not:

```text
Business Logic Layer
```

Business logic belongs to:

```text
Database

RPC Functions

Edge Functions
```

---

## Correct Architecture

```text
Screen

  │

  ▼

Hook

  │

  ▼

Service

  │

  ▼

RPC / Edge Function

  │

  ▼

Database
```

---

## Forbidden Architecture

```text
Screen

  │

  ▼

200 Lines Business Logic

  │

  ▼

Supabase
```

---

# 40. Domain Driven Structure

Project Structure:

```text
src

├── app
│
├── domains
│
└── shared
```

---

# 41. App Layer

Purpose:

Routing only.

Contains:

```text
Routes

Layouts

Loading

Error Pages
```

---

Example:

```text
app

├── login

├── owner

│   ├── dashboard

│   ├── bookings

│   ├── staff

│   ├── services

│   ├── branches

│   └── settings

└── barber

    ├── timeline

    ├── upcoming

    └── profile
```

---

# 42. Domains Layer

Purpose:

Business features.

---

Structure:

```text
domains

├── auth

├── booking

├── staff

├── services

├── branch

├── owner

├── barber

└── notifications
```

---

Each domain owns:

```text
components

hooks

services

types

schemas
```

---

Example:

```text
domains

└── booking

    ├── components

    ├── hooks

    ├── services

    ├── types

    └── schemas
```

---

# 43. Shared Layer

Purpose:

Reusable cross-domain code.

---

Contains:

```text
shared

├── components

├── hooks

├── lib

├── constants

├── utils

└── types
```

---

# 44. Service Layer Rules

The Service Layer is mandatory.

---

Services are responsible for:

```text
Calling RPCs

Calling Edge Functions

Calling Tables

Mapping Responses
```

---

Services are NOT responsible for:

```text
Rendering

State

UI
```

---

Example:

```ts
booking.service.ts
```

Contains:

```text
getBookings

createBooking

getRecommendedSlots
```

---

# 45. Screen Rules

Screens must NEVER:

```text
Call Supabase Directly
```

---

Allowed:

```text
Screen

 ▼

Hook

 ▼

Service
```

---

Forbidden:

```text
Screen

 ▼

Supabase
```

---

# 46. Hook Rules

Hooks orchestrate UI behavior.

---

Example:

```text
useBookings

useCreateBooking

useStaff

useWorkingHours
```

---

Responsibilities:

```text
React Query

Form State

Mutations

UI Events
```

---

Hooks must NOT:

```text
Contain SQL

Contain RPC Logic

Contain Supabase Queries
```

---

# 47. React Query Strategy

Purpose:

```text
Server State
```

---

React Query owns:

```text
Bookings

Staff

Services

Dashboard

Notifications

Working Hours
```

---

Rule:

If data comes from backend:

```text
React Query
```

---

Example:

```text
get_shop_bookings

get_owner_dashboard_summary

get_barber_timeline
```

All belong to React Query.

---

# 48. Query Key Structure

Standard:

```text
["dashboard"]

["bookings"]

["bookings", shopId]

["staff"]

["services"]

["working-hours"]
```

---

Never use:

```text
random strings
```

---

# 49. Mutation Strategy

Examples:

```text
Create Booking

Create Staff

Update Working Hours

Create Service
```

Must:

```text
Invalidate Related Queries
```

---

Example:

```text
Create Booking

       │

       ▼

Invalidate

["bookings"]

["dashboard"]
```

---

# 50. Zustand Strategy

Purpose:

```text
Client State
```

Only.

---

Allowed:

```text
Selected Branch

Theme

Sidebar State

Filters

Temporary Drafts
```

---

Forbidden:

```text
Bookings

Staff

Services

Dashboard Data
```

Because:

```text
Those Are Server State
```

---

# 51. Global Stores

Expected Stores:

```text
auth.store

branch.store

ui.store
```

---

## auth.store

Contains:

```text
user

role

session
```

---

## branch.store

Contains:

```text
selectedBranch
```

---

## ui.store

Contains:

```text
drawer state

sheet state

navigation state
```

---

# 52. Authentication Architecture

Authentication Source:

```text
Supabase Auth
```

---

User Lifecycle:

```text
Auth User

     │

     ▼

Profile

     │

     ▼

Role

     │

     ▼

Application
```

---

# 53. Session Architecture

Three files exist:

---

## client.ts

Purpose:

Browser Supabase Client.

Used in:

```text
Client Components
```

---

## server.ts

Purpose:

Server Supabase Client.

Used in:

```text
Server Components
```

---

## proxy.ts

Purpose:

Refresh Session

Maintain Cookies

Keep Auth Valid
```

---

Important:

```text
proxy.ts
DOES NOT
Handle Roles
```

---

# 54. Middleware Architecture

Purpose:

Route Protection

Role Routing

Access Control

---

Flow:

```text
Request

   │

   ▼

middleware.ts

   │

   ▼

proxy.ts

   │

   ▼

Refresh Session

   │

   ▼

Get User

   │

   ▼

Get Profile

   │

   ▼

Check Role

   │

   ▼

Allow / Redirect
```

---

# 55. Route Protection Rules

---

## Anonymous User

Trying to access:

```text
/owner

/barber
```

Result:

```text
Redirect Login
```

---

## Logged Owner

Trying to access:

```text
/login
```

Result:

```text
Redirect Dashboard
```

---

## Barber Accessing Owner Routes

Result:

```text
Redirect Barber Home
```

---

## Owner Accessing Barber Routes

Result:

```text
Redirect Owner Dashboard
```

---

# 56. Role Source

Role Source:

```text
profiles.role
```

---

Never use:

```text
users.role
```

Reason:

```text
Legacy Table
```

---

# 57. Data Flow Diagram

```text
UI

 │

 ▼

Hook

 │

 ▼

React Query

 │

 ▼

Service

 │

 ▼

RPC / Edge Function

 │

 ▼

Database
```

---

# 58. Smart Booking Flow

```text
Create Booking Screen

          │

          ▼

useCreateBooking

          │

          ▼

booking.service

          │

          ▼

smart-booking-slots

          │

          ▼

Recommended Slots

          │

          ▼

create_booking_by_staff

          │

          ▼

Booking Created
```

---

# 59. Create Staff Flow

```text
Add Staff Screen

        │

        ▼

useCreateStaff

        │

        ▼

staff.service

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

# 60. Architecture Constraints

Must Follow:

```text
No Direct SQL In Components

No Direct Supabase Calls In Screens

No Business Logic In UI

No Server State In Zustand

All Booking Logic Goes Through Backend
```

---

# 61. Architecture Summary

Frontend Responsibility:

```text
Display

Interaction

Navigation

Forms
```

Backend Responsibility:

```text
Validation

Scheduling

Security

Business Rules

Booking Logic
```

---

# End Of Part 4

Next:

Part 5

- Design System
- UI Patterns
- Colors
- Typography
- Components
- Wireframe Standards
- Future Roadmap
- Known Constraints
- Final Decisions Log
- Development Rules