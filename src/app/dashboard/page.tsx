'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  WORKFLOW_STAGES,
  MATTER_STATUS,
  PRIORITIES,
  getWorkflowStageColor,
  getPriorityColor,
} from '@/lib/workflow-constants';
import { cn } from '@/lib/utils';

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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto" />
            <p className="mt-3 text-sm text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const activeCount =
    (stats.byStatus[MATTER_STATUS.OPEN] || 0) + (stats.byStatus[MATTER_STATUS.IN_PROGRESS] || 0);

  const metricTiles = [
    { label: 'Total Matters', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'My Assigned', value: stats.myAssigned, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Awaiting Action', value: stats.awaitingMyAction, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completed (mo)', value: stats.completedThisMonth, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Due in 3 Days', value: stats.dueSoon, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg Turnaround', value: stats.avgTurnaroundDays, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', suffix: 'd' },
    { label: 'Active', value: activeCount, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ] as const;

  const attentionItems = [
    ...overdueMatters.map((m) => ({ matter: m, kind: 'overdue' as const })),
    ...dueSoonMatters.map((m) => ({ matter: m, kind: 'due' as const })),
  ].slice(0, 6);

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, {profile?.full_name || 'User'}</p>
          </div>
          <Link href="/matters/new">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <FileText className="h-4 w-4 mr-2" />
              Register Matter
            </Button>
          </Link>
        </div>

        {/* Metric tiles */}
        <div data-tour="dashboard-metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metricTiles.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label} className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 truncate">{m.label}</p>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">
                        {m.value}
                        {'suffix' in m && m.suffix ? (
                          <span className="text-base font-semibold text-slate-400 ml-0.5">{m.suffix}</span>
                        ) : null}
                      </p>
                    </div>
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0', m.bg)}>
                      <Icon className={cn('h-5 w-5', m.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Workflow stage breakdown (compact strip) */}
        <Card data-tour="dashboard-charts" className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-700">Workflow Stage Breakdown</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {Object.values(WORKFLOW_STAGES).map((stage) => {
                const count = stats.byWorkflowStage[stage] || 0;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={stage} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                    <div className="text-lg font-bold text-slate-900 leading-none">{count}</div>
                    <div className="mt-1.5 h-1 w-full rounded-full bg-slate-200">
                      <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] leading-tight text-slate-500 truncate" title={stage}>
                      {stage}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Content panels (side by side) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Needs Attention */}
          <Card className="border-slate-200">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Needs Attention
                <span className="ml-auto text-xs font-normal text-slate-400">
                  {stats.overdue + stats.dueSoon}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {attentionItems.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">Nothing overdue or due soon</div>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {attentionItems.map(({ matter, kind }) => (
                    <Link key={matter.id} href={`/matters/${matter.id}`} className="block">
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 p-2 hover:bg-slate-50 transition-colors">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">{matter.matter_number}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {matter.subject || matter.type_of_matter}
                          </p>
                        </div>
                        {kind === 'overdue' ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] whitespace-nowrap">
                            {matter.due_date && `${differenceInDays(new Date(), new Date(matter.due_date))}d over`}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] whitespace-nowrap">
                            {matter.due_date && format(new Date(matter.due_date), 'MMM dd')}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Assigned Matters */}
          <Card className="border-slate-200">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                My Assigned Matters
                <span className="ml-auto text-xs font-normal text-slate-400">{stats.myAssigned}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {myMatters.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No matters assigned to you</div>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {myMatters.map((matter) => (
                    <Link key={matter.id} href={`/matters/${matter.id}`} className="block">
                      <div className="rounded-lg border border-slate-100 p-2 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-slate-900 truncate">{matter.matter_number}</p>
                          <Badge variant="outline" className={cn('text-[10px] whitespace-nowrap', getWorkflowStageColor(matter.workflow_stage))}>
                            {matter.workflow_stage}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {matter.subject || matter.type_of_matter}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card data-tour="dashboard-activity" className="border-slate-200">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {recentActivities.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No recent activity</div>
              ) : (
                <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                  {recentActivities.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="flex gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-700 line-clamp-2">{activity.action_description}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {format(new Date(activity.created_at), 'MMM dd, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status & Priority (compact) */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">By Status</h3>
                <div className="space-y-1.5">
                  {Object.values(MATTER_STATUS).map((status) => {
                    const count = stats.byStatus[status] || 0;
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center gap-2">
                        <span className="w-28 text-xs text-slate-600 truncate">{status}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-12 text-right text-xs font-medium text-slate-700">
                          {count} <span className="text-slate-400">({pct}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">By Priority</h3>
                <div className="space-y-1.5">
                  {Object.values(PRIORITIES).map((priority) => {
                    const count = stats.byPriority[priority] || 0;
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={priority} className="flex items-center gap-2">
                        <span className="w-28">
                          <Badge variant="outline" className={cn('text-[10px]', getPriorityColor(priority))}>
                            {priority}
                          </Badge>
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-12 text-right text-xs font-medium text-slate-700">
                          {count} <span className="text-slate-400">({pct}%)</span>
                        </span>
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
