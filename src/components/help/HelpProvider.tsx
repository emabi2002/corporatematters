'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import {
  getArticleById,
  getArticleForRoute,
  HELP_ROLES,
  type HelpArticle,
  type HelpRole,
} from '@/help/help-content';
import { useAuth } from '@/contexts/AuthContext';
import { useGuidedTour } from './GuidedTour';

type HelpView = 'home' | 'article';

const ROLE_KEY = 'corporate_help_role';
const RECENT_KEY = 'corporate_help_recent';
const FAV_KEY = 'corporate_help_favourites';
const RECENT_LIMIT = 6;

interface HelpContextValue {
  isOpen: boolean;
  view: HelpView;
  /** Article shown in the drawer (route-based or user-selected). */
  activeArticle: HelpArticle | null;
  /** Article matching the current page route (null if unknown). */
  routeArticle: HelpArticle | null;
  role: HelpRole | 'all';
  recentIds: string[];
  favouriteIds: string[];
  openHelp: (articleId?: string) => void;
  closeHelp: () => void;
  showArticle: (articleId: string) => void;
  showHome: () => void;
  setRole: (role: HelpRole | 'all') => void;
  startTour: (tourId: string) => void;
  toggleFavourite: (articleId: string) => void;
  isFavourite: (articleId: string) => boolean;
  recordView: (articleId: string) => void;
}

const HelpContext = createContext<HelpContextValue | undefined>(undefined);

function readList(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { startTour: runTour } = useGuidedTour();
  const { profile } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<HelpView>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [role, setRoleState] = useState<HelpRole | 'all'>('all');
  const [roleExplicit, setRoleExplicit] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);

  // Load persisted preferences once on mount.
  useEffect(() => {
    const savedRole = (typeof window !== 'undefined'
      ? (window.localStorage.getItem(ROLE_KEY) as HelpRole | 'all' | null)
      : null);
    if (savedRole) {
      setRoleState(savedRole);
      setRoleExplicit(true);
    }
    setRecentIds(readList(RECENT_KEY));
    setFavouriteIds(readList(FAV_KEY));
  }, []);

  // Until the user explicitly picks a role, auto-select the signed-in user's
  // role so help is filtered to what is relevant to them.
  useEffect(() => {
    if (roleExplicit) return;
    const r = profile?.role as HelpRole | undefined;
    if (r && (HELP_ROLES as string[]).includes(r)) {
      setRoleState(r);
    }
  }, [profile, roleExplicit]);

  const setRole = useCallback((next: HelpRole | 'all') => {
    setRoleState(next);
    setRoleExplicit(true);
    if (typeof window !== 'undefined') window.localStorage.setItem(ROLE_KEY, next);
  }, []);

  const routeArticle = useMemo(() => getArticleForRoute(pathname), [pathname]);

  const activeArticle = useMemo(() => {
    if (view === 'article') return getArticleById(selectedId) ?? routeArticle;
    return routeArticle;
  }, [view, selectedId, routeArticle]);

  const recordView = useCallback((articleId: string) => {
    if (!getArticleById(articleId)) return;
    setRecentIds((prev) => {
      const next = [articleId, ...prev.filter((id) => id !== articleId)].slice(0, RECENT_LIMIT);
      if (typeof window !== 'undefined') window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const openHelp = useCallback(
    (articleId?: string) => {
      if (articleId) {
        setSelectedId(articleId);
        setView('article');
        recordView(articleId);
      } else if (routeArticle) {
        setSelectedId(routeArticle.id);
        setView('article');
        recordView(routeArticle.id);
      } else {
        setSelectedId(null);
        setView('home');
      }
      setIsOpen(true);
    },
    [routeArticle, recordView],
  );

  const closeHelp = useCallback(() => setIsOpen(false), []);

  const showArticle = useCallback(
    (articleId: string) => {
      setSelectedId(articleId);
      setView('article');
      recordView(articleId);
    },
    [recordView],
  );

  const showHome = useCallback(() => {
    setSelectedId(null);
    setView('home');
  }, []);

  const startTour = useCallback(
    (tourId: string) => {
      setIsOpen(false); // close the drawer so highlights are visible
      window.setTimeout(() => runTour(tourId), 300);
    },
    [runTour],
  );

  const toggleFavourite = useCallback((articleId: string) => {
    setFavouriteIds((prev) => {
      const next = prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [articleId, ...prev];
      if (typeof window !== 'undefined') window.localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavourite = useCallback(
    (articleId: string) => favouriteIds.includes(articleId),
    [favouriteIds],
  );

  // Global shortcut: "?" (Shift+/) or F1 toggles contextual help for the page.
  // Ignored while typing in a field so it never blocks normal input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      const typing =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        Boolean(el?.isContentEditable);
      if (typing) return;
      const isHelpKey =
        e.key === 'F1' || (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey);
      if (!isHelpKey) return;
      e.preventDefault();
      if (isOpen) closeHelp();
      else openHelp();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, openHelp, closeHelp]);

  const value = useMemo<HelpContextValue>(
    () => ({
      isOpen,
      view,
      activeArticle,
      routeArticle,
      role,
      recentIds,
      favouriteIds,
      openHelp,
      closeHelp,
      showArticle,
      showHome,
      setRole,
      startTour,
      toggleFavourite,
      isFavourite,
      recordView,
    }),
    [
      isOpen,
      view,
      activeArticle,
      routeArticle,
      role,
      recentIds,
      favouriteIds,
      openHelp,
      closeHelp,
      showArticle,
      showHome,
      setRole,
      startTour,
      toggleFavourite,
      isFavourite,
      recordView,
    ],
  );

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

export function useHelp() {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error('useHelp must be used within a HelpProvider');
  return ctx;
}
