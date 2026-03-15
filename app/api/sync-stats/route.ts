import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncPlatformStats } from '@/services/stats-aggregator-service';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { platform, username } = await req.json();
    if (!platform || !username)
        return NextResponse.json({ error: 'platform and username required' }, { status: 400 });

    try {
        const stats = await syncPlatformStats(user.id, platform, username);
        return NextResponse.json({ success: true, stats });
    } catch (err: any) {
        console.error('Sync error:', err);
        return NextResponse.json({ error: err.message }, { status: err.message.includes('Sync cooldown') ? 429 : 500 });
    }
}
