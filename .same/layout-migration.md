# Layout Migration: Adopt Land Case System shell

## Plan
- [x] Clone landcasesystem and read AppLayout / Sidebar / TopHeader
- [x] Read current corporatematters AppLayout / Sidebar / TopHeader
- [x] Rebuild AppLayout (collapsible sidebar, mobile drawer, sticky header)
      -> collapse state persisted to localStorage (`corporate_sidebar_collapsed`)
      -> desktop margin shifts lg:ml-16 / lg:ml-64; mobile uses overlay drawer
- [x] Sidebar already dark slate w/ grouped nav + emerald active + w-64/w-16
      -> added localStorage persistence (`corporate_sidebar_open_groups`)
      -> added auto-open of the group containing the active route
- [x] TopHeader already sticky w/ toggles, search, notifications, avatar dropdown, logout
- [x] Kept Corporate routes + RBAC/module keys + wording
- [x] Standardized main padding (p-4 lg:p-6); removed dup padding on dashboard
- [x] Type check: 0 new errors (36 pre-existing from incomplete db types)
- [ ] Version + visual verify (login required in preview to see authed shell)

## Required wording (menu) — DONE
Dashboard, Matter Workflow, Register Matter, My Matters, Pending Assignment,
Pending Review, Matter Register, Documents, Tasks, Notifications,
Reports & Analytics, Administration
