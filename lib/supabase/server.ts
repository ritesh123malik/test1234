import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback only during build time to prevent build-time crashes.
    if (!supabaseUrl || !supabaseAnonKey) {
        // Only log an error if not during a build process
        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV) {
            console.error('MISSING SUPABASE ENV VARS: Update your .env.local or Vercel dashboard.');
        }
        
        return createServerClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseAnonKey || 'placeholder',
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch { }
                    },
                },
            }
        )
    }

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch { }
                },
            },
        }
    )
}
