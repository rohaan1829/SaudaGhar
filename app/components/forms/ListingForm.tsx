'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Card } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { MATERIAL_CATEGORIES, MATERIAL_CONDITIONS, LISTING_TYPES } from '@/app/lib/utils/categories'
import { PAKISTAN_CITIES } from '@/app/lib/utils/locations'
import { useAuth } from '@/app/hooks/useAuth'
import type { Listing } from '@/app/types'

export default function ListingForm({ listingId }: { listingId?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingListing, setLoadingListing] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([]) // Store existing image URLs
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

  // Load existing listing data when editing
  useEffect(() => {
    if (listingId && user) {
      loadListing()
    }
  }, [listingId, user])

  const loadListing = async () => {
    if (!listingId || !user) return

    setLoadingListing(true)
    setError('')

    try {
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        console.error('Error loading listing:', fetchError)
        setError('Failed to load listing: ' + fetchError.message)
        setLoadingListing(false)
        return
      }

      if (!data) {
        setError('Listing not found')
        setLoadingListing(false)
        return
      }

      const listing = data as Listing
      
      // Populate form with existing data
      setFormData({
        material_name: listing.material_name || '',
        category: listing.category || '',
        condition: listing.condition || '',
        quantity: listing.quantity || '',
        price: listing.price ? listing.price.toString() : '',
        is_exchange_only: listing.is_exchange_only || false,
        location: listing.location || '',
        city: listing.city || '',
        description: listing.description || '',
        listing_type: listing.listing_type || 'Sell',
        contact_preferences: {
          call: listing.contact_preferences?.call ?? false,
          message: listing.contact_preferences?.message ?? true,
          whatsapp: listing.contact_preferences?.whatsapp ?? false,
        },
      })

      // Set existing images
      if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        const validImages = listing.images.filter(img => img && typeof img === 'string' && img.trim() !== '')
        setExistingImages(validImages)
        setImagePreviews(validImages) // Show existing images as previews
      }

      console.log('Listing loaded successfully:', listing)
    } catch (err: any) {
      console.error('Exception loading listing:', err)
      setError('Failed to load listing: ' + err.message)
    } finally {
      setLoadingListing(false)
    }
  }

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
    console.log('handleImageChange called with files:', files.length)
    console.log('File details:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))
    
    // Limit total images to 5 (existing + new)
    const availableSlots = 5 - existingImages.length
    const limitedFiles = files.slice(0, Math.max(0, availableSlots))
    
    setImages(limitedFiles)
    
    // Combine existing image previews with new file previews
    const newPreviews = limitedFiles.map(file => URL.createObjectURL(file))
    setImagePreviews([...existingImages, ...newPreviews])
    
    console.log('Images state updated - new files:', limitedFiles.length, 'existing:', existingImages.length)
  }

  const uploadImages = async (userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    console.log('uploadImages called with userId:', userId)
    console.log('Current images state:', images)
    console.log('Images array length:', images?.length || 0)
    
    if (!images || images.length === 0) {
      console.warn('No images to upload - images array is empty')
      return uploadedUrls
    }
    
    console.log(`Starting upload of ${images.length} image(s)`)
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      try {
        console.log(`Uploading image ${i + 1}/${images.length}:`, image.name, 'Size:', image.size, 'Type:', image.type)
        
        const fileExt = image.name.split('.').pop()
        const uniqueId = Date.now() + '_' + Math.random().toString(36).substring(7)
        const fileName = `${userId}/${uniqueId}.${fileExt}`
        
        console.log('Uploading to path:', fileName)
        
        const { data, error } = await supabase.storage
          .from('listing-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Upload error for image:', image.name, error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          setError(`Failed to upload ${image.name}: ${error.message}`)
          continue
        }

        if (data) {
          console.log('Upload successful, data:', data)
          const { data: { publicUrl } } = supabase.storage
            .from('listing-images')
            .getPublicUrl(data.path)

          console.log('Generated public URL:', publicUrl)

          if (publicUrl) {
            uploadedUrls.push(publicUrl)
            console.log(`✓ Image ${i + 1} uploaded successfully:`, publicUrl)
          } else {
            console.error('Public URL is empty for uploaded file')
          }
        } else {
          console.error('Upload returned no data')
        }
      } catch (err: any) {
        console.error('Exception uploading image:', image.name, err)
        console.error('Error stack:', err?.stack)
        setError(`Failed to upload ${image.name}: ${err?.message || err}`)
      }
    }

    console.log(`Upload complete. Total URLs: ${uploadedUrls.length}`)
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
      // Debug: Check images state before upload
      console.log('Images state before upload:', images)
      console.log('Images length:', images.length)
      console.log('Image previews:', imagePreviews)
      console.log('Existing images:', existingImages)
      
      // Handle images: upload new ones if any, otherwise keep existing
      let imageUrls: string[] = []
      
      if (images && images.length > 0) {
        // Upload new images
        console.log('Starting image upload, files:', images.length)
        imageUrls = await uploadImages(user.id)
        console.log('Uploaded image URLs:', imageUrls)
        
        if (imageUrls.length === 0 && images.length > 0) {
          setError('Failed to upload images. Please check your storage bucket configuration and ensure the "listing-images" bucket exists and is public.')
          setLoading(false)
          return
        }
        
        // Combine new images with existing ones (if editing)
        if (listingId && existingImages.length > 0) {
          imageUrls = [...existingImages, ...imageUrls]
          console.log('Combined existing and new images:', imageUrls.length)
        }
      } else {
        // No new images uploaded - keep existing ones (if editing) or empty array
        if (listingId && existingImages.length > 0) {
          imageUrls = existingImages
          console.log('No new images, keeping existing:', existingImages.length)
        } else {
          console.log('No images to upload')
        }
      }

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
        images: imageUrls, // Always an array, even if empty
        contact_preferences: formData.contact_preferences,
        listing_type: formData.listing_type,
        status: 'active',
      }
      
      console.log('Listing data to save:', { ...listingData, images: imageUrls })

      if (listingId) {
        // Update existing listing
        const { data: updateData, error: updateError } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', listingId)
          .eq('user_id', user.id)
          .select()

        if (updateError) {
          console.error('Update error:', updateError)
          throw updateError
        }
        console.log('Listing updated:', updateData)
      } else {
        // Create new listing
        const { data: insertData, error: insertError } = await supabase
          .from('listings')
          .insert(listingData)
          .select()

        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
        console.log('Listing created:', insertData)
        console.log('Images saved:', insertData?.[0]?.images)
      }

      router.push('/dashboard/listings')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while fetching listing data
  if (loadingListing) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading listing data...</p>
        </div>
      </Card>
    )
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
              style={{ backgroundColor: '#ffffff', color: '#111827' }}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
              style={{ backgroundColor: '#ffffff', color: '#111827' }}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
              style={{ backgroundColor: '#ffffff', color: '#111827' }}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 placeholder-gray-400"
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 file:bg-primary-600 file:text-white hover:file:bg-primary-700 file:border-0 file:px-4 file:py-2 file:rounded file:cursor-pointer"
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
          />
          {images.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ {images.length} image{images.length > 1 ? 's' : ''} selected
            </p>
          )}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-32 object-cover rounded border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Check if it's an existing image (URL) or new file
                      const preview = imagePreviews[idx]
                      const isExistingImage = typeof preview === 'string' && (preview.startsWith('http') || preview.startsWith('blob:'))
                      
                      if (isExistingImage && preview.startsWith('http')) {
                        // Remove from existing images
                        setExistingImages(prev => prev.filter(url => url !== preview))
                      } else {
                        // Remove from new images (Files)
                        const fileIndex = idx - existingImages.length
                        if (fileIndex >= 0) {
                          const newImages = images.filter((_, i) => i !== fileIndex)
                          setImages(newImages)
                        }
                      }
                      
                      // Remove from previews
                      const newPreviews = imagePreviews.filter((_, i) => i !== idx)
                      setImagePreviews(newPreviews)
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
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

        <div className="flex gap-3">
          {listingId && (
            <Link href="/dashboard/listings" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          )}
          <Button type="submit" variant="primary" className={listingId ? 'flex-1' : 'w-full'} isLoading={loading}>
            {listingId ? 'Update Listing' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

