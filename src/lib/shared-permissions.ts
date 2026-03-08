/**
 * ============================================================================
 * SHARED PERMISSIONS LIBRARY - Corporate Matters System
 * ============================================================================
 * This library provides unified permission checking using the RBAC system
 *
 * USAGE:
 * import { getUserPermissionsBySystem, hasPermission } from '@/lib/shared-permissions';
 * ============================================================================
 */

import { createClient } from '@/lib/supabase';

// Types
export type SystemType = 'landcase' | 'corporate' | 'admin';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'print' | 'approve' | 'export';

export interface ModulePermission {
  module_id: string;
  module_name: string;
  module_key: string;
  module_route: string | null;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_print: boolean;
  can_approve: boolean;
  can_export: boolean;
}

// Cache
let permissionsCache: ModulePermission[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the permissions cache
 */
export function clearPermissionsCache() {
  permissionsCache = null;
  cacheTimestamp = null;
}

/**
 * Get all permissions for the current user in the corporate system
 */
export async function getUserPermissions(): Promise<ModulePermission[]> {
  return getUserPermissionsBySystem('corporate');
}

/**
 * Get all permissions for the current user in a specific system
 */
export async function getUserPermissionsBySystem(
  system: SystemType = 'corporate'
): Promise<ModulePermission[]> {
  // Check cache
  if (permissionsCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log(`📦 Using cached permissions for ${system}:`, {
      count: permissionsCache.length,
      modules: permissionsCache.map(p => p.module_key)
    });
    return permissionsCache;
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('⚠️ No user authenticated');
      return [];
    }

    console.log(`🔍 Fetching permissions for user in ${system} system:`, user.email);

    // Call the database function to get system-specific permissions
    const { data, error } = await supabase.rpc('get_user_permissions_by_system', {
      p_user_id: user.id,
      p_system: system
    });

    if (error) {
      console.error('❌ Error fetching user permissions:', error);
      return [];
    }

    const permissions = (data || []) as ModulePermission[];

    console.log(`✅ Permissions fetched successfully for ${system}:`, {
      user: user.email,
      system,
      permissionCount: permissions.length,
      modules: permissions.map(p => ({
        key: p.module_key,
        name: p.module_name,
        canRead: p.can_read
      }))
    });

    // Update cache
    permissionsCache = permissions;
    cacheTimestamp = Date.now();

    return permissions;
  } catch (error) {
    console.error('❌ Error getting user permissions:', error);
    return [];
  }
}

/**
 * Check if user has access to the corporate system
 */
export async function hasSystemAccess(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('user_has_system_access', {
      p_user_id: user.id,
      p_system: 'corporate'
    });

    if (error) {
      console.error('Error checking system access:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error checking system access:', error);
    return false;
  }
}

/**
 * Get all systems the user has access to
 */
export async function getUserSystems(): Promise<SystemType[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_system_access')
      .select('system')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user systems:', error);
      return [];
    }

    return data?.map(row => row.system as SystemType) || [];
  } catch (error) {
    console.error('Error fetching user systems:', error);
    return [];
  }
}

/**
 * Check if user has a specific permission for a module
 */
export async function hasPermission(
  moduleKey: string,
  action: PermissionAction
): Promise<boolean> {
  try {
    const permissions = await getUserPermissions();
    const modulePermission = permissions.find(p => p.module_key === moduleKey);

    if (!modulePermission) return false;

    switch (action) {
      case 'create':
        return modulePermission.can_create;
      case 'read':
        return modulePermission.can_read;
      case 'update':
        return modulePermission.can_update;
      case 'delete':
        return modulePermission.can_delete;
      case 'print':
        return modulePermission.can_print;
      case 'approve':
        return modulePermission.can_approve;
      case 'export':
        return modulePermission.can_export;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if user is a Super Administrator (has access to all systems)
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if user is in the "Super Admin" group
    const { data, error } = await supabase
      .from('user_groups')
      .select(`
        group_id,
        groups!inner(group_name)
      `)
      .eq('user_id', user.id)
      .eq('groups.group_name', 'Super Admin')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking super admin status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

/**
 * Get readable module keys (useful for navigation)
 */
export async function getReadableModuleKeys(): Promise<string[]> {
  try {
    const permissions = await getUserPermissions();
    return permissions
      .filter((p) => p.can_read)
      .map((p) => p.module_key);
  } catch (error) {
    console.error('Error getting readable modules:', error);
    return [];
  }
}

/**
 * Get module permissions for a specific module
 */
export async function getModulePermissions(
  moduleKey: string
): Promise<{
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_print: boolean;
  can_approve: boolean;
  can_export: boolean;
} | null> {
  try {
    const permissions = await getUserPermissions();
    const modulePermission = permissions.find(p => p.module_key === moduleKey);

    if (!modulePermission) return null;

    return {
      can_create: modulePermission.can_create,
      can_read: modulePermission.can_read,
      can_update: modulePermission.can_update,
      can_delete: modulePermission.can_delete,
      can_print: modulePermission.can_print,
      can_approve: modulePermission.can_approve,
      can_export: modulePermission.can_export,
    };
  } catch (error) {
    console.error('Error getting module permissions:', error);
    return null;
  }
}
