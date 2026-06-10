'use client';

import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { format, isBefore, startOfToday } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Clock,
  Circle,
  Search,
  X,
  ListTodo,
  AlertTriangle,
} from 'lucide-react';
import { TASK_STATUS } from '@/lib/constants';

type Task = Database['public']['Tables']['corporate_matter_tasks']['Row'];
type MatterLite = { id: string; matter_number: string; subject: string | null };
type Profile = { id: string; full_name: string | null; email: string };

type QuickFilter = 'all' | 'mine' | 'Pending' | 'In Progress' | 'Completed' | 'overdue';

export default function TasksPage() {
  const supabase = createClient();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [matters, setMatters] = useState<Record<string, MatterLite>>({});
  const [officers, setOfficers] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<QuickFilter>('all');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, mattersRes, profilesRes] = await Promise.all([
        supabase
          .from('corporate_matter_tasks')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('corporate_matters').select('id, matter_number, subject'),
        supabase.from('profiles').select('id, full_name, email'),
      ]);
      if (tasksRes.error) throw tasksRes.error;
      setTasks(tasksRes.data || []);

      const mMap: Record<string, MatterLite> = {};
      (mattersRes.data || []).forEach((m) => {
        mMap[m.id] = m as MatterLite;
      });
      setMatters(mMap);

      const pMap: Record<string, Profile> = {};
      (profilesRes.data || []).forEach((p) => {
        pMap[p.id] = p as Profile;
      });
      setOfficers(pMap);
    } catch (e) {
      console.error('Error loading tasks', e);
      toast.error('Could not load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'Completed') updateData.completed_at = new Date().toISOString();
      else updateData.completed_at = null;

      const { error } = await supabase
        .from('corporate_matter_tasks')
        .update(updateData)
        .eq('id', taskId);
      if (error) throw error;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, completed_at: (updateData.completed_at as string | null) ?? null }
            : t
        )
      );
      toast.success(`Task marked ${newStatus}`);
    } catch (e) {
      console.error('Error updating task', e);
      toast.error('Failed to update task');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const isOverdue = (t: Task) =>
    !!t.due_date && t.status !== 'Completed' && isBefore(new Date(t.due_date), startOfToday());

  const officerName = (id: string | null) => {
    if (!id) return 'Unassigned';
    const o = officers[id];
    return o?.full_name || o?.email || 'Unknown';
  };

  const counts = {
    all: tasks.length,
    mine: tasks.filter((t) => t.assigned_officer === user?.id).length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    overdue: tasks.filter(isOverdue).length,
  };

  const filtered = useMemo(() => {
    let list = [...tasks];
    switch (filter) {
      case 'mine':
        list = list.filter((t) => t.assigned_officer === user?.id);
        break;
      case 'Pending':
      case 'In Progress':
      case 'Completed':
        list = list.filter((t) => t.status === filter);
        break;
      case 'overdue':
        list = list.filter(isOverdue);
        break;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => {
        const m = matters[t.matter_id];
        return (
          t.description.toLowerCase().includes(q) ||
          t.task_type?.toLowerCase().includes(q) ||
          m?.matter_number.toLowerCase().includes(q) ||
          m?.subject?.toLowerCase().includes(q)
        );
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, matters, search, filter, user]);

  const tiles = [
    { label: 'Total', value: counts.all, icon: ListTodo, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Progress', value: counts.inProgress, icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Overdue', value: counts.overdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Completed', value: counts.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ] as const;

  const pills: { key: QuickFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'mine', label: 'My Tasks', count: counts.mine },
    { key: 'Pending', label: 'Pending', count: counts.pending },
    { key: 'In Progress', label: 'In Progress', count: counts.inProgress },
    { key: 'overdue', label: 'Overdue', count: counts.overdue },
    { key: 'Completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500">
            Work items across all matters · {filtered.length} shown
          </p>
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.label} className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 truncate">{t.label}</p>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">{t.value}</p>
                    </div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${t.bg}`}>
                      <Icon className={`h-5 w-5 ${t.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search + pills */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description, type, or matter..."
              className="pl-10 h-9 bg-slate-50 border-slate-200 focus:bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {pills.map((p) => {
              const active = filter === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setFilter(p.key)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  {p.label}
                  <span
                    className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <Card className="border-slate-200">
          <CardContent className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ListTodo className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">
                  {search || filter !== 'all' ? 'No tasks match your filters' : 'No tasks yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((task) => {
                  const m = matters[task.matter_id];
                  const overdue = isOverdue(task);
                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="mt-0.5 flex-shrink-0">{getStatusIcon(task.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.task_type && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                              {task.task_type}
                            </Badge>
                          )}
                          {m && (
                            <Link
                              href={`/matters/${task.matter_id}`}
                              className="text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:underline"
                            >
                              {m.matter_number}
                            </Link>
                          )}
                          {overdue && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] py-0 px-1.5">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-900 mt-0.5 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 flex-wrap">
                          <span>Assigned: {officerName(task.assigned_officer)}</span>
                          {task.due_date && (
                            <span className={overdue ? 'text-red-600 font-medium' : ''}>
                              Due {format(new Date(task.due_date), 'MMM dd, yyyy')}
                            </span>
                          )}
                          {task.completed_at && (
                            <span className="text-green-600">
                              Done {format(new Date(task.completed_at), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={`${getStatusColor(task.status)} hidden sm:inline-flex`}>
                          {task.status}
                        </Badge>
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleUpdateStatus(task.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[130px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TASK_STATUS.map((status) => (
                              <SelectItem key={status} value={status} className="text-xs">
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
