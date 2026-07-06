'use client';

import { AppLayout } from '@/components/AppLayout';
import { HelpCentre } from '@/components/help';

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto">
        <HelpCentre />
      </div>
    </AppLayout>
  );
}
