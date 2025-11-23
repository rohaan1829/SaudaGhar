'use client'

import { useState, useEffect } from 'react'

type Language = 'en' | 'ur'

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.listings': 'Listings',
    'nav.messages': 'Messages',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Home
    'home.buy': 'Buy Materials',
    'home.sell': 'Sell Materials',
    'home.exchange': 'Exchange / Bargain Materials',
    'home.location': 'Enter your city or area',
    'home.search': 'Search for materials near you',
    
    // Common
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
  },
  ur: {
    // Navigation
    'nav.home': 'ہوم',
    'nav.dashboard': 'ڈیش بورڈ',
    'nav.listings': 'فہرستیں',
    'nav.messages': 'پیغامات',
    'nav.notifications': 'اطلاعات',
    'nav.profile': 'پروفائل',
    'nav.settings': 'ترتیبات',
    'nav.login': 'لاگ ان',
    'nav.register': 'رجسٹر',
    'nav.logout': 'لاگ آؤٹ',
    
    // Home
    'home.buy': 'مواد خریدیں',
    'home.sell': 'مواد فروخت کریں',
    'home.exchange': 'مواد کا تبادلہ / سودا',
    'home.location': 'اپنا شہر یا علاقہ درج کریں',
    'home.search': 'اپنے قریب مواد تلاش کریں',
    
    // Common
    'common.submit': 'جمع کریں',
    'common.cancel': 'منسوخ',
    'common.save': 'محفوظ کریں',
    'common.delete': 'حذف کریں',
    'common.edit': 'ترمیم',
    'common.loading': 'لوڈ ہو رہا ہے...',
    'common.error': 'ایک خرابی پیش آئی',
  },
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved) setLanguage(saved)
  }, [])

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    // Reload the page to apply language changes across all components
    window.location.reload()
  }

  return { language, t, changeLanguage }
}

