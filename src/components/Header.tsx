import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Moon, Sun, Zap, Bookmark, X, Users, BookOpen, ArrowLeftRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useBookmarks } from '../context/BookmarksContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { bookmarks, removeBookmark } = useBookmarks();
  const [showBookmarks, setShowBookmarks] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Close bookmarks panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setShowBookmarks(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          onClick={e => { e.preventDefault(); navigate('/'); }}
          className="flex items-center gap-2.5 group"
          aria-label="GitPulse Home"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
            <Zap size={15} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            Git<span className="text-violet-400">Pulse</span>
          </span>
        </a>

        {/* Actions */}
        <div className="flex items-center gap-1 relative">
          {/* Bookmarks button */}
          <div className="relative">
            <button
              ref={btnRef}
              onClick={() => setShowBookmarks(s => !s)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label={`Bookmarks (${bookmarks.length})`}
            >
              <Bookmark size={18} />
              {bookmarks.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {bookmarks.length > 9 ? '9+' : bookmarks.length}
                </span>
              )}
            </button>

            {/* Bookmarks panel */}
            {showBookmarks && (
              <div
                ref={panelRef}
                className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-slate-900 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fadeIn"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <Bookmark size={14} className="text-violet-400" />
                    Saved Profiles
                  </span>
                  <button
                    onClick={() => setShowBookmarks(false)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label="Close bookmarks"
                  >
                    <X size={14} />
                  </button>
                </div>

                {bookmarks.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-500 text-sm">
                    <Bookmark size={28} className="mx-auto mb-2 opacity-30" />
                    No saved profiles yet.<br />
                    <span className="text-xs">Click ★ on any profile to save it.</span>
                  </div>
                ) : (
                  <ul className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {bookmarks.map(bm => (
                      <li key={bm.login} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group">
                        <button
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                          onClick={() => { navigate(`/user/${bm.login}`); setShowBookmarks(false); }}
                        >
                          <img src={bm.avatar_url} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{bm.name ?? bm.login}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <span className="flex items-center gap-1"><BookOpen size={10} />{bm.public_repos} repos</span>
                              <span className="flex items-center gap-1"><Users size={10} />{bm.followers?.toLocaleString()}</span>
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => removeBookmark(bm.login)}
                          className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                          aria-label={`Remove ${bm.login}`}
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Compare link */}
          <button
            onClick={() => navigate('/compare')}
            className="hidden sm:flex items-center gap-1.5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Compare profiles"
            title="Compare two GitHub profiles"
          >
            <ArrowLeftRight size={17} />
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Visit GitHub"
          >
            <Code2 size={18} />
          </a>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
