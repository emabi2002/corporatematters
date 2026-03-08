'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePermissions } from '@/hooks/usePermissions';
import { createClient } from '@/lib/supabase';
import { Building2, FileText, Upload, Tag, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReferenceDataPage() {
  const router = useRouter();
  const { canManageReferenceData } = usePermissions();
  const supabase = createClient();

  const [divisions, setDivisions] = useState<any[]>([]);
  const [matterTypes, setMatterTypes] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [dialogType, setDialogType] = useState<'division' | 'matterType' | 'documentType'>('division');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!canManageReferenceData()) {
      router.push('/admin');
    } else {
      fetchData();
    }
  }, [canManageReferenceData, router]);

  const fetchData = async () => {
    try {
      const [divisionsRes, matterTypesRes, documentTypesRes] = await Promise.all([
        supabase.from('corporate_reference_divisions').select('*').order('name'),
        supabase.from('corporate_reference_matter_types').select('*').order('name'),
        supabase.from('corporate_reference_document_types').select('*').order('name'),
      ]);

      setDivisions(divisionsRes.data || []);
      setMatterTypes(matterTypesRes.data || []);
      setDocumentTypes(documentTypesRes.data || []);
    } catch (error) {
      console.error('Error fetching reference data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (type: typeof dialogType) => {
    setDialogType(type);
    setDialogMode('create');
    setFormData({ name: '', description: '' });
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (type: typeof dialogType, item: any) => {
    setDialogType(type);
    setDialogMode('edit');
    setFormData({ name: item.name || '', description: item.description || '' });
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const tableName =
        dialogType === 'division'
          ? 'corporate_reference_divisions'
          : dialogType === 'matterType'
          ? 'corporate_reference_matter_types'
          : 'corporate_reference_document_types';

      if (dialogMode === 'create') {
        const { error } = await supabase.from(tableName).insert([formData]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(tableName).update(formData).eq('id', selectedItem.id);
        if (error) throw error;
      }

      await fetchData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save');
    }
  };

  const handleDelete = async (type: typeof dialogType, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const tableName =
        type === 'division'
          ? 'corporate_reference_divisions'
          : type === 'matterType'
          ? 'corporate_reference_matter_types'
          : 'corporate_reference_document_types';

      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;

      await fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete');
    }
  };

  if (!canManageReferenceData()) return null;

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
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Reference Data Management</h1>
            <p className="text-emerald-700 mt-1">Manage divisions, matter types, and document types</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Divisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{divisions.length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Matter Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{matterTypes.length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Document Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{documentTypes.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="divisions">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="divisions">Divisions</TabsTrigger>
            <TabsTrigger value="matterTypes">Matter Types</TabsTrigger>
            <TabsTrigger value="documentTypes">Document Types</TabsTrigger>
          </TabsList>

          {/* Divisions Tab */}
          <TabsContent value="divisions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Divisions</CardTitle>
                  <Button onClick={() => handleCreate('division')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Division
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Description</th>
                      <th className="text-right p-3 text-sm font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {divisions.map((div) => (
                      <tr key={div.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{div.name}</td>
                        <td className="p-3 text-sm text-slate-600">{div.description || 'N/A'}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit('division', div)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete('division', div.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matter Types Tab */}
          <TabsContent value="matterTypes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Matter Types</CardTitle>
                  <Button onClick={() => handleCreate('matterType')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Matter Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Description</th>
                      <th className="text-right p-3 text-sm font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matterTypes.map((type) => (
                      <tr key={type.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{type.name}</td>
                        <td className="p-3 text-sm text-slate-600">{type.description || 'N/A'}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit('matterType', type)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete('matterType', type.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Document Types Tab */}
          <TabsContent value="documentTypes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Document Types</CardTitle>
                  <Button onClick={() => handleCreate('documentType')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Description</th>
                      <th className="text-right p-3 text-sm font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentTypes.map((type) => (
                      <tr key={type.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{type.name}</td>
                        <td className="p-3 text-sm text-slate-600">{type.description || 'N/A'}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit('documentType', type)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete('documentType', type.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CRUD Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' ? 'Create' : 'Edit'}{' '}
                {dialogType === 'division' ? 'Division' : dialogType === 'matterType' ? 'Matter Type' : 'Document Type'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'create' ? 'Add a new' : 'Update the'} reference data item
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description (optional)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name}>
                {dialogMode === 'create' ? 'Create' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
