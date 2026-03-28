import type { GitHubUser, GitHubRepo, APIError, GitHubUserSuggestion } from '../types/github';

const BASE_URL = 'https://api.github.com';

// ─── In-memory LRU Cache ────────────────────────────────────────────────────
const MAX_CACHE = 60;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: unknown; ts: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data as T;
}

function setCache(key: string, data: unknown) {
  if (cache.size >= MAX_CACHE) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, { data, ts: Date.now() });
}

export function clearCache() { cache.clear(); }

// ─── Token helpers ───────────────────────────────────────────────────────────
export function saveToken(token: string) {
  if (token) localStorage.setItem('gitpulse-token', token);
  else localStorage.removeItem('gitpulse-token');
}

export function getStoredToken(): string | undefined {
  return localStorage.getItem('gitpulse-token') ?? undefined;
}

// ─── Headers ─────────────────────────────────────────────────────────────────
function getHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const tok = token || getStoredToken();
  if (tok) headers['Authorization'] = `Bearer ${tok}`;
  return headers;
}

// ─── Response handler ────────────────────────────────────────────────────────
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 404) {
    const err: APIError = { type: 'not_found', message: 'User not found. Please check the username and try again.' };
    throw err;
  }
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('X-RateLimit-Reset');
    const resetTime = reset ? new Date(parseInt(reset) * 1000).toLocaleTimeString() : 'soon';
    const err: APIError = {
      type: 'rate_limited',
      message: `Rate limit exceeded. Resets at ${resetTime}. Add a token for higher limits.`,
    };
    throw err;
  }
  if (!res.ok) {
    const err: APIError = { type: 'unknown', message: `GitHub API error: ${res.status} ${res.statusText}` };
    throw err;
  }
  return res.json() as Promise<T>;
}

// ─── API functions ───────────────────────────────────────────────────────────
export async function fetchUser(username: string, token?: string): Promise<GitHubUser> {
  const key = `user:${username.toLowerCase()}`;
  const cached = getCached<GitHubUser>(key);
  if (cached) return cached;

  try {
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(username)}`, {
      headers: getHeaders(token),
    });
    const data = await handleResponse<GitHubUser>(res);
    setCache(key, data);
    return data;
  } catch (e) {
    if ((e as APIError).type) throw e;
    const err: APIError = { type: 'network', message: 'Network error. Check your connection and try again.' };
    throw err;
  }
}

export async function fetchRepos(username: string, token?: string, page = 1, perPage = 30): Promise<GitHubRepo[]> {
  const key = `repos:${username.toLowerCase()}:${page}:${perPage}`;
  const cached = getCached<GitHubRepo[]>(key);
  if (cached) return cached;

  try {
    const res = await fetch(
      `${BASE_URL}/users/${encodeURIComponent(username)}/repos?sort=pushed&direction=desc&per_page=${perPage}&page=${page}`,
      { headers: getHeaders(token) }
    );
    const data = await handleResponse<GitHubRepo[]>(res);
    setCache(key, data);
    return data;
  } catch (e) {
    if ((e as APIError).type) throw e;
    const err: APIError = { type: 'network', message: 'Network error. Check your connection and try again.' };
    throw err;
  }
}

export async function searchUsers(query: string, token?: string): Promise<GitHubUserSuggestion[]> {
  if (!query.trim() || query.length < 1) return [];
  const key = `search:${query.toLowerCase()}`;
  const cached = getCached<GitHubUserSuggestion[]>(key);
  if (cached) return cached;

  try {
    const res = await fetch(
      `${BASE_URL}/search/users?q=${encodeURIComponent(query)}&per_page=6`,
      { headers: getHeaders(token) }
    );
    if (!res.ok) return [];
    const data = await res.json() as { items: GitHubUserSuggestion[] };
    setCache(key, data.items);
    return data.items;
  } catch {
    return [];
  }
}

// ─── Language colors ─────────────────────────────────────────────────────────
export function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#239120',
    Go: '#00ADD8', Rust: '#dea584', Swift: '#ffac45', Kotlin: '#A97BFF',
    Ruby: '#701516', PHP: '#4F5D95', HTML: '#e34c26', CSS: '#563d7c',
    Shell: '#89e051', Vue: '#41b883', Dart: '#00B4AB', Scala: '#c22d40',
    Haskell: '#5e5086', Lua: '#000080', Elixir: '#6e4a7e',
    'Jupyter Notebook': '#DA5B0B', MATLAB: '#e16737', R: '#198CE7',
    Svelte: '#ff3e00', 'Objective-C': '#438eff', Perl: '#0298c3',
  };
  return colors[language ?? ''] ?? '#8b949e';
}
