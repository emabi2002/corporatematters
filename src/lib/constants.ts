// ============================================================================
// DLPP Corporate Matters - Constants (Legacy + New Workflow)
// ============================================================================
// This file maintains backward compatibility while integrating new workflow constants

// Import new workflow constants
export * from './workflow-constants';

// ============================================================================
// LEGACY CONSTANTS (maintained for backward compatibility)
// ============================================================================

// Types of Corporate Matters (Legacy - use corporate_reference_matter_types table instead)
export const MATTER_TYPES = [
  'Land Acquisition',
  'Lease Agreement',
  'Contract Review',
  'Legal Opinion',
  'Instrument Preparation',
  'ILG Matter',
  'Title Investigation',
  'Dispute Resolution',
  'Policy Advice',
  'Legal Clearance',
  'Legal Advice',
  'Drafting & Contract Review',
  'Vetting of Instrument',
  'Interpretation of Legislation',
  'Legal Clearance/Clarification of Court Order/Judgement',
  'Other',
] as const;

// Forms of Request (Legacy - use corporate_reference_request_forms table instead)
export const REQUEST_FORMS = [
  'Verbal',
  'WhatsApp',
  'Email',
  'Inter-Office Memo',
  'Letter',
  'Note',
] as const;

// Types of Request (Legacy - use corporate_reference_request_types table instead)
export const REQUEST_TYPES = [
  'Legal Opinion',
  'Legal Brief',
  'Status Brief',
  'Investigative Brief',
  'Draft/Vet Instrument',
  'Contract/Agreement Review',
  'Document Vetting',
  'Forfeiture Clearance',
  'Legal Advice',
  'Investigation',
  'Instrument Preparation',
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

// Document Types (Legacy - use corporate_reference_document_types table instead)
export const DOCUMENT_TYPES = [
  'Inter-Office Memo',
  'Letter',
  'Email',
  'WhatsApp Evidence',
  'Background Paper',
  'Background Documents',
  'Draft Legal Opinion',
  'Final Legal Opinion',
  'Legal Brief',
  'Status Brief',
  'Investigative Brief',
  'Draft Instrument',
  'Final Instrument',
  'Draft Agreement/Contract',
  'Signed Agreement/Contract',
  'Appeal Submission',
  'Court Order/Judgement',
  'Closure Document',
  'Contract Draft',
  'Final Contract',
  'Forfeiture Approval Form',
  'Supporting Documents',
  'Other',
] as const;

// Matter Status (Legacy - use MATTER_STATUS from workflow-constants)
export const MATTER_STATUS = [
  'Pending',
  'In Progress',
  'Completed',
  'Closed',
  'Open',
  'In Progress',
  'On Hold',
  'Overdue',
] as const;

// Task Status (Legacy - use TASK_STATUS from workflow-constants)
export const TASK_STATUS = [
  'Pending',
  'In Progress',
  'Completed',
  'Awaiting Review',
  'Returned',
  'Cancelled',
] as const;

// Lease Types
export const LEASE_TYPES = [
  'Ground Lease',
  'Building Lease',
  'Sublease',
  'License',
  'Agricultural Lease',
  'Commercial Lease',
  'Residential Lease',
  'Other',
] as const;

// User Roles (Legacy - use USER_ROLES from workflow-constants)
export const USER_ROLES = {
  LEGAL_OFFICER: 'legal_officer',
  SENIOR_LEGAL_OFFICER: 'senior_legal_officer',
  DEPUTY_SECRETARY: 'deputy_secretary',
  SECRETARY: 'secretary',
  // New enterprise roles
  LEGAL_SECRETARY: 'legal_secretary',
  LEGAL_OFFICER_CORPORATE: 'legal_officer_corporate',
  SENIOR_LEGAL_OFFICER_CORPORATE: 'senior_legal_officer_corporate',
  LEGAL_OFFICER_LEGISLATION: 'legal_officer_legislation',
  MANAGER_LEGAL_SERVICES: 'manager_legal_services',
  DIRECTOR_POLICY_LEGAL: 'director_policy_legal',
  SYSTEM_ADMINISTRATOR: 'system_administrator',
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

// Risk Classification Levels
export const RISK_CLASSIFICATIONS = [
  'Low',
  'Medium',
  'High',
  'Critical',
] as const;

// Zoning Types
export const ZONING_TYPES = [
  'Residential',
  'Commercial',
  'Industrial',
  'Agricultural',
  'Mixed Use',
  'Special Purpose',
  'Conservation',
  'Other',
] as const;

// Divisions (can be loaded from corporate_reference_divisions table)
export const DIVISIONS = [
  'Legal Services',
  'Policy & Legislation',
  'Land Administration',
  'Physical Planning',
  'Surveying',
  'Corporate Services',
  'Finance',
  'ICT',
  'Other',
] as const;

// ============================================================================
// EXPORT ALL
// ============================================================================

export type MatterType = typeof MATTER_TYPES[number];
export type RequestForm = typeof REQUEST_FORMS[number];
export type RequestType = typeof REQUEST_TYPES[number];
export type TaskType = typeof TASK_TYPES[number];
export type DocumentType = typeof DOCUMENT_TYPES[number];
export type MatterStatusType = typeof MATTER_STATUS[number];
export type TaskStatusType = typeof TASK_STATUS[number];
export type LeaseType = typeof LEASE_TYPES[number];
export type RiskClassification = typeof RISK_CLASSIFICATIONS[number];
export type ZoningType = typeof ZONING_TYPES[number];
export type Division = typeof DIVISIONS[number];
