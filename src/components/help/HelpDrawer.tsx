'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, BookOpen, Search as SearchIcon } from 'lucide-react';
import { useHelp } from './HelpProvider';
import { HelpArticleView } from './HelpArticleView';
import { HelpBreadcrumb } from './HelpBreadcrumb';
import { HelpSearch } from './HelpSearch';
import { cn } from '@/lib/utils';

export function HelpDrawer() {
  const { open, closeHelp, activeArticle, showArticle, markViewed } = useHelp();
  const router = useRouter();

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeHelp();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeHelp]);

  // Record the viewed article for "recently viewed".
  useEffect(() => {
    if (open && activeArticle) markViewed(activeArticle.id);
  }, [open, activeArticle, markViewed]);

  const goCentre = () => {
    closeHelp();
    router.push('/help');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px] transition-opacity duration-300 print:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeHelp}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Help"
        aria-modal="true"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out print:hidden',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-200 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">Help &amp; Training</span>
            </div>
            <button
              type="button"
              onClick={closeHelp}
              aria-label="Close help"
              className="rounded-md p-1 text-white/90 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-0.5 text-xs text-emerald-50/90">
            Context help for where you are — plus the full knowledge base.
          </p>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 border-b border-slate-100 p-3">
          <HelpSearch
            variant="drawer"
            placeholder="Search all help articles..."
            onSelect={(a) => showArticle(a.id)}
          />
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {activeArticle ? (
            <>
              <HelpBreadcrumb article={activeArticle} onHome={goCentre} className="mb-4" />
              <HelpArticleView
                article={activeArticle}
                onSelectRelated={(id) => showArticle(id)}
                compact
              />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
              <SearchIcon className="h-8 w-8" />
              <p className="text-sm">
                Search above, or open the full Help Centre to browse every topic.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 p-3">
          <button
            type="button"
            onClick={goCentre}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <BookOpen className="h-4 w-4" />
            Open the full Help Centre
          </button>
        </div>
      </aside>
    </>
  );
}
