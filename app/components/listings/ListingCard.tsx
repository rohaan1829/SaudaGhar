import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import type { Listing } from '@/app/types'
import { formatDistanceToNow } from 'date-fns'
import { getCategoryIcon } from '@/app/lib/utils/categories'
import { memo, useMemo } from 'react'

interface ListingCardProps {
  listing: Listing
}

// Memoize helper functions outside component (pure functions)
const getListingTypeColor = (type: string) => {
  switch (type) {
    case 'Buy':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'Sell':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'Exchange':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getConditionBadge = (condition: string) => {
  const colors: Record<string, string> = {
    'New': 'bg-emerald-100 text-emerald-700',
    'Used': 'bg-yellow-100 text-yellow-700',
    'Leftover': 'bg-orange-100 text-orange-700',
    'Waste': 'bg-red-100 text-red-700',
    'Recyclable': 'bg-cyan-100 text-cyan-700',
  }
  return colors[condition] || 'bg-gray-100 text-gray-700'
}

export const ListingCard = memo(function ListingCard({ listing }: ListingCardProps) {
  // Memoize computed values to prevent recalculation on every render
  const listingTypeColor = useMemo(() => getListingTypeColor(listing.listing_type), [listing.listing_type])
  const conditionColor = useMemo(() => getConditionBadge(listing.condition), [listing.condition])
  const formattedPrice = useMemo(() => {
    if (listing.is_exchange_only) return '🔄 Exchange Only'
    if (listing.price) return `PKR ${listing.price.toLocaleString()}`
    return 'Contact for Price'
  }, [listing.is_exchange_only, listing.price])
  const timeAgo = useMemo(() => formatDistanceToNow(new Date(listing.created_at), { addSuffix: true }), [listing.created_at])
  const CategoryIcon = useMemo(() => getCategoryIcon(listing.category), [listing.category])

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col group border-2 hover:border-primary-300">
        {/* Image Section */}
        {listing.images && listing.images.length > 0 ? (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden relative">
            <img
              src={listing.images[0]}
              alt={listing.material_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {listing.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                +{listing.images.length - 1}
              </div>
            )}
            <div className="absolute top-2 left-2">
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${listingTypeColor}`}>
                {listing.listing_type}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center relative">
            <div className="text-6xl opacity-30">📦</div>
            <div className="absolute top-2 left-2">
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${listingTypeColor}`}>
                {listing.listing_type}
              </span>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          <h4 className="text-lg font-bold mb-2 text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {listing.material_name}
          </h4>
          
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
              <CategoryIcon className="w-3 h-3" />
              {listing.category}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded ${conditionColor}`}>
              {listing.condition}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
            {listing.description}
          </p>

          {/* Quantity and Location */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <span>📊</span>
              <span>{listing.quantity}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>📍</span>
              <span>{listing.city}</span>
            </span>
          </div>

          {/* Price Section */}
          <div className="border-t pt-3 mt-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold text-primary-600">
                {formattedPrice}
              </span>
              {listing.views_count > 0 && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span>👁️</span>
                  <span>{listing.views_count}</span>
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {timeAgo}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
})
