'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  ChevronLeft,
  Search,
  LifeBuoy,
  ArrowUpRight,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  HELP_CATEGORIES,
  HELP_ROLES,
  HELP_ROLE_LABELS,
  searchArticles,
  type HelpCategory,
  type HelpArticle,
} from '@/help/help-content';
import { useHelp } from './HelpProvider';
import { HelpArticle as HelpArticleView } from './HelpArticle';
import { HelpTopicIcon } from './HelpTopicIcon';

export function HelpDrawer() {
  const {
    isOpen,
    view,
    activeArticle,
    routeArticle,
    role,
    closeHelp,
    showArticle,
    showHome,
    setRole,
    startTour,
  } = useHelp();
  const [query, setQuery] = useState('');

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

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && closeHelp()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed right-0 top-0 z-[95] flex h-full w-full flex-col bg-white shadow-2xl outline-none sm:max-w-[480px]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300',
          )}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-emerald-700 px-5 pb-4 pt-5 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <LifeBuoy className="h-5 w-5" />
                </span>
                <div>
                  <Dialog.Title className="text-base font-semibold leading-tight">
                    Help &amp; Training
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-white/70">
                    Guidance for the Corporate Matters System
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close
                className="rounded-md p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Close help"
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {/* Role selector */}
            <div className="mt-4">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-white/70">
                Showing help for
              </label>
              <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                <SelectTrigger className="h-9 border-white/20 bg-white/10 text-sm text-white focus:ring-white/40 [&>span]:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="all">All roles</SelectItem>
                  {HELP_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {HELP_ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sub-header: back / this-page badge */}
          {view === 'article' && activeArticle && (
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-2.5">
              <button
                type="button"
                onClick={showHome}
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800"
              >
                <ChevronLeft className="h-4 w-4" />
                All help topics
              </button>
              {routeArticle && activeArticle.id === routeArticle.id && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  <MapPin className="h-3 w-3" />
                  This page
                </span>
              )}
            </div>
          )}

          {/* Body */}
          <ScrollArea className="flex-1">
            <div className="px-5 py-5">
              {view === 'article' && activeArticle ? (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <HelpTopicIcon name={activeArticle.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold leading-tight text-slate-900">
                        {activeArticle.title}
                      </h3>
                      <p className="text-xs text-slate-500">{activeArticle.category}</p>
                    </div>
                  </div>
                  <HelpArticleView
                    article={activeArticle}
                    role={role}
                    onSelectArticle={showArticle}
                    onStartTour={startTour}
                    compact
                  />
                </>
              ) : (
                <HomeView
                  query={query}
                  setQuery={setQuery}
                  grouped={grouped}
                  onSelectArticle={showArticle}
                />
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 px-5 py-3">
            <Link
              href="/help"
              onClick={closeHelp}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800"
            >
              Open full Help Centre
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function HomeView({
  query,
  setQuery,
  grouped,
  onSelectArticle,
}: {
  query: string;
  setQuery: (v: string) => void;
  grouped: Map<HelpCategory, HelpArticle[]>;
  onSelectArticle: (id: string) => void;
}) {
  const hasResults = grouped.size > 0;
  return (
    <div>
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help by keyword, module or task..."
          className="h-10 pl-9"
        />
      </div>

      {!hasResults && (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          No help topics match your search. Try a different keyword.
        </div>
      )}

      <div className="space-y-5">
        {HELP_CATEGORIES.filter((c) => grouped.has(c)).map((category) => (
          <div key={category}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {category}
            </h4>
            <div className="space-y-1">
              {grouped.get(category)!.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => onSelectArticle(article.id)}
                  className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-slate-200 hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                    <HelpTopicIcon name={article.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {article.title}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{article.summary}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-emerald-600" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
