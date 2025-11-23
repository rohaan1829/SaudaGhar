'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/hooks/useAuth'
import type { Listing, Profile, Notification } from '@/app/types'
import { SeasonalAlerts } from '@/app/components/dashboard/SeasonalAlerts'
import { DashboardSkeleton } from '@/app/components/dashboard/DashboardSkeleton'

// Use singleton client
const supabase = createClient()

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    listings: 0,
    messages: 0,
    notifications: 0,
  })
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentListings, setRecentListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }

    // Fetch stats
    const [listingsRes, messagesRes, notificationsRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('messages').select('id', { count: 'exact' }).eq('receiver_id', user.id).eq('read', false),
      supabase.from('notifications').select('id', { count: 'exact' }).eq('user_id', user.id).eq('read', false),
    ])

    setStats({
      listings: listingsRes.count || 0,
      messages: messagesRes.count || 0,
      notifications: notificationsRes.count || 0,
    })

    // Fetch recent listings
    const { data: listingsData } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (listingsData) {
      setRecentListings(listingsData)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, fetchDashboardData])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {profile?.full_name || user?.email}!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Listings</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.listings}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Unread Messages</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.messages}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Notifications</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.notifications}</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Link href="/listings/create">
          <Button variant="primary" size="lg">
            + Create New Listing
          </Button>
        </Link>
      </div>

      {/* Recent Listings */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Recent Listings</h2>
        {recentListings.length === 0 ? (
          <p className="text-gray-500">No listings yet. Create your first listing!</p>
        ) : (
          <div className="space-y-4">
            {recentListings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <div className="border-b pb-4 last:border-b-0 hover:bg-gray-50 p-2 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{listing.material_name}</h3>
                      <p className="text-sm text-gray-600">{listing.category} • {listing.city}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Seasonal Alerts */}
      <div className="mt-8">
        <SeasonalAlerts />
      </div>
    </div>
  )
}

