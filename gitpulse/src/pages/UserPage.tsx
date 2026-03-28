import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import UserProfile from '../components/UserProfile';
import RepoGrid from '../components/RepoGrid';
import Charts from '../components/Charts';
import ActivityHeatmap from '../components/ActivityHeatmap';
import ErrorState from '../components/ErrorState';
import { UserProfileSkeleton, RepoGridSkeleton, ChartSkeleton } from '../components/SkeletonLoaders';
import { fetchUser, fetchRepos } from '../services/githubApi';
import type { GitHubUser, GitHubRepo, APIError } from '../types/github';

const PER_PAGE = 30;
type PageState = 'loading-profile' | 'loading-repos' | 'ready' | 'error';

export default function UserPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>('loading-profile');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [error, setError] = useState<APIError | null>(null);
  const [page, setPage] = useState(1);

  const loadProfile = useCallback(async (uname: string, pg: number) => {
    setError(null);

    if (pg === 1) {
      setUser(null);
      setRepos([]);
      setPage(1);
      setPageState('loading-profile');
      document.title = `${uname} — GitPulse`;

      try {
        const userData = await fetchUser(uname);
        setUser(userData);
        document.title = `${userData.name ?? userData.login} — GitPulse`;
        setPageState('loading-repos');

        const repoData = await fetchRepos(uname, undefined, 1, PER_PAGE);
        setRepos(repoData);
        setPageState('ready');
      } catch (e) {
        setError(e as APIError);
        setPageState('error');
        document.title = 'GitPulse';
      }
    } else {
      setPageState('loading-repos');
      try {
        const repoData = await fetchRepos(uname, undefined, pg, PER_PAGE);
        setRepos(repoData);
        setPageState('ready');
      } catch (e) {
        setError(e as APIError);
        setPageState('error');
      }
    }
  }, []);

  useEffect(() => {
    if (username) loadProfile(username, 1);
    return () => { document.title = 'GitPulse — GitHub Profile Analytics'; };
  }, [username, loadProfile]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    if (username) loadProfile(username, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [username, loadProfile]);

  const handleSearch = (newUsername: string) => {
    navigate(`/user/${encodeURIComponent(newUsername.trim())}`);
  };

  const handleRetry = () => {
    if (username) loadProfile(username, page);
  };

  const isLoadingProfile = pageState === 'loading-profile';
  const isLoadingRepos = pageState === 'loading-repos';

  return (
    <main className="min-h-screen">
      {/* Compact top search bar */}
      <div className="border-b border-white/5 bg-slate-950/60 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar onSearch={handleSearch} isLoading={isLoadingProfile} />
        </div>
      </div>

      {/* Results */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error */}
        {pageState === 'error' && error && (
          <ErrorState error={error} onRetry={handleRetry} />
        )}

        {/* Profile */}
        {isLoadingProfile ? (
          <UserProfileSkeleton />
        ) : user ? (
          <UserProfile user={user} />
        ) : null}

        {/* Heatmap */}
        {!isLoadingProfile && repos.length > 0 && (
          <ActivityHeatmap repos={repos} />
        )}

        {/* Charts skeleton / loaded */}
        {(pageState === 'loading-repos' || pageState === 'ready') && (
          isLoadingRepos && repos.length === 0 ? (
            <ChartSkeleton />
          ) : repos.length > 0 ? (
            <Charts repos={repos} />
          ) : null
        )}

        {/* Repos */}
        {isLoadingProfile || (isLoadingRepos && repos.length === 0) ? (
          <RepoGridSkeleton />
        ) : user && (pageState === 'ready' || isLoadingRepos) ? (
          <RepoGrid
            repos={repos}
            totalCount={user.public_repos}
            page={page}
            perPage={PER_PAGE}
            onPageChange={handlePageChange}
          />
        ) : null}
      </section>
    </main>
  );
}
