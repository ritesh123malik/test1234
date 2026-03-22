// lib/sync/platforms/gfg.ts
import { NeuralStats } from '@/types';

export async function fetchGFGStats(username: string) {
  try {
    const url = `https://www.geeksforgeeks.org/user/${username}/`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Regex to extract solved counts (This is a simplified approach, real-world might need more robust parsing)
    // Looking for patterns like "School: (count)", "Basic: (count)", etc.
    const extractCount = (difficulty: string) => {
      const regex = new RegExp(`${difficulty}[:\\s]+(\\d+)`, 'i');
      const match = html.match(regex);
      return match ? parseInt(match[1]) : 0;
    };

    const school = extractCount('School');
    const basic = extractCount('Basic');
    const easy = extractCount('Easy');
    const medium = extractCount('Medium');
    const hard = extractCount('Hard');

    // Combine School/Basic into Easy for normalization
    const normalizedEasy = school + basic + easy;

    const rankingRegex = /Global Rank[:\s]+([\d,]+)/i;
    const rankingMatch = html.match(rankingRegex);
    const ranking = rankingMatch ? parseInt(rankingMatch[1].replace(/,/g, '')) : 0;

    return {
      totalSolved: normalizedEasy + medium + hard,
      easy: normalizedEasy,
      medium,
      hard,
      ranking
    };
  } catch (error) {
    console.error('GFG Sync Error:', error);
    return null;
  }
}
