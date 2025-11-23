'use client'

import { differenceInDays } from 'date-fns'
import type { Listing } from '@/app/types'

interface MaterialExpiryAlertProps {
  listing: Listing
}

export function MaterialExpiryAlert({ listing }: MaterialExpiryAlertProps) {
  const daysSinceCreation = differenceInDays(new Date(), new Date(listing.created_at))
  const isOld = daysSinceCreation > 30

  if (!isOld) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-yellow-600">⚠️</span>
        <div>
          <p className="text-sm font-medium text-yellow-800">
            Listing is {daysSinceCreation} days old
          </p>
          <p className="text-xs text-yellow-700">
            Consider updating your listing to keep it active and visible to buyers.
          </p>
        </div>
      </div>
    </div>
  )
}

