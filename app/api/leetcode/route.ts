import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { username } = await req.json();

        const query = `
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          profile {
            ranking
            reputation
            starRating
          }
          contributions {
            points
            questionCount
            testcaseCount
          }
          submissionCalendar
        }
      }
    `;

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                variables: { username }
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
