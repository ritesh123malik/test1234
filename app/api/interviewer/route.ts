import { NextRequest, NextResponse } from 'next/server';
import { startSession, evaluateResponse, evaluateResponseStream, transcribeAudio, endSession } from '@/services/interviewer-service';
import { createClient } from '@/lib/supabase/server';
import { checkPremiumGate, incrementUsage } from '@/lib/premium-gate';

// POST /api/interviewer
export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action } = body;

        // ── START SESSION ───────────────────────────────────
        if (action === 'start') {
            // 1. Check Premium Gate
            const { allowed, reason, upgrade } = await checkPremiumGate(user.id, 'ai_interviews');
            if (!allowed) {
                return NextResponse.json({ error: reason, upgrade: !!upgrade }, { status: 403 });
            }

            const { type } = body;
            const result = await startSession(user.id, type);

            // 2. Increment usage
            await incrementUsage(user.id, 'ai_interviews');

            return NextResponse.json(result);
        }

        // ── SUBMIT RESPONSE (text) ──────────────────────────
        if (action === 'respond') {
            const { sessionId, questionText, answerText, interviewType, codeSnippet, codeLanguage, audioDurationSeconds, stream = false } = body;
            
            if (stream) {
                const streamResponse = await evaluateResponseStream(
                    sessionId, questionText, answerText, interviewType, codeSnippet, codeLanguage, audioDurationSeconds
                );
                return new Response(streamResponse, {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                    },
                });
            }

            const evaluation = await evaluateResponse(sessionId, questionText, answerText, interviewType, codeSnippet, codeLanguage, audioDurationSeconds);
            return NextResponse.json({ evaluation });
        }


        // ── END SESSION ─────────────────────────────────────
        if (action === 'end') {
            const { sessionId } = body;
            await endSession(sessionId);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PUT /api/interviewer (Audio Transcription)
export async function PUT(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as Blob;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        const transcript = await transcribeAudio(audioFile);
        return NextResponse.json({ transcript });
    } catch (err: any) {
        console.error('Transcription API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
