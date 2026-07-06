'use client';

import { usePathname } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useHelp } from './HelpProvider';

/** Routes where the floating help button should not appear. */
const HIDDEN_ROUTES = ['/', '/auth/login'];

/** The floating help launcher shown on every authenticated page. */
export function HelpButton() {
  const pathname = usePathname();
  const { openHelp, isOpen } = useHelp();

  if (pathname && HIDDEN_ROUTES.includes(pathname)) return null;

  return (
    <button
      type="button"
      data-tour="help-button"
      onClick={() => openHelp()}
      aria-label="Open help"
      className={cn(
        'group fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-lg shadow-emerald-600/30 transition-all duration-200',
        'hover:bg-emerald-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
        isOpen && 'pointer-events-none scale-90 opacity-0',
      )}
    >
      <HelpCircle className="h-5 w-5" />
      <span className="hidden text-sm font-semibold sm:inline">Help</span>
      <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
      </span>
    </button>
  );
}

/**
 * An inline "Help" launcher for page headers and toolbars. Opens the drawer to
 * the article for the current route (or a specific article when `articleId` is
 * given).
 */
export function HelpLauncher({
  articleId,
  label = 'Help',
  className,
}: {
  articleId?: string;
  label?: string;
  className?: string;
}) {
  const { openHelp } = useHelp();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => openHelp(articleId)}
      className={cn('gap-1.5', className)}
    >
      <HelpCircle className="h-4 w-4" />
      {label}
    </Button>
  );
}
