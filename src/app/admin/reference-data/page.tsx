'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto" />
            <p className="mt-3 text-sm text-slate-600">Loading reference data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">Reference Data Management</h1>
            <p className="text-sm text-slate-500">Manage divisions, matter types, and document types</p>
          </div>
        </div>

        {/* Stats tiles */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Divisions', value: divisions.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Matter Types', value: matterTypes.length, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Document Types', value: documentTypes.length, icon: Upload, color: 'text-orange-600', bg: 'bg-orange-50' },
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

        {/* Tabs */}
        <Tabs defaultValue="divisions">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="divisions">Divisions</TabsTrigger>
            <TabsTrigger value="matterTypes">Matter Types</TabsTrigger>
            <TabsTrigger value="documentTypes">Document Types</TabsTrigger>
          </TabsList>

          {/* Divisions Tab */}
          <TabsContent value="divisions">
            <Card className="border-slate-200">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Divisions
                    <span className="text-xs font-normal text-slate-400">{divisions.length}</span>
                  </CardTitle>
                  <Button onClick={() => handleCreate('division')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Division
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-2 text-xs font-medium text-slate-500">Name</th>
                      <th className="text-left p-2 text-xs font-medium text-slate-500">Description</th>
                      <th className="text-right p-2 text-xs font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {divisions.map((div) => (
                      <tr key={div.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2 text-xs font-medium text-slate-900">{div.name}</td>
                        <td className="p-2 text-xs text-slate-600">{div.description || 'N/A'}</td>
                        <td className="p-2">
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
            <Card className="border-slate-200">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                    <FileText className="h-4 w-4 text-green-600" />
                    Matter Types
                    <span className="text-xs font-normal text-slate-400">{matterTypes.length}</span>
                  </CardTitle>
                  <Button onClick={() => handleCreate('matterType')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Matter Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-2 text-xs font-medium text-slate-500">Name</th>
                      <th className="text-left p-2 text-xs font-medium text-slate-500">Description</th>
                      <th className="text-right p-2 text-xs font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matterTypes.map((type) => (
                      <tr key={type.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2 text-xs font-medium text-slate-900">{type.name}</td>
                        <td className="p-2 text-xs text-slate-600">{type.description || 'N/A'}</td>
                        <td className="p-2">
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
            <Card className="border-slate-200">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                    <Upload className="h-4 w-4 text-orange-600" />
                    Document Types
                    <span className="text-xs font-normal text-slate-400">{documentTypes.length}</span>
                  </CardTitle>
                  <Button onClick={() => handleCreate('documentType')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-2 text-xs font-medium text-slate-500">Name</th>
                      <th className="text-left p-2 text-xs font-medium text-slate-500">Description</th>
                      <th className="text-right p-2 text-xs font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentTypes.map((type) => (
                      <tr key={type.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2 text-xs font-medium text-slate-900">{type.name}</td>
                        <td className="p-2 text-xs text-slate-600">{type.description || 'N/A'}</td>
                        <td className="p-2">
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
