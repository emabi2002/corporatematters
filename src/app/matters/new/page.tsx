'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { DatePicker } from '@/components/DatePicker';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { addDays, format } from 'date-fns';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

import {
  MATTER_TYPES,
  REQUEST_FORMS,
  REQUEST_TYPES,
  LEASE_TYPES,
} from '@/lib/constants';

export default function NewMatterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [officers, setOfficers] = useState<Profile[]>([]);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    type_of_matter: '',
    request_form: '',
    requester_name: '',
    requester_position: '',
    requesting_division: '',
    request_type: '',
    land_description: '',
    zoning: '',
    survey_plan_no: '',
    lease_type: '',
    legal_issues: '',
    organisation_responsible: '',
    assigned_officer: '',
  });

  const [dateRequested, setDateRequested] = useState<Date>();
  const [dateReceived, setDateReceived] = useState<Date>();
  const [leaseCommencement, setLeaseCommencement] = useState<Date>();
  const [leaseExpiry, setLeaseExpiry] = useState<Date>();

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['legal_officer', 'senior_legal_officer', 'deputy_secretary', 'secretary'])
        .order('full_name');

      if (error) throw error;
      setOfficers(data || []);
    } catch (err) {
      console.error('Error fetching officers:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!dateRequested || !dateReceived) {
        throw new Error('Request date and received date are required');
      }

      // Calculate due date (14 days from date received)
      const dueDate = addDays(dateReceived, 14);

      // Prepare data
      const matterData = {
        ...formData,
        date_requested: format(dateRequested, 'yyyy-MM-dd'),
        date_received: format(dateReceived, 'yyyy-MM-dd'),
        due_date: format(dueDate, 'yyyy-MM-dd'),
        assigned_date: formData.assigned_officer ? format(new Date(), 'yyyy-MM-dd') : null,
        lease_commencement: leaseCommencement ? format(leaseCommencement, 'yyyy-MM-dd') : null,
        lease_expiry: leaseExpiry ? format(leaseExpiry, 'yyyy-MM-dd') : null,
        created_by: user?.id,
        status: 'Pending',
      };

      const { data, error: insertError } = await supabase
        .from('corporate_matters')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(matterData as any)
        .select()
        .single();

      if (insertError) throw insertError;

      const matter = data as Matter;
      router.push(`/matters/${matter.id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to create matter');
      console.error('Error creating matter:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Register New Matter</h1>
          <p className="text-slate-600 mt-1">Step 2: Register and assign corporate legal matter</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about the matter and request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type_of_matter">
                    Type of Corporate Matter <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type_of_matter}
                    onValueChange={(value) => handleInputChange('type_of_matter', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select matter type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATTER_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request_form">
                    Form of Request <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.request_form}
                    onValueChange={(value) => handleInputChange('request_form', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select request form" />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUEST_FORMS.map((form) => (
                        <SelectItem key={form} value={form}>
                          {form}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requester_name">
                    Requester Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="requester_name"
                    value={formData.requester_name}
                    onChange={(e) => handleInputChange('requester_name', e.target.value)}
                    placeholder="Full name of requesting person"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requester_position">Requester Position</Label>
                  <Input
                    id="requester_position"
                    value={formData.requester_position}
                    onChange={(e) => handleInputChange('requester_position', e.target.value)}
                    placeholder="Position/title of requester"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requesting_division">Requesting Division</Label>
                <Input
                  id="requesting_division"
                  value={formData.requesting_division}
                  onChange={(e) => handleInputChange('requesting_division', e.target.value)}
                  placeholder="Division or department making the request"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Date of Request <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    date={dateRequested}
                    onSelect={setDateRequested}
                    placeholder="When was the request made?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Date Request Received <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    date={dateReceived}
                    onSelect={setDateReceived}
                    placeholder="When was it received by DLPP?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_type">
                  Type of Request <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.request_type}
                  onValueChange={(value) => handleInputChange('request_type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Land/Lease Details (Optional) */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Land & Lease Details</CardTitle>
              <CardDescription>Optional - Complete if matter involves land or leases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="land_description">Land Description</Label>
                <Textarea
                  id="land_description"
                  value={formData.land_description}
                  onChange={(e) => handleInputChange('land_description', e.target.value)}
                  placeholder="Description of the land involved"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zoning">Zoning</Label>
                  <Input
                    id="zoning"
                    value={formData.zoning}
                    onChange={(e) => handleInputChange('zoning', e.target.value)}
                    placeholder="Zoning classification"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="survey_plan_no">Survey Plan No.</Label>
                  <Input
                    id="survey_plan_no"
                    value={formData.survey_plan_no}
                    onChange={(e) => handleInputChange('survey_plan_no', e.target.value)}
                    placeholder="Survey plan number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lease_type">Lease Type</Label>
                  <Select
                    value={formData.lease_type}
                    onValueChange={(value) => handleInputChange('lease_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lease type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEASE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lease Commencement</Label>
                  <DatePicker
                    date={leaseCommencement}
                    onSelect={setLeaseCommencement}
                    placeholder="Lease start date"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lease Expiry</Label>
                  <DatePicker
                    date={leaseExpiry}
                    onSelect={setLeaseExpiry}
                    placeholder="Lease end date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matter Details & Assignment */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Matter Details & Assignment</CardTitle>
              <CardDescription>Legal issues and officer assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legal_issues">Legal Issues</Label>
                <Textarea
                  id="legal_issues"
                  value={formData.legal_issues}
                  onChange={(e) => handleInputChange('legal_issues', e.target.value)}
                  placeholder="Describe the legal issues involved..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organisation_responsible">Division/Organisation Responsible</Label>
                <Input
                  id="organisation_responsible"
                  value={formData.organisation_responsible}
                  onChange={(e) => handleInputChange('organisation_responsible', e.target.value)}
                  placeholder="Which division/organisation is handling this?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_officer">DLPP Action Officer</Label>
                <Select
                  value={formData.assigned_officer}
                  onValueChange={(value) => handleInputChange('assigned_officer', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select officer to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {officers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.full_name || officer.email}
                        {officer.role && ` (${officer.role.replace('_', ' ')})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">
                  Due date will automatically be set to 14 days from date received
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register Matter'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
