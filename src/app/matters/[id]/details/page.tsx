'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import {
  WORKFLOW_STAGES,
  ACTION_TYPES,
} from '@/lib/workflow-constants';
import { RISK_CLASSIFICATIONS } from '@/lib/constants';
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { HelpButton } from '@/components/help/HelpButton';
import Link from 'next/link';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];

export default function MatterDetailsCompletionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // File References
    file_reference: '',
    title_description: '',
    title_file_reference: '',
    survey_file_reference: '',
    purchase_documents_reference: '',
    ilg_name: '',
    ilg_file_reference: '',

    // Legal Issues (detailed)
    legal_issues: '',
    claims_allegations: '',
    applicable_law: '',
    relevant_stakeholders: '',

    // Internal
    internal_remarks: '',
    risk_classification: '',
  });

  useEffect(() => {
    fetchMatter();
  }, [params.id]);

  const fetchMatter = async () => {
    try {
      const { data, error } = await supabase
        .from('corporate_matters')
        .select('*')
        .eq('id', params.id as string)
        .single();

      if (error) throw error;

      const fetchedMatter = data as Matter;
      setMatter(fetchedMatter);

      // Pre-fill form with existing data
      setFormData({
        file_reference: fetchedMatter.file_reference || '',
        title_description: fetchedMatter.title_description || '',
        title_file_reference: fetchedMatter.title_file_reference || '',
        survey_file_reference: fetchedMatter.survey_file_reference || '',
        purchase_documents_reference: fetchedMatter.purchase_documents_reference || '',
        ilg_name: fetchedMatter.ilg_name || '',
        ilg_file_reference: fetchedMatter.ilg_file_reference || '',
        legal_issues: fetchedMatter.legal_issues || '',
        claims_allegations: fetchedMatter.claims_allegations || '',
        applicable_law: fetchedMatter.applicable_law || '',
        relevant_stakeholders: fetchedMatter.relevant_stakeholders || '',
        internal_remarks: fetchedMatter.internal_remarks || '',
        risk_classification: fetchedMatter.risk_classification || '',
      });
    } catch (err: any) {
      console.error('Error fetching matter:', err);
      setError('Failed to load matter details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    setError('');

    try {
      const matterId = params.id as string;

      // Update matter with details
      const { error: updateError } = await supabase
        .from('corporate_matters')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', matterId);

      if (updateError) throw updateError;

      // Create activity log
      await supabase.from('corporate_matter_activity_logs').insert({
        matter_id: matterId,
        user_id: user?.id,
        action_type: 'details_updated',
        action_description: 'Matter details updated (draft saved)',
      } as any);

      alert('Details saved successfully!');
      router.push(`/matters/${matterId}`);
    } catch (err: any) {
      console.error('Error saving details:', err);
      setError(err.message || 'Failed to save details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteDetails = async () => {
    setSubmitting(true);
    setError('');

    try {
      const matterId = params.id as string;

      // Update matter with details and change workflow stage
      const { error: updateError } = await supabase
        .from('corporate_matters')
        .update({
          ...formData,
          workflow_stage: WORKFLOW_STAGES.DETAILS_COMPLETED,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', matterId);

      if (updateError) throw updateError;

      // Create activity log
      await supabase.from('corporate_matter_activity_logs').insert({
        matter_id: matterId,
        user_id: user?.id,
        action_type: ACTION_TYPES.WORKFLOW_STAGE_CHANGED,
        action_description: 'Matter details completed',
        old_value: matter?.workflow_stage || '',
        new_value: WORKFLOW_STAGES.DETAILS_COMPLETED,
      } as any);

      // Create status history
      await supabase.from('corporate_matter_status_history').insert({
        matter_id: matterId,
        from_workflow_stage: matter?.workflow_stage || null,
        to_workflow_stage: WORKFLOW_STAGES.DETAILS_COMPLETED,
        changed_by: user?.id,
        reason: 'Officer completed matter details',
      } as any);

      router.push(`/matters/${matterId}`);
    } catch (err: any) {
      console.error('Error completing details:', err);
      setError(err.message || 'Failed to complete details');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/matters/${params.id}`}>
            <Button variant="ghost" size="icon" className="hover:bg-white/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-emerald-900">Complete Matter Details</h1>
            <p className="text-emerald-700 mt-1">{matter.matter_number} - {matter.subject || matter.type_of_matter}</p>
          </div>
          <HelpButton variant="inline" articleId="matter-details" label="Help" />
        </div>

        {/* File References Section */}
        <Card>
          <CardHeader>
            <CardTitle>File References</CardTitle>
            <CardDescription>Document and file reference numbers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="file_reference" className="flex items-center gap-1.5">
                  Main File Reference
                  <HelpTooltip content="Primary DLPP file reference for this matter. Use your office numbering convention (e.g. DLPP/CMS/2024/001)." />
                </Label>
                <Input
                  id="file_reference"
                  value={formData.file_reference}
                  onChange={(e) => updateField('file_reference', e.target.value)}
                  placeholder="e.g., DLPP/CMS/2024/001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_file_reference">Title File Reference</Label>
                <Input
                  id="title_file_reference"
                  value={formData.title_file_reference}
                  onChange={(e) => updateField('title_file_reference', e.target.value)}
                  placeholder="Title reference number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_description">Title Description</Label>
              <Input
                id="title_description"
                value={formData.title_description}
                onChange={(e) => updateField('title_description', e.target.value)}
                placeholder="Description of the title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="survey_file_reference">Survey File Reference</Label>
                <Input
                  id="survey_file_reference"
                  value={formData.survey_file_reference}
                  onChange={(e) => updateField('survey_file_reference', e.target.value)}
                  placeholder="Survey file ref"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_documents_reference">Purchase Documents Reference</Label>
                <Input
                  id="purchase_documents_reference"
                  value={formData.purchase_documents_reference}
                  onChange={(e) => updateField('purchase_documents_reference', e.target.value)}
                  placeholder="Purchase doc ref"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ilg_name">ILG Name (if applicable)</Label>
                <Input
                  id="ilg_name"
                  value={formData.ilg_name}
                  onChange={(e) => updateField('ilg_name', e.target.value)}
                  placeholder="Incorporated Land Group name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ilg_file_reference">ILG File Reference</Label>
                <Input
                  id="ilg_file_reference"
                  value={formData.ilg_file_reference}
                  onChange={(e) => updateField('ilg_file_reference', e.target.value)}
                  placeholder="ILG file ref"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Issues Section */}
        <Card>
          <CardHeader>
            <CardTitle>Legal Issues & Analysis</CardTitle>
            <CardDescription>Structured legal analysis of the matter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="legal_issues" className="flex items-center gap-1.5">
                Legal Issues
                <HelpTooltip content="Set out each legal issue the matter raises, clearly and separately. Stating each as a question (‘Whether…’) helps keep the analysis focused." />
              </Label>
              <Textarea
                id="legal_issues"
                value={formData.legal_issues}
                onChange={(e) => updateField('legal_issues', e.target.value)}
                placeholder="Identify and describe the legal issues involved..."
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="claims_allegations">Claims & Allegations</Label>
              <Textarea
                id="claims_allegations"
                value={formData.claims_allegations}
                onChange={(e) => updateField('claims_allegations', e.target.value)}
                placeholder="List any claims or allegations made..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicable_law" className="flex items-center gap-1.5">
                Applicable Law
                <HelpTooltip content="Cite the legislation, regulations, case law or legal principles that govern the issues. Precise section numbers and citations help reviewers." />
              </Label>
              <Textarea
                id="applicable_law"
                value={formData.applicable_law}
                onChange={(e) => updateField('applicable_law', e.target.value)}
                placeholder="Cite relevant legislation, case law, or legal principles..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relevant_stakeholders">Relevant Stakeholders</Label>
              <Textarea
                id="relevant_stakeholders"
                value={formData.relevant_stakeholders}
                onChange={(e) => updateField('relevant_stakeholders', e.target.value)}
                placeholder="List all relevant parties, organizations, or stakeholders..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Internal Notes & Risk Section */}
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes & Risk Assessment</CardTitle>
            <CardDescription>For internal use only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="internal_remarks">Internal Remarks</Label>
              <Textarea
                id="internal_remarks"
                value={formData.internal_remarks}
                onChange={(e) => updateField('internal_remarks', e.target.value)}
                placeholder="Internal notes, observations, or recommendations..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk_classification" className="flex items-center gap-1.5">
                Risk Classification
                <HelpTooltip id="risk-classification" />
              </Label>
              <Select
                value={formData.risk_classification}
                onValueChange={(value) => updateField('risk_classification', value)}
              >
                <SelectTrigger id="risk_classification">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  {RISK_CLASSIFICATIONS.map((risk) => (
                    <SelectItem key={risk} value={risk}>
                      {risk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500">
                Assess the level of legal or reputational risk
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pb-8">
          <Link href={`/matters/${params.id}`}>
            <Button variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </Link>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={submitting}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>

            <Button
              onClick={handleCompleteDetails}
              disabled={submitting}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <CheckCircle className="h-4 w-4" />
              {submitting ? 'Completing...' : 'Complete Details'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
