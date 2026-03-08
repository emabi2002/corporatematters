// ============================================================================
// DLPP Corporate Matters - Role-Based Access Control
// ============================================================================

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

export const ROLE_LABELS: Record<UserRole, string> = {
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

// Role hierarchy (higher number = more authority)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.LEGAL_SECRETARY]: 1,
  [USER_ROLES.LEGAL_OFFICER_CORPORATE]: 2,
  [USER_ROLES.LEGAL_OFFICER_LEGISLATION]: 2,
  [USER_ROLES.SENIOR_LEGAL_OFFICER_CORPORATE]: 3,
  [USER_ROLES.MANAGER_LEGAL_SERVICES]: 4,
  [USER_ROLES.DIRECTOR_POLICY_LEGAL]: 5,
  [USER_ROLES.DEPUTY_SECRETARY]: 6,
  [USER_ROLES.SECRETARY]: 7,
  [USER_ROLES.SYSTEM_ADMINISTRATOR]: 8,
};

// ----------------------------------------------------------------------------
// PERMISSIONS
// ----------------------------------------------------------------------------

export const PERMISSIONS = {
  // Matter Permissions
  MATTER_VIEW_ALL: 'matter:view:all',
  MATTER_VIEW_OWN: 'matter:view:own',
  MATTER_VIEW_DIVISION: 'matter:view:division',
  MATTER_CREATE: 'matter:create',
  MATTER_EDIT_OWN: 'matter:edit:own',
  MATTER_EDIT_ALL: 'matter:edit:all',
  MATTER_DELETE: 'matter:delete',
  MATTER_ASSIGN: 'matter:assign',
  MATTER_CLOSE: 'matter:close',

  // Document Permissions
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_APPROVE: 'document:approve',

  // Task Permissions
  TASK_CREATE: 'task:create',
  TASK_EDIT_OWN: 'task:edit:own',
  TASK_EDIT_ALL: 'task:edit:all',
  TASK_DELETE: 'task:delete',

  // Review Permissions
  REVIEW_SUBMIT: 'review:submit',
  REVIEW_APPROVE: 'review:approve',
  REVIEW_RETURN: 'review:return',
  REVIEW_ESCALATE: 'review:escalate',

  // User Management Permissions
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_ASSIGN_ROLE: 'user:assign_role',

  // Reference Data Permissions
  REFERENCE_VIEW: 'reference:view',
  REFERENCE_CREATE: 'reference:create',
  REFERENCE_EDIT: 'reference:edit',
  REFERENCE_DELETE: 'reference:delete',

  // Report Permissions
  REPORT_VIEW_BASIC: 'report:view:basic',
  REPORT_VIEW_ADVANCED: 'report:view:advanced',
  REPORT_EXPORT: 'report:export',

  // System Permissions
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_AUDIT: 'system:audit',
  SYSTEM_BACKUP: 'system:backup',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ----------------------------------------------------------------------------
// ROLE-PERMISSION MATRIX
// ----------------------------------------------------------------------------

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Legal Secretary - Can register matters, upload docs
  [USER_ROLES.LEGAL_SECRETARY]: [
    PERMISSIONS.MATTER_VIEW_ALL,
    PERMISSIONS.MATTER_CREATE,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.REPORT_VIEW_BASIC,
  ],

  // Legal Officer Corporate - Can work on assigned matters
  [USER_ROLES.LEGAL_OFFICER_CORPORATE]: [
    PERMISSIONS.MATTER_VIEW_OWN,
    PERMISSIONS.MATTER_VIEW_DIVISION,
    PERMISSIONS.MATTER_EDIT_OWN,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT_OWN,
    PERMISSIONS.REVIEW_SUBMIT,
    PERMISSIONS.REPORT_VIEW_BASIC,
  ],

  // Senior Legal Officer Corporate - More permissions
  [USER_ROLES.SENIOR_LEGAL_OFFICER_CORPORATE]: [
    PERMISSIONS.MATTER_VIEW_ALL,
    PERMISSIONS.MATTER_EDIT_OWN,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT_OWN,
    PERMISSIONS.TASK_EDIT_ALL,
    PERMISSIONS.REVIEW_SUBMIT,
    PERMISSIONS.REVIEW_APPROVE,
    PERMISSIONS.REPORT_VIEW_BASIC,
    PERMISSIONS.REPORT_VIEW_ADVANCED,
  ],

  // Legal Officer Legislation - Legislation matters only
  [USER_ROLES.LEGAL_OFFICER_LEGISLATION]: [
    PERMISSIONS.MATTER_VIEW_OWN,
    PERMISSIONS.MATTER_EDIT_OWN,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT_OWN,
    PERMISSIONS.REVIEW_SUBMIT,
    PERMISSIONS.REPORT_VIEW_BASIC,
  ],

  // Manager Legal Services - Can assign, review, manage
  [USER_ROLES.MANAGER_LEGAL_SERVICES]: [
    PERMISSIONS.MATTER_VIEW_ALL,
    PERMISSIONS.MATTER_CREATE,
    PERMISSIONS.MATTER_EDIT_ALL,
    PERMISSIONS.MATTER_ASSIGN,
    PERMISSIONS.MATTER_CLOSE,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.DOCUMENT_APPROVE,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT_ALL,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.REVIEW_APPROVE,
    PERMISSIONS.REVIEW_RETURN,
    PERMISSIONS.REVIEW_ESCALATE,
    PERMISSIONS.REPORT_VIEW_ADVANCED,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_VIEW,
  ],

  // Director Policy & Legal - Senior management
  [USER_ROLES.DIRECTOR_POLICY_LEGAL]: [
    PERMISSIONS.MATTER_VIEW_ALL,
    PERMISSIONS.MATTER_CREATE,
    PERMISSIONS.MATTER_EDIT_ALL,
    PERMISSIONS.MATTER_ASSIGN,
    PERMISSIONS.MATTER_CLOSE,
    PERMISSIONS.MATTER_DELETE,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.DOCUMENT_APPROVE,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT_ALL,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.REVIEW_APPROVE,
    PERMISSIONS.REVIEW_RETURN,
    PERMISSIONS.REVIEW_ESCALATE,
    PERMISSIONS.REPORT_VIEW_ADVANCED,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.REFERENCE_VIEW,
    PERMISSIONS.REFERENCE_CREATE,
    PERMISSIONS.REFERENCE_EDIT,
  ],

  // Deputy Secretary - Executive level
  [USER_ROLES.DEPUTY_SECRETARY]: [
    PERMISSIONS.MATTER_VIEW_ALL,
    PERMISSIONS.MATTER_EDIT_ALL,
    PERMISSIONS.MATTER_DELETE,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_APPROVE,
    PERMISSIONS.REVIEW_APPROVE,
    PERMISSIONS.REVIEW_ESCALATE,
    PERMISSIONS.REPORT_VIEW_ADVANCED,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.REFERENCE_VIEW,
    PERMISSIONS.SYSTEM_AUDIT,
  ],

  // Secretary - Highest executive
  [USER_ROLES.SECRETARY]: [
    PERMISSIONS.MATTER_VIEW_ALL,
    PERMISSIONS.MATTER_EDIT_ALL,
    PERMISSIONS.MATTER_DELETE,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_APPROVE,
    PERMISSIONS.REVIEW_APPROVE,
    PERMISSIONS.REPORT_VIEW_ADVANCED,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.REFERENCE_VIEW,
    PERMISSIONS.SYSTEM_AUDIT,
  ],

  // System Administrator - Full access
  [USER_ROLES.SYSTEM_ADMINISTRATOR]: Object.values(PERMISSIONS),
};

// ----------------------------------------------------------------------------
// PERMISSION CHECKING FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: string | null, permission: Permission): boolean {
  if (!role) return false;
  const rolePermissions = ROLE_PERMISSIONS[role as UserRole];
  return rolePermissions ? rolePermissions.includes(permission) : false;
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function roleHasAllPermissions(role: string | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every((permission) => roleHasPermission(role, permission));
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function roleHasAnyPermission(role: string | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((permission) => roleHasPermission(role, permission));
}

/**
 * Check if role A has higher authority than role B
 */
export function roleHasHigherAuthority(roleA: string | null, roleB: string | null): boolean {
  if (!roleA || !roleB) return false;
  const hierarchyA = ROLE_HIERARCHY[roleA as UserRole] || 0;
  const hierarchyB = ROLE_HIERARCHY[roleB as UserRole] || 0;
  return hierarchyA > hierarchyB;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string | null): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role as UserRole] || [];
}

/**
 * Check if user can view a specific matter
 */
export function canViewMatter(
  userRole: string | null,
  userId: string,
  matter: { assigned_officer?: string | null; requesting_division?: string | null },
  userDivision?: string | null
): boolean {
  if (!userRole) return false;

  // Can view all matters
  if (roleHasPermission(userRole, PERMISSIONS.MATTER_VIEW_ALL)) {
    return true;
  }

  // Can view own matters
  if (roleHasPermission(userRole, PERMISSIONS.MATTER_VIEW_OWN) && matter.assigned_officer === userId) {
    return true;
  }

  // Can view division matters
  if (
    roleHasPermission(userRole, PERMISSIONS.MATTER_VIEW_DIVISION) &&
    userDivision &&
    matter.requesting_division === userDivision
  ) {
    return true;
  }

  return false;
}

/**
 * Check if user can edit a specific matter
 */
export function canEditMatter(
  userRole: string | null,
  userId: string,
  matter: { assigned_officer?: string | null }
): boolean {
  if (!userRole) return false;

  // Can edit all matters
  if (roleHasPermission(userRole, PERMISSIONS.MATTER_EDIT_ALL)) {
    return true;
  }

  // Can edit own matters
  if (roleHasPermission(userRole, PERMISSIONS.MATTER_EDIT_OWN) && matter.assigned_officer === userId) {
    return true;
  }

  return false;
}

/**
 * Check if user can assign matters
 */
export function canAssignMatters(userRole: string | null): boolean {
  return roleHasPermission(userRole, PERMISSIONS.MATTER_ASSIGN);
}

/**
 * Check if user can close matters
 */
export function canCloseMatters(userRole: string | null): boolean {
  return roleHasPermission(userRole, PERMISSIONS.MATTER_CLOSE);
}

/**
 * Check if user can approve reviews
 */
export function canApproveReviews(userRole: string | null): boolean {
  return roleHasPermission(userRole, PERMISSIONS.REVIEW_APPROVE);
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(userRole: string | null): boolean {
  return roleHasAnyPermission(userRole, [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.REFERENCE_CREATE,
    PERMISSIONS.REFERENCE_EDIT,
    PERMISSIONS.SYSTEM_SETTINGS,
  ]);
}

/**
 * Check if user can manage users
 */
export function canManageUsers(userRole: string | null): boolean {
  return roleHasAnyPermission(userRole, [PERMISSIONS.USER_CREATE, PERMISSIONS.USER_EDIT, PERMISSIONS.USER_DELETE]);
}

/**
 * Check if user can manage reference data
 */
export function canManageReferenceData(userRole: string | null): boolean {
  return roleHasAnyPermission(userRole, [
    PERMISSIONS.REFERENCE_CREATE,
    PERMISSIONS.REFERENCE_EDIT,
    PERMISSIONS.REFERENCE_DELETE,
  ]);
}

/**
 * Get user-friendly role description
 */
export function getRoleDescription(role: string | null): string {
  if (!role) return 'No role assigned';
  return ROLE_LABELS[role as UserRole] || role;
}

/**
 * Get role color for UI badges
 */
export function getRoleColor(role: string | null): string {
  if (!role) return 'bg-gray-100 text-gray-800 border-gray-300';

  const hierarchy = ROLE_HIERARCHY[role as UserRole] || 0;

  if (hierarchy >= 7) return 'bg-purple-100 text-purple-800 border-purple-300'; // Secretary, Admin
  if (hierarchy >= 5) return 'bg-blue-100 text-blue-800 border-blue-300'; // Director, Deputy Secretary
  if (hierarchy >= 4) return 'bg-green-100 text-green-800 border-green-300'; // Manager
  if (hierarchy >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300'; // Senior Officer
  if (hierarchy >= 2) return 'bg-orange-100 text-orange-800 border-orange-300'; // Officer
  return 'bg-slate-100 text-slate-800 border-slate-300'; // Secretary
}

/**
 * Check if role is management level (can assign/review)
 */
export function isManagementRole(role: string | null): boolean {
  if (!role) return false;
  const hierarchy = ROLE_HIERARCHY[role as UserRole] || 0;
  return hierarchy >= 4; // Manager and above
}

/**
 * Check if role is executive level
 */
export function isExecutiveRole(role: string | null): boolean {
  if (!role) return false;
  const hierarchy = ROLE_HIERARCHY[role as UserRole] || 0;
  return hierarchy >= 6; // Deputy Secretary and above
}
