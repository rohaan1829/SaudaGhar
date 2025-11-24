'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Card } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { BUSINESS_TYPES } from '@/app/lib/utils/categories'

export default function RegistrationForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    cnic_number: '',
    business_name: '',
    business_type: '',
    business_address: '',
    phone: '',
    ntn_number: '',
  })
  const [cnicFile, setCnicFile] = useState<File | null>(null)
  const [licenseFile, setLicenseFile] = useState<File | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // Check if email confirmation is required
      const requiresEmailConfirmation = !authData.session

      // 2. Upload CNIC photo
      let cnicPhotoUrl: string | null = null
      if (cnicFile) {
        cnicPhotoUrl = await uploadFile(
          cnicFile,
          'documents',
          `${authData.user.id}/cnic_${Date.now()}.${cnicFile.name.split('.').pop()}`
        )
      }

      // 3. Upload business license (optional)
      let licenseUrl: string | null = null
      if (licenseFile) {
        licenseUrl = await uploadFile(
          licenseFile,
          'documents',
          `${authData.user.id}/license_${Date.now()}.${licenseFile.name.split('.').pop()}`
        )
      }

      // 4. Try to create profile
      // If email confirmation is required, this might fail due to RLS - that's okay
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: formData.full_name,
            cnic_number: formData.cnic_number,
            business_name: formData.business_name,
            business_type: formData.business_type,
            business_address: formData.business_address,
            phone: formData.phone,
            email: formData.email,
            ntn_number: formData.ntn_number || null,
            cnic_photo_url: cnicPhotoUrl,
            business_license_url: licenseUrl,
          })

        if (profileError) {
          // If profile already exists (from trigger), try to update it
          if (profileError.code === '23505' || profileError.message.includes('duplicate') || profileError.message.includes('unique')) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                full_name: formData.full_name,
                cnic_number: formData.cnic_number,
                business_name: formData.business_name,
                business_type: formData.business_type,
                business_address: formData.business_address,
                phone: formData.phone,
                email: formData.email,
                ntn_number: formData.ntn_number || null,
                cnic_photo_url: cnicPhotoUrl,
                business_license_url: licenseUrl,
              })
              .eq('id', authData.user.id)

            if (updateError) {
              // If update also fails and email confirmation is required, that's okay
              if (requiresEmailConfirmation && (updateError.message.includes('row-level security') || updateError.message.includes('RLS'))) {
                // Profile will be created after email confirmation
              } else {
                console.error('Profile update error:', updateError)
                throw updateError
              }
            }
          } else if (requiresEmailConfirmation && (profileError.message.includes('row-level security') || profileError.message.includes('RLS'))) {
            // RLS error during signup with email confirmation - this is expected
            // Profile will be created after email confirmation via trigger or on first login
            console.log('Profile creation skipped due to email confirmation requirement')
          } else {
            console.error('Profile creation error:', profileError)
            throw profileError
          }
        }
      } catch (profileErr: any) {
        // If it's an RLS error and email confirmation is required, that's expected
        if (requiresEmailConfirmation && (profileErr.message?.includes('row-level security') || profileErr.message?.includes('RLS'))) {
          // This is expected - profile will be created after email confirmation
          console.log('Profile creation will happen after email confirmation')
        } else {
          throw profileErr
        }
      }

      // 5. Handle success - show confirmation message or redirect
      if (requiresEmailConfirmation) {
        // Email confirmation required - show success message
        setSuccess(true)
        setError('')
        setLoading(false)
      } else {
        // User is immediately logged in - redirect to dashboard
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold text-center mb-6">Register Your Business</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          
          <Input
            label="Password *"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
          />
        </div>

        <Input
          label="Full Name *"
          name="full_name"
          value={formData.full_name}
          onChange={handleInputChange}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CNIC Number *"
            name="cnic_number"
            value={formData.cnic_number}
            onChange={handleInputChange}
            required
            placeholder="12345-1234567-1"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload CNIC Photo *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCnicFile(e.target.files?.[0] || null)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <Input
          label="Business Name *"
          name="business_name"
          value={formData.business_name}
          onChange={handleInputChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Type *
          </label>
          <select
            name="business_type"
            value={formData.business_type}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
          >
            <option value="">Select Business Type</option>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Business Address *"
          name="business_address"
          value={formData.business_address}
          onChange={handleInputChange}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone Number *"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            required
            placeholder="+92 300 1234567"
          />

          <Input
            label="NTN Number (Optional)"
            name="ntn_number"
            value={formData.ntn_number}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Business License (Optional)
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p className="font-semibold mb-1">✓ Registration Successful!</p>
            <p className="text-sm">
              A verification link has been sent to <strong>{formData.email}</strong>
            </p>
            <p className="text-sm mt-2">
              Please check your email and click the verification link to activate your account.
            </p>
            <p className="text-sm mt-2">
              After verifying your email, you can <Link href="/login" className="underline font-semibold">login here</Link>.
            </p>
          </div>
        )}

        {error && !success && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full" 
          isLoading={loading}
          disabled={success}
        >
          {success ? 'Check Your Email' : 'Register'}
        </Button>
      </form>
    </Card>
  )
}

