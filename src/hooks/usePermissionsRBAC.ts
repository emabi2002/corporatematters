/**
 * ============================================================================
 * RBAC-BASED PERMISSIONS HOOK
 * ============================================================================
 * This hook provides permission checking using the new RBAC system
 * Use this after running the database migration
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserPermissions,
  hasPermission as checkPermission,
  isSuperAdmin as checkSuperAdmin,
  type PermissionAction,
  type ModulePermission,
} from '@/lib/shared-permissions';

/**
 * Hook to check user permissions using RBAC system
 */
export function usePermissionsRBAC() {
  const { user, profile } = useAuth();
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Load permissions on mount and when user changes
  useEffect(() => {
    async function loadPermissions() {
      if (!user) {
        setPermissions([]);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('Loading permissions for user:', user.id);
        const [perms, superAdmin] = await Promise.all([
          getUserPermissions(),
          checkSuperAdmin(),
        ]);

        console.log('Permissions loaded:', perms.length, 'Super admin:', superAdmin);
        setPermissions(perms);
        setIsSuperAdmin(superAdmin);
      } catch (error) {
        console.error('Error loading permissions:', error);
        // Set empty permissions on error instead of staying in loading
        setPermissions([]);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, [user]);

  // Module permission checks
  const canReadModule = (moduleKey: string) => {
    const module = permissions.find(p => p.module_key === moduleKey);
    return module?.can_read === true;
  };

  const canCreateInModule = (moduleKey: string) => {
    const module = permissions.find(p => p.module_key === moduleKey);
    return module?.can_create === true;
  };

  const canUpdateInModule = (moduleKey: string) => {
    const module = permissions.find(p => p.module_key === moduleKey);
    return module?.can_update === true;
  };

  const canDeleteInModule = (moduleKey: string) => {
    const module = permissions.find(p => p.module_key === moduleKey);
    return module?.can_delete === true;
  };

  const canApproveInModule = (moduleKey: string) => {
    const module = permissions.find(p => p.module_key === moduleKey);
    return module?.can_approve === true;
  };

  // Feature checks
  const canAccessAdmin = () => {
    return (
      canReadModule('corporate_users') ||
      canReadModule('corporate_reference') ||
      isSuperAdmin
    );
  };

  const canManageUsers = () => {
    return canUpdateInModule('corporate_users') || isSuperAdmin;
  };

  const canManageReferenceData = () => {
    return (
      canUpdateInModule('corporate_reference') ||
      canUpdateInModule('corporate_matter_types') ||
      isSuperAdmin
    );
  };

  const canAssignMatters = () => {
    return canUpdateInModule('corporate_assignment') || isSuperAdmin;
  };

  const canApproveReviews = () => {
    return canApproveInModule('corporate_review') || isSuperAdmin;
  };

  const canCloseMatters = () => {
    return canUpdateInModule('corporate_matters') || isSuperAdmin;
  };

  // Row-level checks
  const canViewMatter = (matter: {
    assigned_officer?: string | null;
    requesting_division?: string | null;
    created_by?: string | null;
  }) => {
    if (isSuperAdmin) return true;
    if (!canReadModule('corporate_matters')) return false;
    if (matter.assigned_officer === user?.id) return true;
    if (matter.created_by === user?.id) return true;
    if (matter.requesting_division === profile?.division) return true;
    if (canAssignMatters()) return true;
    return false;
  };

  const canEditMatter = (matter: {
    assigned_officer?: string | null;
    created_by?: string | null;
  }) => {
    if (isSuperAdmin) return true;
    if (!canUpdateInModule('corporate_matters')) return false;
    if (matter.assigned_officer === user?.id) return true;
    if (matter.created_by === user?.id && !matter.assigned_officer) return true;
    if (canAssignMatters()) return true;
    return false;
  };

  return {
    permissions,
    loading,
    isSuperAdmin,
    canReadModule,
    canCreateInModule,
    canUpdateInModule,
    canDeleteInModule,
    canApproveInModule,
    canAccessAdmin,
    canManageUsers,
    canManageReferenceData,
    canAssignMatters,
    canApproveReviews,
    canCloseMatters,
    canViewMatter,
    canEditMatter,
    userId: user?.id || '',
    userEmail: user?.email || '',
    userDivision: profile?.division || null,
  };
}
