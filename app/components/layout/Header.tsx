'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/app/components/ui/Button'
import { useLanguage } from '@/app/hooks/useLanguage'
import { useAuth } from '@/app/hooks/useAuth'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

// Use singleton client
const supabase = createClient()

export function Header() {
  const { language, changeLanguage, t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSearchClick = () => {
    router.push('/search')
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white shadow-sm sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
        <div className="flex justify-between items-center w-full">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center h-full">
              <Image 
                src="/logo.png" 
                alt="SaudaGhar Logo" 
                width={255} 
                height={82}
                className="h-[66px] w-auto object-contain"
                priority
              />
            </Link>
          </motion.div>
          
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
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

            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value as 'en' | 'ur')}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              style={{ backgroundColor: '#ffffff', color: '#111827' }}
            >
              <option value="en">English</option>
              <option value="ur">اردو</option>
            </select>
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}

