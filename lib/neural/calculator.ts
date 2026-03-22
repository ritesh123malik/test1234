// lib/neural/calculator.ts
import { NeuralStats } from '@/types';

export function calculateNeuralPower(stats: NeuralStats): number {
  let score = 0;

  // 1. LeetCode Weights (Max ~4000)
  if (stats.leetcode) {
    const { easy, medium, hard, totalSolved } = stats.leetcode;
    score += easy * 2;
    score += medium * 5;
    score += hard * 10;
    
    // Consistency bonus (based on submission calendar)
    const activeDays = Object.keys(stats.leetcode.calendar || {}).length;
    score += activeDays * 3;
  }

  // 2. Codeforces Weights (Max ~3000)
  if (stats.codeforces) {
    const { rating, contests } = stats.codeforces;
    score += rating * 1.2;
    score += contests * 20;
  }

    // 3. GitHub Weights (Max ~3000)
    if (stats.github) {
        const { stars, followers, publicRepos } = stats.github;
        score += stars * 50;
        score += followers * 10;
        score += publicRepos * 5;
    }

    // 4. GeeksforGeeks Weights
    if (stats.gfg) {
        const { easy, medium, hard, ranking } = stats.gfg;
        score += easy * 1;
        score += medium * 3;
        score += hard * 7;
        if (ranking > 0 && ranking < 10000) score += (10000 - ranking) / 10;
    }

    // 5. CodeChef Weights
    if (stats.codechef) {
        const { rating, totalSolved } = stats.codechef;
        score += rating * 1.0;
        score += totalSolved * 2;
    }

    // 6. HackerRank Weights
    if (stats.hackerrank) {
        const { totalSolved } = stats.hackerrank;
        score += totalSolved * 5;
    }

    return Math.round(score);
}
