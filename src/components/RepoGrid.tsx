import { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, LayoutGrid, Circle } from 'lucide-react';
import RepoCard from './RepoCard';
import type { GitHubRepo } from '../types/github';
import { getLanguageColor } from '../services/githubApi';

interface RepoGridProps {
  repos: GitHubRepo[];
  totalCount: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

type SortOption = 'stars' | 'forks' | 'updated' | 'name';
type FilterOption = 'all' | 'source' | 'forked' | 'archived';

export default function RepoGrid({ repos, totalCount, page, perPage, onPageChange }: RepoGridProps) {
  const [sort, setSort] = useState<SortOption>('stars');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [langFilter, setLangFilter] = useState<string>('all');

  const totalPages = Math.ceil(totalCount / perPage);

  // Derive unique languages from current repos
  const languages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach(r => { if (r.language) set.add(r.language); });
    return Array.from(set).sort();
  }, [repos]);

  const filtered = repos.filter((r) => {
    if (filter === 'source' && (r.fork || r.archived)) return false;
    if (filter === 'forked' && !r.fork) return false;
    if (filter === 'archived' && !r.archived) return false;
    if (langFilter !== 'all' && r.language !== langFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'stars') return b.stargazers_count - a.stargazers_count;
    if (sort === 'forks') return b.forks_count - a.forks_count;
    if (sort === 'updated') return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    if (sort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const scrollToTop = useCallback(() => {
    document.getElementById('repos-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
    scrollToTop();
  };

  const activeFilters = (filter !== 'all' ? 1 : 0) + (langFilter !== 'all' ? 1 : 0);

  return (
    <section id="repos-section" aria-label="Repositories section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <LayoutGrid size={16} className="text-violet-400" aria-hidden="true" />
          Repositories
          <span className="ml-1 px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-xs border border-violet-500/20">
            {totalCount}
          </span>
          {sorted.length !== repos.length && (
            <span className="px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 text-xs border border-white/10">
              {sorted.length} shown
            </span>
          )}
        </h2>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <SlidersHorizontal size={12} aria-hidden="true" />
            {activeFilters > 0 && (
              <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </div>

          {/* Language filter */}
          {languages.length > 0 && (
            <div className="relative flex items-center">
              {langFilter !== 'all' && (
                <span
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full pointer-events-none"
                  style={{ background: getLanguageColor(langFilter) }}
                  aria-hidden="true"
                />
              )}
              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className={`text-xs py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer ${langFilter !== 'all' ? 'pl-6 pr-2.5' : 'px-2.5'}`}
                aria-label="Filter by language"
              >
                <option value="all">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}

          {/* Type Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
            aria-label="Filter repositories"
          >
            <option value="all">All Types</option>
            <option value="source">Source</option>
            <option value="forked">Forked</option>
            <option value="archived">Archived</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
            aria-label="Sort repositories"
          >
            <option value="stars">Most Stars</option>
            <option value="forks">Most Forks</option>
            <option value="updated">Recently Updated</option>
            <option value="name">Name (A-Z)</option>
          </select>

          {/* Clear filters */}
          {activeFilters > 0 && (
            <button
              onClick={() => { setFilter('all'); setLangFilter('all'); }}
              className="text-xs px-2 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-colors"
              aria-label="Clear filters"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Language pills summary */}
      {langFilter === 'all' && languages.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {languages.slice(0, 10).map(lang => (
            <button
              key={lang}
              onClick={() => setLangFilter(lang)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 hover:border-white/25 hover:text-white transition-all"
            >
              <Circle size={8} style={{ fill: getLanguageColor(lang), color: getLanguageColor(lang) }} />
              {lang}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No repositories match the current filters.
          <button
            onClick={() => { setFilter('all'); setLangFilter('all'); }}
            className="block mx-auto mt-2 text-violet-400 hover:text-violet-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-fadeIn">
          {sorted.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8" role="navigation" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
