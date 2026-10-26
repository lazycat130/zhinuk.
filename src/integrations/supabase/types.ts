export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          name_en: string | null
          sku: string | null
          category: string
          subcategory: string | null
          price: number
          regular_price: number | null
          rating: number
          review_count: number
          image_url: string
          gallery_urls: string[]
          description: string
          details: string | null
          specifications: Json
          stock_quantity: number
          low_stock_threshold: number
          variants: Json
          status: "draft" | "published" | "archived"
          is_demo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          name_en?: string | null
          sku?: string | null
          category?: string
          subcategory?: string | null
          price: number
          regular_price?: number | null
          rating?: number
          review_count?: number
          image_url?: string
          gallery_urls?: string[]
          description?: string
          details?: string | null
          specifications?: Json
          stock_quantity?: number
          low_stock_threshold?: number
          variants?: Json
          status?: "draft" | "published" | "archived"
          is_demo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          sku?: string | null
          category?: string
          subcategory?: string | null
          price?: number
          regular_price?: number | null
          rating?: number
          review_count?: number
          image_url?: string
          gallery_urls?: string[]
          description?: string
          details?: string | null
          specifications?: Json
          stock_quantity?: number
          low_stock_threshold?: number
          variants?: Json
          status?: "draft" | "published" | "archived"
          is_demo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          full_name: string
          phone_normalized: string
          email: string | null
          address: string
          district: string
          area: string
          delivery_zone: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone_normalized: string
          email?: string | null
          address?: string
          district?: string
          area?: string
          delivery_zone?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone_normalized?: string
          email?: string | null
          address?: string
          district?: string
          area?: string
          delivery_zone?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          payment_method: "cod" | "bkash" | "nagad"
          payment_status: "unpaid" | "pending" | "paid" | "refunded"
          subtotal: number
          discount: number
          delivery_charge: number
          total: number
          address_snapshot: Json
          customer_note: string | null
          idempotency_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id: string
          status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          payment_method?: "cod" | "bkash" | "nagad"
          payment_status?: "unpaid" | "pending" | "paid" | "refunded"
          subtotal: number
          discount?: number
          delivery_charge: number
          total: number
          address_snapshot?: Json
          customer_note?: string | null
          idempotency_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string
          status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          payment_method?: "cod" | "bkash" | "nagad"
          payment_status?: "unpaid" | "pending" | "paid" | "refunded"
          subtotal?: number
          discount?: number
          delivery_charge?: number
          total?: number
          address_snapshot?: Json
          customer_note?: string | null
          idempotency_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          variant: Json
          quantity: number
          unit_price: number
          line_total: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          variant?: Json
          quantity: number
          unit_price: number
          line_total: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          variant?: Json
          quantity?: number
          unit_price?: number
          line_total?: number
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          customer_name: string
          customer_phone_masked: string | null
          rating: number
          comment: string
          status: "approved" | "pending" | "rejected"
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_name: string
          customer_phone_masked?: string | null
          rating: number
          comment: string
          status?: "approved" | "pending" | "rejected"
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_name?: string
          customer_phone_masked?: string | null
          rating?: number
          comment?: string
          status?: "approved" | "pending" | "rejected"
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_zhinuk_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      place_zhinuk_order: {
        Args: {
          p_name: string
          p_phone: string
          p_email: string | null
          p_address: string
          p_district: string
          p_area: string
          p_delivery_zone: string
          p_payment_method: string
          p_delivery_charge: number
          p_items: Json
          p_idempotency_key: string | null
          p_customer_note?: string | null
        }
        Returns: {
          order_id: string
          order_number: string
          total: number
          subtotal?: number
          delivery_charge?: number
          reused: boolean
        }
      }
      track_zhinuk_order: {
        Args: {
          p_order_query: string
          p_phone_verification?: string | null
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Database;

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
    Enums: {},
  },
} as const
