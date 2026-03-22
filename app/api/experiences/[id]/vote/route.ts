// app/api/experiences/[id]/vote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type } = await req.json(); // 'up' or 'down'
    const expId = id;

    // 1. Check existing vote
    const { data: existingVote } = await supabase
      .from('experience_votes')
      .select('vote_type')
      .eq('experience_id', expId)
      .eq('user_id', user.id)
      .single();

    if (existingVote?.vote_type === type) {
      // Remove vote (toggle)
      await supabase
        .from('experience_votes')
        .delete()
        .eq('experience_id', expId)
        .eq('user_id', user.id);
      
      const du = type === 'up' ? -1 : 0;
      const dd = type === 'down' ? -1 : 0;
      await supabase.rpc('update_experience_votes', { exp_id: expId, delta_up: du, delta_down: dd });
      
      return NextResponse.json({ action: 'removed' });
    }

    // 2. Upsert vote
    const { error: voteError } = await supabase
      .from('experience_votes')
      .upsert({
        experience_id: expId,
        user_id: user.id,
        vote_type: type
      });

    if (voteError) throw voteError;

    // 3. Atomically update counts
    let du = 0, dd = 0;
    if (type === 'up') {
      du = 1;
      if (existingVote?.vote_type === 'down') dd = -1;
    } else {
      dd = 1;
      if (existingVote?.vote_type === 'up') du = -1;
    }

    const { error: rpcError } = await supabase.rpc('update_experience_votes', {
      exp_id: expId,
      delta_up: du,
      delta_down: dd
    });

    if (rpcError) throw rpcError;

    return NextResponse.json({ action: 'success', type });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
