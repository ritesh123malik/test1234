import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    getActivityGrid,
    getTopicScores,
    getWeaknessSummary,
    getScoreTrend,
    getDimensionBreakdown,
    getSpeechSummary,
    getUnifiedActivityGrid
} from '@/services/heatmap-service';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section') ?? 'all';

    try {
        // Allow fetching individual sections for performance
        if (section === 'grid')
            return NextResponse.json({ grid: await getActivityGrid(user.id) });
        if (section === 'topics')
            return NextResponse.json({ topics: await getTopicScores(user.id) });
        if (section === 'summary')
            return NextResponse.json({ summary: await getWeaknessSummary(user.id) });
        if (section === 'trend')
            return NextResponse.json({ trend: await getScoreTrend(user.id) });
        if (section === 'dimensions')
            return NextResponse.json({ dimensions: await getDimensionBreakdown(user.id) });
        if (section === 'speech')
            return NextResponse.json({ speech: await getSpeechSummary(user.id) });
        if (section === 'unified')
            return NextResponse.json({ unified: await getUnifiedActivityGrid(user.id) });

        // Default: fetch all in parallel
        const [grid, topics, summary, trend, dimensions, speech, unified] = await Promise.all([
            getActivityGrid(user.id),
            getTopicScores(user.id),
            getWeaknessSummary(user.id),
            getScoreTrend(user.id),
            getDimensionBreakdown(user.id),
            getSpeechSummary(user.id),
            getUnifiedActivityGrid(user.id),
        ]);

        return NextResponse.json({ grid, topics, summary, trend, dimensions, speech, unified });
    } catch (err: any) {
        console.error('Heatmap API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
