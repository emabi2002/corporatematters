/**
 * Central Help Content for the DLPP Corporate Matters System.
 *
 * This file is the single source of truth for the whole Help & Training Centre:
 *  - Help articles (one per module / screen / task)
 *  - Role-based guidance (audiences)
 *  - Route -> Help article mapping (contextual help)
 *  - Guided walkthrough tours
 *  - Search + related-topic helpers
 *
 * It contains NO React and no imports, so it can be used anywhere (server or
 * client). The React layer lives in `src/components/help/*`.
 */

/* ------------------------------------------------------------------ */
/* Roles (audiences)                                                   */
/* ------------------------------------------------------------------ */

export type HelpRole =
  | 'legal_secretary'
  | 'legal_officer_corporate'
  | 'senior_legal_officer_corporate'
  | 'legal_officer_legislation'
  | 'manager_legal_services'
  | 'director_policy_legal'
  | 'deputy_secretary'
  | 'secretary'
  | 'system_administrator';

export const HELP_ROLES: HelpRole[] = [
  'legal_secretary',
  'legal_officer_corporate',
  'senior_legal_officer_corporate',
  'legal_officer_legislation',
  'manager_legal_services',
  'director_policy_legal',
  'deputy_secretary',
  'secretary',
  'system_administrator',
];

export const HELP_ROLE_LABELS: Record<HelpRole, string> = {
  legal_secretary: 'Legal Secretary',
  legal_officer_corporate: 'Legal Officer — Corporate',
  senior_legal_officer_corporate: 'Senior Legal Officer — Corporate',
  legal_officer_legislation: 'Legal Officer — Legislation',
  manager_legal_services: 'Manager — Legal Services',
  director_policy_legal: 'Director — Policy & Legal',
  deputy_secretary: 'Deputy Secretary',
  secretary: 'Secretary',
  system_administrator: 'System Administrator',
};

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export type HelpCategory =
  | 'Getting Started'
  | 'Matter Workflow'
  | 'Matter Register'
  | 'Matter Workspace'
  | 'Management'
  | 'Reports & Analytics'
  | 'Administration'
  | 'Help & Support';

export const HELP_CATEGORIES: HelpCategory[] = [
  'Getting Started',
  'Matter Workflow',
  'Matter Register',
  'Matter Workspace',
  'Management',
  'Reports & Analytics',
  'Administration',
  'Help & Support',
];

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface HelpField {
  name: string;
  required: boolean;
  description: string;
}

export interface HelpFaq {
  question: string;
  answer: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  category: HelpCategory;
  /** lucide-react icon name (mapped in HelpTopicIcon). */
  icon: string;
  /** One line shown on cards and in search results. */
  summary: string;
  /** Roles this article is most relevant to (audiences). */
  roles: HelpRole[];
  /** Route patterns this article maps to (used for contextual help). */
  routes: string[];
  /** Optional guided tour id. */
  tourId?: string;
  /** What the screen is and why it exists. */
  purpose: string;
  /** Plain-language description of who uses this. */
  whoShouldUse: string;
  /** Why this matters to DLPP as an organisation. */
  businessPurpose: string;
  /** Ordered, plain-language steps. */
  steps: string[];
  /** Fields on the screen and whether they are required. */
  requiredFields?: HelpField[];
  /** Rules the system enforces before saving. */
  validationRules?: string[];
  /** Tips / best practices. */
  bestPractices: string[];
  /** Things people commonly get wrong. */
  commonMistakes: string[];
  /** Frequently asked questions for this screen. */
  faqs?: HelpFaq[];
  /** Related article ids shown at the bottom. */
  relatedIds: string[];
  /** What happens next / after saving. */
  nextSteps: string[];
  /** Search keywords. */
  keywords: string[];
  /** Extra guidance shown when a specific role is selected. */
  roleNotes?: Partial<Record<HelpRole, string>>;
}

export interface HelpTourStep {
  /** CSS selector for the element to highlight. Omit for a centred step. */
  target?: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface HelpTour {
  id: string;
  title: string;
  /** Help article this tour belongs to (omitted for the welcome tour). */
  articleId?: string;
  steps: HelpTourStep[];
}

/* ------------------------------------------------------------------ */
/* Articles                                                            */
/* ------------------------------------------------------------------ */

export const HELP_ARTICLES: HelpArticle[] = [
  /* ============================ GETTING STARTED ==================== */
  {
    id: 'login',
    title: 'Signing In',
    category: 'Getting Started',
    icon: 'LogIn',
    summary: 'How to sign in securely to the Corporate Matters System.',
    roles: HELP_ROLES,
    routes: ['/auth/login'],
    purpose:
      'The sign-in screen is the secure front door to the Corporate Matters System. It confirms who you are and loads only the menus, matters and actions your role is permitted to use.',
    whoShouldUse: 'Every DLPP staff member who has been issued an account.',
    businessPurpose:
      'Access control protects confidential legal matters and creates an accountable record. Because every action is stamped with the signed-in user, secure sign-in underpins the integrity of the whole register.',
    steps: [
      'Open the system link provided by your administrator.',
      'Enter your official DLPP email address (for example, name@dlpp.gov.pg).',
      'Enter your password — passwords are case sensitive.',
      'Click “Sign In”.',
      'You are taken to the Dashboard, from where your role-based menu is available.',
    ],
    requiredFields: [
      { name: 'Email', required: true, description: 'Your official DLPP work email address.' },
      { name: 'Password', required: true, description: 'The password set by your administrator, or one you have reset.' },
    ],
    validationRules: [
      'Email and password must both be provided.',
      'The account must exist and be active.',
      'Incorrect credentials return a clear error without revealing which field was wrong.',
    ],
    bestPractices: [
      'Never share your login — every action is recorded against the signed-in user.',
      'Sign out when leaving a shared computer.',
      'Ask the administrator for a reset rather than guessing your password repeatedly.',
    ],
    commonMistakes: [
      'Using a personal email instead of the official DLPP email.',
      'Leaving CAPS LOCK on when typing the password.',
      'Bookmarking an old preview link instead of the current system URL.',
    ],
    faqs: [
      { question: 'I forgot my password — what do I do?', answer: 'Contact your System Administrator to issue a reset. For security, passwords cannot be recovered, only reset.' },
      { question: 'Why can I not see some menus after signing in?', answer: 'Menus are role-based. You only see the modules your role and group permissions allow. Ask an administrator if you need more access.' },
    ],
    relatedIds: ['dashboard', 'user-management', 'help-centre'],
    nextSteps: [
      'The system checks your role and group permissions.',
      'Your personal menu loads, showing only the modules you may use.',
      'Your sign-in is written to the audit trail.',
    ],
    keywords: ['login', 'sign in', 'log on', 'password', 'access', 'account', 'authentication'],
    roleNotes: {
      system_administrator:
        'If a user cannot sign in, confirm the account exists, is active, and is assigned to at least one group under User Management.',
    },
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    category: 'Getting Started',
    icon: 'LayoutDashboard',
    summary: 'Read the key numbers, trends and alerts for corporate matters at a glance.',
    roles: HELP_ROLES,
    routes: ['/dashboard'],
    tourId: 'dashboard',
    purpose:
      'The Dashboard is a live summary of the whole corporate caseload — how many matters are open, their workflow stage, priorities, deadlines and recent activity — so you can decide what needs attention first.',
    whoShouldUse:
      'Everyone. Managers and executives monitor performance; officers get a quick overview of their own work each morning.',
    businessPurpose:
      'A shared, real-time picture of the register improves oversight, helps meet turnaround targets, and lets management steer resources to overdue or high-priority matters.',
    steps: [
      'Open “Dashboard” from the top of the sidebar (it is your landing page).',
      'Read the metric tiles — Total Matters, My Assigned, Awaiting Action, Completed this month, Overdue, Due in 3 Days, Average Turnaround and Active.',
      'Use the charts to see how matters spread by stage, priority and division.',
      'Scan the Recent Activity panel, and the overdue list, for items needing attention.',
      'Click any tile or chart to jump into the matching filtered list of matters.',
    ],
    bestPractices: [
      'Start each day on the Dashboard to triage before opening individual matters.',
      'Use the overdue and pending tiles as a daily to-do list.',
      'Quote the trend figures in management meetings to explain workload.',
    ],
    commonMistakes: [
      'Assuming the figures are stale — the Dashboard refreshes from live data every time it opens.',
      'Ignoring the overdue tile, which is the fastest way to catch slipping deadlines.',
    ],
    faqs: [
      { question: 'Do the numbers include everyone’s matters?', answer: 'Yes, subject to your permissions. Officers with restricted access see figures for the matters they are entitled to view.' },
      { question: 'Can I act on a figure directly?', answer: 'Yes — clicking a tile or chart segment opens the Matter Register already filtered to those records.' },
    ],
    relatedIds: ['matter-register', 'my-matters', 'reports', 'notifications'],
    nextSteps: [
      'The Dashboard is read-only, so nothing is saved here.',
      'Clicking a figure filters the Matter Register so you can act on those records.',
    ],
    keywords: ['dashboard', 'overview', 'home', 'statistics', 'metrics', 'kpi', 'charts', 'alerts', 'summary'],
    roleNotes: {
      manager_legal_services:
        'Use the stage and division charts to balance workload across officers before matters become overdue.',
      director_policy_legal:
        'The trend tiles are designed for reporting up — they summarise throughput and backlog at a glance.',
    },
  },

  /* ============================ MATTER WORKFLOW =================== */
  {
    id: 'register-new-matter',
    title: 'Register a New Matter',
    category: 'Matter Workflow',
    icon: 'FilePlus',
    summary: 'Create a new corporate matter and capture the details needed to start work.',
    roles: ['legal_secretary', 'legal_officer_corporate', 'senior_legal_officer_corporate', 'legal_officer_legislation', 'manager_legal_services', 'system_administrator'],
    routes: ['/matters/new', '/matters/register'],
    tourId: 'register-new-matter',
    purpose:
      'This screen creates a new record in the corporate matters register. Everything that follows — assignment, review, documents, closure — hangs off the record you create here.',
    whoShouldUse:
      'Legal Secretaries and Legal Officers who receive new instructions, requests or referrals that must be tracked.',
    businessPurpose:
      'A complete, well-classified record at intake means faster assignment, accurate reporting, and a defensible audit trail from the very first day of a matter.',
    steps: [
      'Open “Register Matter” from the Matter Workflow group in the sidebar.',
      'Step 1 — Basic Information: choose the type of matter and priority, then enter the subject and a clear summary.',
      'Step 2 — Requester Details: record who is making the request and their division.',
      'Step 3 — Request & Land Details: capture the request type and any land / lease details.',
      'Step 4 — Initial Documents: attach any documents (optional), then check the Review Summary.',
      'Click Register to generate the matter number and save the matter.',
    ],
    requiredFields: [
      { name: 'Type of Matter', required: true, description: 'The category of corporate matter (advice, contract, legislation, litigation, etc.).' },
      { name: 'Requesting Division', required: true, description: 'The DLPP division that raised the request.' },
      { name: 'Subject / Title', required: true, description: 'A short, searchable title that identifies the matter.' },
      { name: 'Date Received', required: true, description: 'The date the request was received by Legal Services.' },
      { name: 'Priority', required: true, description: 'Routine, Medium, High or Urgent — drives sorting and alerts.' },
      { name: 'Description', required: false, description: 'The full context of the request; the more detail, the faster the assignment.' },
    ],
    validationRules: [
      'Required fields must be completed before the matter can be saved.',
      'The date received cannot be in the future.',
      'A unique matter number is generated automatically on save — you do not type it.',
    ],
    bestPractices: [
      'Write a specific subject line (“Lease variation — Portion 123, Lae”) rather than a vague one (“Advice”).',
      'Capture the requester and division accurately so acknowledgements and reports are correct.',
      'Attach or note the source instruction so the assigned officer has full context.',
    ],
    commonMistakes: [
      'Choosing the wrong matter type, which sends it down the wrong workflow.',
      'Leaving the description blank, forcing the officer to chase the requester.',
      'Setting every matter to “Urgent”, which defeats prioritisation.',
    ],
    faqs: [
      { question: 'Can I edit a matter after registering it?', answer: 'Yes. Open the matter and use Edit. Significant changes are recorded in the activity timeline and audit trail.' },
      { question: 'Who does the matter go to after I register it?', answer: 'New matters enter “Pending Assignment” until a manager assigns an action officer.' },
    ],
    relatedIds: ['matter-assignment', 'matter-register', 'matter-details', 'pending-assignment'],
    nextSteps: [
      'A unique matter number is generated and the record is saved.',
      'The matter appears in the register with the stage “Pending Assignment”.',
      'A manager can now assign it to an action officer.',
    ],
    keywords: ['register', 'new matter', 'create', 'intake', 'lodge', 'open matter', 'add matter'],
    roleNotes: {
      legal_secretary:
        'You typically register matters on behalf of the division. Double-check the requester details — acknowledgements use them.',
    },
  },
  {
    id: 'matter-assignment',
    title: 'Matter Assignment',
    category: 'Matter Workflow',
    icon: 'UserCheck',
    summary: 'Assign a matter to the right action officer with instructions and a due date.',
    roles: ['senior_legal_officer_corporate', 'manager_legal_services', 'director_policy_legal', 'system_administrator'],
    routes: ['/matters/[id]/assign'],
    tourId: 'matter-assignment',
    purpose:
      'Assignment moves a newly registered matter to a named action officer, with clear instructions and a target date, so ownership and expectations are unambiguous.',
    whoShouldUse:
      'Managers and senior officers who allocate work across the Legal Services team.',
    businessPurpose:
      'Clear allocation is the difference between a matter that progresses and one that stalls. Assignment sets accountability and starts the turnaround clock.',
    steps: [
      'Open the matter (or pick one from “Pending Assignment”).',
      'Click Assign.',
      'Choose the action officer best suited to the matter type and workload.',
      'Write clear Manager Instructions describing the expected outcome.',
      'Optionally set a due date to override the current SLA date.',
      'Submit — the officer is notified and the matter moves to “Active”.',
    ],
    requiredFields: [
      { name: 'Assign to Officer', required: true, description: 'The officer who will own and progress the matter.' },
      { name: 'Manager Instructions', required: false, description: 'What the officer is expected to do and deliver. Optional, but strongly recommended so expectations are clear.' },
      { name: 'Due Date', required: false, description: 'Optional override of the SLA due date. Leave blank to keep the current due date.' },
    ],
    validationRules: [
      'An action officer must be selected before you can assign.',
      'The due date is optional — leaving it blank keeps the current SLA due date.',
      'Only users with assignment permission can complete this action.',
    ],
    bestPractices: [
      'Match the officer to the matter type and current workload — check the Dashboard first.',
      'State the deliverable, not just the task (“Draft advice on…”, not “Look at this”).',
      'Set due dates that leave room for review before any external deadline.',
    ],
    commonMistakes: [
      'Assigning without instructions, so the officer has to ask what is expected.',
      'Ignoring existing workload and overloading one officer.',
      'Setting the due date on the deadline itself, leaving no time for review.',
    ],
    faqs: [
      { question: 'Can I reassign a matter later?', answer: 'Yes. Reassignment is recorded in the activity timeline so the history of ownership is preserved.' },
      { question: 'Does the officer get notified?', answer: 'Yes — assignment raises a notification for the chosen officer.' },
    ],
    relatedIds: ['pending-assignment', 'register-new-matter', 'matter-details', 'my-matters'],
    nextSteps: [
      'The chosen officer is notified of the new assignment.',
      'The matter moves from “Pending Assignment” to “Active”.',
      'The assignment and due date are stamped into the timeline.',
    ],
    keywords: ['assign', 'assignment', 'allocate', 'action officer', 'delegate', 'ownership'],
  },
  {
    id: 'my-matters',
    title: 'My Matters',
    category: 'Matter Workflow',
    icon: 'Briefcase',
    summary: 'See and manage the matters currently assigned to you.',
    roles: ['legal_officer_corporate', 'senior_legal_officer_corporate', 'legal_officer_legislation', 'manager_legal_services'],
    routes: ['/matters?view=my'],
    purpose:
      '“My Matters” is your personal worklist — a filtered view of the register showing only the matters assigned to you, so you can focus on what you own.',
    whoShouldUse: 'Any officer who is assigned matters to progress.',
    businessPurpose:
      'A reliable personal worklist keeps officers on top of their own deadlines and reduces the risk of a matter being forgotten.',
    steps: [
      'Open “My Matters” from the Matter Workflow group.',
      'Review the list — it shows only matters assigned to you.',
      'Sort or filter by stage, priority or due date to plan your day.',
      'Click a matter to open its workspace and continue work.',
    ],
    bestPractices: [
      'Work overdue and high-priority matters first.',
      'Keep each matter’s stage current so managers see accurate progress.',
      'Use tasks inside a matter to break large pieces of work into steps.',
    ],
    commonMistakes: [
      'Only looking at “My Matters” and missing team items in “Pending Review”.',
      'Letting the stage fall out of date, which distorts reports.',
    ],
    faqs: [
      { question: 'Why is a matter missing from my list?', answer: 'It may not be assigned to you, or it may be closed. Check the full register or ask your manager.' },
    ],
    relatedIds: ['matter-register', 'matter-details', 'tasks', 'pending-review'],
    nextSteps: [
      'Opening a matter takes you to its workspace where you progress the work.',
      'Changes you make are reflected on the Dashboard and in reports.',
    ],
    keywords: ['my matters', 'my work', 'assigned to me', 'worklist', 'caseload'],
  },
  {
    id: 'pending-assignment',
    title: 'Pending Assignment',
    category: 'Matter Workflow',
    icon: 'UserPlus',
    summary: 'The queue of newly registered matters waiting to be allocated.',
    roles: ['senior_legal_officer_corporate', 'manager_legal_services', 'director_policy_legal', 'system_administrator'],
    routes: ['/matters?status=pending_assignment'],
    purpose:
      'This queue holds every matter that has been registered but not yet assigned to an action officer, so nothing waits unnoticed.',
    whoShouldUse: 'Managers and senior officers responsible for allocating work.',
    businessPurpose:
      'Watching this queue keeps intake flowing. Matters that sit here unassigned are turnaround time lost before work has even begun.',
    steps: [
      'Open “Pending Assignment” from the Matter Workflow group.',
      'Review the waiting matters, oldest and highest priority first.',
      'Open a matter to read the request, then click Assign.',
      'Allocate it to the most suitable officer with instructions and a due date.',
    ],
    bestPractices: [
      'Clear this queue daily so matters do not lose days before starting.',
      'Prioritise urgent and statutory-deadline matters.',
    ],
    commonMistakes: [
      'Letting the queue build up, silently eating into turnaround targets.',
      'Assigning in received-order without checking priority.',
    ],
    faqs: [
      { question: 'How do matters get here?', answer: 'Every newly registered matter starts in Pending Assignment until a manager allocates it.' },
    ],
    relatedIds: ['matter-assignment', 'register-new-matter', 'matter-register'],
    nextSteps: [
      'Assigning a matter removes it from this queue.',
      'It moves to “Active” and appears in the officer’s “My Matters”.',
    ],
    keywords: ['pending assignment', 'unassigned', 'queue', 'allocate', 'intake queue', 'waiting'],
  },
  {
    id: 'pending-review',
    title: 'Pending Review',
    category: 'Matter Workflow',
    icon: 'FileClock',
    summary: 'Matters with a draft submitted and awaiting approval.',
    roles: ['senior_legal_officer_corporate', 'manager_legal_services', 'director_policy_legal', 'deputy_secretary', 'secretary'],
    routes: ['/matters?status=pending_review'],
    purpose:
      'This queue shows matters where an officer has submitted a draft and is waiting for a reviewer to approve, return or escalate it.',
    whoShouldUse: 'Reviewers and approvers — senior officers, managers and executives.',
    businessPurpose:
      'Timely review is often the last step before advice leaves the department. Keeping this queue short protects quality and meets client expectations.',
    steps: [
      'Open “Pending Review” from the Matter Workflow group.',
      'Pick a matter and open the Draft Review workflow.',
      'Read the draft and supporting documents.',
      'Approve, return with comments, or escalate as appropriate.',
    ],
    bestPractices: [
      'Review promptly — drafts waiting here hold up the whole matter.',
      'Give specific, constructive comments when returning a draft.',
    ],
    commonMistakes: [
      'Approving without reading the supporting documents.',
      'Returning a draft with vague feedback the officer cannot action.',
    ],
    faqs: [
      { question: 'What happens when I return a draft?', answer: 'It goes back to the action officer with your comments, and the matter stays in the review cycle until approved.' },
    ],
    relatedIds: ['draft-review', 'matter-details', 'matter-closure'],
    nextSteps: [
      'Approving advances the matter toward closure.',
      'Returning sends it back to the officer with your comments.',
    ],
    keywords: ['pending review', 'approval', 'review queue', 'draft', 'awaiting review'],
  },
  {
    id: 'matter-closure',
    title: 'Matter Closure',
    category: 'Matter Workflow',
    icon: 'CheckCircle2',
    summary: 'Formally close a completed matter and lock its final record.',
    roles: ['senior_legal_officer_corporate', 'manager_legal_services', 'director_policy_legal', 'deputy_secretary', 'secretary', 'system_administrator'],
    routes: ['/matters/[id]/close'],
    tourId: 'matter-closure',
    purpose:
      'Closure marks a matter as complete. It captures the outcome, confirms deliverables are filed, and moves the record into the closed register for reporting and audit.',
    whoShouldUse: 'Senior officers, managers and executives with authority to close matters.',
    businessPurpose:
      'Clean closure is what makes turnaround and outcome reporting meaningful. A properly closed matter is a defensible, complete record of what the department did and why.',
    steps: [
      'Open the completed matter and click Close.',
      'Choose a Closure Reason (Completed Successfully, Delivered Final Output, Matter Resolved, Withdrawn by Requester, Superseded or Other).',
      'Add Closure Notes summarising the outcome for the record.',
      'Work through the closure checklist to confirm the matter is ready to close.',
      'Submit — the matter moves to “Closed” and the closed date is stamped.',
    ],
    requiredFields: [
      { name: 'Closure Reason', required: true, description: 'The outcome: Completed Successfully, Delivered Final Output, Matter Resolved, Withdrawn by Requester, Superseded or Other.' },
      { name: 'Closure Notes', required: false, description: 'A short summary a future reader will understand without opening every document.' },
    ],
    validationRules: [
      'The matter should have an approved draft or recorded outcome before closing.',
      'Only users with closure permission can complete this action.',
      'Closed matters become read-only except for permitted administrative actions.',
    ],
    bestPractices: [
      'Attach the final deliverable before closing so the record is complete.',
      'Write an outcome that a future reader will understand without opening every document.',
    ],
    commonMistakes: [
      'Closing before the final document is filed.',
      'Leaving the outcome vague, which weakens reporting.',
    ],
    faqs: [
      { question: 'Can a closed matter be reopened?', answer: 'Reopening is an administrative action and is recorded in the audit trail. Ask an administrator if a matter was closed in error.' },
      { question: 'Does closing delete anything?', answer: 'No. Closure preserves the full record and simply changes the stage to Closed.' },
    ],
    relatedIds: ['draft-review', 'pending-review', 'matter-details', 'reports'],
    nextSteps: [
      'The matter moves to “Closed” with a closed date.',
      'It drops out of active queues and feeds turnaround and outcome reports.',
    ],
    keywords: ['close', 'closure', 'complete', 'finalise', 'outcome', 'archive'],
  },

  /* ============================ MATTER WORKSPACE ================== */
  {
    id: 'matter-details',
    title: 'Matter Details Workspace',
    category: 'Matter Workspace',
    icon: 'FolderOpen',
    summary: 'The central workspace where all information and actions for a matter live.',
    roles: HELP_ROLES,
    routes: ['/matters/[id]', '/matters/[id]/details'],
    tourId: 'matter-details',
    purpose:
      'The matter workspace brings everything about a single matter into one place — its details, land/lease information, legal issues, stakeholders, documents, tasks, reviews, timeline and audit — organised into tabs.',
    whoShouldUse: 'Anyone working on or reviewing a specific matter.',
    businessPurpose:
      'One consolidated workspace per matter removes the risk of scattered information and gives every user a single, reliable source of truth.',
    steps: [
      'Open a matter from the register, “My Matters” or a Dashboard tile.',
      'Read the header strip for the matter number, stage, priority and key dates.',
      'Use the tabs to move between details, land/lease, legal issues, stakeholders, documents, tasks and reviews.',
      'Use the action buttons (Edit, Assign, Submit for Review, Close) as your role allows.',
      'Check the timeline and audit tabs to see the full history.',
    ],
    bestPractices: [
      'Keep the stage and key fields current so the register and reports stay accurate.',
      'Record decisions as you go — the timeline is only as good as what you enter.',
    ],
    commonMistakes: [
      'Working from email instead of the workspace, so the record is incomplete.',
      'Forgetting to save edits before switching tabs.',
    ],
    faqs: [
      { question: 'Why can I not edit some fields?', answer: 'Editing depends on your role and the matter’s stage. Closed matters are read-only for most users.' },
    ],
    relatedIds: ['land-lease-details', 'legal-issues', 'stakeholders', 'documents', 'tasks', 'draft-review', 'activity-timeline'],
    nextSteps: [
      'Actions taken here update the register, Dashboard and reports.',
      'Every change is recorded in the timeline and audit trail.',
    ],
    keywords: ['matter details', 'workspace', 'tabs', 'record', 'case file', 'matter file'],
  },
  {
    id: 'land-lease-details',
    title: 'Land / Lease Details',
    category: 'Matter Workspace',
    icon: 'MapPin',
    summary: 'Capture the land parcel, lease and title information linked to a matter.',
    roles: ['legal_officer_corporate', 'senior_legal_officer_corporate', 'legal_officer_legislation', 'manager_legal_services'],
    routes: ['/matters/[id]/details'],
    purpose:
      'This tab records the property context of a matter — portion and section, location, lease type, title reference and related dates — so land-related matters carry the facts lawyers need.',
    whoShouldUse: 'Officers handling lease, title or land-related corporate matters.',
    businessPurpose:
      'Accurate land and lease data links legal work to the underlying property, supports searches, and prevents costly errors on references and titles.',
    steps: [
      'Open the matter and select the Land / Lease tab.',
      'Enter the portion, section and location details.',
      'Record the lease type and any title or volume/folio reference.',
      'Add relevant dates (grant, expiry, variation).',
      'Save your changes.',
    ],
    requiredFields: [
      { name: 'Location / Portion', required: false, description: 'The land parcel the matter concerns.' },
      { name: 'Lease Type', required: false, description: 'The category of lease or tenure involved.' },
      { name: 'Title Reference', required: false, description: 'The volume/folio or title number.' },
    ],
    bestPractices: [
      'Copy references exactly from the title document to avoid transcription errors.',
      'Record expiry and variation dates so deadlines can be tracked.',
    ],
    commonMistakes: [
      'Transposing digits in a title or portion number.',
      'Leaving lease type blank when it drives the legal analysis.',
    ],
    relatedIds: ['matter-details', 'legal-issues', 'documents'],
    nextSteps: [
      'Saved land data appears on the matter and in searches.',
      'It gives reviewers the property context behind the legal issues.',
    ],
    keywords: ['land', 'lease', 'title', 'portion', 'section', 'parcel', 'property', 'tenure'],
  },
  {
    id: 'legal-issues',
    title: 'Legal Issues',
    category: 'Matter Workspace',
    icon: 'Scale',
    summary: 'Record the legal questions, applicable law and risk for a matter.',
    roles: ['legal_officer_corporate', 'senior_legal_officer_corporate', 'legal_officer_legislation', 'manager_legal_services', 'director_policy_legal'],
    routes: ['/matters/[id]/details'],
    purpose:
      'The Legal Issues tab frames the matter in legal terms — the questions to be answered, the applicable legislation and authorities, and an assessment of risk.',
    whoShouldUse: 'Legal Officers analysing a matter and reviewers assessing it.',
    businessPurpose:
      'Capturing the legal issues and risk in a structured way improves the quality of advice and lets management see exposure across the portfolio.',
    steps: [
      'Open the matter and select the Legal Issues tab.',
      'State each legal question the matter raises.',
      'Record the applicable law, sections and authorities.',
      'Assess and set the risk classification.',
      'Save your analysis.',
    ],
    requiredFields: [
      { name: 'Legal Issue(s)', required: false, description: 'The legal questions to be resolved.' },
      { name: 'Applicable Law', required: false, description: 'The Acts, sections and authorities relied on.' },
      { name: 'Risk Classification', required: false, description: 'The assessed level of legal risk.' },
    ],
    bestPractices: [
      'Separate distinct questions rather than merging them into one paragraph.',
      'Cite specific sections so reviewers can verify the analysis quickly.',
    ],
    commonMistakes: [
      'Recording conclusions without the questions or authorities behind them.',
      'Leaving risk unclassified, so exposure cannot be reported.',
    ],
    relatedIds: ['matter-details', 'land-lease-details', 'draft-review'],
    nextSteps: [
      'The analysis informs the draft advice and the reviewer’s assessment.',
      'Risk classifications roll up into management reporting.',
    ],
    keywords: ['legal issues', 'applicable law', 'risk', 'analysis', 'legislation', 'authorities'],
  },
  {
    id: 'stakeholders',
    title: 'Stakeholders',
    category: 'Matter Workspace',
    icon: 'Users',
    summary: 'Record the people and organisations connected to a matter.',
    roles: ['legal_secretary', 'legal_officer_corporate', 'senior_legal_officer_corporate', 'legal_officer_legislation', 'manager_legal_services'],
    routes: ['/matters/[id]/details'],
    purpose:
      'The Stakeholders tab lists everyone connected to the matter — requesters, parties, external counsel, agencies and contacts — with their role and details.',
    whoShouldUse: 'Anyone who needs to know who is involved in a matter.',
    businessPurpose:
      'A clear stakeholder list speeds up correspondence, avoids missed parties, and supports conflict checks.',
    steps: [
      'Open the matter and select the Stakeholders tab.',
      'Add each person or organisation with their role.',
      'Record contact details where relevant.',
      'Save the list and keep it up to date as parties change.',
    ],
    bestPractices: [
      'Capture the role (requester, respondent, counsel) so the list is meaningful.',
      'Keep contact details current so correspondence reaches the right people.',
    ],
    commonMistakes: [
      'Recording a name with no role or contact detail.',
      'Forgetting to add external counsel or the responsible agency.',
    ],
    relatedIds: ['matter-details', 'documents', 'notifications'],
    nextSteps: [
      'Stakeholders are available for correspondence and reference.',
      'The list supports conflict checks and hand-overs.',
    ],
    keywords: ['stakeholders', 'parties', 'contacts', 'people', 'counsel', 'requester'],
  },
  {
    id: 'draft-review',
    title: 'Draft Review Workflow',
    category: 'Matter Workspace',
    icon: 'FileCheck',
    summary: 'Submit a draft for approval, or review and decide on a submitted draft.',
    roles: ['legal_officer_corporate', 'senior_legal_officer_corporate', 'legal_officer_legislation', 'manager_legal_services', 'director_policy_legal', 'deputy_secretary', 'secretary'],
    routes: ['/matters/[id]/review'],
    tourId: 'draft-review',
    purpose:
      'The Draft Review workflow controls the approval cycle for a matter’s advice or output. Officers submit drafts; reviewers approve, return with comments, or escalate.',
    whoShouldUse:
      'Action officers submitting work for approval, and the senior officers, managers and executives who review it.',
    businessPurpose:
      'A structured review cycle protects quality and creates a clear record of who approved what and when — essential for legal accountability.',
    steps: [
      'As the action officer, open the matter’s Review tab and attach the draft.',
      'Add a note for the reviewer and Submit for Review.',
      'The reviewer opens the matter from “Pending Review”.',
      'The reviewer reads the draft and chooses Approve, Return or Escalate.',
      'If returned, address the comments and resubmit until approved.',
    ],
    requiredFields: [
      { name: 'Draft / Attachment', required: true, description: 'The document being submitted for approval.' },
      { name: 'Reviewer Note', required: false, description: 'Context to help the reviewer assess the draft.' },
      { name: 'Decision', required: true, description: 'Approve, Return with comments, or Escalate (reviewer).' },
    ],
    validationRules: [
      'A draft must be present before it can be submitted for review.',
      'A returning reviewer should provide comments explaining what to change.',
      'Only reviewers with the right permission can approve or escalate.',
    ],
    bestPractices: [
      'Submit the near-final draft, not a rough note, to save review cycles.',
      'Reviewers: give specific, actionable comments when returning.',
    ],
    commonMistakes: [
      'Submitting without attaching the actual draft.',
      'Returning a draft without saying what needs to change.',
    ],
    faqs: [
      { question: 'What does “escalate” do?', answer: 'It refers the draft to a higher authority for a decision — used for sensitive or high-risk matters.' },
      { question: 'Where do returned drafts go?', answer: 'Back to the action officer, with the reviewer’s comments, so they can revise and resubmit.' },
    ],
    relatedIds: ['pending-review', 'matter-details', 'matter-closure', 'documents'],
    nextSteps: [
      'Approved drafts clear the way to close the matter.',
      'Each decision is stamped into the timeline and audit trail.',
    ],
    keywords: ['review', 'draft', 'approve', 'return', 'escalate', 'workflow', 'sign off'],
  },
  {
    id: 'activity-timeline',
    title: 'Activity Timeline',
    category: 'Matter Workspace',
    icon: 'History',
    summary: 'A chronological record of everything that has happened on a matter.',
    roles: HELP_ROLES,
    routes: ['/matters/[id]/details'],
    purpose:
      'The Activity Timeline lists, in order, every significant event on a matter — creation, assignment, edits, submissions, reviews and closure — so the story of the matter is easy to follow.',
    whoShouldUse: 'Anyone who needs to understand what has happened and when.',
    businessPurpose:
      'A readable history speeds up hand-overs, answers “what happened here?” instantly, and supports accountability without digging through documents.',
    steps: [
      'Open the matter and select the Timeline tab.',
      'Read events from newest to oldest.',
      'Use it to brief yourself before continuing work or reviewing.',
    ],
    bestPractices: [
      'Record decisions and key actions so the timeline tells the full story.',
      'Read the timeline first when picking up a matter you did not start.',
    ],
    commonMistakes: [
      'Confusing the timeline (human-readable events) with the audit trail (technical record).',
    ],
    relatedIds: ['matter-details', 'audit-trail', 'draft-review'],
    nextSteps: [
      'The timeline updates automatically as work progresses.',
      'It complements the audit trail for accountability.',
    ],
    keywords: ['timeline', 'activity', 'history', 'events', 'log', 'progress'],
  },

  /* ============================ MANAGEMENT ======================== */
  {
    id: 'documents',
    title: 'Documents',
    category: 'Management',
    icon: 'FileText',
    summary: 'Upload, organise and retrieve documents across all matters.',
    roles: HELP_ROLES,
    routes: ['/documents'],
    tourId: 'documents',
    purpose:
      'The Documents register is the department-wide library of files attached to matters. You can upload, classify, search, download and manage documents from one place.',
    whoShouldUse: 'Everyone who files or retrieves documents.',
    businessPurpose:
      'Centralised, classified documents mean nothing is lost, the right version is always found, and the record supporting each matter is complete.',
    steps: [
      'Open “Documents” from the Management group.',
      'Click Upload, then choose the matter, file, document type and stage.',
      'Save to attach the document to the matter.',
      'Use search and the All / Final / Drafts filters to find documents.',
      'Download or edit metadata from the table as needed.',
    ],
    requiredFields: [
      { name: 'Matter', required: true, description: 'The matter the document belongs to.' },
      { name: 'File', required: true, description: 'The document to upload.' },
      { name: 'Document Type', required: true, description: 'The classification (advice, contract, correspondence, etc.).' },
      { name: 'Stage', required: false, description: 'Draft or Final, so versions are clear.' },
    ],
    validationRules: [
      'A matter and a file must be selected before uploading.',
      'Document type is required so files can be found and reported on.',
    ],
    bestPractices: [
      'Classify every upload — untyped files are hard to find later.',
      'Mark drafts and finals correctly so the current version is obvious.',
      'Use clear file names that include the matter and document kind.',
    ],
    commonMistakes: [
      'Uploading to the wrong matter — check the selector before saving.',
      'Leaving everything as “Draft”, so no one can tell the final version.',
    ],
    faqs: [
      { question: 'Can I replace a document with a new version?', answer: 'Upload the new version and mark it Final; keep the earlier draft for the record rather than deleting history.' },
      { question: 'Who can delete a document?', answer: 'Deletion depends on your permissions and is recorded. Prefer superseding over deleting.' },
    ],
    relatedIds: ['matter-details', 'document-types', 'draft-review', 'tasks'],
    nextSteps: [
      'Uploaded documents appear on their matter and in the global register.',
      'They become available to reviewers and in search.',
    ],
    keywords: ['documents', 'upload', 'files', 'attachments', 'download', 'library'],
  },
  {
    id: 'tasks',
    title: 'Tasks',
    category: 'Management',
    icon: 'CheckSquare',
    summary: 'Create and track work items across all matters.',
    roles: HELP_ROLES,
    routes: ['/tasks'],
    tourId: 'tasks',
    purpose:
      'The Tasks register lets you break matters into concrete, trackable actions with an owner, priority, status and due date — across the whole department or just your own list.',
    whoShouldUse: 'Everyone who plans or tracks pieces of work on matters.',
    businessPurpose:
      'Tasks turn intentions into accountable actions, reduce dropped balls, and give managers visibility of what is outstanding and overdue.',
    steps: [
      'Open “Tasks” from the Management group.',
      'Click New Task and choose the matter it belongs to.',
      'Describe the task and set the type, assignee, priority and due date.',
      'Save — the task appears in the list and on the matter.',
      'Update status inline (Pending → In Progress → Completed) as you work.',
    ],
    requiredFields: [
      { name: 'Matter', required: true, description: 'The matter the task relates to.' },
      { name: 'Description', required: true, description: 'What needs to be done.' },
      { name: 'Assigned Officer', required: false, description: 'Who owns the task.' },
      { name: 'Priority', required: false, description: 'Low, Medium, High or Urgent.' },
      { name: 'Due Date', required: false, description: 'When the task should be completed.' },
    ],
    validationRules: [
      'A matter and a description are required to create a task.',
      'Completing a task records the completion date automatically.',
    ],
    bestPractices: [
      'Write tasks as clear actions (“Draft clause 4”, not “clause 4”).',
      'Use the My Tasks and Overdue filters to plan your day.',
      'Set due dates so priorities are visible to the whole team.',
    ],
    commonMistakes: [
      'Creating tasks with no due date, so nothing signals urgency.',
      'Leaving completed work as “In Progress”, which distorts reports.',
    ],
    faqs: [
      { question: 'Can I see only my tasks?', answer: 'Yes — use the “My Tasks” filter pill at the top of the list.' },
    ],
    relatedIds: ['matter-details', 'my-matters', 'notifications'],
    nextSteps: [
      'Tasks appear on their matter and in your worklist.',
      'Status changes feed progress views and reports.',
    ],
    keywords: ['tasks', 'to-do', 'actions', 'work items', 'checklist', 'assignments'],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    category: 'Management',
    icon: 'Bell',
    summary: 'Stay informed of assignments, reviews and reminders.',
    roles: HELP_ROLES,
    routes: ['/notifications'],
    tourId: 'notifications',
    purpose:
      'Notifications keep you informed of things that need your attention — new assignments, drafts awaiting review, approaching due dates and system messages.',
    whoShouldUse: 'Everyone. Notifications are how the system reaches you.',
    businessPurpose:
      'Timely notifications reduce delays, prevent missed deadlines, and mean important matters are acted on without needing constant manual checking.',
    steps: [
      'Open “Notifications” from the Management group, or click the bell in the header.',
      'Read your notifications, newest first.',
      'Mark items as read, or clear them once actioned.',
      'Where relevant, compose a notification to another user.',
    ],
    requiredFields: [
      { name: 'Recipient', required: true, description: 'The user to notify (when composing).' },
      { name: 'Type', required: false, description: 'The category of notification.' },
      { name: 'Title & Message', required: true, description: 'The subject and body of the notification.' },
    ],
    bestPractices: [
      'Check the bell regularly, or start on the Notifications page after the Dashboard.',
      'Clear notifications once actioned so the list reflects what still needs attention.',
    ],
    commonMistakes: [
      'Ignoring the bell and missing an assignment or review request.',
      'Marking everything read without actioning it.',
    ],
    faqs: [
      { question: 'Do notifications email me?', answer: 'They appear in-app under the bell and on the Notifications page. Ask your administrator about any external delivery.' },
    ],
    relatedIds: ['dashboard', 'matter-assignment', 'draft-review', 'tasks'],
    nextSteps: [
      'Acting on a notification usually opens the related matter or task.',
      'Cleared notifications leave a tidy, current list.',
    ],
    keywords: ['notifications', 'alerts', 'reminders', 'messages', 'bell', 'inbox'],
  },
  /* ============================ MATTER REGISTER ================== */
  {
    id: 'matter-register',
    title: 'Matter Register',
    category: 'Matter Register',
    icon: 'ClipboardList',
    summary: 'The complete, searchable list of every corporate matter.',
    roles: HELP_ROLES,
    routes: ['/matters'],
    tourId: 'matter-register',
    purpose:
      'The Matter Register is the master list of all corporate matters. Powerful filters and search let you find any matter and drill into it, whatever its stage.',
    whoShouldUse: 'Everyone. It is the main way to find and open matters.',
    businessPurpose:
      'A single authoritative register is the backbone of the system — it is where oversight, search and reporting all begin.',
    steps: [
      'Open “All Matters” from the Matter Register group (or click a Dashboard tile).',
      'Use the quick-filter tabs (All, My, Active, In Review, Overdue, Closed).',
      'Search by matter number, subject, requester or division.',
      'Sort by any column to prioritise your view.',
      'Click a row to open the matter’s workspace.',
    ],
    bestPractices: [
      'Use quick filters before scrolling — they are faster than paging through everything.',
      'Combine search with a status filter to zero in on exactly what you need.',
    ],
    commonMistakes: [
      'Scrolling the full list when a filter or search would find it instantly.',
      'Forgetting a filter is still applied and thinking matters are missing.',
    ],
    faqs: [
      { question: 'How do I clear a filter?', answer: 'Remove the active filter chip in the header, or click the “All” tab to reset the view.' },
      { question: 'Why do I see fewer matters than a colleague?', answer: 'The register respects permissions — you see the matters your role is entitled to view.' },
    ],
    relatedIds: ['dashboard', 'my-matters', 'register-new-matter', 'matter-details'],
    nextSteps: [
      'Clicking a matter opens its workspace.',
      'Filters and searches can be re-used any time from the register.',
    ],
    keywords: ['register', 'all matters', 'list', 'search', 'filter', 'find matter', 'browse'],
  },

  /* ============================ REPORTS & ANALYTICS ============== */
  {
    id: 'reports',
    title: 'Reports & Analytics',
    category: 'Reports & Analytics',
    icon: 'BarChart3',
    summary: 'Performance metrics, trends and exports for corporate matters.',
    roles: ['manager_legal_services', 'director_policy_legal', 'deputy_secretary', 'secretary', 'senior_legal_officer_corporate', 'system_administrator'],
    routes: ['/reports'],
    tourId: 'reports',
    purpose:
      'The Reports page turns the register into insight — volumes, status and priority mix, turnaround, SLA compliance, ageing, division and officer performance — with CSV, PDF and print exports.',
    whoShouldUse: 'Managers and executives monitoring performance, and anyone who must report on the caseload.',
    businessPurpose:
      'Evidence-based reporting supports resourcing decisions, demonstrates performance to stakeholders, and identifies bottlenecks before they become problems.',
    steps: [
      'Open “Reports” from the Reports & Analytics group.',
      'Choose a reporting period from the selector.',
      'Read the metric tiles — Total Matters, Closed, Active, Overdue, Average Turnaround and SLA Compliance.',
      'Review the Monthly Trend chart and the status, priority and ageing distributions.',
      'Check the Officer Performance and Division Breakdown tables.',
      'Export to CSV or PDF, or print, for meetings and records.',
    ],
    bestPractices: [
      'Set the period deliberately — “This Month” and “This Year” answer different questions.',
      'Export the same period each cycle so figures are comparable over time.',
    ],
    commonMistakes: [
      'Comparing two exports run over different periods.',
      'Reading percentages without noting the underlying counts.',
    ],
    faqs: [
      { question: 'What does SLA compliance measure?', answer: 'The share of closed matters that were completed on or before their due date within the selected period.' },
      { question: 'Can I export the charts?', answer: 'Yes — the PDF export includes the charts, and CSV exports the summary metrics.' },
    ],
    relatedIds: ['dashboard', 'matter-register', 'matter-closure'],
    nextSteps: [
      'Exports download to your device for sharing.',
      'Insights here often lead back into the register to act on specific matters.',
    ],
    keywords: ['reports', 'analytics', 'metrics', 'export', 'csv', 'pdf', 'sla', 'turnaround', 'performance'],
  },

  /* ============================ ADMINISTRATION =================== */
  {
    id: 'admin',
    title: 'Admin Panel',
    category: 'Administration',
    icon: 'Settings',
    summary: 'The control centre for users, permissions and reference data.',
    roles: ['manager_legal_services', 'director_policy_legal', 'secretary', 'system_administrator'],
    routes: ['/admin'],
    tourId: 'admin',
    purpose:
      'The Admin Panel is the launchpad for system configuration — user management, groups and permissions, divisions, matter and document types, reference data and audit.',
    whoShouldUse: 'System Administrators and senior managers with configuration authority.',
    businessPurpose:
      'Good administration keeps the system secure, its data consistent, and its access aligned to each person’s real responsibilities.',
    steps: [
      'Open “Admin Panel” from the Administration group.',
      'Choose the area to configure from the section cards.',
      'Make changes within that area, following its own guidance.',
      'Return to the panel to move between administrative tasks.',
    ],
    bestPractices: [
      'Change permissions through groups, not one-off tweaks, so access stays consistent.',
      'Keep reference data tidy — it powers dropdowns across the whole system.',
    ],
    commonMistakes: [
      'Granting broad access to individuals instead of using role-based groups.',
      'Editing reference data that is already in use without considering the impact.',
    ],
    faqs: [
      { question: 'Why can I not see the Admin Panel?', answer: 'It is restricted to administrative roles. Ask a System Administrator if you need access.' },
    ],
    relatedIds: ['user-management', 'groups-permissions', 'reference-data', 'audit-trail'],
    nextSteps: [
      'Each section card opens a focused administration screen.',
      'Configuration changes take effect across the system immediately.',
    ],
    keywords: ['admin', 'administration', 'settings', 'configuration', 'control panel', 'setup'],
  },
  {
    id: 'user-management',
    title: 'User Management',
    category: 'Administration',
    icon: 'UserCog',
    summary: 'Create, edit and deactivate user accounts and assign roles.',
    roles: ['manager_legal_services', 'director_policy_legal', 'secretary', 'system_administrator'],
    routes: ['/admin/users'],
    tourId: 'user-management',
    purpose:
      'User Management is where accounts are created, roles assigned, group membership managed, and access removed when staff move on.',
    whoShouldUse: 'System Administrators and authorised managers.',
    businessPurpose:
      'Accurate accounts and roles are the foundation of security and accountability — every action in the system is tied to a user.',
    steps: [
      'Open “User Management” from the Administration group.',
      'Click Add User and enter the person’s full name and official email.',
      'Set an initial password and confirm it (at least 8 characters).',
      'Assign a Group — this grants the module permissions for their role.',
      'Save — the account is created and can sign in.',
      'Edit or deactivate accounts here as responsibilities change or staff leave.',
    ],
    requiredFields: [
      { name: 'Full Name', required: true, description: 'The user’s name as it should appear in the system.' },
      { name: 'Email Address', required: true, description: 'The official DLPP email used to sign in.' },
      { name: 'Password', required: true, description: 'An initial password (min 8 characters); the user should change it after first sign-in.' },
      { name: 'Group Assignment', required: true, description: 'The permission group that grants module access — this is how access is controlled.' },
      { name: 'Department', required: false, description: 'Optional department / division label for the user.' },
    ],
    validationRules: [
      'Email must be unique and valid, and the two password fields must match.',
      'Password must be at least 8 characters.',
      'A group must be assigned, otherwise the user can sign in but sees no menus.',
      'Creating and deleting users are privileged, server-side actions and are audited.',
    ],
    bestPractices: [
      'Assign access through groups so it is consistent and easy to review.',
      'Deactivate leavers promptly to keep the system secure.',
      'Use official DLPP emails only.',
    ],
    commonMistakes: [
      'Creating a user without any group, so they sign in but see nothing.',
      'Deleting an account when deactivating would preserve history better.',
    ],
    faqs: [
      { question: 'A new user sees no menus — why?', answer: 'They likely have no group. Assign at least one group so module permissions apply.' },
      { question: 'How do I reset a password?', answer: 'Use the user’s record; a reset is issued securely rather than revealing the old password.' },
    ],
    relatedIds: ['groups-permissions', 'admin', 'audit-trail'],
    nextSteps: [
      'New users can sign in with their credentials.',
      'Group membership immediately controls what they can see and do.',
    ],
    keywords: ['users', 'accounts', 'roles', 'add user', 'deactivate', 'permissions', 'staff'],
  },
  {
    id: 'groups-permissions',
    title: 'Groups & Permissions',
    category: 'Administration',
    icon: 'Shield',
    summary: 'Define permission groups and the module access they grant.',
    roles: ['director_policy_legal', 'secretary', 'system_administrator'],
    routes: ['/admin/groups'],
    tourId: 'user-management',
    purpose:
      'Groups bundle module permissions together. Assigning a user to a group grants all of its permissions at once, so access is consistent and easy to manage.',
    whoShouldUse: 'System Administrators managing role-based access control (RBAC).',
    businessPurpose:
      'Group-based permissions make access auditable and scalable — you manage a handful of groups instead of hundreds of individual settings.',
    steps: [
      'Open “Groups & Permissions” from the Administration group.',
      'Create or select a group.',
      'Set which modules the group can read, create, edit or delete.',
      'Save, then assign users to the group under User Management.',
    ],
    requiredFields: [
      { name: 'Group Name', required: true, description: 'A clear name describing the group’s purpose.' },
      { name: 'Module Permissions', required: true, description: 'The read/create/edit/delete rights per module.' },
    ],
    validationRules: [
      'Group names should be unique and descriptive.',
      'Permission changes take effect for all members of the group.',
    ],
    bestPractices: [
      'Design a few well-named groups that mirror real job functions.',
      'Grant the least access needed for the role, then add more if required.',
    ],
    commonMistakes: [
      'Creating overlapping groups that make access hard to reason about.',
      'Giving delete rights where read or edit would be enough.',
    ],
    faqs: [
      { question: 'What is the difference between a role and a group?', answer: 'A role describes the person’s job; a group is a reusable bundle of permissions. Users get access through the groups they belong to.' },
    ],
    relatedIds: ['user-management', 'admin', 'audit-trail'],
    nextSteps: [
      'Assign users to the group to grant its permissions.',
      'Members immediately gain the module access the group defines.',
    ],
    keywords: ['groups', 'permissions', 'rbac', 'access control', 'modules', 'roles'],
  },
  {
    id: 'divisions',
    title: 'Divisions',
    category: 'Administration',
    icon: 'Building2',
    summary: 'Maintain the list of DLPP divisions used across the system.',
    roles: ['manager_legal_services', 'director_policy_legal', 'secretary', 'system_administrator'],
    routes: ['/admin/divisions'],
    tourId: 'reference-data',
    purpose:
      'This screen maintains the organisational divisions that appear when registering and reporting on matters.',
    whoShouldUse: 'Administrators who keep organisational reference data current.',
    businessPurpose:
      'Consistent divisions make requester data reliable and division reporting meaningful.',
    steps: [
      'Open “Divisions” from the Administration group.',
      'Add a new division, or edit an existing one.',
      'Save — the division becomes available in matter forms and reports.',
    ],
    requiredFields: [
      { name: 'Division Name', required: true, description: 'The official name of the division.' },
    ],
    bestPractices: [
      'Use official division names so reports match the organisation chart.',
      'Prefer editing over deleting divisions that are already in use.',
    ],
    commonMistakes: [
      'Creating duplicate divisions with slightly different spellings.',
    ],
    relatedIds: ['reference-data', 'matter-types', 'admin'],
    nextSteps: [
      'The division appears in dropdowns when registering matters.',
      'It becomes a grouping option in reports.',
    ],
    keywords: ['divisions', 'departments', 'organisation', 'reference data', 'units'],
  },
  {
    id: 'matter-types',
    title: 'Matter Types',
    category: 'Administration',
    icon: 'FileType',
    summary: 'Maintain the categories used to classify corporate matters.',
    roles: ['manager_legal_services', 'director_policy_legal', 'secretary', 'system_administrator'],
    routes: ['/admin/matter-types'],
    tourId: 'reference-data',
    purpose:
      'Matter types are the categories chosen when registering a matter (advice, contract, legislation, litigation, etc.). This screen keeps that list current.',
    whoShouldUse: 'Administrators who maintain classification reference data.',
    businessPurpose:
      'Good matter types drive the right workflow and produce clean, comparable reporting by category.',
    steps: [
      'Open “Matter Types” from the Administration group.',
      'Add or edit a matter type.',
      'Save — it becomes selectable when registering matters.',
    ],
    requiredFields: [
      { name: 'Matter Type Name', required: true, description: 'The label shown when classifying a matter.' },
    ],
    bestPractices: [
      'Keep the list focused — too many types make classification inconsistent.',
      'Use names officers will recognise immediately.',
    ],
    commonMistakes: [
      'Adding near-duplicate types that split reporting.',
    ],
    relatedIds: ['reference-data', 'document-types', 'register-new-matter'],
    nextSteps: [
      'The type appears in the registration form.',
      'It becomes a breakdown dimension in reports.',
    ],
    keywords: ['matter types', 'categories', 'classification', 'reference data'],
  },
  {
    id: 'document-types',
    title: 'Document Types',
    category: 'Administration',
    icon: 'Files',
    summary: 'Maintain the classifications used when uploading documents.',
    roles: ['manager_legal_services', 'director_policy_legal', 'secretary', 'system_administrator'],
    routes: ['/admin/document-types'],
    tourId: 'reference-data',
    purpose:
      'Document types are the classifications chosen when uploading a file (advice, contract, correspondence, etc.). This screen keeps that list current.',
    whoShouldUse: 'Administrators who maintain document reference data.',
    businessPurpose:
      'Consistent document types make files findable and support reporting on the kinds of documents the department produces.',
    steps: [
      'Open “Document Types” from the Administration group.',
      'Add or edit a document type.',
      'Save — it becomes selectable when uploading documents.',
    ],
    requiredFields: [
      { name: 'Document Type Name', required: true, description: 'The label shown when classifying a document.' },
    ],
    bestPractices: [
      'Keep the list short and meaningful so uploads are classified correctly.',
    ],
    commonMistakes: [
      'Creating overlapping types that make documents hard to filter.',
    ],
    relatedIds: ['reference-data', 'matter-types', 'documents'],
    nextSteps: [
      'The type appears in the document upload form.',
      'It becomes a filter in the Documents register.',
    ],
    keywords: ['document types', 'file types', 'classification', 'reference data'],
  },
  {
    id: 'reference-data',
    title: 'Reference Data',
    category: 'Administration',
    icon: 'Database',
    summary: 'The central place to manage the lists that power dropdowns everywhere.',
    roles: ['manager_legal_services', 'director_policy_legal', 'secretary', 'system_administrator'],
    routes: ['/admin/reference-data'],
    tourId: 'reference-data',
    purpose:
      'Reference Data brings together the lookup lists the system relies on — divisions, matter types, document types and more — so they can be managed consistently.',
    whoShouldUse: 'Administrators responsible for data quality.',
    businessPurpose:
      'Clean reference data is the quiet foundation of reliable forms, searches and reports across the whole system.',
    steps: [
      'Open “Reference Data” from the Administration group.',
      'Choose the list you want to manage.',
      'Add, edit or retire entries as needed.',
      'Save — changes flow through to every screen that uses the list.',
    ],
    bestPractices: [
      'Review reference data periodically to remove duplicates and retire unused entries.',
      'Change entries that are in use with care, since they affect existing records.',
    ],
    commonMistakes: [
      'Deleting a value still linked to matters instead of retiring it.',
      'Letting duplicate entries accumulate.',
    ],
    faqs: [
      { question: 'Will editing a value change existing matters?', answer: 'Renaming a value updates how it displays wherever it is used, so make changes deliberately.' },
    ],
    relatedIds: ['divisions', 'matter-types', 'document-types', 'admin'],
    nextSteps: [
      'Updated lists appear immediately in the relevant dropdowns.',
      'Cleaner data produces cleaner reports.',
    ],
    keywords: ['reference data', 'lookups', 'lists', 'master data', 'dropdowns', 'configuration'],
  },
  {
    id: 'audit-trail',
    title: 'Audit Trail',
    category: 'Administration',
    icon: 'ShieldCheck',
    summary: 'The tamper-evident record of who did what, and when.',
    roles: ['director_policy_legal', 'secretary', 'system_administrator'],
    routes: ['/admin/audit'],
    purpose:
      'The Audit Trail is the system-wide record of significant actions — sign-ins, record changes, permission changes and administrative actions — for security and accountability.',
    whoShouldUse: 'Administrators and executives responsible for governance and security.',
    businessPurpose:
      'A reliable audit trail supports investigations, demonstrates compliance, and deters misuse because every action is attributable.',
    steps: [
      'Open the Audit Trail from the Administration area.',
      'Filter by user, date or action type to narrow the record.',
      'Review the entries to answer “who changed this, and when?”.',
    ],
    bestPractices: [
      'Use filters to focus on a user or period rather than scrolling everything.',
      'Treat the audit trail as read-only evidence — it is not a place to edit data.',
    ],
    commonMistakes: [
      'Confusing the audit trail (technical, system-wide) with a matter’s activity timeline (human-readable, per matter).',
    ],
    faqs: [
      { question: 'Can audit entries be edited or deleted?', answer: 'No — the audit trail is designed to be tamper-evident so it can be trusted as a record.' },
    ],
    relatedIds: ['activity-timeline', 'user-management', 'admin'],
    nextSteps: [
      'Findings can inform access reviews under User Management.',
      'The record remains available for future governance needs.',
    ],
    keywords: ['audit', 'audit trail', 'security', 'accountability', 'log', 'governance', 'compliance'],
  },

  /* ============================ HELP & SUPPORT =================== */
  {
    id: 'help-centre',
    title: 'Help Centre',
    category: 'Help & Support',
    icon: 'LifeBuoy',
    summary: 'Search guidance, filter by your role, and launch guided tours.',
    roles: HELP_ROLES,
    routes: ['/help'],
    tourId: 'help-centre',
    purpose:
      'The Help Centre is your training and reference hub. Every module has a step-by-step article, and guided tours walk you through the real screens.',
    whoShouldUse: 'Everyone — new starters learning the system and experienced users checking a detail.',
    businessPurpose:
      'Self-service help reduces training overhead, speeds up onboarding, and helps everyone use the system correctly and consistently.',
    steps: [
      'Open the Help Centre from the sidebar, or click the floating Help button on any page.',
      'Search by keyword, or filter articles by your role.',
      'Open an article to read its purpose, steps, fields, tips and FAQs.',
      'Launch a guided tour to walk through the actual screen.',
      'Use the “?” icons beside fields for quick, in-place tips.',
    ],
    bestPractices: [
      'Filter by your role to see the guidance most relevant to you.',
      'Take the welcome tour first if you are new.',
      'Mark articles you use often as favourites for quick access.',
      'Press ? or F1 on any page to open help for the screen you are on.',
    ],
    commonMistakes: [
      'Searching for the exact screen title only — try a task word like “assign” or “upload”.',
    ],
    faqs: [
      { question: 'How does contextual help work?', answer: 'The Help button, the header “?”, and the ? / F1 shortcut all detect the page you are on and open the matching article automatically.' },
      { question: 'Can I print an article?', answer: 'Yes — open the article and use Print or Download to save a clean copy.' },
      { question: 'Can I get the whole manual?', answer: 'Yes — use “Print user manual” or “Download manual” on the Help Centre to export every article as a single document.' },
    ],
    relatedIds: ['login', 'dashboard', 'matter-register'],
    nextSteps: [
      'Guided tours highlight the real controls on each screen.',
      'Recently viewed and favourite articles make it easy to return to guidance.',
    ],
    keywords: ['help', 'training', 'guide', 'support', 'tour', 'how to', 'documentation', 'manual'],
  },
];

/* ------------------------------------------------------------------ */
/* Guided tours                                                        */
/* ------------------------------------------------------------------ */

export const WELCOME_TOUR_ID = 'welcome';

export const HELP_TOURS: HelpTour[] = [
  {
    id: WELCOME_TOUR_ID,
    title: 'Welcome Tour',
    steps: [
      {
        title: 'Welcome to the Corporate Matters System',
        body: 'This quick tour shows you around in under a minute. You can skip it at any time and reopen it later from the Help Centre.',
        placement: 'center',
      },
      {
        target: '[data-tour="sidebar"]',
        title: 'Main menu',
        body: 'Move between modules here — Dashboard, Matter Workflow, Register, Management, Reports and Administration. You only see what your role allows.',
        placement: 'right',
      },
      {
        target: '[data-tour="header-search"]',
        title: 'Global search',
        body: 'Find any matter or document from anywhere by typing a matter number, subject or keyword.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="notification-bell"]',
        title: 'Notifications',
        body: 'Assignments, reviews and reminders appear here. Check it regularly.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="help-button"]',
        title: 'Help is always one click away',
        body: 'Click this button on any page to open help for the screen you are on, start a guided tour, or open the full Help Centre.',
        placement: 'left',
      },
      {
        title: 'You are ready to go',
        body: 'Look for the small “?” icons beside fields for quick tips, and use “Start guided tour” inside Help on each page. Enjoy using the system!',
        placement: 'center',
      },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard Tour',
    articleId: 'dashboard',
    steps: [
      { title: 'Welcome to the Dashboard', body: 'A quick walk-through of the parts of your Dashboard. Use Next to continue.', placement: 'center' },
      { target: '[data-tour="dashboard-metrics"]', title: 'Key metrics', body: 'These tiles show Total Matters, My Assigned, Awaiting Action, Overdue, Due in 3 Days and Average Turnaround at a glance.' },
      { target: '[data-tour="dashboard-charts"]', title: 'Charts', body: 'See how matters spread by stage, priority and division. Click a segment to drill into those matters.' },
      { target: '[data-tour="dashboard-activity"]', title: 'Recent activity', body: 'The Recent Activity panel shows what changed recently, with overdue matters flagged. Check this first each day.' },
      { target: '[data-tour="help-button"]', title: 'Help is always here', body: 'Open help for any page, or start a tour, from this button.', placement: 'left' },
    ],
  },
  {
    id: 'matter-register',
    title: 'Matter Register Tour',
    articleId: 'matter-register',
    steps: [
      { title: 'The Matter Register', body: 'This is the master list of all corporate matters. Let’s look at the controls.', placement: 'center' },
      { target: '[data-tour="matters-filters"]', title: 'Quick filters & search', body: 'Filter by All, My, Active, In Review, Overdue or Closed, and search by number, subject or division.' },
      { target: '[data-tour="matters-table"]', title: 'The matters list', body: 'Every matter appears here. Click a row to open its workspace.' },
      { target: '[data-tour="matters-new"]', title: 'Register a new matter', body: 'Start a new matter from here when new instructions arrive.', placement: 'left' },
    ],
  },
  {
    id: 'register-new-matter',
    title: 'Register a Matter Tour',
    articleId: 'register-new-matter',
    steps: [
      { title: 'Registering a new matter', body: 'This form creates a new record in the register. We’ll point out the key parts.', placement: 'center' },
      { target: '[data-tour="new-matter-form"]', title: 'A 4-step wizard', body: 'Work through Basic Information, Requester Details, Request & Land Details, then Initial Documents. Required fields are marked with a red asterisk.' },
      { target: '[data-tour="new-matter-submit"]', title: 'Save the matter', body: 'Register generates the matter number and sends the matter to Pending Assignment.', placement: 'top' },
    ],
  },
  {
    id: 'matter-assignment',
    title: 'Assignment Tour',
    articleId: 'matter-assignment',
    steps: [
      { title: 'Assigning a matter', body: 'Assignment gives a matter a named owner with instructions and a due date.', placement: 'center' },
      { target: '[data-tour="assign-form"]', title: 'Choose the officer', body: 'Pick the action officer, write clear instructions, and set a realistic due date.' },
      { target: '[data-tour="assign-submit"]', title: 'Confirm the assignment', body: 'Submitting notifies the officer and moves the matter to Active.', placement: 'top' },
    ],
  },
  {
    id: 'matter-details',
    title: 'Matter Workspace Tour',
    articleId: 'matter-details',
    steps: [
      { title: 'The matter workspace', body: 'Everything about a matter lives here, organised into tabs.', placement: 'center' },
      { target: '[data-tour="matter-header"]', title: 'Matter header', body: 'The number, stage, priority and key dates are always visible here.' },
      { target: '[data-tour="matter-tabs"]', title: 'Tabs', body: 'Move between details, land/lease, legal issues, stakeholders, documents, tasks, reviews, timeline and audit.' },
      { target: '[data-tour="matter-actions"]', title: 'Actions', body: 'Edit, Assign, Submit for Review and Close appear here, subject to your role.', placement: 'left' },
    ],
  },
  {
    id: 'documents',
    title: 'Documents Tour',
    articleId: 'documents',
    steps: [
      { title: 'The Documents register', body: 'Upload, classify and find documents across every matter.', placement: 'center' },
      { target: '[data-tour="documents-upload"]', title: 'Upload', body: 'Attach a file to a matter with its type and stage.', placement: 'left' },
      { target: '[data-tour="documents-filters"]', title: 'Search & filters', body: 'Find documents fast with search and the All / Final / Drafts pills.' },
      { target: '[data-tour="documents-table"]', title: 'Document list', body: 'Open, download or edit metadata from the table.' },
    ],
  },
  {
    id: 'tasks',
    title: 'Tasks Tour',
    articleId: 'tasks',
    steps: [
      { title: 'The Tasks register', body: 'Break matters into trackable actions with owners and due dates.', placement: 'center' },
      { target: '[data-tour="tasks-new"]', title: 'New task', body: 'Create a task, link it to a matter, and set who, when and how urgent.', placement: 'left' },
      { target: '[data-tour="tasks-filters"]', title: 'Filters', body: 'Focus on My Tasks, Pending, In Progress or Overdue.' },
      { target: '[data-tour="tasks-table"]', title: 'Task list', body: 'Update status inline as work moves from Pending to Completed.' },
    ],
  },
  {
    id: 'draft-review',
    title: 'Draft Review Tour',
    articleId: 'draft-review',
    steps: [
      { title: 'The review cycle', body: 'Officers submit drafts; reviewers approve, return or escalate.', placement: 'center' },
      { target: '[data-tour="review-panel"]', title: 'Submit & decide', body: 'Attach the draft and submit, or as a reviewer choose Approve, Return or Escalate.' },
      { target: '[data-tour="review-history"]', title: 'Review history', body: 'Every decision and comment is recorded here for accountability.' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications Tour',
    articleId: 'notifications',
    steps: [
      { title: 'Staying informed', body: 'Notifications tell you what needs your attention.', placement: 'center' },
      { target: '[data-tour="notifications-list"]', title: 'Your notifications', body: 'Assignments, reviews and reminders appear here. Mark as read or clear once actioned.' },
      { target: '[data-tour="notification-bell"]', title: 'The bell', body: 'The header bell shows unread notifications from anywhere in the system.', placement: 'bottom' },
    ],
  },
  {
    id: 'matter-closure',
    title: 'Matter Closure Tour',
    articleId: 'matter-closure',
    steps: [
      { title: 'Closing a matter', body: 'Closure captures the outcome and locks the final record.', placement: 'center' },
      { target: '[data-tour="close-form"]', title: 'Outcome & checklist', body: 'Record the outcome, complete the checklist, and confirm deliverables are filed.' },
      { target: '[data-tour="close-submit"]', title: 'Confirm closure', body: 'Submitting moves the matter to Closed and stamps the closed date.', placement: 'top' },
    ],
  },
  {
    id: 'reports',
    title: 'Reports Tour',
    articleId: 'reports',
    steps: [
      { title: 'Reports & Analytics', body: 'Turn the register into insight and exports.', placement: 'center' },
      { target: '[data-tour="reports-period"]', title: 'Period & exports', body: 'Choose a reporting period and export to CSV or PDF, or print.' },
      { target: '[data-tour="reports-metrics"]', title: 'Key metrics', body: 'Volumes, turnaround and SLA compliance for the chosen period.' },
      { target: '[data-tour="reports-charts"]', title: 'Charts & tables', body: 'Distributions, plus officer and division breakdowns.' },
    ],
  },
  {
    id: 'admin',
    title: 'Admin Panel Tour',
    articleId: 'admin',
    steps: [
      { title: 'The Admin Panel', body: 'Your launchpad for configuring the system.', placement: 'center' },
      { target: '[data-tour="admin-sections"]', title: 'Section cards', body: 'Open user management, groups, divisions, matter and document types, and reference data.' },
    ],
  },
  {
    id: 'user-management',
    title: 'User Management Tour',
    articleId: 'user-management',
    steps: [
      { title: 'Managing users', body: 'Create accounts, assign roles and control access.', placement: 'center' },
      { target: '[data-tour="users-add"]', title: 'Add a user', body: 'Create an account with a name, email, role and group membership.', placement: 'left' },
      { target: '[data-tour="users-table"]', title: 'User list', body: 'Edit roles, manage groups, or deactivate accounts here.' },
    ],
  },
  {
    id: 'reference-data',
    title: 'Reference Data Tour',
    articleId: 'reference-data',
    steps: [
      { title: 'Reference data', body: 'The lists that power dropdowns across the system.', placement: 'center' },
      { target: '[data-tour="reference-tiles"]', title: 'Manage the lists', body: 'Maintain divisions, matter types and document types so forms and reports stay consistent.' },
    ],
  },
  {
    id: 'help-centre',
    title: 'Help Centre Tour',
    articleId: 'help-centre',
    steps: [
      { title: 'The Help Centre', body: 'Search guidance, filter by role and launch tours.', placement: 'center' },
      { target: '[data-tour="help-search"]', title: 'Search', body: 'Search by keyword or a task word like “assign” or “upload”.' },
      { target: '[data-tour="help-roles"]', title: 'Filter by role', body: 'Show the guidance most relevant to your role.' },
      { target: '[data-tour="help-categories"]', title: 'Browse by category', body: 'Every module has an article grouped by category.' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Route -> Article mapping                                            */
/* ------------------------------------------------------------------ */

/**
 * Ordered rules. The FIRST matching rule wins, so more specific routes are
 * listed before more general ones.
 */
const ROUTE_RULES: { pattern: RegExp; articleId: string }[] = [
  { pattern: /^\/auth\/login/, articleId: 'login' },
  { pattern: /^\/dashboard/, articleId: 'dashboard' },
  // Matter sub-routes (must come before /matters/[id] and /matters)
  { pattern: /^\/matters\/new/, articleId: 'register-new-matter' },
  { pattern: /^\/matters\/register/, articleId: 'register-new-matter' },
  { pattern: /^\/matters\/[^/]+\/assign/, articleId: 'matter-assignment' },
  { pattern: /^\/matters\/[^/]+\/review/, articleId: 'draft-review' },
  { pattern: /^\/matters\/[^/]+\/close/, articleId: 'matter-closure' },
  { pattern: /^\/matters\/[^/]+\/details/, articleId: 'matter-details' },
  { pattern: /^\/matters\/[^/]+/, articleId: 'matter-details' }, // /matters/[id]
  // Matter register list views (query strings are stripped before matching,
  // so the list itself resolves to the register article)
  { pattern: /^\/matters/, articleId: 'matter-register' },
  // Management
  { pattern: /^\/documents/, articleId: 'documents' },
  { pattern: /^\/tasks/, articleId: 'tasks' },
  { pattern: /^\/notifications/, articleId: 'notifications' },
  { pattern: /^\/reports/, articleId: 'reports' },
  // Administration (specific before general)
  { pattern: /^\/admin\/users/, articleId: 'user-management' },
  { pattern: /^\/admin\/groups/, articleId: 'groups-permissions' },
  { pattern: /^\/admin\/divisions/, articleId: 'divisions' },
  { pattern: /^\/admin\/matter-types/, articleId: 'matter-types' },
  { pattern: /^\/admin\/document-types/, articleId: 'document-types' },
  { pattern: /^\/admin\/reference-data/, articleId: 'reference-data' },
  { pattern: /^\/admin\/audit/, articleId: 'audit-trail' },
  { pattern: /^\/admin/, articleId: 'admin' },
  // Help
  { pattern: /^\/help/, articleId: 'help-centre' },
];

/* ------------------------------------------------------------------ */
/* Helper functions                                                    */
/* ------------------------------------------------------------------ */

export function getArticleById(id: string | null | undefined): HelpArticle | undefined {
  if (!id) return undefined;
  return HELP_ARTICLES.find((a) => a.id === id);
}

/**
 * Returns the article id that best matches a pathname, or null when unknown
 * (callers should then fall back to the Help Centre home).
 */
export function getArticleIdForRoute(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  const clean = pathname.split('?')[0].split('#')[0];
  for (const rule of ROUTE_RULES) {
    if (rule.pattern.test(clean)) return rule.articleId;
  }
  return null;
}

export function getArticleForRoute(pathname: string | null | undefined): HelpArticle | null {
  const id = getArticleIdForRoute(pathname);
  return id ? getArticleById(id) ?? null : null;
}

export function getTourById(id: string | null | undefined): HelpTour | undefined {
  if (!id) return undefined;
  return HELP_TOURS.find((t) => t.id === id);
}

export function getTourForArticle(articleId: string): HelpTour | undefined {
  const article = getArticleById(articleId);
  if (!article?.tourId) return undefined;
  return getTourById(article.tourId);
}

export function getRelatedArticles(article: HelpArticle): HelpArticle[] {
  return article.relatedIds
    .map((id) => getArticleById(id))
    .filter((a): a is HelpArticle => Boolean(a));
}

export function getArticlesByCategory(category: HelpCategory): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === category);
}

export function getArticlesForRole(role: HelpRole | 'all'): HelpArticle[] {
  if (role === 'all') return HELP_ARTICLES;
  return HELP_ARTICLES.filter((a) => a.roles.includes(role));
}

/**
 * Weighted keyword search across title, summary, keywords, category and body.
 * Optionally filtered by role.
 */
export function searchArticles(query: string, role?: HelpRole | 'all'): HelpArticle[] {
  const q = query.trim().toLowerCase();
  let articles = HELP_ARTICLES;
  if (role && role !== 'all') {
    articles = articles.filter((a) => a.roles.includes(role));
  }
  if (!q) return articles;
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = articles
    .map((a) => {
      const haystack = [
        a.title,
        a.summary,
        a.category,
        a.purpose,
        a.businessPurpose,
        a.whoShouldUse,
        ...a.keywords,
        ...a.steps,
      ]
        .join(' ')
        .toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (a.title.toLowerCase().includes(term)) score += 5;
        if (a.keywords.some((k) => k.toLowerCase().includes(term))) score += 3;
        if (a.summary.toLowerCase().includes(term)) score += 2;
        if (haystack.includes(term)) score += 1;
      }
      return { a, score };
    })
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score);
  return scored.map((s) => s.a);
}
