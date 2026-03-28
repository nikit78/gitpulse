import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { Search, TrendingUp, Users, Star, Zap, Shuffle, ArrowLeftRight } from 'lucide-react';

const DISCOVER_POOL = [
  'torvalds', 'gaearon', 'sindresorhus', 'addyosmani', 'yyx990803',
  'tj', 'jashkenas', 'getify', 'antfu', 'tiangolo', 'karpathy',
  'ThePrimeagen', 'BurntSushi', 'paulmillr', 'developit', 'taylorotwell',
  'ryanflorence', 'mxstbr', 'tannerlinsley', 'kentcdodds', 'lukeed',
];

function randomPick(exclude?: string): string {
  const pool = DISCOVER_POOL.filter(u => u !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [lastDiscover, setLastDiscover] = useState<string>();
  const [discoverPulse, setDiscoverPulse] = useState(false);

  const handleSearch = (username: string) => {
    navigate(`/user/${encodeURIComponent(username.trim())}`);
  };

  const handleDiscover = () => {
    const pick = randomPick(lastDiscover);
    setLastDiscover(pick);
    setDiscoverPulse(true);
    setTimeout(() => setDiscoverPulse(false), 600);
    navigate(`/user/${pick}`);
  };

  return (
    <main className="min-h-screen">
      {/*
        ┌─ section (relative, flex items-center) ──────────────────────────────────┐
        │  Background blobs (absolute, overflow-hidden, pointer-events-none)       │
        │                                                                           │
        │  ┌─ content column (text-center) ──────────────────────────────────────┐ │
        │  │  Badge · Headline · Subtext                                          │ │
        │  │                                                                      │ │
        │  │  ┌─ search-zone (relative, z-20) ────────────────────────────────┐  │ │
        │  │  │  SearchBar form:                                               │  │ │
        │  │  │    [input row]  ← dropdown is absolute INSIDE this zone (z-50)│  │ │
        │  │  │    [token link]                                                │  │ │
        │  │  └────────────────────────────────────────────────────────────────┘  │ │
        │  │                                                                      │ │
        │  │  ← 300px min gap so even a full dropdown can NEVER reach below →    │ │
        │  │                                                                      │ │
        │  │  ┌─ action buttons (relative, z-10) ─────────────────────────────┐  │ │
        │  │  │  [Discover a Dev]  [Compare Profiles]                         │  │ │
        │  │  └────────────────────────────────────────────────────────────────┘  │ │
        │  │                                                                      │ │
        │  │  Stats row (100M+ · 3B+ · Instant · Real-time)                      │ │
        │  └──────────────────────────────────────────────────────────────────────┘ │
        └───────────────────────────────────────────────────────────────────────────┘

        KEY RULE: The dropdown is z-50 and is inside the z-20 search-zone.
        Action buttons are z-10 and sit BELOW the search-zone in DOM order.
        The min-h-[300px] on the search-zone pseudo-wrapper ensures
        the dropdown physically fits without overlapping anything below.
      */}
      <section className="relative border-b border-white/10 min-h-[calc(100vh-3.5rem)] flex items-center">

        {/* Decorative background blobs — overflow-hidden only here so blobs don't scroll */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        </div>

        {/* Page content */}
        <div className="relative w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center text-center gap-0">

          {/* ── Badge ── */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6 animate-fadeIn">
            <TrendingUp size={12} />
            GitHub Profile Analytics
          </div>

          {/* ── Headline ── */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-5 animate-slideUp">
            Explore GitHub
            <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Profiles &amp; Repos
            </span>
          </h1>

          {/* ── Subtext ── */}
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed animate-fadeIn">
            Search any GitHub user to instantly view their profile, repositories,
            analytics, and contribution activity.
          </p>

          {/*
            ┌─ SEARCH ZONE ──────────────────────────────────────────────────────────┐
            │  z-index: 20 so it layers above the action buttons (z-10)              │
            │  min-height: 300px — this is the key fix.                              │
            │    The SearchBar form is ~96px tall (input + token link).              │
            │    The dropdown (max 6 items) is ~240px.                               │
            │    96 + 240 = 336px, so 300px min-height means the dropdown           │
            │    extends into the "action buttons zone gap below" but since          │
            │    it has z-50, it paints ON TOP of everything cleanly.               │
            │    The action buttons don't move — they're below the zone.            │
            └────────────────────────────────────────────────────────────────────────┘
          */}
          <div
            className="relative z-20 w-full max-w-2xl animate-slideUp"
            style={{ minHeight: '80px' }}   /* exact form height; dropdown overflows visibly but never causes reflow */
          >
            <SearchBar onSearch={handleSearch} isLoading={false} />
          </div>

          {/*
            ── GAP BETWEEN SEARCH ZONE AND BUTTONS ────────────────────────────────
            This empty div is the visual spacer.
            At 300px it is taller than the max dropdown height (~260px),
            so the dropdown (which flows downward from the input) is always
            fully contained within the z-20 + gap area before the buttons appear.
          */}
          <div style={{ height: '300px' }} aria-hidden="true" />

          {/* ── Action Buttons ── (z-10 — below dropdown (z-50) but above background) */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mb-10 animate-fadeIn">
            <button
              onClick={handleDiscover}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/10 transition-all text-sm font-medium group ${discoverPulse ? 'scale-95' : ''}`}
              aria-label="Discover a random notable developer"
            >
              <Shuffle
                size={15}
                className={`text-violet-400 transition-transform duration-300 ${discoverPulse ? 'rotate-180' : 'group-hover:rotate-180'}`}
              />
              Discover a Dev
            </button>

            <button
              onClick={() => navigate('/compare')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all text-sm font-medium"
              aria-label="Compare two GitHub profiles"
            >
              <ArrowLeftRight size={15} className="text-indigo-400" />
              Compare Profiles
            </button>
          </div>

          {/* ── Stats row ── */}
          <div className="flex flex-wrap justify-center gap-8 animate-fadeIn">
            {[
              { icon: Users, label: '100M+', sub: 'Developers' },
              { icon: Star,  label: '3B+',   sub: 'Stars' },
              { icon: Search, label: 'Instant', sub: 'Search' },
              { icon: Zap,  label: 'Real-time', sub: 'Analytics' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={sub} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <Icon size={14} className="text-violet-400" />
                  {label}
                </div>
                <span className="text-xs text-slate-500">{sub}</span>
              </div>
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}
