// app/api/contests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contestAPI } from '@/lib/contests/api';

export async function GET(req: NextRequest) {
  try {
    const contests = await contestAPI.fetchUpcomingContests();
    return NextResponse.json(contests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contests' }, { status: 500 });
  }
}
