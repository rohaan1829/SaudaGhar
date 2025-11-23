'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/Button'

interface TranslationToggleProps {
  message: string
}

export function TranslationToggle({ message }: TranslationToggleProps) {
  const [isTranslated, setIsTranslated] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Message</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsTranslated(!isTranslated)}
        >
          {isTranslated ? 'Show Original' : 'Translate to Urdu'}
        </Button>
      </div>
      <div className={`p-3 border rounded-lg ${isTranslated ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
        <p className={isTranslated ? 'text-blue-800' : 'text-gray-800'}>
          {message}
        </p>
      </div>
    </div>
  )
}

