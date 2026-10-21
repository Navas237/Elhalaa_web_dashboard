import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from "./database.types"

// ========================================
// Enums
// ========================================

export type UserRole = Enums<"user_role">

export type StaffRole = Enums<"staff_role">

export type BookingStatus = Enums<"booking_status">

export type PaymentMethod = Enums<"payment_method_type">

export type PaymentStatus = Enums<"payment_status">

export type WalletTransactionType = Enums<"wallet_tx_type">

export type ShopStatus = Enums<"shop_status_type">

// ========================================
// Tables
// ========================================

export type Profile = Tables<"profiles">

export type Shop = Tables<"shops_v2">

export type Staff = Tables<"shop_staff">

export type Service = Tables<"services">

export type Booking = Tables<"bookings_v2">

export type WorkingHours = Tables<"working_hours">

export type Notification = Tables<"notifications">

export type NotificationJob = Tables<"notification_jobs">

export type NotificationDeliveryAttempt =
  Tables<"notification_delivery_attempts">

export type Payment = Tables<"payments_v2">

export type WalletTransaction =
  Tables<"wallet_transactions">

export type BookingStatusHistory =
  Tables<"booking_status_history">

export type PushDevice =
  Tables<"push_devices">

// ========================================
// Inserts
// ========================================

export type CreateProfileInput =
  TablesInsert<"profiles">

export type CreateShopInput =
  TablesInsert<"shops_v2">

export type CreateStaffInput =
  TablesInsert<"shop_staff">

export type CreateServiceInput =
  TablesInsert<"services">

export type CreateBookingInput =
  TablesInsert<"bookings_v2">

export type CreateWorkingHoursInput =
  TablesInsert<"working_hours">

export type CreateNotificationInput =
  TablesInsert<"notifications">

export type CreatePaymentInput =
  TablesInsert<"payments_v2">

// ========================================
// Updates
// ========================================

export type UpdateProfileInput =
  TablesUpdate<"profiles">

export type UpdateShopInput =
  TablesUpdate<"shops_v2">

export type UpdateStaffInput =
  TablesUpdate<"shop_staff">

export type UpdateServiceInput =
  TablesUpdate<"services">

export type UpdateBookingInput =
  TablesUpdate<"bookings_v2">

export type UpdateWorkingHoursInput =
  TablesUpdate<"working_hours">

export type UpdateNotificationInput =
  TablesUpdate<"notifications">

export type UpdatePaymentInput =
  TablesUpdate<"payments_v2">

// ========================================
// Export Database
// ========================================

export type AppDatabase = Database