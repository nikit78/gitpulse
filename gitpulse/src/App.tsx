import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BookmarksProvider } from './context/BookmarksContext';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';

const UserPage    = lazy(() => import('./pages/UserPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BookmarksProvider>
        <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-white">
          <Header />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"                element={<Dashboard />} />
              <Route path="/user/:username"  element={<UserPage />} />
              <Route path="/compare"         element={<ComparePage />} />
            </Routes>
          </Suspense>
        </div>
      </BookmarksProvider>
    </ThemeProvider>
  );
}

export default App;