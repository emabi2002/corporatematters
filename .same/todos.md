# DLPP Corporate Matters - Clone Status

## Done
- [x] Cloned repo from GitHub (emabi2002/corporatematters)
- [x] Installed dependencies with Bun (530 packages)
- [x] Connected real DLPP Supabase credentials in `.env.local` (shared 'lands' DB)
- [x] Fixed orphaned `corporate@dlpp.gov.pg` profile + AuthContext fallback role
- [x] Verified all pages load from live data (28/28 queries OK)
- [x] Seeded `corporate_reference_divisions` (14 DLPP divisions)
- [x] Added `corporate@dlpp.gov.pg` to "Corporate Super Admin" RBAC group
      -> user_system_access = [admin, corporate], 16 module permissions
- [x] Seeded 5 demo matters across all workflow stages (file_reference DEMO-001..005)
      Star matter CMS-20260520-7900 (Pending Review) populates all 10 detail tabs

## Login
- Email: corporate@dlpp.gov.pg / Password: Corporate@2025 / Role: system_administrator

## Demo data notes
- All seeded matters have file_reference starting with `DEMO-` (easy to find/delete)
- Star matter: 1 assignment, 5 status-history, 5 activity logs, 1 review, 3 tasks, 2 docs
- Other matters: Closed, Due-soon, Overdue, New/unassigned (for dashboard/reports variety)
- Document rows are metadata-only (no file in storage) - download buttons won't fetch a file

## UI Shell Migration (Land Case System look) — DONE
- [x] AppLayout rebuilt: collapsible sidebar + mobile drawer + sticky header
      collapse state persisted (localStorage `corporate_sidebar_collapsed`)
      desktop content shifts lg:ml-16 / lg:ml-64 with smooth transition
- [x] Sidebar: open/closed groups persisted (`corporate_sidebar_open_groups`)
      + auto-opens the group of the active route
- [x] TopHeader already wired (toggles, search, notifications, avatar, logout)
- [x] Standardized padding: main = p-4 lg:p-6; removed dup p-6 from
      dashboard, matters, notifications, reports pages
- [x] Kept all Corporate routes, RBAC module keys, and menu wording
- [x] 0 new TS errors; all routes compile & return 200

## TypeScript cleanup — DONE (36 -> 0 errors)
- [x] Root cause: supabase-js v2.84 GenericTable requires `Relationships` on every
      table; hand-written database.types.ts had none -> all tables resolved to `never`
- [x] Added `Relationships: []` to all 19 existing tables
- [x] Introspected live DB (service role) + added 5 missing tables:
      groups, user_groups, group_module_permissions, modules, user_system_access
- [x] Added 2 RPC functions: get_user_permissions_by_system, user_has_system_access
- [x] Removed 4 now-unused @ts-expect-error directives (TasksTab x3, EditMatterDialog)
- [x] admin/users: coerce last_sign_in_at/email_confirmed_at undefined -> null
- [x] admin/groups: removed dead `module_route` field (DB column is `route`)
- [x] `bunx tsc --noEmit` => 0 errors; all routes still 200

## Active tasks (round 2)
- [ ] Compact density for Notifications page
- [ ] Compact density for 10-tab Matter Detail page
- [ ] Smart header search: live results dropdown (matters + documents)
- [ ] Quick-filter tabs on Matters register (All / My / Active / Overdue ...)
- [ ] Replace purple 'D' branding with official DLPP logo (login + sidebar)

## Active tasks (selected by user)
- [x] Compact/dense layout for Matters register page (smaller header, p-3 toolbar, dense table)
- [x] Compact/dense layout for Reports page (6 compact metric tiles, tight charts h=240)
- [x] Wire header search to filter/search matters (TopHeader form -> /matters?search=)
      + matters page reads search/status/overdue/view params (sidebar links now work too)
      + removable quick-filter chip in the matters header
- [x] Sidebar: Radix tooltips when collapsed (groups + items) + footer w/ user avatar+role
- [x] Commit changes to GitHub (re-init git -> origin/main; pushed 41fb200; .env.local kept out)

## Follow-up tasks (in progress)
- [ ] Compact/dense layout for Matters register page (src/app/matters/page.tsx)
- [ ] Compact/dense layout for Reports page (src/app/reports/page.tsx)
- [ ] Wire header search -> navigates to /matters?q=... and filters list
- [ ] Sidebar: tooltips on collapsed group buttons + footer with user/role
- [ ] Commit all changes to GitHub repo

## Optional follow-ups
- [ ] Apply the compact density style to remaining internal pages
- [ ] NOTE: log in (corporate@dlpp.gov.pg / Corporate@2025) to see the authed shell in preview
