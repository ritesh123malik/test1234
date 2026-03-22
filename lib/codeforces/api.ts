// lib/codeforces/api.ts
export class CodeforcesAPI {
  private baseUrl = 'https://codeforces.com/api';

  async fetchStats(handle: string) {
    try {
      const response = await fetch(`${this.baseUrl}/user.info?handles=${handle}`);
      const data = await response.json();

      if (data.status !== 'OK' || !data.result?.[0]) return null;

      const user = data.result[0];
      
      // Fetch user rating history to get contest count
      const ratingResponse = await fetch(`${this.baseUrl}/user.rating?handle=${handle}`);
      const ratingData = await ratingResponse.json();
      const contestCount = ratingData.status === 'OK' ? ratingData.result.length : 0;

      return {
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || 'unranked',
        contests: contestCount
      };
    } catch (error) {
      console.error('CF Fetch Error:', error);
      return null;
    }
  }

  async fetchUserInfo(handle: string) {
    try {
      const response = await fetch(`${this.baseUrl}/user.info?handles=${handle}`);
      const data = await response.json();
      if (data.status !== 'OK' || !data.result?.[0]) return null;
      const user = data.result[0];
      return {
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || 'unranked',
        maxRank: user.maxRank || 'unranked',
      };
    } catch (error) {
      console.error('CF UserInfo Fetch Error:', error);
      return null;
    }
  }

  async fetchSubmissionCalendar(handle: string) {
    try {
      const response = await fetch(`${this.baseUrl}/user.status?handle=${handle}`);
      const data = await response.json();

      if (data.status !== 'OK') return {};

      // date (YYYY-MM-DD) -> count
      const calendar: Record<string, number> = {};
      
      data.result.forEach((sub: any) => {
        if (sub.verdict === 'OK') {
          const date = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
          calendar[date] = (calendar[date] || 0) + 1;
        }
      });

      return calendar;
    } catch (error) {
      console.error('CF Calendar Fetch Error:', error);
      return {};
    }
  }

  async fetchRecentSubmissions(handle: string) {
    try {
      const response = await fetch(`${this.baseUrl}/user.status?handle=${handle}&from=1&count=20`);
      const data = await response.json();

      if (data.status !== 'OK') return [];

      return data.result
        .filter((sub: any) => sub.verdict === 'OK')
        .map((sub: any) => ({
          problem_id: `${sub.problem.contestId}-${sub.problem.index}`,
          problem_title: sub.problem.name,
          solved_at: new Date(sub.creationTimeSeconds * 1000).toISOString(),
          platform: 'codeforces',
          difficulty: sub.problem.rating ? (sub.problem.rating < 1200 ? 'easy' : sub.problem.rating < 1600 ? 'medium' : 'hard') : 'medium',
          tags: sub.problem.tags
        }));
    } catch (error) {
      console.error('CF Recent Submissions Fetch Error:', error);
      return [];
    }
  }
}

export const codeforcesAPI = new CodeforcesAPI();
