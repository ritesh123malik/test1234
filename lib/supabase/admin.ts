import { createClient } from '@supabase/supabase-js';

// Lazy initialization of admin client to avoid build-time crashes when env vars are missing
let adminInstance: any = null;

export const getSupabaseAdmin = () => {
    if (!adminInstance) {
        // Fallbacks for build-time safety
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

        adminInstance = createClient(
            supabaseUrl,
            supabaseServiceKey,
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

// For backward compatibility while encouraging use of getSupabaseAdmin()
export const supabaseAdmin = new Proxy({} as any, {
    get: (target, prop) => {
        const instance = getSupabaseAdmin();
        const value = (instance as any)[prop];
        return typeof value === 'function' ? value.bind(instance) : value;
    }
});
