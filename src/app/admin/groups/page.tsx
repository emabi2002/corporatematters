'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Shield, Save, X, Users, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Group {
  id: string;
  group_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface Module {
  id: string;
  module_name: string;
  module_key: string;
}

interface GroupModulePermission {
  id?: string;
  group_id: string;
  module_id: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_print: boolean;
  can_approve: boolean;
  can_export: boolean;
}

interface PermissionMatrixRow {
  module_id: string;
  module_name: string;
  module_key: string;
  permissions: {
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
    can_print: boolean;
    can_approve: boolean;
    can_export: boolean;
  };
}

export default function GroupManagementPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [permissions, setPermissions] = useState<PermissionMatrixRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for new/edit group
  const [isCreating, setIsCreating] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState({ group_name: '', description: '' });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/auth/login');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const [groupsRes, modulesRes] = await Promise.all([
        supabase.from('groups').select('*').order('group_name'),
        supabase.from('modules').select('*').order('module_name')
      ]);

      if (groupsRes.error) throw groupsRes.error;
      if (modulesRes.error) throw modulesRes.error;

      setGroups(groupsRes.data || []);
      setModules(modulesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load groups and modules');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupPermissions = async (group: Group) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('group_module_permissions')
        .select('*')
        .eq('group_id', group.id);

      if (error) throw error;

      const permissionsMap = new Map((data as GroupModulePermission[] || []).map(p => [p.module_id, p]));

      const matrixRows: PermissionMatrixRow[] = modules.map(module => {
        const perm = permissionsMap.get(module.id);
        return {
          module_id: module.id,
          module_name: module.module_name,
          module_key: module.module_key,
          permissions: {
            can_create: perm?.can_create || false,
            can_read: perm?.can_read || false,
            can_update: perm?.can_update || false,
            can_delete: perm?.can_delete || false,
            can_print: perm?.can_print || false,
            can_approve: perm?.can_approve || false,
            can_export: perm?.can_export || false,
          }
        };
      });

      setPermissions(matrixRows);
      setSelectedGroup(group);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Failed to load permissions');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.group_name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('groups')
        .insert({
          group_name: groupForm.group_name,
          description: groupForm.description || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Group created successfully');
      setGroupForm({ group_name: '', description: '' });
      setIsCreating(false);
      loadData();
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error(error.message || 'Failed to create group');
    }
  };

  const handleUpdateGroup = async (groupId: string) => {
    if (!groupForm.group_name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('groups')
        .update({
          group_name: groupForm.group_name,
          description: groupForm.description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId);

      if (error) throw error;

      toast.success('Group updated successfully');
      setEditingGroupId(null);
      setGroupForm({ group_name: '', description: '' });
      loadData();
    } catch (error: any) {
      console.error('Error updating group:', error);
      toast.error(error.message || 'Failed to update group');
    }
  };

  const startEditGroup = (group: Group) => {
    setEditingGroupId(group.id);
    setGroupForm({
      group_name: group.group_name,
      description: group.description || ''
    });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setIsCreating(false);
    setGroupForm({ group_name: '', description: '' });
  };

  const handleDeleteGroup = async (group: Group) => {
    if (!confirm(`Are you sure you want to delete "${group.group_name}"? This will remove all associated permissions.`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id);

      if (error) throw error;

      toast.success('Group deleted successfully');
      if (selectedGroup?.id === group.id) {
        setSelectedGroup(null);
        setPermissions([]);
      }
      loadData();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      toast.error(error.message || 'Failed to delete group');
    }
  };

  const togglePermission = (moduleId: string, permission: keyof PermissionMatrixRow['permissions']) => {
    setPermissions(prev => prev.map(row => {
      if (row.module_id === moduleId) {
        return {
          ...row,
          permissions: {
            ...row.permissions,
            [permission]: !row.permissions[permission]
          }
        };
      }
      return row;
    }));
  };

  const toggleAllForModule = (moduleId: string, enabled: boolean) => {
    setPermissions(prev => prev.map(row => {
      if (row.module_id === moduleId) {
        return {
          ...row,
          permissions: {
            can_create: enabled,
            can_read: enabled,
            can_update: enabled,
            can_delete: enabled,
            can_print: enabled,
            can_approve: enabled,
            can_export: enabled,
          }
        };
      }
      return row;
    }));
  };

  const savePermissions = async () => {
    if (!selectedGroup) return;

    try {
      setSaving(true);
      const supabase = createClient();

      // Delete existing permissions
      await supabase
        .from('group_module_permissions')
        .delete()
        .eq('group_id', selectedGroup.id);

      // Insert new permissions (only for modules with at least one permission enabled)
      const permissionsToInsert = permissions
        .filter(row =>
          Object.values(row.permissions).some(val => val === true)
        )
        .map(row => ({
          group_id: selectedGroup.id,
          module_id: row.module_id,
          ...row.permissions
        }));

      if (permissionsToInsert.length > 0) {
        const { error } = await supabase
          .from('group_module_permissions')
          .insert(permissionsToInsert);

        if (error) throw error;
      }

      toast.success('Permissions saved successfully');
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      toast.error(error.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto" />
            <p className="mt-3 text-sm text-slate-600">Loading groups...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">Group Management</h1>
            <p className="text-sm text-slate-500">Manage user groups and permissions</p>
          </div>
          <Button
            onClick={() => {
              setIsCreating(true);
              setEditingGroupId(null);
              setGroupForm({ group_name: '', description: '' });
            }}
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Groups List */}
          <Card className="border-slate-200 lg:col-span-1">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                <Users className="h-4 w-4 text-blue-600" />
                Groups
                <span className="ml-auto text-xs font-normal text-slate-400">{groups.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="space-y-2">
                {/* Create Form */}
                {isCreating && (
                  <Card className="border-emerald-300 bg-emerald-50">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <Label className="flex items-center gap-1.5">
                          Group Name *
                          <HelpTooltip
                            title="Group Name"
                            content="Name the group after a real job function (e.g. “Legal Officers”). Users assigned to it inherit all of its module permissions."
                          />
                        </Label>
                        <Input
                          value={groupForm.group_name}
                          onChange={(e) => setGroupForm({ ...groupForm, group_name: e.target.value })}
                          placeholder="e.g., Legal Officers"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={groupForm.description}
                          onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                          placeholder="Brief description of this group's role"
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateGroup} size="sm" className="flex-1">
                          <Save className="h-3 w-3 mr-1" />
                          Create
                        </Button>
                        <Button onClick={cancelEdit} variant="outline" size="sm">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Groups List */}
                {groups.map((group) => (
                  <div key={group.id}>
                    {editingGroupId === group.id ? (
                      <Card className="border-blue-300 bg-blue-50">
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <Label className="flex items-center gap-1.5">
                          Group Name *
                          <HelpTooltip
                            title="Group Name"
                            content="Name the group after a real job function (e.g. “Legal Officers”). Users assigned to it inherit all of its module permissions."
                          />
                        </Label>
                            <Input
                              value={groupForm.group_name}
                              onChange={(e) => setGroupForm({ ...groupForm, group_name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={groupForm.description}
                              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdateGroup(group.id)} size="sm" className="flex-1">
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button onClick={cancelEdit} variant="outline" size="sm">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card
                        className={`cursor-pointer transition-colors ${
                          selectedGroup?.id === group.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => loadGroupPermissions(group)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{group.group_name}</h3>
                              {group.description && (
                                <p className="text-xs text-slate-600 mt-1">{group.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditGroup(group)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteGroup(group)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permissions Matrix */}
          <Card className="border-slate-200 lg:col-span-2">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  {selectedGroup ? `Permissions: ${selectedGroup.group_name}` : 'Select a Group'}
                </CardTitle>
                {selectedGroup && (
                  <Button
                    onClick={savePermissions}
                    disabled={saving}
                    size="sm"
                    className="ml-auto bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saving ? 'Saving...' : 'Save Permissions'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {!selectedGroup ? (
                <div className="text-center py-12 text-slate-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Select a group from the list to view and edit permissions</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left p-2 text-xs font-medium text-slate-500">Module</th>
                        <th className="text-center p-2 text-xs font-medium text-slate-500">Read</th>
                        <th className="text-center p-2 text-xs font-medium text-slate-500">Create</th>
                        <th className="text-center p-2 text-xs font-medium text-slate-500">Update</th>
                        <th className="text-center p-2 text-xs font-medium text-slate-500">Delete</th>
                        <th className="text-center p-2 text-xs font-medium text-slate-500">Print</th>
                        <th className="text-center p-2 text-xs font-medium text-slate-500">Approve</th>
                        <th className="text-center p-2 text-xs font-medium text-slate-500">Export</th>
                        <th className="text-center p-2 text-xs font-medium text-slate-500">All</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((row) => (
                        <tr key={row.module_id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-2">
                            <div>
                              <div className="text-xs font-medium">{row.module_name}</div>
                              <div className="text-xs text-slate-500">{row.module_key}</div>
                            </div>
                          </td>
                          <td className="text-center p-2">
                            <Checkbox
                              checked={row.permissions.can_read}
                              onCheckedChange={() => togglePermission(row.module_id, 'can_read')}
                            />
                          </td>
                          <td className="text-center p-2">
                            <Checkbox
                              checked={row.permissions.can_create}
                              onCheckedChange={() => togglePermission(row.module_id, 'can_create')}
                            />
                          </td>
                          <td className="text-center p-2">
                            <Checkbox
                              checked={row.permissions.can_update}
                              onCheckedChange={() => togglePermission(row.module_id, 'can_update')}
                            />
                          </td>
                          <td className="text-center p-2">
                            <Checkbox
                              checked={row.permissions.can_delete}
                              onCheckedChange={() => togglePermission(row.module_id, 'can_delete')}
                            />
                          </td>
                          <td className="text-center p-2">
                            <Checkbox
                              checked={row.permissions.can_print}
                              onCheckedChange={() => togglePermission(row.module_id, 'can_print')}
                            />
                          </td>
                          <td className="text-center p-2">
                            <Checkbox
                              checked={row.permissions.can_approve}
                              onCheckedChange={() => togglePermission(row.module_id, 'can_approve')}
                            />
                          </td>
                          <td className="text-center p-2">
                            <Checkbox
                              checked={row.permissions.can_export}
                              onCheckedChange={() => togglePermission(row.module_id, 'can_export')}
                            />
                          </td>
                          <td className="text-center p-2">
                            <Checkbox
                              checked={Object.values(row.permissions).every(v => v)}
                              onCheckedChange={(checked) =>
                                toggleAllForModule(row.module_id, checked === true)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
