'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { createClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/hooks/useAuth'
import type { Profile } from '@/app/types'
import { BUSINESS_TYPES } from '@/app/lib/utils/categories'
import { ProfileSkeleton } from '@/app/components/dashboard/ProfileSkeleton'

export default function ProfilePage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    business_name: '',
    business_type: '',
    business_address: '',
    phone: '',
    ntn_number: '',
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      setProfile(data)
      setFormData({
        full_name: data.full_name,
        business_name: data.business_name,
        business_type: data.business_type,
        business_address: data.business_address,
        phone: data.phone,
        ntn_number: data.ntn_number || '',
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', user.id)

    if (!error) {
      fetchProfile()
      alert('Profile updated successfully!')
    } else {
      alert('Failed to update profile: ' + error.message)
    }

    setSaving(false)
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <Card>
        {profile && (
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold">{profile.full_name}</h2>
              {profile.verified && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-gray-600">Reputation Score: {profile.reputation_score.toFixed(1)}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />

          <Input
            label="Business Name"
            name="business_name"
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <select
              name="business_type"
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Business Address"
            name="business_address"
            value={formData.business_address}
            onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <Input
            label="NTN Number"
            name="ntn_number"
            value={formData.ntn_number}
            onChange={(e) => setFormData({ ...formData, ntn_number: e.target.value })}
          />

          <Button type="submit" variant="primary" isLoading={saving}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  )
}

