'use client';

import * as Icons from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { getRelatedArticles } from '@/help/help-content';
import type { HelpArticle } from '@/help/help-types';
import { cn } from '@/lib/utils';

interface RelatedTopicsProps {
  article?: HelpArticle;
  onSelect: (id: string) => void;
  className?: string;
  title?: string;
}

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  const C = Cmp ?? Icons.FileText;
  return <C className={className} />;
}

export function RelatedTopics({
  article,
  onSelect,
  className,
  title = 'Related topics',
}: RelatedTopicsProps) {
  const related = getRelatedArticles(article);
  if (related.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h4>
      <div className="grid gap-1.5">
        {related.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
              <LucideIcon name={a.icon} className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">{a.title}</span>
              <span className="block truncate text-xs text-slate-500">{a.summary}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-emerald-500" />
          </button>
        ))}
      </div>
    </div>
  );
}
