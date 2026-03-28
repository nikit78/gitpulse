import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { BookmarkedUser } from '../types/github';

interface BookmarksContextValue {
  bookmarks: BookmarkedUser[];
  addBookmark: (user: BookmarkedUser) => void;
  removeBookmark: (login: string) => void;
  isBookmarked: (login: string) => boolean;
}

const BookmarksContext = createContext<BookmarksContextValue>({
  bookmarks: [],
  addBookmark: () => {},
  removeBookmark: () => {},
  isBookmarked: () => false,
});

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkedUser[]>(() => {
    try {
      const saved = localStorage.getItem('gitpulse-bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('gitpulse-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (user: BookmarkedUser) =>
    setBookmarks(prev =>
      prev.find(b => b.login === user.login)
        ? prev
        : [user, ...prev].slice(0, 20)
    );

  const removeBookmark = (login: string) =>
    setBookmarks(prev => prev.filter(b => b.login !== login));

  const isBookmarked = (login: string) => bookmarks.some(b => b.login === login);

  return (
    <BookmarksContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export const useBookmarks = () => useContext(BookmarksContext);
