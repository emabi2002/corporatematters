'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { HelpButton } from '@/components/help/HelpButton';
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
import { DatePicker } from '@/components/DatePicker';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { addDays, format } from 'date-fns';
import { ArrowLeft, ArrowRight, Check, FileText, User, ClipboardList, Upload } from 'lucide-react';
import {
  PRIORITIES,
  CONFIDENTIALITY_LEVELS,
  WORKFLOW_STAGES,
  MATTER_STATUS,
  ACTION_TYPES,
  SLA_CONSTANTS,
} from '@/lib/workflow-constants';
import { useReferenceData } from '@/lib/reference-data';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface FormData {
  // Step 1: Basic Information
  subject: string;
  summary: string;
  type_of_matter: string;
  priority: string;
  confidentiality_level: string;

  // Step 2: Requester Details
  requester_name: string;
  requester_position: string;
  requesting_division: string;
  requesting_organization: string;
  date_requested: Date | undefined;
  date_received: Date | undefined;

  // Step 3: Request Information & Land Details
  request_form: string;
  request_type: string;
  land_description: string;
  file_reference: string;
  title_description: string;
  survey_plan_no: string;
  zoning: string;
  lease_type: string;
  lease_commencement: Date | undefined;
  lease_expiry: Date | undefined;
  legal_issues: string;

  // Assignment
  assigned_officer: string;
  organisation_responsible: string;
}

const initialFormData: FormData = {
  subject: '',
  summary: '',
  type_of_matter: '',
  priority: PRIORITIES.NORMAL,
  confidentiality_level: CONFIDENTIALITY_LEVELS.INTERNAL,
  requester_name: '',
  requester_position: '',
  requesting_division: '',
  requesting_organization: '',
  date_requested: undefined,
  date_received: new Date(),
  request_form: '',
  request_type: '',
  land_description: '',
  file_reference: '',
  title_description: '',
  survey_plan_no: '',
  zoning: '',
  lease_type: '',
  lease_commencement: undefined,
  lease_expiry: undefined,
  legal_issues: '',
  assigned_officer: '',
  organisation_responsible: '',
};

export default function NewMatterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const ref = useReferenceData();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [officers, setOfficers] = useState<Profile[]>([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', [
          'legal_officer',
          'senior_legal_officer',
          'legal_officer_corporate',
          'senior_legal_officer_corporate',
          'deputy_secretary',
          'secretary',
        ])
        .order('full_name');

      if (error) throw error;
      setOfficers(data || []);
    } catch (err) {
      console.error('Error fetching officers:', err);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.subject || !formData.type_of_matter) {
          setError('Please fill in subject and matter type');
          return false;
        }
        break;
      case 2:
        if (!formData.requester_name || !formData.date_requested || !formData.date_received) {
          setError('Please fill in requester name and dates');
          return false;
        }
        break;
      case 3:
        if (!formData.request_form || !formData.request_type) {
          setError('Please select request form and type');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');

    try {
      // Calculate due date (14 days from date received)
      const dueDate = formData.date_received
        ? addDays(formData.date_received, SLA_CONSTANTS.DEFAULT_SLA_DAYS)
        : addDays(new Date(), SLA_CONSTANTS.DEFAULT_SLA_DAYS);

      // Prepare matter data
      const matterData = {
        subject: formData.subject,
        summary: formData.summary,
        type_of_matter: formData.type_of_matter,
        priority: formData.priority,
        confidentiality_level: formData.confidentiality_level,
        request_form: formData.request_form,
        requester_name: formData.requester_name,
        requester_position: formData.requester_position || null,
        requesting_division: formData.requesting_division || null,
        requesting_organization: formData.requesting_organization || null,
        date_requested: formData.date_requested ? format(formData.date_requested, 'yyyy-MM-dd') : null,
        date_received: formData.date_received ? format(formData.date_received, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        request_type: formData.request_type,
        land_description: formData.land_description || null,
        file_reference: formData.file_reference || null,
        title_description: formData.title_description || null,
        survey_plan_no: formData.survey_plan_no || null,
        zoning: formData.zoning || null,
        lease_type: formData.lease_type || null,
        lease_commencement: formData.lease_commencement ? format(formData.lease_commencement, 'yyyy-MM-dd') : null,
        lease_expiry: formData.lease_expiry ? format(formData.lease_expiry, 'yyyy-MM-dd') : null,
        legal_issues: formData.legal_issues || null,
        organisation_responsible: formData.organisation_responsible || null,
        assigned_officer: formData.assigned_officer || null,
        assigned_date: formData.assigned_officer ? format(new Date(), 'yyyy-MM-dd') : null,
        due_date: format(dueDate, 'yyyy-MM-dd'),
        sla_days: SLA_CONSTANTS.DEFAULT_SLA_DAYS,
        workflow_stage: WORKFLOW_STAGES.REGISTERED,
        status: MATTER_STATUS.OPEN,
        created_by: user?.id,
      };

      // Insert matter
      const { data: matter, error: matterError } = await supabase
        .from('corporate_matters')
        .insert(matterData as any)
        .select()
        .single();

      if (matterError) throw matterError;

      const matterId = (matter as Matter).id;

      // Upload documents if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${matterId}/${Date.now()}-${file.name}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('corporate-matters')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            continue;
          }

          await supabase.from('corporate_matter_documents').insert({
            matter_id: matterId,
            title: file.name,
            doc_type: 'Initial Request',
            category: 'initial',
            storage_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user?.id,
          } as any);
        }
      }

      // Create activity log entry
      await supabase.from('corporate_matter_activity_logs').insert({
        matter_id: matterId,
        user_id: user?.id,
        action_type: ACTION_TYPES.CREATED,
        action_description: `Matter registered: ${formData.subject}`,
        new_value: WORKFLOW_STAGES.REGISTERED,
      } as any);

      // If assigned, create assignment record
      if (formData.assigned_officer) {
        await supabase.from('corporate_matter_assignments').insert({
          matter_id: matterId,
          assigned_to: formData.assigned_officer,
          assigned_by: user?.id,
          instructions: 'Initial assignment',
          due_date: format(dueDate, 'yyyy-MM-dd'),
          is_current: true,
        } as any);

        // Create notification for assigned officer
        await supabase.from('corporate_matter_notifications').insert({
          matter_id: matterId,
          user_id: formData.assigned_officer,
          notification_type: 'matter_assigned',
          title: 'New Matter Assigned',
          message: `You have been assigned: ${formData.subject}`,
          priority: formData.priority.toLowerCase(),
          action_url: `/matters/${matterId}`,
        } as any);
      }

      router.push(`/matters/${matterId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create matter');
      console.error('Error creating matter:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information', icon: FileText },
    { number: 2, title: 'Requester Details', icon: User },
    { number: 3, title: 'Request & Land Details', icon: ClipboardList },
    { number: 4, title: 'Initial Documents', icon: Upload },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Register New Matter</h1>
            <p className="text-emerald-700 mt-1">Multi-step workflow registration process</p>
          </div>
          <HelpButton variant="inline" articleId="register-new-matter" label="Help" />
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCompleted
                            ? 'bg-green-600 border-green-600 text-white'
                            : isActive
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                      </div>
                      <p
                        className={`mt-2 text-sm font-medium text-center ${
                          isActive ? 'text-emerald-900' : isCompleted ? 'text-green-700' : 'text-slate-500'
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-4 transition-colors ${
                          currentStep > step.number ? 'bg-green-600' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Enter the core details of this legal matter'}
              {currentStep === 2 && 'Provide information about who is making this request'}
              {currentStep === 3 && 'Specify the type of request and any land/lease details'}
              {currentStep === 4 && 'Upload initial documents (optional)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4" data-tour="wizard-step-1">
                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => updateFormData('subject', e.target.value)}
                    placeholder="Brief subject line for this matter"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => updateFormData('summary', e.target.value)}
                    placeholder="Optional brief summary of the matter"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type_of_matter" className="flex items-center gap-1.5">
                      Type of Matter <span className="text-red-500">*</span>
                      <HelpTooltip id="matter-type" />
                    </Label>
                    <Select
                      value={formData.type_of_matter}
                      onValueChange={(value) => updateFormData('type_of_matter', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select matter type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ref.matterTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="flex items-center gap-1.5">
                      Priority
                      <HelpTooltip id="priority" />
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => updateFormData('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ref.priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidentiality_level">Confidentiality Level</Label>
                  <Select
                    value={formData.confidentiality_level}
                    onValueChange={(value) => updateFormData('confidentiality_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ref.confidentialityLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Requester Details */}
            {currentStep === 2 && (
              <div className="space-y-4" data-tour="wizard-step-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requester_name">
                      Requester Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="requester_name"
                      value={formData.requester_name}
                      onChange={(e) => updateFormData('requester_name', e.target.value)}
                      placeholder="Full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requester_position">Position/Title</Label>
                    <Input
                      id="requester_position"
                      value={formData.requester_position}
                      onChange={(e) => updateFormData('requester_position', e.target.value)}
                      placeholder="Job title"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requesting_division">Division</Label>
                    <Input
                      id="requesting_division"
                      value={formData.requesting_division}
                      onChange={(e) => updateFormData('requesting_division', e.target.value)}
                      placeholder="Division making the request"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requesting_organization">Organization</Label>
                    <Input
                      id="requesting_organization"
                      value={formData.requesting_organization}
                      onChange={(e) => updateFormData('requesting_organization', e.target.value)}
                      placeholder="Organization (if external)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Date Requested <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                      date={formData.date_requested}
                      onSelect={(date) => updateFormData('date_requested', date)}
                      placeholder="When was the request made?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Date Received <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                      date={formData.date_received}
                      onSelect={(date) => updateFormData('date_received', date)}
                      placeholder="When did DLPP receive it?"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Request & Land Details */}
            {currentStep === 3 && (
              <div className="space-y-6" data-tour="wizard-step-3">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Request Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="request_form">
                        Form of Request <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.request_form}
                        onValueChange={(value) => updateFormData('request_form', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select form" />
                        </SelectTrigger>
                        <SelectContent>
                          {ref.requestForms.map((form) => (
                            <SelectItem key={form} value={form}>
                              {form}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="request_type">
                        Type of Request <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.request_type}
                        onValueChange={(value) => updateFormData('request_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ref.requestTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="legal_issues">Legal Issues / Description</Label>
                    <Textarea
                      id="legal_issues"
                      value={formData.legal_issues}
                      onChange={(e) => updateFormData('legal_issues', e.target.value)}
                      placeholder="Describe the legal issues or details of the request"
                      rows={4}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Land/Lease Details (Optional)</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="land_description">Land Description</Label>
                      <Textarea
                        id="land_description"
                        value={formData.land_description}
                        onChange={(e) => updateFormData('land_description', e.target.value)}
                        placeholder="Description of the land involved"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="file_reference">File Reference</Label>
                        <Input
                          id="file_reference"
                          value={formData.file_reference}
                          onChange={(e) => updateFormData('file_reference', e.target.value)}
                          placeholder="File ref"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="survey_plan_no">Survey Plan No.</Label>
                        <Input
                          id="survey_plan_no"
                          value={formData.survey_plan_no}
                          onChange={(e) => updateFormData('survey_plan_no', e.target.value)}
                          placeholder="Plan number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zoning">Zoning</Label>
                        <Input
                          id="zoning"
                          value={formData.zoning}
                          onChange={(e) => updateFormData('zoning', e.target.value)}
                          placeholder="Zoning type"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lease_type">Lease Type</Label>
                        <Select
                          value={formData.lease_type}
                          onValueChange={(value) => updateFormData('lease_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {ref.leaseTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Lease Commencement</Label>
                        <DatePicker
                          date={formData.lease_commencement}
                          onSelect={(date) => updateFormData('lease_commencement', date)}
                          placeholder="Start date"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Lease Expiry</Label>
                        <DatePicker
                          date={formData.lease_expiry}
                          onSelect={(date) => updateFormData('lease_expiry', date)}
                          placeholder="End date"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Assignment (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assigned_officer">Assign to Officer</Label>
                      <Select
                        value={formData.assigned_officer}
                        onValueChange={(value) => updateFormData('assigned_officer', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select officer (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {officers.map((officer) => (
                            <SelectItem key={officer.id} value={officer.id}>
                              {officer.full_name || officer.email}
                              {officer.role && ` (${officer.role.replace(/_/g, ' ')})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organisation_responsible">Division/Organization Responsible</Label>
                      <Input
                        id="organisation_responsible"
                        value={formData.organisation_responsible}
                        onChange={(e) => updateFormData('organisation_responsible', e.target.value)}
                        placeholder="Who will handle this?"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Initial Documents */}
            {currentStep === 4 && (
              <div className="space-y-4" data-tour="wizard-step-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Optional:</strong> Upload any initial documents such as request letters, memos, emails, or
                    background papers. You can always add more documents later.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documents">Initial Documents</Label>
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-slate-700">Selected files:</p>
                      <ul className="mt-1 space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-emerald-900 mb-2">Review Summary</h4>
                  <dl className="space-y-1 text-sm">
                    <div>
                      <dt className="inline font-medium text-emerald-800">Subject:</dt>
                      <dd className="inline ml-2 text-emerald-700">{formData.subject}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-emerald-800">Type:</dt>
                      <dd className="inline ml-2 text-emerald-700">{formData.type_of_matter}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-emerald-800">Priority:</dt>
                      <dd className="inline ml-2 text-emerald-700">{formData.priority}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-emerald-800">Requester:</dt>
                      <dd className="inline ml-2 text-emerald-700">{formData.requester_name}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-emerald-800">Request Type:</dt>
                      <dd className="inline ml-2 text-emerald-700">{formData.request_type}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-emerald-800">SLA Due Date:</dt>
                      <dd className="inline ml-2 text-emerald-700">
                        {formData.date_received
                          ? format(addDays(formData.date_received, SLA_CONSTANTS.DEFAULT_SLA_DAYS), 'MMMM dd, yyyy')
                          : format(addDays(new Date(), SLA_CONSTANTS.DEFAULT_SLA_DAYS), 'MMMM dd, yyyy')}{' '}
                        (14 days)
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button onClick={nextStep} disabled={loading} className="flex items-center gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {loading ? 'Registering...' : 'Register Matter'}
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
