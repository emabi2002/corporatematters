'use client';

import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getTooltip } from '@/help/help-content';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  /** Registry id from help-tooltips.ts. */
  id?: string;
  /** Inline overrides (used when no id, or to override the registry). */
  label?: string;
  content?: string;
  /** Optional element to attach the help icon beside. */
  children?: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  iconClassName?: string;
}

/**
 * Context help. Renders a small "?" affordance that reveals guidance on hover,
 * focus or tap. Reference shared copy with `id`, or pass `content` inline.
 */
export function HelpTooltip({
  id,
  label,
  content,
  children,
  side = 'top',
  className,
  iconClassName,
}: HelpTooltipProps) {
  const def = id ? getTooltip(id) : undefined;
  const text = content ?? def?.content ?? '';
  const title = label ?? def?.label;

  if (!text) return <>{children}</>;

  const icon = (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={title ? `Help: ${title}` : 'Help'}
            onClick={(e) => e.preventDefault()}
            className={cn(
              'inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
              iconClassName
            )}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-[16rem] bg-slate-900 text-left"
        >
          {title && (
            <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
              {title}
            </p>
          )}
          <p className="text-xs font-normal leading-snug text-slate-100">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (children) {
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        {children}
        {icon}
      </span>
    );
  }

  return <span className={className}>{icon}</span>;
}
