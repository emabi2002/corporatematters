'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { AppLayout } from '@/components/AppLayout';
import { HelpButton } from '@/components/help/HelpButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, UserPlus, Search, Shield, UserCheck, Trash2, Mail, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { AddUserDialog } from '@/components/admin/AddUserDialog';
import { ManageUserGroupsDialog } from '@/components/admin/ManageUserGroupsDialog';

interface Group {
  id: string;
  group_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string;
  groups: Group[];
}

const formatRole = (role: string | null) => {
  if (!role) return 'User';
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const roleColor = (role: string | null) => {
  const r = (role || '').toLowerCase();
  if (r.includes('system') || r.includes('super')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (r.includes('admin')) return 'bg-amber-50 text-amber-700 border-amber-300';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const getInitials = (name: string | null, email: string) => {
  const base = (name || email || '').replace(/@.*/, '');
  const parts = base.split(/[ ._-]+/).filter(Boolean);
  const ini = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  return ini || base[0]?.toUpperCase() || '?';
};

export default function UsersAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [manageGroupsDialogOpen, setManageGroupsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

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

      // Load all groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('group_name');

      if (groupsError) throw groupsError;
      setGroups((groupsData as Group[]) || []);

      // Load all users from the profiles table (RLS-accessible to authenticated
      // admins). NOTE: auth.admin.listUsers() requires the service-role key and
      // cannot run in the browser, so we read from profiles instead.
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, is_active, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Load every active group membership in a single query, then group by user.
      const { data: ugData, error: ugError } = await supabase
        .from('user_groups')
        .select('user_id, groups ( id, group_name, description, is_active, created_at )')
        .eq('is_active', true);

      if (ugError) throw ugError;

      const groupsByUser = new Map<string, Group[]>();
      (ugData || []).forEach((ug: any) => {
        if (!ug.groups) return;
        const arr = groupsByUser.get(ug.user_id) || [];
        arr.push(ug.groups as Group);
        groupsByUser.set(ug.user_id, arr);
      });

      const usersWithGroups: UserProfile[] = (profilesData || []).map((p: any) => ({
        id: p.id,
        email: p.email || '',
        full_name: p.full_name ?? null,
        role: p.role ?? null,
        is_active: p.is_active ?? true,
        created_at: p.created_at,
        groups: groupsByUser.get(p.id) || [],
      }));

      setUsers(usersWithGroups);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleManageGroups = (user: UserProfile) => {
    setSelectedUser(user);
    setManageGroupsDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      // Permanently delete via the secure server route (service-role key stays
      // on the server). Falls back with a clear error if not configured.
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(userToDelete.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete user');

      toast.success(`User ${userToDelete.email} deleted`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      loadData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(q) ||
      (user.full_name || '').toLowerCase().includes(q) ||
      (user.role || '').toLowerCase().includes(q)
    );
  });

  const activeCount = users.filter((u) => u.is_active).length;

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500">Manage user accounts and group assignments</p>
          </div>
          <div className="flex items-center gap-2">
            <HelpButton variant="inline" articleId="user-management" label="Help" />
            <Button
              onClick={() => setCreateUserDialogOpen(true)}
              size="sm"
              data-tour="users-add"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
          </div>
        </div>

        {/* Stats tiles */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Users', value: activeCount, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Available Groups', value: groups.length, icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 truncate">{s.label}</p>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">{s.value}</p>
                    </div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${s.bg}`}>
                      <Icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Users Table */}
        <Card className="border-slate-200">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                <Users className="h-4 w-4 text-emerald-600" />
                All Users
                <span className="text-xs font-normal text-slate-400">{filteredUsers.length}</span>
              </CardTitle>
              <div className="relative w-72 ml-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto" />
                  <p className="mt-3 text-sm text-slate-600">Loading users...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto" data-tour="users-table">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-9 text-xs">User</TableHead>
                      <TableHead className="h-9 text-xs">Role</TableHead>
                      <TableHead className="h-9 text-xs">Groups</TableHead>
                      <TableHead className="h-9 text-xs">Status</TableHead>
                      <TableHead className="h-9 text-xs">Created</TableHead>
                      <TableHead className="h-9 text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-xs text-slate-500">
                          {searchQuery ? 'No users found matching your search' : 'No users found.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="py-2 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                                {getInitials(user.full_name, user.email)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-slate-900 truncate max-w-[200px]">
                                  {user.full_name || user.email.split('@')[0]}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[220px]">
                                  <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-xs">
                            <Badge variant="outline" className={roleColor(user.role)}>
                              {formatRole(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 text-xs">
                            <div className="flex flex-wrap gap-1">
                              {user.groups.length === 0 ? (
                                <Badge variant="outline" className="text-amber-600 border-amber-300">
                                  No groups
                                </Badge>
                              ) : (
                                user.groups.map((group) => (
                                  <Badge
                                    key={group.id}
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {group.group_name}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-xs">
                            {user.is_active ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-500 border-slate-300">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-2 text-xs">
                            <span className="text-xs text-slate-600">
                              {format(new Date(user.created_at), 'MMM d, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 text-xs">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManageGroups(user)}
                                className="gap-1 h-8"
                              >
                                <Shield className="h-3 w-3" />
                                Groups
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setUserToDelete(user);
                                  setDeleteDialogOpen(true);
                                }}
                                className="gap-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <AddUserDialog
        open={createUserDialogOpen}
        onOpenChange={setCreateUserDialogOpen}
        onSuccess={loadData}
        groups={groups}
      />

      {/* Manage User Groups Dialog */}
      {selectedUser && (
        <ManageUserGroupsDialog
          open={manageGroupsDialogOpen}
          onOpenChange={setManageGroupsDialogOpen}
          onSuccess={loadData}
          userId={selectedUser.id}
          userEmail={selectedUser.email}
          currentGroups={selectedUser.groups}
          allGroups={groups}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Permanently delete {userToDelete?.email}? This removes their account and all group
              memberships and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
