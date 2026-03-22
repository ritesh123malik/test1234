import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback only during build time to prevent build-time crashes.
    if (!supabaseUrl || !supabaseAnonKey) {
        if (typeof window !== 'undefined') {
            console.error('MISSING SUPABASE ENV VARS: Update your .env.local or Vercel dashboard.')
        }
        return createBrowserClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseAnonKey || 'placeholder'
        )
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Singleton for easy import in client components
export const supabase = createClient()
