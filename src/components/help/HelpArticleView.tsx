'use client';

import * as Icons from 'lucide-react';
import {
  Target,
  ListChecks,
  Building2,
  ShieldAlert,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Star,
  Printer,
  Download,
  PlayCircle,
  Video,
  ImageIcon,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useHelp } from './HelpProvider';
import { RelatedTopics } from './RelatedTopics';
import { getCategory, audienceLabel } from '@/help/help-content';
import { printArticle, downloadArticlePdf } from '@/help/help-export';
import type { HelpArticle } from '@/help/help-types';
import { cn } from '@/lib/utils';

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  const C = Cmp ?? Icons.FileText;
  return <C className={className} />;
}

function Section({
  icon: Icon,
  title,
  accent = 'text-slate-500',
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-4">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Icon className={cn('h-4 w-4', accent)} />
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

interface HelpArticleViewProps {
  article: HelpArticle;
  onSelectRelated: (id: string) => void;
  compact?: boolean;
  className?: string;
}

export function HelpArticleView({
  article,
  onSelectRelated,
  compact = false,
  className,
}: HelpArticleViewProps) {
  const { isFavourite, toggleFavourite, startTour, feedback, submitFeedback } = useHelp();
  const category = getCategory(article.category);
  const fav = isFavourite(article.id);
  const fb = feedback[article.id];

  return (
    <article className={cn('space-y-6', className)}>
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          {category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              <LucideIcon name={category.icon} className="h-3.5 w-3.5" />
              {category.title}
            </span>
          )}
          {article.estMinutes && (
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {article.estMinutes} min
            </span>
          )}
        </div>

        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            <LucideIcon name={article.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className={cn('font-bold text-slate-900', compact ? 'text-lg' : 'text-2xl')}>
              {article.title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{article.summary}</p>
          </div>
        </div>

        {/* Audience chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {article.audiences.map((aud) => (
            <span
              key={aud}
              className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100"
            >
              {audienceLabel(aud)}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {article.tourId && (
            <button
              type="button"
              onClick={() => startTour(article.tourId!)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <PlayCircle className="h-4 w-4" />
              Start guided tour
            </button>
          )}
          <button
            type="button"
            onClick={() => toggleFavourite(article.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors',
              fav
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <Star className={cn('h-4 w-4', fav && 'fill-amber-400 text-amber-400')} />
            {fav ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => printArticle(article)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            type="button"
            onClick={() => downloadArticlePdf(article)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
        </div>
      </header>

      {/* Media: real screenshots, videos or an interactive walkthrough */}
      {article.media && article.media.length > 0 ? (
        <div className={cn('grid gap-3', article.media.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1')}>
          {article.media.map((m, i) => {
            if (m.type === 'image') {
              return (
                <figure key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.src} alt={m.alt ?? article.title} className="w-full" loading="lazy" />
                  {m.caption && (
                    <figcaption className="border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                      {m.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }
            if (m.type === 'video') {
              return (
                <figure key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-black">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video src={m.src} controls className="aspect-video w-full" />
                  {m.caption && (
                    <figcaption className="bg-slate-900 px-3 py-1.5 text-xs text-slate-300">{m.caption}</figcaption>
                  )}
                </figure>
              );
            }
            if (m.type === 'youtube') {
              return (
                <div key={i} className="aspect-video overflow-hidden rounded-xl border border-slate-200">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${m.src}`}
                    title={m.caption ?? article.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }
            // Interactive walkthrough launcher (used in place of a recorded video)
            const tid = m.tourId ?? article.tourId;
            return (
              <button
                key={i}
                type="button"
                onClick={() => tid && startTour(tid)}
                className="group relative flex aspect-video flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 transition-colors hover:from-emerald-100 hover:to-teal-100"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 shadow-sm ring-1 ring-emerald-200 transition-transform group-hover:scale-105">
                  <PlayCircle className="h-8 w-8" />
                </span>
                <span className="text-sm font-semibold">{m.caption ?? 'Play interactive walkthrough'}</span>
                <span className="text-xs text-emerald-600/80">Guided, on-screen tour of this feature</span>
              </button>
            );
          })}
        </div>
      ) : (
        (article.hasVideo || article.hasScreenshot) && (
          <div className={cn('grid gap-3', article.hasVideo && article.hasScreenshot ? 'sm:grid-cols-2' : 'grid-cols-1')}>
            {article.hasVideo && (
              <div className="flex aspect-video flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                <Video className="h-7 w-7" />
                <span className="text-xs font-medium">Training video coming soon</span>
              </div>
            )}
            {article.hasScreenshot && (
              <div className="flex aspect-video flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                <ImageIcon className="h-7 w-7" />
                <span className="text-xs font-medium">Screenshot placeholder</span>
              </div>
            )}
          </div>
        )
      )}

      {/* Purpose / audience / business */}
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-1">
        <Section icon={Target} title="Purpose" accent="text-emerald-600">
          {article.purpose}
        </Section>
        <Section icon={Icons.UserCheck} title="Who should use this" accent="text-sky-600">
          {article.whoShouldUse}
        </Section>
        <Section icon={Building2} title="Business purpose" accent="text-teal-600">
          {article.businessPurpose}
        </Section>
      </div>

      {/* Steps */}
      <Section icon={ListChecks} title="Step-by-step instructions" accent="text-emerald-600">
        <ol className="mt-1 space-y-3">
          {article.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{step.title}</p>
                <p className="text-slate-600">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Required fields */}
      {article.requiredFields && article.requiredFields.length > 0 && (
        <Section icon={Icons.FormInput} title="Required fields" accent="text-indigo-600">
          <ul className="mt-1 space-y-1.5">
            {article.requiredFields.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                <span>
                  <span className="font-medium text-slate-800">{f.name}</span>
                  {f.required && (
                    <span className="ml-1.5 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-600">
                      Required
                    </span>
                  )}
                  <span className="text-slate-600"> — {f.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Validation */}
      {article.validationRules && article.validationRules.length > 0 && (
        <Section icon={ShieldAlert} title="Validation rules" accent="text-amber-600">
          <ul className="mt-1 space-y-1.5">
            {article.validationRules.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Tips */}
      {article.tips && article.tips.length > 0 && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
          <Section icon={Lightbulb} title="Tips & best practices" accent="text-emerald-600">
            <ul className="mt-1 space-y-1.5">
              {article.tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {/* Mistakes */}
      {article.commonMistakes && article.commonMistakes.length > 0 && (
        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
          <Section icon={AlertTriangle} title="Common mistakes to avoid" accent="text-rose-600">
            <ul className="mt-1 space-y-1.5">
              {article.commonMistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {/* FAQ */}
      {article.faqs && article.faqs.length > 0 && (
        <Section icon={HelpCircle} title="Frequently asked questions" accent="text-sky-600">
          <div className="mt-1 space-y-2">
            {article.faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-lg border border-slate-200 bg-white px-3 py-2 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-medium text-slate-800">
                  {f.q}
                  <Icons.ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>
      )}

      {/* Related */}
      <RelatedTopics article={article} onSelect={onSelectRelated} />

      {/* Next steps */}
      {article.nextSteps && article.nextSteps.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <Section icon={ArrowRight} title="Next steps" accent="text-emerald-600">
            <ul className="mt-1 space-y-1.5">
              {article.nextSteps.map((n, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {/* Feedback */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <span className="text-sm font-medium text-slate-700">Was this helpful?</span>
        {fb ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Thanks for your feedback!
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => submitFeedback(article.id, true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ThumbsUp className="h-4 w-4" />
              Yes
            </button>
            <button
              type="button"
              onClick={() => submitFeedback(article.id, false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            >
              <ThumbsDown className="h-4 w-4" />
              No
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
