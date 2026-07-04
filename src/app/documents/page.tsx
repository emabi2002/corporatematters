'use client';

import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { HelpButton } from '@/components/help/HelpButton';
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Search,
  X,
  FileCheck,
  FilePen,
  Files,
  Upload,
  Pencil,
  Trash2,
} from 'lucide-react';
import { DOCUMENT_TYPES } from '@/lib/constants';

type DocRow = Database['public']['Tables']['corporate_matter_documents']['Row'];
type MatterLite = { id: string; matter_number: string; subject: string | null };

const NONE = '__none__';
type Stage = 'none' | 'draft' | 'final';

function stageOf(d: DocRow): Stage {
  if (d.is_final) return 'final';
  if (d.is_draft) return 'draft';
  return 'none';
}

export default function DocumentsPage() {
  const supabase = createClient();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocRow[]>([]);
  const [matters, setMatters] = useState<Record<string, MatterLite>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'final' | 'draft'>('all');

  // CRUD dialog state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState<DocRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    matterId: '',
    title: '',
    docType: '',
    stage: 'none' as Stage,
    file: null as File | null,
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, mattersRes] = await Promise.all([
        supabase
          .from('corporate_matter_documents')
          .select('*')
          .order('uploaded_at', { ascending: false }),
        supabase.from('corporate_matters').select('id, matter_number, subject').order('matter_number'),
      ]);
      if (docsRes.error) throw docsRes.error;
      setDocuments(docsRes.data || []);
      const map: Record<string, MatterLite> = {};
      (mattersRes.data || []).forEach((m) => {
        map[m.id] = m as MatterLite;
      });
      setMatters(map);
    } catch (e) {
      console.error('Error loading documents', e);
      toast.error('Could not load documents');
    } finally {
      setLoading(false);
    }
  };

  const mattersList = useMemo(
    () => Object.values(matters).sort((a, b) => a.matter_number.localeCompare(b.matter_number)),
    [matters]
  );

  const openUpload = () => {
    setEditing(null);
    setForm({ matterId: '', title: '', docType: '', stage: 'none', file: null });
    setUploadOpen(true);
  };

  const openEdit = (doc: DocRow) => {
    setEditing(doc);
    setForm({
      matterId: doc.matter_id,
      title: doc.title,
      docType: doc.doc_type || '',
      stage: stageOf(doc),
      file: null,
    });
    setUploadOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, file: f, title: prev.title || (f?.name ?? '') }));
  };

  const handleSubmit = async () => {
    if (editing) {
      // Update metadata only
      if (!form.title.trim()) {
        toast.error('Please enter a title');
        return;
      }
      setSubmitting(true);
      try {
        const { error } = await supabase
          .from('corporate_matter_documents')
          .update({
            title: form.title.trim(),
            doc_type: form.docType || null,
            is_final: form.stage === 'final',
            is_draft: form.stage === 'draft',
          })
          .eq('id', editing.id);
        if (error) throw error;
        toast.success('Document updated');
        setUploadOpen(false);
        fetchData();
      } catch (e) {
        console.error('Error updating document', e);
        toast.error('Failed to update document');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Create (upload)
    if (!form.matterId) {
      toast.error('Please select a matter');
      return;
    }
    if (!form.file || !form.title.trim()) {
      toast.error('Please choose a file and enter a title');
      return;
    }
    setSubmitting(true);
    try {
      const ext = form.file.name.split('.').pop();
      const path = `${form.matterId}/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('corporate-matters')
        .upload(path, form.file);
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('corporate_matter_documents').insert({
        matter_id: form.matterId,
        title: form.title.trim(),
        doc_type: form.docType || null,
        storage_path: uploadData.path,
        file_size: form.file.size,
        mime_type: form.file.type,
        uploaded_by: user?.id ?? null,
        is_final: form.stage === 'final',
        is_draft: form.stage === 'draft',
      } as never);
      if (insertError) throw insertError;

      toast.success('Document uploaded');
      setUploadOpen(false);
      fetchData();
    } catch (e) {
      console.error('Error uploading document', e);
      const msg = e instanceof Error ? e.message : 'Failed to upload document';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (doc: DocRow) => {
    try {
      const { data, error } = await supabase.storage
        .from('corporate-matters')
        .download(doc.storage_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('This file is not available for download');
    }
  };

  const handleDelete = async (doc: DocRow) => {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    try {
      // Best-effort storage removal (ignore failures for metadata-only rows)
      await supabase.storage.from('corporate-matters').remove([doc.storage_path]);
      const { error } = await supabase.from('corporate_matter_documents').delete().eq('id', doc.id);
      if (error) throw error;
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success('Document deleted');
    } catch (e) {
      console.error('Error deleting document', e);
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '—';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const finalCount = documents.filter((d) => d.is_final).length;
  const draftCount = documents.filter((d) => d.is_draft).length;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthCount = documents.filter((d) => new Date(d.uploaded_at) >= startOfMonth).length;

  const filtered = useMemo(() => {
    let list = [...documents];
    if (filter === 'final') list = list.filter((d) => d.is_final);
    if (filter === 'draft') list = list.filter((d) => d.is_draft);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) => {
        const m = matters[d.matter_id];
        return (
          d.title.toLowerCase().includes(q) ||
          d.doc_type?.toLowerCase().includes(q) ||
          m?.matter_number.toLowerCase().includes(q) ||
          m?.subject?.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [documents, matters, search, filter]);

  const tiles = [
    { label: 'Total', value: documents.length, icon: Files, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Final', value: finalCount, icon: FileCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Drafts', value: draftCount, icon: FilePen, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'This Month', value: monthCount, icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
  ] as const;

  const pills = [
    { key: 'all' as const, label: 'All', count: documents.length },
    { key: 'final' as const, label: 'Final', count: finalCount },
    { key: 'draft' as const, label: 'Drafts', count: draftCount },
  ];

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
            <p className="text-sm text-slate-500">
              Every document across all matters · {filtered.length} shown
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <HelpButton variant="inline" articleId="documents" label="Help" />
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openUpload} data-tour="documents-upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.label} className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 truncate">{t.label}</p>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">{t.value}</p>
                    </div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${t.bg}`}>
                      <Icon className={`h-5 w-5 ${t.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search + pills */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2" data-tour="documents-search">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, type, or matter..."
              className="pl-10 h-9 bg-slate-50 border-slate-200 focus:bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {pills.map((p) => {
              const active = filter === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setFilter(p.key)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  {p.label}
                  <span
                    className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <Card className="border-slate-200">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">
                  {search || filter !== 'all' ? 'No documents match your filters' : 'No documents yet'}
                </p>
                {!search && filter === 'all' && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={openUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload the first document
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto" data-tour="documents-table">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Title</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Matter</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Size</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Uploaded</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((doc) => {
                      const m = matters[doc.matter_id];
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-slate-900 truncate max-w-[260px]" title={doc.title}>
                                {doc.title}
                              </span>
                              {doc.is_final && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] py-0 px-1.5">Final</Badge>
                              )}
                              {doc.is_draft && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] py-0 px-1.5">Draft</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-slate-600">{doc.doc_type || '—'}</td>
                          <td className="px-3 py-2 text-sm">
                            {m ? (
                              <Link href={`/matters/${doc.matter_id}`} className="font-medium text-emerald-700 hover:text-emerald-900 hover:underline">
                                {m.matter_number}
                              </Link>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm text-slate-600">{formatFileSize(doc.file_size)}</td>
                          <td className="px-3 py-2 text-sm text-slate-600">
                            {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-emerald-700"
                                onClick={() => handleDownload(doc)}
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-emerald-700"
                                onClick={() => openEdit(doc)}
                                title="Edit details"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(doc)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload / Edit dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Document' : 'Upload Document'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the document details.' : 'Upload a file and link it to a matter.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editing && (
              <>
                <div className="space-y-2">
                  <Label>
                    Matter <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.matterId}
                    onValueChange={(v) => setForm((f) => ({ ...f, matterId: v }))}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a matter" />
                    </SelectTrigger>
                    <SelectContent>
                      {mattersList.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.matter_number} — {m.subject || 'Untitled'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    File <span className="text-red-500">*</span>
                  </Label>
                  <Input type="file" onChange={handleFileChange} disabled={submitting} />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Document title"
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  Document Type
                  <HelpTooltip id="document-type" />
                </Label>
                <Select
                  value={form.docType || NONE}
                  onValueChange={(v) => setForm((f) => ({ ...f, docType: v === NONE ? '' : v }))}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {DOCUMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  Stage
                  <HelpTooltip id="document-category" />
                </Label>
                <Select
                  value={form.stage}
                  onValueChange={(v) => setForm((f) => ({ ...f, stage: v as Stage }))}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Standard</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
