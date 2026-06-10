'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Users, UserPlus, Search, Shield, UserCheck, UserX, Edit, Trash2, Settings, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
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

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

interface UserWithGroups extends AuthUser {
  groups: Group[];
}

export default function UsersAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithGroups[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [manageGroupsDialogOpen, setManageGroupsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithGroups | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithGroups | null>(null);
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
      setGroups(groupsData || []);

      // Load all users from auth.users (admin only)
      const { data: { users: authUsers }, error: usersError } = await supabase.auth.admin.listUsers();

      if (usersError) throw usersError;

      // For each user, get their groups
      const usersWithGroups: UserWithGroups[] = await Promise.all(
        (authUsers || []).map(async (authUser) => {
          const { data: userGroupsData } = await supabase
            .from('user_groups')
            .select(`
              group_id,
              groups (
                id,
                group_name,
                description,
                is_active,
                created_at
              )
            `)
            .eq('user_id', authUser.id)
            .eq('is_active', true);

          const userGroups = (userGroupsData || [])
            .map((ug: any) => ug.groups)
            .filter((g: any) => g !== null) as Group[];

          return {
            id: authUser.id,
            email: authUser.email || '',
            created_at: authUser.created_at,
            last_sign_in_at: authUser.last_sign_in_at ?? null,
            email_confirmed_at: authUser.email_confirmed_at ?? null,
            groups: userGroups,
          };
        })
      );

      setUsers(usersWithGroups);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleManageGroups = (user: UserWithGroups) => {
    setSelectedUser(user);
    setManageGroupsDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      const supabase = createClient();

      // Delete user from auth
      const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);

      if (error) throw error;

      toast.success(`User ${userToDelete.email} deleted successfully`);
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

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500">Manage user accounts and group assignments</p>
          </div>
          <Button
            onClick={() => setCreateUserDialogOpen(true)}
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <UserPlus className="h-4 w-4" />
            Add New User
          </Button>
        </div>

        {/* Stats tiles */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Confirmed Emails', value: users.filter(u => u.email_confirmed_at).length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts, groups, and permissions</CardDescription>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-slate-600 mt-4">Loading users...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Groups</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                        {searchQuery ? 'No users found matching your search' : 'No users yet. Create your first user to get started.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">{user.email}</span>
                            {user.email_confirmed_at && (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
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
                        <TableCell>
                          {user.email_confirmed_at ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              <XCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at ? (
                            <span className="text-sm text-slate-600">
                              {format(new Date(user.last_sign_in_at), 'MMM d, yyyy')}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {format(new Date(user.created_at), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageGroups(user)}
                              className="gap-1"
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
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
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
              Are you sure you want to delete {userToDelete?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
