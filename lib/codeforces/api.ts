// lib/codeforces/api.ts
// Service to fetch Codeforces data using public API

export interface CodeforcesProfile {
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    maxRank: string;
    avatar: string;
}

class CodeforcesAPI {
    private baseUrl = 'https://codeforces.com/api';

    // Fetch user info
    async fetchUserInfo(handle: string): Promise<CodeforcesProfile | null> {
        try {
            const response = await fetch(`${this.baseUrl}/user.info?handles=${handle}`);
            const data = await response.json();

            if (data.status !== 'OK' || !data.result?.[0]) {
                return null;
            }

            const user = data.result[0];
            return {
                handle: user.handle,
                rating: user.rating || 0,
                maxRating: user.maxRating || 0,
                rank: user.rank || 'N/A',
                maxRank: user.maxRank || 'N/A',
                avatar: user.titlePhoto || user.avatar
            };
        } catch (error) {
            console.error('Error fetching Codeforces info:', error);
            return null;
        }
    }

    // Validate if handle exists
    async validateHandle(handle: string): Promise<boolean> {
        const info = await this.fetchUserInfo(handle);
        return info !== null;
    }
}

export const codeforcesAPI = new CodeforcesAPI();
