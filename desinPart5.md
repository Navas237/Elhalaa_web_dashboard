# PROJECT_MASTER_REFERENCE.md
# Part 5 — Design System, Development Rules, Roadmap & Final Decisions

Status: Official Project Standards

---

# 62. Design System Philosophy

The design system exists for:

```text
Consistency

Speed

Maintainability

Scalability
```

The goal is:

```text
Build Once
Reuse Everywhere
```

---

# 63. UI Principles

Every screen should feel:

```text
Simple

Fast

Mobile First

Operational
```

This is NOT:

```text
Social Network

Marketing Website

Portfolio
```

This is:

```text
Operational Business Software
```

Used daily by:

```text
Owners

Barbers
```

---

# 64. Visual Style

Direction:

```text
Modern SaaS
```

Reference Inspiration:

```text
Bosta
```

---

# 65. Theme

Official Theme:

```text
Light Mode
```

Only.

Dark mode is:

```text
Out Of Scope
```

For MVP.

---

# 66. Color System

Primary:

```text
Red
```

Purpose:

```text
Actions

Highlights

Primary Buttons
```

---

Secondary Accent:

```text
Turquoise
```

Purpose:

```text
Supporting Elements

Indicators

Secondary Visual Accents
```

---

Neutral Palette:

```text
White

Gray 50

Gray 100

Gray 200

Gray 300

Gray 500

Gray 700

Gray 900
```

---

# 67. Layout Philosophy

Application First.

Not Marketing First.

---

Preferred Layout:

```text
Header

Content

Bottom Navigation
```

---

# 68. Mobile First Strategy

Primary Target:

```text
Phone
```

---

Secondary:

```text
Tablet
```

---

Third:

```text
Desktop
```

---

All screens must be designed:

```text
Mobile First
```

---

# 69. Navigation Pattern

Owner Navigation:

```text
Home

Bookings

Staff

More
```

---

Inside More:

```text
Branches

Services

Working Hours

Settings
```

---

Barber Navigation:

```text
Home

Upcoming

Availability

Profile
```

---

# 70. Header Pattern

Every screen follows:

```text
Page Title

Optional Branch Selector

Optional Actions
```

---

Example:

```text
Bookings

[Branch Switcher]

[Create Booking]
```

---

# 71. Card Pattern

Cards are the primary information container.

Used for:

```text
Bookings

Staff

Services

Metrics
```

---

Rules:

```text
Single Responsibility

No Nested Cards

No Excessive Actions
```

---

# 72. Form Pattern

All forms use:

```text
Label

Input

Validation Message

Helper Text (optional)
```

---

Forbidden:

```text
Placeholder Only Forms
```

---

# 73. Bottom Sheet Pattern

Used for:

```text
Booking Actions

Staff Actions

Quick Operations
```

---

Not used for:

```text
Complex Forms
```

---

# 74. Empty States

Every list screen must have:

```text
Empty State
```

Example:

```text
No Bookings Found

Create Your First Booking
```

---

# 75. Loading States

Every screen must support:

```text
Skeleton Loading
```

Not:

```text
Loading...
```

Text only.

---

# 76. Error States

Every request must support:

```text
Retry
```

Action.

---

Pattern:

```text
Something Went Wrong

[Retry]
```

---

# 77. Notification UX

Notifications should be:

```text
Informational

Actionable

Short
```

---

Avoid:

```text
Long Paragraphs
```

---

# 78. Booking UX Rules

Create Booking is the most important screen.

Priority:

```text
Speed
```

---

Owner should be able to:

```text
Create Booking

In Less Than 30 Seconds
```

---

# 79. Smart Booking UX

Never ask owner to:

```text
Calculate Time

Calculate Gaps

Calculate Availability
```

---

The engine decides.

UI displays.

---

Correct:

```text
Recommended Slots
```

---

Wrong:

```text
Manual Slot Calculation
```

---

# 80. Branch Selection Rule

Because:

```text
Services

Staff

Hours

Bookings
```

Depend on branch.

The first step in most workflows is:

```text
Select Branch
```

---

# 81. Service Architecture

Services are:

```text
Branch Specific
```

---

Future Packages:

```text
Package

 ├── Service A
 ├── Service B
 └── Service C
```

---

Packages are NOT MVP.

---

# 82. Development Rules

Rule #1

```text
No Direct Supabase Calls
Inside Screens
```

---

Rule #2

```text
All Business Logic
Lives In Backend
```

---

Rule #3

```text
Every Feature
Has Service Layer
```

---

Rule #4

```text
Every Feature
Has Types
```

---

Rule #5

```text
Every Query
Uses React Query
```

---

Rule #6

```text
Server State
Never Stored In Zustand
```

---

Rule #7

```text
No Any Types
```

---

Rule #8

```text
RPC First

Edge Function Second

Direct Table Access Last
```

---

# 83. DTO Strategy

Frontend should consume:

```text
DTOs
```

Not raw tables.

---

Preferred:

```ts
BookingCardDto
```

---

Not:

```ts
BookingsV2Row
```

Directly in UI.

---

# 84. Security Rules

Authorization Source:

```text
profiles.role
```

---

Never trust:

```text
Frontend Role State
```

Alone.

---

Backend remains authority.

---

# 85. Performance Rules

Always:

```text
Paginate Lists
```

---

Avoid:

```text
Load Everything
```

---

Use:

```text
React Query Caching
```

Aggressively.

---

# 86. Known Constraints

Constraint #1

```text
Manager Exists
In Backend
```

Not implemented in MVP.

---

Constraint #2

```text
Client Role Exists
```

Not implemented in MVP.

---

Constraint #3

```text
Booking Engine
Must Remain Backend Driven
```

---

Constraint #4

```text
Branch Is Core Context
```

Almost every workflow depends on it.

---

# 87. Future Roadmap

Phase 1

```text
Authentication

Dashboard

Bookings

Create Booking

Working Hours
```

---

Phase 2

```text
Staff Management

Services

Branches

Settings
```

---

Phase 3

```text
Barber Experience

Timeline

Availability

Upcoming Bookings
```

---

Phase 4

```text
Notifications

Payments

Wallet
```

---

Phase 5

```text
Reports

Analytics

Advanced Insights
```

---

Phase 6

```text
Packages

Promotions

Customer CRM
```

---

# 88. Final Decisions Log

Official Decisions:

---

Decision #1

```text
Next.js PWA
```

Approved.

---

Decision #2

```text
Supabase
```

Approved.

---

Decision #3

```text
React Query
For Server State
```

Approved.

---

Decision #4

```text
Zustand
For Client State
```

Approved.

---

Decision #5

```text
Light Mode Only
```

Approved.

---

Decision #6

```text
Bosta Inspired Design
```

Approved.

---

Decision #7

```text
Smart Booking Engine
Is Product Core
```

Approved.

---

Decision #8

```text
Owner Supports
Multiple Branches
```

Approved.

---

Decision #9

```text
Barber Transfer Allowed

Only If

No Future Bookings Exist
```

Approved.

---

Decision #10

```text
Manager
Not Included
In MVP Frontend
```

Approved.

---

Decision #11

```text
Client App
Out Of Scope
```

Approved.

---

Decision #12

```text
Backend
Is Source Of Truth
```

Approved.

---

# 89. Project Identity

This project is:

```text
Multi Branch Barber SaaS
```

Built around:

```text
Smart Booking Engine
```

Architecture Style:

```text
Backend Driven

Domain Based

PWA First
```

Primary Success Metric:

```text
Create Accurate Bookings
As Fast As Possible
```

---

# END OF PROJECT_MASTER_REFERENCE.md
# Version 1.0