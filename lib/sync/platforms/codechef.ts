// lib/sync/platforms/codechef.ts
import { NeuralStats } from '@/types';

export async function fetchCodeChefStats(username: string) {
  try {
    const url = `https://codechef-api.vercel.app/${username}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.success) return null;

    return {
      rating: data.rating || 0,
      globalRank: data.globalRank || 0,
      countryRank: data.countryRank || 0,
      stars: data.stars || '1★',
      totalSolved: data.problemsSolved || 0
    };
  } catch (error) {
    console.error('CodeChef Sync Error:', error);
    return null;
  }
}
