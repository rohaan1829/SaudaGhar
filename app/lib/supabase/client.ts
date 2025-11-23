import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Singleton pattern - create client once and reuse
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  // Create new client only once
  supabaseClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return supabaseClient
}

