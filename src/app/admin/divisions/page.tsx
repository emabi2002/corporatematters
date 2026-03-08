'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

type Division = Database['public']['Tables']['corporate_reference_divisions']['Row'];

export default function DivisionsPage() {
  const router = useRouter();
  const { canManageReferenceData } = usePermissions();
  const supabase = createClient();

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    is_active: true,
  });

  useEffect(() => {
    if (!canManageReferenceData()) {
      router.push('/admin');
    } else {
      fetchDivisions();
    }
  }, [canManageReferenceData, router]);

  useEffect(() => {
    filterDivisions();
  }, [searchQuery, divisions]);

  const fetchDivisions = async () => {
    try {
      const { data, error } = await supabase
        .from('corporate_reference_divisions')
        .select('*')
        .order('name');

      if (error) throw error;
      setDivisions(data || []);
    } catch (err: any) {
      console.error('Error fetching divisions:', err);
      setError('Failed to load divisions');
    } finally {
      setLoading(false);
    }
  };

  const filterDivisions = () => {
    let filtered = divisions;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (div) =>
          div.name.toLowerCase().includes(query) ||
          div.code?.toLowerCase().includes(query)
      );
    }

    setFilteredDivisions(filtered);
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      code: '',
      is_active: true,
    });
    setSelectedDivision(null);
    setError('');
    setShowCreateDialog(true);
  };

  const handleEdit = (division: Division) => {
    setFormData({
      name: division.name,
      code: division.code || '',
      is_active: division.is_active,
    });
    setSelectedDivision(division);
    setError('');
    setShowEditDialog(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name) {
      setError('Division name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase.from('corporate_reference_divisions').insert({
        name: formData.name,
        code: formData.code || null,
        is_active: formData.is_active,
      });

      if (error) throw error;

      setShowCreateDialog(false);
      await fetchDivisions();
    } catch (err: any) {
      console.error('Error creating division:', err);
      setError(err.message || 'Failed to create division');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedDivision) return;

    if (!formData.name) {
      setError('Division name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('corporate_reference_divisions')
        .update({
          name: formData.name,
          code: formData.code || null,
          is_active: formData.is_active,
        })
        .eq('id', selectedDivision.id);

      if (error) throw error;

      setShowEditDialog(false);
      await fetchDivisions();
    } catch (err: any) {
      console.error('Error updating division:', err);
      setError(err.message || 'Failed to update division');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (division: Division) => {
    if (!confirm(`Are you sure you want to delete division "${division.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('corporate_reference_divisions')
        .delete()
        .eq('id', division.id);

      if (error) throw error;
      await fetchDivisions();
    } catch (err: any) {
      console.error('Error deleting division:', err);
      alert('Failed to delete division. It may be in use by existing matters.');
    }
  };

  if (!canManageReferenceData()) {
    return null;
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">Divisions</h1>
              <p className="text-emerald-700 mt-1">
                {filteredDivisions.length} division{filteredDivisions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} className="bg-gradient-to-r from-emerald-600 to-teal-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Division
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search divisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Divisions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Divisions
            </CardTitle>
            <CardDescription>Manage organizational divisions</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDivisions.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">
                  {searchQuery ? 'No divisions match your search' : 'No divisions found'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Code</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Created</th>
                      <th className="text-right p-3 text-sm font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDivisions.map((division) => (
                      <tr key={division.id} className="border-b hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-medium text-slate-900">{division.name}</p>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-slate-600">
                            {division.code || '-'}
                          </span>
                        </td>
                        <td className="p-3">
                          {division.is_active ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-slate-600">
                            {format(new Date(division.created_at), 'MMM dd, yyyy')}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(division)}
                              title="Edit division"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(division)}
                              title="Delete division"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Division</DialogTitle>
              <DialogDescription>Add a new organizational division</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Division Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Legal Services"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Division Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="LS"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmitCreate} disabled={submitting || !formData.name}>
                {submitting ? 'Creating...' : 'Create Division'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Division</DialogTitle>
              <DialogDescription>Update division information</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">
                  Division Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_code">Division Code</Label>
                <Input
                  id="edit_code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_is_active">Status</Label>
                <select
                  id="edit_is_active"
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmitEdit} disabled={submitting || !formData.name}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
