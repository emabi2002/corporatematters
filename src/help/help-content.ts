// ============================================================================
// DLPP Corporate Matters - Help & Training Centre : Content Aggregator
// ----------------------------------------------------------------------------
// Single import surface for the whole Help system. Re-exports articles, tours
// and tooltips, and adds categories, role config, route mapping, quick-start,
// keyboard shortcuts, a global FAQ and all lookup/search helpers.
// ============================================================================

import type {
  AppRole,
  AudienceMeta,
  HelpArticle,
  HelpAudience,
  HelpCategory,
  HelpFAQ,
  HelpTour,
  KeyboardShortcut,
  QuickStartStep,
} from './help-types';
import { HELP_ARTICLES } from './help-articles';
import { HELP_TOURS } from './help-tours';
import { HELP_TOOLTIPS, getTooltip } from './help-tooltips';

export { HELP_ARTICLES, HELP_TOURS, HELP_TOOLTIPS, getTooltip };
export type {
  HelpArticle,
  HelpTour,
  HelpAudience,
  AppRole,
  HelpCategory,
  QuickStartStep,
  KeyboardShortcut,
};

// ----------------------------------------------------------------------------
// Categories
// ----------------------------------------------------------------------------

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Sign in, learn the interface and take your first tour.',
    icon: 'Rocket',
    accent: 'text-emerald-700 bg-emerald-50 ring-emerald-100',
  },
  {
    id: 'core',
    title: 'Everyday Basics',
    description: 'Dashboard, the Matter Register, timeline and audit trail.',
    icon: 'LayoutDashboard',
    accent: 'text-sky-700 bg-sky-50 ring-sky-100',
  },
  {
    id: 'workflow',
    title: 'Matter Workflow',
    description: 'Register, assign, complete details, review and close matters.',
    icon: 'Workflow',
    accent: 'text-teal-700 bg-teal-50 ring-teal-100',
  },
  {
    id: 'management',
    title: 'Documents, Tasks & Reports',
    description: 'Manage documents and tasks, notifications and analytics.',
    icon: 'FolderKanban',
    accent: 'text-amber-700 bg-amber-50 ring-amber-100',
  },
  {
    id: 'admin',
    title: 'Administration',
    description: 'Users, roles, permissions and reference data.',
    icon: 'Settings',
    accent: 'text-rose-700 bg-rose-50 ring-rose-100',
  },
];

export function getCategory(id: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find((c) => c.id === id);
}

// ----------------------------------------------------------------------------
// Roles ↔ audiences (role-based help)
// ----------------------------------------------------------------------------

export const AUDIENCE_META: AudienceMeta[] = [
  { id: 'all', label: 'Everyone', description: 'Applies to all users.' },
  { id: 'registry', label: 'Registry', description: 'Legal Secretary — registers and closes matters.' },
  { id: 'officer', label: 'Legal Officer', description: 'Works assigned matters end to end.' },
  { id: 'reviewer', label: 'Reviewer', description: 'Reviews and approves drafts.' },
  { id: 'manager', label: 'Manager', description: 'Assigns work and manages the team.' },
  { id: 'director', label: 'Director', description: 'Oversees policy & legal services.' },
  { id: 'executive', label: 'Executive', description: 'Deputy Secretary & Secretary.' },
  { id: 'admin', label: 'Administrator', description: 'System configuration and users.' },
];

/** Map each application role to the help audiences relevant to it. */
export const ROLE_TO_AUDIENCES: Record<AppRole, HelpAudience[]> = {
  legal_secretary: ['all', 'registry'],
  legal_officer_corporate: ['all', 'officer'],
  legal_officer_legislation: ['all', 'officer'],
  senior_legal_officer_corporate: ['all', 'officer', 'reviewer'],
  manager_legal_services: ['all', 'manager', 'reviewer', 'registry'],
  director_policy_legal: ['all', 'director', 'reviewer', 'manager'],
  deputy_secretary: ['all', 'executive'],
  secretary: ['all', 'executive'],
  system_administrator: ['all', 'admin', 'manager', 'reviewer', 'officer', 'registry', 'director', 'executive'],
};

export function audiencesForRole(role: string | null | undefined): HelpAudience[] {
  if (!role) return ['all'];
  return ROLE_TO_AUDIENCES[role as AppRole] ?? ['all'];
}

export function audienceLabel(id: HelpAudience): string {
  return AUDIENCE_META.find((a) => a.id === id)?.label ?? id;
}

/** Articles most relevant to a given role, "all" first, de-duplicated. */
export function getArticlesForRole(role: string | null | undefined): HelpArticle[] {
  const audiences = new Set(audiencesForRole(role));
  return HELP_ARTICLES.filter((a) => a.audiences.some((aud) => audiences.has(aud)));
}

// ----------------------------------------------------------------------------
// Lookups
// ----------------------------------------------------------------------------

export function getArticle(id: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.id === id);
}

export function getArticlesByCategory(categoryId: string): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === categoryId);
}

export function getTour(id: string): HelpTour | undefined {
  return HELP_TOURS.find((t) => t.id === id);
}

export function getRelatedArticles(article: HelpArticle | undefined): HelpArticle[] {
  if (!article?.relatedIds) return [];
  return article.relatedIds
    .map((id) => getArticle(id))
    .filter((a): a is HelpArticle => Boolean(a));
}

// ----------------------------------------------------------------------------
// Route mapping — pick the best article for the current pathname
// ----------------------------------------------------------------------------

interface RouteCandidate {
  route: string;
  articleId: string;
  segments: number;
  dynamic: number;
  regex: RegExp;
}

function buildRouteCandidates(): RouteCandidate[] {
  const candidates: RouteCandidate[] = [];
  for (const article of HELP_ARTICLES) {
    for (const route of article.routes ?? []) {
      const parts = route.split('/').filter(Boolean);
      const dynamic = parts.filter((p) => p.startsWith('[')).length;
      const pattern =
        '^/' +
        parts
          .map((p) => (p.startsWith('[') ? '[^/]+' : p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
          .join('/') +
        '/?$';
      candidates.push({
        route,
        articleId: article.id,
        segments: parts.length,
        dynamic,
        regex: new RegExp(pattern),
      });
    }
  }
  // Most specific first: more segments, then fewer dynamic segments.
  return candidates.sort((a, b) =>
    b.segments - a.segments || a.dynamic - b.dynamic
  );
}

const ROUTE_CANDIDATES = buildRouteCandidates();

/** Return the id of the best-matching article for a pathname, or undefined. */
export function getArticleIdForRoute(pathname: string | null | undefined): string | undefined {
  if (!pathname) return undefined;
  const clean = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  for (const c of ROUTE_CANDIDATES) {
    if (c.regex.test(clean)) return c.articleId;
  }
  return undefined;
}

/** Return the best-matching article for a pathname (falls back to Help home). */
export function getArticleForRoute(pathname: string | null | undefined): HelpArticle | undefined {
  const id = getArticleIdForRoute(pathname);
  return id ? getArticle(id) : getArticle('help-centre');
}

// ----------------------------------------------------------------------------
// Search
// ----------------------------------------------------------------------------

export interface SearchResult {
  article: HelpArticle;
  score: number;
}

/** Lightweight, instant, client-side search across all article content. */
export function searchArticles(query: string): HelpArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const results: SearchResult[] = [];
  for (const article of HELP_ARTICLES) {
    const haystacks: { text: string; weight: number }[] = [
      { text: article.title.toLowerCase(), weight: 6 },
      { text: article.summary.toLowerCase(), weight: 3 },
      { text: (article.keywords ?? []).join(' ').toLowerCase(), weight: 4 },
      { text: article.purpose.toLowerCase(), weight: 2 },
      {
        text: [
          article.whoShouldUse,
          article.businessPurpose,
          ...article.steps.map((s) => `${s.title} ${s.detail}`),
          ...(article.faqs ?? []).map((f) => `${f.q} ${f.a}`),
          ...(article.tips ?? []),
          ...(article.commonMistakes ?? []),
        ]
          .join(' ')
          .toLowerCase(),
        weight: 1,
      },
    ];

    let score = 0;
    for (const term of terms) {
      for (const h of haystacks) {
        if (h.text.includes(term)) score += h.weight;
      }
    }
    if (score > 0) results.push({ article, score });
  }

  return results.sort((a, b) => b.score - a.score).map((r) => r.article);
}

/** Popular topics for the knowledge-base landing chips. */
export const POPULAR_SEARCHES = [
  'Matter',
  'Assignment',
  'Draft',
  'Review',
  'Documents',
  'Reports',
  'Notifications',
  'Roles',
  'Tasks',
  'Audit',
  'Workflow',
  'System Administration',
];

// ----------------------------------------------------------------------------
// Quick start
// ----------------------------------------------------------------------------

export const QUICK_START: QuickStartStep[] = [
  { title: 'Sign in securely', description: 'Access the system with your DLPP account and learn session basics.', articleId: 'login', icon: 'LogIn' },
  { title: 'Tour the interface', description: 'Take the New User Tour to learn navigation, search and notifications.', tourId: 'new-user', icon: 'Compass' },
  { title: 'Read your Dashboard', description: 'Understand summary cards, alerts and quick actions.', articleId: 'dashboard', icon: 'LayoutDashboard' },
  { title: 'Find matters', description: 'Search, filter and open matters in the register.', articleId: 'matter-register', icon: 'ClipboardList' },
  { title: 'Register a matter', description: 'Walk through the four-step registration wizard.', articleId: 'register-new-matter', tourId: 'register-new-matter', icon: 'FilePlus' },
  { title: 'Progress a matter', description: 'Assign, complete details, review drafts and close.', articleId: 'draft-review', icon: 'Workflow' },
];

// ----------------------------------------------------------------------------
// Keyboard shortcuts
// ----------------------------------------------------------------------------

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { keys: ['?'], description: 'Open the Help drawer for the current page' },
  { keys: ['Esc'], description: 'Close the Help drawer or any open dialog' },
  { keys: ['/'], description: 'Jump to global search (matters & documents)' },
  { keys: ['G', 'D'], description: 'Go to Dashboard' },
  { keys: ['G', 'M'], description: 'Go to the Matter Register' },
  { keys: ['G', 'N'], description: 'Go to Notifications' },
  { keys: ['G', 'H'], description: 'Go to the Help Centre' },
];

// ----------------------------------------------------------------------------
// Global FAQ (cross-cutting)
// ----------------------------------------------------------------------------

export const GLOBAL_FAQ: HelpFAQ[] = [
  { q: 'How do I get help on the page I’m on?', a: 'Click the floating Help button (bottom-right) or press “?”. The Help drawer detects your page and shows the relevant article, with an option to start a guided tour.' },
  { q: 'How do I take an interactive tour?', a: 'Open the Help drawer or Help Centre and choose “Start guided tour”. Tours highlight the fields and buttons on screen and explain each one.' },
  { q: 'Why do I see different menus and help than colleagues?', a: 'The system is role-based. Menus, actions and highlighted help are tailored to your role and permissions.' },
  { q: 'Can I print or download an article?', a: 'Yes — every article has Print and Download PDF options for offline use and training packs.' },
  { q: 'How is a matter progressed end-to-end?', a: 'Register → Assign → Complete Details → Draft → Submit for Review → Approve → Finalize → Close. Each step updates the workflow stage and notifies the right people.' },
  { q: 'Who do I contact for account issues?', a: 'Your System Administrator handles accounts, password resets and permissions via User Management.' },
];
