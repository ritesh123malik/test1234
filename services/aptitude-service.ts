import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function startAptitudeSession(userId: string, options: {
    mode: 'practice' | 'timed_mock' | 'company_mock',
    category: string,
    difficulty: string,
    count: number,
    company_filter?: string
}) {
    const supabase = await createClient();

    // 1. Fetch random questions based on filters
    let query = supabaseAdmin
        .from('aptitude_questions')
        .select('*');

    if (options.category !== 'mixed' && options.category !== 'All') {
        query = query.eq('category', options.category.toLowerCase());
    }

    if (options.difficulty !== 'mixed' && options.difficulty !== 'All') {
        query = query.eq('difficulty', options.difficulty.toLowerCase());
    }

    if (options.company_filter) {
        query = query.contains('company_tags', [options.company_filter]);
    }

    // Simple random sample (Postgres limit)
    const { data: questions, error: qError } = await query.limit(options.count);

    if (qError || !questions || questions.length === 0) {
        throw new Error('No questions found matching your criteria.');
    }

    // 2. Create session
    const { data: session, error: sError } = await supabase
        .from('aptitude_sessions')
        .insert({
            user_id: userId,
            mode: options.mode,
            category: options.category,
            company_filter: options.company_filter,
            total_questions: questions.length,
            time_limit_seconds: options.mode === 'practice' ? null : questions.length * 60 // 1 min per question for mocks
        })
        .select()
        .single();

    if (sError) throw sError;

    return { session, questions };
}

export async function submitAptitudeAnswer(sessionId: string, questionId: string, selectedOption: string, timeSpent: number) {
    const supabase = await createClient();

    // 1. Check correctness
    const { data: question } = await supabaseAdmin
        .from('aptitude_questions')
        .select('correct_option, explanation')
        .eq('id', questionId)
        .single();

    if (!question) throw new Error('Question not found');

    const isCorrect = question.correct_option === selectedOption;

    // 2. Save answer
    await supabase.from('aptitude_answers').insert({
        session_id: sessionId,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        time_spent_seconds: timeSpent
    });

    // 3. Update session counters (if correct)
    if (isCorrect) {
        await supabase.rpc('increment_aptitude_score', { sess_id: sessionId });
    }

    return { isCorrect, explanation: question.explanation };
}

export async function completeAptitudeSession(sessionId: string, timeTaken: number) {
    const supabase = await createClient();

    // 1. Fetch final stats
    const { data: session } = await supabase
        .from('aptitude_sessions')
        .select('correct_answers, total_questions')
        .eq('id', sessionId)
        .single();

    if (!session) throw new Error('Session not found');

    const scorePercent = (session.correct_answers / session.total_questions) * 100;

    // 2. Complete session
    const { data: updatedSession, error } = await supabase
        .from('aptitude_sessions')
        .update({
            completed: true,
            time_taken_seconds: timeTaken,
            score_percent: scorePercent
        })
        .eq('id', sessionId)
        .select()
        .single();

    if (error) throw error;

    // 3. Award XP if score is decent (Min 60%)
    if (scorePercent >= 60) {
        // Award 10 XP via existing RPC if available, or direct update
        // await supabase.rpc('award_xp', { user_id: updatedSession.user_id, amount: 10 });
    }

    return updatedSession;
}
