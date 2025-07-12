import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/public'

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = env.PUBLIC_SUPABASE_URL
    const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      throw new Error('PUBLIC_SUPABASE_URL is required')
    }

    if (!supabaseAnonKey) {
      throw new Error('PUBLIC_SUPABASE_ANON_KEY is required')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// Create a proxy object that delays initialization until first access
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabase()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  }
})