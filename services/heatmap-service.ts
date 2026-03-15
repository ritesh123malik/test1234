import { createClient } from '@/lib/supabase/server';

// ── GET ACTIVITY GRID (365 days) ─────────────────────────────
export async function getActivityGrid(userId: string) {
    const supabase = await createClient();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data, error } = await supabase
        .from('v_user_heatmap_grid')
        .select('activity_date, session_count, response_count, avg_score, intensity_level')
        .eq('user_id', userId)
        .gte('activity_date', oneYearAgo.toISOString().split('T')[0])
        .order('activity_date', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
}

// ── GET TOPIC SCORES (radar chart data) ──────────────────────
export async function getTopicScores(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('v_topic_scores')
        .select('topic, avg_score, attempt_count, last_attempt, avg_correctness, avg_depth, avg_clarity, avg_structure, avg_confidence')
        .eq('user_id', userId)
        .order('avg_score', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
}

// ── GET WEAKNESS SUMMARY ──────────────────────────────────────
export async function getWeaknessSummary(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('mv_weakness_summary')
        .select('weak_topics, strong_topics, overall_avg, total_responses, last_refreshed')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);

    // Return empty state if no data yet
    return data ?? {
        weak_topics: [],
        strong_topics: [],
        overall_avg: 0,
        total_responses: 0,
        last_refreshed: null
    };
}

// ── GET SCORE TREND (last 10 sessions) ───────────────────────
export async function getScoreTrend(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('interviewer_sessions')
        .select(`
      id, 
      type, 
      overall_score, 
      created_at,
      interviewer_responses(
        score_correctness, 
        score_depth,
        score_clarity, 
        score_structure, 
        score_confidence
      )
    `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) throw new Error(error.message);

    // Transform: compute avg per session for trend line
    return (data ?? []).map(session => {
        const responses = (session.interviewer_responses as any[]) ?? [];
        const avg = responses.length > 0
            ? responses.reduce((sum, r) => {
                return sum + ((
                    (r.score_correctness || 0) +
                    (r.score_depth || 0) +
                    (r.score_clarity || 0) +
                    (r.score_structure || 0) +
                    (r.score_confidence || 0)
                ) / 5);
            }, 0) / responses.length
            : 0;
        return {
            session_id: session.id,
            type: session.type,
            avg_score: Math.round(avg * 10) / 10,
            date: session.created_at,
        };
    }).reverse(); // oldest first for chart
}

// ── GET DIMENSION BREAKDOWN ───────────────────────────────────
export async function getDimensionBreakdown(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('interviewer_responses')
        .select(`
      score_correctness, score_depth, score_clarity,
      score_structure, score_confidence,
      score_code_correctness, score_time_complexity,
      score_space_complexity, score_readability, score_edge_cases,
      interviewer_sessions!inner(user_id, status)
    `)
        .eq('interviewer_sessions.user_id', userId)
        .eq('interviewer_sessions.status', 'completed');

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return null;

    const avg = (field: string) => {
        const vals = data.map((r: any) => r[field]).filter((v: any) => v !== null && v !== undefined);
        return vals.length > 0
            ? Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 10) / 10
            : null;
    };

    return {
        correctness: avg('score_correctness'),
        depth: avg('score_depth'),
        clarity: avg('score_clarity'),
        structure: avg('score_structure'),
        confidence: avg('score_confidence'),
        code_correctness: avg('score_code_correctness'),
        time_complexity: avg('score_time_complexity'),
        space_complexity: avg('score_space_complexity'),
        readability: avg('score_readability'),
        edge_cases: avg('score_edge_cases'),
    };
}

// ── GET SPEECH SUMMARY ───────────────────────────────────────
export async function getSpeechSummary(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('v_speech_summary')
        .select('session_date, avg_wpm, avg_filler_rate, avg_vocabulary, avg_comm_score, response_count')
        .eq('user_id', userId)
        .order('session_date', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
}
