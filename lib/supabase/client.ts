import { createBrowserClient } from '@supabase/ssr'

// Use placeholders during build time to prevent "supabaseUrl is required" errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export function createClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Singleton for easy import in client components
export const supabase = createClient()

