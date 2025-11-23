'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/hooks/useAuth'
import type { Transaction, Listing } from '@/app/types'
import { formatDistanceToNow } from 'date-fns'
import { MessagesSkeleton } from '@/app/components/dashboard/MessagesSkeleton'

export default function TransactionsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [transactions, setTransactions] = useState<(Transaction & { listing: Listing })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user])

  const fetchTransactions = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('transactions')
      .select('*, listing:listings(*)')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTransactions(data as any)
    }
    setLoading(false)
  }

  if (loading) {
    return <MessagesSkeleton />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>

      {transactions.length === 0 ? (
        <Card>
          <p className="text-gray-500">No transactions yet. Start by contacting sellers or buyers!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <Card key={txn.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {txn.listing?.material_name || 'Unknown Listing'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {txn.buyer_id === user?.id ? 'You bought' : 'You sold'} • Status: {txn.status}
                  </p>
                  {txn.notes && (
                    <p className="text-sm text-gray-500 mb-2">{txn.notes}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(txn.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

