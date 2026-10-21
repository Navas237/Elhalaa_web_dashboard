# AI Developer Guide

> This document explains how this project is built and how every AI Agent or developer should contribute to it.

---

# Project Overview

This project is a production-grade SaaS platform for barbershops built with:

* Next.js App Router
* TypeScript
* Supabase
* React Query
* shadcn/ui
* Tailwind CSS v4
* Framer Motion

Architecture follows Domain Driven Design (DDD-inspired).

---

# Current Completed Features

## Authentication

Completed:

* Login Page
* Supabase Authentication
* Middleware Protection
* Session Refresh
* Role-based Routing
* Owner Route Protection
* Barber Route Protection

Implemented files include:

* client.ts
* server.ts
* proxy.ts
* middleware.ts
* auth.service.ts

---

## Dashboard

Completed:

Dashboard Summary

* Dashboard Cards
* Active Barbers Widget
* React Query Integration
* DTO Mapping
* Typed Services

---

## Bookings

Completed:

* Owner Bookings Page
* Booking Feed
* Booking DTO
* Booking Hooks
* Booking Service
* Booking Components
* Local Filtering
* Modern UI

Booking status workflow will be implemented later.

---

# Project Architecture

Every feature follows exactly the same structure.

```text
Service
    ↓
Hook
    ↓
DTO
    ↓
Component
    ↓
Page
```

Pages must never contain business logic.

---

# Folder Structure

Each domain owns its code.

Example:

```text
domains

auth

booking

owner

staff

shop

service
```

Each domain contains:

```text
components

dto

hooks

services

types

keys
```

---

# Service Layer

Services are the only layer allowed to communicate with Supabase.

Example:

```text
Supabase RPC

↓

Service

↓

Hook
```

Never call Supabase directly inside Components.

Never call Supabase directly inside Pages.

---

# Hooks

Hooks are responsible for React Query.

Example:

```text
useDashboardSummary()

useOwnerBookings()

useActiveBarbers()
```

Hooks call Services.

Hooks never contain SQL.

Hooks never contain UI.

---

# DTO Pattern

Every RPC response must be converted before reaching the UI.

```text
RPC

↓

OwnerBookingRpc

↓

toBookingCardDto()

↓

BookingCardDto

↓

Component
```

The UI never depends on raw database field names.

Example:

Database:

```text
client_name
```

DTO:

```text
customerName
```

---

# Database Types

Database types are generated from Supabase.

Generated file:

```text
database.types.ts
```

Never edit this file manually.

---

# database.ts

database.ts exposes clean reusable types.

Example:

* Booking
* Profile
* UserRole
* BookingStatus

Always import types from database.ts instead of database.types.ts whenever possible.

---

# React Query

Every feature owns its own:

* Hook
* Query Keys

Example:

```text
booking

↓

keys.ts

↓

useOwnerBookings()
```

Do not create duplicated query keys.

Always invalidate using the domain keys.

---

# Components

Pages should compose Components only.

Correct:

```text
Page

↓

BookingsList

↓

BookingCard
```

Wrong:

```text
Page

↓

200 lines of JSX
```

---

# Shared Components

Always reuse existing shared components.

Use:

* Button
* Card
* Input
* Badge
* Avatar
* Sheet
* Dialog
* Skeleton
* Separator

Do not duplicate existing UI.

---

# Styling

Use:

* Tailwind CSS
* shadcn/ui
* Project Design Tokens

Follow the project's design system.

Do not invent new colors.

Do not hardcode spacing.

---

# Animation

Animations are implemented with Framer Motion.

Allowed:

* Fade
* Slide
* Scale
* Stagger
* Layout Animation

Animations must remain subtle and production-ready.

Avoid excessive effects.

---

# State Management

React Query manages server state.

React state manages UI state.

Do not duplicate server state inside local state.

---

# Data Fetching Rules

Correct:

```text
Component

↓

Hook

↓

Service

↓

Supabase
```

Wrong:

```text
Component

↓

Supabase
```

---

# Business Logic

Business logic belongs inside:

* Services
* PostgreSQL RPCs

Never place business logic inside Components.

Never place business logic inside Pages.

---

# Filtering

If data already exists inside React Query Cache:

* Search locally.
* Filter locally.
* Sort locally.

Do not send unnecessary requests.

---

# Naming

Use clear names.

Examples:

```text
useOwnerBookings

getOwnerBookings

BookingCard

BookingsList

BookingCardDto

OwnerBookingRpc
```

Avoid abbreviations.

---

# Code Standards

* Strict TypeScript.
* No `any`.
* Small focused Components.
* Single Responsibility Principle.
* Reuse existing code before creating new code.
* Strong typing everywhere.

---

# Before Adding Any Feature

Always follow this order:

1. Service
2. Types
3. DTO
4. Hook
5. Component
6. Page

Never skip layers.

---

# Important Rules

Never invent APIs.

Never invent RPCs.

Never invent database columns.

Always inspect:

* database.types.ts
* database.ts

before implementing any feature.

If an RPC or table does not exist, stop and ask before creating assumptions.

---

# Goal

The codebase should remain:

* predictable
* scalable
* strongly typed
* reusable
* production-ready

Every new feature must follow exactly the same architecture.
