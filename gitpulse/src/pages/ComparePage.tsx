import { useState, useCallback } from 'react';
import { GitMerge, Users, BookOpen, Star, ArrowLeftRight, Loader2, AlertCircle } from 'lucide-react';
import { fetchUser, fetchRepos } from '../services/githubApi';
import type { GitHubUser, GitHubRepo, APIError } from '../types/github';

/* ── helpers ─────────────────────────────────────────────── */
function sum(repos: GitHubRepo[], key: keyof GitHubRepo): number {
  return repos.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
}

function avgUpdated(repos: GitHubRepo[]) {
  if (!repos.length) return 0;
  const now = Date.now();
  const avg = repos.reduce((a, r) => a + (now - new Date(r.pushed_at).getTime()), 0) / repos.length;
  return Math.round(avg / (1000 * 60 * 60 * 24)); // days
}

/* ── tiny input ──────────────────────────────────────────── */
function UserInput({
  label, value, onChange, onSearch, loading,
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        placeholder={label}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch()}
        disabled={loading}
        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all text-sm disabled:opacity-60"
        aria-label={label}
      />
      <button
        onClick={onSearch}
        disabled={loading || !value.trim()}
        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Load'}
      </button>
    </div>
  );
}

/* ── stat row ────────────────────────────────────────────── */
function StatRow({
  label, a, b, higherIsBetter = true,
}: {
  label: string; a: number | string; b: number | string; higherIsBetter?: boolean;
}) {
  const na = typeof a === 'number' ? a : 0;
  const nb = typeof b === 'number' ? b : 0;
  const aWins = higherIsBetter ? na > nb : na < nb;
  const bWins = higherIsBetter ? nb > na : nb < na;

  return (
    <div className="grid grid-cols-3 items-center py-2.5 border-b border-white/5 last:border-0 gap-2">
      <div className={`text-right text-sm font-semibold ${aWins ? 'text-violet-300' : 'text-slate-300'}`}>
        {typeof a === 'number' ? a.toLocaleString() : a}
        {aWins && <span className="ml-1.5 text-[10px] text-violet-400 font-bold">▲</span>}
      </div>
      <div className="text-center text-xs text-slate-500 font-medium px-1">{label}</div>
      <div className={`text-left text-sm font-semibold ${bWins ? 'text-indigo-300' : 'text-slate-300'}`}>
        {bWins && <span className="mr-1.5 text-[10px] text-indigo-400 font-bold">▲</span>}
        {typeof b === 'number' ? b.toLocaleString() : b}
      </div>
    </div>
  );
}

/* ── profile column ──────────────────────────────────────── */
function ProfileColumn({ user, repos, color }: { user: GitHubUser; repos: GitHubRepo[]; color: string }) {
  const topLang = (() => {
    const counts: Record<string, number> = {};
    repos.forEach(r => { if (r.language) counts[r.language] = (counts[r.language] ?? 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : 'N/A';
  })();

  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="relative">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-20 h-20 rounded-2xl object-cover"
          style={{ boxShadow: `0 0 0 2px ${color}` }}
        />
        <div className="absolute inset-0 rounded-2xl ring-2" style={{ outlineColor: color, outline: `2px solid ${color}` }} />
      </div>
      <div>
        <p className="font-bold text-white">{user.name ?? user.login}</p>
        <a
          href={user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-violet-400 transition-colors"
        >
          @{user.login}
        </a>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
          {topLang}
        </span>
        {user.location && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/10">
            {user.location}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── main page ───────────────────────────────────────────── */
export default function ComparePage() {
  const [loginA, setLoginA] = useState('');
  const [loginB, setLoginB] = useState('');
  const [userA, setUserA] = useState<GitHubUser | null>(null);
  const [userB, setUserB] = useState<GitHubUser | null>(null);
  const [reposA, setReposA] = useState<GitHubRepo[]>([]);
  const [reposB, setReposB] = useState<GitHubRepo[]>([]);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  const loadUser = useCallback(async (
    login: string,
    setUser: (u: GitHubUser | null) => void,
    setRepos: (r: GitHubRepo[]) => void,
    setLoading: (b: boolean) => void,
    setError: (e: string | null) => void,
  ) => {
    const q = login.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setUser(null);
    setRepos([]);
    try {
      const [u, r] = await Promise.all([fetchUser(q), fetchRepos(q, undefined, 1, 100)]);
      setUser(u);
      setRepos(r);
    } catch (e) {
      setError((e as APIError).message ?? 'Failed to load user.');
    } finally {
      setLoading(false);
    }
  }, []);

  const ready = userA && userB;

  const totalStarsA = sum(reposA, 'stargazers_count');
  const totalStarsB = sum(reposB, 'stargazers_count');
  const totalForksA = sum(reposA, 'forks_count');
  const totalForksB = sum(reposB, 'forks_count');
  const avgDaysA = avgUpdated(reposA);
  const avgDaysB = avgUpdated(reposB);

  return (
    <main className="min-h-screen">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
            <ArrowLeftRight size={12} />
            Profile Comparison
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Compare GitHub Profiles</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Enter two GitHub usernames to compare their stats, repos, and activity side by side.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-violet-400 font-semibold uppercase tracking-wider">User A</label>
            <UserInput
              label="Username A…"
              value={loginA}
              onChange={setLoginA}
              loading={loadingA}
              onSearch={() => loadUser(loginA, setUserA, setReposA, setLoadingA, setErrorA)}
            />
            {errorA && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errorA}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">User B</label>
            <UserInput
              label="Username B…"
              value={loginB}
              onChange={setLoginB}
              loading={loadingB}
              onSearch={() => loadUser(loginB, setUserB, setReposB, setLoadingB, setErrorB)}
            />
            {errorB && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errorB}
              </p>
            )}
          </div>
        </div>

        {/* Placeholder */}
        {!ready && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center rounded-2xl border border-dashed border-white/10">
            <div className="flex -space-x-3">
              <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border-2 border-violet-500/30 flex items-center justify-center">
                <Users size={24} className="text-violet-400" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border-2 border-indigo-500/30 flex items-center justify-center">
                <GitMerge size={24} className="text-indigo-400" />
              </div>
            </div>
            <div>
              <p className="text-slate-300 font-semibold">Load both users to compare</p>
              <p className="text-slate-500 text-sm mt-1">Stats will appear here once both profiles are loaded.</p>
            </div>
          </div>
        )}

        {/* Comparison */}
        {ready && (
          <div className="space-y-6 animate-fadeIn">
            {/* Profile row */}
            <div className="grid grid-cols-3 gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <ProfileColumn user={userA} repos={reposA} color="#8b5cf6" />
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <ArrowLeftRight size={16} className="text-slate-500" />
                </div>
              </div>
              <ProfileColumn user={userB} repos={reposB} color="#6366f1" />
            </div>

            {/* Stats table */}
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-3 px-5 py-3 border-b border-white/10 text-xs font-semibold">
                <span className="text-right text-violet-400 uppercase tracking-wider">{userA.login}</span>
                <span className="text-center text-slate-500 uppercase tracking-wider">Metric</span>
                <span className="text-left text-indigo-400 uppercase tracking-wider">{userB.login}</span>
              </div>
              <div className="px-5">
                <StatRow label="Followers" a={userA.followers} b={userB.followers} />
                <StatRow label="Following" a={userA.following} b={userB.following} />
                <StatRow label="Public Repos" a={userA.public_repos} b={userB.public_repos} />
                <StatRow label="Total Stars" a={totalStarsA} b={totalStarsB} />
                <StatRow label="Total Forks" a={totalForksA} b={totalForksB} />
                <StatRow label="Loaded Repos" a={reposA.length} b={reposB.length} />
                <StatRow label="Avg Update (days ago)" a={avgDaysA} b={avgDaysB} higherIsBetter={false} />
                <StatRow
                  label="Member Since"
                  a={new Date(userA.created_at).getFullYear()}
                  b={new Date(userB.created_at).getFullYear()}
                  higherIsBetter={false}
                />
              </div>
            </div>

            {/* Repo highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{ user: userA, repos: reposA, color: 'violet' }, { user: userB, repos: reposB, color: 'indigo' }].map(({ user, repos, color }) => {
                const top3 = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3);
                return (
                  <div key={user.login} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <h3 className={`text-sm font-semibold text-${color}-400 flex items-center gap-2`}>
                      <BookOpen size={14} />
                      {user.login}'s Top Repos
                    </h3>
                    {top3.map(r => (
                      <a
                        key={r.id}
                        href={r.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <span className="text-xs text-slate-300 font-medium truncate group-hover:text-white transition-colors">
                          {r.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-yellow-400 flex-shrink-0">
                          <Star size={11} />
                          {r.stargazers_count.toLocaleString()}
                        </span>
                      </a>
                    ))}
                    {top3.length === 0 && (
                      <p className="text-xs text-slate-600">No public repos loaded.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
