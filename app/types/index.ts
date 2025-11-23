import { z } from 'zod'

export type User = {
  id: string
  email: string
  created_at: string
}

export type Profile = {
  id: string
  user_id: string
  full_name: string
  cnic_number: string
  business_name: string
  business_type: string
  business_address: string
  phone: string
  email: string
  ntn_number?: string
  cnic_photo_url?: string
  business_license_url?: string
  verified: boolean
  reputation_score: number
  created_at: string
  updated_at: string
}

export type Listing = {
  id: string
  user_id: string
  material_name: string
  category: string
  condition: string
  quantity: string
  price?: number
  is_exchange_only: boolean
  location: string
  city: string
  description: string
  images: string[]
  contact_preferences: {
    call?: boolean
    message?: boolean
    whatsapp?: boolean
  }
  status: 'active' | 'inactive'
  views_count: number
  listing_type: 'Buy' | 'Sell' | 'Exchange'
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  listing_id: string
  sender_id: string
  receiver_id: string
  message: string
  contact_method: string
  read: boolean
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  related_id?: string
  created_at: string
}

export type Rating = {
  id: string
  listing_id: string
  rater_id: string
  seller_id: string
  rating: number
  comment?: string
  created_at: string
}

export type Transaction = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  status: string
  notes?: string
  created_at: string
}

