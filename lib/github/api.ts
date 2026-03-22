// lib/github/api.ts
export class GitHubAPI {
  private baseUrl = 'https://api.github.com';

  async fetchStats(username: string) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${username}`);
      const data = await response.json();

      if (!data.id) return null;

      // Extract stars (requires fetching repos)
      const reposResponse = await fetch(`${this.baseUrl}/users/${username}/repos?per_page=100`);
      const repos = await reposResponse.json();
      const stars = repos.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0);

      return {
        publicRepos: data.public_repos || 0,
        followers: data.followers || 0,
        stars,
        contributions: 0 // In a real app, this would use the GraphQL API for commit counts
      };
    } catch (error) {
      console.error('GitHub Fetch Error:', error);
      return null;
    }
  }
}

export const githubAPI = new GitHubAPI();
