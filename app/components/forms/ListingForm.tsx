'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Card } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { MATERIAL_CATEGORIES, MATERIAL_CONDITIONS, LISTING_TYPES } from '@/app/lib/utils/categories'
import { PAKISTAN_CITIES } from '@/app/lib/utils/locations'
import { useAuth } from '@/app/hooks/useAuth'

export default function ListingForm({ listingId }: { listingId?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    material_name: '',
    category: '',
    condition: '',
    quantity: '',
    price: '',
    is_exchange_only: false,
    location: '',
    city: '',
    description: '',
    listing_type: 'Sell' as 'Buy' | 'Sell' | 'Exchange',
    contact_preferences: {
      call: false,
      message: true,
      whatsapp: false,
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      if (name.startsWith('contact_')) {
        const prefName = name.replace('contact_', '') as 'call' | 'message' | 'whatsapp'
        setFormData({
          ...formData,
          contact_preferences: {
            ...formData.contact_preferences,
            [prefName]: checked,
          },
        })
      } else {
        setFormData({
          ...formData,
          [name]: checked,
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(files)
    
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const uploadImages = async (userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    for (const image of images) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, image)

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(data.path)

      uploadedUrls.push(publicUrl)
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a listing')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Upload images
      const imageUrls = await uploadImages(user.id)

      const listingData = {
        user_id: user.id,
        material_name: formData.material_name,
        category: formData.category,
        condition: formData.condition,
        quantity: formData.quantity,
        price: formData.price ? parseFloat(formData.price) : null,
        is_exchange_only: formData.is_exchange_only,
        location: formData.location,
        city: formData.city,
        description: formData.description,
        images: imageUrls,
        contact_preferences: formData.contact_preferences,
        listing_type: formData.listing_type,
        status: 'active',
      }

      if (listingId) {
        // Update existing listing
        const { error: updateError } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', listingId)
          .eq('user_id', user.id)

        if (updateError) throw updateError
      } else {
        // Create new listing
        const { error: insertError } = await supabase
          .from('listings')
          .insert(listingData)

        if (insertError) throw insertError
      }

      router.push('/dashboard/listings')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">
        {listingId ? 'Edit Listing' : 'Create New Listing'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Listing Type *
          </label>
          <select
            name="listing_type"
            value={formData.listing_type}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {LISTING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Material Name *"
          name="material_name"
          value={formData.material_name}
          onChange={handleInputChange}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Category</option>
              {MATERIAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition *
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Condition</option>
              {MATERIAL_CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Quantity *"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            required
            placeholder="e.g., 100 kg, 50 pieces"
          />

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_exchange_only"
                checked={formData.is_exchange_only}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Exchange Only (No Price)</span>
            </label>
            {!formData.is_exchange_only && (
              <Input
                label="Price (PKR)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                className="mt-2"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select City</option>
              {PAKISTAN_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Location/Area *"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            placeholder="e.g., Gulshan-e-Iqbal, Karachi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Describe your material in detail..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images (Max 5)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {imagePreviews.map((preview, idx) => (
                <img
                  key={idx}
                  src={preview}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Preferences *
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="contact_message"
                checked={formData.contact_preferences.message}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Allow Messages</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="contact_call"
                checked={formData.contact_preferences.call}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Show Phone Number</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="contact_whatsapp"
                checked={formData.contact_preferences.whatsapp}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Allow WhatsApp</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
          {listingId ? 'Update Listing' : 'Create Listing'}
        </Button>
      </form>
    </Card>
  )
}

