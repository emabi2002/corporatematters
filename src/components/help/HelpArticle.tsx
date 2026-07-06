'use client';

import { useEffect, useState } from 'react';
import {
  Target,
  Building,
  UserCircle,
  ListChecks,
  FormInput,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  PlayCircle,
  Link2,
  BadgeInfo,
  HelpCircle,
  Printer,
  Download,
  Star,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getRelatedArticles,
  getTourForArticle,
  HELP_ROLE_LABELS,
  type HelpRole,
  type HelpArticle as HelpArticleType,
} from '@/help/help-content';
import { useHelp } from './HelpProvider';

interface HelpArticleProps {
  article: HelpArticleType;
  role: HelpRole | 'all';
  onSelectArticle: (id: string) => void;
  onStartTour: (tourId: string) => void;
  /** Compact spacing + hide the toolbar (used inside the drawer). */
  compact?: boolean;
}

function SectionHeading({
  icon: Icon,
  children,
  tone = 'slate',
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tone?: 'slate' | 'amber' | 'emerald' | 'red' | 'blue';
}) {
  const toneMap = {
    slate: 'text-slate-700 bg-slate-100',
    amber: 'text-amber-700 bg-amber-100',
    emerald: 'text-emerald-700 bg-emerald-100',
    red: 'text-red-700 bg-red-100',
    blue: 'text-blue-700 bg-blue-100',
  } as const;
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className={cn('flex h-7 w-7 items-center justify-center rounded-md', toneMap[tone])}>
        <Icon className="h-4 w-4" />
      </span>
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-800">{children}</h4>
    </div>
  );
}

/* --------------------------- print / download --------------------- */

function buildArticleHtml(article: HelpArticleType): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const list = (items?: string[]) =>
    items && items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '';
  const ol = (items?: string[]) =>
    items && items.length ? `<ol>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>` : '';
  const fields = article.requiredFields?.length
    ? `<table><thead><tr><th>Field</th><th>Required</th><th>Description</th></tr></thead><tbody>${article.requiredFields
        .map(
          (f) =>
            `<tr><td>${esc(f.name)}</td><td>${f.required ? 'Yes' : 'No'}</td><td>${esc(
              f.description,
            )}</td></tr>`,
        )
        .join('')}</tbody></table>`
    : '';
  const faqs = article.faqs?.length
    ? article.faqs
        .map((f) => `<p><strong>${esc(f.question)}</strong><br/>${esc(f.answer)}</p>`)
        .join('')
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(
    article.title,
  )} — DLPP Corporate Matters Help</title><style>
    body{font-family:Georgia,'Times New Roman',serif;color:#0f172a;max-width:760px;margin:32px auto;padding:0 24px;line-height:1.55}
    h1{font-size:24px;margin:0 0 4px} .cat{color:#059669;font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:12px}
    h2{font-size:15px;text-transform:uppercase;letter-spacing:.04em;color:#334155;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-top:24px}
    table{width:100%;border-collapse:collapse;font-size:14px} th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left;vertical-align:top}
    .summary{color:#475569;font-style:italic} .foot{margin-top:32px;border-top:1px solid #e2e8f0;padding-top:8px;color:#94a3b8;font-size:12px}
  </style></head><body>
    <div class="cat">${esc(article.category)}</div>
    <h1>${esc(article.title)}</h1>
    <p class="summary">${esc(article.summary)}</p>
    <h2>Purpose</h2><p>${esc(article.purpose)}</p>
    <h2>Business purpose</h2><p>${esc(article.businessPurpose)}</p>
    <h2>Who should use this</h2><p>${esc(article.whoShouldUse)}</p>
    <h2>Step by step</h2>${ol(article.steps)}
    ${fields ? `<h2>Fields</h2>${fields}` : ''}
    ${article.validationRules?.length ? `<h2>Validation rules</h2>${list(article.validationRules)}` : ''}
    <h2>Best practice tips</h2>${list(article.bestPractices)}
    <h2>Common mistakes</h2>${list(article.commonMistakes)}
    ${faqs ? `<h2>FAQs</h2>${faqs}` : ''}
    <h2>What happens next</h2>${list(article.nextSteps)}
    <div class="foot">DLPP Corporate Matters System — Help &amp; Training Centre</div>
  </body></html>`;
}

function printArticle(article: HelpArticleType) {
  const html = buildArticleHtml(article);
  const w = window.open('', '_blank', 'width=820,height=900');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  window.setTimeout(() => w.print(), 350);
}

function downloadArticle(article: HelpArticleType) {
  const html = buildArticleHtml(article);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `help-${article.id}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------ helpful --------------------------- */

function HelpfulFeedback({ articleId }: { articleId: string }) {
  const key = `corporate_help_feedback_${articleId}`;
  const [choice, setChoice] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved === 'up' || saved === 'down') setChoice(saved);
    } catch {
      /* ignore */
    }
  }, [key]);

  const record = (value: 'up' | 'down') => {
    setChoice(value);
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      {choice ? (
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Thanks for your feedback.
        </p>
      ) : (
        <>
          <span className="text-sm font-medium text-slate-600">Was this helpful?</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => record('up')}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Yes
            </button>
            <button
              type="button"
              onClick={() => record('down')}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-red-300 hover:text-red-700"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              No
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------ article --------------------------- */

export function HelpArticle({
  article,
  role,
  onSelectArticle,
  onStartTour,
  compact = false,
}: HelpArticleProps) {
  const { toggleFavourite, isFavourite } = useHelp();
  const related = getRelatedArticles(article);
  const tour = getTourForArticle(article.id);
  const roleNote = role !== 'all' && article.roleNotes ? article.roleNotes[role] : undefined;
  const fav = isFavourite(article.id);

  return (
    <article className={cn('space-y-6', compact ? 'text-sm' : 'text-[15px]')}>
      {/* Toolbar (full view only) */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleFavourite(article.id)}
            className={cn(fav && 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100')}
          >
            <Star className={cn('mr-1.5 h-4 w-4', fav && 'fill-amber-400 text-amber-400')} />
            {fav ? 'Favourited' : 'Favourite'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => printArticle(article)}>
            <Printer className="mr-1.5 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadArticle(article)}>
            <Download className="mr-1.5 h-4 w-4" />
            Download
          </Button>
        </div>
      )}

      {/* Purpose */}
      <section>
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 leading-relaxed text-slate-700">
          {article.purpose}
        </p>
      </section>

      {/* Start tour */}
      {tour && (
        <Button
          onClick={() => onStartTour(tour.id)}
          className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <PlayCircle className="h-4 w-4" />
          Start guided tour
        </Button>
      )}

      {/* Role-specific note */}
      {roleNote && (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
          <div className="mb-1 flex items-center gap-2 text-emerald-700">
            <BadgeInfo className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              For {HELP_ROLE_LABELS[role as HelpRole]}
            </span>
          </div>
          <p className="leading-relaxed text-slate-700">{roleNote}</p>
        </section>
      )}

      {/* Business purpose */}
      <section>
        <SectionHeading icon={Building} tone="blue">
          Business purpose
        </SectionHeading>
        <p className="leading-relaxed text-slate-600">{article.businessPurpose}</p>
      </section>

      {/* Who should use */}
      <section>
        <SectionHeading icon={UserCircle} tone="emerald">
          Who should use this
        </SectionHeading>
        <p className="leading-relaxed text-slate-600">{article.whoShouldUse}</p>
      </section>

      {/* Steps */}
      <section>
        <SectionHeading icon={ListChecks} tone="emerald">
          Step by step
        </SectionHeading>
        <ol className="space-y-2">
          {article.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              <span className="leading-relaxed text-slate-600">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Required fields */}
      {article.requiredFields && article.requiredFields.length > 0 && (
        <section>
          <SectionHeading icon={FormInput} tone="slate">
            Fields
          </SectionHeading>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            {article.requiredFields.map((field, i) => (
              <div
                key={field.name}
                className={cn('flex flex-col gap-0.5 p-2.5', i > 0 && 'border-t border-slate-100')}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{field.name}</span>
                  {field.required ? (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Required</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-slate-500">
                      Optional
                    </Badge>
                  )}
                </div>
                <span className="text-sm leading-relaxed text-slate-500">{field.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Validation rules */}
      {article.validationRules && article.validationRules.length > 0 && (
        <section>
          <SectionHeading icon={ShieldAlert} tone="blue">
            Validation rules
          </SectionHeading>
          <ul className="space-y-1.5">
            {article.validationRules.map((rule, i) => (
              <li key={i} className="flex gap-2 leading-relaxed text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                {rule}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Best practices */}
      <section>
        <SectionHeading icon={Lightbulb} tone="emerald">
          Best practice tips
        </SectionHeading>
        <ul className="space-y-1.5">
          {article.bestPractices.map((b, i) => (
            <li key={i} className="flex gap-2 leading-relaxed text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* Common mistakes */}
      <section>
        <SectionHeading icon={AlertTriangle} tone="amber">
          Common mistakes
        </SectionHeading>
        <ul className="space-y-1.5">
          {article.commonMistakes.map((m, i) => (
            <li key={i} className="flex gap-2 leading-relaxed text-slate-600">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
              {m}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQs */}
      {article.faqs && article.faqs.length > 0 && (
        <section>
          <SectionHeading icon={HelpCircle} tone="slate">
            Frequently asked
          </SectionHeading>
          <div className="space-y-2">
            {article.faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-lg border border-slate-200 bg-white px-3 py-2 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-medium text-slate-800">
                  {faq.question}
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Next steps */}
      <section>
        <SectionHeading icon={Target} tone="emerald">
          What happens next
        </SectionHeading>
        <ul className="space-y-1.5">
          {article.nextSteps.map((n, i) => (
            <li key={i} className="flex gap-2 leading-relaxed text-slate-600">
              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
              {n}
            </li>
          ))}
        </ul>
      </section>

      {/* Helpful feedback (full view only) */}
      {!compact && <HelpfulFeedback articleId={article.id} />}

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-slate-200 pt-4">
          <div className="mb-2 flex items-center gap-2 text-slate-500">
            <Link2 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Related help topics</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectArticle(r.id)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {r.title}
                <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
