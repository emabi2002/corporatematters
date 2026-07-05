// ============================================================================
// DLPP Corporate Matters - Help & Training Centre : Guided Tours
// ----------------------------------------------------------------------------
// Tours target elements via [data-tour="..."] selectors. The GuidedTour
// component converts any missing target into a centered ("body") step, so a
// tour always runs even if a page has not yet been anchored.
// ============================================================================

import type { HelpTour } from './help-types';

export const HELP_TOURS: HelpTour[] = [
  // --------------------------------------------------------------------------
  {
    id: 'new-user',
    title: 'New User Tour',
    description: 'A guided orientation of the whole Corporate Matters System.',
    route: '/dashboard',
    articleId: 'help-centre',
    steps: [
      { target: 'center', title: 'Welcome to DLPP Corporate Matters', content: 'This quick tour introduces the main areas of the system. Use Next to continue, or Skip at any time.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="sidebar"]', title: 'Navigation Sidebar', content: 'All modules live here — Dashboard, Matter Workflow, Register, Management, Reports and Administration. Groups expand and collapse.', placement: 'right' },
      { target: '[data-tour="header-search"]', title: 'Global Search', content: 'Search matters and documents from anywhere. Results appear as you type; press Enter to open the full register.', placement: 'bottom' },
      { target: '[data-tour="notification-bell"]', title: 'Notifications', content: 'The bell shows your unread alerts — assignments, reviews, deadlines and closures.', placement: 'bottom' },
      { target: '[data-tour="help-fab"]', title: 'Help, Anytime', content: 'This floating Help button opens context-aware help for whatever page you are on. Look for it on every screen.', placement: 'left' },
      { target: '[data-tour="user-menu"]', title: 'Your Account', content: 'Your name, role and Log out live here. Your role controls which menus and actions you see.', placement: 'bottom' },
      { target: 'center', title: 'You are ready to go', content: 'Explore the Dashboard, then open the Matter Register. Open the Help Centre any time for module-specific tours.', placement: 'center' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'login',
    title: 'Login Tour',
    description: 'How to sign in securely and manage your session.',
    route: '/auth/login',
    articleId: 'login',
    steps: [
      { target: 'center', title: 'Signing In', content: 'Authentication loads your role and permissions. Let’s walk through it.', placement: 'center', disableBeacon: true },
      { target: '#email', title: 'Email', content: 'Enter your official DLPP email address. It is not case-sensitive.', placement: 'bottom' },
      { target: '#password', title: 'Password', content: 'Enter your confidential password. Contact your administrator if you need a reset.', placement: 'bottom' },
      { target: 'center', title: 'Sign In', content: 'Select Sign In to enter the system. You will land on the Dashboard.', placement: 'center' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'dashboard',
    title: 'Dashboard Tour',
    description: 'Read your workload, alerts and quick actions.',
    route: '/dashboard',
    articleId: 'dashboard',
    steps: [
      { target: 'center', title: 'Your Command Centre', content: 'The Dashboard summarises every matter you can access. Let’s explore it.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="dashboard-metrics"]', title: 'Summary Cards', content: 'These tiles show totals — Total, Active, Pending Review, Overdue and Closed. Click a tile to open the matching matters.', placement: 'bottom' },
      { target: '[data-tour="dashboard-charts"]', title: 'Workflow Breakdown', content: 'Charts show how many matters sit at each workflow stage so you can spot bottlenecks.', placement: 'top' },
      { target: '[data-tour="dashboard-activity"]', title: 'Recent Activity', content: 'The latest actions across matters — assignments, submissions, approvals and closures.', placement: 'top' },
      { target: 'center', title: 'Work the red first', content: 'Always clear overdue (red) and due-soon (amber) matters first. Then open the Matter Register to progress work.', placement: 'center' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'matter-register',
    title: 'Matter Register Tour',
    description: 'Search, filter, sort, export and open matters.',
    route: '/matters',
    articleId: 'matter-register',
    steps: [
      { target: 'center', title: 'The Matter Register', content: 'This is the master list of matters you can access. Let’s learn to find and open them.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="matters-search"]', title: 'Search', content: 'Filter by matter number, subject, type or requester. Results update as you type.', placement: 'bottom' },
      { target: '[data-tour="matters-filters"]', title: 'Quick Filters', content: 'Narrow the list to All, My, Active, Unassigned, In Review, Overdue or Closed.', placement: 'bottom' },
      { target: '[data-tour="matters-table"]', title: 'The Matters Table', content: 'Click a column header to sort. Row colours and badges show priority and workflow stage. Click a row to open the matter.', placement: 'top' },
      { target: '[data-tour="matters-export"]', title: 'Export to CSV', content: 'Download the current (filtered) list for Excel or reporting.', placement: 'left' },
      { target: '[data-tour="matters-new"]', title: 'Register a Matter', content: 'Start the four-step registration wizard for a new request.', placement: 'left' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'register-new-matter',
    title: 'Register New Matter Tour',
    description: 'Complete the four-step registration wizard.',
    route: '/matters/new',
    articleId: 'register-new-matter',
    steps: [
      { target: 'center', title: 'Register a New Matter', content: 'Registration creates the official record and generates a unique matter number. There are four steps.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="wizard-step-1"]', title: 'Step 1 — Matter Information', content: 'Enter the subject/title, select the Type of Matter and set the Priority (Urgent → Low).', placement: 'bottom' },
      { target: '[data-tour="wizard-step-2"]', title: 'Step 2 — Requester & Division', content: 'Record who requested the work, their division, and the date received.', placement: 'bottom' },
      { target: '[data-tour="wizard-step-3"]', title: 'Step 3 — Background', content: 'Describe the request so the assigned officer has full context.', placement: 'bottom' },
      { target: '[data-tour="wizard-step-4"]', title: 'Step 4 — Review & Submit', content: 'Check the summary, go back to correct anything, then submit to create the matter at the “Registered” stage.', placement: 'top' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'matter-assignment',
    title: 'Matter Assignment Tour',
    description: 'Assign a matter to an officer with instructions and a due date.',
    route: '/matters/[id]/assign',
    articleId: 'matter-assignment',
    steps: [
      { target: 'center', title: 'Assigning a Matter', content: 'Assignment gives a matter an owner, instructions and a deadline. Let’s walk through it.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="assign-officer"]', title: 'Select an Officer', content: 'Choose the Legal Officer who will own and progress the matter.', placement: 'bottom' },
      { target: '[data-tour="assign-instructions"]', title: 'Instructions', content: 'Explain the required output and any special considerations.', placement: 'bottom' },
      { target: '[data-tour="assign-due-date"]', title: 'Due Date', content: 'Set a realistic deadline — it drives due-soon and overdue alerts.', placement: 'bottom' },
      { target: '[data-tour="assign-submit"]', title: 'Confirm & Notify', content: 'Save the assignment. The officer is notified and the stage moves to “Assigned”.', placement: 'top' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'matter-details',
    title: 'Matter Details Tour',
    description: 'Navigate the matter workspace and complete details.',
    route: '/matters/[id]',
    articleId: 'matter-details',
    steps: [
      { target: 'center', title: 'The Matter Workspace', content: 'Everything about a matter lives here across a set of tabs. Let’s orient you.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="matter-header"]', title: 'Header Strip', content: 'Matter number, subject, priority, stage, officer and due date at a glance.', placement: 'bottom' },
      { target: '[data-tour="matter-tabs"]', title: 'Workspace Tabs', content: 'Move across Details, Land/Lease, Legal Issues, Stakeholders, Documents, Tasks, Review, Timeline, Audit and Closure.', placement: 'bottom' },
      { target: 'center', title: 'Complete Details', content: 'Use “Complete Details” to record file references, legal analysis and risk, then advance the stage to “Details Completed”.', placement: 'center' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'land-lease-details',
    title: 'Land & Lease Tour',
    description: 'Record titles, surveys, ILG details and location.',
    route: '/matters/[id]',
    articleId: 'land-lease-details',
    steps: [
      { target: 'center', title: 'Land & Lease Details', content: 'Capture the property particulars that many DLPP matters rely on.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="tab-land"]', title: 'Open the Land/Lease tab', content: 'Select this tab in the matter workspace to view the land and lease information.', placement: 'bottom' },
      { target: '[data-tour="land-content"]', title: 'Land & Lease Information', content: 'Here you will find the main, title, survey and purchase references, ILG details and property location. Use “Edit Details” to record them.', placement: 'top' },
      { target: 'center', title: 'Attach Documentation', content: 'Upload titles and survey plans under the Documents tab and reference them here.', placement: 'center' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'legal-issues',
    title: 'Legal Issues Tour',
    description: 'Document issues, applicable law, claims and risk.',
    route: '/matters/[id]',
    articleId: 'legal-issues',
    steps: [
      { target: 'center', title: 'Recording Legal Issues', content: 'Capture a structured legal analysis of the matter.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="tab-legal"]', title: 'Open the Legal Issues tab', content: 'Select this tab to view the legal analysis — issues, claims, applicable law and risk.', placement: 'bottom' },
      { target: '[data-tour="legal-content"]', title: 'Legal Analysis', content: 'Legal issues, claims & allegations, applicable law and stakeholders appear here. Use “Edit Details” to record them; state each issue as a question and cite legislation precisely.', placement: 'top' },
      { target: 'center', title: 'Risk Classification', content: 'Set the risk level when editing — it feeds management reporting.', placement: 'center' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'stakeholders',
    title: 'Stakeholders Tour',
    description: 'Record parties, roles and contact details.',
    route: '/matters/[id]',
    articleId: 'stakeholders',
    steps: [
      { target: 'center', title: 'Managing Stakeholders', content: 'Record every party connected to the matter and their role.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="tab-legal"]', title: 'Open the Legal Issues tab', content: 'Stakeholders are captured alongside the legal analysis — open this tab.', placement: 'bottom' },
      { target: '[data-tour="stakeholders-section"]', title: 'Relevant Stakeholders', content: 'Agencies, organisations, landowners and individuals — with contacts and roles — are listed here. Use official names and keep contacts current.', placement: 'top' },
      { target: 'center', title: 'Keep It Current', content: 'Accurate parties support correct correspondence and conflict checks.', placement: 'center' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'documents',
    title: 'Documents Tour',
    description: 'Upload, categorise, find and manage documents.',
    route: '/documents',
    articleId: 'documents',
    steps: [
      { target: 'center', title: 'Document Management', content: 'The central library for every file attached to matters.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="documents-upload"]', title: 'Upload', content: 'Choose the matter, select the file and set its Document Type and category (Initial, Draft, Final, Supporting).', placement: 'bottom' },
      { target: '[data-tour="documents-search"]', title: 'Search & Filter', content: 'Find files by title and filter by All / Final / Drafts.', placement: 'bottom' },
      { target: '[data-tour="documents-table"]', title: 'View, Download, Archive', content: 'Open or download files; archive superseded versions to keep the list clean.', placement: 'top' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'tasks',
    title: 'Tasks Tour',
    description: 'Create, assign, track and complete tasks.',
    route: '/tasks',
    articleId: 'tasks',
    steps: [
      { target: 'center', title: 'Tasks & To-Dos', content: 'Break each matter into accountable, time-bound actions.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="tasks-new"]', title: 'Create a Task', content: 'Add a task with its matter, assignee, priority, status and due date.', placement: 'bottom' },
      { target: '[data-tour="tasks-filters"]', title: 'Quick Filters', content: 'Focus with My, Pending, In Progress, Overdue or Completed.', placement: 'bottom' },
      { target: '[data-tour="tasks-table"]', title: 'Update Progress', content: 'Change status inline and mark tasks Completed when done.', placement: 'top' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'draft-review',
    title: 'Draft Review Tour',
    description: 'Submit, return, revise and approve drafts.',
    route: '/matters/[id]',
    articleId: 'draft-review',
    steps: [
      { target: 'center', title: 'Draft Review Workflow', content: 'Move a draft from officer to reviewer for approval — or return it for revision.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="review-submit"]', title: 'Submit for Review', content: 'Sends the draft to the reviewer; the stage becomes “Pending Review”.', placement: 'bottom' },
      { target: '[data-tour="review-history"]', title: 'Revision History', content: 'Every submission and decision is recorded here for audit.', placement: 'top' },
      { target: 'center', title: 'Approve or Return', content: 'Reviewers approve (→ “Approved for Finalization”) or return with comments (→ “Returned for Revision”).', placement: 'center' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'notifications',
    title: 'Notifications Tour',
    description: 'Use the bell, tabs and actions to stay informed.',
    route: '/notifications',
    articleId: 'notifications',
    steps: [
      { target: 'center', title: 'Notifications & Alerts', content: 'Stay on top of assignments, reviews, deadlines and closures.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="notification-bell"]', title: 'The Bell', content: 'A red count means new notifications. Click for a quick dropdown.', placement: 'bottom' },
      { target: '[data-tour="notifications-tabs"]', title: 'All / Unread / Read', content: 'Filter the full list and use pill filters to focus.', placement: 'bottom' },
      { target: '[data-tour="notifications-list"]', title: 'Act & Manage', content: 'Click through to the matter, mark read, or delete items you no longer need.', placement: 'top' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'matter-closure',
    title: 'Matter Closure Tour',
    description: 'Run checks, summarise and archive a completed matter.',
    route: '/matters/[id]/close',
    articleId: 'matter-closure',
    steps: [
      { target: 'center', title: 'Closing a Matter', content: 'Closure completes a matter once all work and approvals are done.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="closure-checks"]', title: 'Closure Checks', content: 'Confirm the draft is approved, tasks are complete and required documents are attached.', placement: 'bottom' },
      { target: '[data-tour="closure-summary"]', title: 'Closure Summary', content: 'Summarise the outcome and deliverable so a future reader understands it.', placement: 'bottom' },
      { target: '[data-tour="closure-submit"]', title: 'Approve & Archive', content: 'Confirm closure — the stage moves to “Closed” and the matter is archived.', placement: 'top' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'reports',
    title: 'Reports & Analytics Tour',
    description: 'Read charts, filter by period and export.',
    route: '/reports',
    articleId: 'reports',
    steps: [
      { target: 'center', title: 'Reports & Analytics', content: 'Turn matter data into insight for evidence-based management.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="reports-period"]', title: 'Period & Controls', content: 'Choose the date range and use Export/Print controls.', placement: 'bottom' },
      { target: '[data-tour="reports-metrics"]', title: 'Metric Tiles', content: 'Compact tiles summarise active, overdue and closed matters.', placement: 'bottom' },
      { target: '[data-tour="reports-charts"]', title: 'Charts & Tables', content: 'Distribution bars, the monthly trend line and officer/division tables reveal performance.', placement: 'top' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'admin',
    title: 'Admin Panel Tour',
    description: 'Find your way around the administration tools.',
    route: '/admin',
    articleId: 'admin',
    steps: [
      { target: 'center', title: 'Administration Panel', content: 'Manage users, permissions, divisions and reference data from here. Access is restricted to administrators.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="sidebar"]', title: 'Administration Menu', content: 'The Administration group opens User Management, Groups & Permissions, Divisions, Matter Types, Document Types and Reference Data.', placement: 'right' },
      { target: 'center', title: 'Least Privilege', content: 'Grant only the access each role needs, and deactivate (don’t delete) departing users to keep the audit history intact.', placement: 'center' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'user-management',
    title: 'User Management Tour',
    description: 'Create users, assign roles and manage access.',
    route: '/admin/users',
    articleId: 'user-management',
    steps: [
      { target: 'center', title: 'User Management', content: 'Control who can access the system and what they can do.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="users-add"]', title: 'Add a User', content: 'Create an account with email and initial password, then set the role.', placement: 'bottom' },
      { target: '[data-tour="users-table"]', title: 'Manage Users', content: 'Edit details, change roles, reset passwords or deactivate accounts.', placement: 'top' },
      { target: 'center', title: 'Least Privilege', content: 'Grant only the access each role needs and use groups for consistent permissions.', placement: 'center' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'reference-data',
    title: 'Reference Data Tour',
    description: 'Maintain the controlled lists behind the system.',
    route: '/admin/reference-data',
    articleId: 'reference-data',
    steps: [
      { target: 'center', title: 'Reference Data', content: 'These controlled lists power dropdowns across the system.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="reference-add"]', title: 'Add / Edit', content: 'Create or rename matter types, document types and divisions.', placement: 'bottom' },
      { target: '[data-tour="reference-list"]', title: 'Activate / Deactivate', content: 'Retire values without deleting history to protect existing matters.', placement: 'top' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'timeline',
    title: 'Activity Timeline Tour',
    description: 'Follow the chronological story of a matter.',
    route: '/matters/[id]',
    articleId: 'timeline',
    steps: [
      { target: 'center', title: 'Activity Timeline', content: 'A chronological narrative of everything that happened on a matter.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="tab-timeline"]', title: 'Open the Timeline tab', content: 'Select the Timeline tab in the matter workspace.', placement: 'bottom' },
      { target: '[data-tour="timeline-content"]', title: 'Chronological Events', content: 'Each entry shows the actor, the action and the time — creation, assignment, submissions, approvals and closure. Ideal for handovers.', placement: 'top' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'audit-trail',
    title: 'Audit Trail Tour',
    description: 'See field-level changes with before/after values.',
    route: '/matters/[id]',
    articleId: 'audit-trail',
    steps: [
      { target: 'center', title: 'Audit Trail', content: 'The definitive record of who changed what, when — and the old and new values.', placement: 'center', disableBeacon: true },
      { target: '[data-tour="tab-audit"]', title: 'Open the Audit Trail tab', content: 'Select the Audit Trail tab in the matter workspace.', placement: 'bottom' },
      { target: '[data-tour="audit-content"]', title: 'Field-level Changes', content: 'Every entry records the user, date/time, the field changed and its previous and new values. It is generated automatically and cannot be edited.', placement: 'top' },
    ],
  },
];
