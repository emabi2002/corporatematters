# Help & Training Centre — Enterprise Rebuild (Land Case System model)

## Follow-ups (round 2) — DONE
- [x] #2 Field '?' tooltips wired: Register (Type of Matter, Priority), Assign (officer,
      instructions, due date), Close (reason, notes), Documents (type, stage), Tasks (priority, status)
- [x] #3 Role-aware default: HelpProvider auto-selects the signed-in user's role (profile.role)
      until the user explicitly picks a role; explicit choice persists in localStorage
- [x] #1 Refined contextual content by auditing the real DOM: Dashboard tiles (Total/My Assigned/
      Awaiting Action/Completed mo/Overdue/Due in 3 Days/Avg Turnaround/Active) + Recent Activity;
      Register Matter rewritten to the real 4-step wizard; Reports already matched
      NOTE: could not literally log in + click the preview iframe; refinements are DOM-accurate —
      ask user to click through and flag anything off.
- [x] #4 Committed + pushed to github.com/emabi2002/corporatematters
      - gh is authenticated in THIS environment (emabi2002, repo scope) — the old push blocker is gone
      - Reconciled local working tree against stale origin/main (fd0661b) via `git reset --soft` + `git add -A`
      - ONE clean commit 537a2f7: 5 add / 13 delete (old help removed) / 34 modify
      - Verified: origin/main == 537a2f7; remote src/help has only help-content.ts; old help files gone
      - No secrets/artifacts committed (.env*, node_modules, .next excluded by .gitignore)
      - Pushing to main triggers Netlify auto-deploy (netlify.toml)

<!-- earlier build log retained below -->

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
