// lib/sync/platforms/hackerrank.ts
import { NeuralStats } from '@/types';

export async function fetchHackerRankStats(username: string) {
  try {
    const url = `https://www.hackerrank.com/rest/hackers/${username}/recent_challenges`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (!data || !data.models) return null;

    // HackerRank recent_challenges returns limited info.
    // For a real sync, we might need to iterate or use another endpoint.
    // We'll estimate totalSolved based on recent models for now.
    
    return {
      totalSolved: data.models.length || 0,
      badges: 0 // Badge info might need a different endpoint: /rest/hackers/ {username} /badges
    };
  } catch (error) {
    console.error('HackerRank Sync Error:', error);
    return null;
  }
}
