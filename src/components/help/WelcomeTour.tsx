'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGuidedTour } from './GuidedTour';
import { WELCOME_TOUR_ID } from '@/help/help-content';

const WELCOME_SEEN_KEY = 'corporate_help_welcome_seen';

/** Resolve once the selector appears in the DOM, or after `timeout` ms. */
function waitForElement(selector: string, timeout = 4000): Promise<void> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') return resolve();
    const start = Date.now();
    const tick = () => {
      if (document.querySelector(selector) || Date.now() - start > timeout) {
        resolve();
        return;
      }
      window.setTimeout(tick, 150);
    };
    tick();
  });
}

/**
 * Automatically launches the welcome tour the first time a signed-in user lands
 * on an app page. It never runs on the login/root screens, fires once per
 * browser, and only for authenticated users.
 */
export function WelcomeTour() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { startTour } = useGuidedTour();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    if (typeof window === 'undefined') return;
    if (!user) return;
    if (!pathname || pathname === '/' || pathname === '/auth/login') return;
    if (window.localStorage.getItem(WELCOME_SEEN_KEY)) return;

    startedRef.current = true;
    window.localStorage.setItem(WELCOME_SEEN_KEY, '1');

    let cancelled = false;
    (async () => {
      await waitForElement('[data-tour="sidebar"]');
      if (!cancelled) startTour(WELCOME_TOUR_ID);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, user, startTour]);

  return null;
}
