import React, { useState } from 'react';
import {
  MapPin, Link2, X, Building2, Mail, ExternalLink,
  Users, GitFork, Star, BookOpen, Copy, Check, Bookmark
} from 'lucide-react';
import type { GitHubUser } from '../types/github';
import { useBookmarks } from '../context/BookmarksContext';

interface UserProfileProps {
  user: GitHubUser;
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-200 group">
      <span className="text-slate-400 group-hover:text-violet-400 transition-colors">{icon}</span>
      <span className="text-lg font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

export default function UserProfile({ user }: UserProfileProps) {
  const [copied, setCopied] = useState(false);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const bookmarked = isBookmarked(user.login);

  const copyProfileUrl = async () => {
    await navigator.clipboard.writeText(user.html_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(user.login);
    } else {
      addBookmark({
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name,
        public_repos: user.public_repos,
        followers: user.followers,
      });
    }
  };

  const joinYear = new Date(user.created_at).getFullYear();

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Main Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
        {/* Decorative gradient blob */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={user.avatar_url}
                alt={`${user.login}'s avatar`}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-2 ring-white/10 object-cover"
              />
              <div className="absolute inset-0 rounded-2xl ring-2 ring-violet-500/30" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white truncate">
                  {user.name ?? user.login}
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">@{user.login}</p>
                {user.bio && (
                  <p className="text-slate-300 text-sm mt-2 leading-relaxed max-w-xl">{user.bio}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-shrink-0">
                {/* Bookmark */}
                <button
                  onClick={toggleBookmark}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    bookmarked
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 hover:bg-violet-500/30'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                  aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark profile'}
                >
                  <Bookmark size={14} className={bookmarked ? 'fill-violet-400 text-violet-400' : ''} />
                  {bookmarked ? 'Saved' : 'Save'}
                </button>

                {/* Copy URL */}
                <button
                  onClick={copyProfileUrl}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-xs font-medium"
                  aria-label="Copy profile URL"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>

                {/* GitHub link */}
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-violet-500/20"
                  aria-label="View GitHub profile"
                >
                  <ExternalLink size={14} />
                  GitHub
                </a>
              </div>
            </div>

            {/* Meta details */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {user.company && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Building2 size={13} /> {user.company}
                </span>
              )}
              {user.location && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin size={13} /> {user.location}
                </span>
              )}
              {user.email && (
                <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-400 transition-colors">
                  <Mail size={13} /> {user.email}
                </a>
              )}
              {user.blog && (
                <a
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-400 transition-colors"
                >
                  <Link2 size={13} /> {user.blog.replace(/^https?:\/\//, '')}
                </a>
              )}
              {user.twitter_username && (
                <a
                  href={`https://twitter.com/${user.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X size={13} /> @{user.twitter_username}
                </a>
              )}
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                Member since {joinYear}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<BookOpen size={16} />} label="Repositories" value={user.public_repos} />
        <StatCard icon={<Users size={16} />} label="Followers" value={user.followers} />
        <StatCard icon={<GitFork size={16} />} label="Following" value={user.following} />
        <StatCard icon={<Star size={16} />} label="Gists" value={user.public_gists} />
      </div>
    </div>
  );
}
