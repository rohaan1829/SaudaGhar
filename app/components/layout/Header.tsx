'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/app/components/ui/Button'
import { useLanguage } from '@/app/hooks/useLanguage'
import { useAuth } from '@/app/hooks/useAuth'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Use singleton client
const supabase = createClient()

export function Header() {
  const { language, changeLanguage } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
        <div className="flex justify-between items-center w-full">
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
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value as 'en' | 'ur')}
              className="px-3 py-1 border rounded"
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
          </div>
        </div>
      </div>
    </header>
  )
}

