import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Lazy initialization of admin client to avoid build-time crashes when env vars are missing
let adminInstance: any = null;

export const getSupabaseAdmin = () => {
    if (!adminInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Fallback only during build time to prevent build-time crashes.
        if (!supabaseUrl || !supabaseServiceKey) {
            // Only log an error if not during a build process (e.g., in development or runtime)
            if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV) {
                console.error('MISSING SUPABASE ADMIN ENV VARS: Update your .env.local or Vercel dashboard.');
            }
        }

        adminInstance = createSupabaseClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseServiceKey || 'placeholder',
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
            }
        );
    }
    return adminInstance;
};

// For backward compatibility
export const supabaseAdmin = new Proxy({} as any, {
    get: (target, prop) => {
        const instance = getSupabaseAdmin();
        const value = (instance as any)[prop];
        return typeof value === 'function' ? value.bind(instance) : value;
    }
});
