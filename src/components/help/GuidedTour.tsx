'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { CallBackProps, Step } from 'react-joyride';
import { useHelp } from './HelpProvider';

// react-joyride touches the DOM at import time — load it client-side only.
const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

export function GuidedTour() {
  const { activeTour, tourRunning, stopTour } = useHelp();
  const [mounted, setMounted] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [run, setRun] = useState(false);

  useEffect(() => setMounted(true), []);

  // Build (and sanitise) steps whenever a tour starts. Any target that is not
  // present in the DOM is converted into a centered, modal-style step so the
  // tour always runs and every explanation is still shown.
  useEffect(() => {
    if (!tourRunning || !activeTour) {
      setRun(false);
      return;
    }

    let cancelled = false;
    const isVisible = (el: Element | null): boolean => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;
      const style = window.getComputedStyle(el);
      return style.visibility !== 'hidden' && style.display !== 'none';
    };
    const build = () => {
      if (cancelled) return;
      const built: Step[] = activeTour.steps.map((s) => {
        const isCenter =
          s.target === 'center' ||
          (s.target !== 'body' && !isVisible(document.querySelector(s.target)));
        return {
          target: isCenter ? 'body' : s.target,
          title: s.title,
          content: s.content,
          placement: isCenter ? 'center' : s.placement ?? 'auto',
          disableBeacon: s.disableBeacon ?? true,
        } as Step;
      });
      setSteps(built);
      setRun(true);
    };

    // Allow any route navigation / render to settle before measuring targets.
    const t = setTimeout(build, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [tourRunning, activeTour]);

  const handleCallback = (data: CallBackProps) => {
    const { status, action, type } = data;
    if (status === 'finished' || status === 'skipped') {
      setRun(false);
      stopTour();
    } else if (action === 'close' && type === 'step:after') {
      setRun(false);
      stopTour();
    }
  };

  if (!mounted || steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrollParentFix
      spotlightPadding={6}
      callback={handleCallback}
      locale={{ last: 'Finish', skip: 'Skip tour', next: 'Next', back: 'Back' }}
      styles={{
        options: {
          primaryColor: '#059669',
          zIndex: 10000,
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          textColor: '#334155',
          overlayColor: 'rgba(15, 23, 42, 0.55)',
          width: 380,
        },
        tooltip: { borderRadius: 14, padding: 18 },
        tooltipTitle: {
          fontSize: 15,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 6,
        },
        tooltipContent: { fontSize: 13.5, lineHeight: 1.55, padding: '4px 0' },
        buttonNext: {
          backgroundColor: '#059669',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          padding: '8px 14px',
          outline: 'none',
        },
        buttonBack: { color: '#64748b', fontSize: 13, marginRight: 8 },
        buttonSkip: { color: '#94a3b8', fontSize: 13 },
        spotlight: { borderRadius: 10 },
      }}
    />
  );
}
