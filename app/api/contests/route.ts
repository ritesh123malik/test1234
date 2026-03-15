import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Revalidate every hour
export const revalidate = 3600;

export async function GET() {
    const supabase = await createClient();

    if (!process.env.CLIST_USERNAME || !process.env.CLIST_API_KEY) {
        // Fallback if env vars missing
        const { data } = await supabase
            .from('contest_events')
            .select('*')
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(30);
        return NextResponse.json({ contests: data ?? [], source: 'cache_no_env' });
    }

    try {
        const baseUrl = process.env.CLIST_API_URL || 'https://clist.by/api/v4';
        // Resources: 1=Codeforces, 102=LeetCode, 2=CodeChef, 63=HackerRank, 73=HackerEarth, 126=GeeksForGeeks
        const resourceIds = '1,102,2,63,73,126';
        const url = `${baseUrl}/contest/?upcoming=true&resource_id=${resourceIds}&limit=100&order_by=start`;

        console.log(`[ContestSync] Fetching: ${url}`);
        const res = await fetch(url, {
            headers: {
                'Authorization': `ApiKey ${process.env.CLIST_USERNAME}:${process.env.CLIST_API_KEY}`
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Clist.by fetch failed with status ${res.status}:`, errorText);
            throw new Error(`Clist.by fetch failed: ${res.status}`);
        }

        const json = await res.json();
        console.log(`[ContestSync] Received ${json.objects?.length || 0} objects from Clist`);

        const contests = (json.objects || []).map((c: any) => {
            let platform = 'unknown';
            if (typeof c.resource === 'string') {
                platform = c.resource.split('.')[0];
            } else if (c.resource?.name) {
                platform = c.resource.name.split('.')[0];
            } else if (c.host) {
                platform = c.host.split('.')[0];
            }

            return {
                title: c.event,
                platform: platform.toLowerCase(),
                start_time: c.start,
                end_time: c.end,
                duration_seconds: c.duration,
                url: c.href,
                external_id: String(c.id),
            };
        });


        // Upsert to Supabase
        if (contests.length > 0) {
            const { error } = await supabase.from('contest_events')
                .upsert(contests, { onConflict: 'external_id' });
            if (error) console.error('Supabase upsert error:', error);
        }

        return NextResponse.json({ contests, source: 'live' });
    } catch (err: any) {
        console.error('Contest sync error details:', {
            message: err.message,
            stack: err.stack,
            username: process.env.CLIST_USERNAME
        });
        const { data } = await supabase
            .from('contest_events')
            .select('*')
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(30);
        return NextResponse.json({
            contests: data ?? [],
            source: 'fallback',
            error: err.message,
            username: process.env.CLIST_USERNAME
        });
    }
}
