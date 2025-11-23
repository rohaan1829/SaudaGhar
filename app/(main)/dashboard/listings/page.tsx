'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/app/components/ui/Button'
import { Card } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/hooks/useAuth'
import { ListingCard } from '@/app/components/listings/ListingCard'
import ListingForm from '@/app/components/forms/ListingForm'
import type { Listing } from '@/app/types'
import { ListingsSkeleton } from '@/app/components/dashboard/ListingsSkeleton'

export default function MyListingsPage() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const { user } = useAuth()
  const supabase = createClient()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchListings()
    }
  }, [user])

  const fetchListings = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active') // Only fetch active listings
      .order('created_at', { ascending: false })

    if (!error && data) {
      // Debug: Log images for each listing
      data.forEach(listing => {
        console.log(`Listing ${listing.id} images:`, listing.images, 'Type:', typeof listing.images, 'Is Array:', Array.isArray(listing.images))
      })
      setListings(data)
    } else if (error) {
      console.error('Error fetching listings:', error)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }

    try {
      // Optimistically remove from UI
      setListings(prevListings => prevListings.filter(listing => listing.id !== id))

      const { error } = await supabase
        .from('listings')
        .update({ status: 'inactive' })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting listing:', error)
        // Revert optimistic update on error
        fetchListings()
        alert('Failed to delete listing: ' + error.message)
      } else {
        console.log('Listing deleted successfully')
        // Optionally show a success message
      }
    } catch (err: any) {
      console.error('Exception deleting listing:', err)
      // Revert optimistic update on error
      fetchListings()
      alert('Failed to delete listing: ' + err.message)
    }
  }

  if (loading) {
    return <ListingsSkeleton />
  }

  // If edit mode, show the form
  if (editId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard/listings">
            <Button variant="outline" size="sm">← Back to Listings</Button>
          </Link>
        </div>
        <ListingForm listingId={editId} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link href="/listings/create">
          <Button variant="primary">+ Create New Listing</Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <Card>
          <p className="text-gray-500 mb-4">You haven't created any listings yet.</p>
          <Link href="/listings/create">
            <Button variant="primary">Create Your First Listing</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="relative">
              <ListingCard listing={listing} />
              <div className="absolute top-2 right-2 flex gap-2">
                <Link href={`/listings/${listing.id}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
                <Link href={`/dashboard/listings?edit=${listing.id}`}>
                  <Button size="sm" variant="primary">Edit</Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(listing.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

