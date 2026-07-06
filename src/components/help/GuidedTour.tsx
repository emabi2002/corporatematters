'use client';

/**
 * GuidedTour
 * ----------
 * A self-contained walkthrough engine (no external dependency). It highlights
 * the real elements on a page using a spotlight overlay and shows a popover
 * with Next / Back / Finish controls. Steps whose target selector is not on the
 * current page fall back to a centred pop-over, so a tour never breaks a page.
 *
 * Start a tour from anywhere with `useGuidedTour().startTour(tourId)` and mount
 * a single `<GuidedTour />` near the app root to render the overlay.
 */

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, X, Check } from 'lucide-react';
import { getTourById, type HelpTour } from '@/help/help-content';

/* ----------------------------- emitter ---------------------------- */

type Listener = (tourId: string) => void;
const listeners = new Set<Listener>();

/** Start a guided tour from anywhere in the app. */
export function startGuidedTour(tourId: string) {
  listeners.forEach((l) => l(tourId));
}

/** Hook that exposes a stable `startTour` function. */
export function useGuidedTour() {
  const startTour = useCallback((tourId: string) => startGuidedTour(tourId), []);
  return { startTour };
}

/* --------------------------- positioning -------------------------- */

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const CARD_WIDTH = 340;
const CARD_MARGIN = 14;
const PAD = 6;

function getRect(selector?: string): Rect | null {
  if (!selector || typeof document === 'undefined') return null;
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  // Treat invisible / zero-size elements as "not present" -> centred step.
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

/* --------------------------- component ---------------------------- */

export function GuidedTour() {
  const [mounted, setMounted] = useState(false);
  const [tour, setTour] = useState<HelpTour | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tick, setTick] = useState(0); // forces re-measure

  useEffect(() => setMounted(true), []);

  // Subscribe to tour-start requests.
  useEffect(() => {
    const listener: Listener = (tourId) => {
      const t = getTourById(tourId);
      if (!t || t.steps.length === 0) return;
      setTour(t);
      setIndex(0);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const step = tour?.steps[index] ?? null;

  const stop = useCallback(() => {
    setTour(null);
    setIndex(0);
    setRect(null);
  }, []);

  // Scroll the target into view when the step changes.
  useEffect(() => {
    if (!step?.target || typeof document === 'undefined') return;
    const el = document.querySelector(step.target) as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }, [step, index]);

  // Measure the target (after scroll settles) and keep it fresh on resize/scroll.
  useLayoutEffect(() => {
    if (!tour) return;
    let raf = 0;
    const measure = () => setRect(getRect(step?.target));
    // Measure a couple of times to catch smooth-scroll settling.
    measure();
    const t1 = window.setTimeout(measure, 120);
    const t2 = window.setTimeout(measure, 320);
    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [tour, step, index, tick]);

  // Keyboard controls.
  useEffect(() => {
    if (!tour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour, index]);

  const next = useCallback(() => {
    if (!tour) return;
    if (index >= tour.steps.length - 1) stop();
    else {
      setIndex((i) => i + 1);
      setTick((t) => t + 1);
    }
  }, [tour, index, stop]);

  const prev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setTick((t) => t + 1);
    }
  }, [index]);

  if (!mounted || !tour || !step) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isLast = index === tour.steps.length - 1;
  const placement = step.placement ?? (rect ? 'bottom' : 'center');

  // Compute the popover position.
  let cardTop = vh / 2 - 90;
  let cardLeft = vw / 2 - CARD_WIDTH / 2;

  if (rect && placement !== 'center') {
    switch (placement) {
      case 'top':
        cardTop = rect.top - CARD_MARGIN - 180;
        cardLeft = rect.left + rect.width / 2 - CARD_WIDTH / 2;
        break;
      case 'left':
        cardTop = rect.top;
        cardLeft = rect.left - CARD_WIDTH - CARD_MARGIN;
        break;
      case 'right':
        cardTop = rect.top;
        cardLeft = rect.left + rect.width + CARD_MARGIN;
        break;
      case 'bottom':
      default:
        cardTop = rect.top + rect.height + CARD_MARGIN;
        cardLeft = rect.left + rect.width / 2 - CARD_WIDTH / 2;
        break;
    }
  }

  cardLeft = clamp(cardLeft, CARD_MARGIN, vw - CARD_WIDTH - CARD_MARGIN);
  cardTop = clamp(cardTop, CARD_MARGIN, vh - 200);

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={tour.title}>
      {/* Spotlight (or plain backdrop for centred steps) */}
      {rect && placement !== 'center' ? (
        <div
          className="pointer-events-none fixed rounded-lg transition-all duration-300"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
            outline: '2px solid rgba(16, 185, 129, 0.9)',
            outlineOffset: 2,
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-slate-900/65" onClick={stop} />
      )}

      {/* Popover card */}
      <div
        className="fixed w-[340px] max-w-[calc(100vw-1.75rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl transition-all duration-200"
        style={{ top: cardTop, left: cardLeft }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-emerald-600 px-1.5 text-[11px] font-bold text-white">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold leading-tight text-slate-900">{step.title}</h4>
          </div>
          <button
            type="button"
            onClick={stop}
            aria-label="End tour"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-3.5">
          <p className="text-sm leading-relaxed text-slate-600">{step.body}</p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
          <div className="flex items-center gap-1">
            {tour.steps.map((_, i) => (
              <span
                key={i}
                className={
                  'h-1.5 rounded-full transition-all ' +
                  (i === index ? 'w-4 bg-emerald-600' : 'w-1.5 bg-slate-200')
                }
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {index > 0 && (
              <button
                type="button"
                onClick={prev}
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {isLast ? (
                <>
                  Finish
                  <Check className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
