'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { Search, X, CornerDownLeft } from 'lucide-react';
import { searchArticles, getCategory } from '@/help/help-content';
import type { HelpArticle } from '@/help/help-types';
import { cn } from '@/lib/utils';

interface HelpSearchProps {
  onSelect: (article: HelpArticle) => void;
  placeholder?: string;
  autoFocus?: boolean;
  variant?: 'drawer' | 'page';
  className?: string;
}

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  const C = Cmp ?? Icons.FileText;
  return <C className={className} />;
}

export function HelpSearch({
  onSelect,
  placeholder = 'Search help articles...',
  autoFocus,
  variant = 'page',
  className,
}: HelpSearchProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => (query.trim() ? searchArticles(query).slice(0, 8) : []), [query]);

  useEffect(() => setActive(-1), [query]);
  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 60);
  }, [autoFocus]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = results[active] ?? results[0];
      if (chosen) {
        onSelect(chosen);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setQuery('');
    }
  };

  const big = variant === 'page';

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400',
            big ? 'h-5 w-5' : 'h-4 w-4'
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-slate-800 shadow-sm outline-none ring-emerald-500/30 transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4',
            big ? 'h-14 text-base' : 'h-10 text-sm'
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className={big ? 'h-5 w-5' : 'h-4 w-4'} />
          </button>
        )}
      </div>

      {query.trim() && (
        <div
          className={cn(
            'z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg',
            big ? 'absolute inset-x-0' : 'relative'
          )}
        >
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              No results for &ldquo;{query}&rdquo;. Try another term.
            </div>
          ) : (
            <ul className="max-h-[22rem] overflow-y-auto py-1">
              {results.map((a, i) => {
                const cat = getCategory(a.category);
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => {
                        onSelect(a);
                        setQuery('');
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                        i === active ? 'bg-emerald-50' : 'hover:bg-slate-50'
                      )}
                    >
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <LucideIcon name={a.icon} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800">{a.title}</span>
                        <span className="block truncate text-xs text-slate-500">{a.summary}</span>
                      </span>
                      {cat && (
                        <span className="hidden flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 sm:inline">
                          {cat.title}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-400">
            <span>{results.length} result{results.length === 1 ? '' : 's'}</span>
            <span className="inline-flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" /> to open
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
