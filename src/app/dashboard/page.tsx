'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/lib/database.types';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import Link from 'next/link';
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import {
  WORKFLOW_STAGES,
  MATTER_STATUS,
  PRIORITIES,
  getWorkflowStageColor,
  getStatusColor,
  getPriorityColor,
} from '@/lib/workflow-constants';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];
type ActivityLog = Database['public']['Tables']['corporate_matter_activity_logs']['Row'];

interface DashboardStats {
  total: number;
  byStatus: Record<string, number>;
  byWorkflowStage: Record<string, number>;
  byPriority: Record<string, number>;
  overdue: number;
  dueSoon: number;
  myAssigned: number;
  awaitingMyAction: number;
  completedThisMonth: number;
  avgTurnaroundDays: number;
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    byStatus: {},
    byWorkflowStage: {},
    byPriority: {},
    overdue: 0,
    dueSoon: 0,
    myAssigned: 0,
    awaitingMyAction: 0,
    completedThisMonth: 0,
    avgTurnaroundDays: 0,
  });
  const [myMatters, setMyMatters] = useState<Matter[]>([]);
  const [overdueMatters, setOverdueMatters] = useState<Matter[]>([]);
  const [dueSoonMatters, setDueSoonMatters] = useState<Matter[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all matters
      const { data: allMatters, error: mattersError } = await supabase
        .from('corporate_matters')
        .select('*')
        .order('created_at', { ascending: false });

      if (mattersError) throw mattersError;

      const matters = (allMatters || []) as Matter[];
      const today = new Date();
      const threeDaysFromNow = addDays(today, 3);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Calculate comprehensive stats
      const byStatus: Record<string, number> = {};
      const byWorkflowStage: Record<string, number> = {};
      const byPriority: Record<string, number> = {};

      let overdue = 0;
      let dueSoon = 0;
      let myAssigned = 0;
      let awaitingMyAction = 0;
      const overdueList: Matter[] = [];
      const dueSoonList: Matter[] = [];
      const myMattersList: Matter[] = [];

      // Calculate completed this month and turnaround
      let completedThisMonth = 0;
      let totalTurnaroundDays = 0;
      let completedMattersCount = 0;

      matters.forEach((matter) => {
        // Count by status
        byStatus[matter.status] = (byStatus[matter.status] || 0) + 1;

        // Count by workflow stage
        byWorkflowStage[matter.workflow_stage] = (byWorkflowStage[matter.workflow_stage] || 0) + 1;

        // Count by priority
        byPriority[matter.priority] = (byPriority[matter.priority] || 0) + 1;

        // Check if assigned to current user
        if (matter.assigned_officer === user?.id) {
          myAssigned++;
          myMattersList.push(matter);

          // Check if awaiting action
          if (
            matter.workflow_stage === WORKFLOW_STAGES.ASSIGNED ||
            matter.workflow_stage === WORKFLOW_STAGES.RETURNED_FOR_REVISION ||
            matter.workflow_stage === WORKFLOW_STAGES.APPROVED_FOR_FINALIZATION
          ) {
            awaitingMyAction++;
          }
        }

        // Check overdue
        if (
          matter.due_date &&
          isBefore(new Date(matter.due_date), today) &&
          matter.status !== MATTER_STATUS.COMPLETED &&
          matter.status !== MATTER_STATUS.CLOSED
        ) {
          overdue++;
          overdueList.push(matter);
        }

        // Check due soon
        if (
          matter.due_date &&
          isAfter(new Date(matter.due_date), today) &&
          isBefore(new Date(matter.due_date), threeDaysFromNow) &&
          matter.status !== MATTER_STATUS.COMPLETED &&
          matter.status !== MATTER_STATUS.CLOSED
        ) {
          dueSoon++;
          dueSoonList.push(matter);
        }

        // Completed this month
        if (
          (matter.status === MATTER_STATUS.COMPLETED || matter.status === MATTER_STATUS.CLOSED) &&
          matter.closed_at &&
          new Date(matter.closed_at) >= startOfMonth
        ) {
          completedThisMonth++;
        }

        // Calculate turnaround for completed matters
        if (matter.closed_at && matter.created_at) {
          const turnaround = differenceInDays(new Date(matter.closed_at), new Date(matter.created_at));
          totalTurnaroundDays += turnaround;
          completedMattersCount++;
        }
      });

      setStats({
        total: matters.length,
        byStatus,
        byWorkflowStage,
        byPriority,
        overdue,
        dueSoon,
        myAssigned,
        awaitingMyAction,
        completedThisMonth,
        avgTurnaroundDays: completedMattersCount > 0 ? Math.round(totalTurnaroundDays / completedMattersCount) : 0,
      });

      setMyMatters(myMattersList.slice(0, 5));
      setOverdueMatters(overdueList.slice(0, 5));
      setDueSoonMatters(dueSoonList.slice(0, 5));

      // Fetch recent activities
      const { data: activities, error: activitiesError } = await supabase
        .from('corporate_matter_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;
      setRecentActivities((activities || []) as ActivityLog[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-700">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Welcome back, {profile?.full_name || 'User'}
            </p>
          </div>
          <Link href="/matters/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <FileText className="h-4 w-4 mr-2" />
              Register New Matter
            </Button>
          </Link>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Matters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-slate-600">All registered matters</span>
              </div>
            </CardContent>
          </Card>

          {/* My Assigned Matters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">My Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-purple-600">{stats.myAssigned}</div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Assigned to you
              </div>
            </CardContent>
          </Card>

          {/* Awaiting My Action */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Awaiting Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-orange-600">{stats.awaitingMyAction}</div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Requiring your attention
              </div>
            </CardContent>
          </Card>

          {/* Completed This Month */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">{stats.completedThisMonth}</div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2 text-sm text-slate-600">
                This month
              </div>
            </CardContent>
          </Card>

          {/* Overdue Matters */}
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Overdue Matters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="mt-2 text-sm text-red-600">
                {stats.overdue > 0 ? 'Requires immediate attention' : 'No overdue matters'}
              </div>
            </CardContent>
          </Card>

          {/* Due Soon */}
          <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Due in 3 Days</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">{stats.dueSoon}</div>
              <p className="text-xs text-yellow-600 mt-1">Upcoming deadlines</p>
            </CardContent>
          </Card>

          {/* Average Turnaround */}
          <Card className="border-l-4 border-l-teal-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Turnaround</CardTitle>
              <TrendingUp className="h-5 w-5 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.avgTurnaroundDays}</div>
              <p className="text-xs text-slate-500 mt-1">Days to complete</p>
            </CardContent>
          </Card>

          {/* Active Matters */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Matters</CardTitle>
              <Activity className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {(stats.byStatus[MATTER_STATUS.OPEN] || 0) + (stats.byStatus[MATTER_STATUS.IN_PROGRESS] || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Open + In Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Stage Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Workflow Stage Breakdown
            </CardTitle>
            <CardDescription>Distribution of matters across workflow stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.values(WORKFLOW_STAGES).map((stage) => {
                const count = stats.byWorkflowStage[stage] || 0;
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                return (
                  <div key={stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getWorkflowStageColor(stage)}>
                        {count}
                      </Badge>
                      <span className="text-xs text-slate-500">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium text-slate-700 truncate" title={stage}>
                      {stage}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overdue Matters Alert */}
          {stats.overdue > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Matters ({stats.overdue})
                </CardTitle>
                <CardDescription className="text-red-700">Immediate attention required</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueMatters.map((matter) => (
                    <Link key={matter.id} href={`/matters/${matter.id}`}>
                      <div className="p-3 bg-white rounded-lg border border-red-200 hover:border-red-300 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate text-sm">
                              {matter.matter_number}
                            </p>
                            <p className="text-xs text-slate-600 truncate">
                              {matter.subject || matter.type_of_matter}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs whitespace-nowrap">
                            {matter.due_date && `${differenceInDays(new Date(), new Date(matter.due_date))}d overdue`}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {stats.overdue > 5 && (
                    <Link href="/matters?filter=overdue">
                      <Button variant="outline" size="sm" className="w-full text-red-700 border-red-300 hover:bg-red-100">
                        View All {stats.overdue} Overdue Matters
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Due Soon Alert */}
          {stats.dueSoon > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-5 w-5" />
                  Due in 3 Days ({stats.dueSoon})
                </CardTitle>
                <CardDescription className="text-yellow-700">Upcoming deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dueSoonMatters.map((matter) => (
                    <Link key={matter.id} href={`/matters/${matter.id}`}>
                      <div className="p-3 bg-white rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate text-sm">
                              {matter.matter_number}
                            </p>
                            <p className="text-xs text-slate-600 truncate">
                              {matter.subject || matter.type_of_matter}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs whitespace-nowrap">
                            {matter.due_date && format(new Date(matter.due_date), 'MMM dd')}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {stats.dueSoon > 5 && (
                    <Link href="/matters?filter=due_soon">
                      <Button variant="outline" size="sm" className="w-full text-yellow-700 border-yellow-300 hover:bg-yellow-100">
                        View All {stats.dueSoon} Due Soon
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Assigned Matters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                My Assigned Matters
              </CardTitle>
              <CardDescription>Matters assigned to you ({stats.myAssigned})</CardDescription>
            </CardHeader>
            <CardContent>
              {myMatters.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No matters assigned to you yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myMatters.map((matter) => (
                    <Link key={matter.id} href={`/matters/${matter.id}`}>
                      <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-slate-900 text-sm truncate">
                            {matter.matter_number}
                          </p>
                          <Badge variant="outline" className={`${getWorkflowStageColor(matter.workflow_stage)} text-xs`}>
                            {matter.workflow_stage}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 truncate mb-1">
                          {matter.subject || matter.type_of_matter}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className={getPriorityColor(matter.priority)}>
                            {matter.priority}
                          </Badge>
                          {matter.due_date && (
                            <span className="text-slate-500">
                              Due: {format(new Date(matter.due_date), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {stats.myAssigned > 5 && (
                    <Link href="/matters?filter=my_assigned">
                      <Button variant="outline" size="sm" className="w-full">
                        View All My Matters
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest actions across all matters</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 line-clamp-2">
                          {activity.action_description}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {format(new Date(activity.created_at), 'MMM dd, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Matter Status Overview</CardTitle>
            <CardDescription>Distribution by status and priority</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* By Status */}
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-4">By Status</h3>
                <div className="space-y-3">
                  {Object.values(MATTER_STATUS).map((status) => {
                    const count = stats.byStatus[status] || 0;
                    const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{status}</span>
                          <span className="font-medium text-slate-900">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By Priority */}
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-4">By Priority</h3>
                <div className="space-y-3">
                  {Object.values(PRIORITIES).map((priority) => {
                    const count = stats.byPriority[priority] || 0;
                    const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                    return (
                      <div key={priority} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getPriorityColor(priority)}>
                              {priority}
                            </Badge>
                          </div>
                          <span className="font-medium text-slate-900">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
