// Types of Corporate Matters
export const MATTER_TYPES = [
  'Legal Clearance',
  'Legal Advice',
  'Drafting & Contract Review',
  'Vetting of Instrument',
  'Interpretation of Legislation',
  'Legal Clearance/Clarification of Court Order/Judgement',
  'Other',
] as const;

// Forms of Request
export const REQUEST_FORMS = [
  'Verbal',
  'WhatsApp',
  'Note',
  'Email',
  'Inter-Office Memo',
  'Letter',
] as const;

// Types of Request
export const REQUEST_TYPES = [
  'Legal Opinion',
  'Legal Brief',
  'Status Brief',
  'Investigative Brief',
  'Draft/Vet Instrument',
  'Contract/Agreement Review',
  'Forfeiture Clearance',
  'Other',
] as const;

// Task Types
export const TASK_TYPES = [
  'Prepare Legal Opinion',
  'Draft Legal Brief',
  'Draft Status Brief',
  'Draft Investigative Brief',
  'Draft/Vet Instrument',
  'Contract Review',
  'Forfeiture Clearance',
  'Research',
  'Workshop/Meeting',
  'Other',
] as const;

// Document Types
export const DOCUMENT_TYPES = [
  'Inter-Office Memo',
  'Background Documents',
  'Draft Opinion',
  'Final Opinion',
  'Legal Brief',
  'Status Brief',
  'Investigative Brief',
  'Contract Draft',
  'Final Contract',
  'Forfeiture Approval Form',
  'Supporting Documents',
  'Other',
] as const;

// Matter Status
export const MATTER_STATUS = [
  'Pending',
  'In Progress',
  'Completed',
  'Closed',
] as const;

// Task Status
export const TASK_STATUS = [
  'Pending',
  'In Progress',
  'Completed',
] as const;

// Lease Types
export const LEASE_TYPES = [
  'Ground Lease',
  'Building Lease',
  'Sublease',
  'License',
  'Other',
] as const;

// User Roles
export const USER_ROLES = {
  LEGAL_OFFICER: 'legal_officer',
  SENIOR_LEGAL_OFFICER: 'senior_legal_officer',
  DEPUTY_SECRETARY: 'deputy_secretary',
  SECRETARY: 'secretary',
} as const;
