'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/Button'
import { Card } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/hooks/useAuth'
import type { Listing, Profile } from '@/app/types'
import { formatDistanceToNow } from 'date-fns'
import { MaterialExpiryAlert } from '@/app/components/listings/MaterialExpiryAlert'
import { SmartMatches } from '@/app/components/listings/SmartMatches'
import { RatingSystem } from '@/app/components/listings/RatingSystem'

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const [listing, setListing] = useState<Listing | null>(null)
  const [seller, setSeller] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [params.id])

  const fetchListing = async () => {
    // Parallel fetch: get listing and seller profile simultaneously
    const [listingResult, profileResult] = await Promise.all([
      supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .single(),
      // We'll fetch profile after we get the listing's user_id
      Promise.resolve({ data: null, error: null })
    ])

    if (listingResult.error || !listingResult.data) {
      console.error('Error fetching listing:', listingResult.error)
      setLoading(false)
      return
    }

    setListing(listingResult.data)

    // Parallel: update view count (fire and forget) + fetch seller profile
    const [, profileDataResult] = await Promise.all([
      supabase
        .from('listings')
        .update({ views_count: (listingResult.data.views_count || 0) + 1 })
        .eq('id', params.id),
      supabase
        .from('profiles')
        .select('*')
        .eq('id', listingResult.data.user_id)
        .single()
    ])

    if (profileDataResult.data) {
      setSeller(profileDataResult.data)
    }

    setLoading(false)
  }

  const handleSendMessage = async () => {
    if (!user || !listing || !message.trim()) return

    setSending(true)

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          listing_id: listing.id,
          sender_id: user.id,
          receiver_id: listing.user_id,
          message: message.trim(),
          contact_method: 'message',
        })

      if (error) throw error

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: listing.user_id,
          type: 'new_message',
          title: 'New Message',
          message: `You received a message about "${listing.material_name}"`,
          related_id: listing.id,
        })

      setMessage('')
      alert('Message sent successfully!')
    } catch (err: any) {
      alert('Failed to send message: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Listing not found</p>
      </div>
    )
  }

  const isOwner = user?.id === listing.user_id

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {listing.images && Array.isArray(listing.images) && listing.images.length > 0 && listing.images.filter(img => img).length > 0 && (
            <Card>
              <div className="grid grid-cols-2 gap-4">
                {listing.images.filter(img => img).map((img, idx) => (
                  <div key={idx} className="relative h-64 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={img}
                      alt={`${listing.material_name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', img)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Details */}
          <Card>
            <MaterialExpiryAlert listing={listing} />
            <h1 className="text-3xl font-bold mb-4">{listing.material_name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                {listing.listing_type}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {listing.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {listing.condition}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="font-semibold">{listing.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">{listing.city}, {listing.location}</p>
              </div>
            </div>

            {listing.price && !listing.is_exchange_only && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-2xl font-bold text-primary-600">
                  PKR {listing.price.toLocaleString()}
                </p>
              </div>
            )}

            {listing.is_exchange_only && (
              <div className="mb-4">
                <p className="text-lg font-semibold text-primary-600">Exchange Only</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-800 whitespace-pre-wrap">{listing.description}</p>
            </div>

            <div className="text-sm text-gray-500">
              Posted {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          {!isOwner && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">Contact Seller</h3>
              
              {seller && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Business</p>
                  <p className="font-semibold">{seller.business_name}</p>
                  {seller.verified && (
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      ✓ Verified
                    </span>
                  )}
                </div>
              )}

              {listing.contact_preferences?.call && seller && (
                <div className="mb-4">
                  <a
                    href={`tel:${seller.phone}`}
                    className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    📞 Call {seller.phone}
                  </a>
                </div>
              )}

              {listing.contact_preferences?.message && (
                <div className="mb-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 placeholder-gray-400"
                    style={{ backgroundColor: '#ffffff', color: '#111827' }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    variant="primary"
                    className="w-full mt-2"
                    isLoading={sending}
                    disabled={!message.trim()}
                  >
                    Send Message
                  </Button>
                </div>
              )}

              {listing.contact_preferences?.whatsapp && seller && (
                <a
                  href={`https://wa.me/${seller.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  💬 WhatsApp
                </a>
              )}
            </Card>
          )}

          {isOwner && (
            <Card>
              <Button
                onClick={() => router.push(`/dashboard/listings?edit=${listing.id}`)}
                variant="primary"
                className="w-full mb-2"
              >
                Edit Listing
              </Button>
              <Button
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this listing?')) {
                    await supabase
                      .from('listings')
                      .update({ status: 'inactive' })
                      .eq('id', listing.id)
                    router.push('/dashboard/listings')
                  }
                }}
                variant="danger"
                className="w-full"
              >
                Delete Listing
              </Button>
            </Card>
          )}

          {/* Rating System */}
          {!isOwner && <RatingSystem listing={listing} />}
        </div>
      </div>

      {/* Smart Matches - Full Width */}
      <div className="mt-8">
        <SmartMatches currentListing={listing} />
      </div>
    </div>
  )
}

