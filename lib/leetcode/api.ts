// lib/leetcode/api.ts
import { NeuralStats } from '@/types';

class LeetCodeAPI {
  private proxyUrl = '/api/leetcode';

  async fetchStats(username: string) {
    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query userSessionProgress($username: String!) {
              matchedUser(username: $username) {
                submitStats {
                  acSubmissionNum {
                    difficulty
                    count
                    submissions
                  }
                }
                profile {
                  ranking
                  reputation
                }
                submissionCalendar
              }
            }
          `,
          variables: { username }
        })
      });

      const json = await response.json();
      if (!json.data?.matchedUser) return null;

      const user = json.data.matchedUser;
      const acStats = user.submitStats.acSubmissionNum;

      return {
        totalSolved: acStats.find((s: any) => s.difficulty === 'All')?.count || 0,
        easy: acStats.find((s: any) => s.difficulty === 'Easy')?.count || 0,
        medium: acStats.find((s: any) => s.difficulty === 'Medium')?.count || 0,
        hard: acStats.find((s: any) => s.difficulty === 'Hard')?.count || 0,
        ranking: user.profile.ranking,
        calendar: JSON.parse(user.submissionCalendar || '{}')
      };
    } catch (error) {
      console.error('LC Fetch Error:', error);
      return null;
    }
  }

  async fetchUserProfile(username: string) {
    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query userPublicProfile($username: String!) {
              matchedUser(username: $username) {
                submitStats {
                  acSubmissionNum {
                    difficulty
                    count
                    submissions
                  }
                  totalSubmissionNum {
                    difficulty
                    count
                    submissions
                  }
                }
                profile {
                  ranking
                  reputation
                  starRating
                }
                submissionCalendar
                streakCounter: userCalendar { streak }
              }
            }
          `,
          variables: { username }
        })
      });

      const json = await response.json();
      if (!json.data?.matchedUser) return null;

      const user = json.data.matchedUser;
      const acStats = user.submitStats.acSubmissionNum;
      const totalStats = user.submitStats.totalSubmissionNum;

      const totalSolved = acStats.find((s: any) => s.difficulty === 'All')?.count || 0;
      const totalSubmissions = totalStats.find((s: any) => s.difficulty === 'All')?.submissions || 1;
      const totalAccepted = acStats.find((s: any) => s.difficulty === 'All')?.submissions || 0;

      return {
        totalSolved,
        easySolved: acStats.find((s: any) => s.difficulty === 'Easy')?.count || 0,
        mediumSolved: acStats.find((s: any) => s.difficulty === 'Medium')?.count || 0,
        hardSolved: acStats.find((s: any) => s.difficulty === 'Hard')?.count || 0,
        acceptanceRate: totalSubmissions > 0 ? Math.round((totalAccepted / totalSubmissions) * 10000) / 100 : 0,
        ranking: user.profile.ranking || 0,
        streak: user.streakCounter?.streak || 0,
      };
    } catch (error) {
      console.error('LC Profile Fetch Error:', error);
      return null;
    }
  }

  async fetchRecentSubmissions(username: string) {
    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query recentAcSubmissions($username: String!, $limit: Int!) {
              recentAcSubmissionList(username: $username, limit: $limit) {
                id
                title
                titleSlug
                timestamp
              }
            }
          `,
          variables: { username, limit: 20 }
        })
      });

      const json = await response.json();
      if (!json.data?.recentAcSubmissionList) return [];

      return json.data.recentAcSubmissionList.map((sub: any) => ({
        problem_id: sub.titleSlug,
        problem_title: sub.title,
        solved_at: new Date(parseInt(sub.timestamp) * 1000).toISOString(),
        platform: 'leetcode'
      }));
    } catch (error) {
      console.error('LC Recent Submissions Fetch Error:', error);
      return [];
    }
  }

  async validateUsername(username: string): Promise<boolean> {
    try {
      const stats = await this.fetchStats(username);
      return stats !== null;
    } catch {
      return false;
    }
  }
}

export const leetcodeAPI = new LeetCodeAPI();
