import Groq from 'groq-sdk';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import { analyzeSpeech, SpeechMetrics } from './speech-analyzer';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── OPENING QUESTIONS MAP ────────────────────────────────────
const OPENING_QUESTIONS: Record<string, string> = {
    'DSA': 'Welcome to the DSA interview. Let\'s start with a foundational concept. Can you explain what Big O notation is and why it\'s critical for evaluating algorithms?',
    'Behavioral': 'To start our behavioral round, tell me about a time you faced a significant technical challenge. How did you approach it, and what was the outcome?',
    'System Design': 'For this system design session, let\'s discuss high availability. How would you design a system to ensure 99.99% uptime for a global user base?',
    'HR': 'Welcome! To begin, please tell me a bit about yourself and what motivates you to pursue a career in technology.'
};

export async function generateOpeningQuestion(type: string): Promise<string> {
    return OPENING_QUESTIONS[type] || 'Welcome! Could you please introduce yourself and tell me about your background?';
}

// ── 1. START SESSION ──────────────────────────────────────────
export async function startSession(userId: string, type: string) {
    const firstQuestion = await generateOpeningQuestion(type);

    const { data, error } = await supabase
        .from('interviewer_sessions')
        .insert({ user_id: userId, type, status: 'active' })
        .select('id')
        .single();

    if (error) {
        console.error('Error starting session:', error);
        throw new Error(error.message);
    }

    // Record the first question as a placeholder entry
    await supabase.from('interviewer_responses').insert({
        session_id: data.id,
        question_number: 1,
        question_text: firstQuestion
    });

    return { sessionId: data.id, question: firstQuestion };
}

// ── 2. TRANSCRIBE AUDIO ───────────────────────────────────────
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    // Groq requires a File object with a proper extension
    const file = new File([audioBlob], 'audio.m4a', { type: 'audio/m4a' });

    try {
        const transcription = await groq.audio.transcriptions.create({
            file,
            model: 'whisper-large-v3-turbo',
            response_format: 'text',
        });
        return transcription as unknown as string;
    } catch (error) {
        console.error('Transcription error:', error);
        throw error;
    }
}

// ── 3. EVALUATE RESPONSE ─────────────────────────────────────
export async function evaluateResponse(
    sessionId: string,
    questionText: string,
    answerText: string,
    interviewType: string,
    codeSnippet?: string,
    codeLanguage?: string,
    audioDurationSeconds?: number
) {
    let speechMetrics: SpeechMetrics | null = null;
    if (answerText && audioDurationSeconds && audioDurationSeconds > 0) {
        speechMetrics = analyzeSpeech(answerText, audioDurationSeconds);
    }

    const prompt = buildEvaluationPrompt(interviewType, questionText, answerText, codeSnippet, codeLanguage);

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: 'You are a Senior Technical Interviewer and a JSON-only API. Return ONLY valid JSON.' },
                { role: 'user', content: prompt }
            ]
        });

        let evaluation;
        try {
            const content = completion.choices[0].message.content!;
            // Clean common AI markdown bloat
            const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            evaluation = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('Failed to parse Groq evaluation:', parseError);
            throw new Error('Interview evaluation failed: AI returned invalid response format.');
        }

        await persistResponse(sessionId, questionText, answerText, evaluation, codeSnippet, speechMetrics, audioDurationSeconds);
        return { ...evaluation, speechMetrics };
    } catch (error) {
        console.error('Evaluation error:', error);
        throw error;
    }
}

// ── 4. BUILD PROMPT ──────────────────────────────────────────
function buildEvaluationPrompt(
    type: string,
    question: string,
    answer: string,
    codeSnippet?: string,
    codeLanguage?: string
) {
    const hasCode = !!codeSnippet?.trim();

    return JSON.stringify({
        role: 'Senior Technical Interviewer at a FAANG Company',
        persona: 'You are an exacting but fair interviewer with 15+ years of experience. You evaluate BOTH verbal explanations and code quality with equal rigour.',
        context: {
            interview_type: type,
            question,
            candidate_verbal_answer: answer,
            ...(hasCode && {
                candidate_code: codeSnippet,
                code_language: codeLanguage,
            })
        },
        instructions: [
            'Evaluate the candidate answer strictly against the question.',
            'Evaluate both the verbal answer and the code (if provided) together.',
            'Return ONLY a valid JSON object - no prose, no markdown.',
            'All score fields must be integers between 0 and 10.',
            'Make follow_up_question adaptive: probe a weakness in either the code or verbal answer.',
            'model_answer must include both an ideal explanation AND ideal code solution if applicable.',
            hasCode ? 'Analyze time complexity, space complexity, edge cases, and readability.' :
                'No code provided — skip all code_* score fields.'
        ],
        response_format: {
            score_breakdown: {
                correctness: 0,
                depth: 0,
                clarity: 0,
                structure: 0,
                confidence: 0,
                ...(hasCode && {
                    code_correctness: 0,
                    time_complexity: 0,
                    space_complexity: 0,
                    code_readability: 0,
                    edge_case_handling: 0,
                })
            },
            feedback: {
                overall: 'string',
                strengths: ['string'],
                weaknesses: ['string'],
                missing_points: ['string'],
                ...(hasCode && {
                    code_feedback: 'string',
                    complexity_analysis: {
                        time: 'string',
                        space: 'string',
                        optimal_time: 'string',
                        optimal_space: 'string'
                    }
                })
            },
            model_answer: 'string',
            ...(hasCode && { model_code_solution: 'string' }),
            follow_up_question: 'string'
        }
    });
}

// ── 6. END SESSION ──────────────────────────────────────────
export async function endSession(sessionId: string) {
    // Get all responses to calculate average
    const { data: responses } = await supabase
        .from('interviewer_responses')
        .select('score_correctness, score_depth, score_clarity, score_structure, score_confidence')
        .eq('session_id', sessionId);

    if (!responses || responses.length === 0) {
        return await supabase
            .from('interviewer_sessions')
            .update({ status: 'completed', ended_at: new Date().toISOString() })
            .eq('id', sessionId);
    }

    // Calculate overall average
    const totalScores = responses.reduce((acc, r) => {
        return acc + (r.score_correctness + r.score_depth + r.score_clarity + r.score_structure + r.score_confidence) / 5;
    }, 0);
    const overallScore = totalScores / responses.length;

    // Reward XP (Score out of 10 * 10 = max 100 XP per session)
    const xpReward = Math.round(overallScore * 10);

    // Update session status
    await supabase
        .from('interviewer_sessions')
        .update({
            status: 'completed',
            overall_score: parseFloat(overallScore.toFixed(2)),
            ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

    // Update user profile XP
    const { data: sessionData } = await supabase.from('interviewer_sessions').select('user_id').eq('id', sessionId).single();
    if (sessionData?.user_id) {
        const { error: xpError } = await supabase.rpc('increment_xp', { p_user_id: sessionData.user_id, p_amount: xpReward });
        if (xpError) {
            console.error('Error rewarding XP:', xpError);
            // Fallback: try direct update if RPC fails
            const { data: profile } = await supabase.from('profiles').select('xp').eq('id', sessionData.user_id).single();
            await supabase.from('profiles').update({ xp: (profile?.xp || 0) + xpReward }).eq('id', sessionData.user_id);
        }
    }

    return { success: true, xpReward, overallScore };
}

// ── 5. PERSIST RESPONSE ──────────────────────────────────────
async function persistResponse(
    sessionId: string,
    question: string,
    answer: string,
    evaluation: any,
    code?: string,
    speechMetrics?: SpeechMetrics | null,
    audioDurationSeconds?: number
) {
    // Get current message count to determine question number
    const { count } = await supabase
        .from('interviewer_responses')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);

    const sb = evaluation.score_breakdown;
    const fb = evaluation.feedback;

    const { error } = await supabase
        .from('interviewer_responses')
        .insert({
            session_id: sessionId,
            question_number: (count || 0) + 1,
            question_text: question,
            answer_text: answer,
            code_snippet: code || null,
            score_correctness: sb.correctness,
            score_depth: sb.depth,
            score_clarity: sb.clarity,
            score_structure: sb.structure,
            score_confidence: sb.confidence,
            score_code_correctness: sb.code_correctness ?? null,
            score_time_complexity: sb.time_complexity ?? null,
            score_space_complexity: sb.space_complexity ?? null,
            score_readability: sb.code_readability ?? null,
            score_edge_cases: sb.edge_case_handling ?? null,
            feedback_overall: fb.overall,
            feedback_strengths: fb.strengths,
            feedback_weaknesses: fb.weaknesses,
            code_feedback: fb.code_feedback ?? null,
            complexity_analysis: fb.complexity_analysis ?? null,
            model_answer: evaluation.model_answer,
            model_code_solution: evaluation.model_code_solution ?? null,
            follow_up_question: evaluation.follow_up_question,
            // Speech analysis columns
            ...(speechMetrics && {
                speech_wpm: speechMetrics.words_per_minute,
                speech_filler_count: speechMetrics.filler_count,
                speech_filler_rate: speechMetrics.filler_rate_percent,
                speech_filler_words: speechMetrics.filler_breakdown,
                speech_vocabulary_richness: speechMetrics.vocabulary_richness,
                speech_avg_sentence_len: speechMetrics.avg_sentence_length,
                speech_hedge_rate: speechMetrics.hedge_rate,
                speech_communication_score: speechMetrics.communication_score,
                speech_pace_label: speechMetrics.pace_label,
                speech_feedback: speechMetrics.feedback_tips,
                audio_duration_seconds: audioDurationSeconds ?? null,
            })
        });

    if (error) {
        console.error('Error persisting response:', error);
    }
}
