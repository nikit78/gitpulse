import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { GitHubRepo } from '../types/github';
import { Star, GitFork, ExternalLink, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RepoDetails() {
  const { name } = useParams<{ name: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = new URLSearchParams(location.search);
  const username = params.get('user');

  useEffect(() => {
    if (!username || !name) {
      setError('Missing repository or user information.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchRepo = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.github.com/repos/${username}/${name}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data: GitHubRepo = await res.json();
        setRepo(data);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to load repository details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRepo();
    return () => controller.abort();
  }, [name, username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
        <p>{error ?? 'Repository not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:border-white/20 transition-all"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{repo.name}</h1>
            {repo.description && (
              <p className="text-slate-400 mt-1 text-sm leading-relaxed">{repo.description}</p>
            )}
          </div>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all whitespace-nowrap"
          >
            <ExternalLink size={14} />
            Open on GitHub
          </a>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <Star size={14} className="text-yellow-400" />
            {repo.stargazers_count.toLocaleString()} stars
          </span>
          <span className="flex items-center gap-1.5">
            <GitFork size={14} className="text-slate-500" />
            {repo.forks_count.toLocaleString()} forks
          </span>
          {repo.language && (
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs">
              {repo.language}
            </span>
          )}
          {repo.archived && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs">
              Archived
            </span>
          )}
        </div>

        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.map((topic) => (
              <span
                key={topic}
                className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { label: 'Open Issues', value: repo.open_issues_count },
            { label: 'Watchers', value: repo.watchers_count },
            { label: 'Default Branch', value: repo.default_branch },
            { label: 'License', value: repo.license?.name ?? 'None' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-white font-semibold text-sm">{value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}