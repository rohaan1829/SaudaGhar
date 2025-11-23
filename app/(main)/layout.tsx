'use client'

import { useAuth } from '@/app/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/app/components/ui/Button'
import { createClient } from '@/app/lib/supabase/client'
import { PageSkeleton } from '@/app/components/ui/PageSkeleton'
import { useLanguage } from '@/app/hooks/useLanguage'
import { motion } from 'framer-motion'

// Use singleton client
const supabase = createClient()

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSearchClick = () => {
    router.push('/search')
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageSkeleton />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
          <div className="flex justify-between items-center w-full">
            <Link href="/" className="flex items-center h-full">
              <Image 
                src="/logo.png" 
                alt="SaudaGhar Logo" 
                width={255} 
                height={82}
                className="h-[66px] w-auto object-contain"
              />
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 ml-8">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/search"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname?.startsWith('/search')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {t('nav.listings')}
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {/* Search Icon Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSearchClick}
                className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </motion.button>

              <Link href="/dashboard">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}

