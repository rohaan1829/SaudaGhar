'use client'

import { Card } from '@/app/components/ui/Card'
import { ListingCard } from './ListingCard'
import type { Listing } from '@/app/types'

// Mock data for smart matches
const MOCK_MATCHES: Listing[] = [
  {
    id: 'mock-1',
    user_id: 'mock-user',
    material_name: 'Textile Waste - Cotton Scraps',
    category: 'Textile Waste',
    condition: 'Recyclable',
    quantity: '500 kg',
    price: 15000,
    is_exchange_only: false,
    location: 'Industrial Area',
    city: 'Karachi',
    description: 'High quality cotton textile waste suitable for recycling',
    images: [],
    contact_preferences: {},
    status: 'active',
    views_count: 0,
    listing_type: 'Sell',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    user_id: 'mock-user',
    material_name: 'Plastic Bottles - PET',
    category: 'Plastic Waste',
    condition: 'Recyclable',
    quantity: '1000 kg',
    price: 20000,
    is_exchange_only: false,
    location: 'Gulshan',
    city: 'Lahore',
    description: 'Clean PET bottles ready for recycling',
    images: [],
    contact_preferences: {},
    status: 'active',
    views_count: 0,
    listing_type: 'Sell',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    user_id: 'mock-user',
    material_name: 'Metal Scrap - Steel',
    category: 'Metal Scrap',
    condition: 'Used',
    quantity: '2000 kg',
    price: 80000,
    is_exchange_only: false,
    location: 'SITE Area',
    city: 'Karachi',
    description: 'Mixed steel scrap from manufacturing',
    images: [],
    contact_preferences: {},
    status: 'active',
    views_count: 0,
    listing_type: 'Sell',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

interface SmartMatchesProps {
  currentListing?: Listing
}

export function SmartMatches({ currentListing }: SmartMatchesProps) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">Smart Matches (AI-Powered)</h3>
        <p className="text-sm text-gray-500">
          Suggested listings based on your material preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_MATCHES.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </Card>
  )
}

