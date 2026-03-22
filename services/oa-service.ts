import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function startOAAttempt(userId: string, templateId: string) {
    const supabase = await createClient();

    // 1. Fetch Template
    const { data: template, error: tError } = await supabaseAdmin
        .from('oa_templates')
        .select('*')
        .eq('id', templateId)
        .single();

    if (tError || !template) throw new Error('OA Template not found');

    // 2. Create Attempt
    const { data: attempt, error: aError } = await supabase
        .from('oa_attempts')
        .insert({
            user_id: userId,
            template_id: templateId,
            start_time: new Date().toISOString()
        })
        .select()
        .single();

    if (aError) throw aError;

    // 3. Fetch Questions (Aptitude + Coding)
    const { data: aptitudeQuestions } = await supabaseAdmin
        .from('aptitude_questions')
        .select('*')
        .in('id', template.question_ids);

    const { data: codingQuestions } = await supabaseAdmin
        .from('coding_questions')
        .select('*')
        .in('id', template.coding_question_ids);

    return { attempt, template, aptitudeQuestions, codingQuestions };
}

export async function recordTabSwitch(attemptId: string) {
    const supabase = await createClient();
    await supabase.rpc('increment_oa_tab_switches', { att_id: attemptId });
}

export async function submitOAAttempt(attemptId: string, options: {
    isAutoSubmit?: boolean,
    aptitudeAnswers: any[],
    codingSubmissions: any[]
}) {
    const supabase = await createClient();

    // 1. Mark as completed
    const { data: attempt, error } = await supabase
        .from('oa_attempts')
        .update({
            end_time: new Date().toISOString(),
            completed: true,
            is_auto_submitted: options.isAutoSubmit || false
        })
        .eq('id', attemptId)
        .select()
        .single();

    if (error) throw error;

    // 2. Logic for scoring (Simplified)
    // In a real app, we'd run Judge0 for coding questions here or use stored results

    return attempt;
}

export async function getOAAttempt(attemptId: string) {
    const supabase = await createClient();

    // 1. Fetch Attempt
    const { data: attempt, error: aError } = await supabase
        .from('oa_attempts')
        .select('*, oa_templates(*)')
        .eq('id', attemptId)
        .single();

    if (aError || !attempt) throw new Error('OA Attempt not found');

    const template = attempt.oa_templates;

    // 2. Fetch Questions (Aptitude + Coding)
    const { data: aptitudeQuestions } = await supabaseAdmin
        .from('aptitude_questions')
        .select('*')
        .in('id', template.question_ids);

    const { data: codingQuestions } = await supabaseAdmin
        .from('coding_questions')
        .select('*')
        .in('id', template.coding_question_ids);

    return { attempt, template, aptitudeQuestions, codingQuestions };
}
