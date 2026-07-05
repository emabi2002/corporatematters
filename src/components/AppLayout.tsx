'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { HelpProvider } from '@/components/help/HelpProvider';
import { HelpButton } from '@/components/help/HelpButton';
import { HelpDrawer } from '@/components/help/HelpDrawer';
import { GuidedTour } from '@/components/help/GuidedTour';
import { cn } from '@/lib/utils';

const SIDEBAR_COLLAPSED_KEY = 'corporate_sidebar_collapsed';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Restore persisted collapsed state after mount (avoids hydration mismatch)
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored !== null) {
        setSidebarCollapsed(stored === 'true');
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  // Persist collapsed state whenever it changes
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {
      // Ignore storage access errors
    }
  }, [sidebarCollapsed, mounted]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    // Help facility is mounted inside the authenticated Corporate Matters shell,
    // so it is available on every module page — floating button, route-aware
    // drawer and guided tours — without users ever leaving the page.
    <HelpProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Collapsible sidebar with mobile drawer */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          mobileOpen={mobileOpen}
          onMobileClose={closeMobile}
        />

        {/* Main content area shifts with the sidebar width on desktop */}
        <div
          className={cn(
            'transition-all duration-300',
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          )}
        >
          {/* Sticky top header */}
          <TopHeader
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            onMobileToggle={toggleMobile}
          />

          {/* Page content */}
          <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-6">
            {children}
          </main>
        </div>

        {/* Contextual help — floating button, right-side drawer, guided tours */}
        <HelpButton />
        <HelpDrawer />
        <GuidedTour />
      </div>
    </HelpProvider>
  );
}
