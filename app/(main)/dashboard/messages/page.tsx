'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/hooks/useAuth'
import type { Message, Listing } from '@/app/types'
import { formatDistanceToNow } from 'date-fns'
import { TranslationToggle } from '@/app/components/messages/TranslationToggle'
import { MessagesSkeleton } from '@/app/components/dashboard/MessagesSkeleton'

export default function MessagesPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [messages, setMessages] = useState<(Message & { listing: Listing })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMessages()
    }
  }, [user])

  const fetchMessages = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('messages')
      .select('*, listing:listings(*)')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMessages(data as any)
    }
    setLoading(false)
  }

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)

    fetchMessages()
  }

  if (loading) {
    return <MessagesSkeleton />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      {messages.length === 0 ? (
        <Card>
          <p className="text-gray-500">No messages yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`cursor-pointer ${!msg.read ? 'bg-blue-50' : ''}`}
              onClick={() => markAsRead(msg.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {msg.listing?.material_name || 'Unknown Listing'}
                  </h3>
                  <TranslationToggle message={msg.message} />
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!msg.read && (
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

