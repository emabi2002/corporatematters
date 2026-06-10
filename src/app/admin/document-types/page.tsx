'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_LABELS } from '@/lib/workflow-constants';
import type { Database } from '@/lib/database.types';
import {
  File,
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

type DocumentType = Database['public']['Tables']['corporate_reference_document_types']['Row'];

export default function DocumentTypesPage() {
  const router = useRouter();
  const { canManageReferenceData } = usePermissions();
  const supabase = createClient();

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [filteredDocumentTypes, setFilteredDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '' as string,
    is_active: true,
  });

  useEffect(() => {
    if (!canManageReferenceData()) {
      router.push('/admin');
    } else {
      fetchDocumentTypes();
    }
  }, [canManageReferenceData, router]);

  useEffect(() => {
    filterDocumentTypes();
  }, [searchQuery, documentTypes]);

  const fetchDocumentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('corporate_reference_document_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setDocumentTypes(data || []);
    } catch (err: any) {
      console.error('Error fetching document types:', err);
      setError('Failed to load document types');
    } finally {
      setLoading(false);
    }
  };

  const filterDocumentTypes = () => {
    let filtered = documentTypes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (type) =>
          type.name.toLowerCase().includes(query) ||
          type.category?.toLowerCase().includes(query)
      );
    }

    setFilteredDocumentTypes(filtered);
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      category: '',
      is_active: true,
    });
    setSelectedDocumentType(null);
    setError('');
    setShowCreateDialog(true);
  };

  const handleEdit = (documentType: DocumentType) => {
    setFormData({
      name: documentType.name,
      category: documentType.category || '',
      is_active: documentType.is_active,
    });
    setSelectedDocumentType(documentType);
    setError('');
    setShowEditDialog(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name) {
      setError('Document type name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase.from('corporate_reference_document_types').insert({
        name: formData.name,
        category: formData.category || null,
        is_active: formData.is_active,
      });

      if (error) throw error;

      setShowCreateDialog(false);
      await fetchDocumentTypes();
    } catch (err: any) {
      console.error('Error creating document type:', err);
      setError(err.message || 'Failed to create document type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedDocumentType) return;

    if (!formData.name) {
      setError('Document type name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('corporate_reference_document_types')
        .update({
          name: formData.name,
          category: formData.category || null,
          is_active: formData.is_active,
        })
        .eq('id', selectedDocumentType.id);

      if (error) throw error;

      setShowEditDialog(false);
      await fetchDocumentTypes();
    } catch (err: any) {
      console.error('Error updating document type:', err);
      setError(err.message || 'Failed to update document type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (documentType: DocumentType) => {
    if (!confirm(`Are you sure you want to delete document type "${documentType.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('corporate_reference_document_types')
        .delete()
        .eq('id', documentType.id);

      if (error) throw error;
      await fetchDocumentTypes();
    } catch (err: any) {
      console.error('Error deleting document type:', err);
      alert('Failed to delete document type. It may be in use by existing documents.');
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
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Document Types</h1>
              <p className="text-sm text-slate-500">
                {filteredDocumentTypes.length} type{filteredDocumentTypes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Document Type
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-3">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search document types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Types Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5 text-emerald-600" />
              Document Types
            </CardTitle>
            <CardDescription>Manage types of documents used in corporate matters</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDocumentTypes.length === 0 ? (
              <div className="text-center py-12">
                <File className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">
                  {searchQuery ? 'No document types match your search' : 'No document types found'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Category</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Created</th>
                      <th className="text-right p-3 text-sm font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocumentTypes.map((documentType) => (
                      <tr key={documentType.id} className="border-b hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-medium text-slate-900">{documentType.name}</p>
                        </td>
                        <td className="p-3">
                          {documentType.category ? (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                              {DOCUMENT_CATEGORY_LABELS[documentType.category as keyof typeof DOCUMENT_CATEGORY_LABELS] || documentType.category}
                            </Badge>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          {documentType.is_active ? (
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
                            {format(new Date(documentType.created_at), 'MMM dd, yyyy')}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(documentType)}
                              title="Edit document type"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(documentType)}
                              title="Delete document type"
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
              <DialogTitle>Create New Document Type</DialogTitle>
              <DialogDescription>Add a new type of document</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Document Type Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Legal Opinion"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {submitting ? 'Creating...' : 'Create Document Type'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Document Type</DialogTitle>
              <DialogDescription>Update document type information</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">
                  Document Type Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
