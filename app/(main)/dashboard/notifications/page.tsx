'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/hooks/useAuth'
import type { Notification } from '@/app/types'
import { formatDistanceToNow } from 'date-fns'
import { MessagesSkeleton } from '@/app/components/dashboard/MessagesSkeleton'

export default function NotificationsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setNotifications(data)
    }
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    fetchNotifications()
  }

  if (loading) {
    return <MessagesSkeleton />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <Card>
          <p className="text-gray-500">No notifications yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{notif.title}</h3>
                  <p className="text-gray-700 mb-2">{notif.message}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notif.read && (
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

