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
import { motion } from 'framer-motion'

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
      supabase.from('listings').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'active'),
      supabase.from('messages').select('id', { count: 'exact' }).eq('receiver_id', user.id).eq('read', false),
      supabase.from('notifications').select('id', { count: 'exact' }).eq('user_id', user.id).eq('read', false),
    ])

    setStats({
      listings: listingsRes.count || 0,
      messages: messagesRes.count || 0,
      notifications: notificationsRes.count || 0,
    })

    // Fetch recent listings (show all statuses in dashboard)
    const { data: listingsData } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active') // Only show active listings in recent listings
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {profile?.full_name || user?.email}!
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Active Listings', value: stats.listings },
          { label: 'Unread Messages', value: stats.messages },
          { label: 'Notifications', value: stats.notifications },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
          >
            <Card>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.label}</h3>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                className="text-3xl font-bold text-primary-600"
              >
                {stat.value}
              </motion.p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Link href="/listings/create">
          <Button variant="primary" size="lg">
            + Create New Listing
          </Button>
        </Link>
      </motion.div>

      {/* Recent Listings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <h2 className="text-xl font-bold mb-4">Recent Listings</h2>
          {recentListings.length === 0 ? (
            <p className="text-gray-500">No listings yet. Create your first listing!</p>
          ) : (
            <div className="space-y-4">
              {recentListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <Link href={`/listings/${listing.id}`}>
                    <div className="border-b pb-4 last:border-b-0 hover:bg-gray-50 p-2 rounded transition-colors">
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
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Seasonal Alerts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <SeasonalAlerts />
      </motion.div>
    </motion.div>
  )
}

