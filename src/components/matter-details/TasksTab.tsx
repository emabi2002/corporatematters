'use client';

import { useEffect, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/DatePicker';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/lib/database.types';
import { format } from 'date-fns';
import { Plus, CheckCircle2, Clock, Circle } from 'lucide-react';
import { TASK_TYPES, TASK_STATUS } from '@/lib/constants';

type Task = Database['public']['Tables']['corporate_matter_tasks']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface TasksTabProps {
  matterId: string;
  matterStatus: string;
  onStatusChange: () => void;
}

export function TasksTab({ matterId, matterStatus, onStatusChange }: TasksTabProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [officers, setOfficers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [taskType, setTaskType] = useState('');
  const [description, setDescription] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [dueDate, setDueDate] = useState<Date>();

  const supabase = createClient();

  useEffect(() => {
    fetchTasks();
    fetchOfficers();
  }, [matterId]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('corporate_matter_tasks')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['legal_officer', 'senior_legal_officer', 'deputy_secretary', 'secretary'])
        .order('full_name');

      if (error) throw error;
      setOfficers(data || []);
    } catch (error) {
      console.error('Error fetching officers:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!description) {
      alert('Please provide a task description');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('corporate_matter_tasks').insert({
        matter_id: matterId,
        task_type: taskType || null,
        description,
        assigned_officer: assignedOfficer || null,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        status: 'Pending',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      if (error) throw error;

      // Reset form
      setTaskType('');
      setDescription('');
      setAssignedOfficer('');
      setDueDate(undefined);
      setDialogOpen(false);
      fetchTasks();

      // Update matter status to In Progress if it's Pending
      if (matterStatus === 'Pending') {
        await supabase
          .from('corporate_matters')
          // @ts-expect-error - Supabase type inference issue
          .update({ status: 'In Progress' })
          .eq('id', matterId);
        onStatusChange();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error creating task:', error);
      alert(error.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = { status: newStatus };
      if (newStatus === 'Completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('corporate_matter_tasks')
        // @ts-expect-error - Supabase type inference issue
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();

      // Check if all tasks are completed
      const { data } = await supabase
        .from('corporate_matter_tasks')
        .select('status')
        .eq('matter_id', matterId);

      const allTasks = (data || []) as Pick<Task, 'status'>[];

      if (allTasks && allTasks.every((t) => t.status === 'Completed')) {
        // All tasks completed - suggest updating matter status
        if (confirm('All tasks are completed. Mark this matter as Completed?')) {
          await supabase
            .from('corporate_matters')
            // @ts-expect-error - Supabase type inference issue
            .update({ status: 'Completed' })
            .eq('id', matterId);
          onStatusChange();
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error updating task:', error);
      alert(error.message || 'Failed to update task');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Circle className="h-5 w-5 text-yellow-600" />;
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

  const getOfficerName = (officerId: string | null) => {
    if (!officerId) return 'Unassigned';
    const officer = officers.find((o) => o.id === officerId);
    return officer?.full_name || officer?.email || 'Unknown';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-slate-600">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Tasks & Activities</CardTitle>
            <CardDescription>
              Track work items, legal opinions, briefs, and other activities
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task or activity for this matter
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taskType">Task Type</Label>
                  <Select value={taskType} onValueChange={setTaskType} disabled={submitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the task..."
                    rows={4}
                    disabled={submitting}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedOfficer">Assigned Officer</Label>
                    <Select
                      value={assignedOfficer}
                      onValueChange={setAssignedOfficer}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select officer" />
                      </SelectTrigger>
                      <SelectContent>
                        {officers.map((officer) => (
                          <SelectItem key={officer.id} value={officer.id}>
                            {officer.full_name || officer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <DatePicker
                      date={dueDate}
                      onSelect={setDueDate}
                      placeholder="Select due date"
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask} disabled={submitting || !description}>
                    {submitting ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No tasks created yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Create tasks to track legal opinions, briefs, and other activities
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      {task.task_type && (
                        <Badge variant="outline" className="mb-2">
                          {task.task_type}
                        </Badge>
                      )}
                      <p className="text-sm font-medium text-slate-900 whitespace-pre-wrap">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                        <span>Assigned: {getOfficerName(task.assigned_officer)}</span>
                        {task.due_date && (
                          <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                        )}
                        {task.completed_at && (
                          <span className="text-green-600">
                            Completed: {format(new Date(task.completed_at), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    {task.status !== 'Completed' && (
                      <Select
                        value={task.status}
                        onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
