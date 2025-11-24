'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { format, isBefore } from 'date-fns';
import { ArrowLeft, FileText, CheckCircle2, Clock } from 'lucide-react';
import { DocumentsTab } from '@/components/matter-details/DocumentsTab';
import { TasksTab } from '@/components/matter-details/TasksTab';
import { EditMatterDialog } from '@/components/matter-details/EditMatterDialog';
import Link from 'next/link';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function MatterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [assignedOfficer, setAssignedOfficer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (params.id) {
      fetchMatter();
    }
  }, [params.id]);

  const fetchMatter = async () => {
    try {
      const { data, error } = await supabase
        .from('corporate_matters')
        .select('*')
        .eq('id', params.id as string)
        .single();

      if (error) throw error;

      const matter = data as Matter;
      setMatter(matter);

      if (matter?.assigned_officer) {
        fetchAssignedOfficer(matter.assigned_officer);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching matter:', error);
      setLoading(false);
    }
  };

  const fetchAssignedOfficer = async (officerId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', officerId)
        .single();

      if (error) throw error;
      setAssignedOfficer(data);
    } catch (error) {
      console.error('Error fetching officer:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed':
      case 'Closed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const isOverdue = () => {
    if (!matter?.due_date || matter.status === 'Completed' || matter.status === 'Closed') {
      return false;
    }
    return isBefore(new Date(matter.due_date), new Date());
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading matter...</p>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/matters">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{matter.matter_number}</h1>
            <p className="text-slate-600 mt-1">{matter.type_of_matter}</p>
          </div>
          <EditMatterDialog matter={matter} onUpdate={fetchMatter} />
        </div>

        {/* Status & Alert Badges */}
        <div className="flex gap-2">
          <Badge variant="outline" className={getStatusColor(matter.status)}>
            {matter.status}
          </Badge>
          {isOverdue() && (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
              Overdue
            </Badge>
          )}
        </div>

        {/* Matter Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Matter Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-sm text-slate-500 mb-3">Request Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Form of Request</dt>
                    <dd className="text-sm text-slate-900">{matter.request_form}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Request Type</dt>
                    <dd className="text-sm text-slate-900">{matter.request_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Requester</dt>
                    <dd className="text-sm text-slate-900">
                      {matter.requester_name}
                      {matter.requester_position && ` (${matter.requester_position})`}
                    </dd>
                  </div>
                  {matter.requesting_division && (
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Requesting Division</dt>
                      <dd className="text-sm text-slate-900">{matter.requesting_division}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-slate-500 mb-3">Important Dates</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Date Requested</dt>
                    <dd className="text-sm text-slate-900">
                      {format(new Date(matter.date_requested), 'MMMM dd, yyyy')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Date Received</dt>
                    <dd className="text-sm text-slate-900">
                      {format(new Date(matter.date_received), 'MMMM dd, yyyy')}
                    </dd>
                  </div>
                  {matter.due_date && (
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Due Date</dt>
                      <dd className={`text-sm font-medium ${
                        isOverdue() ? 'text-red-600' : 'text-slate-900'
                      }`}>
                        {format(new Date(matter.due_date), 'MMMM dd, yyyy')}
                        {isOverdue() && ' (Overdue)'}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <Separator />

            {/* Assignment Info */}
            <div>
              <h3 className="font-semibold text-sm text-slate-500 mb-3">Assignment</h3>
              <dl className="space-y-2">
                {assignedOfficer ? (
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Assigned Officer</dt>
                    <dd className="text-sm text-slate-900">
                      {assignedOfficer.full_name || assignedOfficer.email}
                      {assignedOfficer.role && (
                        <span className="text-slate-500 ml-2">
                          ({assignedOfficer.role.replace('_', ' ')})
                        </span>
                      )}
                    </dd>
                  </div>
                ) : (
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Assigned Officer</dt>
                    <dd className="text-sm text-slate-500">Not assigned</dd>
                  </div>
                )}
                {matter.assigned_date && (
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Assigned Date</dt>
                    <dd className="text-sm text-slate-900">
                      {format(new Date(matter.assigned_date), 'MMMM dd, yyyy')}
                    </dd>
                  </div>
                )}
                {matter.organisation_responsible && (
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Organisation Responsible</dt>
                    <dd className="text-sm text-slate-900">{matter.organisation_responsible}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Legal Issues */}
            {matter.legal_issues && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm text-slate-500 mb-2">Legal Issues</h3>
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">{matter.legal_issues}</p>
                </div>
              </>
            )}

            {/* Land/Lease Details */}
            {(matter.land_description || matter.zoning || matter.survey_plan_no || matter.lease_type) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm text-slate-500 mb-3">Land & Lease Details</h3>
                  <dl className="space-y-2">
                    {matter.land_description && (
                      <div>
                        <dt className="text-sm font-medium text-slate-700">Land Description</dt>
                        <dd className="text-sm text-slate-900 whitespace-pre-wrap">
                          {matter.land_description}
                        </dd>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {matter.zoning && (
                        <div>
                          <dt className="text-sm font-medium text-slate-700">Zoning</dt>
                          <dd className="text-sm text-slate-900">{matter.zoning}</dd>
                        </div>
                      )}
                      {matter.survey_plan_no && (
                        <div>
                          <dt className="text-sm font-medium text-slate-700">Survey Plan No.</dt>
                          <dd className="text-sm text-slate-900">{matter.survey_plan_no}</dd>
                        </div>
                      )}
                      {matter.lease_type && (
                        <div>
                          <dt className="text-sm font-medium text-slate-700">Lease Type</dt>
                          <dd className="text-sm text-slate-900">{matter.lease_type}</dd>
                        </div>
                      )}
                    </div>
                    {(matter.lease_commencement || matter.lease_expiry) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matter.lease_commencement && (
                          <div>
                            <dt className="text-sm font-medium text-slate-700">Lease Commencement</dt>
                            <dd className="text-sm text-slate-900">
                              {format(new Date(matter.lease_commencement), 'MMMM dd, yyyy')}
                            </dd>
                          </div>
                        )}
                        {matter.lease_expiry && (
                          <div>
                            <dt className="text-sm font-medium text-slate-700">Lease Expiry</dt>
                            <dd className="text-sm text-slate-900">
                              {format(new Date(matter.lease_expiry), 'MMMM dd, yyyy')}
                            </dd>
                          </div>
                        )}
                      </div>
                    )}
                  </dl>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Documents & Tasks Tabs */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Tasks
            </TabsTrigger>
          </TabsList>
          <TabsContent value="documents">
            <DocumentsTab matterId={matter.id} />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksTab matterId={matter.id} matterStatus={matter.status} onStatusChange={fetchMatter} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
