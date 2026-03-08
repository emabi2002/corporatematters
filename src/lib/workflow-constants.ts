// ============================================================================
// DLPP Corporate Matters - Workflow Constants & Enums
// ============================================================================

// ----------------------------------------------------------------------------
// WORKFLOW STAGES
// ----------------------------------------------------------------------------

export const WORKFLOW_STAGES = {
  REGISTERED: 'Registered',
  ASSIGNED: 'Assigned',
  DETAILS_COMPLETED: 'Details Completed',
  DRAFTING: 'Drafting',
  PENDING_REVIEW: 'Pending Review',
  RETURNED_FOR_REVISION: 'Returned for Revision',
  APPROVED_FOR_FINALIZATION: 'Approved for Finalization',
  FINALIZED: 'Finalized',
  PENDING_CLOSURE: 'Pending Closure',
  CLOSED: 'Closed',
} as const;

export type WorkflowStage = typeof WORKFLOW_STAGES[keyof typeof WORKFLOW_STAGES];

export const WORKFLOW_STAGE_LIST: WorkflowStage[] = Object.values(WORKFLOW_STAGES);

// Workflow stage colors for UI
export const WORKFLOW_STAGE_COLORS: Record<WorkflowStage, string> = {
  [WORKFLOW_STAGES.REGISTERED]: 'bg-slate-100 text-slate-800 border-slate-300',
  [WORKFLOW_STAGES.ASSIGNED]: 'bg-blue-100 text-blue-800 border-blue-300',
  [WORKFLOW_STAGES.DETAILS_COMPLETED]: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  [WORKFLOW_STAGES.DRAFTING]: 'bg-purple-100 text-purple-800 border-purple-300',
  [WORKFLOW_STAGES.PENDING_REVIEW]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [WORKFLOW_STAGES.RETURNED_FOR_REVISION]: 'bg-orange-100 text-orange-800 border-orange-300',
  [WORKFLOW_STAGES.APPROVED_FOR_FINALIZATION]: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  [WORKFLOW_STAGES.FINALIZED]: 'bg-green-100 text-green-800 border-green-300',
  [WORKFLOW_STAGES.PENDING_CLOSURE]: 'bg-teal-100 text-teal-800 border-teal-300',
  [WORKFLOW_STAGES.CLOSED]: 'bg-gray-100 text-gray-800 border-gray-300',
};

// ----------------------------------------------------------------------------
// MATTER STATUS
// ----------------------------------------------------------------------------

export const MATTER_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  OVERDUE: 'Overdue',
  COMPLETED: 'Completed',
  CLOSED: 'Closed',
} as const;

export type MatterStatus = typeof MATTER_STATUS[keyof typeof MATTER_STATUS];

export const MATTER_STATUS_LIST: MatterStatus[] = Object.values(MATTER_STATUS);

export const MATTER_STATUS_COLORS: Record<MatterStatus, string> = {
  [MATTER_STATUS.OPEN]: 'bg-blue-100 text-blue-800 border-blue-300',
  [MATTER_STATUS.IN_PROGRESS]: 'bg-purple-100 text-purple-800 border-purple-300',
  [MATTER_STATUS.ON_HOLD]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [MATTER_STATUS.OVERDUE]: 'bg-red-100 text-red-800 border-red-300',
  [MATTER_STATUS.COMPLETED]: 'bg-green-100 text-green-800 border-green-300',
  [MATTER_STATUS.CLOSED]: 'bg-gray-100 text-gray-800 border-gray-300',
};

// ----------------------------------------------------------------------------
// USER ROLES
// ----------------------------------------------------------------------------

export const USER_ROLES = {
  LEGAL_SECRETARY: 'legal_secretary',
  LEGAL_OFFICER_CORPORATE: 'legal_officer_corporate',
  SENIOR_LEGAL_OFFICER_CORPORATE: 'senior_legal_officer_corporate',
  LEGAL_OFFICER_LEGISLATION: 'legal_officer_legislation',
  MANAGER_LEGAL_SERVICES: 'manager_legal_services',
  DIRECTOR_POLICY_LEGAL: 'director_policy_legal',
  DEPUTY_SECRETARY: 'deputy_secretary',
  SECRETARY: 'secretary',
  SYSTEM_ADMINISTRATOR: 'system_administrator',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_ROLE_LIST: UserRole[] = Object.values(USER_ROLES);

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.LEGAL_SECRETARY]: 'Legal Secretary',
  [USER_ROLES.LEGAL_OFFICER_CORPORATE]: 'Legal Officer - Corporate',
  [USER_ROLES.SENIOR_LEGAL_OFFICER_CORPORATE]: 'Senior Legal Officer - Corporate',
  [USER_ROLES.LEGAL_OFFICER_LEGISLATION]: 'Legal Officer - Legislation',
  [USER_ROLES.MANAGER_LEGAL_SERVICES]: 'Manager - Legal Services',
  [USER_ROLES.DIRECTOR_POLICY_LEGAL]: 'Director - Policy & Legal Services',
  [USER_ROLES.DEPUTY_SECRETARY]: 'Deputy Secretary',
  [USER_ROLES.SECRETARY]: 'Secretary',
  [USER_ROLES.SYSTEM_ADMINISTRATOR]: 'System Administrator',
};

// ----------------------------------------------------------------------------
// PRIORITIES
// ----------------------------------------------------------------------------

export const PRIORITIES = {
  URGENT: 'Urgent',
  HIGH: 'High',
  NORMAL: 'Normal',
  LOW: 'Low',
} as const;

export type Priority = typeof PRIORITIES[keyof typeof PRIORITIES];

export const PRIORITY_LIST: Priority[] = Object.values(PRIORITIES);

export const PRIORITY_COLORS: Record<Priority, string> = {
  [PRIORITIES.URGENT]: 'bg-red-100 text-red-800 border-red-300',
  [PRIORITIES.HIGH]: 'bg-orange-100 text-orange-800 border-orange-300',
  [PRIORITIES.NORMAL]: 'bg-blue-100 text-blue-800 border-blue-300',
  [PRIORITIES.LOW]: 'bg-gray-100 text-gray-800 border-gray-300',
};

export const PRIORITY_LEVELS: Record<Priority, number> = {
  [PRIORITIES.URGENT]: 1,
  [PRIORITIES.HIGH]: 2,
  [PRIORITIES.NORMAL]: 3,
  [PRIORITIES.LOW]: 4,
};

// ----------------------------------------------------------------------------
// CONFIDENTIALITY LEVELS
// ----------------------------------------------------------------------------

export const CONFIDENTIALITY_LEVELS = {
  PUBLIC: 'Public',
  INTERNAL: 'Internal',
  CONFIDENTIAL: 'Confidential',
  HIGHLY_CONFIDENTIAL: 'Highly Confidential',
} as const;

export type ConfidentialityLevel = typeof CONFIDENTIALITY_LEVELS[keyof typeof CONFIDENTIALITY_LEVELS];

export const CONFIDENTIALITY_LEVEL_LIST: ConfidentialityLevel[] = Object.values(CONFIDENTIALITY_LEVELS);

// ----------------------------------------------------------------------------
// REVIEW STATUS
// ----------------------------------------------------------------------------

export const REVIEW_STATUS = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  RETURNED: 'Returned',
  ESCALATED: 'Escalated',
} as const;

export type ReviewStatus = typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS];

export const REVIEW_STATUS_LIST: ReviewStatus[] = Object.values(REVIEW_STATUS);

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, string> = {
  [REVIEW_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [REVIEW_STATUS.UNDER_REVIEW]: 'bg-blue-100 text-blue-800 border-blue-300',
  [REVIEW_STATUS.APPROVED]: 'bg-green-100 text-green-800 border-green-300',
  [REVIEW_STATUS.RETURNED]: 'bg-orange-100 text-orange-800 border-orange-300',
  [REVIEW_STATUS.ESCALATED]: 'bg-red-100 text-red-800 border-red-300',
};

// ----------------------------------------------------------------------------
// TASK STATUS
// ----------------------------------------------------------------------------

export const TASK_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  AWAITING_REVIEW: 'Awaiting Review',
  RETURNED: 'Returned',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

export const TASK_STATUS_LIST: TaskStatus[] = Object.values(TASK_STATUS);

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TASK_STATUS.PENDING]: 'bg-slate-100 text-slate-800 border-slate-300',
  [TASK_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800 border-blue-300',
  [TASK_STATUS.AWAITING_REVIEW]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [TASK_STATUS.RETURNED]: 'bg-orange-100 text-orange-800 border-orange-300',
  [TASK_STATUS.COMPLETED]: 'bg-green-100 text-green-800 border-green-300',
  [TASK_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800 border-gray-300',
};

// ----------------------------------------------------------------------------
// DOCUMENT CATEGORIES
// ----------------------------------------------------------------------------

export const DOCUMENT_CATEGORIES = {
  INITIAL: 'initial',
  DRAFT: 'draft',
  FINAL: 'final',
  SUPPORTING: 'supporting',
} as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[keyof typeof DOCUMENT_CATEGORIES];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DOCUMENT_CATEGORIES.INITIAL]: 'Initial/Request',
  [DOCUMENT_CATEGORIES.DRAFT]: 'Draft',
  [DOCUMENT_CATEGORIES.FINAL]: 'Final/Deliverable',
  [DOCUMENT_CATEGORIES.SUPPORTING]: 'Supporting',
};

// ----------------------------------------------------------------------------
// NOTIFICATION TYPES
// ----------------------------------------------------------------------------

export const NOTIFICATION_TYPES = {
  MATTER_REGISTERED: 'matter_registered',
  MATTER_ASSIGNED: 'matter_assigned',
  DRAFT_SUBMITTED: 'draft_submitted',
  DRAFT_RETURNED: 'draft_returned',
  DRAFT_APPROVED: 'draft_approved',
  MATTER_DUE_SOON: 'matter_due_soon',
  MATTER_OVERDUE: 'matter_overdue',
  MATTER_READY_FOR_CLOSURE: 'matter_ready_for_closure',
  MATTER_CLOSED: 'matter_closed',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  [NOTIFICATION_TYPES.MATTER_REGISTERED]: 'New Matter Registered',
  [NOTIFICATION_TYPES.MATTER_ASSIGNED]: 'Matter Assigned to You',
  [NOTIFICATION_TYPES.DRAFT_SUBMITTED]: 'Draft Submitted for Review',
  [NOTIFICATION_TYPES.DRAFT_RETURNED]: 'Draft Returned for Correction',
  [NOTIFICATION_TYPES.DRAFT_APPROVED]: 'Draft Approved',
  [NOTIFICATION_TYPES.MATTER_DUE_SOON]: 'Matter Due in 3 Days',
  [NOTIFICATION_TYPES.MATTER_OVERDUE]: 'Matter Overdue',
  [NOTIFICATION_TYPES.MATTER_READY_FOR_CLOSURE]: 'Matter Ready for Closure',
  [NOTIFICATION_TYPES.MATTER_CLOSED]: 'Matter Closed',
};

// ----------------------------------------------------------------------------
// ACTION TYPES (for Activity Log)
// ----------------------------------------------------------------------------

export const ACTION_TYPES = {
  CREATED: 'created',
  ASSIGNED: 'assigned',
  REASSIGNED: 'reassigned',
  STATUS_CHANGED: 'status_changed',
  WORKFLOW_STAGE_CHANGED: 'workflow_stage_changed',
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_DELETED: 'document_deleted',
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  REVIEW_SUBMITTED: 'review_submitted',
  REVIEW_APPROVED: 'review_approved',
  REVIEW_RETURNED: 'review_returned',
  MATTER_FINALIZED: 'matter_finalized',
  MATTER_CLOSED: 'matter_closed',
  COMMENT_ADDED: 'comment_added',
} as const;

export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];

export const ACTION_LABELS: Record<ActionType, string> = {
  [ACTION_TYPES.CREATED]: 'Created Matter',
  [ACTION_TYPES.ASSIGNED]: 'Assigned',
  [ACTION_TYPES.REASSIGNED]: 'Reassigned',
  [ACTION_TYPES.STATUS_CHANGED]: 'Status Changed',
  [ACTION_TYPES.WORKFLOW_STAGE_CHANGED]: 'Workflow Stage Changed',
  [ACTION_TYPES.DOCUMENT_UPLOADED]: 'Document Uploaded',
  [ACTION_TYPES.DOCUMENT_DELETED]: 'Document Deleted',
  [ACTION_TYPES.TASK_CREATED]: 'Task Created',
  [ACTION_TYPES.TASK_UPDATED]: 'Task Updated',
  [ACTION_TYPES.TASK_COMPLETED]: 'Task Completed',
  [ACTION_TYPES.REVIEW_SUBMITTED]: 'Submitted for Review',
  [ACTION_TYPES.REVIEW_APPROVED]: 'Review Approved',
  [ACTION_TYPES.REVIEW_RETURNED]: 'Review Returned',
  [ACTION_TYPES.MATTER_FINALIZED]: 'Matter Finalized',
  [ACTION_TYPES.MATTER_CLOSED]: 'Matter Closed',
  [ACTION_TYPES.COMMENT_ADDED]: 'Comment Added',
};

// ----------------------------------------------------------------------------
// SLA & DEADLINE CONSTANTS
// ----------------------------------------------------------------------------

export const SLA_CONSTANTS = {
  DEFAULT_SLA_DAYS: 14,
  DUE_SOON_THRESHOLD_DAYS: 3,
  OVERDUE_COLOR: '#ef4444',
  DUE_SOON_COLOR: '#f59e0b',
  ON_TRACK_COLOR: '#10b981',
} as const;

// ----------------------------------------------------------------------------
// PERMISSIONS
// ----------------------------------------------------------------------------

// Roles that can register new matters
export const CAN_REGISTER_MATTER_ROLES: UserRole[] = [
  USER_ROLES.LEGAL_SECRETARY,
  USER_ROLES.MANAGER_LEGAL_SERVICES,
  USER_ROLES.SYSTEM_ADMINISTRATOR,
];

// Roles that can assign matters
export const CAN_ASSIGN_MATTER_ROLES: UserRole[] = [
  USER_ROLES.MANAGER_LEGAL_SERVICES,
  USER_ROLES.DIRECTOR_POLICY_LEGAL,
  USER_ROLES.SYSTEM_ADMINISTRATOR,
];

// Roles that can review drafts
export const CAN_REVIEW_ROLES: UserRole[] = [
  USER_ROLES.SENIOR_LEGAL_OFFICER_CORPORATE,
  USER_ROLES.MANAGER_LEGAL_SERVICES,
  USER_ROLES.DIRECTOR_POLICY_LEGAL,
  USER_ROLES.SYSTEM_ADMINISTRATOR,
];

// Roles that can close matters
export const CAN_CLOSE_MATTER_ROLES: UserRole[] = [
  USER_ROLES.LEGAL_SECRETARY,
  USER_ROLES.MANAGER_LEGAL_SERVICES,
  USER_ROLES.SYSTEM_ADMINISTRATOR,
];

// Roles that can view all matters
export const CAN_VIEW_ALL_MATTERS_ROLES: UserRole[] = [
  USER_ROLES.SENIOR_LEGAL_OFFICER_CORPORATE,
  USER_ROLES.MANAGER_LEGAL_SERVICES,
  USER_ROLES.DIRECTOR_POLICY_LEGAL,
  USER_ROLES.DEPUTY_SECRETARY,
  USER_ROLES.SECRETARY,
  USER_ROLES.SYSTEM_ADMINISTRATOR,
];

// Roles that can manage reference data
export const CAN_MANAGE_REFERENCE_DATA_ROLES: UserRole[] = [
  USER_ROLES.MANAGER_LEGAL_SERVICES,
  USER_ROLES.SYSTEM_ADMINISTRATOR,
];

// Roles that can manage users
export const CAN_MANAGE_USERS_ROLES: UserRole[] = [
  USER_ROLES.SYSTEM_ADMINISTRATOR,
];

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Check if user has permission to perform action
 */
export function hasPermission(userRole: UserRole | null | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Get color class for priority
 */
export function getPriorityColor(priority: string): string {
  return PRIORITY_COLORS[priority as Priority] || PRIORITY_COLORS[PRIORITIES.NORMAL];
}

/**
 * Get color class for status
 */
export function getStatusColor(status: string): string {
  return MATTER_STATUS_COLORS[status as MatterStatus] || MATTER_STATUS_COLORS[MATTER_STATUS.OPEN];
}

/**
 * Get color class for workflow stage
 */
export function getWorkflowStageColor(stage: string): string {
  return WORKFLOW_STAGE_COLORS[stage as WorkflowStage] || WORKFLOW_STAGE_COLORS[WORKFLOW_STAGES.REGISTERED];
}

/**
 * Check if matter is overdue
 */
export function isMatterOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate) return false;
  if (status === MATTER_STATUS.COMPLETED || status === MATTER_STATUS.CLOSED) return false;
  return new Date(dueDate) < new Date();
}

/**
 * Check if matter is due soon (within threshold)
 */
export function isMatterDueSoon(dueDate: string | null, status: string): boolean {
  if (!dueDate) return false;
  if (status === MATTER_STATUS.COMPLETED || status === MATTER_STATUS.CLOSED) return false;

  const due = new Date(dueDate);
  const today = new Date();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + SLA_CONSTANTS.DUE_SOON_THRESHOLD_DAYS);

  return due > today && due <= threshold;
}

/**
 * Calculate days remaining until due date
 */
export function getDaysRemaining(dueDate: string | null): number | null {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
