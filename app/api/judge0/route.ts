import { NextRequest, NextResponse } from 'next/server';

const LANGUAGE_IDS: Record<string, number> = {
    python: 71,
    javascript: 63,
    cpp: 54,
    java: 62,
    csharp: 51,
    ruby: 72,
};

export async function POST(req: NextRequest) {
    const { code, language, stdin = '' } = await req.json();
    const languageId = LANGUAGE_IDS[language] ?? 71;

    if (!process.env.JUDGE0_API_KEY || !process.env.JUDGE0_API_URL) {
        return NextResponse.json({ error: 'Judge0 configuration missing' }, { status: 500 });
    }

    try {
        // Step 1: Submit code for execution
        const submitRes = await fetch(`${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            body: JSON.stringify({ source_code: code, language_id: languageId, stdin })
        });

        const result = await submitRes.json();

        return NextResponse.json({
            stdout: result.stdout ?? '',
            stderr: result.stderr ?? '',
            compile_output: result.compile_output ?? '',
            time: result.time ?? '0',
            memory: result.memory ?? '0',
            status: result.status?.description ?? 'Unknown'
        });
    } catch (err: any) {
        console.error('Judge0 proxy error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
