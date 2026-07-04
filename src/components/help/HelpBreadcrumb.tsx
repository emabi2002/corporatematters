'use client';

import { ChevronRight, LifeBuoy } from 'lucide-react';
import { getCategory } from '@/help/help-content';
import type { HelpArticle } from '@/help/help-types';
import { cn } from '@/lib/utils';

interface HelpBreadcrumbProps {
  article?: HelpArticle;
  /** Click handler for the "Help Centre" root crumb. */
  onHome?: () => void;
  className?: string;
}

export function HelpBreadcrumb({ article, onHome, className }: HelpBreadcrumbProps) {
  const category = article ? getCategory(article.category) : undefined;

  return (
    <nav
      aria-label="Help breadcrumb"
      className={cn('flex items-center gap-1 text-xs text-slate-500', className)}
    >
      <button
        type="button"
        onClick={onHome}
        className="inline-flex items-center gap-1 font-medium text-slate-500 transition-colors hover:text-emerald-600"
      >
        <LifeBuoy className="h-3.5 w-3.5" />
        Help Centre
      </button>
      {category && (
        <>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="truncate">{category.title}</span>
        </>
      )}
      {article && (
        <>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="truncate font-medium text-slate-700">{article.title}</span>
        </>
      )}
    </nav>
  );
}
