import { Star, GitFork, ExternalLink, Circle } from 'lucide-react';
import type { GitHubRepo } from '../types/github';
import { getLanguageColor } from '../services/githubApi';

interface RepoCardProps {
  repo: GitHubRepo;
}

export default function RepoCard({ repo }: RepoCardProps) {
  const langColor = getLanguageColor(repo.language);
  const updatedAt = new Date(repo.pushed_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col gap-3 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-200 hover:-translate-y-0.5"
      aria-label={`View ${repo.name} repository on GitHub`}
    >
      {/* Name Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-white truncate text-sm group-hover:text-violet-300 transition-colors">
            {repo.name}
          </h3>
          {repo.archived && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 flex-shrink-0 font-medium">
              Archived
            </span>
          )}
          {repo.fork && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20 flex-shrink-0 font-medium">
              Fork
            </span>
          )}
        </div>
        <ExternalLink
          size={14}
          className="text-slate-600 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
        {repo.description ?? <span className="italic text-slate-600">No description provided.</span>}
      </p>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {repo.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium"
            >
              {topic}
            </span>
          ))}
          {repo.topics.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 text-slate-600">
              +{repo.topics.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer Row */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Star size={12} className="text-yellow-400" aria-hidden="true" />
            {repo.stargazers_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <GitFork size={12} className="text-slate-500" aria-hidden="true" />
            {repo.forks_count.toLocaleString()}
          </span>
          {repo.language && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Circle size={10} style={{ fill: langColor, color: langColor }} aria-hidden="true" />
              {repo.language}
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-600 hidden sm:block">{updatedAt}</span>
      </div>
    </a>
  );
}
