/**
 * Builds a single printable "user manual" from every help article, grouped by
 * category, with a table of contents. Used by the Help Centre export buttons.
 */

import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  HELP_ROLE_LABELS,
  type HelpArticle,
} from './help-content';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function list(items?: string[]): string {
  return items && items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '';
}

function ol(items?: string[]): string {
  return items && items.length ? `<ol>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>` : '';
}

function articleHtml(a: HelpArticle): string {
  const fields = a.requiredFields?.length
    ? `<h3>Fields</h3><table><thead><tr><th>Field</th><th>Required</th><th>Description</th></tr></thead><tbody>${a.requiredFields
        .map(
          (f) =>
            `<tr><td>${esc(f.name)}</td><td>${f.required ? 'Yes' : 'No'}</td><td>${esc(f.description)}</td></tr>`,
        )
        .join('')}</tbody></table>`
    : '';
  const faqs = a.faqs?.length
    ? `<h3>FAQs</h3>${a.faqs.map((f) => `<p><strong>${esc(f.question)}</strong><br/>${esc(f.answer)}</p>`).join('')}`
    : '';
  const roles = a.roles.map((r) => HELP_ROLE_LABELS[r]).join(', ');
  return `<article id="a-${a.id}">
    <h2>${esc(a.title)}</h2>
    <p class="summary">${esc(a.summary)}</p>
    <p class="roles"><strong>For:</strong> ${esc(roles)}</p>
    <h3>Purpose</h3><p>${esc(a.purpose)}</p>
    <h3>Business purpose</h3><p>${esc(a.businessPurpose)}</p>
    <h3>Who should use this</h3><p>${esc(a.whoShouldUse)}</p>
    <h3>Step by step</h3>${ol(a.steps)}
    ${fields}
    ${a.validationRules?.length ? `<h3>Validation rules</h3>${list(a.validationRules)}` : ''}
    <h3>Best practice tips</h3>${list(a.bestPractices)}
    <h3>Common mistakes</h3>${list(a.commonMistakes)}
    ${faqs}
    <h3>What happens next</h3>${list(a.nextSteps)}
  </article>`;
}

export function buildManualHtml(): string {
  const generated = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const toc = HELP_CATEGORIES.filter((c) => HELP_ARTICLES.some((a) => a.category === c))
    .map((c) => {
      const items = HELP_ARTICLES.filter((a) => a.category === c)
        .map((a) => `<li><a href="#a-${a.id}">${esc(a.title)}</a></li>`)
        .join('');
      return `<li class="cat"><span>${esc(c)}</span><ul>${items}</ul></li>`;
    })
    .join('');

  const body = HELP_CATEGORIES.filter((c) => HELP_ARTICLES.some((a) => a.category === c))
    .map((c) => {
      const arts = HELP_ARTICLES.filter((a) => a.category === c).map(articleHtml).join('');
      return `<section class="category"><h1>${esc(c)}</h1>${arts}</section>`;
    })
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8"/>
    <title>DLPP Corporate Matters — User Manual</title>
    <style>
      body{font-family:Georgia,'Times New Roman',serif;color:#0f172a;max-width:820px;margin:0 auto;padding:40px 28px;line-height:1.55}
      .cover{text-align:center;padding:60px 0 40px;border-bottom:3px solid #059669;margin-bottom:28px}
      .cover .kicker{color:#059669;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:13px}
      .cover h1{font-size:34px;margin:10px 0 6px}
      .cover p{color:#64748b;margin:2px 0}
      h1{font-size:24px;color:#0f172a;border-bottom:2px solid #059669;padding-bottom:6px;margin-top:40px;page-break-before:always}
      h2{font-size:19px;color:#065f46;margin-top:28px}
      h3{font-size:14px;text-transform:uppercase;letter-spacing:.04em;color:#334155;margin:16px 0 6px}
      .summary{color:#475569;font-style:italic;margin:2px 0 8px}
      .roles{font-size:13px;color:#64748b}
      table{width:100%;border-collapse:collapse;font-size:13px;margin:6px 0}
      th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left;vertical-align:top}
      th{background:#f0fdf4}
      ul,ol{margin:6px 0 6px 22px}
      li{margin:3px 0}
      .toc{page-break-after:always}
      .toc h1{page-break-before:avoid;border:0}
      .toc>ul{list-style:none;margin-left:0}
      .toc .cat>span{font-weight:700;color:#065f46;display:block;margin-top:12px}
      .toc a{color:#0f172a;text-decoration:none}
      article{page-break-inside:avoid}
      @media print{a{color:#0f172a}}
    </style></head><body>
    <div class="cover">
      <div class="kicker">DLPP Corporate Matters System</div>
      <h1>User Manual</h1>
      <p>Help &amp; Training Centre — complete guide</p>
      <p>Generated ${esc(generated)}</p>
    </div>
    <nav class="toc"><h1>Contents</h1><ul>${toc}</ul></nav>
    ${body}
    </body></html>`;
}

export function printManual(): void {
  const html = buildManualHtml();
  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  window.setTimeout(() => w.print(), 400);
}

export function downloadManual(): void {
  const html = buildManualHtml();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dlpp-corporate-matters-user-manual.html';
  a.click();
  URL.revokeObjectURL(url);
}
