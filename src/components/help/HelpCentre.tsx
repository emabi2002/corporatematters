'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ChevronLeft,
  LifeBuoy,
  ChevronRight,
  BookOpen,
  Compass,
  PlayCircle,
  Clock,
  Star,
  Sparkles,
  X,
  MapPin,
  Route,
  ThumbsUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  HELP_CATEGORIES,
  HELP_ROLES,
  HELP_ROLE_LABELS,
  WELCOME_TOUR_ID,
  getArticleById,
  searchArticles,
  type HelpCategory,
  type HelpRole,
  type HelpArticle,
} from '@/help/help-content';
import { useHelp } from './HelpProvider';
import { HelpArticle as HelpArticleView } from './HelpArticle';
import { HelpTopicIcon } from './HelpTopicIcon';

export function HelpCentre() {
  const { role, setRole, startTour, recentIds, favouriteIds, recordView } = useHelp();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  // Show the "what's new" card once per browser until dismissed.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setWhatsNewOpen(window.localStorage.getItem('corporate_help_whatsnew_dismissed') !== '1');
  }, []);

  const dismissWhatsNew = () => {
    setWhatsNewOpen(false);
    try {
      window.localStorage.setItem('corporate_help_whatsnew_dismissed', '1');
    } catch {
      /* ignore */
    }
  };

  // Deep-link support: /help?article=documents (also accepts ?topic=),
  // and /help?tour=welcome to auto-launch a guided tour.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const target = params.get('article') || params.get('topic');
    if (target && getArticleById(target)) {
      setSelectedId(target);
      recordView(target);
    }
    const tour = params.get('tour');
    if (tour) {
      window.setTimeout(() => startTour(tour), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (id: string) => {
    setSelectedId(id);
    recordView(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const results = useMemo(() => searchArticles(query, role), [query, role]);
  const grouped = useMemo(() => {
    const map = new Map<HelpCategory, HelpArticle[]>();
    for (const a of results) {
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    }
    return map;
  }, [results]);

  const selectedArticle = getArticleById(selectedId);
  const showBrowseExtras = !query.trim();
  const recent = recentIds.map(getArticleById).filter(Boolean) as HelpArticle[];
  const favourites = favouriteIds.map(getArticleById).filter(Boolean) as HelpArticle[];

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-700">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px, 64px 64px',
          }}
        />
        <div className="relative px-5 py-9 sm:px-8 sm:py-12">
          <div className="flex items-center gap-2 text-sm font-medium text-white/70">
            <LifeBuoy className="h-4 w-4" />
            DLPP Corporate Matters System
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">How can we help you?</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Clear, step-by-step guidance for every part of the system — written for legal
            secretaries, officers, managers and executives.
          </p>
          <div className="relative mt-6 max-w-2xl" data-tour="help-search">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedId(null);
              }}
              placeholder="Search for a module, task, document, report or role..."
              className="h-12 rounded-xl border-0 bg-white pl-12 text-base shadow-lg focus-visible:ring-2 focus-visible:ring-amber-400"
            />
          </div>
          <button
            type="button"
            onClick={() => startTour(WELCOME_TOUR_ID)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/25"
          >
            <PlayCircle className="h-4 w-4" />
            Take the welcome tour
          </button>
        </div>
      </div>

      <div className="py-8">
        {selectedArticle ? (
          <ArticleReader
            article={selectedArticle}
            role={role}
            onBack={() => setSelectedId(null)}
            onSelectArticle={select}
            onStartTour={startTour}
          />
        ) : (
          <>
            {/* What's new (first-time users) */}
            {whatsNewOpen && showBrowseExtras && (
              <div className="relative mb-8 overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                <button
                  type="button"
                  onClick={dismissWhatsNew}
                  aria-label="Dismiss"
                  className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition-colors hover:bg-emerald-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 text-emerald-700">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="text-base font-bold">New: your enterprise Help &amp; Training Centre</h2>
                </div>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  Every module now has step-by-step guidance, and help follows you around the system.
                  Here is what you can do:
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { icon: MapPin, title: 'Contextual help', body: 'The Help button opens guidance for the exact page you are on.' },
                    { icon: Route, title: 'Guided tours', body: 'Walk through the real screen step by step, highlighted as you go.' },
                    { icon: Compass, title: 'Filtered by role', body: 'See the guidance most relevant to your role automatically.' },
                    { icon: ThumbsUp, title: 'Save & share', body: 'Favourite articles, print or download, and rate what helped.' },
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.title} className="rounded-lg border border-emerald-100 bg-white/70 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                          <Icon className="h-4 w-4 text-emerald-600" />
                          {f.title}
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500">{f.body}</p>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => startTour(WELCOME_TOUR_ID)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  <PlayCircle className="h-4 w-4" />
                  Take the 1-minute welcome tour
                </button>
              </div>
            )}

            {/* Role filter */}
            <div className="mb-8" data-tour="help-roles">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
                <Compass className="h-4 w-4" />
                Filter guidance by your role
              </div>
              <div className="flex flex-wrap gap-2">
                <RolePill active={role === 'all'} onClick={() => setRole('all')} label="All roles" />
                {HELP_ROLES.map((r) => (
                  <RolePill
                    key={r}
                    active={role === r}
                    onClick={() => setRole(r)}
                    label={HELP_ROLE_LABELS[r]}
                  />
                ))}
              </div>
            </div>

            {/* Favourites + Recently viewed */}
            {showBrowseExtras && (favourites.length > 0 || recent.length > 0) && (
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                {favourites.length > 0 && (
                  <QuickList
                    icon={Star}
                    title="Your favourites"
                    articles={favourites}
                    onSelect={select}
                  />
                )}
                {recent.length > 0 && (
                  <QuickList
                    icon={Clock}
                    title="Recently viewed"
                    articles={recent}
                    onSelect={select}
                  />
                )}
              </div>
            )}

            {grouped.size === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-medium text-slate-700">No matching help topics</p>
                <p className="text-sm text-slate-500">
                  Try another keyword, or clear the search to see everything.
                </p>
              </div>
            )}

            {/* Category sections */}
            <div className="space-y-10" data-tour="help-categories">
              {HELP_CATEGORIES.filter((c) => grouped.has(c)).map((category) => (
                <section key={category}>
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">{category}</h2>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {grouped.get(category)!.length}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {grouped.get(category)!.map((article) => (
                      <TopicCard key={article.id} article={article} onClick={() => select(article.id)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RolePill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700',
      )}
    >
      {label}
    </button>
  );
}

function TopicCard({ article, onClick }: { article: HelpArticle; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
          <HelpTopicIcon name={article.icon} className="h-5 w-5" />
        </span>
        <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600" />
      </div>
      <h3 className="font-semibold text-slate-900">{article.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{article.summary}</p>
    </button>
  );
}

function QuickList({
  icon: Icon,
  title,
  articles,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  articles: HelpArticle[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Icon className="h-4 w-4 text-emerald-600" />
        {title}
      </div>
      <div className="space-y-1">
        {articles.map((article) => (
          <button
            key={article.id}
            type="button"
            onClick={() => onSelect(article.id)}
            className="group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700">
              <HelpTopicIcon name={article.icon} className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
              {article.title}
            </span>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300 group-hover:text-emerald-600" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ArticleReader({
  article,
  role,
  onBack,
  onSelectArticle,
  onStartTour,
}: {
  article: HelpArticle;
  role: HelpRole | 'all';
  onBack: () => void;
  onSelectArticle: (id: string) => void;
  onStartTour: (tourId: string) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Help Centre
      </button>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <HelpTopicIcon name={article.icon} className="h-7 w-7" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {article.category}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{article.title}</h1>
            <p className="mt-0.5 text-sm text-slate-500">{article.summary}</p>
          </div>
        </div>
        <HelpArticleView
          article={article}
          role={role}
          onSelectArticle={onSelectArticle}
          onStartTour={onStartTour}
        />
      </div>
    </div>
  );
}
