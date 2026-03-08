'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  FileText,
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

type MatterType = Database['public']['Tables']['corporate_reference_matter_types']['Row'];

export default function MatterTypesPage() {
  const router = useRouter();
  const { canManageReferenceData } = usePermissions();
  const supabase = createClient();

  const [matterTypes, setMatterTypes] = useState<MatterType[]>([]);
  const [filteredMatterTypes, setFilteredMatterTypes] = useState<MatterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMatterType, setSelectedMatterType] = useState<MatterType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    if (!canManageReferenceData()) {
      router.push('/admin');
    } else {
      fetchMatterTypes();
    }
  }, [canManageReferenceData, router]);

  useEffect(() => {
    filterMatterTypes();
  }, [searchQuery, matterTypes]);

  const fetchMatterTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('corporate_reference_matter_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setMatterTypes(data || []);
    } catch (err: any) {
      console.error('Error fetching matter types:', err);
      setError('Failed to load matter types');
    } finally {
      setLoading(false);
    }
  };

  const filterMatterTypes = () => {
    let filtered = matterTypes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (type) =>
          type.name.toLowerCase().includes(query) ||
          type.description?.toLowerCase().includes(query)
      );
    }

    setFilteredMatterTypes(filtered);
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
    });
    setSelectedMatterType(null);
    setError('');
    setShowCreateDialog(true);
  };

  const handleEdit = (matterType: MatterType) => {
    setFormData({
      name: matterType.name,
      description: matterType.description || '',
      is_active: matterType.is_active,
    });
    setSelectedMatterType(matterType);
    setError('');
    setShowEditDialog(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name) {
      setError('Matter type name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase.from('corporate_reference_matter_types').insert({
        name: formData.name,
        description: formData.description || null,
        is_active: formData.is_active,
      });

      if (error) throw error;

      setShowCreateDialog(false);
      await fetchMatterTypes();
    } catch (err: any) {
      console.error('Error creating matter type:', err);
      setError(err.message || 'Failed to create matter type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedMatterType) return;

    if (!formData.name) {
      setError('Matter type name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('corporate_reference_matter_types')
        .update({
          name: formData.name,
          description: formData.description || null,
          is_active: formData.is_active,
        })
        .eq('id', selectedMatterType.id);

      if (error) throw error;

      setShowEditDialog(false);
      await fetchMatterTypes();
    } catch (err: any) {
      console.error('Error updating matter type:', err);
      setError(err.message || 'Failed to update matter type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (matterType: MatterType) => {
    if (!confirm(`Are you sure you want to delete matter type "${matterType.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('corporate_reference_matter_types')
        .delete()
        .eq('id', matterType.id);

      if (error) throw error;
      await fetchMatterTypes();
    } catch (err: any) {
      console.error('Error deleting matter type:', err);
      alert('Failed to delete matter type. It may be in use by existing matters.');
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
              <h1 className="text-3xl font-bold text-emerald-900">Matter Types</h1>
              <p className="text-emerald-700 mt-1">
                {filteredMatterTypes.length} type{filteredMatterTypes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} className="bg-gradient-to-r from-emerald-600 to-teal-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Matter Type
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search matter types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Matter Types Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Matter Types
            </CardTitle>
            <CardDescription>Manage types of corporate matters</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMatterTypes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">
                  {searchQuery ? 'No matter types match your search' : 'No matter types found'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Description</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Created</th>
                      <th className="text-right p-3 text-sm font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMatterTypes.map((matterType) => (
                      <tr key={matterType.id} className="border-b hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-medium text-slate-900">{matterType.name}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-slate-600">
                            {matterType.description || '-'}
                          </p>
                        </td>
                        <td className="p-3">
                          {matterType.is_active ? (
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
                            {format(new Date(matterType.created_at), 'MMM dd, yyyy')}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(matterType)}
                              title="Edit matter type"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(matterType)}
                              title="Delete matter type"
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
              <DialogTitle>Create New Matter Type</DialogTitle>
              <DialogDescription>Add a new type of corporate matter</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Matter Type Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Land Acquisition"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this matter type..."
                  rows={3}
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
                {submitting ? 'Creating...' : 'Create Matter Type'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Matter Type</DialogTitle>
              <DialogDescription>Update matter type information</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">
                  Matter Type Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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
