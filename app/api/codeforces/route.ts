import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get('handle');

    if (!handle) {
        return NextResponse.json({ error: 'Handle required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
