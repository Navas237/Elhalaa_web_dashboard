# React Native Client Mobile Application Implementation Plan

> **For Agent:** REQUIRED SKILLS: Use `writing-plans`, `mobile-design`, `expo-tailwind-setup`, `zustand-store-ts`, `tanstack-query-expert`.

**Goal:** Build a production-grade React Native Expo mobile application with a Dual-Mode Multi-Tenant architecture (Direct Tenant Branding vs Marketplace Discovery), Arabic-first Cairo typography, NativeWind v4 styling, Supabase integration, FCM/APNs push notifications via `push_devices`, and pluggable payment strategies.

**Architecture:** Feature-first DDD layout with Expo Router v4 file-based routing. Dual-mode routing dynamically determines whether the user is routed to a locked salon experience (`(tenant)`) or the open marketplace (`(marketplace)`), backed by TanStack Query v5 for server caching and Zustand v5 for reactive offline-capable client state.

**Tech Stack:**
- **Framework:** Expo SDK 52+ with React Native & TypeScript (New Architecture)
- **Routing:** Expo Router v4 (typed navigation, deep linking)
- **Styling:** NativeWind v4 + Tailwind CSS + Cairo Typography
- **State & Cache:** Zustand v5 (Persisted) + TanStack React Query v5
- **Backend:** Supabase JS v2 + Expo SecureStore
- **Notifications:** Expo Notifications + FCM/APNs + restored `push_devices` table
- **Validation & Forms:** React Hook Form + Zod
- **List Performance:** Shopify FlashList

---

## Scope

### In Scope
- Dual-Mode Routing:
  - If `bound_tenant_id` is set: Marketplace is completely hidden; user navigates only their bound salon.
  - If `bound_tenant_id` is null (Guest or unbound): User enters Marketplace Discovery mode to browse and search salons.
- Authentication:
  - Email & Password, Google OAuth, Apple Sign-In, and Guest Checkout/Browse mode.
- Booking Engine:
  - Step-by-step flow (Services -> Barber -> Smart Slot calculation -> Client Info -> Booking Confirmation).
  - Integration with `create_customer_booking` and `smart-booking-slots`.
- Notification Subsystem:
  - Device token registration in Supabase `push_devices` table for Android (FCM) & iOS (APNs).
  - Notification permission handling and foreground listeners.
- Pluggable Payment System:
  - Strategy Pattern interface (`CashPaymentStrategy`, `WalletPaymentStrategy`, extensible for future gateways).
- RTL & Arabic Design:
  - Fully responsive, thumb-friendly Arabic UX with Cairo font weights (400, 600, 700).

### Out of Scope
- Direct payment gateway merchant account configuration (Stripe/Paymob SDK keys deferred).
- Heavy native C++ customization (handled cleanly via standard Expo prebuild plugins).

---

## Action Plan

### Task 1: Scaffolding Directory & Configuration
- **Location:** `d:\projets\barber-client-app/`
- Initialize `package.json`, `app.json`, `tsconfig.json`, `metro.config.js`, `tailwind.config.js`, `global.css`.
- Install dependencies without conflicts.

### Task 2: Core Design System & NativeWind v4 Setup
- Configure Cairo typography (`Cairo_400Regular`, `Cairo_600SemiBold`, `Cairo_700Bold`).
- Define semantic color tokens (Primary, Secondary, Background, Card, Border, Muted, Statuses).
- Set up RTL layout enforcement and `src/global.css`.

### Task 3: Storage & Supabase Client Layer
- Implement `src/core/storage/secureStore.ts` using `expo-secure-store`.
- Create `src/core/supabase/client.ts` with custom storage adapter.
- Create `src/core/query/queryClient.ts` with default query options.

### Task 4: State Management (Zustand Stores)
- Implement `src/domains/auth/store/authStore.ts` (User, Guest, Session, Role, Bound Tenant).
- Implement `src/domains/tenant/store/tenantStore.ts` (Active Tenant, Dual-mode Resolver, Theme).
- Implement `src/domains/booking/store/bookingDraftStore.ts` (Wizard state).

### Task 5: Domain Services & Backend Integration
- Implement `src/domains/booking/services/bookingService.ts` (`create_customer_booking`, slot fetching).
- Implement `src/domains/notifications/services/pushNotificationService.ts` (`push_devices` upsert).
- Implement `src/domains/payments/strategies/paymentStrategy.ts`.

### Task 6: Expo Router Navigation Layouts
- Root layout: `app/_layout.tsx` (Providers, Theme, Splash, Deep Linking).
- Auth Group: `app/(auth)/login.tsx`, `register.tsx`.
- Tenant Group: `app/(tenant)/_layout.tsx`, `[shopId]/index.tsx`, `[shopId]/book.tsx`.
- Marketplace Group: `app/(marketplace)/_layout.tsx`, `index.tsx`, `search.tsx`, `salon/[shopId].tsx`.
- Booking Wizard: `app/booking/step-services.tsx`, `step-barber.tsx`, `step-slot.tsx`, `confirmation.tsx`.

### Task 7: UI Component Library (Shadcn Mobile)
- Base components: `Button`, `Input`, `Card`, `Badge`, `Skeleton`, `Modal`, `SlotPicker`.
- Touch target compliance (minimum 44x44pt).

### Task 8: Verification & Compilation Check
- Run TypeScript compile validation (`tsc --noEmit`).
- Verify module resolution and exports.
