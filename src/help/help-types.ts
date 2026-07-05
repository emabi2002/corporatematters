// ============================================================================
// DLPP Corporate Matters - Help & Training Centre : Type System
// ----------------------------------------------------------------------------
// Everything in the Help Centre is data-driven. Add new modules by adding data
// (articles / tours / tooltips) without changing any application code.
// ============================================================================

/** Actual application roles (from src/lib/roles-permissions.ts). */
export type AppRole =
  | 'legal_secretary'
  | 'legal_officer_corporate'
  | 'senior_legal_officer_corporate'
  | 'legal_officer_legislation'
  | 'manager_legal_services'
  | 'director_policy_legal'
  | 'deputy_secretary'
  | 'secretary'
  | 'system_administrator';

/**
 * Broad audience "buckets" used to tag help articles so the Help Centre can
 * surface role-relevant content. App roles map to one or more audiences.
 */
export type HelpAudience =
  | 'all'
  | 'registry' // Legal Secretary – registers & closes matters
  | 'officer' // Legal Officers – work assigned matters
  | 'reviewer' // Senior Officer / Manager / Director – approve drafts
  | 'manager' // Manager Legal Services – assign & manage
  | 'director' // Director Policy & Legal
  | 'executive' // Deputy Secretary / Secretary
  | 'admin'; // System Administrator

export interface AudienceMeta {
  id: HelpAudience;
  label: string;
  description: string;
}

/** A single step inside a written "step-by-step instructions" list. */
export interface HelpStep {
  title: string;
  detail: string;
}

/** A field described in an article's "required fields" list. */
export interface HelpField {
  name: string;
  description: string;
  required?: boolean;
}

/** A frequently-asked question / answer pair. */
export interface HelpFAQ {
  q: string;
  a: string;
}

/**
 * A media item shown at the top of an article. Drop in real screenshots or
 * training videos by adding an item here — no code changes required.
 * - image:   a screenshot (src = image path/URL)
 * - video:   a self-hosted training video (src = video URL)
 * - youtube: an embedded walkthrough (src = YouTube video id)
 * - tour:    an interactive walkthrough launcher (tourId = tour id)
 */
export interface HelpMedia {
  type: 'image' | 'video' | 'youtube' | 'tour';
  src?: string;
  tourId?: string;
  caption?: string;
  alt?: string;
}

/**
 * A complete help article. Mirrors the mandated article structure:
 * purpose, audience, business purpose, steps, required fields, validation,
 * tips, mistakes, FAQ, related modules, next steps.
 */
export interface HelpArticle {
  id: string;
  title: string;
  /** Category id (see HelpCategory). */
  category: string;
  /** lucide-react icon name. */
  icon: string;
  /** One-line summary shown in cards & search results. */
  summary: string;
  /** Audiences this article is most relevant to. */
  audiences: HelpAudience[];
  /** App routes that should surface this article contextually. */
  routes?: string[];
  /** Associated guided tour id, if any. */
  tourId?: string;

  // ---- Mandated article body ------------------------------------------------
  purpose: string;
  whoShouldUse: string;
  businessPurpose: string;
  steps: HelpStep[];
  requiredFields?: HelpField[];
  validationRules?: string[];
  tips?: string[];
  commonMistakes?: string[];
  faqs?: HelpFAQ[];
  relatedIds?: string[];
  nextSteps?: string[];

  // ---- Extras ---------------------------------------------------------------
  keywords?: string[];
  /** Screenshots / videos / interactive-walkthrough launchers. */
  media?: HelpMedia[];
  hasVideo?: boolean;
  hasScreenshot?: boolean;
  estMinutes?: number;
  updated?: string;
}

/** Grouping of articles in the Help Centre home. */
export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Tailwind accent classes, e.g. "text-emerald-600 bg-emerald-50". */
  accent: string;
}

/** A single guided-tour step (rendered by driver.js). */
export interface HelpTourStep {
  /** CSS selector, or "center" for a modal-style step. */
  target: string;
  title: string;
  content: string;
  placement?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center'
    | 'auto'
    | 'top-start'
    | 'bottom-start';
  /** Disable the beacon and start immediately. */
  disableBeacon?: boolean;
  /**
   * data-tour value of a tab trigger to activate before this step runs, so a
   * step targeting content inside an inactive tab always highlights. The
   * GuidedTour clicks the matching [data-tour="..."] trigger.
   */
  activateTab?: string;
}

/** A complete guided walkthrough. */
export interface HelpTour {
  id: string;
  title: string;
  description: string;
  /** Route the tour is designed for (used for "run on this page" hints). */
  route?: string;
  /** Related article id opened alongside the tour. */
  articleId?: string;
  steps: HelpTourStep[];
}

/** Context-help tooltip definition, referenced by id from any field. */
export interface HelpTooltipDef {
  id: string;
  label?: string;
  content: string;
}

export interface KeyboardShortcut {
  keys: string[];
  description: string;
}

export interface QuickStartStep {
  title: string;
  description: string;
  articleId?: string;
  tourId?: string;
  icon: string;
}

/** Feedback captured by the "Was this helpful?" control. */
export interface HelpFeedback {
  articleId: string;
  helpful: boolean;
  at: string;
}
