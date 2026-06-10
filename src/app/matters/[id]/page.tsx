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
import { format, isBefore, differenceInDays } from 'date-fns';
import {
  ArrowLeft,
  FileText,
  User,
  MapPin,
  Scale,
  Upload,
  CheckCircle2,
  MessageSquare,
  Clock,
  Shield,
  Edit,
  UserPlus,
  Lock,
  BarChart3,
  Calendar,
  Briefcase,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { DocumentsTab } from '@/components/matter-details/DocumentsTab';
import { TasksTab } from '@/components/matter-details/TasksTab';
import Link from 'next/link';
import {
  getWorkflowStageColor,
  getPriorityColor,
  isMatterOverdue,
  isMatterDueSoon,
  WORKFLOW_STAGES,
  MATTER_STATUS,
} from '@/lib/workflow-constants';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Assignment = Database['public']['Tables']['corporate_matter_assignments']['Row'];
type Review = Database['public']['Tables']['corporate_matter_reviews']['Row'];
type ActivityLog = Database['public']['Tables']['corporate_matter_activity_logs']['Row'];
type StatusHistory = Database['public']['Tables']['corporate_matter_status_history']['Row'];

export default function MatterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [assignedOfficer, setAssignedOfficer] = useState<Profile | null>(null);
  const [createdByUser, setCreatedByUser] = useState<Profile | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const supabase = createClient();

  useEffect(() => {
    if (params.id) {
      fetchMatterData();
    }
  }, [params.id]);

  const fetchMatterData = async () => {
    try {
      const matterId = params.id as string;

      // Fetch matter
      const { data: matterData, error: matterError } = await supabase
        .from('corporate_matters')
        .select('*')
        .eq('id', matterId)
        .single();

      if (matterError) throw matterError;

      const fetchedMatter = matterData as Matter;
      setMatter(fetchedMatter);

      // Fetch assigned officer
      if (fetchedMatter?.assigned_officer) {
        const { data: officerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', fetchedMatter.assigned_officer)
          .single();
        setAssignedOfficer(officerData);
      }

      // Fetch created by user
      if (fetchedMatter?.created_by) {
        const { data: creatorData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', fetchedMatter.created_by)
          .single();
        setCreatedByUser(creatorData);
      }

      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('corporate_matter_assignments')
        .select('*')
        .eq('matter_id', matterId)
        .order('assigned_at', { ascending: false });
      setAssignments(assignmentsData || []);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('corporate_matter_reviews')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });
      setReviews(reviewsData || []);

      // Fetch activity logs
      const { data: logsData } = await supabase
        .from('corporate_matter_activity_logs')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });
      setActivityLogs(logsData || []);

      // Fetch status history
      const { data: historyData } = await supabase
        .from('corporate_matter_status_history')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });
      setStatusHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching matter data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-emerald-700">Loading matter...</p>
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

  const isOverdue = isMatterOverdue(matter.due_date, matter.status);
  const isDueSoon = isMatterDueSoon(matter.due_date, matter.status);
  const daysOpen = matter.created_at ? differenceInDays(new Date(), new Date(matter.created_at)) : 0;

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Compact header strip */}
        <Card className="border-slate-200">
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Link href="/matters">
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-slate-900 truncate">{matter.matter_number}</h1>
                    <Badge variant="outline" className={getWorkflowStageColor(matter.workflow_stage)}>
                      {matter.workflow_stage}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(matter.priority)}>
                      {matter.priority}
                    </Badge>
                    <Badge variant="outline">{matter.status}</Badge>
                    {isOverdue && (
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                        Overdue
                      </Badge>
                    )}
                    {isDueSoon && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Due Soon
                      </Badge>
                    )}
                    {matter.confidentiality_level && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                        {matter.confidentiality_level}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate mt-0.5">
                    {matter.subject || matter.type_of_matter}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 flex-shrink-0">
                {!matter.assigned_officer && (
                  <Link href={`/matters/${matter.id}/assign`}>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign
                    </Button>
                  </Link>
                )}
                {matter.workflow_stage !== WORKFLOW_STAGES.CLOSED && (
                  <Link href={`/matters/${matter.id}/details`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                  </Link>
                )}
                {matter.workflow_stage === WORKFLOW_STAGES.FINALIZED && (
                  <Link href={`/matters/${matter.id}/close`}>
                    <Button variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Close Matter
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 10-Tab Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto p-1 gap-0.5">
            <TabsTrigger value="overview" className="text-[11px] lg:text-xs py-1.5">
              <BarChart3 className="h-3.5 w-3.5 mr-1 hidden lg:inline" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="registration" className="text-[11px] lg:text-xs py-1.5">
              <FileText className="h-3.5 w-3.5 mr-1 hidden lg:inline" />
              Registration
            </TabsTrigger>
            <TabsTrigger value="assignment" className="text-[11px] lg:text-xs py-1.5">
              <User className="h-3.5 w-3.5 mr-1 hidden lg:inline" />
              Assignment
            </TabsTrigger>
            <TabsTrigger value="land" className="text-[11px] lg:text-xs py-1.5">
              <MapPin className="h-3.5 w-3.5 mr-1 hidden lg:inline" />
              Land/Lease
            </TabsTrigger>
            <TabsTrigger value="legal" className="text-[11px] lg:text-xs py-1.5">
              <Scale className="h-3.5 w-3.5 mr-1 hidden lg:inline" />
              Legal Issues
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-[11px] lg:text-xs py-1.5">
              <Upload className="h-3.5 w-3.5 mr-1 hidden lg:inline" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-[11px] lg:text-xs py-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 hidden lg:inline" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-[11px] lg:text-xs py-1.5">
              <MessageSquare className="h-3.5 w-3.5 mr-1 hidden lg:inline" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-[11px] lg:text-xs py-1.5">
              <Clock className="h-3.5 w-3.5 mr-1 hidden lg:inline" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-[11px] lg:text-xs py-1.5">
              <Shield className="h-3.5 w-3.5 mr-1 hidden lg:inline" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-4">
            {/* Summary tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 truncate">Days Open</p>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">{daysOpen}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Since {format(new Date(matter.created_at), 'MMM dd')}
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 truncate">SLA Status</p>
                      {matter.due_date ? (
                        <>
                          <p className={`text-lg font-bold leading-tight ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                            {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'On Track'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            Due {format(new Date(matter.due_date), 'MMM dd, yyyy')}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-slate-400 leading-tight">No SLA</p>
                      )}
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 flex-shrink-0">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 truncate">Revisions</p>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">
                        {matter.returned_for_revision_count || 0}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">Times returned</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 truncate">Activity</p>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">
                        {activityLogs.length}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">Total actions</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                    Matter Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Type of Matter</dt>
                    <dd className="text-sm text-slate-900 mt-0.5">{matter.type_of_matter}</dd>
                  </div>
                  <Separator />
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Request Type</dt>
                    <dd className="text-sm text-slate-900 mt-0.5">{matter.request_type}</dd>
                  </div>
                  <Separator />
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Request Form</dt>
                    <dd className="text-sm text-slate-900 mt-0.5">{matter.request_form}</dd>
                  </div>
                  <Separator />
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Requester</dt>
                    <dd className="text-sm text-slate-900 mt-0.5">
                      {matter.requester_name}
                      {matter.requester_position && ` (${matter.requester_position})`}
                    </dd>
                  </div>
                  {matter.requesting_division && (
                    <>
                      <Separator />
                      <div>
                        <dt className="text-sm font-medium text-slate-700">Division</dt>
                        <dd className="text-sm text-slate-900 mt-0.5">{matter.requesting_division}</dd>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Date Requested</dt>
                    <dd className="text-sm text-slate-900 mt-0.5">
                      {format(new Date(matter.date_requested), 'MMMM dd, yyyy')}
                    </dd>
                  </div>
                  <Separator />
                  <div>
                    <dt className="text-sm font-medium text-slate-700">Date Received</dt>
                    <dd className="text-sm text-slate-900 mt-0.5">
                      {format(new Date(matter.date_received), 'MMMM dd, yyyy')}
                    </dd>
                  </div>
                  <Separator />
                  {matter.assigned_date && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-slate-700">Date Assigned</dt>
                        <dd className="text-sm text-slate-900 mt-0.5">
                          {format(new Date(matter.assigned_date), 'MMMM dd, yyyy')}
                        </dd>
                      </div>
                      <Separator />
                    </>
                  )}
                  {matter.due_date && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-slate-700">Due Date</dt>
                        <dd className={`text-sm font-medium mt-0.5 ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-slate-900'}`}>
                          {format(new Date(matter.due_date), 'MMMM dd, yyyy')}
                          {isOverdue && ' (Overdue)'}
                          {isDueSoon && ' (Due Soon)'}
                        </dd>
                      </div>
                      <Separator />
                    </>
                  )}
                  {matter.closed_at && (
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Date Closed</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">
                        {format(new Date(matter.closed_at), 'MMMM dd, yyyy')}
                      </dd>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary & Progress */}
            {matter.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">{matter.summary}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 2: Registration Details */}
          <TabsContent value="registration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registration Information</CardTitle>
                <CardDescription>Complete registration details for this matter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-slate-700 mb-3">Basic Information</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Matter Number</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">{matter.matter_number}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Created By</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">
                        {createdByUser?.full_name || createdByUser?.email || 'System'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Subject</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">{matter.subject || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Type of Matter</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">{matter.type_of_matter}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Priority</dt>
                      <dd className="text-sm mt-0.5">
                        <Badge variant="outline" className={getPriorityColor(matter.priority)}>
                          {matter.priority}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Confidentiality</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">{matter.confidentiality_level}</dd>
                    </div>
                  </dl>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-sm text-slate-700 mb-3">Requester Information</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Name</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">{matter.requester_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Position</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">{matter.requester_position || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Division</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">{matter.requesting_division || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Organization</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">{matter.requesting_organization || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-sm text-slate-700 mb-3">Request Details</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Form of Request</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">{matter.request_form}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Type of Request</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">{matter.request_type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Date Requested</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">
                        {format(new Date(matter.date_requested), 'MMMM dd, yyyy')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Date Received</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">
                        {format(new Date(matter.date_received), 'MMMM dd, yyyy')}
                      </dd>
                    </div>
                  </dl>
                </div>

                {matter.summary && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2">Summary</h3>
                      <p className="text-sm text-slate-900 whitespace-pre-wrap">{matter.summary}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Assignment History */}
          <TabsContent value="assignment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Current Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedOfficer ? (
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Assigned Officer</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">
                        {assignedOfficer.full_name || assignedOfficer.email}
                      </dd>
                    </div>
                    {assignedOfficer.role && (
                      <>
                        <Separator />
                        <div>
                          <dt className="text-sm font-medium text-slate-700">Role</dt>
                          <dd className="text-sm text-slate-900 mt-0.5">
                            {assignedOfficer.role.replace(/_/g, ' ')}
                          </dd>
                        </div>
                      </>
                    )}
                    {assignedOfficer.division && (
                      <>
                        <Separator />
                        <div>
                          <dt className="text-sm font-medium text-slate-700">Division</dt>
                          <dd className="text-sm text-slate-900 mt-0.5">{assignedOfficer.division}</dd>
                        </div>
                      </>
                    )}
                    {matter.assigned_date && (
                      <>
                        <Separator />
                        <div>
                          <dt className="text-sm font-medium text-slate-700">Assigned Date</dt>
                          <dd className="text-sm text-slate-900 mt-0.5">
                            {format(new Date(matter.assigned_date), 'MMMM dd, yyyy')}
                          </dd>
                        </div>
                      </>
                    )}
                    {matter.manager_instructions && (
                      <>
                        <Separator />
                        <div>
                          <dt className="text-sm font-medium text-slate-700">Manager Instructions</dt>
                          <dd className="text-sm text-slate-900 mt-0.5 whitespace-pre-wrap">
                            {matter.manager_instructions}
                          </dd>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">Not yet assigned</p>
                    <Link href={`/matters/${matter.id}/assign`}>
                      <Button className="mt-4" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign Officer
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {assignments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Assignment History</CardTitle>
                  <CardDescription>
                    {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.map((assignment, index) => (
                      <div key={assignment.id} className="flex gap-4 pb-4 border-b border-slate-200 last:border-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${assignment.is_current ? 'bg-green-500' : 'bg-slate-300'}`} />
                          {index < assignments.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-slate-900">
                              {assignment.is_current ? 'Current Assignment' : 'Previous Assignment'}
                            </p>
                            {assignment.is_current && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {format(new Date(assignment.assigned_at), 'MMMM dd, yyyy h:mm a')}
                          </p>
                          {assignment.instructions && (
                            <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                              {assignment.instructions}
                            </p>
                          )}
                          {assignment.completed_at && (
                            <p className="text-xs text-slate-500 mt-1">
                              Completed: {format(new Date(assignment.completed_at), 'MMMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 4: Land/Lease Details */}
          <TabsContent value="land" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Land & Lease Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matter.land_description || matter.zoning || matter.survey_plan_no || matter.lease_type ? (
                  <div className="space-y-4">
                    {matter.land_description && (
                      <div>
                        <h3 className="font-semibold text-sm text-slate-700 mb-2">Land Description</h3>
                        <p className="text-sm text-slate-900 whitespace-pre-wrap">{matter.land_description}</p>
                      </div>
                    )}

                    {(matter.file_reference || matter.survey_plan_no || matter.zoning) && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold text-sm text-slate-700 mb-3">Property Details</h3>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {matter.file_reference && (
                              <div>
                                <dt className="text-sm font-medium text-slate-700">File Reference</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">{matter.file_reference}</dd>
                              </div>
                            )}
                            {matter.survey_plan_no && (
                              <div>
                                <dt className="text-sm font-medium text-slate-700">Survey Plan No.</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">{matter.survey_plan_no}</dd>
                              </div>
                            )}
                            {matter.zoning && (
                              <div>
                                <dt className="text-sm font-medium text-slate-700">Zoning</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">{matter.zoning}</dd>
                              </div>
                            )}
                            {matter.title_description && (
                              <div>
                                <dt className="text-sm font-medium text-slate-700">Title Description</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">{matter.title_description}</dd>
                              </div>
                            )}
                            {matter.title_file_reference && (
                              <div>
                                <dt className="text-sm font-medium text-slate-700">Title File Reference</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">{matter.title_file_reference}</dd>
                              </div>
                            )}
                            {matter.survey_file_reference && (
                              <div>
                                <dt className="text-sm font-medium text-slate-700">Survey File Reference</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">{matter.survey_file_reference}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </>
                    )}

                    {(matter.lease_type || matter.lease_commencement || matter.lease_expiry) && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold text-sm text-slate-700 mb-3">Lease Information</h3>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {matter.lease_type && (
                              <div>
                                <dt className="text-sm font-medium text-slate-700">Lease Type</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">{matter.lease_type}</dd>
                              </div>
                            )}
                            {matter.lease_commencement && (
                              <div>
                                <dt className="text-sm font-medium text-slate-700">Lease Commencement</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">
                                  {format(new Date(matter.lease_commencement), 'MMMM dd, yyyy')}
                                </dd>
                              </div>
                            )}
                            {matter.lease_expiry && (
                              <div>
                                <dt className="text-sm font-medium text-slate-700">Lease Expiry</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">
                                  {format(new Date(matter.lease_expiry), 'MMMM dd, yyyy')}
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </>
                    )}

                    {(matter.ilg_name || matter.ilg_file_reference) && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold text-sm text-slate-700 mb-3">ILG Information</h3>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {matter.ilg_name && (
                              <div>
                                <dt className="text-sm font-medium text-slate-700">ILG Name</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">{matter.ilg_name}</dd>
                              </div>
                            )}
                            {matter.ilg_file_reference && (
                              <div>
                                <dt className="text-sm font-medium text-slate-700">ILG File Reference</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">{matter.ilg_file_reference}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No land or lease details provided</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Legal Issues */}
          <TabsContent value="legal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-emerald-600" />
                  Legal Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matter.legal_issues || matter.claims_allegations || matter.applicable_law || matter.relevant_stakeholders ? (
                  <div className="space-y-4">
                    {matter.legal_issues && (
                      <div>
                        <h3 className="font-semibold text-sm text-slate-700 mb-2">Legal Issues</h3>
                        <p className="text-sm text-slate-900 whitespace-pre-wrap">{matter.legal_issues}</p>
                      </div>
                    )}

                    {matter.claims_allegations && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold text-sm text-slate-700 mb-2">Claims & Allegations</h3>
                          <p className="text-sm text-slate-900 whitespace-pre-wrap">{matter.claims_allegations}</p>
                        </div>
                      </>
                    )}

                    {matter.applicable_law && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold text-sm text-slate-700 mb-2">Applicable Law</h3>
                          <p className="text-sm text-slate-900 whitespace-pre-wrap">{matter.applicable_law}</p>
                        </div>
                      </>
                    )}

                    {matter.relevant_stakeholders && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold text-sm text-slate-700 mb-2">Relevant Stakeholders</h3>
                          <p className="text-sm text-slate-900 whitespace-pre-wrap">{matter.relevant_stakeholders}</p>
                        </div>
                      </>
                    )}

                    {matter.risk_classification && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold text-sm text-slate-700 mb-2">Risk Classification</h3>
                          <Badge variant="outline" className={
                            matter.risk_classification === 'Critical' ? 'bg-red-100 text-red-800 border-red-300' :
                            matter.risk_classification === 'High' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                            matter.risk_classification === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-green-100 text-green-800 border-green-300'
                          }>
                            {matter.risk_classification}
                          </Badge>
                        </div>
                      </>
                    )}

                    {matter.internal_remarks && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold text-sm text-slate-700 mb-2">Internal Remarks</h3>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-sm text-slate-900 whitespace-pre-wrap">{matter.internal_remarks}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scale className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No legal analysis provided yet</p>
                    <Link href={`/matters/${matter.id}/details`}>
                      <Button className="mt-4" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Complete Legal Analysis
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 6: Documents */}
          <TabsContent value="documents">
            <DocumentsTab matterId={matter.id} />
          </TabsContent>

          {/* Tab 7: Tasks */}
          <TabsContent value="tasks">
            <TasksTab matterId={matter.id} matterStatus={matter.status} onStatusChange={fetchMatterData} />
          </TabsContent>

          {/* Tab 8: Review Notes */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  Review History
                </CardTitle>
                <CardDescription>
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              review.review_status === 'Approved' ? 'bg-green-100 text-green-800 border-green-300' :
                              review.review_status === 'Returned' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                              review.review_status === 'Escalated' ? 'bg-red-100 text-red-800 border-red-300' :
                              'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }>
                              {review.review_status}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {review.review_type}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {format(new Date(review.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        {review.review_comments && (
                          <div className="mt-2 p-3 bg-slate-50 rounded">
                            <p className="text-sm text-slate-900 whitespace-pre-wrap">{review.review_comments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 9: Timeline */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Activity Timeline
                </CardTitle>
                <CardDescription>
                  {activityLogs.length} activities total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log, index) => (
                      <div key={log.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          {index < activityLogs.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-1" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">
                                {log.action_description}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {format(new Date(log.created_at), 'MMMM dd, yyyy h:mm a')}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {log.action_type}
                            </Badge>
                          </div>
                          {(log.old_value || log.new_value) && (
                            <div className="mt-2 text-xs text-slate-600">
                              {log.old_value && <span>From: {log.old_value}</span>}
                              {log.old_value && log.new_value && <span className="mx-2">→</span>}
                              {log.new_value && <span>To: {log.new_value}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 10: Audit Trail */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Audit Trail
                </CardTitle>
                <CardDescription>
                  Complete change history for this matter
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statusHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No status changes yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {statusHistory.map((history) => (
                      <div key={history.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {history.from_workflow_stage && (
                                <Badge variant="outline" className="text-xs">
                                  {history.from_workflow_stage}
                                </Badge>
                              )}
                              <span className="text-xs text-slate-500">→</span>
                              {history.to_workflow_stage && (
                                <Badge variant="outline" className="text-xs">
                                  {history.to_workflow_stage}
                                </Badge>
                              )}
                            </div>
                            {history.reason && (
                              <p className="text-sm text-slate-700">{history.reason}</p>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {format(new Date(history.created_at), 'MMM dd, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Audit Info */}
            <Card>
              <CardHeader>
                <CardTitle>System Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-slate-700">Matter ID</dt>
                  <dd className="text-sm text-slate-900 font-mono mt-0.5">{matter.id}</dd>
                </div>
                <Separator />
                <div>
                  <dt className="text-sm font-medium text-slate-700">Created At</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">
                    {format(new Date(matter.created_at), 'MMMM dd, yyyy h:mm:ss a')}
                  </dd>
                </div>
                <Separator />
                <div>
                  <dt className="text-sm font-medium text-slate-700">Last Updated</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">
                    {format(new Date(matter.updated_at), 'MMMM dd, yyyy h:mm:ss a')}
                  </dd>
                </div>
                {matter.closed_at && (
                  <>
                    <Separator />
                    <div>
                      <dt className="text-sm font-medium text-slate-700">Closed At</dt>
                      <dd className="text-sm text-slate-900 mt-0.5">
                        {format(new Date(matter.closed_at), 'MMMM dd, yyyy h:mm:ss a')}
                      </dd>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
