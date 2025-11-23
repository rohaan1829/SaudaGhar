export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          cnic_number: string
          business_name: string
          business_type: string
          business_address: string
          phone: string
          email: string
          ntn_number: string | null
          cnic_photo_url: string | null
          business_license_url: string | null
          verified: boolean
          reputation_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          cnic_number: string
          business_name: string
          business_type: string
          business_address: string
          phone: string
          email: string
          ntn_number?: string | null
          cnic_photo_url?: string | null
          business_license_url?: string | null
          verified?: boolean
          reputation_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          cnic_number?: string
          business_name?: string
          business_type?: string
          business_address?: string
          phone?: string
          email?: string
          ntn_number?: string | null
          cnic_photo_url?: string | null
          business_license_url?: string | null
          verified?: boolean
          reputation_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          material_name: string
          category: string
          condition: string
          quantity: string
          price: number | null
          is_exchange_only: boolean
          location: string
          city: string
          description: string
          images: string[]
          contact_preferences: Json
          status: 'active' | 'inactive'
          views_count: number
          listing_type: 'Buy' | 'Sell' | 'Exchange'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          material_name: string
          category: string
          condition: string
          quantity: string
          price?: number | null
          is_exchange_only?: boolean
          location: string
          city: string
          description: string
          images?: string[]
          contact_preferences?: Json
          status?: 'active' | 'inactive'
          views_count?: number
          listing_type: 'Buy' | 'Sell' | 'Exchange'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          material_name?: string
          category?: string
          condition?: string
          quantity?: string
          price?: number | null
          is_exchange_only?: boolean
          location?: string
          city?: string
          description?: string
          images?: string[]
          contact_preferences?: Json
          status?: 'active' | 'inactive'
          views_count?: number
          listing_type?: 'Buy' | 'Sell' | 'Exchange'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          listing_id: string
          sender_id: string
          receiver_id: string
          message: string
          contact_method: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          sender_id: string
          receiver_id: string
          message: string
          contact_method: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          sender_id?: string
          receiver_id?: string
          message?: string
          contact_method?: string
          read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          related_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
          related_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          related_id?: string | null
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          listing_id: string
          rater_id: string
          seller_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          rater_id: string
          seller_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          rater_id?: string
          seller_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          listing_id: string
          buyer_id: string
          seller_id: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          buyer_id: string
          seller_id: string
          status: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          buyer_id?: string
          seller_id?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

