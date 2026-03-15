import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    getLeaderboard, getUserRank, getFilterOptions,
    searchColleges, searchCities
} from '@/services/leaderboard-service';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') ?? 'list';
    const type = (searchParams.get('type') ?? 'global') as any;
    const college = searchParams.get('college') ?? undefined;
    const city = searchParams.get('city') ?? undefined;
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const query = searchParams.get('q') ?? '';

    try {
        // Public endpoints — no auth required
        if (action === 'list') {
            const data = await getLeaderboard({ type, college, city, limit, offset });
            return NextResponse.json({ data });
        }

        if (action === 'filters') {
            const options = await getFilterOptions();
            return NextResponse.json(options);
        }

        if (action === 'search_colleges') {
            const results = await searchColleges(query);
            return NextResponse.json({ results });
        }

        if (action === 'search_cities') {
            const results = await searchCities(query);
            return NextResponse.json({ results });
        }

        // Auth required endpoints
        if (action === 'my_rank') {
            if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            const rank = await getUserRank(user.id);
            return NextResponse.json({ rank });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (err: any) {
        console.error('Leaderboard API Error:', {
            message: err.message,
            stack: err.stack,
            action,
            type
        });
        return NextResponse.json({
            error: err.message,
            debug: { action, type, phase: 'api_route_catch' }
        }, { status: 500 });
    }
}

// PATCH — update user's college and city in profile
export async function PATCH(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { college, city } = await req.json();

    const { error } = await supabase
        .from('profiles')
        .update({ college, city })
        .eq('id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
