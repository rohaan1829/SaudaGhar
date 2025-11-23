'use client'

import { useState } from 'react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { createClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/hooks/useAuth'
import type { Listing } from '@/app/types'

interface RatingSystemProps {
  listing: Listing
  onRated?: () => void
}

export function RatingSystem({ listing, onRated }: RatingSystemProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || rating === 0) return

    setSubmitting(true)

    try {
      // Create rating
      const { error: ratingError } = await supabase
        .from('ratings')
        .insert({
          listing_id: listing.id,
          rater_id: user.id,
          seller_id: listing.user_id,
          rating,
          comment: comment.trim() || null,
        })

      if (ratingError) throw ratingError

      // Update seller's reputation score
      const { data: ratings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('seller_id', listing.user_id)

      if (ratings) {
        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        await supabase
          .from('profiles')
          .update({ reputation_score: avgRating })
          .eq('id', listing.user_id)
      }

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.user_id,
          status: 'completed',
          notes: comment.trim() || null,
        })

      alert('Rating submitted successfully!')
      setRating(0)
      setComment('')
      if (onRated) onRated()
    } catch (err: any) {
      alert('Failed to submit rating: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user || user.id === listing.user_id) {
    return null // Don't show rating to owner
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Rate This Seller</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 placeholder-gray-400"
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
            placeholder="Share your experience..."
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={rating === 0}
          isLoading={submitting}
        >
          Submit Rating
        </Button>
      </form>
    </Card>
  )
}

