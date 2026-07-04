// ============================================================================
// DLPP Corporate Matters - Help & Training Centre : Context Tooltips
// ----------------------------------------------------------------------------
// A registry of reusable tooltip copy. Reference by id with <HelpTooltip id=… />
// so the same wording is reused everywhere and can be maintained in one place.
// ============================================================================

import type { HelpTooltipDef } from './help-types';

export const HELP_TOOLTIPS: Record<string, HelpTooltipDef> = {
  // ---- Matter core ----------------------------------------------------------
  'matter-number': {
    id: 'matter-number',
    label: 'Matter Number',
    content: 'Automatically generated unique reference number for this matter. It cannot be edited.',
  },
  priority: {
    id: 'priority',
    label: 'Priority',
    content: 'Select the urgency level. Urgent matters appear first on dashboards and in queues.',
  },
  'workflow-stage': {
    id: 'workflow-stage',
    label: 'Workflow Stage',
    content: 'Shows the current processing stage of this corporate matter (e.g. Registered, Assigned, Pending Review, Closed).',
  },
  'matter-type': {
    id: 'matter-type',
    label: 'Type of Matter',
    content: 'The category of legal work (e.g. advice, contract, litigation). Drives reporting and reference data.',
  },
  requester: {
    id: 'requester',
    label: 'Requester',
    content: 'The person or office that requested legal services for this matter.',
  },
  division: {
    id: 'division',
    label: 'Requesting Division',
    content: 'The DLPP division the request originates from.',
  },
  'date-received': {
    id: 'date-received',
    label: 'Date Received',
    content: 'When Legal Services received the request. Starts the service-level (SLA) clock.',
  },
  'due-date': {
    id: 'due-date',
    label: 'Due Date',
    content: 'The deadline for this matter. Used to flag due-soon (within 3 days) and overdue matters.',
  },
  'risk-classification': {
    id: 'risk-classification',
    label: 'Risk Classification',
    content: 'Assess the level of legal or reputational risk. Feeds management reporting.',
  },
  confidentiality: {
    id: 'confidentiality',
    label: 'Confidentiality',
    content: 'Sets who may see this matter’s sensitive information (Public, Internal, Confidential, Highly Confidential).',
  },

  // ---- Actions --------------------------------------------------------------
  'assign-officer': {
    id: 'assign-officer',
    label: 'Assign Officer',
    content: 'Assign responsibility for this matter to a Legal Officer or other authorised user.',
  },
  'submit-review': {
    id: 'submit-review',
    label: 'Submit for Review',
    content: 'Sends this draft to the reviewer for approval or comments.',
  },
  'close-matter': {
    id: 'close-matter',
    label: 'Close Matter',
    content: 'Use this only after all required actions and approvals have been completed.',
  },
  reassign: {
    id: 'reassign',
    label: 'Reassign',
    content: 'Hand this matter to a different officer. The change is recorded in assignment history.',
  },
  'return-draft': {
    id: 'return-draft',
    label: 'Return for Revision',
    content: 'Send the draft back to the officer with comments describing the required changes.',
  },
  'approve-draft': {
    id: 'approve-draft',
    label: 'Approve',
    content: 'Approve the draft. The matter advances to “Approved for Finalization”.',
  },
  'save-draft': {
    id: 'save-draft',
    label: 'Save Draft',
    content: 'Save your work in progress without advancing the workflow stage.',
  },
  'complete-details': {
    id: 'complete-details',
    label: 'Complete Details',
    content: 'Save details and advance the matter to “Details Completed”.',
  },
  'export-csv': {
    id: 'export-csv',
    label: 'Export to CSV',
    content: 'Download the current, filtered list as a CSV file for Excel or reporting.',
  },

  // ---- Documents / tasks ----------------------------------------------------
  'document-type': {
    id: 'document-type',
    label: 'Document Type',
    content: 'Categorise the file (e.g. request, advice, title). Keeps the matter file organised.',
  },
  'document-category': {
    id: 'document-category',
    label: 'Category / Stage',
    content: 'Mark the file as Initial, Draft, Final or Supporting so the deliverable is unmistakable.',
  },
  'upload-document': {
    id: 'upload-document',
    label: 'Upload Document',
    content: 'Attach a file to this matter. Choose the matter, file and document type.',
  },
  'task-status': {
    id: 'task-status',
    label: 'Task Status',
    content: 'Track progress — Pending, In Progress, Awaiting Review, Returned, Completed or Cancelled.',
  },
  'task-priority': {
    id: 'task-priority',
    label: 'Task Priority',
    content: 'Set the urgency of this task to drive ordering and alerts.',
  },

  // ---- Notifications / admin ------------------------------------------------
  'notification-bell': {
    id: 'notification-bell',
    label: 'Notifications',
    content: 'A red count means new alerts — assignments, reviews, deadlines and closures. Click to view.',
  },
  role: {
    id: 'role',
    label: 'Role',
    content: 'The user’s role sets a baseline of permissions. Group membership grants module-level access.',
  },
  'user-status': {
    id: 'user-status',
    label: 'User Status',
    content: 'Active users can sign in. Deactivate accounts for staff who leave to preserve their history.',
  },
  'reference-active': {
    id: 'reference-active',
    label: 'Active',
    content: 'Inactive values stay linked to old records but are hidden from new selections.',
  },
};

export function getTooltip(id: string): HelpTooltipDef | undefined {
  return HELP_TOOLTIPS[id];
}
