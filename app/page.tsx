'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Card } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { useLanguage } from '@/app/hooks/useLanguage'
import { useAuth } from '@/app/hooks/useAuth'
import { Header } from '@/app/components/layout/Header'
import { ListingCard } from '@/app/components/listings/ListingCard'
import type { Listing } from '@/app/types'
import { MATERIAL_CATEGORIES, getCategoryIcon } from '@/app/lib/utils/categories'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { Loader } from '@/app/components/ui/Loader'

// Memoize supabase client outside component
const supabase = createClient()

export default function HomePage() {
  const { t, language, changeLanguage } = useLanguage()
  const { user } = useAuth()
  const [location, setLocation] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [stats, setStats] = useState({ totalListings: 0, totalViews: 0, activeUsers: 0 })
  const [loading, setLoading] = useState(false)

  // Memoize fetch functions to prevent recreation on every render
  const fetchListings = useCallback(async (searchLocation?: string, searchText?: string) => {
    const loc = searchLocation ?? location
    const queryText = searchText ?? searchQuery

    if (!loc && !queryText) {
      // Fetch recent listings if no filters
      setLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12)
      
      if (!error && data) {
        setListings(data)
      }
      setLoading(false)
      return
    }

    setLoading(true)
    
    // Start with base query
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')

    let data, error

    // Handle different filter combinations
    if (loc && queryText) {
      // Both filters: First filter by location, then search text in memory
      query = query.or(`city.ilike.%${loc}%,location.ilike.%${loc}%`)
      const result = await query.order('created_at', { ascending: false }).limit(200)
      
      if (result.data) {
        const searchLower = queryText.toLowerCase()
        data = result.data.filter(listing => {
          return (
            listing.material_name?.toLowerCase().includes(searchLower) ||
            listing.description?.toLowerCase().includes(searchLower) ||
            listing.category?.toLowerCase().includes(searchLower)
          )
        }).sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 50)
      }
      error = result.error
    } else if (loc) {
      // Only location filter
      query = query.or(`city.ilike.%${loc}%,location.ilike.%${loc}%`)
      const result = await query.order('created_at', { ascending: false }).limit(50)
      data = result.data
      error = result.error
    } else if (queryText) {
      // Only search text filter
      query = query.or(`material_name.ilike.%${queryText}%,description.ilike.%${queryText}%,category.ilike.%${queryText}%`)
      const result = await query.order('created_at', { ascending: false }).limit(50)
      data = result.data
      error = result.error
    } else {
      // No filters - should not reach here but just in case
      const result = await query.order('created_at', { ascending: false }).limit(50)
      data = result.data
      error = result.error
    }

    if (!error && data) {
      setListings(data)
      // Scroll to search results section
      setTimeout(() => {
        const resultsSection = document.getElementById('search-results')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } else if (error) {
      console.error('Search error:', error)
      setListings([])
    }
    setLoading(false)
  }, [location, searchQuery])

  const fetchFeaturedListings = useCallback(async () => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('views_count', { ascending: false })
      .limit(6)
    
    if (data) {
      setFeaturedListings(data)
    }
  }, [])

  const fetchCategoryCounts = useCallback(async () => {
    // Optimized: Only fetch categories, not all listing data
    const { data } = await supabase
      .from('listings')
      .select('category')
      .eq('status', 'active')
    
    if (data) {
      // Fast counting in one pass
      const counts: Record<string, number> = {}
      data.forEach(listing => {
        counts[listing.category] = (counts[listing.category] || 0) + 1
      })
      setCategoryCounts(counts)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    // Optimized: Parallel queries with minimal data fetching
    const [listingsResult, usersResult, viewsResult] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      // Only fetch views_count column for faster query
      supabase.from('listings').select('views_count').eq('status', 'active'),
    ])

    // Fast calculation in memory
    const totalViews = viewsResult.data?.reduce((sum: number, listing: any) => sum + (listing?.views_count || 0), 0) || 0

    setStats({
      totalListings: listingsResult.count || 0,
      totalViews,
      activeUsers: usersResult.count || 0,
    })
  }, [])

  useEffect(() => {
    // Parallelize all fetches for faster loading (initial load only)
    Promise.all([
      fetchListings('', ''), // Load recent listings on initial mount
      fetchFeaturedListings(),
      fetchCategoryCounts(),
      fetchStats()
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run on mount

  const handleSearch = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    fetchListings(location, searchQuery)
  }, [fetchListings, location, searchQuery])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section with Gradient and Search */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              {language === 'en' 
                ? 'Industrial & Agricultural Symbiosis Platform' 
                : 'صنعتی و زرعی ہم آہنگی پلیٹ فارم'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto"
            >
              {language === 'en' 
                ? 'Connect industries and agriculture to reduce waste, promote sustainability, and create a circular economy'
                : 'صنعتوں اور زراعت کو جوڑیں تاکہ فضلہ کم ہو، پائیداری کو فروغ ملے اور ایک سرکلر معیشت بنائی جائے'}
            </motion.p>
          </motion.div>

          {/* Search Form in Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <form onSubmit={handleSearch} className="p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
                  {language === 'en' ? 'Search Listings' : 'فہرستیں تلاش کریں'}
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('home.location')}
                      placeholder={language === 'en' ? 'Enter city or location' : 'شہر یا مقام درج کریں'}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <Input
                      label={t('home.search')}
                      placeholder={language === 'en' ? 'Search by material, category, or description' : 'مواد، قسم، یا تفصیل سے تلاش کریں'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSearch(e)
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button type="submit" isLoading={loading} size="lg" className="min-w-[200px]">
                      {language === 'en' ? 'Search' : 'تلاش کریں'}
                    </Button>
                    {(location || searchQuery) && (
                      <Button 
                        type="button"
                        variant="outline" 
                        size="lg"
                        onClick={() => {
                          setLocation('')
                          setSearchQuery('')
                          fetchListings('', '')
                        }}
                        className="min-w-[150px]"
                      >
                        {language === 'en' ? 'Clear' : 'صاف کریں'}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white border-b border-gray-200 py-8 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: stats.totalListings.toLocaleString(), label: language === 'en' ? 'Active Listings' : 'فعال فہرستیں' },
              { value: stats.totalViews.toLocaleString(), label: language === 'en' ? 'Total Views' : 'کل مناظر' },
              { value: stats.activeUsers.toLocaleString(), label: language === 'en' ? 'Active Users' : 'فعال صارفین' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="text-4xl font-bold text-primary-600 mb-2"
                >
                  {stat.value}+
                </motion.div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-8 text-gray-900"
          >
            {language === 'en' ? 'Browse by Category' : 'زمرہ کے لحاظ سے براؤز کریں'}
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {MATERIAL_CATEGORIES.slice(0, 12).map((category, index) => {
              const IconComponent = getCategoryIcon(category)
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                >
                  <Link
                    href={`/search?category=${encodeURIComponent(category)}`}
                    className="group block"
                  >
                    <Card className="p-4 text-center hover:shadow-lg transition-all hover:border-primary-500 cursor-pointer h-full">
                      <div className="flex justify-center mb-2">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <IconComponent className="w-8 h-8 text-primary-600 group-hover:text-primary-700 transition-colors" />
                        </motion.div>
                      </div>
                      <div className="font-semibold text-sm mb-1">{category}</div>
                      {categoryCounts[category] && (
                        <div className="text-xs text-gray-500">
                          {categoryCounts[category]} {language === 'en' ? 'listings' : 'فہرستیں'}
                        </div>
                      )}
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/search">
              <Button variant="outline" size="lg">
                {language === 'en' ? 'View All Categories' : 'تمام زمرے دیکھیں'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      {featuredListings.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {language === 'en' ? 'Featured Listings' : 'نمایاں فہرستیں'}
              </h2>
              <Link href="/search">
                <Button variant="outline">
                  {language === 'en' ? 'View All' : 'تمام دیکھیں'}
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Listings / Search Results Section */}
      <section id="search-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {location || searchQuery 
              ? (language === 'en' ? 'Search Results' : 'تلاش کے نتائج')
              : (language === 'en' ? 'Recent Listings' : 'حالیہ فہرستیں')}
          </h2>
          {!location && !searchQuery && (
            <Link href="/search">
              <Button variant="outline">
                {language === 'en' ? 'View All' : 'تمام دیکھیں'}
              </Button>
            </Link>
          )}
        </div>
        
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader size="lg" className="mx-auto mb-4" />
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-4 text-gray-500"
            >
              {language === 'en' ? 'Loading listings...' : 'فہرستیں لوڈ ہو رہی ہیں...'}
            </motion.p>
          </motion.div>
        ) : listings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              {language === 'en' ? 'No listings found' : 'کوئی فہرست نہیں ملی'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'en' 
                ? 'Try adjusting your search criteria or browse all listings'
                : 'اپنے تلاش کے معیارات کو ایڈجسٹ کریں یا تمام فہرستیں براؤز کریں'}
            </p>
            <Link href="/search">
              <Button variant="primary">
                {language === 'en' ? 'Browse All Listings' : 'تمام فہرستیں براؤز کریں'}
              </Button>
            </Link>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Call to Action Section */}
      {!user && (
        <section className="bg-primary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'en' ? 'Ready to Get Started?' : 'شروع کرنے کے لیے تیار ہیں؟'}
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Join thousands of businesses and farmers creating a sustainable future'
                : 'ہزاروں کاروباروں اور کسانوں میں شامل ہوں جو پائیدار مستقبل بنا رہے ہیں'}
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="shadow-lg">
                  {language === 'en' ? 'Create Account' : 'اکاؤنٹ بنائیں'}
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                  {language === 'en' ? 'Sign In' : 'سائن ان کریں'}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
