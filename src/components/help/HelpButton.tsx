'use client';

import { HelpCircle, LifeBuoy } from 'lucide-react';
import { useHelp } from './HelpProvider';
import { cn } from '@/lib/utils';

interface HelpButtonProps {
  variant?: 'floating' | 'icon' | 'inline';
  articleId?: string;
  label?: string;
  className?: string;
}

export function HelpButton({
  variant = 'floating',
  articleId,
  label = 'Help',
  className,
}: HelpButtonProps) {
  const { openHelp } = useHelp();

  if (variant === 'icon') {
    return (
      <button
        type="button"
        data-tour="help-button"
        onClick={() => openHelp(articleId)}
        aria-label="Open help"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-600',
          className
        )}
      >
        <HelpCircle className="h-5 w-5" />
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={() => openHelp(articleId)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50',
          className
        )}
      >
        <HelpCircle className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      data-tour="help-fab"
      onClick={() => openHelp(articleId)}
      aria-label="Open help and training"
      className={cn(
        'group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-500/50 transition-all hover:bg-emerald-700 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 print:hidden',
        className
      )}
    >
      <LifeBuoy className="h-5 w-5 transition-transform group-hover:rotate-45" />
      <span className="hidden text-sm font-semibold sm:inline">Help</span>
    </button>
  );
}
