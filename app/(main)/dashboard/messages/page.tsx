'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { createClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/hooks/useAuth'
import type { Message, Listing, Profile } from '@/app/types'
import { formatDistanceToNow } from 'date-fns'
import { TranslationToggle } from '@/app/components/messages/TranslationToggle'
import { MessagesSkeleton } from '@/app/components/dashboard/MessagesSkeleton'
import Link from 'next/link'
import { motion } from 'framer-motion'

type MessageWithDetails = Message & { 
  listing: Listing
  sender: Profile
}

export default function MessagesPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [messages, setMessages] = useState<MessageWithDetails[]>([])
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
      // Fetch sender profiles for each message
      const messagesWithSenders = await Promise.all(
        (data as any[]).map(async (msg) => {
          const { data: senderData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', msg.sender_id)
            .single()
          
          return {
            ...msg,
            sender: senderData || null
          }
        })
      )
      setMessages(messagesWithSenders)
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
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg mb-2">No messages yet.</p>
            <p className="text-gray-400 text-sm">Messages about your listings will appear here.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={`${!msg.read ? 'bg-blue-50 border-blue-200' : ''} hover:shadow-lg transition-shadow`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {msg.listing?.material_name || 'Unknown Listing'}
                      </h3>
                      {!msg.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    
                    {msg.sender && (
                      <p className="text-sm text-gray-600 mb-2">
                        From: <span className="font-medium">{msg.sender.full_name}</span>
                        {msg.sender.business_name && (
                          <span className="text-gray-500"> ({msg.sender.business_name})</span>
                        )}
                      </p>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <TranslationToggle message={msg.message} />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                      {msg.listing && (
                        <Link 
                          href={`/listings/${msg.listing.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Listing →
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {!msg.read && (
                    <Button
                      onClick={() => markAsRead(msg.id)}
                      variant="outline"
                      size="sm"
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

