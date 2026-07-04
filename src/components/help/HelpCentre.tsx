'use client';

import { useEffect, useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import {
  ArrowLeft,
  Compass,
  PlayCircle,
  Star,
  History,
  Keyboard,
  ChevronDown,
  Sparkles,
  LifeBuoy,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useHelp } from './HelpProvider';
import { HelpArticleView } from './HelpArticleView';
import { HelpBreadcrumb } from './HelpBreadcrumb';
import { HelpSearch } from './HelpSearch';
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  HELP_TOURS,
  QUICK_START,
  KEYBOARD_SHORTCUTS,
  GLOBAL_FAQ,
  POPULAR_SEARCHES,
  getArticle,
  getArticlesByCategory,
  audiencesForRole,
} from '@/help/help-content';
import type { HelpArticle, HelpAudience } from '@/help/help-types';
import { cn } from '@/lib/utils';

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  const C = Cmp ?? Icons.FileText;
  return <C className={className} />;
}

function ArticleCard({ article, onOpen }: { article: HelpArticle; onOpen: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(article.id)}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
        <LucideIcon name={article.icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-semibold text-slate-800">{article.title}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-sm text-slate-500">{article.summary}</span>
      </span>
    </button>
  );
}

export function HelpCentre() {
  const { profile } = useAuth();
  const { roleDescription } = usePermissions();
  const { startTour, recent, favourites, markViewed } = useHelp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Deep-link support (?article=id) without a full navigation.
  useEffect(() => {
    try {
      const id = new URLSearchParams(window.location.search).get('article');
      if (id && getArticle(id)) setSelectedId(id);
    } catch {
      /* ignore */
    }
  }, []);

  const openArticle = (id: string) => {
    setSelectedId(id);
    markViewed(id);
    try {
      window.history.replaceState(null, '', `/help?article=${id}`);
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToHome = () => {
    setSelectedId(null);
    try {
      window.history.replaceState(null, '', '/help');
    } catch {
      /* ignore */
    }
  };

  const selected = selectedId ? getArticle(selectedId) : undefined;

  const recommended = useMemo(() => {
    const specific = new Set<HelpAudience>(
      audiencesForRole(profile?.role).filter((a) => a !== 'all')
    );
    const matches = HELP_ARTICLES.filter((a) => a.audiences.some((x) => specific.has(x)));
    const base = matches.length >= 3 ? matches : HELP_ARTICLES.filter((a) =>
      ['dashboard', 'matter-register', 'register-new-matter', 'draft-review'].includes(a.id)
    );
    return base.slice(0, 6);
  }, [profile?.role]);

  const recentArticles = recent.map(getArticle).filter((a): a is HelpArticle => Boolean(a));
  const favArticles = favourites.map(getArticle).filter((a): a is HelpArticle => Boolean(a));

  // ---- Article detail view -------------------------------------------------
  if (selected) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={backToHome}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Help Centre
        </button>
        <HelpBreadcrumb article={selected} onHome={backToHome} className="mb-4" />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <HelpArticleView article={selected} onSelectRelated={openArticle} />
        </div>
      </div>
    );
  }

  // ---- Browse home ---------------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-800 px-6 py-12 text-white shadow-xl sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.5) 0, transparent 40%), radial-gradient(circle at 80% 0%, rgba(45,212,191,0.4) 0, transparent 35%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100 ring-1 ring-white/20">
            <LifeBuoy className="h-3.5 w-3.5" />
            DLPP Corporate Matters — Help &amp; Training Centre
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            How can we help you today?
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-emerald-50/80 sm:text-base">
            Search the knowledge base, take an interactive tour, or browse training for every module.
          </p>
          <div className="mx-auto mt-6 max-w-2xl text-left">
            <HelpSearch variant="page" placeholder="Search matters, assignment, review, reports…" onSelect={(a) => openArticle(a.id)} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-emerald-100/70">Popular:</span>
            {POPULAR_SEARCHES.slice(0, 8).map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  const first = HELP_ARTICLES.find((a) =>
                    (a.keywords ?? []).some((k) => k.includes(term.toLowerCase())) ||
                    a.title.toLowerCase().includes(term.toLowerCase())
                  );
                  if (first) openArticle(first.id);
                }}
                className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick action banners */}
      <section className="grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => startTour('new-user')}
          className="group flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Compass className="h-6 w-6" />
          </span>
          <span>
            <span className="block font-semibold text-emerald-900">New User Tour</span>
            <span className="block text-sm text-emerald-700/80">A 60-second guided orientation.</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => openArticle('help-centre')}
          className="group flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white">
            <Sparkles className="h-6 w-6" />
          </span>
          <span>
            <span className="block font-semibold text-sky-900">Using the Help Centre</span>
            <span className="block text-sm text-sky-700/80">Search, tours, tooltips &amp; more.</span>
          </span>
        </button>
        <a
          href="#faq"
          className="group flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Icons.MessagesSquare className="h-6 w-6" />
          </span>
          <span>
            <span className="block font-semibold text-amber-900">FAQ</span>
            <span className="block text-sm text-amber-700/80">Answers to common questions.</span>
          </span>
        </a>
      </section>

      {/* Recommended for your role */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Star className="h-5 w-5 text-amber-400" />
            Recommended for {roleDescription || 'you'}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((a) => (
            <ArticleCard key={a.id} article={a} onOpen={openArticle} />
          ))}
        </div>
      </section>

      {/* Quick start */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Quick Start Guide</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_START.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{step.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{step.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {step.articleId && (
                    <button
                      type="button"
                      onClick={() => openArticle(step.articleId!)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Read guide
                    </button>
                  )}
                  {step.tourId && (
                    <button
                      type="button"
                      onClick={() => startTour(step.tourId!)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
                    >
                      <PlayCircle className="h-3.5 w-3.5" /> Take tour
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by category */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Browse by topic</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {HELP_CATEGORIES.map((cat) => {
            const articles = getArticlesByCategory(cat.id);
            if (articles.length === 0) return null;
            return (
              <div key={cat.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl ring-1', cat.accent)}>
                    <LucideIcon name={cat.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{cat.title}</h3>
                    <p className="text-xs text-slate-500">{cat.description}</p>
                  </div>
                </div>
                <ul className="space-y-0.5">
                  {articles.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => openArticle(a.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <LucideIcon name={a.icon} className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{a.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Guided tours */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
          <PlayCircle className="h-5 w-5 text-emerald-600" />
          Interactive guided tours
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_TOURS.map((tour) => (
            <div
              key={tour.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="font-semibold text-slate-800">{tour.title}</p>
              <p className="mt-0.5 flex-1 text-sm text-slate-500">{tour.description}</p>
              <button
                type="button"
                onClick={() => startTour(tour.id)}
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <PlayCircle className="h-4 w-4" />
                Start tour
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recents & favourites */}
      {(recentArticles.length > 0 || favArticles.length > 0) && (
        <section className="grid gap-4 lg:grid-cols-2">
          {favArticles.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                <Star className="h-4 w-4 text-amber-400" />
                Favourite topics
              </h3>
              <ul className="space-y-0.5">
                {favArticles.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => openArticle(a.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <LucideIcon name={a.icon} className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{a.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recentArticles.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                <History className="h-4 w-4 text-slate-400" />
                Recently viewed
              </h3>
              <ul className="space-y-0.5">
                {recentArticles.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => openArticle(a.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <LucideIcon name={a.icon} className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{a.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Keyboard shortcuts */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Keyboard className="h-5 w-5 text-slate-500" />
          Keyboard shortcuts
        </h2>
        <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
          {KEYBOARD_SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-1">
              <span className="text-sm text-slate-600">{s.description}</span>
              <span className="flex flex-shrink-0 items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-6">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Frequently asked questions</h2>
        <div className="space-y-2">
          {GLOBAL_FAQ.map((f, i) => (
            <details
              key={i}
              className="group rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-2 font-medium text-slate-800">
                {f.q}
                <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Support footer */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
        <Mail className="mx-auto h-6 w-6 text-slate-400" />
        <h3 className="mt-2 font-semibold text-slate-900">Still need help?</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          Contact your System Administrator for account, permission or reference-data changes, or reach the DLPP ICT support desk for technical issues.
        </p>
      </section>
    </div>
  );
}
