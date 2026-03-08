import { useAuth } from '@/contexts/AuthContext';
import {
  roleHasPermission,
  roleHasAllPermissions,
  roleHasAnyPermission,
  canViewMatter,
  canEditMatter,
  canAssignMatters,
  canCloseMatters,
  canApproveReviews,
  canAccessAdmin,
  canManageUsers,
  canManageReferenceData,
  getRoleDescription,
  getRoleColor,
  isManagementRole,
  isExecutiveRole,
  type Permission,
} from '@/lib/roles-permissions';

/**
 * Hook to check user permissions throughout the application
 */
export function usePermissions() {
  const { profile } = useAuth();
  const userRole = profile?.role || null;
  const userId = profile?.id || '';
  const userDivision = profile?.division || null;

  return {
    // Basic permission checks
    hasPermission: (permission: Permission) => roleHasPermission(userRole, permission),
    hasAllPermissions: (permissions: Permission[]) => roleHasAllPermissions(userRole, permissions),
    hasAnyPermission: (permissions: Permission[]) => roleHasAnyPermission(userRole, permissions),

    // Matter-specific permissions
    canViewMatter: (matter: { assigned_officer?: string | null; requesting_division?: string | null }) =>
      canViewMatter(userRole, userId, matter, userDivision),
    canEditMatter: (matter: { assigned_officer?: string | null }) => canEditMatter(userRole, userId, matter),
    canAssignMatters: () => canAssignMatters(userRole),
    canCloseMatters: () => canCloseMatters(userRole),
    canApproveReviews: () => canApproveReviews(userRole),

    // Admin permissions
    canAccessAdmin: () => canAccessAdmin(userRole),
    canManageUsers: () => canManageUsers(userRole),
    canManageReferenceData: () => canManageReferenceData(userRole),

    // Role info
    userRole,
    userId,
    userDivision,
    roleDescription: getRoleDescription(userRole),
    roleColor: getRoleColor(userRole),
    isManagement: isManagementRole(userRole),
    isExecutive: isExecutiveRole(userRole),
  };
}
