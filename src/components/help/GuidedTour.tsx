'use client';

import { useEffect } from 'react';
import { useHelp } from './HelpProvider';
import type { HelpTourStep } from '@/help/help-types';
import 'driver.js/dist/driver.css';

/** Click a tab trigger (by its data-tour value) to switch to it, if not active. */
function activateTabByName(name?: string) {
  if (!name || typeof document === 'undefined') return;
  const trigger = document.querySelector<HTMLElement>(`[data-tour="${name}"]`);
  if (trigger && trigger.getAttribute('data-state') !== 'active') {
    trigger.click();
  }
}

function isTabActive(name?: string) {
  if (!name || typeof document === 'undefined') return true;
  const trigger = document.querySelector<HTMLElement>(`[data-tour="${name}"]`);
  return !trigger || trigger.getAttribute('data-state') === 'active';
}

function isVisible(el: Element | null): boolean {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  const style = window.getComputedStyle(el);
  return style.visibility !== 'hidden' && style.display !== 'none';
}

type Side = 'top' | 'bottom' | 'left' | 'right';
function mapSide(placement?: HelpTourStep['placement']): Side {
  switch (placement) {
    case 'top':
    case 'top-start':
      return 'top';
    case 'left':
      return 'left';
    case 'right':
      return 'right';
    case 'bottom':
    case 'bottom-start':
      return 'bottom';
    default:
      return 'bottom';
  }
}

/**
 * Guided tours, powered by driver.js (React 18 / Next 15 native). Reads the
 * active tour from the Help context, resiliently centers steps whose target is
 * missing, and auto-switches matter tabs so content steps always highlight.
 */
export function GuidedTour() {
  const { activeTour, tourRunning, stopTour } = useHelp();

  useEffect(() => {
    if (!tourRunning || !activeTour) return;

    let cancelled = false;
    let active = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let driverObj: any = null;
    let startTimer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      const { driver } = await import('driver.js');
      if (cancelled) return;

      const sourceSteps = activeTour.steps;

      // Build driver steps; center any step whose target is missing and whose
      // tab cannot be opened.
      const steps = sourceSteps.map((s) => {
        let element: string | undefined;
        if (s.target !== 'center' && s.target !== 'body') {
          const canActivate =
            !!s.activateTab &&
            !!document.querySelector(`[data-tour="${s.activateTab}"]`);
          if (isVisible(document.querySelector(s.target)) || canActivate) {
            element = s.target;
          }
        }
        return {
          element,
          popover: {
            title: s.title,
            description: s.content,
            side: mapSide(s.placement),
            align: 'start' as const,
          },
        };
      });

      driverObj = driver({
        showProgress: true,
        progressText: 'Step {{current}} of {{total}}',
        allowClose: true,
        overlayColor: 'rgba(15, 23, 42, 0.55)',
        stagePadding: 6,
        stageRadius: 10,
        popoverClass: 'dlpp-help-tour',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Finish',
        steps,
        onHighlightStarted: () => {
          const idx = driverObj?.getActiveIndex?.() ?? 0;
          activateTabByName(sourceSteps[idx]?.activateTab);
        },
        onNextClick: () => {
          const idx = driverObj?.getActiveIndex?.() ?? 0;
          const nextTab = sourceSteps[idx + 1]?.activateTab;
          if (nextTab && !isTabActive(nextTab)) {
            activateTabByName(nextTab);
            setTimeout(() => driverObj?.moveNext(), 220);
          } else {
            driverObj?.moveNext();
          }
        },
        onPrevClick: () => {
          const idx = driverObj?.getActiveIndex?.() ?? 0;
          const prevTab = sourceSteps[idx - 1]?.activateTab;
          if (prevTab && !isTabActive(prevTab)) {
            activateTabByName(prevTab);
            setTimeout(() => driverObj?.movePrevious(), 220);
          } else {
            driverObj?.movePrevious();
          }
        },
        onDestroyed: () => {
          active = false;
          if (!cancelled) stopTour();
        },
      });

      // Open the first step's tab up-front, then start after render settles.
      activateTabByName(sourceSteps[0]?.activateTab);
      startTimer = setTimeout(() => {
        if (cancelled) return;
        active = true;
        driverObj.drive();
      }, 450);
    })();

    return () => {
      cancelled = true;
      if (startTimer) clearTimeout(startTimer);
      if (active && driverObj) {
        active = false;
        try {
          driverObj.destroy();
        } catch {
          /* ignore */
        }
      }
    };
  }, [tourRunning, activeTour, stopTour]);

  return null;
}
