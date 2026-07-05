'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getArticle, getArticleForRoute, getTour } from '@/help/help-content';
import type { HelpArticle, HelpTour } from '@/help/help-types';

type Feedback = Record<string, 'up' | 'down'>;

interface HelpContextValue {
  // Drawer
  open: boolean;
  openHelp: (articleId?: string) => void;
  closeHelp: () => void;
  toggleHelp: () => void;
  /** Article currently shown in the drawer (explicit override or route-based). */
  activeArticle: HelpArticle | undefined;
  /** Explicitly show a specific article in the drawer. */
  showArticle: (articleId: string) => void;

  // Tours
  activeTour: HelpTour | undefined;
  tourRunning: boolean;
  startTour: (tourId: string) => void;
  stopTour: () => void;

  // Recents & favourites
  recent: string[];
  favourites: string[];
  isFavourite: (id: string) => boolean;
  toggleFavourite: (id: string) => void;
  markViewed: (id: string) => void;

  // Feedback
  feedback: Feedback;
  submitFeedback: (id: string, helpful: boolean) => void;
}

const HelpContext = createContext<HelpContextValue | undefined>(undefined);

const RECENT_KEY = 'corporate_help_recent';
const FAV_KEY = 'corporate_help_favourites';
const FEEDBACK_KEY = 'corporate_help_feedback';
// Lets a tour survive a route change + AppLayout remount (see startTour).
const PENDING_TOUR_KEY = 'corporate_help_pending_tour';
// Keeps the drawer open as the user moves between module pages.
const DRAWER_OPEN_KEY = 'corporate_help_drawer_open';
const MAX_RECENT = 8;

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [tourId, setTourId] = useState<string | null>(null);
  const [tourRunning, setTourRunning] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback>({});
  // Guards the drawer-open persistence so it never overwrites the restored
  // value before hydration has run.
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted state
  useEffect(() => {
    setRecent(readList(RECENT_KEY));
    setFavourites(readList(FAV_KEY));
    try {
      const raw = localStorage.getItem(FEEDBACK_KEY);
      if (raw) setFeedback(JSON.parse(raw) as Feedback);
    } catch {
      /* ignore */
    }
    // Restore the drawer's open state so it stays open across navigation.
    try {
      if (sessionStorage.getItem(DRAWER_OPEN_KEY) === 'true') setOpen(true);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persist the drawer's open state (after hydration to avoid clobbering it).
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(DRAWER_OPEN_KEY, String(open));
    } catch {
      /* ignore */
    }
  }, [open, hydrated]);

  // Resume a tour that was launched from a different route. Because AppLayout
  // (and this provider) remount on navigation, a cross-route tour is handed off
  // via sessionStorage in startTour and picked up here after the new page mounts.
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(PENDING_TOUR_KEY);
      if (pending && getTour(pending)) {
        sessionStorage.removeItem(PENDING_TOUR_KEY);
        setTourId(pending);
        setTourRunning(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // The article shown in the drawer: explicit override wins, else route-based.
  const activeArticle = useMemo(() => {
    if (overrideId) return getArticle(overrideId);
    return getArticleForRoute(pathname);
  }, [overrideId, pathname]);

  const activeTour = useMemo(() => (tourId ? getTour(tourId) : undefined), [tourId]);

  const markViewed = useCallback((id: string) => {
    if (!id) return;
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const openHelp = useCallback(
    (articleId?: string) => {
      setOverrideId(articleId ?? null);
      setOpen(true);
      if (articleId) markViewed(articleId);
    },
    [markViewed]
  );

  const showArticle = useCallback(
    (articleId: string) => {
      setOverrideId(articleId);
      setOpen(true);
      markViewed(articleId);
    },
    [markViewed]
  );

  const closeHelp = useCallback(() => setOpen(false), []);
  const toggleHelp = useCallback(() => setOpen((o) => !o), []);

  const startTour = useCallback(
    (id: string) => {
      const tour = getTour(id);
      setOpen(false);
      const needsNav =
        !!tour?.route && !tour.route.includes('[') && pathname !== tour.route;
      if (needsNav) {
        // Navigate first; the tour resumes after the destination page mounts.
        try {
          sessionStorage.setItem(PENDING_TOUR_KEY, id);
        } catch {
          /* ignore */
        }
        router.push(tour!.route!);
      } else {
        // Same page — start immediately.
        setTourId(id);
        setTourRunning(true);
      }
    },
    [pathname, router]
  );

  const stopTour = useCallback(() => {
    setTourRunning(false);
    setTourId(null);
  }, []);

  const isFavourite = useCallback((id: string) => favourites.includes(id), [favourites]);

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const submitFeedback = useCallback((id: string, helpful: boolean) => {
    setFeedback((prev) => {
      const next = { ...prev, [id]: helpful ? ('up' as const) : ('down' as const) };
      try {
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // ---- Global keyboard shortcuts -------------------------------------------
  useEffect(() => {
    let lastG = 0;
    const isTyping = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        node.isContentEditable
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;

      // "?" opens the help drawer
      if (e.key === '?') {
        e.preventDefault();
        toggleHelp();
        return;
      }
      // "/" focuses the global search
      if (e.key === '/') {
        const input = document.querySelector<HTMLInputElement>(
          '[data-tour="header-search"] input'
        );
        if (input) {
          e.preventDefault();
          input.focus();
        }
        return;
      }
      // "g" then d/m/n/h navigation
      const now = Date.now();
      if (e.key.toLowerCase() === 'g') {
        lastG = now;
        return;
      }
      if (now - lastG < 800) {
        const routes: Record<string, string> = {
          d: '/dashboard',
          m: '/matters',
          n: '/notifications',
          h: '/help',
        };
        const dest = routes[e.key.toLowerCase()];
        if (dest) {
          e.preventDefault();
          router.push(dest);
          lastG = 0;
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleHelp, router]);

  const value: HelpContextValue = {
    open,
    openHelp,
    closeHelp,
    toggleHelp,
    activeArticle,
    showArticle,
    activeTour,
    tourRunning,
    startTour,
    stopTour,
    recent,
    favourites,
    isFavourite,
    toggleFavourite,
    markViewed,
    feedback,
    submitFeedback,
  };

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

export function useHelp() {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error('useHelp must be used within a HelpProvider');
  return ctx;
}
