// app/api/experiences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const company = searchParams.get('company');
  const role = searchParams.get('role');

  try {
    let query = supabase
      .from('interview_experiences')
      .select(`
        *,
        profiles (
          id,
          username,
          avatar_url,
          neural_power_score
        )
      `)
      .order('created_at', { ascending: false });

    if (company) query = query.ilike('company_name', `%${company}%`);
    if (role) query = query.ilike('role', `%${role}%`);

    // Only show verified unless it's the user's own
    // (Simplified for this implementaion)
    query = query.eq('is_verified', true);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      company_name, 
      role, 
      content, 
      difficulty, 
      outcome, 
      year, 
      is_anonymous 
    } = body;

    const { data, error } = await supabase
      .from('interview_experiences')
      .insert({
        user_id: user.id,
        company_name,
        role,
        content,
        difficulty,
        outcome,
        year: year || new Date().getFullYear(),
        is_anonymous: !!is_anonymous,
        is_verified: false // Admin must approve
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
