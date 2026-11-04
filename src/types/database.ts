// GENERATED from the live `tripnest` Supabase schema — do not edit by hand.
// Regenerate after schema changes: `npm run db:types` (or the Supabase MCP generate_typescript_types tool).

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      amenities: {
        Row: {
          display_order: number
          id: string
          name: string
          slug: string
        }
        Insert: {
          display_order?: number
          id?: string
          name: string
          slug: string
        }
        Update: {
          display_order?: number
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      booking_guests: {
        Row: {
          booking_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_primary: boolean
          phone: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          phone?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_guests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          cancelled_at: string | null
          check_in: string
          check_out: string
          created_at: string
          currency: string
          fees: number
          guest_count: number
          hotel_id: string
          id: string
          idempotency_key: string
          is_demo: boolean
          nightly_price: number
          nights: number | null
          original_nightly_price: number
          reference: string
          room_count: number
          room_id: string
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"]
          subtotal: number
          taxes: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          check_in: string
          check_out: string
          created_at?: string
          currency?: string
          fees?: number
          guest_count: number
          hotel_id: string
          id?: string
          idempotency_key: string
          is_demo?: boolean
          nightly_price: number
          nights?: number | null
          original_nightly_price: number
          reference: string
          room_count: number
          room_id: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal: number
          taxes?: number
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          check_in?: string
          check_out?: string
          created_at?: string
          currency?: string
          fees?: number
          guest_count?: number
          hotel_id?: string
          id?: string
          idempotency_key?: string
          is_demo?: boolean
          nightly_price?: number
          nights?: number | null
          original_nightly_price?: number
          reference?: string
          room_count?: number
          room_id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal?: number
          taxes?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: Database["public"]["Enums"]["contact_subject"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: Database["public"]["Enums"]["contact_subject"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: Database["public"]["Enums"]["contact_subject"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          attractions: Json
          country: string
          created_at: string
          description: string
          id: string
          image_url: string
          is_popular: boolean
          name: string
          region: string
          short_description: string
          slug: string
          travel_info: Json
          updated_at: string
        }
        Insert: {
          attractions?: Json
          country: string
          created_at?: string
          description: string
          id?: string
          image_url: string
          is_popular?: boolean
          name: string
          region: string
          short_description: string
          slug: string
          travel_info?: Json
          updated_at?: string
        }
        Update: {
          attractions?: Json
          country?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          is_popular?: boolean
          name?: string
          region?: string
          short_description?: string
          slug?: string
          travel_info?: Json
          updated_at?: string
        }
        Relationships: []
      }
      hotel_amenities: {
        Row: {
          amenity_id: string
          hotel_id: string
          position: number
        }
        Insert: {
          amenity_id: string
          hotel_id: string
          position?: number
        }
        Update: {
          amenity_id?: string
          hotel_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "hotel_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_amenities_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_images: {
        Row: {
          alt: string
          created_at: string
          hotel_id: string
          id: string
          position: number
          url: string
        }
        Insert: {
          alt: string
          created_at?: string
          hotel_id: string
          id?: string
          position?: number
          url: string
        }
        Update: {
          alt?: string
          created_at?: string
          hotel_id?: string
          id?: string
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_images_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          accommodation_type: Database["public"]["Enums"]["accommodation_type"]
          address: string
          archived_at: string | null
          cancellation_policy: string
          check_in_time: string
          check_out_time: string
          city: string
          created_at: string
          description: string
          destination_id: string
          facilities: string[]
          id: string
          is_featured: boolean
          is_published: boolean
          name: string
          offer_discount_percent: number | null
          offer_label: string | null
          popularity: number
          review_count: number
          review_score: number
          short_description: string
          slug: string
          star_rating: number
          updated_at: string
        }
        Insert: {
          accommodation_type: Database["public"]["Enums"]["accommodation_type"]
          address: string
          archived_at?: string | null
          cancellation_policy: string
          check_in_time?: string
          check_out_time?: string
          city: string
          created_at?: string
          description: string
          destination_id: string
          facilities?: string[]
          id?: string
          is_featured?: boolean
          is_published?: boolean
          name: string
          offer_discount_percent?: number | null
          offer_label?: string | null
          popularity?: number
          review_count?: number
          review_score?: number
          short_description: string
          slug: string
          star_rating: number
          updated_at?: string
        }
        Update: {
          accommodation_type?: Database["public"]["Enums"]["accommodation_type"]
          address?: string
          archived_at?: string | null
          cancellation_policy?: string
          check_in_time?: string
          check_out_time?: string
          city?: string
          created_at?: string
          description?: string
          destination_id?: string
          facilities?: string[]
          id?: string
          is_featured?: boolean
          is_published?: boolean
          name?: string
          offer_discount_percent?: number | null
          offer_label?: string | null
          popularity?: number
          review_count?: number
          review_score?: number
          short_description?: string
          slug?: string
          star_rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotels_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_country: string | null
          author_name: string
          booking_id: string | null
          comment: string
          created_at: string
          hotel_id: string
          id: string
          is_published: boolean
          rating: number
          stayed_on: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          author_country?: string | null
          author_name: string
          booking_id?: string | null
          comment: string
          created_at?: string
          hotel_id: string
          id?: string
          is_published?: boolean
          rating: number
          stayed_on?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          author_country?: string | null
          author_name?: string
          booking_id?: string | null
          comment?: string
          created_at?: string
          hotel_id?: string
          id?: string
          is_published?: boolean
          rating?: number
          stayed_on?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[]
          bed_info: string
          blocked_units: number
          created_at: string
          description: string
          hotel_id: string
          id: string
          image_url: string | null
          is_active: boolean
          max_guests: number
          name: string
          price_per_night: number
          size_sqm: number | null
          total_units: number
          updated_at: string
        }
        Insert: {
          amenities?: string[]
          bed_info: string
          blocked_units?: number
          created_at?: string
          description: string
          hotel_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_guests: number
          name: string
          price_per_night: number
          size_sqm?: number | null
          total_units: number
          updated_at?: string
        }
        Update: {
          amenities?: string[]
          bed_info?: string
          blocked_units?: number
          created_at?: string
          description?: string
          hotel_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_guests?: number
          name?: string
          price_per_night?: number
          size_sqm?: number | null
          total_units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_hotels: {
        Row: {
          created_at: string
          hotel_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hotel_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          hotel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_hotels_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_hotels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_dashboard_stats: {
        Args: { [_ in never]: never }
        Returns: Json
      }
      admin_save_hotel: {
        Args: { p_hotel: Json }
        Returns: string
      }
      admin_set_booking_status: {
        Args: {
          p_reference: string
          p_status: Database["public"]["Enums"]["booking_status"]
        }
        Returns: Json
      }
      admin_set_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      cancel_booking: {
        Args: { p_reference: string }
        Returns: Json
      }
      create_booking: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_guest_count: number
          p_guests: Json
          p_idempotency_key: string
          p_room_count: number
          p_room_id: string
          p_special_requests: string
        }
        Returns: Json
      }
      get_room_availability: {
        Args: { p_check_in: string; p_check_out: string; p_hotel_id: string }
        Returns: {
          room_id: string
          units_free: number
        }[]
      }
      search_hotels: {
        Args: {
          p_amenities?: string[]
          p_available_only?: boolean
          p_destination?: string
          p_guests?: number
          p_max_price?: number
          p_min_price?: number
          p_min_rating?: number
          p_page?: number
          p_page_size?: number
          p_query?: string
          p_rooms?: number
          p_sort?: string
          p_stars?: number[]
          p_types?: Database["public"]["Enums"]["accommodation_type"][]
        }
        Returns: {
          accommodation_type: Database["public"]["Enums"]["accommodation_type"]
          amenities: Json
          city: string
          cover_image: Json
          destination: Json
          has_availability: boolean
          id: string
          is_featured: boolean
          name: string
          offer_discount_percent: number
          offer_label: string
          page: number
          popularity: number
          price_from: number
          review_count: number
          review_score: number
          short_description: string
          slug: string
          star_rating: number
          total_count: number
        }[]
      }
    }
    Enums: {
      accommodation_type:
        | "hotel"
        | "resort"
        | "villa"
        | "boutique"
        | "apartment"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      contact_subject: "booking" | "account" | "partnership" | "other"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      accommodation_type: ["hotel", "resort", "villa", "boutique", "apartment"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      contact_subject: ["booking", "account", "partnership", "other"],
      user_role: ["user", "admin"],
    },
  },
} as const
