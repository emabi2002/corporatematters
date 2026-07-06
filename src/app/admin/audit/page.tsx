'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermissions } from '@/hooks/usePermissions';
import { createClient } from '@/lib/supabase';
import { format } from 'date-fns';
import { ArrowLeft, History, RefreshCcw, Search, Shield, Workflow } from 'lucide-react';

type ActivityLog = {
  id: string;
  matter_id: string;
  user_id: string | null;
  action_type: string;
  action_description: string | null;
  old_value: string | null;
  new_value: string | null;
  field_changed: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

type StatusHistory = {
  id: string;
  matter_id: string;
  from_status: string | null;
  to_status: string | null;
  from_workflow_stage: string | null;
  to_workflow_stage: string | null;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
};

type MatterLite = {
  id: string;
  matter_number: string;
  subject: string | null;
};

export default function AdminAuditPage() {
  const router = useRouter();
  const { canAccessAdmin } = usePermissions();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [matters, setMatters] = useState<Record<string, MatterLite>>({});
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'all' | 'activity' | 'status'>('all');

  useEffect(() => {
    if (!canAccessAdmin()) {
      router.push('/admin');
      return;
    }
    void fetchAuditData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccessAdmin, router]);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const [activityRes, statusRes, mattersRes] = await Promise.all([
        supabase
          .from('corporate_matter_activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(150),
        supabase
          .from('corporate_matter_status_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(150),
        supabase
          .from('corporate_matters')
          .select('id, matter_number, subject')
          .limit(500),
      ]);

      setActivityLogs((activityRes.data as ActivityLog[]) || []);
      setStatusHistory((statusRes.data as StatusHistory[]) || []);

      const matterMap: Record<string, MatterLite> = {};
      ((mattersRes.data as MatterLite[]) || []).forEach((m) => {
        matterMap[m.id] = m;
      });
      setMatters(matterMap);
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();

    const activityRows = activityLogs.map((log) => ({
      id: `activity-${log.id}`,
      source: 'activity' as const,
      icon: Shield,
      created_at: log.created_at,
      matter_id: log.matter_id,
      title: log.action_type,
      description: log.action_description || log.field_changed || 'Matter activity recorded',
      detail: log.field_changed ? `${log.field_changed}: ${log.old_value || '-'} → ${log.new_value || '-'}` : null,
    }));

    const statusRows = statusHistory.map((history) => ({
      id: `status-${history.id}`,
      source: 'status' as const,
      icon: Workflow,
      created_at: history.created_at,
      matter_id: history.matter_id,
      title: 'Status / Workflow Change',
      description: `${history.from_status || '-'} → ${history.to_status || '-'}`,
      detail: `${history.from_workflow_stage || '-'} → ${history.to_workflow_stage || '-'}${history.reason ? ` · ${history.reason}` : ''}`,
    }));

    return [...activityRows, ...statusRows]
      .filter((row) => view === 'all' || row.source === view)
      .filter((row) => {
        if (!q) return true;
        const matter = matters[row.matter_id];
        return [
          row.title,
          row.description,
          row.detail || '',
          matter?.matter_number || '',
          matter?.subject || '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [activityLogs, statusHistory, matters, search, view]);

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
              <p className="text-sm text-slate-500">Matter activity and workflow status history.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAuditData} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Activity Logs</p>
                  <p className="text-2xl font-bold text-slate-900">{activityLogs.length}</p>
                </div>
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Status Changes</p>
                  <p className="text-2xl font-bold text-slate-900">{statusHistory.length}</p>
                </div>
                <Workflow className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Filtered Results</p>
                  <p className="text-2xl font-bold text-slate-900">{rows.length}</p>
                </div>
                <History className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>Search and review recent corporate matter actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search matter number, subject, action, or details..."
                  className="pl-9"
                />
              </div>
              <Select value={view} onValueChange={(v) => setView(v as 'all' | 'activity' | 'status')}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audit Events</SelectItem>
                  <SelectItem value="activity">Activity Logs</SelectItem>
                  <SelectItem value="status">Status History</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="py-10 text-center text-slate-500">Loading audit log...</div>
            ) : rows.length === 0 ? (
              <div className="py-10 text-center text-slate-500">No audit records found.</div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                {rows.map((row) => {
                  const Icon = row.icon;
                  const matter = matters[row.matter_id];
                  return (
                    <div key={row.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-slate-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-900">{row.title}</p>
                              <Badge variant="outline" className="capitalize">{row.source}</Badge>
                              {matter && (
                                <Link href={`/matters/${matter.id}`} className="text-sm text-emerald-700 hover:underline">
                                  {matter.matter_number}
                                </Link>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{row.description}</p>
                            {row.detail && <p className="text-xs text-slate-500 mt-1">{row.detail}</p>}
                            {matter?.subject && <p className="text-xs text-slate-400 mt-1 truncate">{matter.subject}</p>}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 whitespace-nowrap">
                          {format(new Date(row.created_at), 'dd MMM yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
