'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, Lock, FileCheck, CheckCircle2, FileText } from 'lucide-react';
import {
  WORKFLOW_STAGES,
  MATTER_STATUS,
  ACTION_TYPES,
} from '@/lib/workflow-constants';
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { HelpButton } from '@/components/help/HelpButton';
import Link from 'next/link';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];
type Document = Database['public']['Tables']['corporate_matter_documents']['Row'];
type Task = Database['public']['Tables']['corporate_matter_tasks']['Row'];

export default function CloseMatterPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [matter, setMatter] = useState<Matter | null>(null);
  const [finalDocuments, setFinalDocuments] = useState<Document[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    closure_reason: '',
    closure_notes: '',
    final_output_verified: false,
    archived: false,
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const matterId = params.id as string;

      // Fetch matter
      const { data: matterData, error: matterError } = await supabase
        .from('corporate_matters')
        .select('*')
        .eq('id', matterId)
        .single();

      if (matterError) throw matterError;
      setMatter(matterData as Matter);

      // Fetch final documents
      const { data: docsData, error: docsError } = await supabase
        .from('corporate_matter_documents')
        .select('*')
        .eq('matter_id', matterId)
        .eq('is_final', true)
        .order('uploaded_at', { ascending: false });

      if (docsError) throw docsError;
      setFinalDocuments(docsData || []);

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('corporate_matter_tasks')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load matter details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMatter = async () => {
    if (!formData.final_output_verified) {
      setError('Please verify that final outputs have been delivered');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const matterId = params.id as string;

      // Create closure record
      const { error: closureError } = await supabase
        .from('corporate_matter_closures')
        .insert({
          matter_id: matterId,
          closed_by: user?.id,
          closure_reason: formData.closure_reason || null,
          notes: formData.closure_notes || null,
          final_output_verified: formData.final_output_verified,
          archived: formData.archived,
          archived_at: formData.archived ? new Date().toISOString() : null,
        } as any);

      if (closureError) throw closureError;

      // Update matter
      const { error: updateError } = await supabase
        .from('corporate_matters')
        .update({
          workflow_stage: WORKFLOW_STAGES.CLOSED,
          status: MATTER_STATUS.CLOSED,
          closed_at: new Date().toISOString(),
          closed_by: user?.id,
          closure_notes: formData.closure_notes || null,
        } as any)
        .eq('id', matterId);

      if (updateError) throw updateError;

      // Create activity log
      await supabase.from('corporate_matter_activity_logs').insert({
        matter_id: matterId,
        user_id: user?.id,
        action_type: ACTION_TYPES.MATTER_CLOSED,
        action_description: `Matter closed: ${formData.closure_reason || 'Completed'}`,
        old_value: matter?.workflow_stage || '',
        new_value: WORKFLOW_STAGES.CLOSED,
      } as any);

      // Create status history
      await supabase.from('corporate_matter_status_history').insert({
        matter_id: matterId,
        from_workflow_stage: matter?.workflow_stage || null,
        to_workflow_stage: WORKFLOW_STAGES.CLOSED,
        from_status: matter?.status || null,
        to_status: MATTER_STATUS.CLOSED,
        changed_by: user?.id,
        reason: formData.closure_reason || 'Matter completed and closed',
      } as any);

      // Notify assigned officer
      if (matter?.assigned_officer) {
        await supabase.from('corporate_matter_notifications').insert({
          matter_id: matterId,
          user_id: matter.assigned_officer,
          notification_type: 'matter_closed',
          title: 'Matter Closed',
          message: `Matter ${matter.matter_number} has been closed`,
          priority: 'normal',
          action_url: `/matters/${matterId}`,
        } as any);
      }

      router.push(`/matters/${matterId}`);
    } catch (err: any) {
      console.error('Error closing matter:', err);
      setError(err.message || 'Failed to close matter');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!matter) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-slate-600">Matter not found</p>
              <Link href="/matters">
                <Button className="mt-4">Back to Matters</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const allTasksCompleted = tasks.length > 0 && tasks.every(t => t.status === 'Completed');
  const hasFinalDocuments = finalDocuments.length > 0;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/matters/${params.id}`}>
            <Button variant="ghost" size="icon" className="hover:bg-white/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-emerald-900">Close Matter</h1>
            <p className="text-emerald-700 mt-1">{matter.matter_number}</p>
          </div>
          <HelpButton variant="inline" articleId="matter-closure" label="Help" />
        </div>

        {/* Matter Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Matter Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium text-slate-700">Subject:</span>
              <span className="ml-2 text-slate-900">{matter.subject || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Type:</span>
              <span className="ml-2 text-slate-900">{matter.type_of_matter}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Current Status:</span>
              <Badge className="ml-2">{matter.workflow_stage}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Closure Checklist */}
        <Card data-tour="closure-checks">
          <CardHeader>
            <CardTitle>Closure Checklist</CardTitle>
            <CardDescription>Verify all requirements before closing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                hasFinalDocuments ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                {hasFinalDocuments ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <FileText className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">Final Documents</p>
                  <p className="text-xs text-slate-600">
                    {hasFinalDocuments
                      ? `${finalDocuments.length} final document(s) uploaded`
                      : 'No final documents uploaded yet'}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                allTasksCompleted ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                {allTasksCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <FileText className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">Tasks Completed</p>
                  <p className="text-xs text-slate-600">
                    {tasks.length > 0
                      ? `${tasks.filter(t => t.status === 'Completed').length} of ${tasks.length} tasks completed`
                      : 'No tasks created'}
                  </p>
                </div>
              </div>
            </div>

            {finalDocuments.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="font-medium text-sm mb-2">Final Documents:</p>
                  <ul className="space-y-1">
                    {finalDocuments.map(doc => (
                      <li key={doc.id} className="text-sm text-slate-600 flex items-center gap-2">
                        <FileCheck className="h-4 w-4" />
                        {doc.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Closure Form */}
        <Card>
          <CardHeader>
            <CardTitle>Closure Details</CardTitle>
            <CardDescription>Provide closure information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="closure_reason">Closure Reason</Label>
              <Select
                value={formData.closure_reason}
                onValueChange={(value) => setFormData(prev => ({ ...prev, closure_reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed Successfully">Completed Successfully</SelectItem>
                  <SelectItem value="Delivered Final Output">Delivered Final Output</SelectItem>
                  <SelectItem value="Matter Resolved">Matter Resolved</SelectItem>
                  <SelectItem value="Withdrawn by Requester">Withdrawn by Requester</SelectItem>
                  <SelectItem value="Superseded">Superseded</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-tour="closure-summary">
              <Label htmlFor="closure_notes" className="flex items-center gap-1.5">
                Closure Notes
                <HelpTooltip content="Summarise the outcome and the deliverable provided, so a future reader understands the matter without opening every tab." />
              </Label>
              <Textarea
                id="closure_notes"
                value={formData.closure_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, closure_notes: e.target.value }))}
                placeholder="Add any final notes or observations about this matter..."
                rows={4}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={formData.final_output_verified}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, final_output_verified: checked as boolean }))
                  }
                />
                <label
                  htmlFor="verified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I verify that final outputs have been delivered <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="archived"
                  checked={formData.archived}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, archived: checked as boolean }))
                  }
                />
                <label
                  htmlFor="archived"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Archive this matter immediately
                </label>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href={`/matters/${params.id}`}>
                <Button variant="outline" disabled={submitting}>
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleCloseMatter}
                disabled={submitting || !formData.final_output_verified}
                data-tour="closure-submit"
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Lock className="h-4 w-4" />
                {submitting ? 'Closing...' : 'Close Matter'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
