'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { HelpLauncher } from '@/components/help/HelpButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays } from 'date-fns';
import { ArrowLeft, UserPlus } from 'lucide-react';
import {
  WORKFLOW_STAGES,
  MATTER_STATUS,
  ACTION_TYPES,
  SLA_CONSTANTS,
} from '@/lib/workflow-constants';
import { notifyMatterAssigned } from '@/lib/notification-helpers';
import Link from 'next/link';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function AssignMatterPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [matter, setMatter] = useState<Matter | null>(null);
  const [officers, setOfficers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    assigned_to: '',
    instructions: '',
    due_date: undefined as Date | undefined,
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      // Fetch matter
      const { data: matterData, error: matterError } = await supabase
        .from('corporate_matters')
        .select('*')
        .eq('id', params.id as string)
        .single();

      if (matterError) throw matterError;
      const fetchedMatter = matterData as Matter;
      setMatter(fetchedMatter);

      // Set default due date from matter's due_date
      if (fetchedMatter.due_date) {
        setFormData((prev) => ({ ...prev, due_date: new Date(fetchedMatter.due_date!) }));
      }

      // Fetch officers
      const { data: officersData, error: officersError } = await supabase
        .from('profiles')
        .select('*')
        .in('role', [
          'legal_officer',
          'senior_legal_officer',
          'legal_officer_corporate',
          'senior_legal_officer_corporate',
          'legal_officer_legislation',
          'deputy_secretary',
          'secretary',
        ])
        .order('full_name');

      if (officersError) throw officersError;
      setOfficers(officersData || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load matter details');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!formData.assigned_to) {
      setError('Please select an officer to assign');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const matterId = params.id as string;

      // Mark previous assignments as not current
      await supabase
        .from('corporate_matter_assignments')
        .update({ is_current: false } as any)
        .eq('matter_id', matterId)
        .eq('is_current', true);

      // Create new assignment
      const assignmentData = {
        matter_id: matterId,
        assigned_to: formData.assigned_to,
        assigned_by: user?.id,
        instructions: formData.instructions || null,
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
        is_current: true,
      };

      const { error: assignError } = await supabase
        .from('corporate_matter_assignments')
        .insert(assignmentData as any);

      if (assignError) throw assignError;

      // Update matter
      const { error: updateError } = await supabase
        .from('corporate_matters')
        .update({
          assigned_officer: formData.assigned_to,
          assigned_date: format(new Date(), 'yyyy-MM-dd'),
          workflow_stage: WORKFLOW_STAGES.ASSIGNED,
          status: MATTER_STATUS.IN_PROGRESS,
          manager_instructions: formData.instructions || null,
          due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : matter?.due_date,
        } as any)
        .eq('id', matterId);

      if (updateError) throw updateError;

      // Create activity log
      await supabase.from('corporate_matter_activity_logs').insert({
        matter_id: matterId,
        user_id: user?.id,
        action_type: ACTION_TYPES.ASSIGNED,
        action_description: `Matter assigned to officer`,
        old_value: matter?.workflow_stage || '',
        new_value: WORKFLOW_STAGES.ASSIGNED,
      } as any);

      // Create status history
      await supabase.from('corporate_matter_status_history').insert({
        matter_id: matterId,
        from_workflow_stage: matter?.workflow_stage || null,
        to_workflow_stage: WORKFLOW_STAGES.ASSIGNED,
        from_status: matter?.status || null,
        to_status: MATTER_STATUS.IN_PROGRESS,
        changed_by: user?.id,
        reason: 'Matter assigned to action officer',
      } as any);

      // Create notification for assigned officer
      await notifyMatterAssigned({
        officerId: formData.assigned_to,
        matterId,
        matterNumber: matter?.matter_number || '',
        matterSubject: matter?.subject || matter?.type_of_matter || '',
        assignedBy: user?.id || '',
      });

      router.push(`/matters/${matterId}`);
    } catch (err: any) {
      console.error('Error assigning matter:', err);
      setError(err.message || 'Failed to assign matter');
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
            <h1 className="text-3xl font-bold text-emerald-900">Assign Matter</h1>
            <p className="text-emerald-700 mt-1">{matter.matter_number}</p>
          </div>
          <HelpLauncher label="Learn more" />
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
              <span className="font-medium text-slate-700">Priority:</span>
              <span className="ml-2 text-slate-900">{matter.priority}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Current Status:</span>
              <span className="ml-2 text-slate-900">{matter.workflow_stage}</span>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>Select an officer and provide instructions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2" data-tour="assign-officer">
              <Label htmlFor="assigned_to" className="flex items-center gap-1.5">
                Assign to Officer <span className="text-red-500">*</span>
                <HelpTooltip
                  title="Assign to Officer"
                  content="The officer who will own and progress this matter. Match the officer to the matter type and current workload — check the Dashboard first."
                />
              </Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, assigned_to: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an officer" />
                </SelectTrigger>
                <SelectContent>
                  {officers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.full_name || officer.email}
                      {officer.role && ` - ${officer.role.replace(/_/g, ' ')}`}
                      {officer.division && ` (${officer.division})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-tour="assign-instructions">
              <Label htmlFor="instructions" className="flex items-center gap-1.5">
                Manager Instructions
                <HelpTooltip
                  title="Manager Instructions"
                  content="State the expected deliverable, not just the task (for example, “Draft advice on…”). These instructions are visible to the assigned officer."
                />
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                placeholder="Provide any specific instructions or guidance for the assigned officer..."
                rows={5}
              />
              <p className="text-sm text-slate-500">
                These instructions will be visible to the assigned officer
              </p>
            </div>

            <div className="space-y-2" data-tour="assign-due-date">
              <Label className="flex items-center gap-1.5">
                Due Date
                <HelpTooltip
                  title="Due Date"
                  content="The target completion date for this assignment. Leave room before any statutory or client deadline so there is time to review the draft."
                />
              </Label>
              <DatePicker
                date={formData.due_date}
                onSelect={(date) => setFormData((prev) => ({ ...prev, due_date: date }))}
                placeholder="Override due date (optional)"
              />
              <p className="text-sm text-slate-500">
                Current SLA due date:{' '}
                {matter.due_date ? format(new Date(matter.due_date), 'MMMM dd, yyyy') : 'Not set'}{' '}
                (Leave blank to keep current)
              </p>
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
                onClick={handleAssign}
                disabled={submitting || !formData.assigned_to}
                data-tour="assign-submit"
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <UserPlus className="h-4 w-4" />
                {submitting ? 'Assigning...' : 'Assign Matter'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
