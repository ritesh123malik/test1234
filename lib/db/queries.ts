// lib/db/queries.ts
import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types';

export async function getUserByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient();

  // Single efficient query: try username, email prefix, or full_name match
  const { data: matches } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.eq.${username},email.ilike.${username}%`)
    .limit(5);

  if (matches && matches.length > 0) {
    // Prefer exact username match, then email match
    const exactUsername = matches.find(p => p.username === username);
    if (exactUsername) return exactUsername;
    return matches[0];
  }

  // Last resort: check by full_name (with spaces removed) — separate query
  const { data: nameMatches } = await supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${username}%`)
    .limit(5);

  if (nameMatches && nameMatches.length > 0) {
    const normalized = username.toLowerCase().replace(/[\s_-]+/g, '');
    const match = nameMatches.find(p => {
      const dbName = (p.full_name || '').toLowerCase().replace(/[\s_-]+/g, '');
      return dbName === normalized;
    });
    if (match) return match;
    return nameMatches[0];
  }

  return null;
}

export async function getExperienceStats(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('interview_experiences')
    .select('upvotes, downvotes')
    .eq('user_id', userId);

  if (error || !data) return { totalUpvotes: 0, totalDownvotes: 0 };

  return data.reduce((acc, curr) => ({
    totalUpvotes: acc.totalUpvotes + curr.upvotes,
    totalDownvotes: acc.totalDownvotes + curr.downvotes
  }), { totalUpvotes: 0, totalDownvotes: 0 });
}

export async function getSimilarUsers(score: number, limit: number = 5) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, neural_power_score')
      .neq('neural_power_score', 0)
      .order('neural_power_score', { ascending: false })
      .limit(limit);
  
    if (error) return [];
    return data.map(u => ({
        id: u.id,
        name: u.username,
        avatar_url: u.avatar_url,
        score: u.neural_power_score
    }));
}
