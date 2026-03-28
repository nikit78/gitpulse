export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  private: boolean;
  fork: boolean;
  archived: boolean;
  default_branch: string;
  license: { name: string } | null;
  homepage: string | null;
  visibility: string;
}

export interface GitHubUserSuggestion {
  login: string;
  avatar_url: string;
  type: 'User' | 'Organization';
}

export type APIError = {
  type: 'not_found' | 'rate_limited' | 'network' | 'unknown';
  message: string;
};

export type AppTheme = 'dark' | 'light';

export type BookmarkedUser = Pick<GitHubUser, 'login' | 'avatar_url' | 'name' | 'public_repos' | 'followers'>;
