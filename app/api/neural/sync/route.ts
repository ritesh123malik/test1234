// app/api/neural/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { leetcodeAPI } from '@/lib/leetcode/api';
import { codeforcesAPI } from '@/lib/codeforces/api';
import { githubAPI } from '@/lib/github/api';
import { fetchGFGStats } from '@/lib/sync/platforms/gfg';
import { fetchCodeChefStats } from '@/lib/sync/platforms/codechef';
import { fetchHackerRankStats } from '@/lib/sync/platforms/hackerrank';
import { calculateNeuralPower } from '@/lib/neural/calculator';
import { NeuralStats } from '@/types';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get user handles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('leetcode_handle, codeforces_handle, github_handle, gfg_handle, codechef_handle, hackerrank_handle')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const stats: NeuralStats = { timestamp: new Date().toISOString() };

    // 2. Parallel Fetching
    const [lc, cf, gh, gfg, cc, hr] = await Promise.all([
      profile.leetcode_handle ? leetcodeAPI.fetchStats(profile.leetcode_handle) : null,
      profile.codeforces_handle ? codeforcesAPI.fetchStats(profile.codeforces_handle) : null,
      profile.github_handle ? githubAPI.fetchStats(profile.github_handle) : null,
      (profile as any).gfg_handle ? fetchGFGStats((profile as any).gfg_handle) : null,
      (profile as any).codechef_handle ? fetchCodeChefStats((profile as any).codechef_handle) : null,
      (profile as any).hackerrank_handle ? fetchHackerRankStats((profile as any).hackerrank_handle) : null,
    ]);

    if (lc) stats.leetcode = lc;
    if (cf) stats.codeforces = cf;
    if (gh) stats.github = gh;
    if (gfg) stats.gfg = gfg;
    if (cc) stats.codechef = cc;
    if (hr) stats.hackerrank = hr;

    // 3. Calculate Score
    const powerScore = calculateNeuralPower(stats);

    // 4. Update Database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        neural_cache: stats,
        neural_synced_at: stats.timestamp,
        neural_power_score: powerScore
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // 5. Update Solved Summary (Optional but recommended for consistency)
    if (lc) {
        await supabase.from('user_solved_questions_summary').upsert({
            user_id: user.id,
            platform: 'leetcode',
            total_solved: lc.totalSolved,
            easy_solved: lc.easy,
            medium_solved: lc.medium,
            hard_solved: lc.hard,
            last_synced_at: stats.timestamp
        });
    }

    return NextResponse.json({ 
      success: true, 
      score: powerScore,
      stats 
    });

  } catch (error: any) {
    console.error('Neural Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
