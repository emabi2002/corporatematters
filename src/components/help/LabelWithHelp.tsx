'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { HelpTooltip } from './HelpTooltip';

interface LabelWithHelpProps {
  htmlFor?: string;
  children: React.ReactNode;
  /** Explanation shown by the "?" icon. */
  help: React.ReactNode;
  helpTitle?: string;
  required?: boolean;
  className?: string;
}

/** A form label paired with a contextual help "?" icon. */
export function LabelWithHelp({
  htmlFor,
  children,
  help,
  helpTitle,
  required,
  className,
}: LabelWithHelpProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Label htmlFor={htmlFor}>
        {children}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      <HelpTooltip title={helpTitle} content={help} />
    </div>
  );
}
