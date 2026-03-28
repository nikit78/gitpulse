import {
  useState, useRef, useEffect, useCallback,
  type KeyboardEvent, type FormEvent,
} from 'react';
import { Search, Key, X, Clock, User, Building2 } from 'lucide-react';
import { searchUsers, saveToken, getStoredToken } from '../services/githubApi';
import type { GitHubUserSuggestion } from '../types/github';
import useDebounce from '../hooks/useDebounce';

const RECENT_KEY = 'gitpulse-recent';
const MAX_RECENT = 6;

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); }
  catch { return []; }
}
function saveRecent(username: string) {
  const prev = loadRecent().filter(u => u !== username);
  localStorage.setItem(RECENT_KEY, JSON.stringify([username, ...prev].slice(0, MAX_RECENT)));
}
function clearRecent() { localStorage.removeItem(RECENT_KEY); }

interface SearchBarProps {
  onSearch: (username: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState(() => getStoredToken() ?? '');
  const [showToken, setShowToken] = useState(false);
  const [suggestions, setSuggestions] = useState<GitHubUserSuggestion[]>([]);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [isFetching, setIsFetching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(username, 280);

  // Ctrl+K / Cmd+K global shortcut to focus search
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 1) {
      setSuggestions([]);
      setIsFetching(false);
      return;
    }
    let cancelled = false;
    setIsFetching(true);
    searchUsers(debouncedQuery, token)
      .then(items => {
        if (!cancelled) { setSuggestions(items); setIsFetching(false); }
      })
      .catch(() => {
        if (!cancelled) { setSuggestions([]); setIsFetching(false); }
      });
    return () => { cancelled = true; };
  }, [debouncedQuery, token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dropdownItems: Array<{ label: string; sub?: string; avatar?: string; type: 'suggestion' | 'recent' }> =
    username.trim().length > 0
      ? suggestions.map(s => ({ label: s.login, avatar: s.avatar_url, sub: s.type, type: 'suggestion' as const }))
      : recent.map(r => ({ label: r, type: 'recent' as const }));

  const doSearch = useCallback((value: string) => {
    const q = value.trim();
    if (!q) return;
    saveToken(token);
    saveRecent(q);
    setRecent(loadRecent());
    setOpen(false);
    setActiveIdx(-1);
    onSearch(q);
  }, [token, onSearch]);

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); doSearch(username); };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' && dropdownItems.length > 0) { setOpen(true); setActiveIdx(0); e.preventDefault(); }
      if (e.key === 'Enter') doSearch(username);
      return;
    }
    if (e.key === 'ArrowDown') { setActiveIdx(i => Math.min(i + 1, dropdownItems.length - 1)); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { setActiveIdx(i => Math.max(i - 1, -1)); e.preventDefault(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && dropdownItems[activeIdx]) {
        const item = dropdownItems[activeIdx];
        setUsername(item.label);
        doSearch(item.label);
      } else {
        doSearch(username);
      }
    } else if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1); }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim() || text.toLowerCase().indexOf(query.toLowerCase()) === -1) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-violet-500/30 text-violet-200 rounded">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3" aria-label="GitHub user search">
      {/* Main search row */}
      <div ref={containerRef} className="relative flex items-center gap-3">
        <div className="relative flex-1">
          {/* Search icon */}
          <Search
            size={18}
            className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${open ? 'text-violet-400' : 'text-slate-400'}`}
            aria-hidden="true"
          />

          {/* Input */}
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value); setOpen(true); setActiveIdx(-1); }}
            onFocus={() => { setRecent(loadRecent()); setOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder="Search GitHub username…"
            autoComplete="off"
            spellCheck={false}
            disabled={isLoading}
            aria-label="GitHub username"
            aria-autocomplete="list"
            aria-expanded={open && dropdownItems.length > 0}
            aria-haspopup="listbox"
            className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-sm disabled:opacity-60"
          />

          {/* Kbd hint */}
          {!username && !open && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-slate-600 font-mono pointer-events-none select-none">
              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">Ctrl</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">K</kbd>
            </span>
          )}

          {/* Clear button */}
          {username && (
            <button
              type="button"
              onClick={() => { setUsername(''); setSuggestions([]); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Clear"
            >
              <X size={15} />
            </button>
          )}

          {/* ── Dropdown ── */}
          {open && dropdownItems.length > 0 && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-slate-900 border border-white/10 shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fadeIn"
            >
              {/* Recent header */}
              {username.trim() === '' && recent.length > 0 && (
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Recent Searches</span>
                  <button
                    type="button"
                    onClick={() => { clearRecent(); setRecent([]); }}
                    className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Fetching spinner */}
              {isFetching && username.trim() && (
                <div className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-500">
                  <span className="w-3 h-3 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                  Searching…
                </div>
              )}

              {/* Items */}
              {dropdownItems.map((item, idx) => (
                <button
                  key={item.label}
                  type="button"
                  role="option"
                  aria-selected={idx === activeIdx}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => { setUsername(item.label); doSearch(item.label); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors text-sm ${
                    idx === activeIdx ? 'bg-violet-600/20 text-white' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {item.type === 'recent' ? (
                    <Clock size={14} className="text-slate-500 flex-shrink-0" />
                  ) : item.avatar ? (
                    <img src={item.avatar} alt="" className="w-6 h-6 rounded-full flex-shrink-0" />
                  ) : (
                    <User size={14} className="text-slate-500 flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate font-medium">
                    {item.type === 'suggestion'
                      ? highlightMatch(item.label, username)
                      : item.label}
                  </span>
                  {item.sub && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 flex-shrink-0">
                      {item.sub === 'Organization' && <Building2 size={10} />}
                      {item.sub}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!username.trim() || isLoading}
          id="search-submit"
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-95 whitespace-nowrap"
          aria-label="Search"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Searching…
            </span>
          ) : 'Search'}
        </button>
      </div>

      {/* Token toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowToken(s => !s)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          aria-expanded={showToken}
          aria-controls="token-input"
        >
          <Key size={12} />
          {showToken ? 'Hide token' : 'Add GitHub Token'} (optional · higher rate limits)
        </button>
      </div>

      {showToken && (
        <div id="token-input">
          <input
            type="password"
            value={token}
            onChange={e => { setToken(e.target.value); saveToken(e.target.value); }}
            placeholder="ghp_your_personal_access_token"
            aria-label="GitHub personal access token"
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-xs font-mono"
          />
          <p className="mt-1 text-xs text-slate-600">Token is saved locally in your browser only — never sent to any server.</p>
        </div>
      )}
    </form>
  );
}