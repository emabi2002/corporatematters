# Interactive Help & Training Centre — Build Plan

## Engine
- [x] Install react-joyride (2.9.3)
- [x] Types: src/help/help-types.ts
- [x] Content: src/help/help-articles.ts (20 modules, full sections)
- [x] Content: src/help/help-tours.ts (19 guided tours)
- [x] Content: src/help/help-tooltips.ts (context tooltips registry)
- [x] Content: src/help/help-content.ts (aggregator: categories, route map, quick start, shortcuts, FAQ, roles, search)
- [x] Export: src/help/help-export.ts (print + PDF)

## Components (src/components/help/)
- [x] HelpProvider (context: drawer, recent, favourites, tour, feedback, keyboard shortcuts)
- [x] HelpButton (floating + icon/inline variants)
- [x] HelpDrawer (right-side, route-aware article)
- [x] HelpTooltip (context help wrapper + registry)
- [x] HelpArticleView (renders full article)
- [x] HelpBreadcrumb
- [x] RelatedTopics
- [x] HelpSearch (instant, keyboard nav)
- [x] GuidedTour (react-joyride wrapper, resilient targets)
- [x] HelpCentre (/help page content)

## Page
- [x] /help route (AppLayout + HelpCentre, ?article deep links)

## Integration
- [x] HelpProvider + floating button + drawer + tour in ClientBody
- [x] "Help & Training" menu (Help Centre + Guided Tours) in Sidebar (+ data-tour="sidebar")
- [x] Help icon in TopHeader (+ data-tour anchors: header-search, notification-bell, user-menu)
- [x] data-tour anchors on Dashboard + Matters register + New Matter link
- [x] Example HelpTooltips wired on details page (file ref, legal issues, applicable law, risk)

## QA
- [x] Route mapping: each route resolves to correct help article
- [x] Search filters instantly (weighted, multi-term)
- [x] Role-based help renders per role (recommendations)
- [x] Print / PDF / feedback / favourites / recent implemented
- [x] tsc 0 errors; all routes 200 (/ /help /dashboard /matters /matters/new /notifications /reports /admin/users)
- [~] Version created (v4/v5); screenshot service intermittently failing — verified via HTML + curl instead

## Notes
- Tours are resilient: any missing [data-tour] target becomes a centered step, so every tour runs on any page.
- To see the authed Help Centre in preview, log in (corporate@dlpp.gov.pg / Corporate@2025) then click the floating Help button or open /help.

## Round 2 — richer highlighting, tooltips, media, tour targeting
- [x] Tour targeting review (New User Tour): anchors verified on /dashboard; fixed two issues:
      - Floating FAB now uses data-tour="help-fab" (was shared with hidden header icon)
      - GuidedTour now treats invisible (display:none / 0-size) targets as centered steps
- [x] data-tour anchors added across pages (40+ anchors, all cross-referenced by tours):
      matter [id] (header, tabs), assign (officer/instructions/due-date/submit),
      close (checks/summary/submit), reports (period/metrics/charts),
      admin/users (add/table), admin/reference-data (add/list),
      documents (upload/search/table), tasks (new/filters/table),
      notifications (tabs/list), review tab (submit/history), wizard steps 1-4
      + #risk_classification id added so that field highlights
- [x] Context tooltips wired on remaining forms:
      registration wizard (Type of Matter, Priority), tasks dialog (Priority, Status),
      documents upload (Document Type, Stage), user management (Group Assignment)
      (details page already had file ref / legal issues / applicable law / risk)
- [x] Inline "Help" launchers added to page headers: new matter, assign, close,
      reports, documents, tasks, notifications, admin users, reference data
- [x] Media system: HelpMedia type (image | video | youtube | tour) + renderer in HelpArticleView
      - Branded SVG "annotated screenshots" in /public/help (dashboard, matter-register, reports, workflow)
      - Attached to dashboard, matter-register, register-new-matter, documents, reports, draft-review
      - Interactive-walkthrough launcher shown in place of a recorded video
      - Real screenshots/videos now drop in via a URL — no code changes
- [x] tsc 0 errors; SVG assets serve 200; article media verified rendering
- [ ] Deploy: commit + push to github.com/emabi2002/corporatematters

## Round 3 — embed like landcasesystem (mount in AppLayout)
- [x] Moved Help mounting OUT of root ClientBody and INTO the authenticated shell:
      AppLayout now renders <HelpProvider><HelpButton/><HelpDrawer/><GuidedTour/>
- [x] ClientBody reverted to AuthProvider only (no Help on login/unauth pages)
- [x] Cross-route tours preserved despite AppLayout remounting on navigation:
      startTour hands the tour off via sessionStorage; HelpProvider resumes it on mount
- [x] Verified floating Help button is ABSENT on /auth/login and PRESENT in the authed shell
- [x] Route mapping verified end-to-end (script):
      /dashboard->dashboard, /matters->matter-register, /matters/new & /matters/register->register-new-matter,
      /matters/[id]->matter-details, /assign->matter-assignment, /details->matter-details,
      /review->draft-review, /close->matter-closure, /notifications->notifications, /reports->reports,
      /admin->admin (NEW), /admin/users->user-management, /admin/reference-data->reference-data,
      /help->help-centre, unknown->help-centre (fallback)
- [x] Added dedicated Admin Panel article + Admin tour (/admin)
- [x] Added spec example tooltips on real controls: Matter Number & Workflow Stage (matter header),
      Submit for Review (review tab), Close Matter (closure page)
- [x] tsc 0 errors; all routes 200; drawer/button/tour mount confirmed
