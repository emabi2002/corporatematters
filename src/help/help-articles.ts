// ============================================================================
// DLPP Corporate Matters - Help & Training Centre : Article Content
// ----------------------------------------------------------------------------
// Complete, DLPP-specific training content. All copy uses the application's
// real workflow stages, roles, priorities and field names.
// ============================================================================

import type { HelpArticle } from './help-types';

export const HELP_ARTICLES: HelpArticle[] = [
  // --------------------------------------------------------------------------
  // LOGIN
  // --------------------------------------------------------------------------
  {
    id: 'login',
    title: 'Signing In & Account Security',
    category: 'getting-started',
    icon: 'LogIn',
    summary: 'Authenticate securely, manage your password and sign out safely.',
    audiences: ['all'],
    routes: ['/auth/login'],
    tourId: 'login',
    estMinutes: 3,
    hasScreenshot: true,
    purpose:
      'The sign-in screen authenticates you against the DLPP Corporate Matters directory and loads the role and permissions attached to your account.',
    whoShouldUse:
      'Every user of the Corporate Matters System, from Legal Secretary through to the Secretary and System Administrator.',
    businessPurpose:
      'Authentication protects confidential legal matters, enforces role-based access, and creates an audit record of who accessed the system and when.',
    steps: [
      { title: 'Open the system', detail: 'Navigate to the Corporate Matters URL. You will be redirected to the sign-in screen automatically if you are not already authenticated.' },
      { title: 'Enter your email', detail: 'Use your official DLPP email address (for example, corporate@dlpp.gov.pg). Email is not case-sensitive.' },
      { title: 'Enter your password', detail: 'Type the password issued by your System Administrator or the one you set after your last reset.' },
      { title: 'Select Sign In', detail: 'On success you are taken to the Dashboard. Your name and role appear in the sidebar footer and top-right menu.' },
      { title: 'Sign out when finished', detail: 'Open the avatar menu (top-right) and choose "Log out". Always sign out on shared computers.' },
    ],
    requiredFields: [
      { name: 'Email', description: 'Your registered DLPP email address.', required: true },
      { name: 'Password', description: 'Your confidential account password.', required: true },
    ],
    validationRules: [
      'Both email and password are mandatory — the Sign In button submits an empty form as an error.',
      'Credentials must match an active account. Deactivated accounts cannot sign in.',
      'Passwords are a minimum of 8 characters; administrators may enforce stronger policies.',
      'Repeated failed attempts may temporarily lock the session for security.',
    ],
    tips: [
      'Bookmark the sign-in page for quick access.',
      'Use a password manager rather than writing passwords down.',
      'If your role or menus look wrong after signing in, sign out and back in to refresh permissions.',
    ],
    commonMistakes: [
      'Using a personal email instead of the registered DLPP account.',
      'Leaving trailing spaces when copy-pasting a password.',
      'Not signing out on shared registry or kiosk computers.',
    ],
    faqs: [
      { q: 'I forgot my password — what do I do?', a: 'Contact your System Administrator via User Management to trigger a password reset. You will receive new credentials to sign in with, then you can change your password.' },
      { q: 'Why can I see fewer menus than a colleague?', a: 'Menus are filtered by your role and group permissions. A Legal Secretary sees registration tools; a Manager sees assignment and review tools; an Administrator sees everything.' },
      { q: 'My session expired — is my work lost?', a: 'Saved records are safe in the database. Unsaved form entries may be lost, so save drafts regularly.' },
    ],
    relatedIds: ['dashboard', 'user-management'],
    nextSteps: ['Review the Dashboard to see your workload.', 'Take the New User Tour from the Help Centre.'],
    keywords: ['login', 'sign in', 'password', 'logout', 'authentication', 'account', 'security', 'forgot password'],
  },

  // --------------------------------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------------------------------
  {
    id: 'dashboard',
    title: 'Using the Dashboard',
    category: 'core',
    icon: 'LayoutDashboard',
    summary: 'Read summary cards, workflow metrics, overdue alerts and recent activity at a glance.',
    audiences: ['all'],
    routes: ['/dashboard', '/'],
    tourId: 'dashboard',
    media: [
      { type: 'image', src: '/help/dashboard.svg', caption: 'The Dashboard — metric tiles, workflow breakdown and live activity.' },
      { type: 'tour', tourId: 'dashboard', caption: 'Play the Dashboard walkthrough' },
    ],
    estMinutes: 5,
    hasScreenshot: true,
    hasVideo: true,
    purpose:
      'The Dashboard is your command centre. It summarises the health of all corporate matters you are permitted to see and gives one-click access to the most common actions.',
    whoShouldUse:
      'All users. Officers use it to track their own workload; Managers and Executives use it to monitor throughput, overdue matters and team performance.',
    businessPurpose:
      'A single, live view of workload and risk allows the Legal Services division to prioritise urgent matters, spot bottlenecks and meet service-level deadlines.',
    steps: [
      { title: 'Scan the summary cards', detail: 'The metric tiles across the top show totals such as Total Matters, Active, Pending Review, Overdue and Closed. Numbers reflect the matters your role can access.' },
      { title: 'Check overdue & due-soon alerts', detail: 'Overdue matters are highlighted in red and due-soon (within 3 days) in amber. Address these first.' },
      { title: 'Read the workflow breakdown', detail: 'Charts show how many matters sit at each workflow stage (Registered, Assigned, Drafting, Pending Review, and so on).' },
      { title: 'Review recent activity', detail: 'The activity feed lists the latest actions across matters — assignments, submissions, approvals and closures.' },
      { title: 'Use quick actions', detail: 'Buttons and cards link straight to Register Matter, the Matter Register, Reports and Notifications.' },
      { title: 'Drill down', detail: 'Click any metric, chart segment or activity row to open the underlying matters filtered accordingly.' },
    ],
    requiredFields: [],
    validationRules: [
      'The Dashboard is read-only; no data is entered here.',
      'Counts respect role-based access — Officers see their own and division matters; management sees all.',
    ],
    tips: [
      'Start every day on the Dashboard and clear red (overdue) items first.',
      'Use the summary cards as shortcuts — clicking "Overdue" opens the filtered register.',
      'Managers: watch the Pending Review count to keep the review queue moving.',
    ],
    commonMistakes: [
      'Ignoring amber "due soon" matters until they turn red.',
      'Assuming a low total means no work — confirm your role filter first.',
    ],
    faqs: [
      { q: 'Why do my numbers differ from a colleague’s?', a: 'The Dashboard is role-aware. You only see matters you are authorised to view, so totals legitimately differ by role.' },
      { q: 'How current is the data?', a: 'Metrics are read live from the database each time the page loads or refreshes.' },
    ],
    relatedIds: ['matter-register', 'reports', 'notifications'],
    nextSteps: ['Open the Matter Register to work a specific matter.', 'Clear overdue items, then due-soon items.'],
    keywords: ['dashboard', 'overview', 'metrics', 'summary cards', 'overdue', 'charts', 'quick actions', 'workload'],
  },

  // --------------------------------------------------------------------------
  // MATTER REGISTER
  // --------------------------------------------------------------------------
  {
    id: 'matter-register',
    title: 'The Matter Register',
    category: 'core',
    icon: 'ClipboardList',
    summary: 'Search, filter, sort, choose columns, page through and export the full list of matters.',
    audiences: ['all'],
    routes: ['/matters'],
    tourId: 'matter-register',
    media: [
      { type: 'image', src: '/help/matter-register.svg', caption: 'The Matter Register — quick filters, search toolbar and a sortable table.' },
      { type: 'tour', tourId: 'matter-register', caption: 'Play the Matter Register walkthrough' },
    ],
    estMinutes: 6,
    hasScreenshot: true,
    purpose:
      'The Matter Register is the master list of every corporate matter you can access. It is where you find, triage and open matters.',
    whoShouldUse:
      'All users. Officers find their assigned matters; Registry finds newly registered matters; Managers monitor and assign; Executives review the whole portfolio.',
    businessPurpose:
      'A searchable, filterable register ensures no matter is lost, supports reporting and gives every stakeholder a shared source of truth.',
    steps: [
      { title: 'Search', detail: 'Type in the search box to filter by matter number, subject, matter type or requester. Results update as you type.' },
      { title: 'Apply quick filters', detail: 'Use the filter tabs/pills — All, My, Active, Unassigned, In Review, Overdue, Closed — to narrow the list instantly.' },
      { title: 'Sort columns', detail: 'Click a column header to sort ascending/descending (e.g. by due date to see the most urgent first).' },
      { title: 'Choose columns', detail: 'Use the column selector to show or hide fields such as Assigned Officer, Priority or Division to suit your task.' },
      { title: 'Page through results', detail: 'Use pagination controls at the bottom to move between pages of matters.' },
      { title: 'Export to CSV', detail: 'Click Export to download the current (filtered) list as a CSV file for Excel or reporting.' },
      { title: 'Open a matter', detail: 'Click any row to open the 10-tab Matter Detail workspace, or use the row’s quick actions (assign, view, etc.).' },
    ],
    requiredFields: [],
    validationRules: [
      'Search requires at least 2 characters before filtering.',
      'Export reflects the current filter/search — clear filters to export everything.',
      'Row-level actions are shown only where your role permits them.',
    ],
    tips: [
      'Colour-coded rows and badges show priority and workflow stage — scan for red (Urgent/Overdue).',
      'Combine a quick filter with a column sort (e.g. "Overdue" + sort by Due Date) for a rapid triage list.',
      'Save time: use the header search from any page — it jumps you straight into the register with results.',
    ],
    commonMistakes: [
      'Exporting without realising a filter is still applied, then wondering why rows are missing.',
      'Sorting by the wrong column and misreading priority order.',
    ],
    faqs: [
      { q: 'What do the row colours mean?', a: 'Colours reflect priority and status — for example Urgent priority and Overdue matters are emphasised in red, due-soon in amber.' },
      { q: 'Can I see only my matters?', a: 'Yes — use the "My" quick filter or the sidebar "My Matters" link.' },
    ],
    relatedIds: ['matter-details', 'register-new-matter', 'reports'],
    nextSteps: ['Open a matter to view or progress it.', 'Register a new matter if the request is not yet recorded.'],
    keywords: ['register', 'list', 'search', 'filter', 'sort', 'columns', 'pagination', 'export', 'csv', 'matters', 'badges', 'priority'],
  },

  // --------------------------------------------------------------------------
  // REGISTER NEW MATTER
  // --------------------------------------------------------------------------
  {
    id: 'register-new-matter',
    title: 'Register a New Matter',
    category: 'workflow',
    icon: 'FilePlus',
    summary: 'Complete the four-step wizard to record a new corporate legal request.',
    audiences: ['registry', 'manager', 'admin'],
    routes: ['/matters/new', '/matters/register'],
    tourId: 'register-new-matter',
    media: [
      { type: 'image', src: '/help/workflow.svg', caption: 'Registration is step 1 of the corporate matter lifecycle.' },
      { type: 'tour', tourId: 'register-new-matter', caption: 'Play the registration wizard walkthrough' },
    ],
    estMinutes: 8,
    hasScreenshot: true,
    hasVideo: true,
    purpose:
      'Registration captures an incoming request for legal services and creates the official matter record with a unique matter number.',
    whoShouldUse:
      'Legal Secretary (registry), Manager – Legal Services, and System Administrators. Officers usually receive matters after they are registered and assigned.',
    businessPurpose:
      'Accurate, consistent registration is the foundation of the whole workflow — it starts the SLA clock, enables assignment and feeds every downstream report.',
    steps: [
      { title: 'Step 1 – Matter Information', detail: 'Enter the subject/title, select the Type of Matter and set the Priority. The matter number is generated automatically.' },
      { title: 'Step 2 – Requester & Division', detail: 'Record who requested the work (requester name/position) and the requesting Division. Add the date received.' },
      { title: 'Step 3 – Background & Details', detail: 'Provide a background/summary describing the request and any initial context the officer will need.' },
      { title: 'Step 4 – Review & Submit', detail: 'Check the summary of all entries, go back to correct anything, then submit to create the matter at the "Registered" stage.' },
      { title: 'Hand over for assignment', detail: 'After registration the matter appears under Pending Assignment for a Manager to assign to an officer.' },
    ],
    requiredFields: [
      { name: 'Subject / Title', description: 'Short descriptive title of the matter.', required: true },
      { name: 'Type of Matter', description: 'Category from reference data (e.g. contract, advice, litigation).', required: true },
      { name: 'Priority', description: 'Urgent, High, Normal or Low — drives ordering and SLA.', required: true },
      { name: 'Requester', description: 'Person or office that requested legal services.', required: true },
      { name: 'Requesting Division', description: 'DLPP division the request comes from.', required: true },
      { name: 'Date Received', description: 'When the request was received by Legal Services.', required: true },
    ],
    validationRules: [
      'You cannot advance to the next step until required fields on the current step are complete.',
      'Priority must be one of Urgent, High, Normal or Low.',
      'The matter number is system-generated and cannot be edited.',
      'Dates cannot be set in the future beyond the date received rules configured for your office.',
    ],
    tips: [
      'Write a clear, specific subject — it is what everyone sees first in the register and search.',
      'Set Priority honestly: Urgent surfaces the matter at the top of dashboards and queues.',
      'Attach or note the source request document so the assigned officer has full context.',
    ],
    commonMistakes: [
      'Vague subjects like "Advice" that are impossible to find later.',
      'Choosing the wrong matter type, which distorts reports and reference data.',
      'Marking everything Urgent, which defeats prioritisation.',
    ],
    faqs: [
      { q: 'Can I edit a matter after registering it?', a: 'Yes — open the matter and use Edit, subject to your permissions. Core references like the matter number stay fixed.' },
      { q: 'What happens immediately after I submit?', a: 'The matter is created at the "Registered" stage and appears under Pending Assignment for a Manager to assign.' },
    ],
    relatedIds: ['matter-assignment', 'matter-details', 'reference-data', 'matter-register'],
    nextSteps: ['Notify the Manager so the matter can be assigned.', 'Upload the original request under Documents.'],
    keywords: ['register', 'new matter', 'wizard', 'create matter', 'intake', 'priority', 'requester', 'division', 'matter number'],
  },

  // --------------------------------------------------------------------------
  // MATTER ASSIGNMENT
  // --------------------------------------------------------------------------
  {
    id: 'matter-assignment',
    title: 'Assigning a Matter',
    category: 'workflow',
    icon: 'UserCheck',
    summary: 'Allocate a matter to an officer with instructions, a due date and notifications.',
    audiences: ['manager', 'director', 'admin'],
    routes: ['/matters/[id]/assign'],
    tourId: 'matter-assignment',
    estMinutes: 5,
    hasScreenshot: true,
    purpose:
      'Assignment gives a registered matter an owner — the Legal Officer responsible for progressing it — along with instructions and a deadline.',
    whoShouldUse:
      'Manager – Legal Services, Director – Policy & Legal Services, and System Administrators. These are the roles permitted to assign work.',
    businessPurpose:
      'Clear ownership and deadlines drive accountability, balance workloads and ensure every matter is actively progressed within its SLA.',
    steps: [
      { title: 'Open the matter', detail: 'From the register or Pending Assignment, open the matter and choose Assign.' },
      { title: 'Select an officer', detail: 'Pick the Legal Officer (or other authorised user) who will own the matter.' },
      { title: 'Write assignment instructions', detail: 'Explain what is required, the expected output and any special considerations.' },
      { title: 'Set a due date', detail: 'Choose a realistic deadline. The system uses this for due-soon and overdue alerts.' },
      { title: 'Confirm & notify', detail: 'Save the assignment. The officer receives a "Matter Assigned to You" notification and the stage moves to "Assigned".' },
      { title: 'Reassign if needed', detail: 'To hand the matter to a different officer later, open Assign again and select a new officer — the change is recorded in assignment history.' },
    ],
    requiredFields: [
      { name: 'Assigned Officer', description: 'The user who will own and progress the matter.', required: true },
      { name: 'Due Date', description: 'Deadline used for SLA, due-soon and overdue tracking.', required: true },
      { name: 'Assignment Instructions', description: 'Guidance to the officer on what is required.', required: false },
    ],
    validationRules: [
      'An officer must be selected before the assignment can be saved.',
      'The due date should be on or after today.',
      'Only users with assignment permission can complete this action.',
    ],
    tips: [
      'Match the officer to the matter type — e.g. legislation matters to a Legislation officer.',
      'Set due dates that reflect complexity, not just the default SLA.',
      'Use instructions to link related matters or precedents.',
    ],
    commonMistakes: [
      'Assigning without instructions, leaving the officer to guess scope.',
      'Setting an unrealistic due date that guarantees an overdue matter.',
      'Overloading one officer while others have capacity — check the Dashboard first.',
    ],
    faqs: [
      { q: 'Does the officer know they’ve been assigned?', a: 'Yes — assignment triggers an in-app notification (and the bell count increases).' },
      { q: 'Can I reassign a matter?', a: 'Yes. Reassignment is allowed and every change is preserved in the assignment history for audit.' },
    ],
    relatedIds: ['matter-details', 'notifications', 'tasks', 'timeline'],
    nextSteps: ['Ask the officer to complete Matter Details.', 'Monitor progress from the Dashboard and Reports.'],
    keywords: ['assign', 'assignment', 'officer', 'due date', 'instructions', 'reassign', 'allocation', 'workload'],
  },

  // --------------------------------------------------------------------------
  // MATTER DETAILS
  // --------------------------------------------------------------------------
  {
    id: 'matter-details',
    title: 'Matter Details & Workspace',
    category: 'workflow',
    icon: 'FolderOpen',
    summary: 'Navigate the matter overview and the 10-tab detail workspace.',
    audiences: ['officer', 'reviewer', 'manager', 'all'],
    routes: ['/matters/[id]', '/matters/[id]/details'],
    tourId: 'matter-details',
    estMinutes: 7,
    hasScreenshot: true,
    purpose:
      'The Matter Detail workspace is the single place to view and complete everything about a matter — overview, land/lease details, legal issues, stakeholders, documents, tasks, review, timeline and closure.',
    whoShouldUse:
      'The assigned Legal Officer primarily, plus reviewers and managers who need full context. All authorised users can view.',
    businessPurpose:
      'Consolidating all matter information in one workspace removes silos, speeds up work and produces a complete, auditable file.',
    steps: [
      { title: 'Read the header strip', detail: 'The top of the page shows the matter number, subject, priority, workflow stage, assigned officer and due date.' },
      { title: 'Complete the overview', detail: 'Confirm matter type, requester, division, key dates, background and summary. Use Edit to correct information.' },
      { title: 'Work through the tabs', detail: 'Move across the tabs — Details, Land/Lease, Legal Issues, Stakeholders, Documents, Tasks, Review, Timeline, Audit and Closure — completing each as the matter progresses.' },
      { title: 'Complete Details', detail: 'Use "Complete Details" to record file references, legal analysis and risk, then move the stage to "Details Completed".' },
      { title: 'Save regularly', detail: 'Use Save Draft to preserve work in progress; use the completion buttons to advance the workflow stage.' },
    ],
    requiredFields: [
      { name: 'Matter Type', description: 'Category of the matter.', required: true },
      { name: 'Requester', description: 'Who requested the work.', required: true },
      { name: 'Division', description: 'Requesting DLPP division.', required: true },
      { name: 'Summary / Background', description: 'What the matter is about and why.', required: false },
    ],
    validationRules: [
      'Editing is limited to users who can edit the matter (owner or management).',
      'Advancing the stage records an entry in status history and the timeline.',
    ],
    tips: [
      'Complete tabs in order — details first, then supporting information, documents and tasks.',
      'Keep the summary current; it is what reviewers and executives read.',
    ],
    commonMistakes: [
      'Leaving the overview half-complete, which weakens reports and searches.',
      'Forgetting to advance the stage after finishing a phase.',
    ],
    faqs: [
      { q: 'What are the 10 tabs?', a: 'Overview/Details, Land & Lease, Legal Issues, Stakeholders, Documents, Tasks, Draft Review, Activity Timeline, Audit Trail and Closure.' },
      { q: 'Who can edit a matter?', a: 'The assigned officer and management roles. Others have read-only access, depending on permissions.' },
    ],
    relatedIds: ['land-lease-details', 'legal-issues', 'stakeholders', 'documents', 'tasks', 'draft-review', 'matter-closure'],
    nextSteps: ['Record Land/Lease details if the matter involves land.', 'Capture Legal Issues and Stakeholders.'],
    keywords: ['matter details', 'workspace', 'tabs', 'overview', 'edit matter', 'complete details', 'file reference'],
  },

  // --------------------------------------------------------------------------
  // LAND / LEASE DETAILS
  // --------------------------------------------------------------------------
  {
    id: 'land-lease-details',
    title: 'Land & Lease Details',
    category: 'workflow',
    icon: 'MapPin',
    summary: 'Record land information, lease details, property references and location.',
    audiences: ['officer', 'reviewer'],
    routes: ['/matters/[id]/details'],
    tourId: 'land-lease-details',
    estMinutes: 5,
    purpose:
      'Capture the land and lease particulars that many DLPP corporate matters depend on — titles, survey references, ILG details and property location.',
    whoShouldUse:
      'The assigned Legal Officer working a land-related matter, and reviewers verifying the file.',
    businessPurpose:
      'Precise land and lease data underpins legal advice, links the matter to titles and surveys, and prevents costly errors in property dealings.',
    steps: [
      { title: 'Enter file references', detail: 'Record the Main File Reference, Title File Reference and Title Description.' },
      { title: 'Add survey & purchase references', detail: 'Capture the Survey File Reference and Purchase Documents Reference where relevant.' },
      { title: 'Record ILG details', detail: 'If an Incorporated Land Group is involved, enter the ILG Name and ILG File Reference.' },
      { title: 'Describe the property & location', detail: 'Note the property description and location so the parcel is unambiguous.' },
      { title: 'Attach supporting documentation', detail: 'Upload titles, survey plans and related documents under the Documents tab.' },
    ],
    requiredFields: [
      { name: 'Main File Reference', description: 'Primary DLPP file reference for the matter.', required: false },
      { name: 'Title File Reference', description: 'Reference to the land title file.', required: false },
      { name: 'Survey File Reference', description: 'Reference to the survey file/plan.', required: false },
      { name: 'ILG Name / Reference', description: 'Incorporated Land Group details, if applicable.', required: false },
    ],
    validationRules: [
      'File references should follow your office’s numbering convention (e.g. DLPP/CMS/2024/001).',
      'Only complete fields relevant to the matter — not every matter involves an ILG.',
    ],
    tips: [
      'Copy references exactly as they appear on the source documents to avoid mismatches.',
      'Cross-check the title and survey references against the uploaded documents.',
    ],
    commonMistakes: [
      'Transposing digits in file/title references.',
      'Leaving ILG fields blank when an ILG is party to the matter.',
    ],
    faqs: [
      { q: 'What is an ILG?', a: 'An Incorporated Land Group — a legally recognised group of customary landowners. Record its name and file reference when it is a party.' },
      { q: 'Where do titles and plans go?', a: 'Upload them under the Documents tab and reference them here.' },
    ],
    relatedIds: ['matter-details', 'documents', 'legal-issues'],
    nextSteps: ['Record the Legal Issues arising from the land/lease.', 'Add relevant Stakeholders.'],
    keywords: ['land', 'lease', 'title', 'survey', 'ilg', 'property', 'location', 'file reference', 'parcel'],
  },

  // --------------------------------------------------------------------------
  // LEGAL ISSUES
  // --------------------------------------------------------------------------
  {
    id: 'legal-issues',
    title: 'Recording Legal Issues',
    category: 'workflow',
    icon: 'Scale',
    summary: 'Document legal issues, applicable law, claims, advice and risk classification.',
    audiences: ['officer', 'reviewer', 'director'],
    routes: ['/matters/[id]/details'],
    tourId: 'legal-issues',
    estMinutes: 6,
    purpose:
      'Capture the legal analysis of the matter — the issues in play, claims or allegations, the applicable law, and the risk to DLPP.',
    whoShouldUse:
      'The assigned Legal Officer performing the analysis; reviewers and directors assessing it.',
    businessPurpose:
      'A structured legal analysis produces consistent, defensible advice and lets management gauge exposure across the portfolio.',
    steps: [
      { title: 'Identify the legal issues', detail: 'In "Legal Issues", set out each issue the matter raises, clearly and separately.' },
      { title: 'Record claims & allegations', detail: 'List any claims or allegations made by or against the department.' },
      { title: 'Cite applicable law', detail: 'In "Applicable Law", cite the legislation, regulations, case law or principles that govern the issues.' },
      { title: 'Classify the risk', detail: 'Select a Risk Classification to signal the legal/reputational exposure.' },
      { title: 'Add internal remarks', detail: 'Use Internal Remarks for observations and recommendations intended for internal readers only.' },
    ],
    requiredFields: [
      { name: 'Legal Issues', description: 'The legal questions the matter raises.', required: false },
      { name: 'Applicable Law', description: 'Legislation, cases and principles that apply.', required: false },
      { name: 'Risk Classification', description: 'Assessed level of legal/reputational risk.', required: false },
    ],
    validationRules: [
      'Risk Classification must be chosen from the configured list.',
      'Internal Remarks are for internal use and should not contain content intended for the requester.',
    ],
    tips: [
      'State each issue as a question ("Whether …") to keep the analysis focused.',
      'Cite law precisely — section numbers and case citations aid reviewers.',
      'Set risk realistically; it feeds management reporting.',
    ],
    commonMistakes: [
      'Merging several issues into one paragraph, making review hard.',
      'Vague references to "the Act" without naming the legislation.',
    ],
    faqs: [
      { q: 'Is this the final advice?', a: 'This is your structured analysis. The formal advice is usually drafted as a document and put through Draft Review.' },
      { q: 'Who sees Internal Remarks?', a: 'Internal staff working the matter — not external requesters.' },
    ],
    relatedIds: ['matter-details', 'draft-review', 'stakeholders', 'documents'],
    nextSteps: ['Draft the advice document and submit it for review.', 'Confirm all stakeholders are recorded.'],
    keywords: ['legal issues', 'applicable law', 'claims', 'allegations', 'advice', 'risk', 'analysis', 'legislation'],
  },

  // --------------------------------------------------------------------------
  // STAKEHOLDERS
  // --------------------------------------------------------------------------
  {
    id: 'stakeholders',
    title: 'Managing Stakeholders',
    category: 'workflow',
    icon: 'Users',
    summary: 'Record organisations, agencies, landowners and contacts and their roles.',
    audiences: ['officer', 'reviewer'],
    routes: ['/matters/[id]/details'],
    tourId: 'stakeholders',
    estMinutes: 4,
    purpose:
      'Record every party connected to the matter — government agencies, private organisations, landowners and individuals — with their role and contact details.',
    whoShouldUse:
      'The assigned Legal Officer, supported by reviewers who verify parties are complete.',
    businessPurpose:
      'A complete stakeholder list ensures correct correspondence, conflict checks and a clear picture of who is affected by the matter.',
    steps: [
      { title: 'List relevant stakeholders', detail: 'In "Relevant Stakeholders", capture each party involved in the matter.' },
      { title: 'Add organisations & agencies', detail: 'Record government agencies and private-sector organisations that are parties.' },
      { title: 'Record landowners', detail: 'Note individual landowners or the ILG where customary land is involved.' },
      { title: 'Capture contact information', detail: 'Add contact names and details so correspondence reaches the right person.' },
      { title: 'State each role', detail: 'Describe each party’s role (requester, respondent, interested party, etc.).' },
    ],
    requiredFields: [
      { name: 'Stakeholder', description: 'Name of the party (person or organisation).', required: false },
      { name: 'Role', description: 'The party’s relationship to the matter.', required: false },
      { name: 'Contact Information', description: 'How to reach the party.', required: false },
    ],
    validationRules: [
      'Record parties consistently (official organisation names) to support conflict checks.',
    ],
    tips: [
      'Use official names for agencies and organisations.',
      'Keep contacts current — outdated details delay correspondence.',
    ],
    commonMistakes: [
      'Omitting interested parties who must be kept informed.',
      'Recording only individuals and forgetting the organisation they represent.',
    ],
    faqs: [
      { q: 'How much contact detail should I record?', a: 'Enough to correspond reliably — a named contact, position and at least one channel (email or phone).' },
    ],
    relatedIds: ['matter-details', 'legal-issues', 'documents'],
    nextSteps: ['Attach any correspondence under Documents.', 'Proceed to drafting and review.'],
    keywords: ['stakeholders', 'parties', 'organisations', 'agencies', 'landowners', 'contacts', 'roles'],
  },

  // --------------------------------------------------------------------------
  // DOCUMENTS
  // --------------------------------------------------------------------------
  {
    id: 'documents',
    title: 'Document Management',
    category: 'management',
    icon: 'FileText',
    summary: 'Upload, categorise, search, view, download, replace and archive documents.',
    audiences: ['officer', 'registry', 'reviewer', 'all'],
    routes: ['/documents'],
    tourId: 'documents',
    media: [
      { type: 'tour', tourId: 'documents', caption: 'Play the Documents walkthrough' },
    ],
    estMinutes: 6,
    hasScreenshot: true,
    purpose:
      'The Documents area is the central library for every file attached to matters — requests, drafts, finals and supporting evidence.',
    whoShouldUse:
      'All users who attach or read matter documents — officers, registry and reviewers in particular.',
    businessPurpose:
      'Centralised, categorised documents create a complete, auditable matter file and prevent version confusion.',
    steps: [
      { title: 'Open Documents', detail: 'Use the global Documents page for all matters, or the Documents tab within a matter for that matter’s files.' },
      { title: 'Upload a document', detail: 'Choose the matter, select the file, pick a Document Type and the workflow stage/category (Initial, Draft, Final, Supporting).' },
      { title: 'Categorise correctly', detail: 'Set the document type and category so files are easy to find and the final deliverable is unmistakable.' },
      { title: 'Search & filter', detail: 'Search by title and filter by All / Final / Drafts to locate files quickly.' },
      { title: 'View & download', detail: 'Open a document to view it or download a copy.' },
      { title: 'Replace / update metadata', detail: 'Edit a document’s metadata or upload a newer version to keep the file current.' },
      { title: 'Archive', detail: 'Archive superseded files so the active list stays clean while retaining history.' },
    ],
    requiredFields: [
      { name: 'Matter', description: 'The matter the document belongs to.', required: true },
      { name: 'File', description: 'The document being uploaded.', required: true },
      { name: 'Document Type', description: 'Category from reference data.', required: true },
      { name: 'Category / Stage', description: 'Initial, Draft, Final or Supporting.', required: false },
    ],
    validationRules: [
      'A matter and a file must be selected to upload.',
      'Document Type is required so files remain organised.',
      'Deleting a document also removes it from storage — archive instead if you may need it.',
    ],
    tips: [
      'Name files clearly and consistently (matter number + short description).',
      'Mark the deliverable as "Final" so reviewers and requesters see the right version.',
      'Keep drafts as "Draft" until approved, then upload the approved "Final".',
    ],
    commonMistakes: [
      'Uploading a draft as "Final", causing the wrong version to be shared.',
      'Deleting instead of archiving, losing the audit trail.',
    ],
    faqs: [
      { q: 'What file types can I upload?', a: 'Standard office and PDF documents. Follow your office policy on size and format.' },
      { q: 'What is the difference between the global page and the tab?', a: 'The global Documents page lists files across all matters; the Documents tab shows one matter’s files.' },
    ],
    relatedIds: ['matter-details', 'draft-review', 'matter-closure'],
    nextSteps: ['Submit the final draft for review.', 'Ensure required documents are present before closure.'],
    keywords: ['documents', 'upload', 'download', 'version', 'category', 'archive', 'replace', 'files', 'attachments', 'final', 'draft'],
  },

  // --------------------------------------------------------------------------
  // TASKS
  // --------------------------------------------------------------------------
  {
    id: 'tasks',
    title: 'Tasks & To-Dos',
    category: 'management',
    icon: 'CheckSquare',
    summary: 'Create, assign, prioritise, track and complete the tasks behind each matter.',
    audiences: ['officer', 'manager', 'all'],
    routes: ['/tasks'],
    tourId: 'tasks',
    estMinutes: 5,
    hasScreenshot: true,
    purpose:
      'Tasks break a matter into actionable steps with owners, priorities and deadlines so nothing is missed.',
    whoShouldUse:
      'Legal Officers managing their own work, and Managers coordinating a team’s tasks across matters.',
    businessPurpose:
      'Task tracking turns intentions into accountable, time-bound actions and provides visibility of progress on every matter.',
    steps: [
      { title: 'Open Tasks', detail: 'Use the global Tasks page for all matters, or the Tasks tab within a matter.' },
      { title: 'Create a task', detail: 'Add a task with its matter, type, assignee, priority, status and due date.' },
      { title: 'Assign an owner', detail: 'Choose who is responsible; they will see it in their task list.' },
      { title: 'Set priority & deadline', detail: 'Set the priority (Urgent → Low) and a due date to drive ordering and alerts.' },
      { title: 'Update progress', detail: 'Change the status inline — Pending, In Progress, Awaiting Review, Returned, Completed or Cancelled.' },
      { title: 'Complete the work', detail: 'Mark the task Completed when done; use quick filters (My, Pending, Overdue) to focus.' },
    ],
    requiredFields: [
      { name: 'Task / Title', description: 'What needs to be done.', required: true },
      { name: 'Matter', description: 'The matter the task belongs to.', required: true },
      { name: 'Assignee', description: 'Who is responsible for the task.', required: false },
      { name: 'Priority', description: 'Urgency of the task.', required: false },
      { name: 'Due Date', description: 'When the task is due.', required: false },
    ],
    validationRules: [
      'A task must have a title and belong to a matter.',
      'Status must be one of the defined values (Pending, In Progress, Awaiting Review, Returned, Completed, Cancelled).',
    ],
    tips: [
      'Break big matters into small, clearly-owned tasks.',
      'Use the "Overdue" and "My" filters daily to stay on top of work.',
    ],
    commonMistakes: [
      'Creating tasks with no owner or due date, so they drift.',
      'Leaving completed work marked "In Progress", distorting progress views.',
    ],
    faqs: [
      { q: 'Can I see only my tasks?', a: 'Yes — use the "My" quick filter on the Tasks page.' },
      { q: 'Do tasks affect the matter’s workflow stage?', a: 'Tasks track internal work; the workflow stage is driven by details, review and closure actions.' },
    ],
    relatedIds: ['matter-details', 'draft-review', 'notifications'],
    nextSteps: ['Progress tasks, then submit the draft for review.', 'Review overdue tasks on the Dashboard.'],
    keywords: ['tasks', 'todo', 'assign', 'priority', 'deadline', 'progress', 'status', 'complete'],
  },

  // --------------------------------------------------------------------------
  // DRAFT REVIEW
  // --------------------------------------------------------------------------
  {
    id: 'draft-review',
    title: 'Draft Review Workflow',
    category: 'workflow',
    icon: 'FileCog',
    summary: 'Submit drafts, review, return for revision, approve and track revisions.',
    audiences: ['officer', 'reviewer', 'manager', 'director'],
    routes: ['/matters/[id]/review'],
    tourId: 'draft-review',
    media: [
      { type: 'image', src: '/help/workflow.svg', caption: 'Draft review sits between details completion and finalization.' },
      { type: 'tour', tourId: 'draft-review', caption: 'Play the Draft Review walkthrough' },
    ],
    estMinutes: 6,
    hasScreenshot: true,
    purpose:
      'The review workflow moves a draft from the officer to a reviewer for approval, with clear outcomes: approved, or returned for revision.',
    whoShouldUse:
      'Legal Officers submit drafts; Senior Officers, Managers and Directors review and decide.',
    businessPurpose:
      'Independent review assures quality and consistency of legal advice before it is finalised and issued.',
    steps: [
      { title: 'Submit for review', detail: 'From the matter, choose "Submit for Review". The stage moves to "Pending Review" and the reviewer is notified.' },
      { title: 'Reviewer opens the draft', detail: 'The reviewer reads the draft and supporting material in the Review tab.' },
      { title: 'Return for revision', detail: 'If changes are needed, the reviewer returns it with comments; the stage becomes "Returned for Revision" and the officer is notified.' },
      { title: 'Revise & resubmit', detail: 'The officer addresses the comments and resubmits. Each cycle is captured in the revision history.' },
      { title: 'Approve', detail: 'When satisfied, the reviewer approves; the stage moves to "Approved for Finalization".' },
    ],
    requiredFields: [
      { name: 'Draft Document', description: 'The draft being submitted for review.', required: true },
      { name: 'Reviewer', description: 'The person who will review the draft.', required: false },
      { name: 'Review Comments', description: 'Reviewer feedback when returning or approving.', required: false },
    ],
    validationRules: [
      'Only authorised reviewers (Senior Officer and above) can approve or return.',
      'Returning a draft should include comments explaining the required changes.',
      'Each submission and decision is recorded with a timestamp for audit.',
    ],
    tips: [
      'Attach the correct "Final" candidate before submitting to avoid confusion.',
      'Reviewers: give specific, actionable comments to speed the next cycle.',
    ],
    commonMistakes: [
      'Submitting the wrong document version for review.',
      'Returning a draft with no explanation of what to fix.',
    ],
    faqs: [
      { q: 'How do I know a draft is waiting for me?', a: 'Reviewers get a "Draft Submitted for Review" notification and see it in the Pending Review list.' },
      { q: 'Can I see previous revisions?', a: 'Yes — the review/revision history lists each submission and decision.' },
    ],
    relatedIds: ['documents', 'matter-details', 'notifications', 'matter-closure'],
    nextSteps: ['After approval, finalise the matter and prepare for closure.', 'Upload the approved Final document.'],
    keywords: ['review', 'draft', 'submit', 'approve', 'return', 'revision', 'reviewer', 'comments', 'workflow'],
  },

  // --------------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------------
  {
    id: 'notifications',
    title: 'Notifications & Alerts',
    category: 'management',
    icon: 'Bell',
    summary: 'Use the bell, unread count and notification types; mark read and manage alerts.',
    audiences: ['all'],
    routes: ['/notifications'],
    tourId: 'notifications',
    estMinutes: 4,
    hasScreenshot: true,
    purpose:
      'Notifications keep you informed of events that need your attention — assignments, reviews, deadlines and closures.',
    whoShouldUse:
      'All users. The events you receive depend on your role and the matters you own or manage.',
    businessPurpose:
      'Timely alerts keep the workflow moving, prevent missed deadlines and reduce the need for manual follow-up.',
    steps: [
      { title: 'Watch the bell', detail: 'The bell in the top header shows a red unread count when you have new notifications.' },
      { title: 'Open the dropdown', detail: 'Click the bell to see your most recent notifications with quick links to the related matter.' },
      { title: 'Open the full page', detail: 'Go to Notifications for the complete list with All / Unread / Read tabs and pill filters.' },
      { title: 'Mark as read', detail: 'Mark items read individually, or clear/read all to reset the unread count.' },
      { title: 'Delete', detail: 'Remove notifications you no longer need to keep the list tidy.' },
    ],
    requiredFields: [],
    validationRules: [
      'Notifications are personal — you only see your own.',
      'Marking read updates the bell count immediately.',
    ],
    tips: [
      'Check notifications at the start and end of the day.',
      'Click through from a notification straight to the matter to act on it.',
    ],
    commonMistakes: [
      'Ignoring due-soon and overdue alerts.',
      'Clearing all without reading, then missing an assignment.',
    ],
    faqs: [
      { q: 'What are the notification types?', a: 'Matter Registered, Matter Assigned, Draft Submitted, Draft Returned, Draft Approved, Due Soon (3 days), Overdue, Ready for Closure and Matter Closed.' },
      { q: 'Are notifications real-time?', a: 'The bell updates as events occur and when the page refreshes.' },
    ],
    relatedIds: ['dashboard', 'matter-assignment', 'draft-review'],
    nextSteps: ['Act on the linked matter.', 'Adjust your workload from the Dashboard.'],
    keywords: ['notifications', 'alerts', 'bell', 'unread', 'mark read', 'delete', 'reminders'],
  },

  // --------------------------------------------------------------------------
  // MATTER CLOSURE
  // --------------------------------------------------------------------------
  {
    id: 'matter-closure',
    title: 'Closing a Matter',
    category: 'workflow',
    icon: 'CheckCircle2',
    summary: 'Run closure checks, write the closure summary, confirm documents and archive.',
    audiences: ['registry', 'manager', 'admin'],
    routes: ['/matters/[id]/close'],
    tourId: 'matter-closure',
    estMinutes: 5,
    hasScreenshot: true,
    purpose:
      'Closure formally completes a matter once all work, approvals and deliverables are finished, moving it to the "Closed" stage and the archive.',
    whoShouldUse:
      'Legal Secretary, Manager – Legal Services and System Administrators — the roles permitted to close matters.',
    businessPurpose:
      'A disciplined closure step guarantees deliverables are in place, records are complete and the matter is properly archived for future reference and audit.',
    steps: [
      { title: 'Confirm readiness', detail: 'Check that the draft is approved/finalised, tasks are complete and required documents are uploaded.' },
      { title: 'Complete closure checks', detail: 'Work through the closure checklist the system presents before allowing closure.' },
      { title: 'Write the closure summary', detail: 'Summarise the outcome and the advice/deliverable provided.' },
      { title: 'Attach required documents', detail: 'Ensure the Final deliverable and any mandated records are attached.' },
      { title: 'Approve & archive', detail: 'Confirm closure. The stage moves to "Closed" and the matter is archived; involved officers are notified.' },
    ],
    requiredFields: [
      { name: 'Closure Summary', description: 'The outcome and deliverable of the matter.', required: true },
      { name: 'Final Document(s)', description: 'The approved deliverable(s).', required: false },
    ],
    validationRules: [
      'Only authorised roles can close a matter.',
      'Closure is blocked until prerequisite checks pass (e.g. approval complete).',
      'A closure summary is required.',
    ],
    tips: [
      'Do not close until the reviewer has approved the final deliverable.',
      'Write a summary a future reader can understand without opening every tab.',
    ],
    commonMistakes: [
      'Closing prematurely before approvals or documents are complete.',
      'Leaving the closure summary blank or too terse.',
    ],
    faqs: [
      { q: 'Can a closed matter be reopened?', a: 'Reopening is an administrative action subject to permissions and policy — contact a Manager or Administrator.' },
      { q: 'What happens to notifications on closure?', a: 'A "Matter Closed" notification is sent to the involved officer(s).' },
    ],
    relatedIds: ['draft-review', 'documents', 'reports', 'audit-trail'],
    nextSteps: ['Verify the matter appears under Closed Matters.', 'Use Reports to reflect completion in performance data.'],
    keywords: ['close', 'closure', 'archive', 'summary', 'complete matter', 'finalise', 'checklist'],
  },

  // --------------------------------------------------------------------------
  // REPORTS & ANALYTICS
  // --------------------------------------------------------------------------
  {
    id: 'reports',
    title: 'Reports & Analytics',
    category: 'management',
    icon: 'BarChart3',
    summary: 'Read charts, filter by period, and export or print performance and workflow reports.',
    audiences: ['manager', 'director', 'executive', 'admin'],
    routes: ['/reports'],
    tourId: 'reports',
    media: [
      { type: 'image', src: '/help/reports.svg', caption: 'Reports & Analytics — metric tiles, the monthly trend and distribution bars.' },
      { type: 'tour', tourId: 'reports', caption: 'Play the Reports walkthrough' },
    ],
    estMinutes: 6,
    hasScreenshot: true,
    hasVideo: true,
    purpose:
      'Reports & Analytics turns matter data into insight — status and priority distribution, ageing, officer and division workload and monthly trends.',
    whoShouldUse:
      'Managers, Directors, Executives and Administrators who monitor performance; officers with reporting permission can view basic reports.',
    businessPurpose:
      'Evidence-based management: identify bottlenecks, balance workloads, demonstrate SLA performance and inform resourcing decisions.',
    steps: [
      { title: 'Choose the period', detail: 'Use the period selector to focus the report on a date range.' },
      { title: 'Read the metric tiles', detail: 'Compact tiles summarise totals such as active, overdue and closed matters.' },
      { title: 'Interpret the charts', detail: 'Distribution bars and the monthly trend line show status, priority, ageing and volume over time.' },
      { title: 'Review the tables', detail: 'Officer and division tables break performance down by team.' },
      { title: 'Export or print', detail: 'Export to CSV/PDF for distribution, or print the current view for meetings.' },
    ],
    requiredFields: [],
    validationRules: [
      'Reports respect role-based access — advanced analytics require the appropriate permission.',
      'Exports reflect the selected period and filters.',
    ],
    tips: [
      'Compare periods month-on-month to spot trends early.',
      'Export to CSV to build custom pivots in Excel.',
    ],
    commonMistakes: [
      'Reading a chart without checking the selected period.',
      'Exporting the wrong period for a report pack.',
    ],
    faqs: [
      { q: 'Why can’t I see advanced reports?', a: 'Advanced analytics are permission-gated. Ask an Administrator to grant the advanced reporting permission.' },
      { q: 'Can I print a single chart?', a: 'Use Print for the current view; for a single chart, filter to it first or export data.' },
    ],
    relatedIds: ['dashboard', 'matter-register', 'user-management'],
    nextSteps: ['Act on bottlenecks (reassign or reprioritise).', 'Share the export with management.'],
    keywords: ['reports', 'analytics', 'charts', 'export', 'print', 'performance', 'trends', 'workload', 'csv', 'pdf'],
  },

  // --------------------------------------------------------------------------
  // ADMIN PANEL (home)
  // --------------------------------------------------------------------------
  {
    id: 'admin',
    title: 'Administration Panel',
    category: 'admin',
    icon: 'Settings',
    summary: 'The control centre for users, permissions, divisions and reference data.',
    audiences: ['admin', 'manager'],
    routes: ['/admin'],
    tourId: 'admin',
    estMinutes: 3,
    purpose:
      'The Admin Panel is the single entry point to configure the system — user accounts, permission groups, divisions and the reference-data lists that power every form.',
    whoShouldUse:
      'System Administrators, and Managers with the relevant permissions. Day-to-day users will not see these tools.',
    businessPurpose:
      'Centralised administration keeps access secure, data consistent and the system aligned with how the Legal Services division actually works.',
    steps: [
      { title: 'Open Administration', detail: 'Use the Administration group in the sidebar to reach each admin tool.' },
      { title: 'Manage users', detail: 'Create accounts, set roles and add users to permission groups under User Management.' },
      { title: 'Manage permissions', detail: 'Use Groups & Permissions to control module-level access (RBAC).' },
      { title: 'Maintain reference data', detail: 'Keep divisions, matter types and document types current so dropdowns stay clean.' },
    ],
    requiredFields: [],
    validationRules: [
      'Admin tools are permission-gated — only authorised roles can change them.',
      'Changes here affect all users, so apply them deliberately.',
    ],
    tips: [
      'Follow least-privilege: grant only the access each role needs.',
      'Deactivate departing users rather than deleting them, to preserve history.',
    ],
    commonMistakes: [
      'Granting broad admin access when a narrower group would do.',
      'Creating duplicate reference values with slightly different spellings.',
    ],
    faqs: [
      { q: 'Who can access the Admin Panel?', a: 'System Administrators, and roles explicitly granted admin module permissions.' },
      { q: 'Where do I change what a role can see?', a: 'Groups & Permissions controls module-level read/write access for each group.' },
    ],
    relatedIds: ['user-management', 'reference-data', 'audit-trail'],
    nextSteps: ['Open User Management to add or edit a user.', 'Review Reference Data for outdated values.'],
    keywords: ['admin', 'administration', 'panel', 'settings', 'configuration', 'users', 'permissions', 'reference data'],
  },

  // --------------------------------------------------------------------------
  // USER MANAGEMENT
  // --------------------------------------------------------------------------
  {
    id: 'user-management',
    title: 'User Management',
    category: 'admin',
    icon: 'Users',
    summary: 'Create, edit and deactivate users, reset passwords and assign roles & permissions.',
    audiences: ['admin'],
    routes: ['/admin/users'],
    tourId: 'user-management',
    estMinutes: 6,
    hasScreenshot: true,
    purpose:
      'User Management controls who can access the system and what they can do, through accounts, roles and group permissions.',
    whoShouldUse:
      'System Administrators. Some senior roles may have view access, but account changes are administrator functions.',
    businessPurpose:
      'Correct access control protects confidential matters, enforces separation of duties and keeps the audit trail meaningful.',
    steps: [
      { title: 'Open User Management', detail: 'Go to Administration → User Management to see all users and their roles.' },
      { title: 'Create a user', detail: 'Use Add User to create an account with email and an initial password, then set the role.' },
      { title: 'Assign role & groups', detail: 'Give the user a role and add them to the appropriate permission group(s) for module access.' },
      { title: 'Edit a user', detail: 'Update details or change a user’s role as responsibilities change.' },
      { title: 'Reset a password', detail: 'Trigger a password reset when a user is locked out or forgets their password.' },
      { title: 'Deactivate / delete', detail: 'Deactivate accounts for staff who leave so they can no longer sign in, preserving history.' },
    ],
    requiredFields: [
      { name: 'Email', description: 'The user’s official DLPP email (their login).', required: true },
      { name: 'Full Name', description: 'The user’s name as it appears in the system.', required: true },
      { name: 'Role', description: 'The user’s role, which sets baseline permissions.', required: true },
      { name: 'Initial Password', description: 'A temporary password for first sign-in.', required: false },
    ],
    validationRules: [
      'Email must be unique and valid.',
      'A role must be assigned; role plus group membership determines access.',
      'Only Administrators can create, edit or delete users.',
    ],
    tips: [
      'Follow least-privilege: grant only the access each role needs.',
      'Use groups for consistent, repeatable permission sets.',
      'Deactivate rather than delete to retain audit history.',
    ],
    commonMistakes: [
      'Granting Administrator to users who only need officer access.',
      'Deleting a departing user and losing their history — deactivate instead.',
    ],
    faqs: [
      { q: 'What roles are available?', a: 'Legal Secretary, Legal Officer (Corporate/Legislation), Senior Legal Officer, Manager – Legal Services, Director – Policy & Legal, Deputy Secretary, Secretary and System Administrator.' },
      { q: 'How do permissions actually work?', a: 'A user’s role sets a baseline; group membership grants module-level read/write access via the RBAC system.' },
    ],
    relatedIds: ['reference-data', 'audit-trail', 'login'],
    nextSteps: ['Add the user to the correct groups.', 'Confirm access by asking them to sign in.'],
    keywords: ['users', 'accounts', 'roles', 'permissions', 'create user', 'deactivate', 'reset password', 'groups', 'rbac', 'admin'],
  },

  // --------------------------------------------------------------------------
  // REFERENCE DATA
  // --------------------------------------------------------------------------
  {
    id: 'reference-data',
    title: 'Reference Data Management',
    category: 'admin',
    icon: 'FolderCog',
    summary: 'Maintain matter types, document types, divisions, priorities and other lists.',
    audiences: ['admin', 'manager'],
    routes: ['/admin/reference-data', '/admin/divisions', '/admin/matter-types', '/admin/document-types'],
    tourId: 'reference-data',
    estMinutes: 5,
    hasScreenshot: true,
    purpose:
      'Reference data are the controlled lists that power dropdowns throughout the system — matter types, document types, divisions and more.',
    whoShouldUse:
      'System Administrators and Managers with reference-data permission.',
    businessPurpose:
      'Consistent reference data keeps records clean, makes reports meaningful and prevents free-text chaos across the department.',
    steps: [
      { title: 'Open Reference Data', detail: 'Go to Administration → Reference Data (or the specific list: Divisions, Matter Types, Document Types).' },
      { title: 'Add an entry', detail: 'Create a new value (e.g. a new matter type) so it becomes available in forms.' },
      { title: 'Edit an entry', detail: 'Rename or adjust an existing value; changes flow through to the dropdowns that use it.' },
      { title: 'Activate / deactivate', detail: 'Retire values you no longer want offered without deleting historical data.' },
      { title: 'Maintain divisions & priorities', detail: 'Keep the list of DLPP divisions current and confirm status/priority values match policy.' },
    ],
    requiredFields: [
      { name: 'Name / Label', description: 'The display value shown in dropdowns.', required: true },
      { name: 'Type / Category', description: 'Which list the value belongs to.', required: true },
    ],
    validationRules: [
      'Values within a list should be unique.',
      'Deactivating a value keeps existing records intact but removes it from new selections.',
      'Only authorised roles can change reference data.',
    ],
    tips: [
      'Agree naming conventions before adding values to avoid near-duplicates.',
      'Deactivate rather than delete to protect historical matters that used the value.',
    ],
    commonMistakes: [
      'Creating duplicate matter/document types with slightly different spellings.',
      'Deleting a value still referenced by existing matters.',
    ],
    faqs: [
      { q: 'Will changing a label affect old records?', a: 'Editing a label updates how the value is displayed; the underlying records remain linked.' },
      { q: 'What lists are managed here?', a: 'Divisions, matter types, document types, and related workflow/priority/status values.' },
    ],
    relatedIds: ['user-management', 'register-new-matter', 'documents'],
    nextSteps: ['Confirm the new value appears in the relevant form.', 'Communicate list changes to users.'],
    keywords: ['reference data', 'matter types', 'document types', 'divisions', 'priorities', 'status', 'lists', 'configuration', 'dropdowns'],
  },

  // --------------------------------------------------------------------------
  // ACTIVITY TIMELINE
  // --------------------------------------------------------------------------
  {
    id: 'timeline',
    title: 'Activity Timeline',
    category: 'core',
    icon: 'History',
    summary: 'Follow the chronological history of officer actions and status changes on a matter.',
    audiences: ['all'],
    routes: ['/matters/[id]'],
    tourId: 'timeline',
    estMinutes: 3,
    purpose:
      'The Activity Timeline shows, in chronological order, everything that has happened on a matter — actions, status changes and milestones.',
    whoShouldUse:
      'Anyone reviewing a matter: officers picking up work, reviewers, managers and executives who need the story at a glance.',
    businessPurpose:
      'A clear chronology speeds handovers, supports oversight and provides an at-a-glance record of how a matter progressed.',
    steps: [
      { title: 'Open the matter', detail: 'Open the matter and select the Timeline (Activity) tab.' },
      { title: 'Read top to bottom', detail: 'Events are listed newest-first (or oldest-first) — creation, assignment, submissions, approvals and closure.' },
      { title: 'See who did what', detail: 'Each entry shows the actor, the action and when it occurred.' },
      { title: 'Track status changes', detail: 'Workflow stage transitions appear as entries so you can see how the matter moved.' },
    ],
    requiredFields: [],
    validationRules: [
      'The timeline is read-only and generated automatically from recorded actions.',
    ],
    tips: [
      'Use the timeline when picking up someone else’s matter to get context fast.',
      'Cross-reference the timeline with the Audit Trail when investigating a change.',
    ],
    commonMistakes: [
      'Confusing the Timeline (activity narrative) with the Audit Trail (field-level changes).',
    ],
    faqs: [
      { q: 'How is this different from the Audit Trail?', a: 'The Timeline narrates activities and status changes; the Audit Trail records exact field-level before/after values.' },
    ],
    relatedIds: ['audit-trail', 'matter-details', 'notifications'],
    nextSteps: ['Open the Audit Trail for field-level detail.', 'Continue progressing the matter.'],
    keywords: ['timeline', 'activity', 'history', 'chronology', 'events', 'status history', 'actions'],
  },

  // --------------------------------------------------------------------------
  // AUDIT TRAIL
  // --------------------------------------------------------------------------
  {
    id: 'audit-trail',
    title: 'Audit Trail',
    category: 'core',
    icon: 'ShieldCheck',
    summary: 'See exactly who changed what, when, and the previous and new values.',
    audiences: ['manager', 'director', 'executive', 'admin'],
    routes: ['/matters/[id]'],
    tourId: 'audit-trail',
    estMinutes: 3,
    purpose:
      'The Audit Trail is the definitive record of changes to a matter — who changed what field, when, and from which value to which value.',
    whoShouldUse:
      'Managers, Directors, Executives and Administrators for oversight, investigations and compliance.',
    businessPurpose:
      'A tamper-evident audit trail supports accountability, dispute resolution and compliance with record-keeping obligations.',
    steps: [
      { title: 'Open the Audit tab', detail: 'Open the matter and select the Audit Trail tab.' },
      { title: 'Read each entry', detail: 'Every entry records the user, the date and time, the field changed, and the previous and new values.' },
      { title: 'Filter / scan', detail: 'Scan chronologically to reconstruct exactly how the record reached its current state.' },
      { title: 'Corroborate', detail: 'Use it alongside the Activity Timeline to confirm both the narrative and the precise data changes.' },
    ],
    requiredFields: [],
    validationRules: [
      'The audit trail is system-generated and cannot be edited by users.',
    ],
    tips: [
      'When data looks wrong, check the audit trail before assuming an error.',
      'Executives: the audit trail is your evidence base for accountability.',
    ],
    commonMistakes: [
      'Editing a record to "fix" it without first understanding the audit history of how it changed.',
    ],
    faqs: [
      { q: 'Can anyone change the audit trail?', a: 'No. It is generated automatically and is read-only, preserving its integrity.' },
      { q: 'Who can view it?', a: 'Management, executive and administrator roles with audit permission.' },
    ],
    relatedIds: ['timeline', 'user-management', 'matter-details'],
    nextSteps: ['Review the Activity Timeline for context.', 'Escalate any anomalies to an Administrator.'],
    keywords: ['audit', 'audit trail', 'changes', 'who changed what', 'before after', 'compliance', 'history', 'accountability'],
  },

  // --------------------------------------------------------------------------
  // HELP CENTRE (meta)
  // --------------------------------------------------------------------------
  {
    id: 'help-centre',
    title: 'Using the Help & Training Centre',
    category: 'getting-started',
    icon: 'LifeBuoy',
    summary: 'Search articles, take guided tours, use contextual help and track favourites.',
    audiences: ['all'],
    routes: ['/help'],
    tourId: 'new-user',
    estMinutes: 3,
    purpose:
      'The Help & Training Centre is your built-in trainer — searchable articles, interactive tours, contextual tooltips and quick-start guidance for every module.',
    whoShouldUse:
      'Everyone, especially new users learning the system and existing users adopting a new module.',
    businessPurpose:
      'Self-service training reduces onboarding time, cuts support requests and ensures the system is used correctly and consistently.',
    steps: [
      { title: 'Open the Help Centre', detail: 'Use the floating Help button (bottom-right), the Help item in the sidebar, or the "?" in the header.' },
      { title: 'Search the knowledge base', detail: 'Type any topic — matter, assignment, review, documents, reports — and results filter instantly.' },
      { title: 'Read contextual help', detail: 'On any page, open the Help drawer to see help for exactly where you are.' },
      { title: 'Take a guided tour', detail: 'Launch an interactive walkthrough that highlights the fields and buttons on the page.' },
      { title: 'Save favourites & track recents', detail: 'Star useful articles and revisit recently viewed topics.' },
      { title: 'Give feedback', detail: 'Use "Was this helpful?" so the content can be improved.' },
    ],
    requiredFields: [],
    validationRules: [],
    tips: [
      'New here? Start with the Quick Start guide and the New User Tour.',
      'The Help drawer is context-aware — it knows which page you are on.',
    ],
    commonMistakes: [
      'Searching the matter register when you meant to search Help — use the Help search box inside the Help Centre.',
    ],
    faqs: [
      { q: 'Can I print or download help?', a: 'Yes — each article can be printed, and you can download a PDF of the article for offline use.' },
      { q: 'Does help change with my role?', a: 'Yes — the Help Centre highlights content most relevant to your role.' },
    ],
    relatedIds: ['login', 'dashboard'],
    nextSteps: ['Take the New User Tour.', 'Explore the module most relevant to your role.'],
    keywords: ['help', 'training', 'guide', 'tour', 'search', 'faq', 'support', 'tooltips', 'knowledge base'],
  },
];
