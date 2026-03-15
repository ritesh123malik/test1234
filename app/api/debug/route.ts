import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // Check tables
        const { error: tablesError } = await supabase.from('profiles').select('id').limit(1);
        const { error: collegesError } = await supabase.from('colleges').select('id').limit(1);
        const { error: mvError } = await supabase.from('mv_leaderboard_global').select('user_id').limit(1);

        return NextResponse.json({
            status: 'ok',
            auth: {
                loggedIn: !!user,
                user: user?.email,
                error: authError?.message
            },
            database: {
                profiles: !tablesError,
                colleges: !collegesError,
                mv_leaderboard: !mvError,
                errors: {
                    profiles: tablesError?.message,
                    colleges: collegesError?.message,
                    mv: mvError?.message
                }
            }
        });
    } catch (err: any) {
        return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
    }
}
