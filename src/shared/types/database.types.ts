export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      _legacy_shops: {
        Row: {
          address: string | null
          barbers: Json | null
          created_at: string | null
          distance: string | null
          id: string
          image_url: string | null
          latitude: string | null
          longitude: string | null
          mangerList: Json | null
          name: string
          owner_id: string | null
          price: string | null
          price_range: string | null
          rating: number | null
          reviews: number | null
          shop_code: string
          status: string | null
        }
        Insert: {
          address?: string | null
          barbers?: Json | null
          created_at?: string | null
          distance?: string | null
          id?: string
          image_url?: string | null
          latitude?: string | null
          longitude?: string | null
          mangerList?: Json | null
          name: string
          owner_id?: string | null
          price?: string | null
          price_range?: string | null
          rating?: number | null
          reviews?: number | null
          shop_code: string
          status?: string | null
        }
        Update: {
          address?: string | null
          barbers?: Json | null
          created_at?: string | null
          distance?: string | null
          id?: string
          image_url?: string | null
          latitude?: string | null
          longitude?: string | null
          mangerList?: Json | null
          name?: string
          owner_id?: string | null
          price?: string | null
          price_range?: string | null
          rating?: number | null
          reviews?: number | null
          shop_code?: string
          status?: string | null
        }
        Relationships: []
      }
      booking_status_history: {
        Row: {
          booking_id: string
          changed_at: string
          changed_by: string | null
          id: string
          new_status: string
          old_status: string | null
        }
        Insert: {
          booking_id: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status: string
          old_status?: string | null
        }
        Update: {
          booking_id?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status?: string
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          barber_name: string
          client_id: string | null
          client_name: string
          date_of_booking: string
          day_name: string
          details: Json | null
          id: string
          payment_method: string
          shop_id: string
          status: string | null
          time_slot: string
        }
        Insert: {
          barber_name: string
          client_id?: string | null
          client_name: string
          date_of_booking: string
          day_name: string
          details?: Json | null
          id?: string
          payment_method: string
          shop_id: string
          status?: string | null
          time_slot: string
        }
        Update: {
          barber_name?: string
          client_id?: string | null
          client_name?: string
          date_of_booking?: string
          day_name?: string
          details?: Json | null
          id?: string
          payment_method?: string
          shop_id?: string
          status?: string | null
          time_slot?: string
        }
        Relationships: []
      }
      bookings_v2: {
        Row: {
          booking_date: string
          client_id: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          display_start_time: string | null
          end_time: string | null
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method_type"]
          service_id: string | null
          shop_id: string
          staff_id: string
          start_time: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          booking_date: string
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          display_start_time?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method_type"]
          service_id?: string | null
          shop_id: string
          staff_id: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          booking_date?: string
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          display_start_time?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method_type"]
          service_id?: string | null
          shop_id?: string
          staff_id?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_v2_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_v2_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_v2_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_v2_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_v2_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "shop_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_attempts: {
        Row: {
          attempted_at: string
          error_code: string | null
          error_message: string | null
          id: string
          job_id: string
          provider: string
          provider_message_id: string | null
          push_device_id: string | null
          status: string
        }
        Insert: {
          attempted_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          provider: string
          provider_message_id?: string | null
          push_device_id?: string | null
          status: string
        }
        Update: {
          attempted_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          provider?: string
          provider_message_id?: string | null
          push_device_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_attempts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "notification_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_delivery_attempts_push_device_id_fkey"
            columns: ["push_device_id"]
            isOneToOne: false
            referencedRelation: "push_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_jobs: {
        Row: {
          attempts: number
          booking_id: string | null
          created_at: string
          data: Json
          id: string
          idempotency_key: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          next_attempt_at: string | null
          recipient_user_id: string
          scheduled_at: string
          sent_at: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          booking_id?: string | null
          created_at?: string
          data?: Json
          id?: string
          idempotency_key: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          next_attempt_at?: string | null
          recipient_user_id: string
          scheduled_at: string
          sent_at?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          booking_id?: string | null
          created_at?: string
          data?: Json
          id?: string
          idempotency_key?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          next_attempt_at?: string | null
          recipient_user_id?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_jobs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_jobs_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_jobs_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          booking_id: string | null
          created_at: string
          data: Json
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          booking_id?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          booking_id?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          order_id: number
          status: string
          transaction_id: number
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          order_id: number
          status: string
          transaction_id: number
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          order_id?: number
          status?: string
          transaction_id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      payments_v2: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          user_id: string | null
          wallet_tx_id: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          user_id?: string | null
          wallet_tx_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          user_id?: string | null
          wallet_tx_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_v2_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_v2_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_v2_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_v2_wallet_tx_id_fkey"
            columns: ["wallet_tx_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          wallet_balance: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          wallet_balance?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          wallet_balance?: number
        }
        Relationships: []
      }
      push_devices: {
        Row: {
          created_at: string
          device_name: string | null
          id: string
          is_active: boolean
          last_seen_at: string
          platform: string
          provider: string
          staff_id: string | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string
          platform: string
          provider: string
          staff_id?: string | null
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string
          platform?: string
          provider?: string
          staff_id?: string | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_devices_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "shop_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          display_order: number
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price: number
          shop_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          shop_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_staff: {
        Row: {
          ended_at: string | null
          hired_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["staff_role"]
          shop_id: string
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          hired_at?: string
          id?: string
          is_active?: boolean
          role: Database["public"]["Enums"]["staff_role"]
          shop_id: string
          user_id: string
        }
        Update: {
          ended_at?: string | null
          hired_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["staff_role"]
          shop_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_staff_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shops_v2: {
        Row: {
          address: string | null
          booking_end_date: string | null
          booking_start_date: string | null
          closing_time: string | null
          created_at: string
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_time: string | null
          owner_id: string
          rating: number | null
          reference_package_id: string | null
          shop_code: string
          status: Database["public"]["Enums"]["shop_status_type"]
          timezone: string | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          booking_end_date?: string | null
          booking_start_date?: string | null
          closing_time?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_time?: string | null
          owner_id: string
          rating?: number | null
          reference_package_id?: string | null
          shop_code: string
          status?: Database["public"]["Enums"]["shop_status_type"]
          timezone?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          booking_end_date?: string | null
          booking_start_date?: string | null
          closing_time?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_time?: string | null
          owner_id?: string
          rating?: number | null
          reference_package_id?: string | null
          shop_code?: string
          status?: Database["public"]["Enums"]["shop_status_type"]
          timezone?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_v2_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_v2_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_v2_reference_package_id_fkey"
            columns: ["reference_package_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          codeofshop: string | null
          created_at: string | null
          email: string
          id: string
          menus: string | null
          name: string | null
          phone: string | null
          role: string | null
          wallet_balance: number | null
        }
        Insert: {
          codeofshop?: string | null
          created_at?: string | null
          email: string
          id: string
          menus?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          wallet_balance?: number | null
        }
        Update: {
          codeofshop?: string | null
          created_at?: string | null
          email?: string
          id?: string
          menus?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          tx_type: Database["public"]["Enums"]["wallet_tx_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          tx_type: Database["public"]["Enums"]["wallet_tx_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          tx_type?: Database["public"]["Enums"]["wallet_tx_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      working_hours: {
        Row: {
          day_of_week: number
          end_time: string
          id: string
          is_off: boolean
          shop_id: string
          staff_id: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: string
          is_off?: boolean
          shop_id: string
          staff_id?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: string
          is_off?: boolean
          shop_id?: string
          staff_id?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "working_hours_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "shop_staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          id: string | null
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          avatar_url?: string | null
          id?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          avatar_url?: string | null
          id?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      shop_booking_stats: {
        Row: {
          bookings_today: number | null
          bookings_today_active: number | null
          cancelled_count: number | null
          completed_count: number | null
          confirmed_count: number | null
          pending_count: number | null
          shop_id: string | null
          total_bookings: number | null
          upcoming_bookings: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_v2_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_v2"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auto_complete_past_bookings: { Args: never; Returns: number }
      auto_complete_today_past_bookings: { Args: never; Returns: number }
      create_booking_by_staff: {
        Args: {
          p_booking_date?: string
          p_client_id?: string
          p_client_name?: string
          p_client_phone?: string
          p_display_start_time?: string
          p_end_time?: string
          p_notes?: string
          p_payment_method?: string
          p_service_id?: string
          p_shop_id: string
          p_staff_id: string
          p_start_time?: string
          p_status?: string
        }
        Returns: Json
      }
      get_barber_available_slots: {
        Args: {
          p_barber_user_id: string
          p_date: string
          p_service_duration?: number
          p_shop_id: string
          p_step_minutes?: number
        }
        Returns: {
          display_time: string
          display_time_24h: string
          end_time: string
          start_time: string
        }[]
      }
      get_barber_timeline: {
        Args: { p_barber_user_id: string; p_date: string; p_shop_id: string }
        Returns: {
          booking_id: string
          client_name: string
          client_phone: string
          duration_minutes: number
          end_time: string
          notes: string
          payment_method: string
          segment_type: string
          service_duration: number
          service_name: string
          start_time: string
          status: string
        }[]
      }
      get_barber_upcoming_bookings: {
        Args: {
          p_barber_user_id: string
          p_from_date?: string
          p_page?: number
          p_page_size?: number
        }
        Returns: {
          barber_id: string
          barber_name: string
          client_id: string
          client_name: string
          client_phone: string
          created_at: string
          date_of_booking: string
          display_start_time: string
          end_time: string
          id: string
          notes: string
          payment_method: string
          service_duration: number
          service_id: string
          service_name: string
          service_price: number
          shop_id: string
          shop_name: string
          staff_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_count: number
          user_id: string
        }[]
      }
      get_owner_bookings_feed: {
        Args: {
          p_barber_id?: string
          p_date_from?: string
          p_date_to?: string
          p_owner_id: string
          p_page?: number
          p_page_size?: number
          p_shop_id?: string
          p_status_filter?: string
        }
        Returns: {
          barber_id: string
          barber_name: string
          client_id: string
          client_name: string
          client_phone: string
          created_at: string
          date_of_booking: string
          display_start_time: string
          end_time: string
          id: string
          notes: string
          payment_method: string
          service_duration: number
          service_id: string
          service_name: string
          service_price: number
          shop_id: string
          shop_name: string
          staff_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_count: number
          user_id: string
        }[]
      }
      get_owner_dashboard_summary: {
        Args: { p_owner_id: string }
        Returns: {
          cancelled_today: number
          confirmed_bookings: number
          pending_bookings: number
          revenue_today: number
          total_barbers: number
          total_bookings_today: number
          total_managers: number
          total_shops: number
          upcoming_bookings: number
          waiting_time_bookings: number
        }[]
      }
      get_owner_shops_lightweight: {
        Args: { p_owner_id: string }
        Returns: {
          address: string
          booking_end_date: string
          booking_start_date: string
          bookings_today: number
          closing_time: string
          created_at: string
          id: string
          image_url: string
          latitude: number
          longitude: number
          name: string
          opening_time: string
          status: Database["public"]["Enums"]["shop_status_type"]
          total_bookings: number
          upcoming_bookings: number
        }[]
      }
      get_server_time: {
        Args: { p_timezone?: string }
        Returns: {
          server_date: string
          server_time_minutes: number
          timezone: string
        }[]
      }
      get_shop_bookings: {
        Args: {
          p_barber_id?: string
          p_date_from?: string
          p_date_to?: string
          p_page?: number
          p_page_size?: number
          p_shop_id: string
          p_status_filter?: string
        }
        Returns: {
          barber_id: string
          barber_name: string
          client_id: string
          client_name: string
          client_phone: string
          created_at: string
          date_of_booking: string
          display_start_time: string
          end_time: string
          id: string
          notes: string
          payment_method: string
          service_duration: number
          service_id: string
          service_name: string
          service_price: number
          shop_id: string
          staff_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_count: number
          user_id: string
        }[]
      }
      get_shop_staff_with_profiles: {
        Args: { p_shop_id: string }
        Returns: {
          avatar_url: string
          email: string
          hired_at: string
          is_active: boolean
          name: string
          phone: string
          role: Database["public"]["Enums"]["staff_role"]
          shop_id: string
          staff_id: string
          user_id: string
        }[]
      }
      get_shop_today_bookings: {
        Args: { p_shop_id: string }
        Returns: {
          barber_id: string
          barber_name: string
          client_id: string
          client_name: string
          client_phone: string
          created_at: string
          date_of_booking: string
          display_start_time: string
          end_time: string
          id: string
          notes: string
          payment_method: string
          service_duration: number
          service_id: string
          service_name: string
          service_price: number
          shop_id: string
          staff_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          user_id: string
        }[]
      }
      get_staff_available_slots: {
        Args: {
          p_date: string
          p_service_duration?: number
          p_staff_id: string
          p_timezone?: string
        }
        Returns: {
          actual_end_minutes: number
          actual_end_time: string
          actual_start_minutes: number
          actual_start_time: string
          display_start_minutes: number
          display_start_time: string
          score: number
        }[]
      }
      get_staff_occupied_slots: {
        Args: { p_date: string; p_staff_id: string }
        Returns: {
          end_time: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
        }[]
      }
      is_shop_owner: {
        Args: { p_shop_id: string; p_user_id: string }
        Returns: boolean
      }
      make_time_range: {
        Args: { t_end: string; t_start: string }
        Returns: unknown
      }
      min_to_time: { Args: { m: number }; Returns: string }
      move_barber_to_branch: {
        Args: { p_new_shop_id: string; p_shop_staff_id: string }
        Returns: Json
      }
      rpc_wallet_deduct: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_tx_type: Database["public"]["Enums"]["wallet_tx_type"]
          p_user_id: string
        }
        Returns: Json
      }
      rpc_wallet_deposit: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_tx_type: Database["public"]["Enums"]["wallet_tx_type"]
          p_user_id: string
        }
        Returns: Json
      }
      snap_grid_ceil: { Args: { m: number; step: number }; Returns: number }
      time_to_min: { Args: { t: string }; Returns: number }
      update_working_hours: {
        Args: { p_schedule: Json; p_staff_id: string }
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
        | "waiting_time"
      payment_method_type: "wallet" | "cash" | "card"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      shop_status_type: "open" | "closed" | "maintenance"
      staff_role: "barber" | "manager"
      user_role: "client" | "barber" | "manager" | "owner"
      wallet_tx_type: "deposit" | "withdrawal" | "booking_payment" | "refund"
    }
    CompositeTypes: {
      slot_candidate: {
        display_start_min: number | null
        actual_start_min: number | null
        actual_end_min: number | null
        block_start: number | null
        block_end: number | null
        score: number | null
        pdr: number | null
        adjacency_bonus: number | null
        earliness: number | null
        fragmentation_penalty: number | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
        "waiting_time",
      ],
      payment_method_type: ["wallet", "cash", "card"],
      payment_status: ["pending", "paid", "refunded", "failed"],
      shop_status_type: ["open", "closed", "maintenance"],
      staff_role: ["barber", "manager"],
      user_role: ["client", "barber", "manager", "owner"],
      wallet_tx_type: ["deposit", "withdrawal", "booking_payment", "refund"],
    },
  },
} as const
