import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { query, variables } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'GraphQL Query Required' }, { status: 400 });
        }

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: JSON.stringify({
                query,
                variables
            })
        });

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('LeetCode API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch LeetCode data' },
            { status: 500 }
        );
    }
}
