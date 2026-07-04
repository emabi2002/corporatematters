// ============================================================================
// DLPP Corporate Matters - Help & Training Centre : Print / PDF export
// ----------------------------------------------------------------------------
// Client-only helpers. printArticle() prints a single article via a hidden
// iframe (leaving the app untouched); downloadArticlePdf() builds a text PDF.
// ============================================================================

import type { HelpArticle } from './help-types';
import { getCategory } from './help-content';

function sectionsFor(a: HelpArticle): { heading: string; lines: string[] }[] {
  const s: { heading: string; lines: string[] }[] = [];
  s.push({ heading: 'Purpose', lines: [a.purpose] });
  s.push({ heading: 'Who should use this', lines: [a.whoShouldUse] });
  s.push({ heading: 'Business purpose', lines: [a.businessPurpose] });
  s.push({
    heading: 'Step-by-step instructions',
    lines: a.steps.map((st, i) => `${i + 1}. ${st.title} — ${st.detail}`),
  });
  if (a.requiredFields?.length) {
    s.push({
      heading: 'Required fields',
      lines: a.requiredFields.map(
        (f) => `• ${f.name}${f.required ? ' (required)' : ''}: ${f.description}`
      ),
    });
  }
  if (a.validationRules?.length) {
    s.push({ heading: 'Validation rules', lines: a.validationRules.map((r) => `• ${r}`) });
  }
  if (a.tips?.length) {
    s.push({ heading: 'Tips & best practices', lines: a.tips.map((t) => `• ${t}`) });
  }
  if (a.commonMistakes?.length) {
    s.push({ heading: 'Common mistakes', lines: a.commonMistakes.map((m) => `• ${m}`) });
  }
  if (a.faqs?.length) {
    s.push({
      heading: 'Frequently asked questions',
      lines: a.faqs.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`]),
    });
  }
  if (a.nextSteps?.length) {
    s.push({ heading: 'Next steps', lines: a.nextSteps.map((n) => `• ${n}`) });
  }
  return s;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function printArticle(a: HelpArticle) {
  if (typeof window === 'undefined') return;
  const category = getCategory(a.category);
  const sections = sectionsFor(a);

  const body = sections
    .map(
      (sec) => `
      <section>
        <h2>${escapeHtml(sec.heading)}</h2>
        ${sec.lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('')}
      </section>`
    )
    .join('');

  const html = `<!doctype html><html><head><meta charset="utf-8" />
    <title>${escapeHtml(a.title)} — DLPP Corporate Matters Help</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; line-height: 1.55; margin: 40px; }
      .brand { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #059669; font-family: Arial, sans-serif; }
      h1 { font-size: 26px; margin: 6px 0 2px; }
      .summary { color: #475569; font-style: italic; margin: 0 0 4px; }
      .meta { font-size: 12px; color: #94a3b8; font-family: Arial, sans-serif; border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 18px; }
      h2 { font-size: 15px; font-family: Arial, sans-serif; color: #0f766e; margin: 18px 0 6px; }
      p { margin: 4px 0; font-size: 13px; }
      footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 11px; color: #94a3b8; font-family: Arial, sans-serif; }
    </style></head>
    <body>
      <div class="brand">DLPP Corporate Matters — Help &amp; Training Centre</div>
      <h1>${escapeHtml(a.title)}</h1>
      <p class="summary">${escapeHtml(a.summary)}</p>
      <div class="meta">${category ? escapeHtml(category.title) : 'Help'}${
        a.estMinutes ? ` &middot; ${a.estMinutes} min read` : ''
      }</div>
      ${body}
      <footer>Department of Lands &amp; Physical Planning · Printed from the Corporate Matters Help Centre.</footer>
    </body></html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  const trigger = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
  // Give the iframe a moment to render before printing.
  setTimeout(trigger, 300);
}

export async function downloadArticlePdf(a: HelpArticle) {
  if (typeof window === 'undefined') return;
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const marginX = 48;
  const marginTop = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - marginX * 2;
  let y = marginTop;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 48) {
      doc.addPage();
      y = marginTop;
    }
  };

  const write = (text: string, opts: { size: number; bold?: boolean; color?: [number, number, number]; gap?: number }) => {
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(opts.size);
    doc.setTextColor(...(opts.color ?? [30, 41, 59]));
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    for (const line of lines) {
      ensureSpace(opts.size + 4);
      doc.text(line, marginX, y);
      y += opts.size + 4;
    }
    y += opts.gap ?? 0;
  };

  // Header
  write('DLPP CORPORATE MATTERS — HELP & TRAINING CENTRE', { size: 9, bold: true, color: [5, 150, 105], gap: 4 });
  write(a.title, { size: 20, bold: true, color: [15, 23, 42], gap: 2 });
  write(a.summary, { size: 11, color: [71, 85, 105], gap: 6 });
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1.5);
  ensureSpace(12);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 16;

  for (const sec of sectionsFor(a)) {
    ensureSpace(22);
    write(sec.heading, { size: 13, bold: true, color: [15, 118, 110], gap: 2 });
    for (const line of sec.lines) {
      write(line, { size: 10.5, color: [30, 41, 59], gap: 1 });
    }
    y += 6;
  }

  ensureSpace(24);
  write('Department of Lands & Physical Planning · Corporate Matters Help Centre', {
    size: 8,
    color: [148, 163, 184],
  });

  doc.save(`DLPP-Help-${a.id}.pdf`);
}
