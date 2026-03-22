import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRoadmap } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate Limiting Cooldown (1 hour)
  const { data: profile } = await supabase
    .from('profiles')
    .select('roadmap_generated_at')
    .eq('id', user.id)
    .single();

  if (profile?.roadmap_generated_at) {
    const lastGenerated = new Date(profile.roadmap_generated_at);
    const now = new Date();
    const diffHours = (now.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      const waitMinutes = Math.ceil(60 - (diffHours * 60));
      return NextResponse.json(
        { error: `Sync cooldown active. Please wait ${waitMinutes} minutes before generating another roadmap.` },
        { status: 429 }
      );
    }
  }

  try {
    const { company, role, experience, duration } = await req.json();

    if (!company || !role) {
      return NextResponse.json(
        { error: 'Company and role are required' },
        { status: 400 }
      );
    }

    console.log('Generating roadmap for:', { company, role, experience, duration });

    const roadmap = await generateRoadmap(company, role, experience, duration);

    // Update cooldown timestamp
    await supabase
      .from('profiles')
      .update({ roadmap_generated_at: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json({ roadmap });

  } catch (error: any) {
    console.error('Roadmap API error:', error);

    // More specific error message
    const errorMessage = error.message?.includes('model')
      ? 'AI model temporarily unavailable. Please try again.'
      : 'Failed to generate roadmap. Please try again.';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}