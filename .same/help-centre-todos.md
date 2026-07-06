# Help & Training Centre — Enterprise Rebuild (Land Case System model)

Model studied from `landcasesystem` repo:
- `src/help/help-content.ts` (single source: types, roles, categories, articles, tours, route map, helpers)
- `src/components/help/*` (HelpProvider, HelpButton, HelpDrawer, HelpCentre, HelpArticle, HelpTooltip, HelpTopicIcon, LabelWithHelp, GuidedTour, WelcomeTour, index)
- `src/app/help/page.tsx`
- Mounted in ClientBody: `<HelpProvider>{children}<HelpButton/><HelpDrawer/><WelcomeTour/></HelpProvider>`

Adapt to Corporate Matters: EMERALD branding (not purple), 9 corporate roles, self-contained tour engine (no external dep).

## Build steps
- [x] 1. `src/help/help-content.ts` — types (enhanced: routes, businessPurpose, validationRules, faqs, nextSteps), 9 roles + labels, 8 categories, 28 articles, 16 tours, route map, helpers
- [x] 2. `src/components/help/HelpTopicIcon.tsx` — lucide icon map
- [x] 3. `src/components/help/GuidedTour.tsx` — self-contained tour engine (useGuidedTour) — NO external dep
- [x] 4. `src/components/help/HelpProvider.tsx` — context (route-aware, role, recently-viewed, favourites)
- [x] 5. `src/components/help/HelpTooltip.tsx` + `LabelWithHelp.tsx`
- [x] 6. `src/components/help/HelpArticle.tsx` — full renderer (purpose, business purpose, steps, fields, validation, tips, mistakes, faqs, next steps, related, print/download, favourite, was-this-helpful)
- [x] 7. `src/components/help/HelpDrawer.tsx` — contextual drawer (search, role, home + article)
- [x] 8. `src/components/help/HelpCentre.tsx` — full page (hero search, role pills, categories, tour launcher, recent, favourites, article reader, ?article/?tour deep links)
- [x] 9. `src/components/help/WelcomeTour.tsx` + `HelpButton.tsx` (+ HelpLauncher) + `index.ts`
- [x] 10. `src/app/help/page.tsx`
- [x] 11. Mount in ClientBody (inside AuthProvider): HelpProvider + HelpButton + HelpDrawer + GuidedTour + WelcomeTour
- [x] 12. Sidebar "Help & Training" group (Help Centre + Guided Tours) + TopHeader help icon button
- [x] 13. data-tour anchors — ALL 105 anchors already on disk from prior session; every tour target resolves
- [x] 14. Lint (0 errors, only pre-existing warnings), tsc 0 errors, all routes 200
- [x] 15. Versioned (v23, v24). Preview screenshot shows login/loading because the preview is unauthenticated — Help UI only shows on authed pages (by design). Verified via tsc + route 200s + cross-reference script instead.
- [x] 16. Wired HelpTooltip "?" icons onto Register Matter fields (Type of Matter, Priority)
- [x] 17. Cross-reference validation: 28 articles / 16 tours / 8 categories / 9 roles; all relatedIds/tourIds/articleIds resolve; all 22 required routes map correctly

## To see it: log in (corporate@dlpp.gov.pg / Corporate@2025), then:
- Floating emerald Help button (bottom-right) + Help icon in the header open the contextual drawer for the current page
- Sidebar "Help & Training" > Help Centre (/help) or Guided Tours
- First login auto-starts the Welcome Tour

## Corporate roles
legal_secretary, legal_officer_corporate, senior_legal_officer_corporate,
legal_officer_legislation, manager_legal_services, director_policy_legal,
deputy_secretary, secretary, system_administrator

## Articles (28)
login, dashboard, matter-register, register-new-matter, matter-assignment,
my-matters, pending-assignment, pending-review, matter-details, land-lease-details,
legal-issues, stakeholders, documents, tasks, draft-review, notifications,
matter-closure, reports, admin, user-management, groups-permissions, divisions,
matter-types, document-types, reference-data, activity-timeline, audit-trail, help-centre

## Tours (16)
welcome, dashboard, matter-register, register-new-matter, matter-assignment,
matter-details, documents, tasks, draft-review, notifications, matter-closure,
reports, admin, user-management, reference-data, help-centre
